"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Calendar as CalendarIcon,ChevronLeft, Fingerprint, PencilLine, Clock3, LogIn, LogOut, Loader2, X, ClipboardCheck } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAttendance } from "@/hooks/useAttendance";
import { useEmployees } from "@/hooks/useEmployees";
import { HH_MM_REGEX, normalizeHHmm } from "@/lib/attendance-time";
import { timeNow, toLocalDateString } from "@/lib/date-time";
import {
  getAttendanceSocket,
  type AttendanceRealtimeEventPayload,
} from "@/lib/realtime/attendance-socket";

type TableStatus = "present" | "late" | "absent";

const EMPLOYEE_ID_REGEX = /^EMP[0-9]{3,}$/;

const toMinutes = (time?: string) => {
  if (!time) return null;
  const normalized = time.slice(0, 5);
  const [h, m] = normalized.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return (h * 60) + m;
};

const getToday = () => toLocalDateString();

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
  present: { label: "حاضر", classes: "text-[#00bba7] bg-[#00bba7]/10 border-[#00bba7]/20" },
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
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(today);
  const [liveAttendanceEvent, setLiveAttendanceEvent] = useState<AttendanceRealtimeEventPayload | null>(null);

  // حالة النافذة المنبثقة (Modal) المخصصة للوقت
  const [timeModal, setTimeModal] = useState<{
    isOpen: boolean;
    row: AttendanceTableRow | null;
    field: "checkIn" | "checkOut" | null;
    value: string;
  }>({ isOpen: false, row: null, field: null, value: "" });

  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const { data, isLoading, isFetching, isError, error, markAttendance } = useAttendance({
    date: selectedDate,
    startDate: selectedDate,
    endDate: selectedDate,
    limit: 200,
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
    const dateRange = getDateRange(selectedDate, selectedDate);
    const daily = data?.dailyRecords || [];

    const byKey = new Map(daily.map((item) => [item.key, item]));

    const employeeIds = new Set<string>();
    (employees || []).forEach((e) => {
      if (e?.employeeId && EMPLOYEE_ID_REGEX.test(e.employeeId)) {
        employeeIds.add(e.employeeId);
      }
    });

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
  }, [data?.dailyRecords, employees, selectedDate, employeeNameMap, employeeScheduleMap]);

  const stats = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc[row.status] += 1;
        return acc;
      },
      { present: 0, late: 0, absent: 0 } as Record<TableStatus, number>,
    );
  }, [rows]);

  useEffect(() => {
    const socket = getAttendanceSocket();
    if (!socket) return;

    const onAttendanceUpdate = (payload: AttendanceRealtimeEventPayload) => {
      if (!payload?.employeeId) return;

      setLiveAttendanceEvent(payload);
      toast.success(payload.message || "تم تسجيل حضور جديد");

      void queryClient.invalidateQueries({ queryKey: ["attendance"], exact: false });
      void queryClient.refetchQueries({ queryKey: ["attendance"], exact: false });
    };

    socket.on("attendanceUpdate", onAttendanceUpdate);

    return () => {
      socket.off("attendanceUpdate", onAttendanceUpdate);
    };
  }, [queryClient]);

  // فتح النافذة المنبثقة بدلاً من window.prompt
  const handleOpenTimeModal = (row: AttendanceTableRow, field: "checkIn" | "checkOut") => {
    if (!EMPLOYEE_ID_REGEX.test(row.employeeId)) {
      window.alert(`لا يمكن تسجيل الحضور لهذا السطر لأن رقم الموظف غير صالح: ${row.employeeId}`);
      return;
    }

    const defaultValue = field === "checkOut" && row.checkOut
      ? normalizeHHmm(row.checkOut)
      : field === "checkIn" && row.checkIn
        ? normalizeHHmm(row.checkIn)
        : timeNow();
    setTimeModal({ isOpen: true, row, field, value: defaultValue });
  };

  // حفظ الوقت المدخل في النافذة المنبثقة
  const handleSaveTime = () => {
    const { row, field, value } = timeModal;
    if (!row || !field) return;

    if (!value) {
      window.alert("الرجاء إدخال الوقت");
      return;
    }

    const normalizedValue = normalizeHHmm(value);

    if (!HH_MM_REGEX.test(normalizedValue)) {
      window.alert("صيغة الوقت غير صحيحة. الرجاء استخدام HH:mm");
      return;
    }

    markAttendance.mutate({
      employeeId: row.employeeId,
      date: row.date,
      checkIn: field === "checkIn" ? normalizedValue : undefined,
      checkOut: field === "checkOut" ? normalizedValue : undefined,
      source: "manual",
    });

    setTimeModal({ isOpen: false, row: null, field: null, value: "" });
  };

  if (isLoading || employeesLoading) return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#00bba7] to-[#E7C873]">
      <div className="flex flex-col items-center gap-4 relative z-10 bg-white/20 p-8 rounded-3xl backdrop-blur-md border border-[#E7C873] shadow-2xl">
        <div className="w-14 h-14 border-4 border-white/30 border-t-white rounded-full animate-spin shadow-lg" />
        <p className="text-white font-bold animate-pulse text-sm">جاري معالجة السجلات...</p>
      </div>
    </div>
  );

  if (isError) {
    return <div className="p-8 text-center text-red-600 font-bold bg-rose-50/50 mt-10 rounded-2xl mx-10">حدث خطأ في تحميل الحضور: {(error as Error)?.message || "خطأ غير معروف"}</div>;
  }

  return (
    <div className="relative z-10 w-full max-w-7xl min-h-[85vh] mx-auto bg-white/70 backdrop-blur-3xl rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border-2 border-[#E7C873]/80 flex flex-col overflow-hidden" dir="rtl">
        
        {/* محتوى الصفحة الداخلي */}
        <div className="p-6 md:p-10 h-full overflow-y-auto custom-scrollbar">
                          
        {/* مسار التنقل (Breadcrumbs) - تم نقله وتنسيقه ليكون داخل الحاوية الزجاجية */}
        <nav className="mb-6 flex items-center gap-2 text-xs font-extrabold text-slate-500 bg-white/60 backdrop-blur-md w-fit px-4 py-2.5 rounded-2xl border border-white/80 shadow-sm">
          <span className="hover:text-[#00bba7] cursor-pointer transition-colors">إدارة الموارد البشرية</span>
          <ChevronLeft size={14} className="text-[#E7C873]" />
          <span className="text-[#00bba7]">سجل الحضور</span>
        </nav>
          {/* الترويسة */}
          <header className="mb-10 text-right border-b border-black/5 pb-6 relative">
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-gradient-to-br from-[#00bba7] to-[#008275] rounded-2xl shadow-lg shadow-[#00bba7]/20 border border-[#00bba7]/20">
                    <ClipboardCheck size={24} className="text-white animate-bounce" />
                  </div>
                  <h1 className="text-3xl font-black text-slate-800 tracking-tight">سجل الحضور والانصراف</h1>
                </div>
                <p className="text-slate-500 text-sm font-medium pr-14 mt-1">جاهز للتكامل الفوري مع جهاز البصمة (BASSAMA) باستخدام <span className="font-mono bg-white px-1.5 py-0.5 rounded shadow-sm text-[#00bba7]">employeeId</span></p>

                {/* التنبيه الفوري */}
                {liveAttendanceEvent && (
                  <div className="mt-5 rounded-2xl border border-[#00bba7]/20 bg-white/60 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 flex items-start justify-between gap-4 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-[#00bba7]/10 rounded-xl">
                        <Fingerprint size={18} className="text-[#00bba7] animate-pulse" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#00bba7]">{liveAttendanceEvent.message}</p>
                        <p className="text-xs text-slate-500 mt-1 font-bold">
                          {liveAttendanceEvent.employeeName} <span className="text-slate-300 mx-1">|</span> <span className="font-mono">{liveAttendanceEvent.employeeId}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLiveAttendanceEvent(null)}
                      className="text-slate-400 hover:text-rose-500 transition-colors bg-white hover:bg-rose-50 p-1.5 rounded-full shadow-sm"
                      aria-label="إغلاق التنبيه الفوري"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4 xl:mt-0 flex flex-wrap items-end gap-4 w-full xl:w-auto">
                {/* كارد التاريخ بأسلوب Glassmorphism */}
                <div className="bg-white/80 backdrop-blur-md border border-white/80 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-1 xl:flex-none hover:shadow-md transition-all group">
                  <label className="flex items-center gap-2 text-xs font-bold text-[#00bba7] mb-2">
                    <CalendarIcon size={14} className="group-hover:animate-pulse" />
                    التاريخ
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    max={today}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-100 focus:ring-2 focus:ring-[#00bba7]/50 focus:border-[#00bba7] outline-none text-slate-700 font-mono text-sm transition-all"
                  />
                </div>

                {/* كارد الإحصائيات بأسلوب Glassmorphism */}
                <div className="flex flex-wrap items-center gap-3 mr-auto bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition-all">
                  <span className="bg-[#00bba7]/10 text-[#00bba7] px-4 py-1.5 rounded-xl text-xs font-bold border border-[#00bba7]/20 shadow-sm">حاضر: {stats.present}</span>
                  <span className="bg-orange-50 text-orange-600 px-4 py-1.5 rounded-xl text-xs font-bold border border-orange-100 shadow-sm">متأخر: {stats.late}</span>
                  <span className="bg-red-50 text-red-600 px-4 py-1.5 rounded-xl text-xs font-bold border border-red-100 shadow-sm">غائب: {stats.absent}</span>
                  <div className="w-px h-6 bg-slate-200 mx-1 hidden md:block"></div>
                  <span className="text-slate-500 px-3 py-1 text-xs font-bold">
                    {isFetching ? (
                      <span className="flex items-center gap-2"><Loader2 size={12} className="animate-spin text-[#00bba7]" /> تحديث...</span>
                    ) : (
                      <span className="font-mono">{selectedDate}</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* 2. الجدول بتصميم الكارد مع الشادو */}
          <div className="bg-white rounded-[2.5rem] shadow-[0_25px_50px_rgba(0,0,0,0.05)] border border-white/80 overflow-hidden">
            <div className="w-full overflow-x-auto custom-scrollbar">
              <table className="w-full text-right border-collapse min-w-245">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="p-5 text-xs font-extrabold text-[#00bba7] uppercase tracking-wider">الموظف</th>
                    <th className="p-5 text-xs font-extrabold text-[#00bba7] uppercase tracking-wider">التاريخ</th>
                    <th className="p-5 text-xs font-extrabold text-[#00bba7] uppercase tracking-wider">الدخول</th>
                    <th className="p-5 text-xs font-extrabold text-[#00bba7] uppercase tracking-wider">الخروج</th>
                    <th className="p-5 text-xs font-extrabold text-[#00bba7] uppercase tracking-wider text-center">الحالة</th>
                    <th className="p-5 text-xs font-extrabold text-[#00bba7] uppercase tracking-wider text-center">المصدر</th>
                    <th className="p-5 text-xs font-extrabold text-[#00bba7] uppercase tracking-wider text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {markAttendance.isPending && (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-[#00bba7] bg-[#00bba7]/5">
                        <span className="inline-flex items-center gap-2 font-bold">
                          <Loader2 size={18} className="animate-spin" />
                          جارٍ حفظ سجل الحضور...
                        </span>
                      </td>
                    </tr>
                  )}
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-16 text-center text-slate-400 font-medium">
                        لا توجد بيانات حضور ضمن هذا النطاق
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={row.key} className="hover:bg-[#00bba7]/[0.02] transition-colors group">
                        <td className="p-4">
                          <div>
                            <p className="font-bold text-slate-800 text-sm group-hover:text-[#00bba7] transition-colors">{row.employeeName}</p>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">{row.employeeId}</p>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-slate-500 font-medium">{toArabicDate(row.date)}</td>
                        <td className="p-4 text-sm text-slate-800 font-bold">{normalizeHHmm(row.checkIn) || "—"}</td>
                        <td className="p-4 text-sm text-slate-800 font-bold">{normalizeHHmm(row.checkOut) || "—"}</td>
                        <td className="p-4 text-center">
                          <span className={`px-4 py-1.5 rounded-xl text-[11px] font-bold shadow-sm ${statusUi[row.status].classes}`}>
                            {statusUi[row.status].label}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {row.checkIn || row.checkOut ? (
                            <span className="inline-flex items-center gap-2 text-xs font-semibold">
                              {row.source === "device" ? (
                                <>
                                  <Fingerprint size={16} className="text-[#00bba7] group-hover:animate-pulse" />
                                  <span className="text-[#00bba7]">جهاز</span>
                                </>
                              ) : (
                                <>
                                  <PencilLine size={16} className="text-[#E7C873] group-hover:animate-pulse" />
                                  <span className="text-[#E7C873]">يدوي</span>
                                </>
                              )}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleOpenTimeModal(row, "checkIn")}
                              disabled={markAttendance.isPending}
                              className="group/btn inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[#00bba7] bg-[#00bba7]/5 hover:bg-[#00bba7]/10 border border-transparent hover:border-[#00bba7]/20 text-xs font-bold disabled:opacity-50 active:scale-95 transition-all shadow-sm"
                            >
                              <LogIn size={15} className="group-hover/btn:-translate-x-1 transition-transform" />
                              {row.checkIn ? "تعديل دخول" : "تسجيل دخول"}
                            </button>

                            <button
                              onClick={() => handleOpenTimeModal(row, "checkOut")}
                              disabled={markAttendance.isPending || !row.checkIn}
                              className="group/btn inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 text-xs font-bold disabled:opacity-50 active:scale-95 transition-all shadow-sm"
                              title={!row.checkIn ? "يجب تسجيل الدخول أولاً" : "تسجيل/تعديل الخروج"}
                            >
                              <LogOut size={15} className="group-hover/btn:translate-x-1 transition-transform" />
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

          <div className="mt-8 bg-white/80 backdrop-blur-md p-5 rounded-[2rem] border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="text-xs text-slate-500 font-medium flex items-center gap-2.5">
              <Clock3 size={16} className="text-[#E7C873] animate-pulse" />
              يعتبر الموظف متأخراً إذا تجاوز وقت الدخول وقت الدوام المجدول + 15 دقيقة.
            </div>
            <div className="text-xs text-slate-500 font-medium flex items-center gap-2.5">
              <Fingerprint size={16} className="text-[#00bba7] animate-pulse" />
              تحديثات فورية من أجهزة البصمة، تأكد من صحة رمز الموظف.
            </div>
          </div>

          {/* النافذة المنبثقة (Modal) لإدخال الوقت بتصميم Glassmorphism */}
          {timeModal.isOpen && timeModal.row && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
              <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.2)] border border-white w-full max-w-lg overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-200">
                
                {/* الحاوية اليمنى: إدخال الوقت */}
                <div className="p-8 flex-1 order-2 md:order-1">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-[#00bba7] flex items-center gap-2">
                      {timeModal.field === 'checkIn' ? <LogIn className="text-[#E7C873]" /> : <LogOut className="text-[#E7C873]" />}
                      {timeModal.field === 'checkIn' ? 'تسجيل الدخول' : 'تسجيل الخروج'}
                    </h3>
                    <button 
                      onClick={() => setTimeModal({ isOpen: false, row: null, field: null, value: "" })}
                      className="text-slate-400 hover:text-rose-500 transition-colors bg-slate-50 hover:bg-rose-50 p-1.5 rounded-full"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <label className="block text-sm font-bold text-slate-700 mb-2">حدد الوقت بدقة</label>
                  <input 
                    type="time" 
                    value={timeModal.value}
                    onChange={(e) => setTimeModal(prev => ({...prev, value: e.target.value}))}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00bba7]/50 focus:border-[#00bba7] outline-none font-mono text-xl text-center text-slate-800 transition-all shadow-inner"
                    dir="ltr"
                  />

                  <div className="mt-8 flex gap-3">
                    <button 
                       onClick={handleSaveTime}
                       className="flex-1 bg-gradient-to-r from-[#00bba7] to-[#008275] hover:from-[#00a392] hover:to-[#006e63] active:scale-95 text-white font-bold py-3 rounded-xl transition-all shadow-[0_10px_20px_rgba(0,187,167,0.3)] border border-[#00bba7]/50"
                    >
                      حفظ السجل
                    </button>
                    <button 
                       onClick={() => setTimeModal({ isOpen: false, row: null, field: null, value: "" })}
                       className="flex-1 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold py-3 rounded-xl transition-all border border-slate-200"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>

                {/* الحاوية اليسرى: عرض التاريخ واسم الموظف */}
                <div className="bg-slate-50/50 p-8 md:w-2/5 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-center items-center text-center order-1 md:order-2">
                   <CalendarIcon size={40} className="text-[#E7C873] mb-4 drop-shadow-md animate-bounce" />
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">تاريخ السجل</p>
                   <p className="text-xl font-black text-[#00bba7] font-mono mb-6">{timeModal.row.date}</p>
                   <p className="text-sm font-bold text-slate-800 line-clamp-2 leading-relaxed">{timeModal.row.employeeName}</p>
                </div>

              </div>
            </div>
          )}
        </div>
    </div>
  );
}