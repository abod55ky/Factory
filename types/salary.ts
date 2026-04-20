export interface Salary {
  id: string;
  employeeId: string; // e.g. EMP001
  profession: string;
  baseSalary: number;
  responsibilityAllowance: number;
  productionIncentive: number;
  transportAllowance: number;
}

export type SalaryInput = Omit<Salary, "id">;

