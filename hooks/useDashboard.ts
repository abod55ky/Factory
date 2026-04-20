import { useQueries } from '@tanstack/react-query';
import type { EmployeesStats, AttendanceStats, InventoryStats, DashboardKpis } from '@/types/dashboard';
import { useEmployees } from '@/hooks/useEmployees';
import { useAttendance } from '@/hooks/useAttendance';
import { useSalaries } from '@/hooks/useSalaries';
import { calculateAttendanceMetrics } from '@/lib/attendance-metrics';
import { api } from '@/lib/http/api';
import { queryKeys } from '@/lib/query-keys';

const fallbackEmployeesStats: EmployeesStats = {
  total: 0,
  active: 0,
  byDepartment: {},
};

const fallbackAttendanceStats: AttendanceStats = {
  statistics: {
    totalLateArrivals: 0,
  },
  topLateEmployees: [],
};

const fallbackInventoryStats: InventoryStats = {
  totalQuantity: 0,
  totalProducts: 0,
};

const fallbackKpis: DashboardKpis = {
  totalEmployees: 0,
  activeToday: 0,
  totalAbsentToday: 0,
  totalDueSalaries: 0,
  totalLateMinutesToday: 0,
  totalOvertimeMinutesToday: 0,
};

const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toNumber = (value: unknown) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const withFallback = async <T>(fetcher: () => Promise<T>, fallback: T): Promise<T> => {
  try {
    const result = await fetcher();
    return result ?? fallback;
  } catch {
    return fallback;
  }
};

export const useDashboard = (opts?: { startDate?: string; endDate?: string }) => {
  const today = getLocalDateString();
  const employeesQuery = useEmployees();
  const salariesQuery = useSalaries();
  const attendanceQuery = useAttendance({ startDate: today, endDate: today, limit: 200 });

  const queries = useQueries({
    queries: [
      {
        queryKey: queryKeys.employees.stats(),
        queryFn: () => withFallback(() => api.get<EmployeesStats>('/employees/stats'), fallbackEmployeesStats),
      },
      {
        queryKey: queryKeys.attendance.stats(opts?.startDate, opts?.endDate),
        queryFn: () => {
          const hasDateRange = Boolean(opts?.startDate && opts?.endDate);
          return withFallback(
            () =>
              api.get<AttendanceStats>('/attendance/stats', {
                params: hasDateRange
                  ? { startDate: opts?.startDate, endDate: opts?.endDate }
                  : undefined,
              }),
            fallbackAttendanceStats,
          );
        },
      },
      {
        queryKey: queryKeys.inventory.stats(),
        queryFn: () => withFallback(() => api.get<InventoryStats>('/inventory/stats'), fallbackInventoryStats),
      },
    ],
  });

  const employees = Array.isArray(employeesQuery.data) ? employeesQuery.data : [];
  const salaries = Array.isArray(salariesQuery.data) ? salariesQuery.data : [];
  const todayDailyRecords = Array.isArray(attendanceQuery.data?.dailyRecords)
    ? attendanceQuery.data.dailyRecords.map((record) => ({
        employeeId: record.employeeId,
        checkIn: record.checkIn,
        checkOut: record.checkOut,
      }))
    : [];

  const employeesStats = (queries[0]?.data as EmployeesStats | undefined) ?? fallbackEmployeesStats;
  const attendanceStats = (queries[1]?.data as AttendanceStats | undefined) ?? fallbackAttendanceStats;
  const inventoryStats = (queries[2]?.data as InventoryStats | undefined) ?? fallbackInventoryStats;

  const attendanceMetrics = calculateAttendanceMetrics(employees, todayDailyRecords);

  const activeToday = attendanceMetrics.active;
  const totalEmployees = attendanceMetrics.totalEmployees || employeesStats.total || 0;
  const totalAbsentToday = attendanceMetrics.absent;
  const totalLateMinutesToday = attendanceMetrics.totalLateMinutes;
  const totalOvertimeMinutesToday = attendanceMetrics.totalOvertimeMinutes;

  const salaryByEmployee = new Map(salaries.map((salary) => [salary.employeeId, salary]));

  const totalDueSalaries = employees.reduce((sum, employee) => {
    if (!employee?.employeeId || employee.status === 'terminated') return sum;

    const salary = salaryByEmployee.get(employee.employeeId);
    const baseSalary = salary ? toNumber(salary.baseSalary) : toNumber(employee.hourlyRate);
    const responsibilityAllowance = salary ? toNumber(salary.responsibilityAllowance) : 0;
    const productionIncentive = salary ? toNumber(salary.productionIncentive) : 0;
    const transportAllowance = salary ? toNumber(salary.transportAllowance) : 0;

    return sum + baseSalary + responsibilityAllowance + productionIncentive + transportAllowance;
  }, 0);

  const kpis: DashboardKpis = {
    ...fallbackKpis,
    totalEmployees,
    activeToday,
    totalAbsentToday,
    totalDueSalaries,
    totalLateMinutesToday,
    totalOvertimeMinutesToday,
  };

  return {
    employeesStats,
    attendanceStats,
    inventoryStats,
    kpis,
    isLoading: queries.some((q) => q.isLoading) || employeesQuery.isLoading || salariesQuery.isLoading || attendanceQuery.isLoading,
    isError: queries.some((q) => q.isError) || Boolean(employeesQuery.error) || Boolean(salariesQuery.error) || Boolean(attendanceQuery.error),
  };
};


