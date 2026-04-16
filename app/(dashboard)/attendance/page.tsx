// "use client";

// import { useMemo, useState } from "react";
// import { Calendar as CalendarIcon, Fingerprint, PencilLine, Clock3, LogIn, LogOut, Loader2 } from "lucide-react";
// import { useAttendance } from "@/hooks/useAttendance";
// import { useEmployees } from "@/hooks/useEmployees";

// type TableStatus = "present" | "late" | "absent";

// const HH_MM_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
// const EMPLOYEE_ID_REGEX = /^EMP[0-9]{3,}$/;

// const toMinutes = (time?: string) => {
//   if (!time) return null;
//   const normalized = time.slice(0, 5);
//   const [h, m] = normalized.split(":").map(Number);
//   if (Number.isNaN(h) || Number.isNaN(m)) return null;
//   return (h * 60) + m;
// };

// const toLocalDateString = (date = new Date()) => {
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const day = String(date.getDate()).padStart(2, "0");
//   return `${year}-${month}-${day}`;
// };

// const getToday = () => toLocalDateString(new Date());

// const timeNow = () => {
//   const now = new Date();
//   return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
// };

// const getDateRange = (startDate: string, endDate: string) => {
//   const start = new Date(`${startDate}T00:00:00`);
//   const end = new Date(`${endDate}T00:00:00`);
//   const dates: string[] = [];

//   if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return dates;

//   const cursor = new Date(start);
//   while (cursor <= end) {
//     dates.push(toLocalDateString(cursor));
//     cursor.setDate(cursor.getDate() + 1);
//   }
//   return dates;
// };

// const toArabicDate = (date: string) =>
//   new Intl.DateTimeFormat("ar-EG", {
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//   }).format(new Date(`${date}T00:00:00`));

// const getStatus = (checkIn?: string, scheduledStart?: string): TableStatus => {
//   if (!checkIn) return "absent";

//   const checkInMinutes = toMinutes(checkIn);
//   const scheduledMinutes = toMinutes(scheduledStart || "08:00");

//   if (checkInMinutes === null || scheduledMinutes === null) return "present";
//   if (checkInMinutes > (scheduledMinutes + 15)) return "late";

//   return "present";
// };

// const statusUi: Record<TableStatus, { label: string; classes: string }> = {
//   present: { label: "حاضر", classes: "text-blue-700 bg-blue-50 border-blue-200" },
//   late: { label: "متأخر", classes: "text-orange-700 bg-orange-50 border-orange-200" },
//   absent: { label: "غائب", classes: "text-red-700 bg-red-50 border-red-200" },
// };

// interface AttendanceTableRow {
//   key: string;
//   employeeId: string;
//   employeeName: string;
//   date: string;
//   checkIn: string;
//   checkOut: string;
//   scheduledStart?: string;
//   source: "manual" | "device";
//   status: TableStatus;
// }

// export default function AttendancePage() {
//   const today = getToday();
//   const [startDate, setStartDate] = useState(today);
//   const [endDate, setEndDate] = useState(today);

//   const { data: employees = [], isLoading: employeesLoading } = useEmployees();
//   const { data, isLoading, isFetching, isError, error, markAttendance } = useAttendance({
//     startDate,
//     endDate,
//     limit: 200,
//   });

//   const employeeNameMap = useMemo(() => {
//     const map = new Map<string, string>();
//     if (Array.isArray(employees)) {
//       for (const employee of employees) {
//         if (employee?.employeeId) map.set(employee.employeeId, employee.name || employee.employeeId);
//       }
//     }
//     return map;
//   }, [employees]);

//   const employeeScheduleMap = useMemo(() => {
//     const map = new Map<string, string>();
//     if (Array.isArray(employees)) {
//       for (const employee of employees) {
//         if (employee?.employeeId) map.set(employee.employeeId, employee.scheduledStart || "08:00");
//       }
//     }
//     return map;
//   }, [employees]);

//   const rows = useMemo(() => {
//     const dateRange = getDateRange(startDate, endDate);
//     const daily = data?.dailyRecords || [];

//     const byKey = new Map(daily.map((item) => [item.key, item]));

//     const employeeIds = new Set<string>();
//     (employees || []).forEach((e) => {
//       if (e?.employeeId && EMPLOYEE_ID_REGEX.test(e.employeeId)) {
//         employeeIds.add(e.employeeId);
//       }
//     });
//     (daily || []).forEach((d) => {
//       if (d?.employeeId && EMPLOYEE_ID_REGEX.test(d.employeeId)) {
//         employeeIds.add(d.employeeId);
//       }
//     });

//     const tableRows: AttendanceTableRow[] = [];

//     for (const date of dateRange) {
//       for (const employeeId of Array.from(employeeIds).sort()) {
//         const key = `${employeeId}-${date}`;
//         const entry = byKey.get(key);
//         const checkIn = entry?.checkIn || "";
//         const checkOut = entry?.checkOut || "";
//         const scheduledStart = employeeScheduleMap.get(employeeId) || "08:00";

//         tableRows.push({
//           key,
//           employeeId,
//           employeeName: employeeNameMap.get(employeeId) || employeeId,
//           date,
//           checkIn,
//           checkOut,
//           scheduledStart,
//           source: entry?.source || "manual",
//           status: getStatus(checkIn, scheduledStart),
//         });
//       }
//     }

//     return tableRows.sort((a, b) => `${b.date}-${b.employeeId}`.localeCompare(`${a.date}-${a.employeeId}`));
//   }, [data?.dailyRecords, employees, startDate, endDate, employeeNameMap, employeeScheduleMap]);

//   const stats = useMemo(() => {
//     return rows.reduce(
//       (acc, row) => {
//         acc[row.status] += 1;
//         return acc;
//       },
//       { present: 0, late: 0, absent: 0 } as Record<TableStatus, number>,
//     );
//   }, [rows]);

//   const handleMark = (row: AttendanceTableRow, field: "checkIn" | "checkOut") => {
//     if (!EMPLOYEE_ID_REGEX.test(row.employeeId)) {
//       window.alert(`لا يمكن تسجيل الحضور لهذا السطر لأن رقم الموظف غير صالح: ${row.employeeId}`);
//       return;
//     }

//     const defaultValue = field === "checkOut" && row.checkOut ? row.checkOut : field === "checkIn" && row.checkIn ? row.checkIn : timeNow();
//     const title = field === "checkIn" ? "الدخول" : "الخروج";
//     const entered = window.prompt(`أدخل وقت ${title} بصيغة HH:mm`, defaultValue);

//     if (!entered) return;
//     if (!HH_MM_REGEX.test(entered)) {
//       window.alert("صيغة الوقت غير صحيحة. الرجاء استخدام HH:mm");
//       return;
//     }

//     markAttendance.mutate({
//       employeeId: row.employeeId,
//       date: row.date,
//       checkIn: field === "checkIn" ? entered : undefined,
//       checkOut: field === "checkOut" ? entered : undefined,
//       source: "manual",
//     });
//   };

//   if (isLoading || employeesLoading) return <div className="p-8">جاري تحميل سجلات الحضور...</div>;
//   if (isError) {
//     return <div className="p-8 text-red-600">حدث خطأ في تحميل الحضور: {(error as Error)?.message || "خطأ غير معروف"}</div>;
//   }

//   return (
//     <div className="min-h-screen bg-[#f8fafc] p-8" dir="rtl">
//       <header className="mb-8 text-right">
//         <h1 className="text-2xl font-bold text-slate-900">سجل الحضور والانصراف</h1>
//         <p className="text-slate-500 text-sm mt-1">جاهز للتكامل مع جهاز البصمة (BASSAMA) باستخدام employeeId</p>

//         <div className="mt-6 flex flex-wrap items-end gap-4">
//           <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm min-w-65">
//             <label className="block text-xs text-slate-500 mb-1">من تاريخ</label>
//             <input
//               type="date"
//               value={startDate}
//               max={endDate}
//               onChange={(e) => setStartDate(e.target.value)}
//               className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
//             />
//           </div>

//           <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm min-w-65">
//             <label className="block text-xs text-slate-500 mb-1">إلى تاريخ</label>
//             <input
//               type="date"
//               value={endDate}
//               min={startDate}
//               onChange={(e) => setEndDate(e.target.value)}
//               className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
//             />
//           </div>

//           <div className="flex items-center gap-2 mr-auto">
//             <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold border border-blue-200">حاضر: {stats.present}</span>
//             <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-xs font-bold border border-orange-200">متأخر: {stats.late}</span>
//             <span className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs font-bold border border-red-200">غائب: {stats.absent}</span>
//             <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-xs font-bold border border-slate-200">
//               {isFetching ? "تحديث..." : `${startDate} → ${endDate}`}
//             </span>
//           </div>
//         </div>
//       </header>

//       <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
//         <div className="w-full overflow-x-auto">
//   <table className="w-full text-right border-collapse min-w-245">
//           <thead>
//             <tr className="bg-slate-50/50 border-b border-slate-100">
//               <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">الموظف</th>
//               <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">التاريخ</th>
//               <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">الدخول</th>
//               <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">الخروج</th>
//               <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">الحالة</th>
//               <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">المصدر</th>
//               <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">إجراءات</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-slate-100">
//             {markAttendance.isPending && (
//               <tr>
//                 <td colSpan={7} className="p-4 text-center text-slate-500 bg-blue-50/50">
//                   <span className="inline-flex items-center gap-2 font-semibold text-blue-700">
//                     <Loader2 size={16} className="animate-spin" />
//                     جارٍ حفظ سجل الحضور...
//                   </span>
//                 </td>
//               </tr>
//             )}
//             {rows.length === 0 ? (
//               <tr>
//                 <td colSpan={7} className="p-8 text-center text-slate-500">
//                   لا توجد بيانات حضور ضمن هذا النطاق
//                 </td>
//               </tr>
//             ) : (
//               rows.map((row) => (
//                 <tr key={row.key} className="hover:bg-slate-50/50 transition-colors">
//                 <td className="p-4">
//                   <div className="flex items-center gap-3">
//                     <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold">
//                       {row.employeeName[0] || "م"}
//                     </div>
//                     <div>
//                       <p className="font-semibold text-slate-700 text-sm">{row.employeeName}</p>
//                       <p className="text-xs text-slate-400 font-mono">{row.employeeId}</p>
//                     </div>
//                   </div>
//                 </td>
//                 <td className="p-4 text-sm text-slate-500 font-medium">{toArabicDate(row.date)}</td>
//                 <td className="p-4 text-sm text-slate-800 font-semibold">{row.checkIn || "—"}</td>
//                 <td className="p-4 text-sm text-slate-800 font-semibold">{row.checkOut || "—"}</td>
//                 <td className="p-4 text-center">
//                   <span className={`px-4 py-1.5 rounded-xl text-[11px] font-bold border ${statusUi[row.status].classes}`}>
//                     {statusUi[row.status].label}
//                   </span>
//                 </td>
//                 <td className="p-4 text-center">
//                   {row.checkIn || row.checkOut ? (
//                     <span className="inline-flex items-center gap-2 text-xs font-semibold">
//                       {row.source === "device" ? (
//                         <>
//                           <Fingerprint size={15} className="text-cyan-600" />
//                           <span className="text-cyan-700">جهاز</span>
//                         </>
//                       ) : (
//                         <>
//                           <PencilLine size={15} className="text-slate-600" />
//                           <span className="text-slate-700">يدوي</span>
//                         </>
//                       )}
//                     </span>
//                   ) : (
//                     <span className="text-slate-300">—</span>
//                   )}
//                 </td>
//                 <td className="p-4 text-center">
//                   <div className="flex items-center justify-center gap-2">
//                     <button
//                       onClick={() => handleMark(row, "checkIn")}
//                       disabled={markAttendance.isPending}
//                       className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 text-xs font-bold disabled:opacity-50 active:scale-95"
//                     >
//                       <LogIn size={14} />
//                       {row.checkIn ? "تعديل دخول" : "تسجيل دخول"}
//                     </button>

//                     <button
//                       onClick={() => handleMark(row, "checkOut")}
//                       disabled={markAttendance.isPending || !row.checkIn}
//                       className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-100 text-xs font-bold disabled:opacity-50 active:scale-95"
//                       title={!row.checkIn ? "يجب تسجيل الدخول أولاً" : "تسجيل/تعديل الخروج"}
//                     >
//                       <LogOut size={14} />
//                       {row.checkOut ? "تعديل خروج" : "تسجيل خروج"}
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//         </div>
//       </div>

//       <div className="mt-4 text-xs text-slate-500 flex items-center gap-2">
//         <Clock3 size={14} />
//         يعتبر الموظف متأخراً إذا تجاوز وقت الدخول وقت الدوام المجدول + 15 دقيقة.
//       </div>

//       <div className="mt-2 text-xs text-slate-400 flex items-center gap-2">
//         <CalendarIcon size={14} />
//         جميع العمليات تعتمد على <span className="font-mono">employeeId</span> لتجهيز التكامل المستقبلي مع جهاز البصمة.
//       </div>
//     </div>
//   );
// }
"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Calendar as CalendarIcon, Fingerprint, PencilLine, Clock3, LogIn, LogOut, Loader2, X } from "lucide-react";
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
    <div className="p-8 h-screen flex items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-[#00bba7] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (isError) {
    return <div className="p-8 text-red-600">حدث خطأ في تحميل الحضور: {(error as Error)?.message || "خطأ غير معروف"}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 relative" dir="rtl">
      
      <header className="mb-10 text-right">
        <h1 className="text-3xl font-extrabold text-[#00bba7]">سجل الحضور والانصراف</h1>
        <p className="text-slate-500 text-sm mt-2 font-medium">جاهز للتكامل مع جهاز البصمة (BASSAMA) باستخدام employeeId</p>

        {liveAttendanceEvent && (
          <div className="mt-5 rounded-2xl border border-[#00bba7]/20 bg-[#00bba7]/10 p-4 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Fingerprint size={18} className="text-[#00bba7] mt-0.5" />
              <div>
                <p className="text-sm font-bold text-slate-800">{liveAttendanceEvent.message}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {liveAttendanceEvent.employeeName} - {liveAttendanceEvent.employeeId}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLiveAttendanceEvent(null)}
              className="text-slate-400 hover:text-rose-500 transition-colors"
              aria-label="إغلاق التنبيه الفوري"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-end gap-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm min-w-65 flex-1 md:flex-none hover:border-[#00bba7]/30 transition-colors">
            <label className="block text-xs font-bold text-[#00bba7] mb-2">التاريخ</label>
            <input
              type="date"
              value={selectedDate}
              max={today}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-100 focus:ring-2 focus:ring-[#00bba7]/50 focus:border-[#00bba7] outline-none text-slate-700 font-mono text-sm transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 mr-auto bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <span className="bg-[#00bba7]/10 text-[#00bba7] px-4 py-1.5 rounded-xl text-xs font-bold">حاضر: {stats.present}</span>
            <span className="bg-orange-50 text-orange-600 px-4 py-1.5 rounded-xl text-xs font-bold">متأخر: {stats.late}</span>
            <span className="bg-red-50 text-red-600 px-4 py-1.5 rounded-xl text-xs font-bold">غائب: {stats.absent}</span>
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
      </header>

      <div className="bg-white rounded-4xl overflow-hidden border border-slate-100 shadow-sm">
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
                  <td colSpan={7} className="p-12 text-center text-slate-400 font-medium">
                    لا توجد بيانات حضور ضمن هذا النطاق
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.key} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{row.employeeName}</p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{row.employeeId}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-500 font-medium">{toArabicDate(row.date)}</td>
                    <td className="p-4 text-sm text-slate-800 font-bold">{normalizeHHmm(row.checkIn) || "—"}</td>
                    <td className="p-4 text-sm text-slate-800 font-bold">{normalizeHHmm(row.checkOut) || "—"}</td>
                    <td className="p-4 text-center">
                      <span className={`px-4 py-1.5 rounded-xl text-[11px] font-bold ${statusUi[row.status].classes}`}>
                        {statusUi[row.status].label}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {row.checkIn || row.checkOut ? (
                        <span className="inline-flex items-center gap-2 text-xs font-semibold">
                          {row.source === "device" ? (
                            <>
                              <Fingerprint size={16} className="text-[#00bba7]" />
                              <span className="text-[#00bba7]">جهاز</span>
                            </>
                          ) : (
                            <>
                              <PencilLine size={16} className="text-[#E7C873]" />
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
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[#00bba7] bg-[#00bba7]/5 hover:bg-[#00bba7]/10 text-xs font-bold disabled:opacity-50 active:scale-95 transition-all"
                        >
                          <LogIn size={15} />
                          {row.checkIn ? "تعديل دخول" : "تسجيل دخول"}
                        </button>

                        <button
                          onClick={() => handleOpenTimeModal(row, "checkOut")}
                          disabled={markAttendance.isPending || !row.checkIn}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 text-xs font-bold disabled:opacity-50 active:scale-95 transition-all shadow-sm"
                          title={!row.checkIn ? "يجب تسجيل الدخول أولاً" : "تسجيل/تعديل الخروج"}
                        >
                          <LogOut size={15} />
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

      <div className="mt-8 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="text-xs text-slate-500 font-medium flex items-center gap-2.5">
          <Clock3 size={16} className="text-[#E7C873]" />
          يعتبر الموظف متأخراً إذا تجاوز وقت الدخول وقت الدوام المجدول + 15 دقيقة.
        </div>
        <div className="text-xs text-slate-500 font-medium flex items-center gap-2.5">
          <CalendarIcon size={16} className="text-[#00bba7]" />
          العمليات تعتمد على <span className="font-mono bg-slate-50 px-2 py-0.5 rounded text-[#00bba7]">employeeId</span> للتكامل مع البصمة.
        </div>
      </div>

      {/* النافذة المنبثقة (Modal) لإدخال الوقت */}
      {timeModal.isOpen && timeModal.row && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-4xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-200">
            
            {/* الحاوية اليمنى: إدخال الوقت */}
            <div className="p-8 flex-1 order-2 md:order-1">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-[#00bba7]">
                  {timeModal.field === 'checkIn' ? 'تسجيل الدخول' : 'تسجيل الخروج'}
                </h3>
                <button 
                  onClick={() => setTimeModal({ isOpen: false, row: null, field: null, value: "" })}
                  className="text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <label className="block text-sm font-bold text-slate-700 mb-2">حدد الوقت بدقة</label>
              <input 
                type="time" 
                value={timeModal.value}
                onChange={(e) => setTimeModal(prev => ({...prev, value: e.target.value}))}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#00bba7]/50 focus:border-[#00bba7] outline-none font-mono text-xl text-center text-slate-800 transition-all"
                dir="ltr"
              />

              <div className="mt-8 flex gap-3">
                <button 
                   onClick={handleSaveTime}
                   className="flex-1 bg-[#00bba7] hover:bg-[#00bba7]/90 active:scale-95 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-[#00bba7]/20"
                >
                  حفظ السجل
                </button>
                <button 
                   onClick={() => setTimeModal({ isOpen: false, row: null, field: null, value: "" })}
                   className="flex-1 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold py-3 rounded-xl transition-all"
                >
                  إلغاء
                </button>
              </div>
            </div>

            {/* الحاوية اليسرى: عرض التاريخ واسم الموظف */}
            <div className="bg-slate-50 p-8 md:w-2/5 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-center items-center text-center order-1 md:order-2">
               <CalendarIcon size={36} className="text-[#E7C873] mb-4 drop-shadow-sm" />
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">تاريخ السجل</p>
               <p className="text-xl font-black text-[#00bba7] font-mono mb-6">{timeModal.row.date}</p>
               <p className="text-sm font-bold text-slate-800 line-clamp-1">{timeModal.row.employeeName}</p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}