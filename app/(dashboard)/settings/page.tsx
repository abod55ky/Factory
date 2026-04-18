"use client";

import { useState } from "react";
import { 
  Save, Building2, Users, Fingerprint, 
  Bell, ShieldCheck, Box, Server, Settings
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
    <div className="relative z-10 w-full max-w-7xl min-h-[85vh] mx-auto bg-white/70 backdrop-blur-3xl rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border-2 border-[#E7C873]/80 flex flex-col overflow-hidden" dir="rtl">
        
        {/* المحتوى الداخلي */}
        <div className="p-6 md:p-10 h-full overflow-y-auto custom-scrollbar">
          
          {/* الهيدر وزر الحفظ العام */}
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-black/5 pb-8 relative">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-gradient-to-br from-[#00bba7] to-[#008275] rounded-2xl shadow-lg shadow-[#00bba7]/20 border border-[#00bba7]/20">
                  <Settings size={24} className="text-white animate-[spin_4s_linear_infinite]" />
                </div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">الإعدادات</h1>
              </div>
              <p className="text-slate-500 text-sm font-medium pr-14 mt-1">إعدادات النظام، قواعد المحاسبة، وتفضيلات المعمل</p>
            </div>

            <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00bba7] to-[#008275] px-6 py-3 text-sm font-bold text-white shadow-[0_10px_20px_rgba(0,187,167,0.3)] hover:from-[#00a392] hover:to-[#006e63] active:scale-95 transition-all border border-[#00bba7]/50 group w-full md:w-auto justify-center">
              <Save size={18} className="group-hover:-translate-y-1 transition-transform" />
              حفظ التعديلات
            </button>
          </header>

          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* القائمة الجانبية للإعدادات (Tabs) */}
            <div className="w-full lg:w-72 shrink-0">
              <div className="bg-white/80 backdrop-blur-md rounded-[2rem] border border-white/80 shadow-[0_15px_30px_rgba(0,0,0,0.04)] p-4 flex flex-col gap-2">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-3 w-full text-right px-4 py-3.5 rounded-2xl transition-all group ${
                        isActive
                          ? "bg-gradient-to-l from-[#00bba7]/10 to-transparent border border-[#00bba7]/20 shadow-sm"
                          : "hover:bg-white/50 border border-transparent"
                      }`}
                    >
                      <div className={`p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-[#00bba7] text-white shadow-md' : 'bg-slate-50 text-slate-400 group-hover:bg-[#00bba7]/10 group-hover:text-[#00bba7]'}`}>
                        <tab.icon size={18} className={isActive ? "animate-pulse" : "group-hover:scale-110 transition-transform"} />
                      </div>
                      <span className={`text-sm ${isActive ? 'font-bold text-[#00bba7]' : 'font-medium text-slate-600 group-hover:text-slate-900'}`}>
                        {tab.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* محتوى الإعدادات */}
            <div className="flex-1">
              
              {/* --- قسم الموارد البشرية والرواتب --- */}
              {activeTab === "hr" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  
                  {/* بطاقة قواعد التأخير */}
                  <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-white/80 shadow-[0_15px_30px_rgba(0,0,0,0.04)] p-8 group">
                    <h2 className="text-xl font-extrabold text-slate-800 mb-8 flex items-center gap-3 border-b border-slate-100 pb-4">
                      <div className="p-2.5 bg-orange-50 rounded-xl border border-orange-100">
                        <ClockIcon className="text-orange-500 group-hover:animate-spin-slow" />
                      </div>
                      قواعد التأخير والانصراف
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3">مدة السماح (بالدقائق)</label>
                        <input 
                          type="number" 
                          defaultValue="5"
                          className="w-full bg-white/50 backdrop-blur-sm border border-slate-200 rounded-2xl px-5 py-3 text-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00bba7]/40 focus:border-[#00bba7] font-mono shadow-inner transition-all"
                        />
                        <p className="text-[11px] font-bold text-slate-400 mt-2 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span> الدقائق المسموح بها بعد بدء الدوام دون خصم.
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3">نسبة خصم التأخير</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            defaultValue="100"
                            className="w-full bg-white/50 backdrop-blur-sm border border-slate-200 rounded-2xl px-5 py-3 text-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00bba7]/40 focus:border-[#00bba7] font-mono shadow-inner transition-all pl-12"
                          />
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                            %
                          </div>
                        </div>
                        <p className="text-[11px] font-bold text-slate-400 mt-2 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span> 100% تعني خصم الدقيقة بدقيقة من الراتب.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* بطاقة حساب الأجر الإضافي */}
                  <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-white/80 shadow-[0_15px_30px_rgba(0,0,0,0.04)] p-8 group">
                    <h2 className="text-xl font-extrabold text-slate-800 mb-8 flex items-center gap-3 border-b border-slate-100 pb-4">
                      <div className="p-2.5 bg-[#00bba7]/10 rounded-xl border border-[#00bba7]/20">
                        <CalculatorIcon className="text-[#00bba7] group-hover:animate-pulse" />
                      </div>
                      حساب الأجر الإضافي
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3">مُعامل الإضافي (الأيام العادية)</label>
                        <input 
                          type="number" 
                          step="0.1"
                          defaultValue="1.5"
                          className="w-full bg-white/50 backdrop-blur-sm border border-slate-200 rounded-2xl px-5 py-3 text-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00bba7]/40 focus:border-[#00bba7] font-mono shadow-inner transition-all"
                        />
                        <p className="text-[11px] font-bold text-slate-400 mt-2 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00bba7]"></span> تحسب الساعة بساعة ونصف.
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3">مُعامل الإضافي (العطل الرسمية)</label>
                        <input 
                          type="number" 
                          step="0.1"
                          defaultValue="2.0"
                          className="w-full bg-white/50 backdrop-blur-sm border border-slate-200 rounded-2xl px-5 py-3 text-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00bba7]/40 focus:border-[#00bba7] font-mono shadow-inner transition-all"
                        />
                        <p className="text-[11px] font-bold text-slate-400 mt-2 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E7C873]"></span> تحسب الساعة بساعتين.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* --- قسم أجهزة البصمة --- */}
              {activeTab === "devices" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  
                  <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-white/80 shadow-[0_15px_30px_rgba(0,0,0,0.04)] p-8 group">
                    <h2 className="text-xl font-extrabold text-slate-800 mb-8 flex items-center gap-3 border-b border-slate-100 pb-4">
                      <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                        <Server className="text-blue-500 group-hover:animate-pulse" />
                      </div>
                      إعدادات جهاز البصمة الأساسي
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3">عنوان IP للجهاز</label>
                        <input 
                          type="text" 
                          defaultValue="192.168.1.100"
                          className="w-full bg-white/50 backdrop-blur-sm border border-slate-200 rounded-2xl px-5 py-3 text-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00bba7]/40 focus:border-[#00bba7] font-mono text-left dir-ltr shadow-inner transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3">منفذ الاتصال (Port)</label>
                        <input 
                          type="text" 
                          defaultValue="4370"
                          className="w-full bg-white/50 backdrop-blur-sm border border-slate-200 rounded-2xl px-5 py-3 text-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00bba7]/40 focus:border-[#00bba7] font-mono text-left dir-ltr shadow-inner transition-all"
                        />
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100">
                      <div className="flex items-center justify-between bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-800">المزامنة التلقائية</h4>
                          <p className="text-[11px] font-bold text-slate-500 mt-1">سحب سجلات الحضور تلقائياً من الجهاز كل ساعة.</p>
                        </div>
                        {/* Toggle Button UI */}
                        <div className="w-14 h-7 bg-gradient-to-r from-[#00bba7] to-[#008275] rounded-full relative cursor-pointer shadow-inner border border-[#00bba7]/20">
                          <div className="w-5 h-5 bg-white rounded-full absolute top-1 left-1 shadow-md transition-transform translate-x-7"></div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* --- قسم الإعدادات العامة --- */}
              {activeTab === "general" && (
                <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-white/80 shadow-[0_15px_30px_rgba(0,0,0,0.04)] p-8 group animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-xl font-extrabold text-slate-800 mb-8 flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="p-2.5 bg-[#E7C873]/20 rounded-xl border border-[#E7C873]/30">
                      <Building2 className="text-[#b88710] group-hover:animate-pulse" />
                    </div>
                    بيانات المنشأة
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3">اسم المعمل / المنشأة</label>
                      <input 
                        type="text" 
                        defaultValue="مصنع الأفق الحديث" 
                        className="w-full bg-white/50 backdrop-blur-sm border border-slate-200 rounded-2xl px-5 py-3 text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00bba7]/40 focus:border-[#00bba7] shadow-inner transition-all" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3">العملة الافتراضية</label>
                      <select className="w-full bg-white/50 backdrop-blur-sm border border-slate-200 rounded-2xl px-5 py-3 text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00bba7]/40 focus:border-[#00bba7] shadow-inner transition-all appearance-none cursor-pointer">
                        <option>ليرة سورية (ل.س)</option>
                        <option>دولار أمريكي ($)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* أقسام قيد التطوير */}
              {(activeTab === "inventory" || activeTab === "security") && (
                <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] border-2 border-dashed border-white/80 p-16 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500 shadow-sm">
                  <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                    <Bell size={40} className="text-slate-400 animate-pulse" />
                  </div>
                  <h3 className="text-xl text-slate-700 font-black mb-2">هذا القسم قيد التطوير</h3>
                  <p className="text-slate-500 text-sm font-bold">يمكنك إضافة إعدادات التنبيهات والصلاحيات هنا لاحقاً.</p>
                </div>
              )}

            </div>
          </div>
        </div>
    </div>
  );
}

// الأيقونات بصيغة SVG متوافقة
function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}
function CalculatorIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>
}