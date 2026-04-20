export interface Bonus {
  id: string;
  employeeId: string;
  bonusAmount: number | string | { $numberDecimal: string };
  bonusReason?: string | null;
  assistanceAmount: number | string | { $numberDecimal: string };
  period?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BonusInput {
  employeeId: string;
  bonusAmount?: number | string;
  bonusReason?: string;
  assistanceAmount?: number | string;
  period?: string;
}

