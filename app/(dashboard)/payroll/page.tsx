"use client";

import Link from "next/link";
import { useState } from "react";
import { Download, FileSpreadsheet, Wallet, Receipt, HandCoins, Calendar as CalendarIcon, ExternalLink, ChevronLeft } from "lucide-react";
import usePayrollReport from "@/hooks/usePayrollReport";
import { toast } from "react-hot-toast";

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

  const handleExportExcel = async () => {
    if (!data?.items?.length) {
      toast.error("لا توجد بيانات رواتب للتنزيل");
      return;
    }

    try {
      const XLSX = await import("xlsx");
      const rows: Array<Record<string, string | number>> = data.items.map((item, index) => ({
        "#": index + 1,
        "كود الموظف": item.employeeId,
        "اسم الموظف": item.employeeName,
        "إجمالي الراتب": Number(toNumber(item.grossPay).toFixed(2)),
        "إجمالي الخصومات": Number(toNumber(item.totalDeductions).toFixed(2)),
        "صافي الراتب": Number(toNumber(item.netPay).toFixed(2)),
      }));

      rows.push({
        "#": "",
        "كود الموظف": "",
        "اسم الموظف": "الإجمالي",
        "إجمالي الراتب": Number(toNumber(data.totals.totalGrossPay).toFixed(2)),
        "إجمالي الخصومات": Number(toNumber(data.totals.totalDeductions).toFixed(2)),
        "صافي الراتب": Number(toNumber(data.totals.totalNetPay).toFixed(2)),
      });

      const worksheet = XLSX.utils.json_to_sheet(rows);
      worksheet["!cols"] = [
        { wch: 5 },
        { wch: 14 },
        { wch: 24 },
        { wch: 16 },
        { wch: 16 },
        { wch: 16 },
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll");
      XLSX.writeFile(workbook, `payroll-report-${month}.xlsx`);

      toast.success("تم تنزيل ملف Excel بنجاح");
    } catch {
      toast.error("تعذر تنزيل ملف Excel حالياً");
    }
  };

  if (isLoading) {
    return (
      <div className="relative min-h-[85vh] w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 relative z-10 bg-white/50 p-8 rounded-3xl backdrop-blur-md border border-white/60 shadow-2xl">
          <div className="w-14 h-14 border-4 border-[#E7C873]/30 border-t-[#00bba7] rounded-full animate-spin shadow-lg" />
          <p className="text-[#00bba7] font-bold animate-pulse text-sm">جاري تحميل تقرير الرواتب...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 w-full max-w-7xl min-h-[85vh] mx-auto bg-white/70 backdrop-blur-3xl rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border-2 border-[#E7C873]/80 flex flex-col overflow-hidden" dir="rtl">
      
      {/* المحتوى الداخلي */}
      <div className="p-6 md:p-10 h-full overflow-y-auto custom-scrollbar">
        
        {/* مسار التنقل (Breadcrumbs) المضاف حديثاً */}
        <nav className="mb-6 flex items-center gap-2 text-xs font-extrabold text-slate-500 bg-white/60 backdrop-blur-md w-fit px-4 py-2.5 rounded-2xl border border-white/80 shadow-sm">
          <span className="hover:text-[#00bba7] cursor-pointer transition-colors">المركز المالي</span>
          <ChevronLeft size={14} className="text-[#E7C873]" />
          <span className="text-[#00bba7]">تقارير الرواتب</span>
        </nav>

        {/* الترويسة وأدوات التحكم */}
        <header className="mb-10 flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-black/5 pb-8 relative">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-gradient-to-br from-[#00bba7] to-[#008275] rounded-2xl shadow-lg shadow-[#00bba7]/20 border border-[#00bba7]/20">
                <FileSpreadsheet size={24} className="text-white animate-bounce" />
              </div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                التقرير النهائي للرواتب
              </h1>
            </div>
            <p className="text-slate-500 text-sm font-medium pr-14 mt-1">اختر الشهر لعرض ملخص المسير وتفاصيله المعتمدة.</p>
          </div>

          <div className="mt-4 xl:mt-0 flex flex-wrap items-center justify-start xl:justify-end gap-3 w-full xl:w-auto">
            
            {/* اختيار الشهر بأسلوب زجاجي */}
            <div className="bg-white/80 backdrop-blur-md border border-white/80 rounded-xl p-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-2 hover:shadow-md transition-all group px-4">
              <CalendarIcon size={18} className="text-[#E7C873] group-hover:animate-pulse" />
              <input
                type="month"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                className="bg-transparent border-none outline-none font-mono text-sm font-bold text-slate-700 w-full cursor-pointer focus:ring-0"
              />
            </div>

            {/* أزرار الإجراءات والروابط */}
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md active:scale-95 border border-emerald-500 group"
            >
              <Download size={16} className="group-hover:-translate-y-1 transition-transform" />
              تنزيل Excel
            </button>

            <Link 
              href={`/payroll/${month}`} 
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#00bba7] to-[#008275] text-white font-bold text-sm hover:from-[#00a392] hover:to-[#006e63] transition-all shadow-[0_10px_20px_rgba(0,187,167,0.3)] active:scale-95 border border-[#00bba7]/50 group"
            >
              تفاصيل الشهر
              <ExternalLink size={16} className="group-hover:-translate-x-1 transition-transform" />
            </Link>

            <Link 
              href={`/vouchers?month=${month}`} 
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white text-slate-700 font-bold text-sm border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all shadow-sm active:scale-95 group"
            >
              قسائم القبض
            </Link>
          </div>
        </header>

        {isError ? (
          <div className="p-8 text-center text-rose-600 font-bold bg-rose-50/80 backdrop-blur border border-rose-100 rounded-[2rem] mx-4 shadow-sm">
            {error instanceof Error ? error.message : "تعذر تحميل التقرير"}
          </div>
        ) : (
          <>
            {/* كروت الإحصائيات (Stats Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              
              <div className="bg-white/80 backdrop-blur-md border border-white/80 rounded-[2rem] p-7 shadow-[0_15px_30px_rgba(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-1 transition-all group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-[#00bba7]/10 rounded-xl border border-[#00bba7]/20">
                    <Wallet className="text-[#00bba7] group-hover:animate-pulse" size={22}/>
                  </div>
                  <p className="font-extrabold text-slate-600 text-sm">إجمالي الأجور</p>
                </div>
                <p className="text-4xl font-black text-[#00bba7]">{toNumber(data?.totals.totalGrossPay).toLocaleString()}</p>
              </div>

              <div className="bg-white/80 backdrop-blur-md border border-white/80 rounded-[2rem] p-7 shadow-[0_15px_30px_rgba(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-1 transition-all group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                    <Receipt className="text-rose-500 group-hover:animate-pulse" size={22}/>
                  </div>
                  <p className="font-extrabold text-slate-600 text-sm">إجمالي الخصومات</p>
                </div>
                <p className="text-4xl font-black text-rose-600">{toNumber(data?.totals.totalDeductions).toLocaleString()}</p>
              </div>

              <div className="bg-white/80 backdrop-blur-md border border-white/80 rounded-[2rem] p-7 shadow-[0_15px_30px_rgba(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-1 transition-all group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-[#E7C873]/10 rounded-xl border border-[#E7C873]/20">
                    <HandCoins className="text-[#E7C873] group-hover:animate-pulse" size={22}/>
                  </div>
                  <p className="font-extrabold text-slate-600 text-sm">صافي الرواتب</p>
                </div>
                <p className="text-4xl font-black text-slate-800">{toNumber(data?.totals.totalNetPay).toLocaleString()}</p>
              </div>

            </div>

            {/* الجدول */}
            <div className="bg-white rounded-[2.5rem] shadow-[0_25px_50px_rgba(0,0,0,0.05)] border border-white/80 overflow-hidden">
              <div className="w-full overflow-x-auto custom-scrollbar">
                <table className="w-full text-right min-w-170 border-collapse">
                  <thead className="bg-slate-50/80 border-b border-slate-100/80">
                    <tr>
                      <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">كود الموظف</th>
                      <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">اسم الموظف</th>
                      <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">إجمالي</th>
                      <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">خصومات</th>
                      <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">صافي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data?.items?.length ? (
                      data.items.slice(0, 12).map((item) => (
                        <tr key={item.id} className="hover:bg-[#00bba7]/[0.02] transition-colors group">
                          <td className="p-4 text-center font-mono text-sm font-bold text-slate-500">{item.employeeId}</td>
                          <td className="p-4 text-center font-bold text-slate-800 group-hover:text-[#00bba7] transition-colors">{item.employeeName}</td>
                          <td className="p-4 text-center font-mono font-bold text-slate-700">{toNumber(item.grossPay).toLocaleString()}</td>
                          <td className="p-4 text-center font-mono font-bold text-rose-600 bg-rose-50/30">{toNumber(item.totalDeductions).toLocaleString()}</td>
                          <td className="p-4 text-center font-black text-xl text-slate-900 bg-slate-50/50">{toNumber(item.netPay).toLocaleString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="p-16 text-center text-slate-500 font-medium" colSpan={5}>
                          لا توجد بيانات رواتب مُرحلة لهذا الشهر.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {data?.items?.length && data.items.length > 12 ? (
                 <div className="bg-slate-50/50 p-4 text-center border-t border-slate-100">
                   <p className="text-xs text-slate-500 font-bold">يتم عرض أول 12 سجل كمعاينة. قم بتنزيل ملف الـ Excel لرؤية القائمة كاملة.</p>
                 </div>
              ) : null}
            </div>
          </>
        )}

      </div>
    </div>
  );
}