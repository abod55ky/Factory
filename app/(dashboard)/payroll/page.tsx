"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import usePayrollReport from "@/hooks/usePayrollReport";

const toNumber = (value: unknown) => {
  if (value && typeof value === "object" && "$numberDecimal" in (value as Record<string, unknown>)) {
    return Number((value as { $numberDecimal: string }).$numberDecimal || 0);
  }
  return Number(value || 0);
};

const getLocalMonth = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

export default function PayrollPage() {
  const [month, setMonth] = useState(getLocalMonth());
  const { data, isLoading, isError, error } = usePayrollReport(month);

  return (
    <div className="min-h-screen p-8 bg-slate-50" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">التقرير النهائي للرواتب</h1>
          <p className="text-sm text-slate-500 mt-1">اختر الشهر لعرض ملخص المسير وتفاصيله.</p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
          <Link href={`/payroll/${month}`} className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800">
            تفاصيل الشهر
          </Link>
          <Link href={`/vouchers?month=${month}`} className="px-4 py-2 rounded-lg bg-emerald-700 text-white hover:bg-emerald-600">
            قسائم القبض
          </Link>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 flex items-center gap-3">
          <Loader2 className="animate-spin" size={18} />
          <span>جاري تحميل تقرير الرواتب...</span>
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          {error instanceof Error ? error.message : "تعذر تحميل التقرير"}
        </div>
      )}

      {!isLoading && !isError && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">إجمالي الأجور</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{toNumber(data?.totals.totalGrossPay).toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">إجمالي الخصومات</p>
              <p className="text-2xl font-bold text-rose-700 mt-1">{toNumber(data?.totals.totalDeductions).toLocaleString()}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">صافي الرواتب</p>
              <p className="text-2xl font-bold text-emerald-700 mt-1">{toNumber(data?.totals.totalNetPay).toLocaleString()}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white overflow-x-auto">
            <table className="w-full min-w-170 text-right">
              <thead className="bg-slate-100 text-slate-700 text-sm">
                <tr>
                  <th className="p-3">كود الموظف</th>
                  <th className="p-3">اسم الموظف</th>
                  <th className="p-3">إجمالي</th>
                  <th className="p-3">خصومات</th>
                  <th className="p-3">صافي</th>
                </tr>
              </thead>
              <tbody>
                {data?.items?.length ? (
                  data.items.slice(0, 12).map((item) => (
                    <tr key={item.id} className="border-t border-slate-100 text-sm hover:bg-slate-50">
                      <td className="p-3 font-mono">{item.employeeId}</td>
                      <td className="p-3">{item.employeeName}</td>
                      <td className="p-3">{toNumber(item.grossPay).toLocaleString()}</td>
                      <td className="p-3 text-rose-700">{toNumber(item.totalDeductions).toLocaleString()}</td>
                      <td className="p-3 font-semibold text-emerald-700">{toNumber(item.netPay).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-5 text-center text-slate-500" colSpan={5}>
                      لا توجد بيانات لهذا الشهر.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
