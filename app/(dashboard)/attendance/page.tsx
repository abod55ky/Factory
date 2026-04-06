"use client";

import { Calendar as CalendarIcon } from "lucide-react";
import { useAttendance } from '@/hooks/useAttendance';

export default function AttendancePage() {
  const { data, isLoading } = useAttendance({});

  // backend returns { records, pagination }
  const records = data?.records || [
    { id: 1, name: 'أحمد محمد', initial: 'أ', color: 'bg-blue-500', date: '2026-03-24', entry: '09:03', exit: '17:05', late: '3 دقيقة', status: 'حاضر', statusColor: 'text-green-600 bg-green-50 border-green-100' },
  ];

  if (isLoading) return <div className="p-8">جاري تحميل سجلات الحضور...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8" dir="rtl">
      <header className="mb-8 text-right">
        <h1 className="text-2xl font-bold text-slate-900">سجل الحضور والانصراف</h1>
        <p className="text-slate-500 text-sm mt-1">تتبع حضور الموظفين وساعات العمل</p>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 bg-white text-slate-700 py-2 px-4 rounded-xl border border-slate-200 shadow-sm">
             <span className="text-sm font-semibold">03/24/2026</span>
             <CalendarIcon size={16} className="text-slate-400" />
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-bold border border-green-200">حاضر: {records.filter((r:any)=>r.status==='حاضر').length}</span>
            <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-xs font-bold border border-orange-200">متأخر: {records.filter((r:any)=>r.status==='متأخر').length}</span>
            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs font-bold border border-red-200">غائب: {records.filter((r:any)=>r.status==='غائب').length}</span>
            <span className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-lg text-xs font-bold border border-cyan-200">إجازة: {records.filter((r:any)=>r.status==='إجازة').length}</span>
          </div>
        </div>
      </header>

      <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">الموظف</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">التاريخ</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">الدخول</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">الخروج</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">دقائق التأخير</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((emp: any) => (
              <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${emp.color || 'bg-gray-300'} text-white flex items-center justify-center text-[10px] font-bold`}>
                      {emp.initial || (emp.name && emp.name[0])}
                    </div>
                    <span className="font-semibold text-slate-700 text-sm">{emp.name}</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-slate-400 font-medium">{emp.date}</td>
                <td className="p-4 text-sm text-slate-800 font-semibold">{emp.entry || '—'}</td>
                <td className="p-4 text-sm text-slate-800 font-semibold">{emp.exit || '—'}</td>
                <td className="p-4">
                  {emp.late && emp.late !== '—' ? (
                    <span className="text-orange-500 font-bold text-xs">{emp.late}</span>
                  ) : (
                    <span className="text-slate-300 mr-2">—</span>
                  )}
                </td>
                <td className="p-4 text-center">
                  <span className={`px-4 py-1.5 rounded-xl text-[11px] font-bold border ${emp.statusColor || 'text-slate-500 border-slate-100'}`}>
                    {emp.status || '—'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}