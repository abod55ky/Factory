export interface EmployeesStats {
  total: number;
  active: number;
  byDepartment: Record<string, number>;
}

export interface AttendanceStats {
  statistics: {
    totalLateArrivals: number;
  };
  topLateEmployees?: Array<{
    name: string;
    dept: string;
    late: string;
    earlyExit: string;
    initial: string;
    color: string;
  }>;
}

export interface InventoryStats {
  totalQuantity: number;
  totalProducts: number;
}

export interface DashboardKpis {
  totalEmployees: number;
  activeToday: number;
  totalAbsentToday: number;
  totalDueSalaries: number;
  totalLateMinutesToday: number;
  totalOvertimeMinutesToday: number;
}

// export interface DepartmentSummary {
//   name: string;
//   employeeCount: number;
//   totalLateMinutes: number;
//   totalOvertimeMinutes: number;
// }

// export interface TodayAttendanceAlert {
//   employeeId: string;
//   name: string;
//   department: string;
//   lateMinutes: number;
//   earlyExitMinutes: number;
//   initial?: string; 
//   color?: string;
// }

// export interface DashboardStatsResponse {
//   totalEmployees: number;
//   activeToday: number;
//   totalAbsentToday: number;
//   totalDueSalaries: number;
//   totalLateMinutesToday: number;
//   totalOvertimeMinutesToday: number;
//   departmentsEfficiency: DepartmentSummary[];
//   todayAttendances: TodayAttendanceAlert[];
// }