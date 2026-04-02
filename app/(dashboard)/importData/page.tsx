"use client";

import { Upload, Users, Clock, Package, CheckCircle2 } from "lucide-react";

const importSections = [
  {
    title: "بيانات الموظفين",
    description: "ملف Excel يحتوي الاسم، المنصب، الأجر، أوقات الدوام",
    icon: Users,
    iconColor: "text-slate-700",
    bgColor: "bg-slate-100",
  },
  {
    title: "سجلات الحضور",
    description: "ملف CSV/Excel بتوقيتات الدخول والخروج من جهاز البصمة",
    icon: Clock,
    iconColor: "text-red-500",
    bgColor: "bg-red-50",
  },
  {
    title: "جرد المخزون",
    description: "ملف Excel بأسماء المنتجات والكميات والأسعار",
    icon: Package,
    iconColor: "text-orange-600",
    bgColor: "bg-orange-50",
  },
];

const instructions = [
  "تأكد أن الملف بصيغة .xlsx أو .csv",
  "يجب أن يحتوي السطر الأول على عناوين الأعمدة",
  "سيتم عرض البيانات للمراجعة قبل الحفظ",
  "يمكنك تعديل أي سجل بعد الاستيراد",
];

export default function ImportPage() {
  return (
    <div className="p-8 bg-[#f9fafb] min-h-screen" dir="rtl">
      
      {/* الهيدر */}
      <header className="mb-10 text-center">
        <h1 className="text-2xl font-bold text-slate-800">استيراد البيانات</h1>
        <p className="text-slate-500 text-sm mt-2">رفع ملفات Excel أو CSV لتحديث البيانات</p>
      </header>

      {/* بطاقات الرفع */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 ">
        {importSections.map((section, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center ">
            {/* الأيقونة العلوية */}
            <div className={`w-12 h-12 ${section.bgColor} rounded-xl flex items-center justify-center mb-4`}>
              <section.icon size={24} className={section.iconColor} />
            </div>
            
            <h3 className="font-bold text-slate-800 mb-1">{section.title}</h3>
            <p className="text-[11px] text-slate-400 mb-6 leading-relaxed px-4">
              {section.description}
            </p>

            {/* منطقة السحب والإفلات */}
            <div className="w-full border-2 border-dashed border-slate-100 rounded-2xl p-8 bg-slate-50/50 group cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all">
              <div className="flex flex-col items-center gap-2">
                <Upload size={24} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                <p className="text-xs font-bold text-slate-500">اسحب الملف هنا أو انقر للرفع</p>
                <p className="text-[10px] text-slate-300">xlsx, .csv.</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* قسم التعليمات */}
      <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-6 text-right">تعليمات الاستيراد</h2>
        <div className="grid grid-cols-1 gap-4">
          {instructions.map((text, index) => (
              <div key={index} className="flex items-center gap-3 justify-start   ">
                <CheckCircle2 size={18} className="text-emerald-500" />
              <span className="text-xs text-slate-600 font-medium">{text}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}