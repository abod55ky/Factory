"use client";

import dynamic from "next/dynamic";

const SalariesClientPage = dynamic(() => import("./SalariesClientPage"), {
  loading: () => (
    <div className="p-8 text-sm text-slate-500" dir="rtl">
      جاري تحميل صفحة الرواتب...
    </div>
  ),
});

export default function SalariesPage() {
  return <SalariesClientPage />;
}
