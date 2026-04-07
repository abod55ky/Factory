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