"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2, UserMinus, Phone, BadgeInfo } from "lucide-react";
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
    /* الخلفية المتدرجة الأساسية */
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-gradient-to-br from-[#00bba7] via-[#00bba7]/90 to-[#E7C873]" dir="rtl">
      
      {/* الحاوية الرئيسية (Wrapper) الزجاجية مع البوردر الذهبي والشادو */}
      <div className="relative z-10 w-full max-w-7xl min-h-[90vh] bg-white/70 backdrop-blur-3xl rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border-2 border-[#E7C873]/80 flex flex-col overflow-hidden">
        
        {/* المحتوى الداخلي */}
        <div className="p-6 md:p-10 h-full overflow-y-auto custom-scrollbar">
          
          {/* الهيدر مدمج بأسلوب لوحة التحكم */}
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-black/5 pb-6 relative">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-gradient-to-br from-[#00bba7] to-[#008275] rounded-2xl shadow-lg shadow-[#00bba7]/20 border border-[#00bba7]/20">
                  {/* أنيميشن قفز لأيقونة العنوان */}
                  <UserMinus size={24} className="text-white animate-bounce" />
                </div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                  المستقيلون
                </h1>
              </div>
              {/* مسار التنقل (Breadcrumbs) */}
              <nav className="flex items-center gap-2 text-sm font-bold text-slate-500 pr-14">
                <Link href="/employees" className="hover:text-[#00bba7] transition-colors">إدارة الموارد البشرية</Link>
                {/* أنيميشن نبض لمؤشر الاتجاه */}
                <ChevronLeft size={14} className="animate-pulse text-[#E7C873]" />
                <span className="text-[#00bba7]">المستقيلون</span>
              </nav>
            </div>
            
            <div className="flex w-full md:w-auto justify-end">
              {/* شارة العدد بأسلوب زجاجي متناسق مع شريط البحث في الصفحات السابقة */}
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-white/80 rounded-xl px-4 py-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-[#8e742e] text-sm font-bold group hover:shadow-md transition-all">
                <BadgeInfo size={18} className="text-[#E7C873] group-hover:animate-pulse" />
                العدد الحالي: {sorted.length}
              </div>
            </div>
          </header>

          {/* الجدول بتصميم الكارد مع الشادو */}
          <div className="bg-white rounded-[2.5rem] shadow-[0_25px_50px_rgba(0,0,0,0.05)] border border-white/80 overflow-hidden">
            {isLoading ? (
              <div className="p-16 text-center text-slate-500">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="animate-spin text-[#E7C873]" size={40} />
                  <span className="font-bold text-[#00bba7] animate-pulse">جاري تحميل المستقيلين...</span>
                </div>
              </div>
            ) : isError ? (
              <div className="p-16 text-center text-rose-600 font-bold bg-rose-50/50">
                حدث خطأ في تحميل البيانات: {(error as Error)?.message || "خطأ غير معروف"}
              </div>
            ) : sorted.length === 0 ? (
              <div className="p-16 text-center text-slate-400 font-medium">
                لا يوجد موظفون مستقيلون حاليًا.
              </div>
            ) : (
              <div className="w-full overflow-x-auto custom-scrollbar">
                <table className="w-full min-w-175 text-right">
                  <thead className="bg-slate-50/50 border-b border-slate-100/80">
                    <tr>
                      <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider">الموظف</th>
                      <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">القسم</th>
                      <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">الموبايل</th>
                      <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">الأجر المسجل</th>
                      <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {sorted.map((employee) => (
                      <tr key={employee.employeeId} className="hover:bg-[#00bba7]/[0.02] transition-colors group">
                        <td className="p-4">
                          <p className="font-bold text-slate-800 group-hover:text-[#00bba7] transition-colors">{employee.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">{employee.employeeId}</p>
                        </td>
                        <td className="p-4 text-center">
                          <span className="bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg text-[11px] font-bold border border-slate-100">
                            {employee.department || "—"}
                          </span>
                        </td>
                        <td className="p-4 text-center text-slate-600">
                          <span className="inline-flex items-center justify-center gap-1.5 font-mono text-sm">
                            {/* إضافة حركة لأيقونة الهاتف عند تمرير الماوس */}
                            <Phone size={14} className="text-[#E7C873] group-hover:animate-bounce" />
                            {(employee as Employee & { mobile?: string }).mobile || employee.phone || "—"}
                          </span>
                        </td>
                        <td className="p-4 text-center text-slate-700 font-mono font-bold text-sm">
                          {asWageText(employee.hourlyRate)} <span className="text-[10px] text-slate-400">ل.س</span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="px-4 py-1.5 rounded-xl text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-100 shadow-sm">
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