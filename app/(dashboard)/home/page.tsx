"use client";

import { 
  Users, Clock, Timer, AlertTriangle, 
  UserCheck, Wallet, UserX, Building2, TrendingUp
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
  
  const stats = [
    { title: 'إجمالي الموظفين', value: kpis.totalEmployees, subValue: 'مسجل في النظام', icon: Users },
    { title: 'حضور اليوم', value: kpis.activeToday, subValue: 'موظف على رأس عمله', icon: UserCheck },
    { title: 'إجمالي الغياب', value: kpis.totalAbsentToday, subValue: 'موظف غائب اليوم', icon: UserX },
    { title: 'الرواتب المستحقة', value: kpis.totalDueSalaries?.toLocaleString() || '0', subValue: 'ليرة سورية', icon: Wallet },
    { title: 'دقائق التأخير', value: kpis.totalLateMinutesToday, subValue: 'إجمالي تأخير اليوم', icon: Clock },
    { title: 'العمل الإضافي', value: kpis.totalOvertimeMinutesToday, subValue: 'دقيقة عمل إضافية', icon: Timer },
  ];

  const departmentSummary = Object.entries(employeesStats?.byDepartment || {}).map(([name, count]) => ({ 
    name, count: `${count} موظف`, countNum: Number(count), late: '—', overtime: '—'
  }));

  const lateEmployees: LateEmployee[] = (attendanceStats && 'topLateEmployees' in attendanceStats) 
    ? (attendanceStats.topLateEmployees as LateEmployee[]) 
    : [{ name: 'لا يوجد تأخيرات', dept: '—', late: '—', earlyExit: '—', initial: '-' }];

  if (isLoading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#00bba7] to-[#E7C873]">
        <div className="flex flex-col items-center gap-4 relative z-10 bg-white/20 p-8 rounded-3xl backdrop-blur-md border border-[#E7C873] shadow-2xl">
          <div className="w-14 h-14 border-4 border-white/30 border-t-white rounded-full animate-spin shadow-lg" />
          <p className="text-white font-bold animate-pulse text-sm">جاري معالجة بيانات المصنع...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 w-full max-w-7xl min-h-[85vh] mx-auto bg-white/70 backdrop-blur-3xl rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border-2 border-[#E7C873]/80 flex flex-col overflow-hidden" dir="rtl">
        
        {/* محتوى الصفحة الداخلي */}
        <div className="p-6 md:p-10 h-full overflow-y-auto custom-scrollbar">
          
          {/* الترويسة */}
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-black/5 pb-6 relative">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-gradient-to-br from-[#00bba7] to-[#008275] rounded-2xl shadow-lg shadow-[#00bba7]/20 border border-[#00bba7]/20">
                  {/* إضافة حركة للأيقونة الرئيسية */}
                  <TrendingUp size={24} className="text-white animate-bounce" />
                </div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                  لوحة التحكم
                </h1>
              </div>
              <p className="text-slate-500 text-sm font-medium pr-14">مراقبة أداء المعمل والموظفين لهذا اليوم</p>
            </div>
          </header>

          {/* 2. شبكة الإحصائيات مع تأثير Shadow قوي */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="relative bg-white p-7 rounded-[2rem] border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:shadow-[0_25px_60px_rgba(0,187,167,0.15)] hover:-translate-y-1.5 transition-all duration-500 group overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#00bba7] to-[#E7C873] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex items-center justify-between mb-4">
                  <p className="text-slate-500 text-sm font-bold group-hover:text-slate-700 transition-colors">{stat.title}</p>
                  <div className="p-3 bg-slate-50/80 rounded-2xl group-hover:bg-[#E7C873]/15 transition-all duration-500 border border-slate-100 group-hover:border-[#E7C873]/30">
                    {/* الحفاظ على الأنيميشن القديم وإضافة النبض التلقائي للأيقونات */}
                    <stat.icon size={22} className="text-[#E7C873] animate-pulse transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3" />
                  </div>
                </div>
                <h3 className="text-4xl font-black text-[#00bba7] tracking-tight mb-2 group-hover:scale-105 origin-right transition-transform duration-500">
                  {stat.value}
                </h3>
                <p className="text-xs font-bold text-slate-400 bg-slate-50/50 inline-block px-3 py-1 rounded-lg border border-slate-100/50">
                  {stat.subValue}
                </p>
              </div>
            ))}
          </div>

          {/* 3. القوائم السفلية مع تأثير Shadow */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-4">
            
            {/* بطاقة كفاءة الأقسام */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-white/80 shadow-[0_25px_50px_rgba(0,0,0,0.1)] flex flex-col h-[500px] hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-[#E7C873]/10 rounded-xl border border-[#E7C873]/20">
                  {/* إضافة نبض لأيقونة الأقسام */}
                  <Building2 className="text-[#E7C873] animate-pulse" size={22} />
                </div>
                <h2 className="text-xl font-black text-slate-800">تفاصيل الأقسام</h2>
              </div>

              <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
                {departmentSummary.map((dept, index) => (
                  <div key={index} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-[#00bba7]/30 hover:bg-white shadow-sm hover:shadow-md transition-all duration-300 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#E7C873] shadow-[0_0_10px_rgba(231,200,115,0.5)] group-hover:scale-150 transition-transform duration-300" />
                      <span className="text-sm font-black text-slate-700">{dept.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-extrabold text-[#00bba7] bg-white px-4 py-1.5 rounded-xl border border-slate-100 shadow-sm group-hover:shadow-md transition-shadow">
                        {dept.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* بطاقة سجل الحضور */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-white/80 shadow-[0_25px_50px_rgba(0,0,0,0.1)] flex flex-col h-[500px] hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-rose-500/10 rounded-xl border border-rose-500/20">
                  {/* إضافة نبض لأيقونة التنبيهات لتبدو فعالة */}
                  <AlertTriangle className="text-rose-500 animate-pulse" size={22} />
                </div>
                <h2 className="text-xl font-black text-slate-800">تنبيهات التأخير والمخالفات</h2>
              </div>

              <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
                {lateEmployees.map((emp, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-rose-500/30 hover:bg-white shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white border border-slate-100 flex items-center justify-center text-sm font-black text-[#00bba7] shadow-sm">
                        {emp.initial || emp.name?.[0] || '-'}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">{emp.name}</p>
                        <p className="text-[11px] font-bold text-slate-400 mt-1">{emp.dept}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {emp.late && emp.late !== '—' && (
                        <span className="text-[11px] text-[#9a7e28] font-bold bg-[#E7C873]/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-[#E7C873]/20 shadow-sm">
                          {/* إضافة حركة لأيقونة الساعة في قسم التأخير */}
                          <Clock size={12} className="animate-bounce" />
                          تأخر: {emp.late}
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