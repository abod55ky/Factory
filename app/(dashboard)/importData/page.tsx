"use client";

import dynamic from "next/dynamic";

const ImportDataClientPage = dynamic(() => import("./ImportDataClientPage"), {
  loading: () => (
    <div className="p-8 text-sm text-slate-500" dir="rtl">
      جاري تحميل صفحة الاستيراد...
    </div>
  ),
});

export default function ImportDataPage() {
  return <ImportDataClientPage />;
}
