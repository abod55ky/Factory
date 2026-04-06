export interface PayrollRun {
  id: string;
  runId: string;
  periodStart: string;
  periodEnd: string;
  runDate: string;
  status: string;
  approvalStatus: string;
  totalEmployees: number;
  totalGrossPay: number | string | { $numberDecimal: string };
  totalDeductions: number | string | { $numberDecimal: string };
  totalNetPay: number | string | { $numberDecimal: string };
  notes?: string | null;
}

export interface PayrollItem {
  id: string;
  payrollRunId: string;
  employeeId: string;
  employeeName: string;
  department?: string | null;
  hoursWorked: number | string | { $numberDecimal: string };
  hourlyRate: number | string | { $numberDecimal: string };
  grossPay: number | string | { $numberDecimal: string };
  totalDeductions: number | string | { $numberDecimal: string };
  netPay: number | string | { $numberDecimal: string };
  anomalies?: string[];
}

export interface CalculatePayrollInput {
  periodStart: string;
  periodEnd: string;
  gracePeriodMinutes?: number | string;
}
