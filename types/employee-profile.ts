import type { Employee } from "@/types/employee";

type DecimalLike = number | string | { $numberDecimal: string } | null;

export interface EmployeeProfileQuery {
  startDate?: string;
  endDate?: string;
  period?: string;
  attendanceLimit?: number;
  advancesLimit?: number;
  bonusesLimit?: number;
}

export interface EmployeeProfileAccess {
  salary: boolean;
  attendance: boolean;
  advances: boolean;
  bonuses: boolean;
}

export interface EmployeeProfileSalary {
  id: string;
  employeeId: string;
  profession: string;
  baseSalary: DecimalLike;
  responsibilityAllowance: DecimalLike;
  productionIncentive: DecimalLike;
  transportAllowance: DecimalLike;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeProfileAttendanceRecord {
  id: string;
  employeeId: string;
  timestamp: string;
  date: string;
  type: "IN" | "OUT";
  source?: string;
  verified?: boolean;
  deviceId?: string;
  location?: string;
  notes?: string;
}

export interface EmployeeProfileAttendance {
  period: {
    startDate: string;
    endDate: string;
  };
  statistics: {
    totalDays: number;
    totalRecords: number;
  };
  records: EmployeeProfileAttendanceRecord[];
}

export interface EmployeeProfileAdvances {
  summary: {
    totalAdvances: number;
    totalAmount: DecimalLike;
    remainingAmount: DecimalLike;
  };
  advances: Array<{
    id: string;
    employeeId: string;
    totalAmount: DecimalLike;
    installmentAmount: DecimalLike;
    remainingAmount: DecimalLike;
    issueDate: string;
    notes?: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface EmployeeProfileBonuses {
  period: string | null;
  summary: {
    totalRecords: number;
    totalBonus: DecimalLike;
    totalAssistance: DecimalLike;
  };
  bonuses: Array<{
    id: string;
    employeeId: string;
    period: string | null;
    bonusAmount: DecimalLike;
    assistanceAmount: DecimalLike;
    bonusReason?: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface EmployeeProfileResponse {
  employee: Employee;
  access: EmployeeProfileAccess;
  filters: {
    attendance: {
      startDate: string;
      endDate: string;
    };
    bonuses: {
      period: string | null;
    };
    limits: {
      attendance: number;
      advances: number;
      bonuses: number;
    };
  };
  salary: EmployeeProfileSalary | null;
  attendance: EmployeeProfileAttendance | null;
  advances: EmployeeProfileAdvances | null;
  bonuses: EmployeeProfileBonuses | null;
}
