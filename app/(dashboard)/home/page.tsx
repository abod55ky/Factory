
"use client";

import { 
  Users, Clock, Timer, AlertTriangle, 
  UserCheck, Wallet, UserX 
} from "lucide-react";
import { useDashboard } from '@/hooks/useDashboard';


interface LateEmployee {
  name: string;
  dept: string;
  late: string;
  earlyExit?: string;
  initial?: string;
  color?: string;
}

export default function DashboardPage() {
  const { employeesStats, attendanceStats, kpis, isLoading } = useDashboard();
  
  // بناء الإحصائيات الـ 6 المطلوبة
  const stats = [
    { title: 'عدد الموظفين', value: kpis.totalEmployees, subValue: 'إجمالي', icon: Users },
    { title: 'العمال النشطين', value: kpis.activeToday, subValue: 'سجلوا حضور اليوم', icon: UserCheck },
    { title: 'الرواتب المستحقة', value: kpis.totalDueSalaries.toLocaleString(), subValue: 'ل.س', icon: Wallet },
  { title: 'إجمالي التأخير', value: kpis.totalLateMinutesToday, subValue: 'دقيقة (اليوم)', icon: Clock },
    { title: 'إجمالي الإضافي', value: kpis.totalOvertimeMinutesToday, subValue: 'دقيقة (اليوم)', icon: Timer },
    { title: 'إجمالي الغياب', value: kpis.totalAbsentToday, subValue: 'موظف (اليوم)', icon: UserX },
  ];

  const departmentSummary = Object.entries(employeesStats?.byDepartment || {}).map(([name, count]) => ({ 
    name, count: `${count} موظف`, late: '—', overtime: '—', color: 'bg-blue-50 text-blue-700 border border-blue-100' 
  }));

  const lateEmployees: LateEmployee[] = (attendanceStats && 'topLateEmployees' in attendanceStats) 
    ? (attendanceStats.topLateEmployees as LateEmployee[]) 
    : [{ name: '—', dept: '—', late: '—', earlyExit: '—', initial: '-', color: 'bg-slate-200 text-slate-500' }];

  if (isLoading) {
    return (
      <div className="p-8 h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#00bba7] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold animate-pulse">جاري جلب بيانات النظام...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen" dir="rtl">
      
      {/* الترويسة العلوية - تم تنظيفها وإزالة الإشعارات لأنها أصبحت في الـ TopNavbar */}
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold text-[#00bba7]">
          الإحصائيات العامة
        </h1>
        <p className="text-slate-500 text-sm mt-2 font-medium">نظرة شاملة على أداء المعمل والموظفين لهذا اليوم</p>
      </header>

      {/* الحاوية الرئيسية */}
              {/* شبكة الإحصائيات (تعديل لـ 3 أعمدة مع تكبير المحتوى) */}
        {/* lg:grid-cols-3 تجبر الكود على وضع 3 مربعات فقط في السطر للشاشات الكبيرة */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="bg-white p-8 lg:p-10 rounded-4xl border border-slate-100 hover:border-[#00bba7]/40 hover:shadow-2xl hover:shadow-[#00bba7]/10 hover:-translate-y-2 transition-all duration-300 flex flex-col items-center justify-center gap-4 group cursor-default"
            >
              {/* السطر الأول: الأيقونة والعنوان (تم التكبير) */}
              <div className="flex items-center gap-3">
                <stat.icon size={36} className="text-[#E7C873] group-hover:scale-110 transition-transform duration-300" />
                <p className="text-[#E7C873] text-lg font-extrabold">{stat.title}</p>
              </div>
              
              {/* السطر الثاني: الرقم الكبير (تم تكبير الخط لـ text-5xl) */}
              <h3 className="text-5xl font-black text-[#00bba7] tracking-tight">
                {stat.value}
              </h3>
              
              {/* السطر الثالث: التفاصيل الصغيرة */}
              <p className="text-xs font-bold text-slate-400">
                {stat.subValue}
              </p>
            </div>
          ))}
        </div>
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
        


        {/* الأقسام والموظفين */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* ملخص الأقسام */}
          <div className="bg-slate-50/40 rounded-4xl p-6 border border-slate-100">
          <div className="bg-slate-50/40 rounded-4xl p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
               <h2 className="text-xl font-black text-[#00bba7]">كفاءة الأقسام</h2>
               <Users className="text-[#E7C873]" size={24} />
            </div>

            <div className="flex flex-col gap-3">
              {departmentSummary.map((dept, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-[#00bba7]/30 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-1.5 rounded-xl text-xs font-black ${dept.color}`}>
                      {dept.name}
                    </span>
                    <span className="text-sm font-bold text-slate-500">{dept.count}</span>
                  </div>
                  <div className="flex items-center gap-5">
                    {dept.late !== '0 د' && (
                      <span className="text-[11px] text-orange-600 font-bold bg-orange-50 px-2 py-1 rounded-md">تأخير: {dept.late}</span>
                    )}
                    <span className="text-[11px] text-emerald-600 font-black bg-emerald-50 px-2 py-1 rounded-md">إضافي: {dept.overtime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* سجل التأخير */}
          <div className="bg-slate-50/40 rounded-4xl p-6 border border-slate-100">
          <div className="bg-slate-50/40 rounded-4xl p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
              <h2 className="text-xl font-black text-[#00bba7]">تنبيهات الحضور اليومية</h2>
              <AlertTriangle className="text-orange-500" size={24} />
            </div>

            <div className="flex flex-col gap-3">
              {lateEmployees.map((emp, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-rose-200 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full ${emp.color || 'bg-slate-200'} text-white flex items-center justify-center text-lg font-black shadow-inner`}>
                      {emp.initial || emp.name?.[0] || '-'}
                    </div>
                    <div className="text-right">
                      <p className="text-base font-black text-slate-800">{emp.name}</p>
                      <p className="text-xs font-bold text-slate-400 mt-1">{emp.dept}</p>
                    </div>
                  </div>

                  <div className="text-left flex flex-col items-end gap-2">
                    {emp.late && emp.late !== '—' && (
                      <span className="text-xs text-orange-700 font-bold bg-orange-100/50 px-3 py-1 rounded-full">
                        تأخر: {emp.late}
                      </span>
                    )}
                    {emp.earlyExit && emp.earlyExit !== '—' && (
                      <span className="text-xs text-rose-700 font-bold bg-rose-100/50 px-3 py-1 rounded-full">
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

// "use client";

// import { 
//   Users, Clock, Timer, AlertTriangle, 
//   UserCheck, Wallet, UserX 
// } from "lucide-react";
// import { useDashboard } from '@/hooks/useDashboard';

// export default function DashboardPage() {
//   // جلب البيانات من الـ Hook
//   const { data, isLoading } = useDashboard();
  
//   // شاشة التحميل
//   if (isLoading || !data) {
//     return (
//       <div className="p-8 h-screen flex items-center justify-center bg-slate-50">
//         <div className="flex flex-col items-center gap-3">
//           <div className="w-12 h-12 border-4 border-[#00bba7] border-t-transparent rounded-full animate-spin"></div>
//           <p className="text-slate-500 font-bold animate-pulse">جاري جلب بيانات النظام...</p>
//         </div>
//       </div>
//     );
//   }

//   // بناء الإحصائيات الـ 6 المطلوبة بناءً على البيانات القادمة من السيرفر
//   const stats = [
//     { title: 'عدد الموظفين', value: data.totalEmployees, subValue: 'إجمالي', icon: Users },
//     { title: 'العمال النشطين', value: data.activeToday, subValue: 'سجلوا حضور اليوم', icon: UserCheck },
//     { title: 'إجمالي الغياب', value: data.totalAbsentToday, subValue: 'لم يسجلوا حضور', icon: UserX },
//     { title: 'الرواتب المستحقة', value: data.totalDueSalaries.toLocaleString(), subValue: 'ل.س', icon: Wallet },
//     { title: 'إجمالي التأخير', value: data.totalLateMinutesToday, subValue: 'دقيقة (اليوم)', icon: Clock },
//     { title: 'إجمالي الإضافي', value: data.totalOvertimeMinutesToday, subValue: 'دقيقة (اليوم)', icon: Timer },
//   ];

//   return (
//     <div className="p-6 md:p-8 bg-slate-50 min-h-screen" dir="rtl">
      
//       {/* الترويسة العلوية */}
//       <header className="mb-10">
//         <h1 className="text-3xl font-extrabold text-[#00bba7]">
//           الإحصائيات العامة
//         </h1>
//         <p className="text-slate-500 text-sm mt-2 font-medium">نظرة شاملة على أداء المعمل والموظفين لهذا اليوم</p>
//       </header>

//       {/* الحاوية الرئيسية */}
//       <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
        
//         {/* شبكة الإحصائيات (3 أعمدة) */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
//           {stats.map((stat, index) => (
//             <div 
//               key={index} 
//               className="bg-white p-8 lg:p-10 rounded-[2rem] border border-slate-100 hover:border-[#00bba7]/40 hover:shadow-2xl hover:shadow-[#00bba7]/10 hover:-translate-y-2 transition-all duration-300 flex flex-col items-center justify-center gap-4 group cursor-default"
//             >
//               <div className="flex items-center gap-3">
//                 <stat.icon size={36} className="text-[#E7C873] group-hover:scale-110 transition-transform duration-300" />
//                 <p className="text-[#E7C873] text-lg font-extrabold">{stat.title}</p>
//               </div>
//               <h3 className="text-5xl font-black text-[#00bba7] tracking-tight">
//                 {stat.value}
//               </h3>
//               <p className="text-xs font-bold text-slate-400">
//                 {stat.subValue}
//               </p>
//             </div>
//           ))}
//         </div>

//         {/* الأقسام والموظفين */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
//           {/* كفاءة الأقسام */}
//           <div className="bg-slate-50/40 rounded-[2rem] p-6 border border-slate-100">
//             <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
//                <h2 className="text-xl font-black text-[#00bba7]">كفاءة الأقسام (اليوم)</h2>
//                <Users className="text-[#E7C873]" size={24} />
//             </div>

//             <div className="flex flex-col gap-3">
//               {data.departmentsEfficiency.length === 0 ? (
//                 <p className="text-center text-slate-400 text-sm py-4">لا توجد بيانات للأقسام</p>
//               ) : (
//                 data.departmentsEfficiency.map((dept, index) => (
//                   <div key={index} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-[#00bba7]/30 hover:shadow-sm transition-all">
//                     <div className="flex items-center gap-3">
//                       <span className="px-4 py-1.5 rounded-xl text-xs font-black bg-blue-50 text-blue-700">
//                         {dept.name}
//                       </span>
//                       <span className="text-sm font-bold text-slate-500">{dept.employeeCount} موظف</span>
//                     </div>
//                     <div className="flex items-center gap-3">
//                       {dept.totalLateMinutes > 0 && (
//                         <span className="text-[11px] text-orange-600 font-bold bg-orange-50 px-2 py-1 rounded-md">
//                           تأخير: {dept.totalLateMinutes} د
//                         </span>
//                       )}
//                       {dept.totalOvertimeMinutes > 0 && (
//                         <span className="text-[11px] text-emerald-600 font-black bg-emerald-50 px-2 py-1 rounded-md">
//                           إضافي: {dept.totalOvertimeMinutes} د
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>

//           {/* تنبيهات الحضور (من سجل دخول اليوم) */}
//           <div className="bg-slate-50/40 rounded-[2rem] p-6 border border-slate-100">
//             <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
//               <h2 className="text-xl font-black text-[#00bba7]">سجل حضور اليوم</h2>
//               <AlertTriangle className="text-orange-500" size={24} />
//             </div>

//             <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
//               {data.todayAttendances.length === 0 ? (
//                 <p className="text-center text-slate-400 text-sm py-4">لم يسجل أي موظف حضوره بعد</p>
//               ) : (
//                 data.todayAttendances.map((emp, index) => (
//                   <div key={index} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-slate-300 transition-all">
//                     <div className="flex items-center gap-3">
//                       <div className={`w-12 h-12 rounded-full ${emp.color || 'bg-[#00bba7]/20 text-[#00bba7]'} flex items-center justify-center text-lg font-black shadow-inner`}>
//                         {emp.initial || emp.name[0]}
//                       </div>
//                       <div className="text-right">
//                         <p className="text-base font-black text-slate-800">{emp.name}</p>
//                         <p className="text-xs font-bold text-slate-400 mt-1">{emp.department}</p>
//                       </div>
//                     </div>

//                     <div className="text-left flex flex-col items-end gap-2">
//                       {emp.lateMinutes > 0 ? (
//                         <span className="text-xs text-orange-700 font-bold bg-orange-100/50 px-3 py-1 rounded-full">
//                           تأخر: {emp.lateMinutes} د
//                         </span>
//                       ) : (
//                         <span className="text-xs text-emerald-700 font-bold bg-emerald-100/50 px-3 py-1 rounded-full">
//                           على الوقت
//                         </span>
//                       )}
                      
//                       {emp.earlyExitMinutes > 0 && (
//                         <span className="text-xs text-rose-700 font-bold bg-rose-100/50 px-3 py-1 rounded-full">
//                           خروج مبكر: {emp.earlyExitMinutes} د
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// }