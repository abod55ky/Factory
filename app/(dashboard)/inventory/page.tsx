"use client";

import dynamic from "next/dynamic";

const InventoryClientPage = dynamic(() => import("./InventoryClientPage"), {
  loading: () => (
    <div className="p-8 text-sm text-slate-500" dir="rtl">
      جاري تحميل صفحة المخزون...
    </div>
  ),
});

export default function InventoryPage() {
  return <InventoryClientPage />;
}

