"use client";

import { useEffect, useMemo, useRef } from "react";
import { Users, Clock, Timer, Box, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";
import { useDashboard } from '@/hooks/useDashboard';
import type { AttendanceAlert } from '@/types/dashboard';

type LateEmployeeCard = {
  name: string;
  dept: string;
  late: string;
  earlyExit: string;
  initial: string;
  color: string;
};

const toArabicTime = (value: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

export default function DashboardPage() {
  const { employeesStats, attendanceStats, inventoryStats, attendanceAlerts, isLoading } = useDashboard();
  const previousAlertSignatureRef = useRef<string>("");

  // Build minimal stats using backend responses with safe fallbacks
  const stats = [
    { title: 'الموظفين النشطين', value: employeesStats?.active ?? '—', subValue: `من أصل ${employeesStats?.total ?? '—'}`, icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { title: 'إجمالي دقائق التأخير', value: attendanceStats?.statistics?.totalLateArrivals ?? '—', subValue: 'تأخر صباحي', icon: Clock, color: 'text-orange-500', bgColor: 'bg-orange-50' },
    { title: 'إجمالي الإضافي', value: inventoryStats?.totalQuantity ?? '—', subValue: 'كمية إجمالية', icon: Timer, color: 'text-green-600', bgColor: 'bg-green-50' },
    { title: 'أصناف المخزون', value: inventoryStats?.totalProducts ?? '—', subValue: 'منتجات', icon: Box, color: 'text-sky-500', bgColor: 'bg-sky-50' },
  ];

  const departmentSummary = Object.entries(employeesStats?.byDepartment || {}).map(([name, count]) => ({ name, count: `${count} موظف`, late: '—', overtime: '—', color: 'bg-blue-50 text-blue-600' }));

  const attendanceNotifications = attendanceAlerts?.alerts || [];

  const alertSignature = useMemo(
    () => attendanceNotifications
      .map((alert) => `${alert.status}:${alert.employeeId}:${alert.minutesLate}`)
      .sort()
      .join('|'),
    [attendanceNotifications],
  );

  useEffect(() => {
    if (!alertSignature) {
      previousAlertSignatureRef.current = "";
      return;
    }

    if (previousAlertSignatureRef.current === alertSignature) {
      return;
    }

    previousAlertSignatureRef.current = alertSignature;

    const absentCount = attendanceAlerts?.summary.absentCount ?? 0;
    const lateCount = attendanceAlerts?.summary.lateCount ?? 0;
    const summaryParts: string[] = [];

    if (absentCount > 0) summaryParts.push(`${absentCount} غائب`);
    if (lateCount > 0) summaryParts.push(`${lateCount} متأخر`);

    if (!summaryParts.length) return;

    toast.error(`تنبيه حضور اليوم: ${summaryParts.join(' | ')}`, {
      id: 'attendance-daily-alerts',
      duration: 5000,
    });
  }, [alertSignature, attendanceAlerts?.summary.absentCount, attendanceAlerts?.summary.lateCount]);

  const lateEmployees = useMemo<LateEmployeeCard[]>(() => {
    if (attendanceStats?.topLateEmployees?.length) {
      return attendanceStats.topLateEmployees;
    }

    const fromAlerts = attendanceNotifications
      .filter((alert): alert is AttendanceAlert => alert.status === 'late')
      .map((alert) => ({
        name: alert.name,
        dept: alert.department,
        late: `${alert.minutesLate} د`,
        earlyExit: '—',
        initial: alert.name?.[0] || '-',
        color: 'bg-orange-500',
      }));

    if (fromAlerts.length) {
      return fromAlerts;
    }

    return [{ name: '—', dept: '—', late: '—', earlyExit: '—', initial: '-', color: 'bg-blue-500' }];
  }, [attendanceStats?.topLateEmployees, attendanceNotifications]);

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
            {lateEmployees.map((emp: { name: string; dept: string; late: string; earlyExit: string; initial: string; color: string }, index: number) => (
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

      <div className="mt-8 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-2 border-b border-slate-100">
          <div className="text-right">
            <h2 className="text-lg font-bold text-slate-800">تنبيهات الحضور اليومية</h2>
            <p className="text-xs text-slate-400 mt-1">
              تاريخ المتابعة: {attendanceAlerts?.date || 'اليوم'} | حد التأخير: {attendanceAlerts?.lateThresholdMinutes ?? 15} دقيقة
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="px-3 py-1 rounded-lg bg-red-50 border border-red-100 text-red-700">
              غائب: {attendanceAlerts?.summary.absentCount ?? 0}
            </span>
            <span className="px-3 py-1 rounded-lg bg-orange-50 border border-orange-100 text-orange-700">
              متأخر: {attendanceAlerts?.summary.lateCount ?? 0}
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
              إجمالي التنبيهات: {attendanceAlerts?.summary.totalAlerts ?? 0}
            </span>
          </div>
        </div>

        {attendanceNotifications.length === 0 ? (
          <p className="text-sm text-slate-500">لا توجد حالات غياب أو تأخير تتجاوز الحد المحدد اليوم.</p>
        ) : (
          <div className="space-y-3">
            {attendanceNotifications.map((alert) => (
              <div
                key={`${alert.status}-${alert.employeeId}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <h3 className="text-sm font-bold text-slate-800">{alert.name}</h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        alert.status === 'absent'
                          ? 'bg-red-50 text-red-700 border-red-100'
                          : 'bg-orange-50 text-orange-700 border-orange-100'
                      }`}
                    >
                      {alert.status === 'absent' ? 'غائب' : 'متأخر'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {alert.department} | {alert.employeeId}
                  </p>
                </div>

                <div className="text-xs text-slate-600 text-left">
                  {alert.status === 'late' ? (
                    <p>
                      دخول: {toArabicTime(alert.checkIn)} | تأخير: <span className="font-bold text-orange-600">{alert.minutesLate} دقيقة</span>
                    </p>
                  ) : (
                    <p>لم يتم تسجيل دخول حتى الآن (بداية الدوام: {alert.scheduledStart || '08:00'})</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}