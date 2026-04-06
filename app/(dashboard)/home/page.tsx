// "use client";

// import { Users, Clock, Timer, Box, AlertTriangle, Briefcase } from "lucide-react";

// // بيانات تجريبية لمحاكاة الصورة
// const stats = [
//   { title: "الموظفين النشطين", value: "30", subValue: "من أصل 33", icon: Users, color: "text-blue-600", bgColor: "bg-blue-50" },
//   { title: "إجمالي دقائق التأخير", value: "1,467", subValue: "تأخر صباحي", icon: Clock, color: "text-orange-500", bgColor: "bg-orange-50" },
//   { title: "إجمالي الإضافي", value: "388 ساعة", subValue: "23,254 دقيقة", icon: Timer, color: "text-green-600", bgColor: "bg-green-50" },
//   { title: "أصناف المخزون", value: "695", subValue: "8 منتجات", icon: Box, color: "text-sky-500", bgColor: "bg-sky-50" },
// ];

// const lateEmployees = [
//   { name: "عبدالرحمن الأحمدي", dept: "امبلاج", late: "334 د", earlyExit: "532 د", initial: "ع", color: "bg-blue-500" },
//   { name: "وليد المحمدي", dept: "امبلاج", late: "219 د", earlyExit: "359 د", initial: "و", color: "bg-blue-400" },
//   { name: "خالد الدوسري", dept: "قسم القص", late: "34 د", earlyExit: "378 د", initial: "خ", color: "bg-blue-600" },
//   { name: "راشد الغامدي", dept: "قسم القص", late: "174 د", earlyExit: "165 د", initial: "ر", color: "bg-blue-700" },
// ];

// const departmentSummary = [
//   { name: "الإدارة", count: "3 موظف", late: "129 د", overtime: "31 س", color: "bg-blue-50 text-blue-600" },
//   { name: "قسم الخدمات والصيانة", count: "5 موظف", late: "10 د", overtime: "75 س", color: "bg-green-50 text-green-600" },
//   { name: "قسم القص", count: "7 موظف", late: "584 د", overtime: "129 س", color: "bg-orange-50 text-orange-600" },
//   { name: "مواصلات", count: "3 موظف", late: "0 د", overtime: "2 س", color: "bg-sky-50 text-sky-600" },
// ];

// export default function DashboardPage() {
//   return (
//     <div className="p-8 bg-[#f9fafb] min-h-screen">
//       {/* الهيدر */}
//       <header className="mb-8 text-right">
//         <h1 className="text-2xl font-bold text-slate-800">لوحة التحكم</h1>
//         <p className="text-slate-500 text-sm">نظرة عامة على النظام – بيانات الشهر</p>
//       </header>

//       {/* بطاقات الإحصائيات الأربعة */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         {stats.map((stat, index) => (
//           <div key={index} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
//             <div className="text-right">
//               <p className="text-slate-500 text-xs mb-1">{stat.title}</p>
//               <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
//               <p className="text-[10px] text-slate-400 mt-1">{stat.subValue}</p>
//             </div>
//             <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
//               <stat.icon size={24} className={stat.color} />
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         {/* قسم ملخص الأقسام */}
//         <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
//           <div className="flex items-center justify-between mb-6">
//              <h2 className="text-lg font-bold text-slate-800">ملخص الأقسام</h2>
//              <Briefcase className="text-slate-300" size={20} />
//           </div>
//           <div className="space-y-5">
//             {departmentSummary.map((dept, index) => (
//               <div key={index} className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 last:pb-0">
//                 <div className="flex flex-col ">
//                    <div className="flex items-center gap-3">
//                       <span className={`px-5 py-2 rounded-xl text-[12px] font-bold ${dept.color}`}>{dept.name}</span>
//                       <span className="text-xs text-slate-400">{dept.count}</span>
//                    </div>
//                    <div className="flex gap-4 mt-1">
//                       <span className="text-[10px] text-orange-500">تأخير: {dept.late}</span>
//                       <span className="text-[10px] text-green-600 font-bold">إضافي: {dept.overtime}</span>
//                    </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* قسم أكثر الموظفين تأخراً */}
//         <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm text-right">
            
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-lg font-bold text-slate-800">أكثر الموظفين تأخراً</h2>
//             <AlertTriangle className="text-orange-400" size={20} />
//           </div>
//           <div className="space-y-5">
//             {lateEmployees.map((emp, index) => (
//               <div key={index} className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 last:pb-0">
//                 <div className="flex items-center gap-3">
//                   <div className={`w-9 h-9 rounded-full ${emp.color} text-white flex items-center justify-center text-xs font-bold`}>
//                     {emp.initial}
//                   </div>
//                   <div className="text-right">
//                     <p className="text-sm font-bold text-slate-700">{emp.name}</p>
//                     <p className="text-[10px] text-slate-400">{emp.dept}</p>
//                   </div>
//                 </div>
//                 <div className="text-left">
//                   <p className="text-[10px] text-orange-500">تأخر: {emp.late}</p>
//                   <p className="text-[10px] text-red-500 font-medium">خروج مبكر: {emp.earlyExit}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import { Users, Clock, Timer, Box, AlertTriangle } from "lucide-react";
import { useDashboard } from '@/hooks/useDashboard';

export default function DashboardPage() {
  const { employeesStats, attendanceStats, inventoryStats, isLoading } = useDashboard();

  // Build minimal stats using backend responses with safe fallbacks
  const stats = [
    { title: 'الموظفين النشطين', value: employeesStats?.active ?? '—', subValue: `من أصل ${employeesStats?.total ?? '—'}`, icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { title: 'إجمالي دقائق التأخير', value: attendanceStats?.statistics?.totalLateArrivals ?? '—', subValue: 'تأخر صباحي', icon: Clock, color: 'text-orange-500', bgColor: 'bg-orange-50' },
    { title: 'إجمالي الإضافي', value: inventoryStats?.totalQuantity ?? '—', subValue: 'كمية إجمالية', icon: Timer, color: 'text-green-600', bgColor: 'bg-green-50' },
    { title: 'أصناف المخزون', value: inventoryStats?.totalProducts ?? '—', subValue: 'منتجات', icon: Box, color: 'text-sky-500', bgColor: 'bg-sky-50' },
  ];

  const departmentSummary = Object.entries(employeesStats?.byDepartment || {}).map(([name, count]) => ({ name, count: `${count} موظف`, late: '—', overtime: '—', color: 'bg-blue-50 text-blue-600' }));

  // fallback mock for lateEmployees if attendanceStats doesn't provide a list
  const lateEmployees = (attendanceStats && (attendanceStats as any).topLateEmployees) || [
    { name: '—', dept: '—', late: '—', earlyExit: '—', initial: '-', color: 'bg-blue-500' },
  ];

  if (isLoading) {
    return (
      <div className="p-8">جاري تحميل بيانات اللوحة...</div>
    );
  }

  return (
    <div className="p-8 bg-[#f9fafb] min-h-screen" dir="rtl">
      <header className="mb-8 text-right">
        <h1 className="text-2xl font-bold text-slate-800">لوحة التحكم</h1>
        <p className="text-slate-500 text-sm mt-1">نظرة عامة على النظام – بيانات الشهر</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="text-right">
              <p className="text-slate-500 text-xs font-medium mb-1">{stat.title}</p>
              <h3 className="text-3xl font-extrabold text-slate-800">{stat.value}</h3>
              <p className="text-[11px] text-slate-400 mt-1">{stat.subValue}</p>
            </div>
            <div className={`w-14 h-14 rounded-2xl ${stat.bgColor} flex items-center justify-center`}>
              <stat.icon size={26} className={stat.color} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-2">
             <h2 className="text-lg font-bold text-slate-800">ملخص الأقسام</h2>
             <Users className="text-slate-400" size={20} />
          </div>

          <div className="flex flex-col">
            {departmentSummary.map((dept, index) => (
              <div key={index} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0 last:pb-0 first:pt-0">
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-1.5 rounded-xl text-[11px] font-bold ${dept.color}`}>
                    {dept.name}
                  </span>
                  <span className="text-xs text-slate-400">{dept.count}</span>
                </div>
                <div className="flex items-center gap-5">
                  {dept.late !== '0 د' && (
                    <span className="text-[11px] text-orange-500 font-medium">تأخير: {dept.late}</span>
                  )}
                  <span className="text-[11px] text-green-600 font-bold">إضافي: {dept.overtime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-2">
            <h2 className="text-lg font-bold text-slate-800">أكثر الموظفين تأخراً</h2>
            <AlertTriangle className="text-orange-400" size={20} />
          </div>

          <div className="flex flex-col">
            {lateEmployees.map((emp: any, index: number) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 last:pb-0 first:pt-0">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${emp.color || 'bg-blue-500'} text-white flex items-center justify-center text-sm font-bold shadow-sm`}>
                    {emp.initial || emp.name?.[0] || '-'}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-700">{emp.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{emp.dept}</p>
                  </div>
                </div>

                <div className="text-left flex flex-col gap-1">
                  {emp.late && (
                    <p className="text-[11px] text-orange-500 font-medium">تأخر: {emp.late}</p>
                  )}
                  {emp.earlyExit && (
                    <p className="text-[11px] text-red-500 font-medium">خروج مبكر: {emp.earlyExit}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}