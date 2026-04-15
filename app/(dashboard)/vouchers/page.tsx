"use client";

import { useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import usePayrollReport from "@/hooks/usePayrollReport";

const toNumber = (value: unknown) => {
  if (value && typeof value === "object" && "$numberDecimal" in (value as Record<string, unknown>)) {
    return Number((value as { $numberDecimal: string }).$numberDecimal || 0);
  }
  return Number(value || 0);
};

const getLocalMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

export default function VouchersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestedMonth = searchParams.get("month");
  const month = requestedMonth || getLocalMonth();
  const printRef = useRef<HTMLDivElement>(null);

  const handleMonthChange = (nextMonth: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (!nextMonth || nextMonth === getLocalMonth()) {
      params.delete("month");
    } else {
      params.set("month", nextMonth);
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const { data, isLoading, isError, error } = usePayrollReport(month);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `vouchers-${month}`,
  });

  const vouchers = useMemo(() => data?.items || [], [data?.items]);

  return (
    <div className="min-h-screen bg-slate-100 p-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">قسائم القبض</h1>
              <p className="text-sm text-slate-500 mt-1">جاهزة للطباعة بصيغة PDF عبر نافذة الطباعة</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="month"
                value={month}
                onChange={(event) => handleMonthChange(event.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2"
              />
              <button
                type="button"
                onClick={() => handlePrint()}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-600"
              >
                <Printer size={16} />
                طباعة القسائم
              </button>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 flex items-center gap-3">
            <Loader2 className="animate-spin" size={18} />
            <span>جاري تجهيز القسائم...</span>
          </div>
        )}

        {isError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
            {error instanceof Error ? error.message : "تعذر تحميل بيانات القسائم"}
          </div>
        )}

        {!isLoading && !isError && vouchers.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
            لا توجد بيانات رواتب متاحة لهذا الشهر لطباعة القسائم.
          </div>
        )}

        <div ref={printRef} className="space-y-4 print:space-y-2">
          {vouchers.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm print:shadow-none print:border-slate-400"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
                <div>
                  <h2 className="font-bold text-slate-900">قسيمة قبض راتب</h2>
                  <p className="text-xs text-slate-500">الشهر: {month}</p>
                </div>
                <p className="text-sm text-slate-700">{data?.latestRun?.runId || "RUN-N/A"}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <p><span className="text-slate-500">كود الموظف:</span> {item.employeeId}</p>
                <p><span className="text-slate-500">اسم الموظف:</span> {item.employeeName}</p>
                <p><span className="text-slate-500">القسم:</span> {item.department || "—"}</p>
                <p><span className="text-slate-500">الأجر الإجمالي:</span> {toNumber(item.grossPay).toLocaleString()}</p>
                <p><span className="text-slate-500">إجمالي الخصومات:</span> {toNumber(item.totalDeductions).toLocaleString()}</p>
                <p className="font-bold text-emerald-700"><span className="text-slate-500 font-normal">الصافي:</span> {toNumber(item.netPay).toLocaleString()}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
