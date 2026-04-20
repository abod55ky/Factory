import { redirect } from "next/navigation";

export default function FinancesBonusesPage() {
  redirect("/salaries?tab=bonuses");
}

