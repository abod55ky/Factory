"use client";

import { useState } from "react";
import { 
  Save, Building2, Users, Fingerprint, 
  Bell, ShieldCheck, Box, Server 
} from "lucide-react";

export default function SettingsPage() {
  // حالة التبويب النشط
  const [activeTab, setActiveTab] = useState("hr");

  // التبويبات المتاحة
  const tabs = [
    { id: "general", name: "إعدادات عامة", icon: Building2 },
    { id: "hr", name: "قواعد الرواتب والحضور", icon: Users },
    { id: "devices", name: "أجهزة البصمة والربط", icon: Fingerprint },
    { id: "inventory", name: "المخزون والتنبيهات", icon: Box },
    { id: "security", name: "الأمان والصلاحيات", icon: ShieldCheck },
  ];

  return (
    <div className="p-8 bg-[#f9fafb] min-h-screen" dir="rtl">
      
      {/* الهيدر وزر الحفظ العام */}
      <header className="flex justify-between items-start mb-8">
        <div className="text-right">
          <h1 className="text-2xl font-bold text-slate-800">الإعدادات</h1>
          <p className="text-slate-500 text-sm mt-1">إعدادات النظام، قواعد المحاسبة، وتفضيلات المعمل</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition-all shadow-md active:scale-95">
          <Save size={18} />
          حفظ التعديلات
        </button>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* القائمة الجانبية للإعدادات */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 flex flex-col gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 w-full text-right px-4 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? "bg-blue-50 text-blue-700 font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                }`}
              >
                <tab.icon size={18} className={activeTab === tab.id ? "text-blue-600" : "text-slate-400"} />
                <span className="text-sm">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* محتوى الإعدادات */}
        <div className="flex-1">
          
          {/* --- قسم الموارد البشرية والرواتب (الذي طلبته في الصورة) --- */}
          {activeTab === "hr" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* بطاقة قواعد التأخير (من الصورة) */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <ClockIcon className="text-orange-500" />
                  قواعد التأخير والانصراف
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">مدة السماح (بالدقائق)</label>
                    <input 
                      type="number" 
                      defaultValue="5"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">الدقائق المسموح بها بعد بدء الدوام دون خصم.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">نسبة خصم التأخير</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        defaultValue="100"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">%</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">100% تعني خصم الدقيقة بدقيقة من الراتب.</p>
                  </div>
                </div>
              </div>

              {/* بطاقة إضافية: قواعد العمل الإضافي */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <CalculatorIcon className="text-green-500" />
                  حساب الأجر الإضافي
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">مُعامل الإضافي (الأيام العادية)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      defaultValue="1.5"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">تحسب الساعة بساعة ونصف.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">مُعامل الإضافي (العطل الرسمية)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      defaultValue="2.0"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">تحسب الساعة بساعتين.</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* --- قسم أجهزة البصمة (الذي طلبته في الصورة) --- */}
          {activeTab === "devices" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Server className="text-blue-500" />
                  إعدادات جهاز البصمة الأساسي
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">عنوان IP للجهاز</label>
                    <input 
                      type="text" 
                      defaultValue="192.168.1.100"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-left dir-ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">منفذ الاتصال (Port)</label>
                    <input 
                      type="text" 
                      defaultValue="4370"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-left dir-ltr"
                    />
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">المزامنة التلقائية</h4>
                      <p className="text-xs text-slate-500 mt-1">سحب سجلات الحضور تلقائياً من الجهاز كل ساعة.</p>
                    </div>
                    {/* Toggle Button (UI only) */}
                    <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer shadow-inner">
                      <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 shadow-sm"></div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* --- قسم الإعدادات العامة (Placeholder للتبويبات الأخرى) --- */}
          {activeTab === "general" && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-lg font-bold text-slate-800 mb-6">بيانات المنشأة</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">اسم المعمل / المنشأة</label>
                  <input type="text" defaultValue="مصنع الأفق الحديث" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">العملة الافتراضية</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>ريال سعودي (ر.س)</option>
                    <option>دولار أمريكي ($)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* بقية التبويبات يمكن تعبئتها بنفس الطريقة... */}
          {(activeTab === "inventory" || activeTab === "security") && (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 flex flex-col items-center justify-center text-center animate-in fade-in">
              <Bell size={40} className="text-slate-300 mb-4" />
              <h3 className="text-slate-700 font-bold mb-1">هذا القسم قيد التطوير</h3>
              <p className="text-slate-400 text-xs">يمكنك إضافة إعدادات التنبيهات والصلاحيات هنا لاحقاً.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// أيقونات مساعدة بسيطة للتنسيق
function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}
function CalculatorIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>
}