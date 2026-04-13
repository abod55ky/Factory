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

export type AttendanceAlertStatus = "absent" | "late";

export interface AttendanceAlert {
  status: AttendanceAlertStatus;
  employeeId: string;
  name: string;
  department: string;
  scheduledStart: string;
  checkIn: string | null;
  minutesLate: number;
}

export interface AttendanceAlertsResponse {
  date: string;
  lateThresholdMinutes: number;
  summary: {
    activeEmployees: number;
    checkedInCount: number;
    absentCount: number;
    lateCount: number;
    totalAlerts: number;
  };
  alerts: AttendanceAlert[];
}

export interface InventoryStats {
  totalQuantity: number;
  totalProducts: number;
}