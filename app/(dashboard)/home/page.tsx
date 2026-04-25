"use client";

import { 
  Users, Clock, Timer, AlertTriangle, 
  UserCheck, Wallet, UserX, Building2, TrendingUp,
  Scissors // أيقونة إضافية للمسة المعمل
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
      <div className="relative z-10 w-full max-w-7xl min-h-[85vh] mx-auto flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 bg-white/40 p-8 rounded-3xl backdrop-blur-2xl border border-white/60 shadow-[0_20px_40px_rgba(38,53,68,0.1)]">
          <div className="w-14 h-14 border-4 border-[#C89355]/30 border-t-[#263544] rounded-full animate-spin shadow-lg" />
          <p className="text-[#263544] font-black animate-pulse text-sm tracking-wide">جاري معالجة بيانات المصنع...</p>
        </div>
      </div>
    );
  }

  return (
    /* 1. الحاوية الرئيسية: تأثير زجاجي مضاعف (backdrop-blur-3xl + bg-white/50) 
      مع نقشة نسيج قماش ثابتة تماماً بالخلفية لتعطي ملمس الألبسة 
    */
    <div className="relative z-10 w-full max-w-7xl min-h-[85vh] mx-auto bg-white/50 backdrop-blur-2px rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(38,53,68,0.2)] border-2 border-white/80 flex flex-col overflow-hidden" dir="rtl">
        
        {/* نقشة الفايبر (القماش) الثابتة والشفافة */}
        <div 
          className="absolute inset-0 opacity-[0.04] pointer-events-none z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 12h24M12 0v24' stroke='%23263544' stroke-width='1' stroke-dasharray='4 4' fill='none'/%3E%3C/svg%3E")`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* محتوى الصفحة الداخلي */}
        <div className="p-6 md:p-10 h-full overflow-y-auto custom-scrollbar relative z-10">
          
          {/* الترويسة */}
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#263544]/10 pb-6 relative">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-[#1a2530] rounded-2xl shadow-[0_15px_25px_rgba(38,53,68,0.4)] border border-[#C89355]/40 relative outline-dashed outline-1 outline-[#C89355]/50 -outline-offset-4">
                  <TrendingUp size={22} className="text-[#C89355] animate-bounce" strokeWidth={2.5} />
                </div>
                <h1 className="text-3xl font-black text-[#263544] tracking-tight drop-shadow-sm">
                  لوحة التحكم
                </h1>
              </div>
              <p className="text-slate-600 text-sm font-bold pr-14 flex items-center gap-2">
                <Scissors size={14} className="text-[#C89355]" />
                مراقبة أداء المعمل والموظفين لهذا اليوم
              </p>
            </div>
          </header>

          {/* 2. شبكة الإحصائيات (تأثير الزجاج المحسّن والكروت المفصولة) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="relative bg-white/60 backdrop-blur-xl p-7 rounded-4xl border-2 border-white/90 shadow-[0_10px_30px_rgba(38,53,68,0.08)] hover:shadow-[0_25px_50px_rgba(200,147,85,0.2)] hover:-translate-y-2 transition-all duration-500 group overflow-hidden"
              >
                {/* درزة خياطة (Stitching) خفيفة لتأكيد هوية معمل الألبسة */}
                <div className="absolute inset-1.5 rounded-[1.7rem] border border-dashed border-[#263544]/10 pointer-events-none group-hover:border-[#C89355]/30 transition-colors duration-500" />

                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-[#263544] to-[#C89355] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <p className="text-[#263544]/80 text-sm font-black group-hover:text-[#263544] transition-colors">{stat.title}</p>
                  <div className="p-3 bg-white/80 backdrop-blur-md rounded-2xl group-hover:bg-[#1a2530] transition-all duration-500 border border-white shadow-sm group-hover:border-[#C89355]/40 group-hover:shadow-[0_0_15px_rgba(200,147,85,0.4)]">
                    <stat.icon size={22} className="text-[#263544] group-hover:text-[#C89355] group-hover:animate-pulse transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6" />
                  </div>
                </div>
                <h3 className="text-4xl font-black text-[#263544] tracking-tight mb-2 group-hover:scale-105 origin-right transition-transform duration-500 drop-shadow-md relative z-10">
                  {stat.value}
                </h3>
                <p className="text-[11px] font-bold text-slate-500 bg-white/70 backdrop-blur-md inline-block px-3 py-1.5 rounded-lg border border-white shadow-sm relative z-10">
                  {stat.subValue}
                </p>
              </div>
            ))}
          </div>

          {/* 3. القوائم السفلية (كروت قوية وواضحة بخلفيات زجاجية) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-4">
            
            {/* بطاقة كفاءة الأقسام */}
            <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] p-8 border-2 border-white/90 shadow-[0_15px_40px_rgba(38,53,68,0.08)] flex flex-col h-125 hover:shadow-[0_25px_60px_rgba(38,53,68,0.12)] transition-all duration-500 relative">
              <div className="flex items-center gap-3 mb-8 relative z-10">
                <div className="p-2.5 bg-[#C89355]/10 rounded-xl border border-[#C89355]/30 shadow-sm">
                  <Building2 className="text-[#C89355] animate-pulse" size={22} />
                </div>
                <h2 className="text-xl font-black text-[#263544]">تفاصيل الأقسام</h2>
              </div>

              <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10">
                {departmentSummary.map((dept, index) => (
                  <div key={index} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/50 backdrop-blur-md rounded-2xl border border-white/80 hover:border-[#C89355]/40 shadow-sm hover:shadow-[0_8px_20px_rgba(200,147,85,0.15)] transition-all duration-300 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#C89355] shadow-[0_0_10px_rgba(200,147,85,0.6)] group-hover:scale-150 transition-transform duration-300" />
                      <span className="text-sm font-black text-[#263544]">{dept.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-extrabold text-[#C89355] bg-[#263544] px-4 py-1.5 rounded-xl shadow-md group-hover:shadow-lg transition-shadow border border-[#263544]">
                        {dept.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* بطاقة سجل الحضور والتنبيهات */}
            <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] p-8 border-2 border-white/90 shadow-[0_15px_40px_rgba(38,53,68,0.08)] flex flex-col h-125 hover:shadow-[0_25px_60px_rgba(38,53,68,0.12)] transition-all duration-500 relative">
              <div className="flex items-center gap-3 mb-8 relative z-10">
                <div className="p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/20 shadow-sm">
                  <AlertTriangle className="text-rose-600 animate-pulse" size={22} />
                </div>
                <h2 className="text-xl font-black text-[#263544]">تنبيهات التأخير والمخالفات</h2>
              </div>

              <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-10">
                {lateEmployees.map((emp, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-md rounded-2xl border border-white/80 hover:border-rose-300 shadow-sm hover:shadow-[0_8px_20px_rgba(225,29,72,0.1)] transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#263544] border border-[#C89355]/40 flex items-center justify-center text-sm font-black text-[#C89355] shadow-md">
                        {emp.initial || emp.name?.[0] || '-'}
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#263544]">{emp.name}</p>
                        <p className="text-[11px] font-bold text-[#263544]/60 mt-1">{emp.dept}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {emp.late && emp.late !== '—' && (
                        <span className="text-[11px] text-rose-600 font-bold bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-rose-200 shadow-sm">
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