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
        <div className="flex flex-col items-center gap-4 relative z-10 bg-white/40 p-8 rounded-3xl backdrop-blur-2xl border border-white/60 shadow-[0_20px_40px_rgba(38,53,68,0.1)]">
          <div className="w-14 h-14 border-4 border-[#C89355]/30 border-t-[#263544] rounded-full animate-spin shadow-lg" />
          <p className="text-[#263544] font-black animate-pulse text-sm tracking-wide">جاري تحميل تقرير الرواتب...</p>
        </div>
      </div>
    );
  }

  return (
    /* الحاوية الرئيسية: تأثير زجاجي مع درازة خارجية */
    <div className="relative z-10 w-full max-w-7xl min-h-[85vh] mx-auto bg-white/50 backdrop-blur-[40px] rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(38,53,68,0.2)] border-2 border-dashed border-[#C89355]/60 flex flex-col overflow-hidden" dir="rtl">
      
      {/* نقشة الفايبر (القماش) الثابتة والشفافة */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 12h24M12 0v24' stroke='%23263544' stroke-width='1' stroke-dasharray='4 4' fill='none'/%3E%3C/svg%3E")`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* المحتوى الداخلي */}
      <div className="p-6 md:p-10 h-full overflow-y-auto custom-scrollbar relative z-10">
        
        {/* مسار التنقل (Breadcrumbs) - درزة من الداخل */}
        <nav className="mb-6 relative overflow-hidden flex items-center gap-2 text-xs font-black text-slate-500 bg-white/60 backdrop-blur-xl w-fit px-4 py-2.5 rounded-2xl border border-white/80 shadow-[0_5px_15px_rgba(38,53,68,0.05)] group">
          <div className="absolute inset-1 rounded-xl border border-dashed border-[#C89355]/30 pointer-events-none transition-colors group-hover:border-[#C89355]/50" />
          <span className="hover:text-[#263544] cursor-pointer transition-colors relative z-10">المركز المالي</span>
          <ChevronLeft size={14} className="text-[#C89355] relative z-10" />
          <span className="text-[#263544] relative z-10">تقارير الرواتب</span>
        </nav>

        {/* الترويسة وأدوات التحكم */}
        <header className="mb-10 flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-[#263544]/10 pb-8 relative">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {/* أيقونة العنوان بهوية الماركة الكحلية والنحاسية مع الدرزة */}
              <div className="p-3 bg-[#1a2530] rounded-2xl shadow-[0_15px_25px_rgba(38,53,68,0.4)] border border-[#C89355]/40 relative outline outline-dashed outline-1 outline-[#C89355]/50 outline-offset-[-4px]">
                <FileSpreadsheet size={22} className="text-[#C89355] animate-bounce" strokeWidth={2.5} />
              </div>
              <h1 className="text-3xl font-black text-[#263544] tracking-tight drop-shadow-sm">
                التقرير النهائي للرواتب
              </h1>
            </div>
            <p className="text-slate-600 text-sm font-bold pr-14 mt-1">اختر الشهر لعرض ملخص المسير وتفاصيله المعتمدة.</p>
          </div>

          <div className="mt-4 xl:mt-0 flex flex-wrap items-center justify-start xl:justify-end gap-3 w-full xl:w-auto">
            
            {/* اختيار الشهر بأسلوب زجاجي - درزة من الداخل */}
            <div className="relative overflow-hidden flex items-center bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl px-4 py-2 shadow-sm transition-all duration-300 hover:shadow-md group focus-within:border-[#C89355] focus-within:ring-2 focus-within:ring-[#C89355]/20">
              <div className="absolute inset-1 rounded-xl border border-dashed border-[#C89355]/30 pointer-events-none transition-colors group-hover:border-[#C89355]/50 group-focus-within:border-[#C89355]/50" />
              <CalendarIcon size={18} className="text-[#C89355] group-hover:animate-pulse relative z-10 ml-2" />
              <input
                type="month"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                className="bg-transparent border-none outline-none font-mono text-sm font-black text-[#263544] w-full cursor-pointer focus:ring-0 relative z-10"
              />
            </div>

            {/* أزرار الإجراءات والروابط */}
            <button
              type="button"
              onClick={handleExportExcel}
              className="relative overflow-hidden inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600/90 backdrop-blur-md text-white font-black text-sm hover:bg-emerald-700 transition-all shadow-[0_10px_20px_rgba(5,150,105,0.3)] active:scale-95 border border-emerald-500 group"
            >
              <div className="absolute inset-1 rounded-xl border border-dashed border-white/30 pointer-events-none" />
              <Download size={16} className="group-hover:-translate-y-1 transition-transform relative z-10" />
              <span className="relative z-10">تنزيل Excel</span>
            </button>

            <Link 
              href={`/payroll/${month}`} 
              className="relative overflow-hidden inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#1a2530] hover:bg-[#263544] text-[#C89355] font-black text-sm transition-all shadow-[0_10px_20px_rgba(38,53,68,0.4)] active:scale-95 border border-[#C89355]/40 group/btn"
            >
              <div className="absolute inset-1 rounded-xl border border-dashed border-[#C89355]/30 pointer-events-none transition-colors group-hover/btn:border-[#C89355]/50" />
              <span className="relative z-10">تفاصيل الشهر</span>
              <ExternalLink size={16} className="group-hover/btn:-translate-x-1 transition-transform relative z-10" />
            </Link>

            <Link 
              href={`/vouchers?month=${month}`} 
              className="relative overflow-hidden inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/80 backdrop-blur-md text-[#263544] font-black text-sm border border-white hover:bg-white hover:border-[#C89355]/30 transition-all shadow-sm active:scale-95 group"
            >
              <div className="absolute inset-1 rounded-xl border border-dashed border-[#263544]/10 pointer-events-none transition-colors group-hover:border-[#C89355]/30" />
              <span className="relative z-10">قسائم القبض</span>
            </Link>
          </div>
        </header>

        {isError ? (
          <div className="p-8 text-center text-rose-600 font-black bg-rose-50/80 backdrop-blur-md border border-rose-200 rounded-[2.5rem] mx-4 shadow-sm">
            {error instanceof Error ? error.message : "تعذر تحميل التقرير"}
          </div>
        ) : (
          <>
            {/* كروت الإحصائيات (Stats Cards) - زجاجية مع درازة داخلية */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              
              <div className="relative overflow-hidden bg-white/60 backdrop-blur-xl border-2 border-white/90 rounded-[2.5rem] p-7 shadow-[0_15px_40px_rgba(38,53,68,0.06)] hover:shadow-[0_20px_50px_rgba(38,53,68,0.12)] hover:-translate-y-1 transition-all group">
                <div className="absolute inset-1.5 rounded-[2.2rem] border border-dashed border-[#C89355]/30 pointer-events-none transition-colors group-hover:border-[#C89355]/50" />
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="p-3 bg-[#1a2530] rounded-xl border border-[#C89355]/30 shadow-sm">
                    <Wallet className="text-[#C89355] group-hover:animate-pulse" size={22}/>
                  </div>
                  <p className="font-black text-[#263544] text-sm">إجمالي الأجور</p>
                </div>
                <p className="text-4xl font-black text-[#263544] relative z-10">{toNumber(data?.totals.totalGrossPay).toLocaleString()}</p>
              </div>

              <div className="relative overflow-hidden bg-white/60 backdrop-blur-xl border-2 border-white/90 rounded-[2.5rem] p-7 shadow-[0_15px_40px_rgba(38,53,68,0.06)] hover:shadow-[0_20px_50px_rgba(225,29,72,0.12)] hover:-translate-y-1 transition-all group">
                <div className="absolute inset-1.5 rounded-[2.2rem] border border-dashed border-[#C89355]/30 pointer-events-none transition-colors group-hover:border-rose-300" />
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 shadow-sm">
                    <Receipt className="text-rose-600 group-hover:animate-pulse" size={22}/>
                  </div>
                  <p className="font-black text-[#263544] text-sm">إجمالي الخصومات</p>
                </div>
                <p className="text-4xl font-black text-rose-600 relative z-10">{toNumber(data?.totals.totalDeductions).toLocaleString()}</p>
              </div>

              <div className="relative overflow-hidden bg-white/60 backdrop-blur-xl border-2 border-white/90 rounded-[2.5rem] p-7 shadow-[0_15px_40px_rgba(38,53,68,0.06)] hover:shadow-[0_20px_50px_rgba(200,147,85,0.15)] hover:-translate-y-1 transition-all group">
                <div className="absolute inset-1.5 rounded-[2.2rem] border border-dashed border-[#C89355]/30 pointer-events-none transition-colors group-hover:border-[#C89355]/60" />
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="p-3 bg-[#C89355] rounded-xl border border-[#1a2530]/20 shadow-sm">
                    <HandCoins className="text-[#1a2530] group-hover:animate-pulse" size={22}/>
                  </div>
                  <p className="font-black text-[#263544] text-sm">صافي الرواتب</p>
                </div>
                <p className="text-4xl font-black text-[#C89355] relative z-10 drop-shadow-sm">{toNumber(data?.totals.totalNetPay).toLocaleString()}</p>
              </div>

            </div>

            {/* الجدول بتصميم الكارد الزجاجي العميق - درزة من الداخل */}
            <div className="relative bg-white/60 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(38,53,68,0.08)] border-2 border-white/90 overflow-hidden group/table">
              <div className="absolute inset-1.5 rounded-[2.2rem] border border-dashed border-[#C89355]/30 pointer-events-none z-0 transition-colors group-hover/table:border-[#C89355]/50" />
              <div className="w-full overflow-x-auto custom-scrollbar relative z-10">
                <table className="w-full text-right min-w-[700px] border-collapse">
                  <thead className="bg-white/40 border-b border-white/80">
                    <tr>
                      <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">كود الموظف</th>
                      <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">اسم الموظف</th>
                      <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">إجمالي الأجر</th>
                      <th className="p-5 text-rose-600 font-black text-xs uppercase tracking-wider text-center">خصومات</th>
                      <th className="p-5 text-[#1a2530] font-black text-xs uppercase tracking-wider text-center bg-[#C89355]/10">صافي المستحق</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/40">
                    {data?.items?.length ? (
                      data.items.slice(0, 12).map((item) => (
                        <tr key={item.id} className="hover:bg-white/80 transition-colors duration-300 group/row">
                          <td className="p-4 text-center font-mono text-sm font-black text-[#263544]/60">{item.employeeId}</td>
                          <td className="p-4 text-center font-black text-slate-800 group-hover/row:text-[#263544] transition-colors">{item.employeeName}</td>
                          <td className="p-4 text-center font-mono font-black text-[#263544]">{toNumber(item.grossPay).toLocaleString()}</td>
                          <td className="p-4 text-center font-mono font-black text-rose-600 bg-rose-50/50 rounded-xl">{toNumber(item.totalDeductions).toLocaleString()}</td>
                          <td className="p-4 text-center font-black text-xl text-[#1a2530] bg-[#C89355]/10 rounded-xl shadow-inner border border-[#C89355]/20">{toNumber(item.netPay).toLocaleString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="p-16 text-center text-[#263544]/60 font-black" colSpan={5}>
                          لا توجد بيانات رواتب مُرحلة لهذا الشهر.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {data?.items?.length && data.items.length > 12 ? (
                <div className="relative mt-4 bg-white/60 backdrop-blur-md p-4 text-center rounded-2xl border border-white/80 shadow-sm overflow-hidden">
                  <div className="absolute inset-1 rounded-xl border border-dashed border-[#C89355]/20 pointer-events-none" />
                  <p className="text-xs text-[#263544] font-black relative z-10 flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C89355] animate-pulse"></span>
                    يتم عرض أول 12 سجل كمعاينة. قم بتنزيل ملف الـ Excel لرؤية القائمة كاملة.
                  </p>
                </div>
            ) : null}
          </>
        )}

      </div>
    </div>
  );
}