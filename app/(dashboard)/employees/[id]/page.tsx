// app/(dashboard)/employees/[id]/page.tsx
"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  CalendarCheck,
  ChevronLeft,
  Clock,
  Coins,
  CreditCard,
  Loader2,
  Phone,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import apiClient from "@/lib/api-client";
import { useAdvances } from "@/hooks/useAdvances";
import { useAttendance } from "@/hooks/useAttendance";
import { useBonuses } from "@/hooks/useBonuses";
import useSalaries from "@/hooks/useSalaries";
import { toLocalDateString } from "@/lib/date-time";
import type { Employee } from "@/types/employee";
import type { Salary } from "@/types/salary";

const toNumber = (value: unknown) => {
  if (value && typeof value === "object" && "$numberDecimal" in (value as Record<string, unknown>)) {
    return Number((value as { $numberDecimal: string }).$numberDecimal || 0);
  }
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toMinutes = (time?: string) => {
  if (!time) return null;
  const normalized = time.slice(0, 5);
  const [h, m] = normalized.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

const formatMoney = (value: number) => Math.round(value).toLocaleString("en-US");

const toDateKey = (value?: string | Date) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return toLocalDateString(date);
};

const daysBetweenInclusive = (start: string, end: string) => {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate < startDate) {
    return 1;
  }
  const diff = Math.floor((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  return diff + 1;
};

const getMonthBoundsToDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const end = `${year}-${String(month + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const period = `${year}-${String(month + 1).padStart(2, "0")}`;

  return {
    start,
    end,
    period,
    elapsedDays: now.getDate(),
  };
};

export default function EmployeeProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: employeeId } = use(params);
  const month = useMemo(() => getMonthBoundsToDate(), []);
  const today = useMemo(() => toLocalDateString(), []);

  const {
    data: employee,
    isLoading: isEmployeeLoading,
    isError: isEmployeeError,
    error: employeeError,
  } = useQuery<Employee | null>({
    queryKey: ["employee-profile", employeeId],
    enabled: Boolean(employeeId),
    queryFn: async () => {
      const res = await apiClient.get(`/employees/${employeeId}`);
      return (res.data?.employee ?? res.data ?? null) as Employee | null;
    },
    retry: false,
  });

  const { data: salaries = [] } = useSalaries();

  const salary = useMemo<Salary | null>(() => {
    if (!employeeId) return null;
    const found = (salaries || []).find((entry) => entry.employeeId === employeeId);
    return found || null;
  }, [employeeId, salaries]);

  const attendanceRange = useMemo(() => {
    const startFromEmployee = toDateKey(employee?.createdAt) || today;
    const tentativeEnd =
      employee?.status === "terminated"
        ? toDateKey(employee?.updatedAt) || today
        : today;

    const end = tentativeEnd < startFromEmployee ? startFromEmployee : tentativeEnd;

    return {
      startDate: startFromEmployee,
      endDate: end,
      totalDays: daysBetweenInclusive(startFromEmployee, end),
    };
  }, [employee?.createdAt, employee?.status, employee?.updatedAt, today]);

  const { data: advances = [], isLoading: isAdvancesLoading } = useAdvances(employeeId);
  const { data: bonuses = [], isLoading: isBonusesLoading } = useBonuses({ employeeId, period: month.period });
  const { data: attendanceData, isLoading: isAttendanceLoading } = useAttendance({
    employeeId,
    startDate: attendanceRange.startDate,
    endDate: attendanceRange.endDate,
    limit: 200,
  });

  const attendanceSummary = useMemo(() => {
  const dailyRecords = (attendanceData?.dailyRecords || []).filter((record) => record.employeeId === employeeId);
    const scheduledStart = employee?.scheduledStart || "08:00";
    const scheduledEnd = employee?.scheduledEnd || "16:00";
    const scheduledStartMinutes = toMinutes(scheduledStart);
    const scheduledEndMinutes = toMinutes(scheduledEnd);

    let daysAttended = 0;
    let lateMinutes = 0;
    let overtimeMinutes = 0;

    for (const record of dailyRecords) {
      if (!record?.checkIn) continue;
      daysAttended += 1;

      const checkInMinutes = toMinutes(record.checkIn);
      if (
        checkInMinutes !== null &&
        scheduledStartMinutes !== null &&
        checkInMinutes > scheduledStartMinutes + 15
      ) {
        lateMinutes += checkInMinutes - scheduledStartMinutes;
      }

      const checkOutMinutes = toMinutes(record.checkOut);
      if (
        checkOutMinutes !== null &&
        scheduledEndMinutes !== null &&
        checkOutMinutes > scheduledEndMinutes
      ) {
        overtimeMinutes += checkOutMinutes - scheduledEndMinutes;
      }
    }

  const absentDays = Math.max(attendanceRange.totalDays - daysAttended, 0);

    return {
      daysAttended,
      lateMinutes,
      overtimeMinutes,
      absentDays,
    };
  }, [attendanceData?.dailyRecords, attendanceRange.totalDays, employee?.scheduledEnd, employee?.scheduledStart, employeeId]);

  const salaryBreakdown = useMemo(() => {
    const baseSalary = salary ? toNumber(salary.baseSalary) : toNumber(employee?.hourlyRate);
    const responsibilityAllowance = salary ? toNumber(salary.responsibilityAllowance) : 0;
    const productionIncentive = salary ? toNumber(salary.productionIncentive) : 0;
    const transportAllowance = salary ? toNumber(salary.transportAllowance) : 0;

    const bonusesTotal = bonuses.reduce((sum, item) => {
      return sum + toNumber(item.bonusAmount) + toNumber(item.assistanceAmount);
    }, 0);

    const advancesInstallments = advances.reduce((sum, item) => sum + toNumber(item.installmentAmount), 0);

    const totalDues =
      baseSalary +
      responsibilityAllowance +
      productionIncentive +
      transportAllowance +
      bonusesTotal -
      advancesInstallments;

    return {
      baseSalary,
      extraAndBonuses: bonusesTotal,
      deductions: advancesInstallments,
      advances: advancesInstallments,
      totalDues,
    };
  }, [salary, employee?.hourlyRate, bonuses, advances]);

  const isSecondaryLoading = isAttendanceLoading || isAdvancesLoading || isBonusesLoading;

  if (isEmployeeLoading) {
    return (
      <div className="p-8 h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-[#00bba7]" size={36} />
      </div>
    );
  }

  if (isEmployeeError) {
    return (
      <div className="p-8 text-red-600" dir="rtl">
        حدث خطأ أثناء تحميل بروفايل الموظف: {(employeeError as Error)?.message || "خطأ غير معروف"}
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-8 text-slate-600" dir="rtl">
        الموظف غير موجود أو لا تملك صلاحية الوصول إليه.
      </div>
    );
  }

  const contactPhone = employee.phone || "—";
  const contactIdentity = employee.email || "—";

  return (
    <div className="p-6 md:p-8 font-sans bg-slate-50 min-h-screen" dir="rtl">
      <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-8">
        <Link href="/employees" className="hover:text-[#00bba7] transition-colors">إدارة الموارد البشرية</Link>
        <ChevronLeft size={14} />
        <Link href="/employees" className="hover:text-[#00bba7] transition-colors">قائمة الموظفين</Link>
        <ChevronLeft size={14} />
        <span className="text-[#00bba7]">بروفايل الموظف</span>
      </nav>

  <div className="bg-white rounded-4xl shadow-sm border border-slate-100 p-8 mb-8 relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#E7C873] opacity-10 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#00bba7] opacity-5 rounded-full blur-2xl" />

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-20 h-20 bg-[#E7C873] text-white rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg shadow-[#E7C873]/30">
              {employee.name?.[0] || "م"}
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 mb-1.5">{employee.name}</h1>
              <div className="flex items-center gap-3">
                <span className="bg-[#00bba7]/10 text-[#00bba7] px-3 py-1 rounded-lg text-xs font-bold border border-[#00bba7]/20">
                  {employee.department || "—"}
                </span>
                <span className="text-sm font-bold text-slate-400 font-mono">#{employee.employeeId}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
            <div className="flex flex-col gap-3 text-slate-600 text-sm font-bold bg-slate-50 p-4 rounded-2xl border border-slate-100 w-full sm:w-auto">
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-[#E7C873]" />
                <span dir="ltr" className="tracking-wider">{contactPhone}</span>
              </div>
              <div className="flex items-center gap-3">
                <CreditCard size={18} className="text-[#E7C873]" />
                <span className="tracking-wider">{contactIdentity}</span>
              </div>
            </div>

            <div className="bg-[#00bba7]/5 rounded-2xl p-6 text-center border border-[#00bba7]/20 min-w-50 w-full sm:w-auto">
              <p className="text-[#00bba7] font-extrabold mb-1 text-xs uppercase tracking-wider">المستحقات الحالية</p>
              <div className="flex justify-center items-baseline gap-2">
                <h2 className="text-4xl font-black text-[#00bba7]">{formatMoney(salaryBreakdown.totalDues)}</h2>
                <span className="text-[#E7C873] font-bold text-sm">ل.س</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  <div className="bg-white rounded-4xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-5">
            <div className="p-2.5 bg-[#E7C873]/10 rounded-xl text-[#E7C873]"><Wallet size={24} /></div>
            <h3 className="text-xl font-black text-[#00bba7]">تفاصيل الراتب</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-[#00bba7]/5 p-5 rounded-2xl border border-[#00bba7]/10 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-[#00bba7] mb-1">الراتب الأساسي</p>
                <p className="text-2xl font-black text-slate-800">{formatMoney(salaryBreakdown.baseSalary)}</p>
              </div>
              <Coins className="text-[#00bba7] opacity-40" size={24} />
            </div>

            <div className="bg-[#E7C873]/10 p-5 rounded-2xl border border-[#E7C873]/20 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-[#c2a042] mb-1">الإضافي والمكافآت</p>
                <p className="text-2xl font-black text-slate-800">+{formatMoney(salaryBreakdown.extraAndBonuses)}</p>
              </div>
              <TrendingUp className="text-[#E7C873] opacity-40" size={24} />
            </div>

            <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-rose-600 mb-1">الخصومات</p>
                <p className="text-2xl font-black text-rose-700">-{formatMoney(salaryBreakdown.deductions)}</p>
              </div>
              <TrendingDown className="text-rose-400 opacity-40" size={24} />
            </div>

            <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-orange-600 mb-1">السلف المسحوبة</p>
                <p className="text-2xl font-black text-orange-700">{formatMoney(salaryBreakdown.advances)}</p>
              </div>
              <CreditCard className="text-orange-400 opacity-40" size={24} />
            </div>
          </div>
        </div>

  <div className="bg-white rounded-4xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-5">
            <div className="p-2.5 bg-[#00bba7]/10 rounded-xl text-[#00bba7]"><Clock size={24} /></div>
            <h3 className="text-xl font-black text-[#00bba7]">سجل الدوام (حتى اليوم)</h3>
            {isSecondaryLoading && <Loader2 size={16} className="animate-spin text-slate-400" />}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-[#00bba7]/5 flex items-center gap-4 p-5 rounded-2xl border border-[#00bba7]/10">
              <CalendarCheck className="text-[#00bba7]" size={24} />
              <div><p className="text-xs font-bold text-[#00bba7]">أيام الحضور</p><p className="text-2xl font-black text-slate-800">{attendanceSummary.daysAttended}</p></div>
            </div>

            <div className="bg-[#E7C873]/10 flex items-center gap-4 p-5 rounded-2xl border border-[#E7C873]/20">
              <Clock className="text-[#E7C873]" size={24} />
              <div><p className="text-xs font-bold text-[#c2a042]">دقائق إضافية</p><p className="text-2xl font-black text-slate-800">{attendanceSummary.overtimeMinutes}</p></div>
            </div>

            <div className="bg-orange-50 flex items-center gap-4 p-5 rounded-2xl border border-orange-100">
              <AlertTriangle className="text-orange-500" size={24} />
              <div><p className="text-xs font-bold text-orange-600">دقائق التأخير</p><p className="text-2xl font-black text-orange-900">{attendanceSummary.lateMinutes}</p></div>
            </div>

            <div className="bg-rose-50 flex items-center gap-4 p-5 rounded-2xl border border-rose-100">
              <CalendarCheck className="text-rose-500" size={24} />
              <div><p className="text-xs font-bold text-rose-600">أيام الغياب</p><p className="text-2xl font-black text-rose-900">{attendanceSummary.absentDays}</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}