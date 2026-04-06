"use client";

import { useMemo, useState } from "react";
import { Calendar as CalendarIcon, Fingerprint, PencilLine, Clock3, LogIn, LogOut, Loader2 } from "lucide-react";
import { useAttendance } from "@/hooks/useAttendance";
import { useEmployees } from "@/hooks/useEmployees";

type TableStatus = "present" | "late" | "absent";

const HH_MM_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const toMinutes = (time?: string) => {
  if (!time) return null;
  const normalized = time.slice(0, 5);
  const [h, m] = normalized.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return (h * 60) + m;
};

const toLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getToday = () => toLocalDateString(new Date());

const timeNow = () => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
};

const getDateRange = (startDate: string, endDate: string) => {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const dates: string[] = [];

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return dates;

  const cursor = new Date(start);
  while (cursor <= end) {
    dates.push(toLocalDateString(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
};

const toArabicDate = (date: string) =>
  new Intl.DateTimeFormat("ar-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(`${date}T00:00:00`));

const getStatus = (checkIn?: string, scheduledStart?: string): TableStatus => {
  if (!checkIn) return "absent";

  const checkInMinutes = toMinutes(checkIn);
  const scheduledMinutes = toMinutes(scheduledStart || "08:00");

  if (checkInMinutes === null || scheduledMinutes === null) return "present";
  if (checkInMinutes > (scheduledMinutes + 15)) return "late";

  return "present";
};

const statusUi: Record<TableStatus, { label: string; classes: string }> = {
  present: { label: "حاضر", classes: "text-blue-700 bg-blue-50 border-blue-200" },
  late: { label: "متأخر", classes: "text-orange-700 bg-orange-50 border-orange-200" },
  absent: { label: "غائب", classes: "text-red-700 bg-red-50 border-red-200" },
};

interface AttendanceTableRow {
  key: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  scheduledStart?: string;
  source: "manual" | "device";
  status: TableStatus;
}

export default function AttendancePage() {
  const today = getToday();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const { data, isLoading, isFetching, isError, error, markAttendance } = useAttendance({
    startDate,
    endDate,
    date: startDate === endDate ? startDate : undefined,
    limit: 1000,
  });

  const employeeNameMap = useMemo(() => {
    const map = new Map<string, string>();
    if (Array.isArray(employees)) {
      for (const employee of employees) {
        if (employee?.employeeId) map.set(employee.employeeId, employee.name || employee.employeeId);
      }
    }
    return map;
  }, [employees]);

  const employeeScheduleMap = useMemo(() => {
    const map = new Map<string, string>();
    if (Array.isArray(employees)) {
      for (const employee of employees) {
        if (employee?.employeeId) map.set(employee.employeeId, employee.scheduledStart || "08:00");
      }
    }
    return map;
  }, [employees]);

  const rows = useMemo(() => {
    const dateRange = getDateRange(startDate, endDate);
    const daily = data?.dailyRecords || [];

    const byKey = new Map(daily.map((item) => [item.key, item]));

    const employeeIds = new Set<string>();
    (employees || []).forEach((e) => e?.employeeId && employeeIds.add(e.employeeId));
    (daily || []).forEach((d) => d?.employeeId && employeeIds.add(d.employeeId));

    const tableRows: AttendanceTableRow[] = [];

    for (const date of dateRange) {
      for (const employeeId of Array.from(employeeIds).sort()) {
        const key = `${employeeId}-${date}`;
        const entry = byKey.get(key);
        const checkIn = entry?.checkIn || "";
        const checkOut = entry?.checkOut || "";
        const scheduledStart = employeeScheduleMap.get(employeeId) || "08:00";

        tableRows.push({
          key,
          employeeId,
          employeeName: employeeNameMap.get(employeeId) || employeeId,
          date,
          checkIn,
          checkOut,
          scheduledStart,
          source: entry?.source || "manual",
          status: getStatus(checkIn, scheduledStart),
        });
      }
    }

    return tableRows.sort((a, b) => `${b.date}-${b.employeeId}`.localeCompare(`${a.date}-${a.employeeId}`));
  }, [data?.dailyRecords, employees, startDate, endDate, employeeNameMap, employeeScheduleMap]);

  const stats = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc[row.status] += 1;
        return acc;
      },
      { present: 0, late: 0, absent: 0 } as Record<TableStatus, number>,
    );
  }, [rows]);

  const handleMark = (row: AttendanceTableRow, field: "checkIn" | "checkOut") => {
    const defaultValue = field === "checkOut" && row.checkOut ? row.checkOut : field === "checkIn" && row.checkIn ? row.checkIn : timeNow();
    const title = field === "checkIn" ? "الدخول" : "الخروج";
    const entered = window.prompt(`أدخل وقت ${title} بصيغة HH:mm`, defaultValue);

    if (!entered) return;
    if (!HH_MM_REGEX.test(entered)) {
      window.alert("صيغة الوقت غير صحيحة. الرجاء استخدام HH:mm");
      return;
    }

    markAttendance.mutate({
      employeeId: row.employeeId,
      date: row.date,
      checkIn: field === "checkIn" ? entered : undefined,
      checkOut: field === "checkOut" ? entered : undefined,
      source: "manual",
    });
  };

  if (isLoading || employeesLoading) return <div className="p-8">جاري تحميل سجلات الحضور...</div>;
  if (isError) {
    return <div className="p-8 text-red-600">حدث خطأ في تحميل الحضور: {(error as Error)?.message || "خطأ غير معروف"}</div>;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8" dir="rtl">
      <header className="mb-8 text-right">
        <h1 className="text-2xl font-bold text-slate-900">سجل الحضور والانصراف</h1>
        <p className="text-slate-500 text-sm mt-1">جاهز للتكامل مع جهاز البصمة (BASSAMA) باستخدام employeeId</p>

        <div className="mt-6 flex flex-wrap items-end gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm min-w-65">
            <label className="block text-xs text-slate-500 mb-1">من تاريخ</label>
            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm min-w-65">
            <label className="block text-xs text-slate-500 mb-1">إلى تاريخ</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 mr-auto">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold border border-blue-200">حاضر: {stats.present}</span>
            <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-xs font-bold border border-orange-200">متأخر: {stats.late}</span>
            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs font-bold border border-red-200">غائب: {stats.absent}</span>
            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-xs font-bold border border-slate-200">
              {isFetching ? "تحديث..." : `${startDate} → ${endDate}`}
            </span>
          </div>
        </div>
      </header>

      <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="w-full overflow-x-auto">
  <table className="w-full text-right border-collapse min-w-245">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">الموظف</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">التاريخ</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">الدخول</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">الخروج</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">الحالة</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">المصدر</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {markAttendance.isPending && (
              <tr>
                <td colSpan={7} className="p-4 text-center text-slate-500 bg-blue-50/50">
                  <span className="inline-flex items-center gap-2 font-semibold text-blue-700">
                    <Loader2 size={16} className="animate-spin" />
                    جارٍ حفظ سجل الحضور...
                  </span>
                </td>
              </tr>
            )}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  لا توجد بيانات حضور ضمن هذا النطاق
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.key} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold">
                      {row.employeeName[0] || "م"}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700 text-sm">{row.employeeName}</p>
                      <p className="text-xs text-slate-400 font-mono">{row.employeeId}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm text-slate-500 font-medium">{toArabicDate(row.date)}</td>
                <td className="p-4 text-sm text-slate-800 font-semibold">{row.checkIn || "—"}</td>
                <td className="p-4 text-sm text-slate-800 font-semibold">{row.checkOut || "—"}</td>
                <td className="p-4 text-center">
                  <span className={`px-4 py-1.5 rounded-xl text-[11px] font-bold border ${statusUi[row.status].classes}`}>
                    {statusUi[row.status].label}
                  </span>
                </td>
                <td className="p-4 text-center">
                  {row.checkIn || row.checkOut ? (
                    <span className="inline-flex items-center gap-2 text-xs font-semibold">
                      {row.source === "device" ? (
                        <>
                          <Fingerprint size={15} className="text-cyan-600" />
                          <span className="text-cyan-700">جهاز</span>
                        </>
                      ) : (
                        <>
                          <PencilLine size={15} className="text-slate-600" />
                          <span className="text-slate-700">يدوي</span>
                        </>
                      )}
                    </span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleMark(row, "checkIn")}
                      disabled={markAttendance.isPending}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 text-xs font-bold disabled:opacity-50 active:scale-95"
                    >
                      <LogIn size={14} />
                      {row.checkIn ? "تعديل دخول" : "تسجيل دخول"}
                    </button>

                    <button
                      onClick={() => handleMark(row, "checkOut")}
                      disabled={markAttendance.isPending || !row.checkIn}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-100 text-xs font-bold disabled:opacity-50 active:scale-95"
                      title={!row.checkIn ? "يجب تسجيل الدخول أولاً" : "تسجيل/تعديل الخروج"}
                    >
                      <LogOut size={14} />
                      {row.checkOut ? "تعديل خروج" : "تسجيل خروج"}
                    </button>
                  </div>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      <div className="mt-4 text-xs text-slate-500 flex items-center gap-2">
        <Clock3 size={14} />
        يعتبر الموظف متأخراً إذا تجاوز وقت الدخول وقت الدوام المجدول + 15 دقيقة.
      </div>

      <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
        <CalendarIcon size={14} />
        جميع العمليات تعتمد على <span className="font-mono">employeeId</span> لتجهيز التكامل المستقبلي مع جهاز البصمة.
      </div>
    </div>
  );
}