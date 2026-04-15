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
    <div className="p-6 md:p-8 font-sans bg-slate-50 min-h-screen" dir="rtl">
      <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-6">
        <Link href="/employees" className="hover:text-[#00bba7] transition-colors">إدارة الموارد البشرية</Link>
        <ChevronLeft size={14} />
        <span className="text-[#00bba7]">المستقيلون</span>
      </nav>

      <header className="mb-8 rounded-3xl border border-[#00bba7]/20 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-[#00bba7]/10 p-3 text-[#00bba7]">
            <UserMinus size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#00bba7]">المستقيلون</h1>
            <p className="text-sm text-slate-500 mt-1">هذه الصفحة تعرض الموظفين ذوي الحالة <span className="font-mono">&quot;terminated&quot;</span> فقط.</p>
          </div>
        </div>
        <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#E7C873]/15 border border-[#E7C873]/30 px-3 py-1.5 text-[#8e742e] text-xs font-bold">
          <BadgeInfo size={14} />
          العدد الحالي: {sorted.length}
        </div>
      </header>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-slate-500">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-[#00bba7]" size={32} />
              <span className="font-bold">جاري تحميل المستقيلين...</span>
            </div>
          </div>
        ) : isError ? (
          <div className="p-8 text-red-600">حدث خطأ في تحميل البيانات: {(error as Error)?.message || "خطأ غير معروف"}</div>
        ) : sorted.length === 0 ? (
          <div className="p-16 text-center text-slate-400 font-medium">لا يوجد موظفون مستقيلون حاليًا.</div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-175 text-right">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-4 text-xs font-extrabold text-[#00bba7]">الموظف</th>
                  <th className="p-4 text-xs font-extrabold text-[#00bba7] text-center">القسم</th>
                  <th className="p-4 text-xs font-extrabold text-[#00bba7] text-center">الموبايل</th>
                  <th className="p-4 text-xs font-extrabold text-[#00bba7] text-center">الأجر المسجل</th>
                  <th className="p-4 text-xs font-extrabold text-[#00bba7] text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sorted.map((employee) => (
                  <tr key={employee.employeeId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{employee.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{employee.employeeId}</p>
                    </td>
                    <td className="p-4 text-center text-slate-600 font-semibold">{employee.department || "—"}</td>
                    <td className="p-4 text-center text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <Phone size={13} className="text-[#E7C873]" />
                        {(employee as Employee & { mobile?: string }).mobile || employee.phone || "—"}
                      </span>
                    </td>
                    <td className="p-4 text-center text-slate-700 font-mono font-bold">{asWageText(employee.hourlyRate)}</td>
                    <td className="p-4 text-center">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
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
  );
}
