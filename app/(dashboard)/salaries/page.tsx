"use client";

import { FileDown, Users, Clock, CalendarX, TrendingUp } from "lucide-react";

// بيانات تجريبية لمحاكاة محتوى الجدول في الصورة
const salaryData = [
  { id: 3, name: "محمد أحمد", initial: "م", color: "bg-blue-600", dept: "الإدارة", morningLate: "—", earlyExit: "—", absence: "—", overtime: "1349 د", weekendOvertime: "—", totalDeduction: "—", totalOvertime: "1349 د" },
  { id: 664, name: "عبدالله سعيد", initial: "ع", color: "bg-blue-500", dept: "الإدارة", morningLate: "—", earlyExit: "210 د", absence: "—", overtime: "508 د", weekendOvertime: "—", totalDeduction: "210 د", totalOvertime: "508 د" },
  { id: 701, name: "سلطان خالد", initial: "س", color: "bg-blue-400", dept: "الإدارة", morningLate: "129 د", earlyExit: "—", absence: "18 يوم", overtime: "30 د", weekendOvertime: "—", totalDeduction: "129 د", totalOvertime: "30 د" },
  { id: 21, name: "فهد العتيبي", initial: "ف", color: "bg-blue-600", dept: "قسم الخدمات والصيانة", morningLate: "—", earlyExit: "5 د", absence: "—", overtime: "45 د", weekendOvertime: "—", totalDeduction: "5 د", totalOvertime: "45 د" },
  { id: 35, name: "ناصر القحطاني", initial: "ن", color: "bg-blue-500", dept: "قسم الخدمات والصيانة", morningLate: "—", earlyExit: "5 د", absence: "—", overtime: "1342 د", weekendOvertime: "—", totalDeduction: "5 د", totalOvertime: "1342 د" },
  { id: 114, name: "يوسف حسن", initial: "ي", color: "bg-blue-400", dept: "قسم الخدمات والصيانة", morningLate: "—", earlyExit: "165 د", absence: "—", overtime: "30 د", weekendOvertime: "—", totalDeduction: "165 د", totalOvertime: "30 د" },
  { id: 288, name: "عمر الشهري", initial: "ع", color: "bg-blue-600", dept: "قسم الخدمات والصيانة", morningLate: "10 د", earlyExit: "—", absence: "1 يوم", overtime: "1791 د", weekendOvertime: "535 د", totalDeduction: "10 د", totalOvertime: "2326 د" },
];

export default function SalariesPage() {
  return (
    <div className="p-8 bg-[#f9fafb] min-h-screen" dir="rtl">
      
      {/* الجزء العلوي - العنوان وزر التصدير */}
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

      {/* بطاقات الملخص العلوية */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* بطاقة الخصومات */}
        <div className="bg-white p-6 rounded-2xl border-r-4 border-orange-400 shadow-sm flex flex-col ">
          <p className="text-slate-500 text-xs mb-2">إجمالي الخصومات (تأخر + خروج مبكر)</p>
          <h3 className="text-3xl font-extrabold text-orange-500">3890 دقيقة</h3>
          <p className="text-[11px] text-slate-400 mt-1">65 ساعة تقريباً</p>
        </div>

        {/* بطاقة الإضافي */}
        <div className="bg-white p-6 rounded-2xl border-r-4 border-green-500 shadow-sm flex flex-col ">
          <p className="text-slate-500 text-xs mb-2">إجمالي الوقت الإضافي</p>
          <h3 className="text-3xl font-extrabold text-green-600">28055 دقيقة</h3>
          <p className="text-[11px] text-slate-400 mt-1">468 ساعة تقريباً</p>
        </div>

        {/* بطاقة الغياب */}
        <div className="bg-white p-6 rounded-2xl border-r-4 border-red-500 shadow-sm flex flex-col ">
          <p className="text-slate-500 text-xs mb-2">إجمالي أيام الغياب</p>
          <h3 className="text-3xl font-extrabold text-red-600">66 يوم</h3>
        </div>
      </div>

      {/* جدول كشف الرواتب */}
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
            {salaryData.map((emp) => (
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