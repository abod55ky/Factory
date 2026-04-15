"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CalendarCheck,
  ChevronLeft,
  Clock3,
  CreditCard,
  Flag,
  Loader2,
  Phone,
  RefreshCw,
  ShieldAlert,
  Wallet,
} from "lucide-react";
import { useEmployeeProfile } from "@/hooks/useEmployeeProfile";
import type { EmployeeProfileAttendanceRecord } from "@/types/employee-profile";

const toNumber = (value: unknown) => {
  if (value && typeof value === "object" && "$numberDecimal" in (value as Record<string, unknown>)) {
    return Number((value as { $numberDecimal: string }).$numberDecimal || 0);
  }
  return Number(value || 0);
};

const getLocalMonth = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

const getMonthBounds = (period: string) => {
  const [y, m] = period.split("-").map(Number);
  const start = `${y}-${String(m).padStart(2, "0")}-01`;
  const endDate = new Date(y, m, 0);
  const end = `${y}-${String(m).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;
  return { start, end };
};

const formatDateLabel = (value: string) => {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("ar-EG");
};

const formatTimeLabel = (value?: string) => {
  if (!value) return "--:--";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "--:--";

  return parsed.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

type DailyAttendanceRow = {
  date: string;
  checkIn?: string;
  checkOut?: string;
  eventsCount: number;
};

const buildDailyAttendanceRows = (records: EmployeeProfileAttendanceRecord[]): DailyAttendanceRow[] => {
  const grouped = new Map<string, DailyAttendanceRow>();

  records.forEach((record) => {
    const dateKey = record.date || record.timestamp.slice(0, 10);
    if (!dateKey) return;

    const current = grouped.get(dateKey) || {
      date: dateKey,
      eventsCount: 0,
    };

    current.eventsCount += 1;

    if (record.type === "IN") {
      const nextCheckIn = !current.checkIn || record.timestamp < current.checkIn ? record.timestamp : current.checkIn;
      current.checkIn = nextCheckIn;
    }

    if (record.type === "OUT") {
      const nextCheckOut =
        !current.checkOut || record.timestamp > current.checkOut ? record.timestamp : current.checkOut;
      current.checkOut = nextCheckOut;
    }

    grouped.set(dateKey, current);
  });

  return Array.from(grouped.values()).sort((a, b) => b.date.localeCompare(a.date));
};

export default function EmployeeProfilePage({ params }: { params: { id: string } }) {
  const [period, setPeriod] = useState(getLocalMonth());
  const { start: monthStart, end: monthEnd } = useMemo(() => getMonthBounds(period), [period]);

  const { data, isLoading, isFetching, isError, error, refetch } = useEmployeeProfile(params.id, {
    period,
    startDate: monthStart,
    endDate: monthEnd,
    attendanceLimit: 200,
    advancesLimit: 100,
    bonusesLimit: 100,
  });

  const employee = data?.employee;
  const salary = data?.salary;
  const attendance = data?.attendance;
  const advances = data?.advances;
  const bonuses = data?.bonuses;

  const baseSalary = toNumber(salary?.baseSalary);
  const responsibilityAllowance = toNumber(salary?.responsibilityAllowance);
  const productionIncentive = toNumber(salary?.productionIncentive);
  const transportAllowance = toNumber(salary?.transportAllowance);
  const totalAllowances = responsibilityAllowance + productionIncentive + transportAllowance;
  const monthlyFixedTotal = baseSalary + totalAllowances;

  const totalBonus = toNumber(bonuses?.summary?.totalBonus);
  const totalAssistance = toNumber(bonuses?.summary?.totalAssistance);
  const remainingAdvances = toNumber(advances?.summary?.remainingAmount);
  const estimatedCurrentDues = monthlyFixedTotal + totalBonus - totalAssistance;

  const dailyAttendanceRows = useMemo(() => {
    return buildDailyAttendanceRows(attendance?.records || []).slice(0, 8);
  }, [attendance?.records]);

  const errorMessage = error instanceof Error && error.message ? error.message : "تعذر تحميل بيانات الموظف";

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 font-sans bg-slate-50 min-h-screen" dir="rtl">
        <div className="rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          <Loader2 className="mx-auto mb-3 animate-spin text-blue-600" size={28} />
          <p className="text-sm font-bold text-slate-700">جاري تحميل ملف الموظف...</p>
        </div>
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="p-6 md:p-8 font-sans bg-slate-50 min-h-screen" dir="rtl">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 shadow-sm">
          <p className="text-sm font-bold text-rose-700">{errorMessage}</p>
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
            >
              إعادة المحاولة
            </button>
            <Link
              href="/employees"
              className="rounded-lg border border-rose-300 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
            >
              العودة لقائمة الموظفين
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 font-sans bg-slate-50 min-h-screen" dir="rtl">
      <nav className="mb-6 flex items-center gap-2 text-xs font-bold text-slate-400">
        <Link href="/employees" className="hover:text-slate-700">
          إدارة الموارد البشرية
        </Link>
        <ChevronLeft size={14} />
        <Link href="/employees" className="hover:text-slate-700">
          قائمة الموظفين
        </Link>
        <ChevronLeft size={14} />
        <span className="text-slate-800">بروفايل الموظف</span>
      </nav>

      <div className="mb-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
              <Flag size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800">{employee.name}</h1>
              <p className="mt-1 text-xs font-bold text-slate-500">#{employee.employeeId}</p>
              <p className="mt-1 text-xs font-bold text-slate-500">القسم: {employee.department || "--"}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-slate-600">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <span dir="ltr">{employee.mobile || employee.phone || "غير متوفر"}</span>
              <Phone size={16} className="text-blue-500" />
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <span>{employee.nationalId || "غير متوفر"}</span>
              <CreditCard size={16} className="text-blue-500" />
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-teal-100 bg-teal-50/60 px-4 py-3">
          <div>
            <p className="text-xs font-bold text-teal-700">المستحق الحالي التقديري</p>
            <p className="text-3xl font-black text-teal-700">{estimatedCurrentDues.toLocaleString()}</p>
            <p className="text-[11px] font-bold text-teal-600">يعتمد على الراتب الثابت + مكافآت/خصومات الفترة</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="month"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
            />
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              {isFetching ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              تحديث
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Wallet className="text-blue-500" size={18} />
            <h2 className="text-base font-black text-slate-800">تفاصيل الراتب</h2>
          </div>

          {!data.access.salary ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-700">
              <div className="mb-1 flex items-center gap-2">
                <ShieldAlert size={16} />
                <span>عرض الراتب غير متاح حسب الصلاحيات.</span>
              </div>
            </div>
          ) : !salary ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-600">
              لا يوجد إعداد راتب محفوظ لهذا الموظف.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] font-bold text-slate-500">الراتب الأساسي</p>
                <p className="mt-1 text-lg font-black text-slate-800">{baseSalary.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-[11px] font-bold text-emerald-600">إجمالي البدلات</p>
                <p className="mt-1 text-lg font-black text-emerald-700">{totalAllowances.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-3">
                <p className="text-[11px] font-bold text-blue-600">الإجمالي الثابت</p>
                <p className="mt-1 text-lg font-black text-blue-700">{monthlyFixedTotal.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl border border-orange-200 bg-orange-50 p-3">
                <p className="text-[11px] font-bold text-orange-600">السلف المتبقية</p>
                <p className="mt-1 text-lg font-black text-orange-700">
                  {data.access.advances ? remainingAdvances.toLocaleString() : "غير متاح"}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Clock3 className="text-indigo-500" size={18} />
            <h2 className="text-base font-black text-slate-800">ملخص الحضور للفترة</h2>
          </div>

          {!data.access.attendance ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-700">
              <div className="mb-1 flex items-center gap-2">
                <ShieldAlert size={16} />
                <span>عرض الحضور غير متاح حسب الصلاحيات.</span>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-3">
                  <CalendarCheck className="text-indigo-500" size={20} />
                  <div>
                    <p className="text-[11px] font-bold text-indigo-600">أيام مسجلة</p>
                    <p className="text-lg font-black text-indigo-900">{attendance?.statistics.totalDays || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-orange-100 bg-orange-50 p-3">
                  <AlertTriangle className="text-orange-500" size={20} />
                  <div>
                    <p className="text-[11px] font-bold text-orange-600">إجمالي السجلات</p>
                    <p className="text-lg font-black text-orange-900">{attendance?.statistics.totalRecords || 0}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100">
                <table className="w-full text-right">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-500">
                    <tr>
                      <th className="px-3 py-2">التاريخ</th>
                      <th className="px-3 py-2 text-center">دخول</th>
                      <th className="px-3 py-2 text-center">خروج</th>
                      <th className="px-3 py-2 text-center">عدد الحركات</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-bold text-slate-700">
                    {dailyAttendanceRows.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-3 py-6 text-center text-slate-500">
                          لا توجد سجلات حضور ضمن الفترة المختارة.
                        </td>
                      </tr>
                    ) : (
                      dailyAttendanceRows.map((row) => (
                        <tr key={row.date} className="border-t border-slate-100">
                          <td className="px-3 py-2">{formatDateLabel(row.date)}</td>
                          <td className="px-3 py-2 text-center">{formatTimeLabel(row.checkIn)}</td>
                          <td className="px-3 py-2 text-center">{formatTimeLabel(row.checkOut)}</td>
                          <td className="px-3 py-2 text-center">{row.eventsCount}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-500">ملخص المكافآت والخصومات ({period})</p>
          {data.access.bonuses ? (
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                <p className="text-[11px] font-bold text-emerald-600">المكافآت</p>
                <p className="text-lg font-black text-emerald-700">{totalBonus.toLocaleString()}</p>
              </div>
              <div className="rounded-xl border border-rose-100 bg-rose-50 p-3">
                <p className="text-[11px] font-bold text-rose-600">الخصومات</p>
                <p className="text-lg font-black text-rose-700">{totalAssistance.toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm font-bold text-amber-700">غير متاح حسب الصلاحيات.</p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-500">بيانات التوظيف الرسمية</p>
          <div className="mt-2 grid grid-cols-2 gap-3 text-xs font-bold">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700">
              <p className="text-[11px] text-slate-500">تاريخ بدء التوظيف</p>
              <p className="mt-1">{employee.employmentStartDate ? formatDateLabel(employee.employmentStartDate) : "غير محدد"}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700">
              <p className="text-[11px] text-slate-500">تاريخ إنهاء الخدمة</p>
              <p className="mt-1">{employee.terminationDate ? formatDateLabel(employee.terminationDate) : "غير محدد"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}