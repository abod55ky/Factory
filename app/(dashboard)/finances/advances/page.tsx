import { redirect } from "next/navigation";

export default function FinancesAdvancesPage() {
  redirect("/salaries?tab=advances");
}

