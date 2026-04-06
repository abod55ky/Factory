export type AdvanceType = "salary" | "clothing" | "other";

export interface Advance {
  id: string;
  employeeId: string;
  advanceType: AdvanceType;
  totalAmount: number | string | { $numberDecimal: string };
  installmentAmount: number | string | { $numberDecimal: string };
  remainingAmount: number | string | { $numberDecimal: string };
  notes?: string | null;
  issueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdvanceInput {
  employeeId: string;
  advanceType?: AdvanceType;
  totalAmount: number | string;
  installmentAmount?: number | string;
  remainingAmount?: number | string;
  notes?: string;
}
