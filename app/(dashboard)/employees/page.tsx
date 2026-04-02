"use client";

import { Plus, Search, Edit2, Trash2, MoreVertical } from "lucide-react";

// بيانات تجريبية (Mock Data) لتعبئة الجدول
const employees = [
  { id: "E001", name: "أحمد محمد", role: "مدير مبيعات", rate: "45 ر.س", shift: "09:00 - 17:00", phone: "0501234567", initial: "أ", color: "bg-blue-500" },
  { id: "E002", name: "فاطمة علي", role: "محاسبة", rate: "40 ر.س", shift: "09:00 - 17:00", phone: "0507654321", initial: "ف", color: "bg-pink-500" },
  { id: "E003", name: "خالد سعيد", role: "مسؤول مخزن", rate: "35 ر.س", shift: "08:00 - 16:00", phone: "0509876543", initial: "خ", color: "bg-orange-500" },
  { id: "E004", name: "نورة حسن", role: "مصممة", rate: "50 ر.س", shift: "10:00 - 18:00", phone: "0503456789", initial: "ن", color: "bg-purple-500" },
  { id: "E005", name: "سعد العتيبي", role: "مندوب مبيعات", rate: "30 ر.س", shift: "09:00 - 17:00", phone: "0502345678", initial: "س", color: "bg-green-500" },
  { id: "E006", name: "ريم القحطاني", role: "مسؤولة موارد بشرية", rate: "42 ر.س", shift: "09:00 - 17:00", phone: "0508765432", initial: "ر", color: "bg-yellow-500" },
];

export default function EmployeesPage() {
  return (
    <div className="p-8 min-h-screen bg-[#f9fafb]">
      {/* الجزء العلوي (Header) */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">إدارة الموظفين</h1>
          <p className="text-slate-500 text-sm">{employees.length} موظف مسجل</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all shadow-md active:scale-95">
          <Plus size={20} />
          إضافة موظف
        </button>
      </header>

      {/* شريط البحث والفلترة */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-6 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="بحث بالاسم أو المنصب..." 
            className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* الجدول */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="p-4 text-sm font-semibold text-slate-600">الرقم</th>
              <th className="p-4 text-sm font-semibold text-slate-600">الاسم</th>
              <th className="p-4 text-sm font-semibold text-slate-600">المنصب</th>
              <th className="p-4 text-sm font-semibold text-slate-600">الأجر/ساعة</th>
              <th className="p-4 text-sm font-semibold text-slate-600 text-center">الدوام</th>
              <th className="p-4 text-sm font-semibold text-slate-600">الهاتف</th>
              <th className="p-4 text-sm font-semibold text-slate-600 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="p-4 text-sm text-slate-500 font-mono">{emp.id}</td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${emp.color} text-white flex items-center justify-center text-xs font-bold shadow-sm`}>
                      {emp.initial}
                    </div>
                    <span className="font-semibold text-slate-700">{emp.name}</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-slate-600">{emp.role}</td>
                <td className="p-4 text-sm">
                  <span className="bg-slate-100 px-2 py-1 rounded text-slate-700 font-bold tracking-tighter">
                    {emp.rate}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-600 text-center">
                  <span className="inline-block dir-ltr font-mono">{emp.shift}</span>
                </td>
                <td className="p-4 text-sm text-slate-600">{emp.phone}</td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-1">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="تعديل">
                      <Edit2 size={16} />
                    </button>
                    <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="حذف">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}