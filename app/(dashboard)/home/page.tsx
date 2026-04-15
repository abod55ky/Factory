
// "use client";

// import { Users, Clock, Timer, Box, AlertTriangle } from "lucide-react";
// import { useDashboard } from '@/hooks/useDashboard';

// export default function DashboardPage() {
//   const { employeesStats, attendanceStats, inventoryStats, isLoading } = useDashboard();

//   // Build minimal stats using backend responses with safe fallbacks
//   const stats = [
//     { title: 'الموظفين النشطين', value: employeesStats?.active ?? '—', subValue: `من أصل ${employeesStats?.total ?? '—'}`, icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50' },
//     { title: 'إجمالي دقائق التأخير', value: attendanceStats?.statistics?.totalLateArrivals ?? '—', subValue: 'تأخر صباحي', icon: Clock, color: 'text-orange-500', bgColor: 'bg-orange-50' },
//     { title: 'إجمالي الإضافي', value: inventoryStats?.totalQuantity ?? '—', subValue: 'كمية إجمالية', icon: Timer, color: 'text-green-600', bgColor: 'bg-green-50' },
//     { title: 'أصناف المخزون', value: inventoryStats?.totalProducts ?? '—', subValue: 'منتجات', icon: Box, color: 'text-sky-500', bgColor: 'bg-sky-50' },
//   ];

//   const departmentSummary = Object.entries(employeesStats?.byDepartment || {}).map(([name, count]) => ({ name, count: `${count} موظف`, late: '—', overtime: '—', color: 'bg-blue-50 text-blue-600' }));

//   // fallback mock for lateEmployees if attendanceStats doesn't provide a list
//   const lateEmployees = (attendanceStats && 'topLateEmployees' in attendanceStats && attendanceStats.topLateEmployees) || [
//     { name: '—', dept: '—', late: '—', earlyExit: '—', initial: '-', color: 'bg-blue-500' },
//   ];

//   if (isLoading) {
//     return (
//       <div className="p-8">جاري تحميل بيانات اللوحة...</div>
//     );
//   }

//   return (
//     <div className="p-8 bg-[#f9fafb] min-h-screen" dir="rtl">
//       <header className="mb-8 text-right">
//         <h1 className="text-2xl font-bold text-slate-800">لوحة التحكم</h1>
//         <p className="text-slate-500 text-sm mt-1">نظرة عامة على النظام – بيانات الشهر</p>
//       </header>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         {stats.map((stat, index) => (
//           <div key={index} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
//             <div className="text-right">
//               <p className="text-slate-500 text-xs font-medium mb-1">{stat.title}</p>
//               <h3 className="text-3xl font-extrabold text-slate-800">{stat.value}</h3>
//               <p className="text-[11px] text-slate-400 mt-1">{stat.subValue}</p>
//             </div>
//             <div className={`w-14 h-14 rounded-2xl ${stat.bgColor} flex items-center justify-center`}>
//               <stat.icon size={26} className={stat.color} />
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
//           <div className="flex items-center justify-between mb-6 pb-2">
//              <h2 className="text-lg font-bold text-slate-800">ملخص الأقسام</h2>
//              <Users className="text-slate-400" size={20} />
//           </div>

//           <div className="flex flex-col">
//             {departmentSummary.map((dept, index) => (
//               <div key={index} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0 last:pb-0 first:pt-0">
//                 <div className="flex items-center gap-3">
//                   <span className={`px-4 py-1.5 rounded-xl text-[11px] font-bold ${dept.color}`}>
//                     {dept.name}
//                   </span>
//                   <span className="text-xs text-slate-400">{dept.count}</span>
//                 </div>
//                 <div className="flex items-center gap-5">
//                   {dept.late !== '0 د' && (
//                     <span className="text-[11px] text-orange-500 font-medium">تأخير: {dept.late}</span>
//                   )}
//                   <span className="text-[11px] text-green-600 font-bold">إضافي: {dept.overtime}</span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
//           <div className="flex items-center justify-between mb-6 pb-2">
//             <h2 className="text-lg font-bold text-slate-800">أكثر الموظفين تأخراً</h2>
//             <AlertTriangle className="text-orange-400" size={20} />
//           </div>

//           <div className="flex flex-col">
//             {lateEmployees.map((emp: { name: string; dept: string; late: string; earlyExit: string; initial: string; color: string }, index: number) => (
//               <div key={index} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 last:pb-0 first:pt-0">
//                 <div className="flex items-center gap-3">
//                   <div className={`w-10 h-10 rounded-full ${emp.color || 'bg-blue-500'} text-white flex items-center justify-center text-sm font-bold shadow-sm`}>
//                     {emp.initial || emp.name?.[0] || '-'}
//                   </div>
//                   <div className="text-right">
//                     <p className="text-sm font-bold text-slate-700">{emp.name}</p>
//                     <p className="text-[11px] text-slate-400 mt-0.5">{emp.dept}</p>
//                   </div>
//                 </div>

//                 <div className="text-left flex flex-col gap-1">
//                   {emp.late && (
//                     <p className="text-[11px] text-orange-500 font-medium">تأخر: {emp.late}</p>
//                   )}
//                   {emp.earlyExit && (
//                     <p className="text-[11px] text-red-500 font-medium">خروج مبكر: {emp.earlyExit}</p>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }

// app/(dashboard)/home/page.tsx
"use client";

import { useState } from 'react';
import { Users, Clock, Timer, Box, AlertTriangle, Bell, X, CheckCircle2 } from "lucide-react";
import { useDashboard } from '@/hooks/useDashboard';

// تعريف واجهة بيانات الموظف المتأخر لضمان أمان الكود (من الكود 1)
interface LateEmployee {
  name: string;
  dept: string;
  late: string;
  earlyExit?: string;
  initial?: string;
  color?: string;
}

export default function DashboardPage() {
  const { employeesStats, attendanceStats, inventoryStats, isLoading } = useDashboard();
  
  // إدارة حالة الإشعارات (من الكود 2)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'الموظف أحمد تأخر 15 دقيقة اليوم', type: 'warning', time: 'قبل 10 دقائق' },
    { id: 2, text: 'نقص حاد في مخزون القماش القطني', type: 'error', time: 'قبل ساعة' },
    { id: 3, text: 'تم إغلاق مسير رواتب الشهر الماضي بنجاح', type: 'success', time: 'قبل ساعتين' },
  ]);

  const dismissNotification = (id: number) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  // بناء الإحصائيات مع قيم افتراضية آمنة (من الكود 1)
  const stats = [
    { title: 'الموظفين النشطين', value: employeesStats?.active ?? '—', subValue: `من أصل ${employeesStats?.total ?? '—'}`, icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-100/50' },
    { title: 'إجمالي دقائق التأخير', value: attendanceStats?.statistics?.totalLateArrivals ?? '—', subValue: 'تأخر صباحي', icon: Clock, color: 'text-orange-500', bgColor: 'bg-orange-100/50' },
    { title: 'إجمالي الإضافي', value: inventoryStats?.totalQuantity ?? '—', subValue: 'كمية إجمالية', icon: Timer, color: 'text-emerald-600', bgColor: 'bg-emerald-100/50' },
    { title: 'أصناف المخزون', value: inventoryStats?.totalProducts ?? '—', subValue: 'منتجات', icon: Box, color: 'text-indigo-600', bgColor: 'bg-indigo-100/50' },
  ];

  const departmentSummary = Object.entries(employeesStats?.byDepartment || {}).map(([name, count]) => ({ 
    name, count: `${count} موظف`, late: '—', overtime: '—', color: 'bg-blue-50 text-blue-700 border border-blue-100' 
  }));

  // استخدام خاصية الـ Type Guard من الكود 1 لضمان استقرار البيانات
  const lateEmployees: LateEmployee[] = (attendanceStats && 'topLateEmployees' in attendanceStats) 
    ? (attendanceStats.topLateEmployees as LateEmployee[]) 
    : [{ name: '—', dept: '—', late: '—', earlyExit: '—', initial: '-', color: 'bg-slate-200 text-slate-500' }];

  if (isLoading) {
    return (
      <div className="p-8 h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold animate-pulse">جاري جلب بيانات النظام...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen" dir="rtl">
      
      {/* الترويسة العلوية (Header) */}
      <header className="mb-8 flex justify-between items-end relative">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            الرئيسية 
            <span className="text-slate-400 font-medium text-xl">/ إحصائيات عامة</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">نظرة عامة على أداء المعمل - اليوم</p>
        </div>

        {/* أيقونة الإشعارات الذكية */}
        <div className="relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-blue-600 hover:shadow-md transition-all active:scale-95"
          >
            <Bell size={22} />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white ring-2 ring-red-100">
                {notifications.length}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute left-0 mt-4 w-80 bg-white/95 backdrop-blur-lg border border-slate-100 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-slate-50/80 p-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-800">تنبيهات النظام</h3>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{notifications.length} جديد</span>
              </div>
              
              <div className="max-h-80 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center flex flex-col items-center">
                    <CheckCircle2 size={40} className="mb-3 text-emerald-500 opacity-30" />
                    <p className="text-sm text-slate-500 font-medium">كل شيء يسير على ما يرام!</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="p-4 border-b border-slate-50 hover:bg-blue-50/30 flex items-start gap-3 transition-colors group">
                        <div className={`mt-1 p-2 rounded-xl shrink-0 ${
                          notif.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                          notif.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                          <AlertTriangle size={14} />
                        </div>
                        <div className="flex-1">
                          <p className="text-[13px] text-slate-800 font-bold leading-tight">{notif.text}</p>
                          <p className="text-[10px] text-slate-400 mt-1.5 font-medium">{notif.time}</p>
                        </div>
                        <button onClick={() => dismissNotification(notif.id)} className="text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-all">
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* الحاوية الرئيسية الفخمة */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
        
        {/* شبكة الإحصائيات (Stats Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-3xl border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex items-center justify-between group cursor-default">
              <div className="text-right">
                <p className="text-slate-500 text-xs font-bold mb-2 uppercase tracking-wider">{stat.title}</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                <p className="text-[11px] font-semibold text-slate-400 mt-1">{stat.subValue}</p>
              </div>
              <div className={`w-16 h-16 rounded-2xl ${stat.bgColor} flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                <stat.icon size={28} className={stat.color} />
              </div>
            </div>
          ))}
        </div>

        {/* الأقسام والموظفين */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* ملخص الأقسام */}
          <div className="bg-slate-50/40 rounded-4xl p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
               <h2 className="text-lg font-black text-slate-800">كفاءة الأقسام</h2>
               <Users className="text-blue-500" size={20} />
            </div>

            <div className="flex flex-col gap-3">
              {departmentSummary.map((dept, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-blue-300 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-xl text-[11px] font-black ${dept.color}`}>
                      {dept.name}
                    </span>
                    <span className="text-xs font-bold text-slate-500">{dept.count}</span>
                  </div>
                  <div className="flex items-center gap-5">
                    {dept.late !== '0 د' && (
                      <span className="text-[11px] text-orange-600 font-bold">تأخير: {dept.late}</span>
                    )}
                    <span className="text-[11px] text-emerald-600 font-black">إضافي: {dept.overtime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* سجل التأخير */}
          <div className="bg-slate-50/40 rounded-4xl p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
              <h2 className="text-lg font-black text-slate-800">تنبيهات الحضور اليومية</h2>
              <AlertTriangle className="text-orange-500" size={20} />
            </div>

            <div className="flex flex-col gap-3">
              {lateEmployees.map((emp, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-rose-200 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-full ${emp.color || 'bg-slate-200'} text-white flex items-center justify-center text-sm font-black shadow-inner`}>
                      {emp.initial || emp.name?.[0] || '-'}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-800">{emp.name}</p>
                      <p className="text-[10px] font-bold text-slate-400">{emp.dept}</p>
                    </div>
                  </div>

                  <div className="text-left flex flex-col items-end gap-1.5">
                    {emp.late && emp.late !== '—' && (
                      <span className="text-[10px] text-orange-700 font-bold bg-orange-100/50 px-3 py-1 rounded-full">
                        تأخر: {emp.late}
                      </span>
                    )}
                    {emp.earlyExit && emp.earlyExit !== '—' && (
                      <span className="text-[10px] text-rose-700 font-bold bg-rose-100/50 px-3 py-1 rounded-full">
                        خروج مبكر: {emp.earlyExit}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}