"use client";

import { FileDown, Users, Clock, CalendarX, TrendingUp } from "lucide-react";
import { usePayrollSummary, usePayrollList } from '@/hooks/usePayroll';

export default function SalariesPage() {
  const { data: summary, isLoading: sLoading } = usePayrollSummary();
  const { data: listData, isLoading: lLoading } = usePayrollList();

  const salaryData = listData?.runs || [
    { id: 3, name: 'محمد أحمد', initial: 'م', color: 'bg-blue-600', dept: 'الإدارة', morningLate: '—', earlyExit: '—', absence: '—', overtime: '1349 د', weekendOvertime: '—', totalDeduction: '—', totalOvertime: '1349 د' },
  ];

  const loading = sLoading || lLoading;

  if (loading) return <div className="p-8">جاري تحميل بيانات الرواتب...</div>;

  return (
    <div className="p-8 bg-[#f9fafb] min-h-screen" dir="rtl">
      <header className="flex justify-between items-start mb-8">
        <div className="text-right">
          <h1 className="text-2xl font-bold text-slate-800">كشف الرواتب</h1>
          <p className="text-slate-500 text-sm mt-1">ملخص التأخير والإضافي والغياب لاحتساب الرواتب</p>
        </div>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-all shadow-sm">
          <FileDown size={18} />
          تصدير إلى Excel
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border-r-4 border-orange-400 shadow-sm flex flex-col ">
          <p className="text-slate-500 text-xs mb-2">إجمالي الخصومات (تأخر + خروج مبكر)</p>
          <h3 className="text-3xl font-extrabold text-orange-500">{summary?.totalDeductions ?? '—'}</h3>
          <p className="text-[11px] text-slate-400 mt-1">—</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border-r-4 border-green-500 shadow-sm flex flex-col ">
          <p className="text-slate-500 text-xs mb-2">إجمالي الوقت الإضافي</p>
          <h3 className="text-3xl font-extrabold text-green-600">{summary?.totalOvertime ?? '—'}</h3>
          <p className="text-[11px] text-slate-400 mt-1">—</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border-r-4 border-red-500 shadow-sm flex flex-col ">
          <p className="text-slate-500 text-xs mb-2">إجمالي أيام الغياب</p>
          <h3 className="text-3xl font-extrabold text-red-600">{summary?.totalAbsences ?? '—'}</h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="p-4 text-xs font-bold text-slate-500">الرقم</th>
              <th className="p-4 text-xs font-bold text-slate-500">الموظف</th>
              <th className="p-4 text-xs font-bold text-slate-500">القسم</th>
              <th className="p-4 text-xs font-bold text-slate-500">تأخر صباحي</th>
              <th className="p-4 text-xs font-bold text-slate-500">خروج مبكر</th>
              <th className="p-4 text-xs font-bold text-slate-500">غياب</th>
              <th className="p-4 text-xs font-bold text-slate-500">إضافي</th>
              <th className="p-4 text-xs font-bold text-slate-500">إضافي ن.أسبوع</th>
              <th className="p-4 text-xs font-bold text-slate-500">إجمالي الخصم</th>
              <th className="p-4 text-xs font-bold text-slate-500 text-left">إجمالي الإضافي</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {salaryData.map((emp: any) => (
              <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 text-sm text-slate-400 font-mono">{emp.id}</td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${emp.color} text-white flex items-center justify-center text-[10px] font-bold shadow-sm`}>
                      {emp.initial}
                    </div>
                    <span className="font-bold text-slate-700 text-sm whitespace-nowrap">{emp.name}</span>
                  </div>
                </td>
                <td className="p-4 text-xs text-slate-500">{emp.dept}</td>
                <td className="p-4 text-sm font-bold text-orange-400">{emp.morningLate}</td>
                <td className="p-4 text-sm font-bold text-orange-400">{emp.earlyExit}</td>
                <td className="p-4 text-sm font-bold text-red-500">{emp.absence}</td>
                <td className="p-4 text-sm font-bold text-green-500">{emp.overtime}</td>
                <td className="p-4 text-sm font-bold text-green-600">{emp.weekendOvertime}</td>
                <td className="p-4 text-sm font-bold text-red-500">{emp.totalDeduction}</td>
                <td className="p-4 text-sm font-bold text-green-600 text-left">{emp.totalOvertime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}