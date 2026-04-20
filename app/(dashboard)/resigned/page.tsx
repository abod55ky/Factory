"use client";

import { useMemo } from "react";
import { Loader2, UserMinus, Phone, BadgeInfo, ChevronLeft, Scissors } from "lucide-react";
import { useResignedEmployees } from "@/hooks/useEmployees";
import type { Employee } from "@/types/employee";

const asWageText = (value: Employee["hourlyRate"]) => {
  if (value && typeof value === "object" && "$numberDecimal" in value) {
    return value.$numberDecimal;
  }
  return value?.toString() || "—";
};

export default function ResignedEmployeesPage() {
  const { data: resignedEmployees = [], isLoading, isError, error } = useResignedEmployees();

  const sorted = useMemo(
    () => [...resignedEmployees].sort((a, b) => (a.name || "").localeCompare(b.name || "ar")),
    [resignedEmployees],
  );

  return (
    /* تم إرجاع الإطار ليكون border-2 بدلاً من border-4 */
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
                          
          {/* مسار التنقل (Breadcrumbs) بتصميم زجاجي مع درازة داخلية */}
          <nav className="mb-6 relative overflow-hidden flex items-center gap-2 text-xs font-black text-slate-500 bg-white/60 backdrop-blur-xl w-fit px-4 py-2.5 rounded-2xl border border-white/80 shadow-[0_5px_15px_rgba(38,53,68,0.05)] group">
            <div className="absolute inset-1 rounded-xl border border-dashed border-[#C89355]/30 pointer-events-none transition-colors group-hover:border-[#C89355]/50" />
            <span className="hover:text-[#263544] cursor-pointer transition-colors relative z-10">إدارة الموارد البشرية</span>
            <ChevronLeft size={14} className="text-[#C89355] relative z-10" />
            <span className="text-[#263544] relative z-10">المستقيلون</span>
          </nav>

          {/* الهيدر مدمج بأسلوب لوحة التحكم */}
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#263544]/10 pb-6 relative">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {/* أيقونة العنوان بهوية الماركة الكحلية والنحاسية مع الدرزة */}
                <div className="p-3 bg-[#1a2530] rounded-2xl shadow-[0_15px_25px_rgba(38,53,68,0.4)] border border-[#C89355]/40 relative outline outline-dashed outline-1 outline-[#C89355]/50 outline-offset-[-4px]">
                  <UserMinus size={22} className="text-[#C89355] animate-bounce" strokeWidth={2.5} />
                </div>
                <h1 className="text-3xl font-black text-[#263544] tracking-tight drop-shadow-sm">
                  المستقيلون
                </h1>
              </div>
              <p className="text-slate-600 text-sm font-bold pr-14 flex items-center gap-2">
                <Scissors size={14} className="text-[#C89355]" />
                سجل الموظفين السابقين في المعمل
              </p>
            </div>
            
            <div className="flex w-full md:w-auto justify-end">
              {/* شارة العدد بتصميم زجاجي مع درازة داخلية */}
              <div className="relative overflow-hidden inline-flex items-center gap-2 bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl px-5 py-3 shadow-[0_10px_20px_rgba(38,53,68,0.05)] text-[#263544] text-sm font-black group hover:shadow-md transition-all">
                <div className="absolute inset-1 rounded-xl border border-dashed border-[#C89355]/30 pointer-events-none transition-colors group-hover:border-[#C89355]/50" />
                <BadgeInfo size={18} className="text-[#C89355] group-hover:animate-pulse relative z-10" />
                <span className="relative z-10 tracking-wide">العدد الإجمالي: {sorted.length}</span>
              </div>
            </div>
          </header>

          {/* الجدول بتصميم الكارد الزجاجي العميق مع درازة خفيفة */}
          <div className="relative bg-white/60 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(38,53,68,0.08)] border-2 border-white/90 overflow-hidden group">
            <div className="absolute inset-1.5 rounded-[2.2rem] border border-dashed border-[#C89355]/30 pointer-events-none transition-colors group-hover:border-[#C89355]/50 z-0" />
            
            <div className="relative z-10 h-full">
              {isLoading ? (
                <div className="p-16 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-[#C89355]" size={40} />
                    <span className="font-black text-[#263544] animate-pulse">جاري تحميل سجل المستقيلين...</span>
                  </div>
                </div>
              ) : isError ? (
                <div className="p-16 text-center text-rose-600 font-black bg-rose-50/50 backdrop-blur-md rounded-2xl m-4 border border-rose-200">
                  حدث خطأ في تحميل البيانات: {(error as Error)?.message || "خطأ غير معروف"}
                </div>
              ) : sorted.length === 0 ? (
                <div className="p-16 text-center text-[#263544]/60 font-black text-lg">
                  لا يوجد موظفون مستقيلون حاليًا.
                </div>
              ) : (
                <div className="w-full overflow-x-auto custom-scrollbar">
                  <table className="w-full min-w-[700px] text-right">
                    <thead className="bg-white/40 border-b border-white/80">
                      <tr>
                        <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">الموظف</th>
                        <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">القسم</th>
                        <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">الموبايل</th>
                        <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">الأجر المسجل</th>
                        <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/40">
                      {sorted.map((employee) => (
                        <tr key={employee.employeeId} className="hover:bg-white/80 transition-all duration-300 group/row">
                          <td className="p-4 text-center">
                            <p className="font-black text-slate-800 group-hover/row:text-[#263544] transition-colors">{employee.name}</p>
                            <p className="text-[11px] text-slate-500 font-mono mt-0.5">{employee.employeeId}</p>
                          </td>
                          <td className="p-4 text-center">
                            <span className="bg-white/80 backdrop-blur-md text-[#263544] px-3 py-1.5 rounded-xl text-[11px] font-black border border-white shadow-sm">
                              {employee.department || "—"}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className="inline-flex items-center justify-center gap-1.5 font-mono text-sm font-black text-[#263544]">
                              <Phone size={14} className="text-[#C89355] group-hover/row:animate-bounce" />
                              {(employee as Employee & { mobile?: string }).mobile || employee.phone || "—"}
                            </span>
                          </td>
                          <td className="p-4 text-center font-mono font-black text-[#263544] text-sm">
                            {asWageText(employee.hourlyRate)} <span className="text-[10px] text-[#C89355] mr-1">ل.س</span>
                          </td>
                          <td className="p-4 text-center">
                            <span className="px-4 py-1.5 rounded-xl text-[11px] font-black bg-rose-50/80 backdrop-blur-md text-rose-600 border border-rose-100 shadow-sm">
                              مستقيل
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>
    </div>
  );
}