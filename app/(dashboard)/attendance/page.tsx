"use client";

import { Calendar as CalendarIcon } from "lucide-react";

const attendanceData = [
  { id: 1, name: "أحمد محمد", initial: "أ", color: "bg-blue-500", date: "2026-03-24", entry: "09:03", exit: "17:05", late: "3 دقيقة", status: "حاضر", statusColor: "text-green-600 bg-green-50 border-green-100" },
  { id: 2, name: "فاطمة علي", initial: "ف", color: "bg-pink-500", date: "2026-03-24", entry: "09:00", exit: "17:00", late: "—", status: "حاضر", statusColor: "text-green-600 bg-green-50 border-green-100" },
  { id: 3, name: "خالد سعيد", initial: "خ", color: "bg-orange-500", date: "2026-03-24", entry: "08:15", exit: "16:00", late: "15 دقيقة", status: "متأخر", statusColor: "text-orange-600 bg-orange-50 border-orange-100" },
  { id: 4, name: "نورة حسن", initial: "ن", color: "bg-purple-500", date: "2026-03-24", entry: "10:00", exit: "18:00", late: "—", status: "حاضر", statusColor: "text-green-600 bg-green-50 border-green-100" },
  { id: 5, name: "سعد العتيبي", initial: "س", color: "bg-blue-400", date: "2026-03-24", entry: "—", exit: "—", late: "—", status: "غائب", statusColor: "text-red-500 bg-red-50 border-red-100" },
  { id: 6, name: "ريم القحطاني", initial: "ر", color: "bg-yellow-500", date: "2026-03-24", entry: "09:00", exit: "13:00", late: "—", status: "إجازة", statusColor: "text-cyan-600 bg-cyan-50 border-cyan-100" },
];

export default function AttendancePage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-8" dir="rtl">
      
      {/* الهيدر المعدل */}
      <header className="mb-8 text-right">
        <h1 className="text-2xl font-bold text-slate-900">سجل الحضور والانصراف</h1>
        <p className="text-slate-500 text-sm mt-1">تتبع حضور الموظفين وساعات العمل</p>
        
        {/* سطر المعلومات تحت الوصف مباشرة */}
        <div className="mt-6 flex flex-wrap items-center gap-4">
          
          {/* حقل التاريخ */}
          <div className="flex items-center gap-3 bg-white text-slate-700 py-2 px-4 rounded-xl border border-slate-200 shadow-sm">
             <span className="text-sm font-semibold">03/24/2026</span>
             <CalendarIcon size={16} className="text-slate-400" />
          </div>
          
          {/* الإحصائيات (Pills) */}
          <div className="flex items-center gap-2">
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-bold border border-green-200">حاضر: 3</span>
            <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-xs font-bold border border-orange-200">متأخر: 1</span>
            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs font-bold border border-red-200">غائب: 1</span>
            <span className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-lg text-xs font-bold border border-cyan-200">إجازة: 1</span>
          </div>
        </div>
      </header>

      {/* الجدول الأبيض */}
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
            {attendanceData.map((emp) => (
              <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${emp.color} text-white flex items-center justify-center text-[10px] font-bold`}>
                      {emp.initial}
                    </div>
                    <span className="font-semibold text-slate-700 text-sm">{emp.name}</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-slate-400 font-medium">{emp.date}</td>
                <td className="p-4 text-sm text-slate-800 font-semibold">{emp.entry}</td>
                <td className="p-4 text-sm text-slate-800 font-semibold">{emp.exit}</td>
                <td className="p-4">
                  {emp.late !== "—" ? (
                    <span className="text-orange-500 font-bold text-xs">{emp.late}</span>
                  ) : (
                    <span className="text-slate-300 mr-2">—</span>
                  )}
                </td>
                <td className="p-4 text-center">
                  <span className={`px-4 py-1.5 rounded-xl text-[11px] font-bold border ${emp.statusColor}`}>
                    {emp.status}
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