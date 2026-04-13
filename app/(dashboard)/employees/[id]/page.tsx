// app/(dashboard)/employees/[id]/page.tsx
"use client";

import { ChevronLeft, Phone, CreditCard, Flag, Wallet, Clock, AlertTriangle, CalendarCheck } from "lucide-react";
import Link from "next/link";
// import { useEmployeeDetails } from "@/hooks/useEmployeeDetails"; // ستحتاج لإنشاء هذا الـ Hook لاحقاً

export default function EmployeeProfilePage({ params }: { params: { id: string } }) {
  // بيانات وهمية مؤقتة لأغراض التصميم (Mock Data)
  const employee = {
    name: "محمود إسماعيل",
    employeeId: params.id,
    mobile: "01234567890",
    nationalId: "29905141234567",
    department: "الإنتاج",
    totalDues: "12,000",
    currency: "ل.س",
    salaryBreakdown: {
      base: "10,000",
      overtime: "2,500",
      bonuses: "500",
      deductions: "1,000",
      advances: "0"
    },
    attendanceSummary: {
      daysAttended: 24,
      lateMinutes: 45,
      overtimeMinutes: 120,
      absentDays: 2
    }
  };

  return (
    <div className="p-6 md:p-8 font-sans bg-slate-50 min-h-screen" dir="rtl">
      
      {/* مسار التنقل (Breadcrumbs) المتطابق مع الصورة */}
      <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-6">
        <Link href="/employees" className="hover:text-slate-700">إدارة الموارد البشرية</Link>
        <ChevronLeft size={14} />
        <Link href="/employees" className="hover:text-slate-700">قائمة الموظفين</Link>
        <ChevronLeft size={14} />
        <span className="text-slate-800">بروفايل الموظف</span>
        
      </nav>

      {/* البطاقة الرئيسية العلوية (كما في الصورة المرفقة) */}
      <div className="bg-white rounded-b-4xl shadow-sm border border-slate-100 p-8 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          
          {/* معلومات الهوية */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600">
              <Flag size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800">{employee.name}</h1>
              <span className="text-sm font-bold text-teal-600">#{employee.employeeId}</span>
            </div>
          </div>

          {/* معلومات الاتصال */}
          <div className="flex gap-8 text-slate-500 text-sm font-bold">
            <div className="flex items-center gap-2">
              <span dir="ltr">{employee.mobile}</span>
              <Phone size={18} className="text-blue-500" />
            </div>
            <div className="flex items-center gap-2">
              <span>{employee.nationalId}</span>
              <CreditCard size={18} className="text-blue-500" />
            </div>
          </div>
        </div>

        {/* المربع الكبير للمستحقات (كما في منتصف الصورة) */}
        <div className="mt-8 bg-teal-50/50 rounded-3xl p-8 text-center border border-teal-100">
          <p className="text-teal-700 font-bold mb-2">مستحقات الموظف الحالية</p>
          <div className="flex justify-center items-baseline gap-2">
            <h2 className="text-5xl font-black text-teal-600">{employee.totalDues}</h2>
            <span className="text-teal-700 font-bold">{employee.currency}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* قسم تفاصيل الراتب */}
        <div className="bg-white rounded-4xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <Wallet className="text-blue-500" size={20} />
            <h3 className="text-lg font-black text-slate-800">تفاصيل الراتب</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-xs font-bold text-slate-500 mb-1">الراتب الأساسي</p>
              <p className="text-lg font-black text-slate-800">{employee.salaryBreakdown.base}</p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
              <p className="text-xs font-bold text-emerald-600 mb-1">العمل الإضافي</p>
              <p className="text-lg font-black text-emerald-700">+{employee.salaryBreakdown.overtime}</p>
            </div>
            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
              <p className="text-xs font-bold text-rose-600 mb-1">الخصومات</p>
              <p className="text-lg font-black text-rose-700">-{employee.salaryBreakdown.deductions}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
              <p className="text-xs font-bold text-orange-600 mb-1">السلف المسحوبة</p>
              <p className="text-lg font-black text-orange-700">{employee.salaryBreakdown.advances}</p>
            </div>
          </div>
        </div>

        {/* قسم تفاصيل الدوام */}
        <div className="bg-white rounded-4xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <Clock className="text-indigo-500" size={20} />
            <h3 className="text-lg font-black text-slate-800">سجل الدوام (الشهر الحالي)</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-indigo-50 flex items-center gap-4 p-4 rounded-2xl border border-indigo-100">
              <CalendarCheck className="text-indigo-500" size={24} />
              <div>
                <p className="text-xs font-bold text-indigo-600 mb-0.5">أيام الحضور</p>
                <p className="text-xl font-black text-indigo-900">{employee.attendanceSummary.daysAttended} يوم</p>
              </div>
            </div>
            <div className="bg-orange-50 flex items-center gap-4 p-4 rounded-2xl border border-orange-100">
              <AlertTriangle className="text-orange-500" size={24} />
              <div>
                <p className="text-xs font-bold text-orange-600 mb-0.5">دقائق التأخير</p>
                <p className="text-xl font-black text-orange-900">{employee.attendanceSummary.lateMinutes} دقيقة</p>
              </div>
            </div>
            <div className="bg-emerald-50 flex items-center gap-4 p-4 rounded-2xl border border-emerald-100">
              <Clock className="text-emerald-500" size={24} />
              <div>
                <p className="text-xs font-bold text-emerald-600 mb-0.5">دقائق إضافية</p>
                <p className="text-xl font-black text-emerald-900">{employee.attendanceSummary.overtimeMinutes} دقيقة</p>
              </div>
            </div>
            <div className="bg-rose-50 flex items-center gap-4 p-4 rounded-2xl border border-rose-100">
              <CalendarCheck className="text-rose-500" size={24} />
              <div>
                <p className="text-xs font-bold text-rose-600 mb-0.5">أيام الغياب</p>
                <p className="text-xl font-black text-rose-900">{employee.attendanceSummary.absentDays} أيام</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}