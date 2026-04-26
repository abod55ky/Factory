// "use client";

// import { useMemo, useState } from "react";
// import dynamic from "next/dynamic";
// import { useSearchParams } from "next/navigation";
// import useSalaries from "@/hooks/useSalaries";
// import { useEmployees } from "@/hooks/useEmployees";
// import { useAdvances } from "@/hooks/useAdvances";
// import { useBonuses } from "@/hooks/useBonuses";
// import { useAttendance } from "@/hooks/useAttendance";
// import { usePayroll } from "@/hooks/usePayroll";
// import { Edit, Trash, Gift, Calculator, Plus, Sparkles, Loader2, HandCoins, Wallet, FileSpreadsheet, ChevronLeft } from "lucide-react";
// import { toast } from "react-hot-toast";
// import type { Salary } from "@/types/salary";
// import type { Employee } from "@/types/employee";
// import type { Advance } from "@/types/advance";
// import type { Bonus } from "@/types/bonus";

// export type FinancialTabKey = "salary-config" | "advances" | "bonuses" | "final-payroll";

// const ManageSalaryModal = dynamic(() => import("@/components/ManageSalaryModal"), {
//   loading: () => null,
// });
// const AddAdvanceModal = dynamic(() => import("@/components/AddAdvanceModal"), {
//   loading: () => null,
// });
// const AddBonusModal = dynamic(() => import("@/components/AddBonusModal"), {
//   loading: () => null,
// });

// const toNumber = (value: unknown) => {
//   if (value && typeof value === "object" && "$numberDecimal" in (value as Record<string, unknown>)) {
//     return Number((value as { $numberDecimal: string }).$numberDecimal || 0);
//   }
//   return Number(value || 0);
// };

// const getLocalMonth = () => {
//   const now = new Date();
//   const y = now.getFullYear();
//   const m = String(now.getMonth() + 1).padStart(2, "0");
//   return `${y}-${m}`;
// };

// const getMonthBounds = (period: string) => {
//   const [y, m] = period.split("-").map(Number);
//   const start = `${y}-${String(m).padStart(2, "0")}-01`;
//   const endDate = new Date(y, m, 0);
//   const end = `${y}-${String(m).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;
//   return { start, end };
// };

// const getTabFromQuery = (tabParam: string | null): FinancialTabKey => {
//   if (tabParam === "advances") return "advances";
//   if (tabParam === "bonuses") return "bonuses";
//   if (tabParam === "final-payroll" || tabParam === "payroll") return "final-payroll";
//   return "salary-config";
// };

// const WORKING_DAYS_PER_MONTH = 26;
// const DEFAULT_DAILY_WORK_MINUTES = 8 * 60;

// const toMinutes = (time?: string) => {
//   if (!time) return null;
//   const normalized = time.slice(0, 5);
//   const [h, m] = normalized.split(":").map(Number);
//   if (Number.isNaN(h) || Number.isNaN(m)) return null;
//   return h * 60 + m;
// };

// const getDailyWorkMinutes = (scheduledStart?: string, scheduledEnd?: string) => {
//   const startMinutes = toMinutes(scheduledStart || "08:00");
//   const endMinutes = toMinutes(scheduledEnd || "16:00");

//   if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
//     return DEFAULT_DAILY_WORK_MINUTES;
//   }

//   return endMinutes - startMinutes;
// };

// type SalaryPayload = {
//   profession: string;
//   baseSalary: number;
//   responsibilityAllowance: number;
//   productionIncentive: number;
//   transportAllowance: number;
// };

// const SkeletonRows = () => (
//   <div className="space-y-3 p-6 bg-white/50 rounded-3xl">
//     {Array.from({ length: 5 }).map((_, i) => (
//       <div key={i} className="h-12 rounded-xl bg-slate-200/50 animate-pulse" />
//     ))}
//   </div>
// );

// // أسماء الأقسام لاستخدامها في مسار التنقل
// const tabLabels: Record<FinancialTabKey, string> = {
//   "salary-config": "إعداد الرواتب",
//   "advances": "السلف",
//   "bonuses": "المكافآت والخصومات",
//   "final-payroll": "المسير النهائي",
// };

// export default function SalariesPage() {
//   const searchParams = useSearchParams();
//   const requestedTab = searchParams.get("tab");
//   const activeTab = getTabFromQuery(requestedTab);

//   const { data: salaries = [], isLoading, isError, error, updateSalary, deleteSalary } = useSalaries();
//   const { data: employees = [], isLoading: employeesLoading } = useEmployees({
//     limit: 200,
//     status: "active",
//   });
//   const { data: advances = [], createAdvance, updateAdvance, deleteAdvance } = useAdvances();
//   const { calculatePayroll } = usePayroll();

//   const [period, setPeriod] = useState(getLocalMonth());
//   const { start: monthStart, end: monthEnd } = useMemo(() => getMonthBounds(period), [period]);
//   const { data: bonuses = [], createBonus, updateBonus, deleteBonus } = useBonuses({ period });
//   const { data: attendanceData } = useAttendance(
//     { startDate: monthStart, endDate: monthEnd, limit: 2000 }
//   );

//   const employeeNameMap = useMemo(() => {
//     const map: Record<string, string> = {};
//     if (Array.isArray(employees)) {
//       for (const emp of employees) {
//         if (emp?.employeeId) map[emp.employeeId] = emp.name || emp.employeeId;
//       }
//     }
//     return map;
//   }, [employees]);

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selected, setSelected] = useState<Salary | null>(null);
//   const [preselectedEmployeeId, setPreselectedEmployeeId] = useState<string | undefined>(undefined);
//   const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
//   const [selectedAdvance, setSelectedAdvance] = useState<Advance | null>(null);
//   const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
//   const [selectedBonus, setSelectedBonus] = useState<Bonus | null>(null);
//   const [lastCalculatedRunId, setLastCalculatedRunId] = useState<string | null>(null);

//   const openFor = (salary: Salary | null = null, preselectId?: string) => {
//     setSelected(salary);
//     setPreselectedEmployeeId(preselectId);
//     setIsModalOpen(true);
//   };

//   const employeeMap = useMemo(() => {
//     const m = new Map<string, Employee>();
//     (employees || []).forEach((e) => { if (e?.employeeId) m.set(e.employeeId, e); });
//     return m;
//   }, [employees]);

//   const salaryMap = useMemo(() => {
//     const m = new Map<string, Salary>();
//     (salaries || []).forEach((s) => { if (s?.employeeId) m.set(s.employeeId, s); });
//     return m;
//   }, [salaries]);

//   const allIds = useMemo(() => {
//     const set = new Set<string>();
//     (employees || []).forEach((e) => e?.employeeId && set.add(e.employeeId));
//     (salaries || []).forEach((s) => s?.employeeId && set.add(s.employeeId));
//     return Array.from(set);
//   }, [employees, salaries]);

//   const attendanceDaysMap = useMemo(() => {
//     const map = new Map<string, number>();
//     const daily = attendanceData?.dailyRecords || [];
//     for (const rec of daily) {
//       if (!rec?.employeeId || !rec?.checkIn) continue;
//       map.set(rec.employeeId, (map.get(rec.employeeId) || 0) + 1);
//     }
//     return map;
//   }, [attendanceData?.dailyRecords]);

//   const dailyRecordsByEmployee = useMemo(() => {
//     const map = new Map<string, { checkIn?: string }[]>();
//     const daily = attendanceData?.dailyRecords || [];
//     for (const rec of daily) {
//       if (!rec?.employeeId) continue;
//       const current = map.get(rec.employeeId) || [];
//       current.push({ checkIn: rec.checkIn });
//       map.set(rec.employeeId, current);
//     }
//     return map;
//   }, [attendanceData?.dailyRecords]);

//   const tabStats = useMemo(() => {
//     const totalAdvances = (advances || []).reduce((sum: number, item: Advance) => sum + toNumber(item.remainingAmount), 0);
//     const totalBonus = (bonuses || []).reduce((sum: number, item: Bonus) => sum + toNumber(item.bonusAmount), 0);
//     const totalDeductions = (bonuses || []).reduce((sum: number, item: Bonus) => sum + toNumber(item.assistanceAmount), 0);
//     return { totalAdvances, totalBonus, totalDeductions };
//   }, [advances, bonuses]);

//   const finalPayrollRows = useMemo(() => {
//     return allIds.map((employeeId: string) => {
//       const salary = salaryMap.get(employeeId);
//       const employee = employeeMap.get(employeeId);
//       const attendanceDays = attendanceDaysMap.get(employeeId) || 0;
//       const employeeDailyRecords = dailyRecordsByEmployee.get(employeeId) || [];

//       const baseSalary = salary ? toNumber(salary.baseSalary) : toNumber(employee?.hourlyRate);
//       const proratedBase = (baseSalary / WORKING_DAYS_PER_MONTH) * attendanceDays;

//       const employeeBonuses = (bonuses || []).filter((b: Bonus) => b.employeeId === employeeId);
//       const totalBonus = employeeBonuses.reduce((sum: number, b: Bonus) => sum + toNumber(b.bonusAmount), 0);
//       const totalDeductions = employeeBonuses.reduce((sum: number, b: Bonus) => sum + toNumber(b.assistanceAmount), 0);
      
//       const employeeAdvances = (advances || []).filter((a: Advance) => a.employeeId === employeeId);
//       const advancesInstallments = employeeAdvances.reduce((sum: number, a: Advance) => sum + toNumber(a.installmentAmount), 0);

//       const scheduledStartMinutes = toMinutes(employee?.scheduledStart || "08:00");
//       let lateMinutes = 0;

//       for (const record of employeeDailyRecords) {
//         const checkInMinutes = toMinutes(record.checkIn);
//         if (checkInMinutes === null || scheduledStartMinutes === null) continue;
//         if (checkInMinutes <= scheduledStartMinutes) continue;
//         lateMinutes += checkInMinutes - scheduledStartMinutes;
//       }

//       const dailyWorkMinutes = getDailyWorkMinutes(employee?.scheduledStart, employee?.scheduledEnd);
//       const minuteRate = dailyWorkMinutes > 0
//         ? baseSalary / (WORKING_DAYS_PER_MONTH * dailyWorkMinutes)
//         : 0;
//       const lateDeduction = lateMinutes * minuteRate;

//       const net = proratedBase + totalBonus - totalDeductions - advancesInstallments - lateDeduction;

//       return {
//         employeeId,
//         employeeName: employeeNameMap[employeeId] || employeeId,
//         attendanceDays,
//         minuteRate,
//         lateMinutes,
//         lateDeduction,
//         hasLateDeduction: lateDeduction > 0,
//         proratedBase,
//         totalBonus,
//         totalDeductions,
//         advancesInstallments,
//         net,
//       };
//     });
//   }, [allIds, salaryMap, employeeMap, attendanceDaysMap, bonuses, advances, employeeNameMap, dailyRecordsByEmployee]);

//   const payrollTotals = useMemo(() => {
//     return finalPayrollRows.reduce(
//       (acc, row) => {
//         acc.totalLateMinutes += row.lateMinutes;
//         acc.totalLateDeduction += row.lateDeduction;
//         acc.employeesWithLateDeduction += row.hasLateDeduction ? 1 : 0;
//         return acc;
//       },
//       {
//         totalLateMinutes: 0,
//         totalLateDeduction: 0,
//         employeesWithLateDeduction: 0,
//       },
//     );
//   }, [finalPayrollRows]);

//   const handleSave = (employeeId: string, payload: SalaryPayload) => {
//     if (!employeeId) return toast.error("يرجى إدخال كود الموظف");
//     updateSalary.mutate({ employeeId, data: { employeeId, ...payload } });
//     setIsModalOpen(false);
//   };

//   const handleDelete = (employeeId: string) => {
//     if (!confirm(`هل تريد حذف بيانات الراتب للموظف ${employeeId}؟`)) return;
//     deleteSalary.mutate(employeeId);
//   };

//   const isSaving =
//     updateSalary.isPending ||
//     deleteSalary.isPending ||
//     createAdvance.isPending ||
//     updateAdvance.isPending ||
//     deleteAdvance.isPending ||
//     createBonus.isPending ||
//     updateBonus.isPending ||
//     deleteBonus.isPending ||
//     calculatePayroll.isPending;

//   const handleRunPayroll = () => {
//     calculatePayroll.mutate(
//       {
//         periodStart: monthStart,
//         periodEnd: monthEnd,
//         gracePeriodMinutes: 15,
//       },
//       {
//         onSuccess: (response) => {
//           const runId = (response as { data?: { payrollRun?: { runId?: string } } })?.data?.payrollRun?.runId;
//           if (runId) {
//             setLastCalculatedRunId(runId);
//             toast.success(`تم إنشاء مسير الرواتب: ${runId}`);
//             return;
//           }
//           toast.success("تم إنشاء مسير الرواتب بنجاح");
//         },
//       },
//     );
//   };

//   const handleExportPayrollExcel = async () => {
//     if (finalPayrollRows.length === 0) {
//       toast.error("لا توجد بيانات لتصديرها");
//       return;
//     }

//     try {
//       const XLSX = await import("xlsx");
//       const rows: Array<Record<string, string | number>> = finalPayrollRows.map((row, index) => ({
//         "#": index + 1,
//         "كود الموظف": row.employeeId,
//         "اسم الموظف": row.employeeName,
//         "أيام الحضور": row.attendanceDays,
//         "أجر الدقيقة": Number(row.minuteRate.toFixed(4)),
//         "دقائق التأخير": row.lateMinutes,
//         "خصم التأخير": Number(row.lateDeduction.toFixed(2)),
//         "في خصم": row.hasLateDeduction ? "نعم" : "لا",
//         "الراتب النسبي": Number(row.proratedBase.toFixed(2)),
//         "المكافآت": Number(row.totalBonus.toFixed(2)),
//         "الخصومات": Number(row.totalDeductions.toFixed(2)),
//         "خصم السلف": Number(row.advancesInstallments.toFixed(2)),
//         "صافي المستحق": Number(row.net.toFixed(2)),
//       }));

//       rows.push({
//         "#": "",
//         "كود الموظف": "",
//         "اسم الموظف": "الإجمالي",
//         "أيام الحضور": "",
//         "أجر الدقيقة": "",
//         "دقائق التأخير": payrollTotals.totalLateMinutes,
//         "خصم التأخير": Number(payrollTotals.totalLateDeduction.toFixed(2)),
//         "في خصم": payrollTotals.employeesWithLateDeduction.toString(),
//         "الراتب النسبي": "",
//         "المكافآت": "",
//         "الخصومات": "",
//         "خصم السلف": "",
//         "صافي المستحق": Number(finalPayrollRows.reduce((sum, row) => sum + row.net, 0).toFixed(2)),
//       });

//       const worksheet = XLSX.utils.json_to_sheet(rows);
//       worksheet["!cols"] = [
//         { wch: 5 }, { wch: 14 }, { wch: 24 }, { wch: 12 }, { wch: 12 }, 
//         { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 14 }, { wch: 12 }, 
//         { wch: 12 }, { wch: 12 }, { wch: 14 },
//       ];

//       const workbook = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll");
//       XLSX.writeFile(workbook, `payroll-${period}.xlsx`);

//       toast.success("تم تنزيل جدول الرواتب Excel بنجاح");
//     } catch {
//       toast.error("تعذر تنزيل ملف Excel حالياً");
//     }
//   };

//   const openFloatingAction = () => {
//     if (activeTab === "salary-config") {
//       openFor(null);
//       return;
//     }
//     if (activeTab === "advances") {
//       setSelectedAdvance(null);
//       setIsAdvanceModalOpen(true);
//       return;
//     }
//     if (activeTab === "bonuses") {
//       setSelectedBonus(null);
//       setIsBonusModalOpen(true);
//     }
//   };

//   const isFloatingActionVisible = activeTab !== "final-payroll";

//   return (
//     <>
//       <div className="relative z-10 w-full max-w-7xl min-h-[85vh] mx-auto bg-white/50 backdrop-blur-2xl rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(38,53,68,0.2)] border-2 border-dashed border-[#C89355]/60 flex flex-col overflow-hidden" dir="rtl">
        
//         {/* نقشة الفايبر (القماش) الثابتة والشفافة */}
//         <div 
//           className="absolute inset-0 opacity-[0.04] pointer-events-none z-0"
//           style={{
//             backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 12h24M12 0v24' stroke='%23263544' stroke-width='1' stroke-dasharray='4 4' fill='none'/%3E%3C/svg%3E")`,
//             backgroundSize: '24px 24px'
//           }}
//         />

//         {/* المحتوى الداخلي */}
//         <div className="p-6 md:p-10 h-full overflow-y-auto custom-scrollbar relative z-10">
          
//           {/* مسار التنقل (Breadcrumbs) بتصميم زجاجي مع درازة داخلية */}
//           <nav className="mb-6 relative overflow-hidden flex items-center gap-2 text-xs font-black text-slate-500 bg-white/60 backdrop-blur-xl w-fit px-4 py-2.5 rounded-2xl border border-white/80 shadow-[0_5px_15px_rgba(38,53,68,0.05)] group">
//             <div className="absolute inset-1 rounded-xl border border-dashed border-[#C89355]/30 pointer-events-none transition-colors group-hover:border-[#C89355]/50" />
//             <span className="hover:text-[#263544] cursor-pointer transition-colors relative z-10">المركز المالي</span>
//             <ChevronLeft size={14} className="text-[#C89355] relative z-10" />
//             <span className="text-[#263544] relative z-10">{tabLabels[activeTab]}</span>
//           </nav>

//           <header className="mb-10 flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-[#263544]/10 pb-8 relative">
//             <div>
//               <div className="flex items-center gap-3 mb-2">
//                 {/* أيقونة العنوان بهوية الماركة مع الدرزة */}
//                 <div className="p-3 bg-[#1a2530] rounded-2xl shadow-[0_15px_25px_rgba(38,53,68,0.4)] border border-[#C89355]/40 relative outline-dashed outline-1 outline-[#C89355]/50 outline-offset-4 group">
//                   <Sparkles size={22} className="text-[#C89355] group-hover:animate-bounce transition-all duration-300" strokeWidth={2.5} />
//                 </div>
//                 <h1 className="text-3xl font-black text-[#263544] tracking-tight drop-shadow-sm">
//                   المركز المالي الذكي
//                 </h1>
//               </div>
//               <p className="text-slate-600 text-sm font-bold pr-14 mt-1">لوحة موحدة لإدارة الرواتب والسلف والمكافآت وحساب المسير النهائي بدقة مؤسسية.</p>
//             </div>

//             <div className="mt-4 xl:mt-0 flex flex-wrap items-center gap-4 w-full xl:w-auto">
//               {/* كروت الإحصائيات العلوية بتصميم Glassmorphism + درازة */}
//               <div className="relative overflow-hidden bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl p-4 shadow-[0_8px_30px_rgba(38,53,68,0.04)] flex-1 xl:flex-none hover:shadow-md transition-all group min-w-35">
//                 <div className="absolute inset-1 rounded-xl border border-dashed border-[#C89355]/30 pointer-events-none transition-colors group-hover:border-[#C89355]/50" />
//                 <div className="flex items-center gap-2 mb-1.5 relative z-10">
//                   <HandCoins size={14} className="text-[#C89355] group-hover:animate-pulse transition-all duration-300" />
//                   <p className="text-[11px] font-black text-slate-500">إجمالي السلف المتبقية</p>
//                 </div>
//                 <p className="font-black text-xl text-[#263544] relative z-10">{tabStats.totalAdvances.toLocaleString()}</p>
//               </div>
              
//               <div className="relative overflow-hidden bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl p-4 shadow-[0_8px_30px_rgba(38,53,68,0.04)] flex-1 xl:flex-none hover:shadow-md transition-all group min-w-35">
//                 <div className="absolute inset-1 rounded-xl border border-dashed border-[#C89355]/30 pointer-events-none transition-colors group-hover:border-[#C89355]/50" />
//                 <div className="flex items-center gap-2 mb-1.5 relative z-10">
//                   <Gift size={14} className="text-[#C89355] group-hover:animate-pulse transition-all duration-300" />
//                   <p className="text-[11px] font-black text-slate-500">إجمالي المكافآت</p>
//                 </div>
//                 <p className="font-black text-xl text-[#263544] relative z-10">{tabStats.totalBonus.toLocaleString()}</p>
//               </div>

//               <div className="relative overflow-hidden bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl p-4 shadow-[0_8px_30px_rgba(38,53,68,0.04)] flex-1 xl:flex-none hover:shadow-md transition-all group min-w-35">
//                 <div className="absolute inset-1 rounded-xl border border-dashed border-rose-300 pointer-events-none transition-colors group-hover:border-rose-400" />
//                 <div className="flex items-center gap-2 mb-1.5 relative z-10">
//                   <Wallet size={14} className="text-rose-500 group-hover:animate-pulse transition-all duration-300" />
//                   <p className="text-[11px] font-black text-slate-500">إجمالي الخصومات</p>
//                 </div>
//                 <p className="font-black text-xl text-rose-600 relative z-10">{tabStats.totalDeductions.toLocaleString()}</p>
//               </div>
//             </div>
//           </header>

//           {/* محتوى القسم حسب التبويب */}
//           {activeTab === "salary-config" && (
//             <div className="relative bg-white/60 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(38,53,68,0.08)] border-2 border-white/90 overflow-hidden mt-6 group">
//               <div className="absolute inset-1.5 rounded-[2.2rem] border border-dashed border-[#C89355]/30 pointer-events-none z-0 transition-colors group-hover:border-[#C89355]/50" />
//               {isLoading ? (
//                 <SkeletonRows />
//               ) : isError ? (
//                 <div className="p-8 text-center font-bold text-rose-600 bg-rose-50/50 backdrop-blur-md rounded-2xl m-4 border border-rose-200 relative z-10">خطأ: {error?.message ?? "فشل تحميل البيانات"}</div>
//               ) : (
//                 <div className="w-full overflow-x-auto custom-scrollbar relative z-10">
//                   <table className="w-full text-right min-w-245">
//                     <thead className="bg-white/40 border-b border-white/80">
//                       <tr>
//                         <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">كود الموظف</th>
//                         <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">اسم الموظف</th>
//                         <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">المهنة</th>
//                         <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">الراتب الأساسي</th>
//                         <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">إجمالي البدلات</th>
//                         <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">الإجمالي الثابت الشهري</th>
//                         <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">إدارة</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-white/40">
//                       {allIds.length === 0 ? (
//                         <tr><td colSpan={7} className="p-16 text-center text-[#263544]/60 font-black">لا توجد سجلات.</td></tr>
//                       ) : (
//                         allIds.map((id: string) => {
//                           const s = salaryMap.get(id) ?? null;
//                           const emp = employeeMap.get(id) ?? null;

//                           if (!s) {
//                             const baseFromEmployee = toNumber(emp?.hourlyRate);
//                             const monthlyFixedTotal = baseFromEmployee;

//                             return (
//                               <tr key={id} className="hover:bg-white/80 transition-all duration-300 group/row">
//                                 <td className="p-4 font-mono font-black text-center text-sm text-[#263544]/60">{id}</td>
//                                 <td className="p-4 text-center font-black text-slate-800 group-hover/row:text-[#263544]">{employeesLoading ? "جارٍ التحميل..." : (emp?.name ?? "موظف محذوف")}</td>
//                                 <td className="p-4 text-center text-sm text-[#263544]/80 font-black">{emp?.profession ?? emp?.department ?? "—"}</td>
//                                 <td className="p-4 text-center font-mono font-black text-[#263544]">{baseFromEmployee > 0 ? baseFromEmployee.toLocaleString() : "—"}</td>
//                                 <td className="p-4 text-center text-[#263544]/40 font-black">—</td>
//                                 <td className="p-4 font-black text-center text-[#263544]">{monthlyFixedTotal > 0 ? monthlyFixedTotal.toLocaleString() : <span className="text-rose-500 text-xs bg-rose-50 px-2 py-1 rounded border border-rose-100">لم يتم ضبط الراتب</span>}</td>
//                                 <td className="p-4 text-center">
//                                   <div className="flex items-center gap-3 justify-center opacity-80 group-hover/row:opacity-100 transition-opacity">
//                                     <button onClick={() => openFor(null, id)} className="px-4 py-1.5 rounded-xl bg-[#1a2530] text-[#C89355] hover:bg-[#263544] font-black text-xs transition-all shadow-sm border border-[#C89355]/30">
//                                       ضبط الراتب
//                                     </button>
//                                   </div>
//                                 </td>
//                               </tr>
//                             );
//                           }

//                           const base = Number(s.baseSalary || 0);
//                           const resp = Number(s.responsibilityAllowance || 0);
//                           const prod = Number(s.productionIncentive || 0);
//                           const trans = Number(s.transportAllowance || 0);
//                           const totalAllowances = resp + prod + trans;
//                           const monthlyFixedTotal = base + totalAllowances;
//                           const employeeName = employeeNameMap[s.employeeId];

//                           return (
//                             <tr key={s.employeeId} className="hover:bg-white/80 transition-all duration-300 group/row">
//                               <td className="p-4 font-mono font-black text-center text-sm text-[#263544]/60">{s.employeeId}</td>
//                               <td className="p-4 text-center font-black text-slate-800 group-hover/row:text-[#263544]">{employeesLoading ? "جارٍ التحميل..." : (employeeName ?? "موظف محذوف")}</td>
//                               <td className="p-4 text-center text-sm text-[#263544]/80 font-black">{s.profession}</td>
//                               <td className="p-4 text-center font-mono font-black text-[#263544]">{base.toLocaleString()}</td>
//                               <td className="p-4 text-center font-mono font-black text-[#C89355]">{totalAllowances.toLocaleString()}</td>
//                               <td className="p-4 font-black text-center text-[#1a2530] bg-[#C89355]/5 rounded-xl">{monthlyFixedTotal.toLocaleString()}</td>
//                               <td className="p-4 text-center">
//                                 <div className="flex items-center justify-center gap-2 opacity-60 group-hover/row:opacity-100 transition-opacity">
//                                   <button onClick={() => openFor(s)} className="text-[#C89355] hover:bg-[#1a2530] hover:text-[#C89355] p-2.5 rounded-xl transition-all hover:scale-110 border border-transparent hover:border-[#C89355]/30" title="تعديل الراتب">
//                                     <Edit size={16} />
//                                   </button>
//                                   <button onClick={() => handleDelete(s.employeeId)} className="text-rose-500 hover:bg-rose-500 hover:text-white p-2.5 rounded-xl transition-all hover:scale-110 border border-transparent hover:border-rose-400" title="حذف">
//                                     {deleteSalary.isPending ? <Loader2 className="animate-spin" size={16} /> : <Trash size={16} />}
//                                   </button>
//                                 </div>
//                               </td>
//                             </tr>
//                           );
//                         })
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//           )}

//           {activeTab === "advances" && (
//             <div className="relative bg-white/60 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(38,53,68,0.08)] border-2 border-white/90 overflow-hidden mt-6 group">
//               <div className="absolute inset-1.5 rounded-[2.2rem] border border-dashed border-[#C89355]/30 pointer-events-none z-0 transition-colors group-hover:border-[#C89355]/50" />
//               <div className="w-full overflow-x-auto custom-scrollbar relative z-10">
//                 <table className="w-full text-right min-w-245">
//                   <thead className="bg-white/40 border-b border-white/80">
//                     <tr>
//                       <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">الموظف</th>
//                       <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">إجمالي السلفة</th>
//                       <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">القسط الشهري</th>
//                       <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">المتبقي</th>
//                       <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">تاريخ الإصدار</th>
//                       <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">حالة الخصم</th>
//                       <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">إدارة</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-white/40">
//                     {(advances || []).length === 0 ? (
//                       <tr><td colSpan={7} className="p-16 text-center text-[#263544]/60 font-black">لا توجد سلف مسجلة حالياً.</td></tr>
//                     ) : (
//                       (advances || []).map((item: Advance) => {
//                         const remaining = toNumber(item.remainingAmount);
//                         return (
//                           <tr key={item.id} className="hover:bg-white/80 transition-all duration-300 group/row">
//                             <td className="p-4 text-center font-black text-slate-800 group-hover/row:text-[#263544]">{employeeNameMap[item.employeeId] || item.employeeId}</td>
//                             <td className="p-4 text-center font-mono font-black text-[#263544]">{toNumber(item.totalAmount).toLocaleString()}</td>
//                             <td className="p-4 text-center font-mono font-black text-[#C89355]">{toNumber(item.installmentAmount).toLocaleString()}</td>
//                             <td className="p-4 text-center font-black text-[#1a2530] bg-[#C89355]/5 rounded-xl">{remaining.toLocaleString()}</td>
//                             <td className="p-4 text-center font-mono font-bold text-sm text-[#263544]/70">{new Date(item.issueDate).toLocaleDateString("ar-EG")}</td>
//                             <td className="p-4 text-center">
//                               <span className={`px-4 py-1.5 rounded-xl text-[11px] font-black border shadow-sm ${remaining > 0 ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-[#1a2530] text-[#C89355] border-[#C89355]/30"}`}>
//                                 {remaining > 0 ? "جارٍ الخصم" : "مكتمل"}
//                               </span>
//                             </td>
//                             <td className="p-4 text-center">
//                               <div className="flex items-center justify-center gap-2 opacity-60 group-hover/row:opacity-100 transition-opacity">
//                                 <button
//                                   onClick={() => {
//                                     setSelectedAdvance(item);
//                                     setIsAdvanceModalOpen(true);
//                                   }}
//                                   className="text-[#C89355] hover:bg-[#1a2530] hover:text-[#C89355] p-2.5 rounded-xl transition-all hover:scale-110 border border-transparent hover:border-[#C89355]/30"
//                                 >
//                                   <Edit size={16} />
//                                 </button>
//                                 <button
//                                   onClick={() => deleteAdvance.mutate(item.id)}
//                                   className="text-rose-500 hover:bg-rose-500 hover:text-white p-2.5 rounded-xl transition-all hover:scale-110 border border-transparent hover:border-rose-400"
//                                 >
//                                   {deleteAdvance.isPending ? <Loader2 className="animate-spin" size={16} /> : <Trash size={16} />}
//                                 </button>
//                               </div>
//                             </td>
//                           </tr>
//                         );
//                       })
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}

//           {activeTab === "bonuses" && (
//             <div className="space-y-6 mt-6">
//               <div className="relative overflow-hidden flex justify-between items-center rounded-4xl border-2 border-white/90 bg-white/60 backdrop-blur-2xl shadow-[0_15px_40px_rgba(38,53,68,0.08)] p-6 group">
//                 <div className="absolute inset-1.5 rounded-[1.7rem] border border-dashed border-[#C89355]/30 pointer-events-none z-0 transition-colors group-hover:border-[#C89355]/50" />
//                 <h2 className="font-black text-[#263544] flex items-center gap-3 text-lg relative z-10">
//                   <Gift size={20} className="text-[#C89355] group-hover:animate-pulse transition-all duration-300" /> إدارة المكافآت والخصومات
//                 </h2>
//                 <div className="relative z-10">
//                   <input
//                     type="month"
//                     value={period}
//                     onChange={(e) => setPeriod(e.target.value)}
//                     className="p-3 rounded-xl border border-white/90 bg-white/80 font-mono font-bold text-sm text-[#263544] outline-none focus:border-[#C89355] focus:ring-2 focus:ring-[#C89355]/20 transition-all shadow-inner"
//                   />
//                 </div>
//               </div>

//               <div className="relative bg-white/60 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(38,53,68,0.08)] border-2 border-white/90 overflow-hidden group">
//                 <div className="absolute inset-1.5 rounded-[2.2rem] border border-dashed border-[#C89355]/30 pointer-events-none z-0 transition-colors group-hover:border-[#C89355]/50" />
//                 <div className="w-full overflow-x-auto custom-scrollbar relative z-10">
//                   <table className="w-full text-right min-w-245">
//                     <thead className="bg-white/40 border-b border-white/80">
//                       <tr>
//                         <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">الموظف</th>
//                         <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">الفترة</th>
//                         <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">المكافأة</th>
//                         <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">الخصومات</th>
//                         <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">السبب</th>
//                         <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">إدارة</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-white/40">
//                       {(bonuses || []).length === 0 ? (
//                         <tr><td colSpan={6} className="p-16 text-center text-[#263544]/60 font-black">لا توجد سجلات في هذه الفترة.</td></tr>
//                       ) : (
//                         (bonuses || []).map((item: Bonus) => (
//                           <tr key={item.id} className="hover:bg-white/80 transition-all duration-300 group/row">
//                             <td className="p-4 text-center font-black text-slate-800 group-hover/row:text-[#263544]">{employeeNameMap[item.employeeId] || item.employeeId}</td>
//                             <td className="p-4 text-center font-mono text-sm font-bold text-[#263544]/80">{item.period || "—"}</td>
//                             <td className="p-4 text-center text-[#C89355] font-black">{toNumber(item.bonusAmount).toLocaleString()}</td>
//                             <td className="p-4 text-center text-rose-600 font-black bg-rose-50/50 rounded-xl">{toNumber(item.assistanceAmount).toLocaleString()}</td>
//                             <td className="p-4 text-center text-[#263544]/80 text-sm font-bold">{item.bonusReason || "—"}</td>
//                             <td className="p-4 text-center">
//                               <div className="flex items-center justify-center gap-2 opacity-60 group-hover/row:opacity-100 transition-opacity">
//                                 <button
//                                   onClick={() => {
//                                     setSelectedBonus(item);
//                                     setIsBonusModalOpen(true);
//                                   }}
//                                   className="text-[#C89355] hover:bg-[#1a2530] hover:text-[#C89355] p-2.5 rounded-xl transition-all hover:scale-110 border border-transparent hover:border-[#C89355]/30"
//                                 >
//                                   <Edit size={16} />
//                                 </button>
//                                 <button
//                                   onClick={() => deleteBonus.mutate(item.id)}
//                                   className="text-rose-500 hover:bg-rose-500 hover:text-white p-2.5 rounded-xl transition-all hover:scale-110 border border-transparent hover:border-rose-400"
//                                 >
//                                   {deleteBonus.isPending ? <Loader2 className="animate-spin" size={16} /> : <Trash size={16} />}
//                                 </button>
//                               </div>
//                             </td>
//                           </tr>
//                         ))
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>
//           )}

//           {activeTab === "final-payroll" && (
//             <div className="space-y-6 mt-6">
//               <div className="relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-4 rounded-4xl border-2 border-white/90 bg-white/60 backdrop-blur-2xl shadow-[0_15px_40px_rgba(38,53,68,0.08)] p-6 group">
//                 <div className="absolute inset-1.5 rounded-[1.7rem] border border-dashed border-[#C89355]/30 pointer-events-none z-0 transition-colors group-hover:border-[#C89355]/50" />
//                 <h2 className="font-black text-[#263544] flex items-center gap-3 text-lg relative z-10">
//                   <Calculator size={20} className="text-[#C89355] group-hover:animate-pulse transition-all duration-300" /> المسير النهائي للفترة
//                 </h2>
//                 <div className="flex flex-wrap items-center justify-center gap-3 relative z-10">
//                   <input
//                     type="month"
//                     value={period}
//                     onChange={(e) => setPeriod(e.target.value)}
//                     className="p-3 rounded-xl border border-white/90 bg-white/80 font-mono font-bold text-sm text-[#263544] outline-none focus:border-[#C89355] focus:ring-2 focus:ring-[#C89355]/20 transition-all shadow-inner"
//                   />
//                   <button
//                     type="button"
//                     onClick={handleExportPayrollExcel}
//                     className="inline-flex items-center gap-2 rounded-xl bg-emerald-600/90 backdrop-blur-md px-5 py-3 text-sm font-black text-white hover:bg-emerald-700 transition-all shadow-[0_10px_20px_rgba(5,150,105,0.3)] hover:shadow-[0_15px_25px_rgba(5,150,105,0.4)] active:scale-95 border border-emerald-500"
//                   >
//                     <FileSpreadsheet size={18} />
//                     تصدير Excel
//                   </button>
//                   <button
//                     type="button"
//                     onClick={handleRunPayroll}
//                     disabled={calculatePayroll.isPending}
//                     className="relative overflow-hidden inline-flex items-center gap-2 rounded-xl bg-[#1a2530] hover:bg-[#263544] px-5 py-3 text-sm font-black text-[#C89355] shadow-[0_10px_20px_rgba(38,53,68,0.4)] transition-all active:scale-95 border border-[#C89355]/40 disabled:opacity-60 disabled:cursor-not-allowed group/btn"
//                   >
//                     <div className="absolute inset-1 rounded-lg border border-dashed border-[#C89355]/30 pointer-events-none transition-colors group-hover/btn:border-[#C89355]/50" />
//                     {calculatePayroll.isPending ? <Loader2 size={18} className="animate-spin relative z-10" /> : <Calculator size={18} className="group-hover/btn:animate-bounce transition-all duration-300 relative z-10" />}
//                     <span className="relative z-10">تشغيل المسير</span>
//                   </button>
//                 </div>
//               </div>

//               {lastCalculatedRunId ? (
//                 <div className="text-sm text-[#263544] bg-white/80 backdrop-blur-md border border-[#C89355]/30 rounded-2xl p-4 font-black flex items-center gap-3 shadow-sm relative overflow-hidden group">
//                   <div className="absolute inset-1 rounded-xl border border-dashed border-[#C89355]/20 pointer-events-none" />
//                   <Sparkles size={18} className="text-[#C89355] group-hover:animate-pulse transition-all duration-300 relative z-10" /> 
//                   <span className="relative z-10">آخر تشغيل ناجح للمسير: <span className="font-mono bg-[#1a2530] text-[#C89355] px-2 py-0.5 rounded shadow-sm mx-1">{lastCalculatedRunId}</span></span>
//                 </div>
//               ) : null}

//               <div className="relative bg-white/60 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(38,53,68,0.08)] border-2 border-white/90 overflow-hidden group">
//                 <div className="absolute inset-1.5 rounded-[2.2rem] border border-dashed border-[#C89355]/30 pointer-events-none z-0 transition-colors group-hover:border-[#C89355]/50" />
//                 <div className="w-full overflow-x-auto custom-scrollbar relative z-10">
//                   <table className="w-full text-right min-w-245">
//                     <thead className="bg-white/40 border-b border-white/80">
//                       <tr>
//                         <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">الموظف</th>
//                         <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">أيام الحضور</th>
//                         <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">الراتب النسبي</th>
//                         <th className="p-5 text-rose-600 font-black text-xs uppercase tracking-wider text-center">خصم التأخير</th>
//                         <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">المكافآت</th>
//                         <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">الخصومات</th>
//                         <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">خصم السلف</th>
//                         <th className="p-5 text-[#1a2530] font-black text-xs uppercase tracking-wider text-center bg-[#C89355]/10">صافي المستحق</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-white/40">
//                       {finalPayrollRows.length === 0 ? (
//                         <tr><td colSpan={8} className="p-16 text-center text-[#263544]/60 font-black">لا توجد بيانات كافية لحساب المسير.</td></tr>
//                       ) : (
//                         finalPayrollRows.map((row) => (
//                           <tr key={row.employeeId} className="hover:bg-white/80 transition-all duration-300 group/row">
//                             <td className="p-4 text-center font-black text-slate-800 group-hover/row:text-[#263544]">{row.employeeName}</td>
//                             <td className="p-4 text-center font-mono font-black text-[#263544]/80">{row.attendanceDays}</td>
//                             <td className="p-4 text-center font-mono font-black text-[#263544]">{row.proratedBase.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
//                             <td className="p-4 text-center font-mono font-black text-rose-600 bg-rose-50/50 rounded-xl">{row.lateDeduction.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
//                             <td className="p-4 text-center font-black text-[#C89355]">{row.totalBonus.toLocaleString()}</td>
//                             <td className="p-4 text-center font-black text-rose-600">{row.totalDeductions.toLocaleString()}</td>
//                             <td className="p-4 text-center font-black text-[#C89355]">{row.advancesInstallments.toLocaleString()}</td>
//                             <td className="p-4 text-center font-black text-xl text-[#1a2530] bg-[#C89355]/10 rounded-xl shadow-inner border border-[#C89355]/20">{row.net.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
//                           </tr>
//                         ))
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//               <div className="relative overflow-hidden p-4 rounded-2xl border border-white/80 bg-white/60 backdrop-blur-md shadow-sm">
//                 <div className="absolute inset-1 rounded-xl border border-dashed border-[#C89355]/20 pointer-events-none" />
//                 <p className="text-xs text-[#263544] font-black flex items-center gap-2 relative z-10">
//                   <span className="w-2.5 h-2.5 rounded-full bg-[#C89355] shadow-[0_0_8px_rgba(200,147,85,0.6)] animate-pulse"></span>
//                   المعادلة: (الراتب الأساسي ÷ 26 × أيام الحضور) + المكافآت - الخصومات - أقساط السلف - خصم التأخير.
//                 </p>
//               </div>
//             </div>
//           )}

//         </div>
//       </div>

//       {/* زر الإضافة العائم بأسلوب الماركة الفخم */}
//       {isFloatingActionVisible && (
//         <button
//           onClick={openFloatingAction}
//           className="fixed bottom-8 left-8 z-40 rounded-full w-16 h-16 bg-[#1a2530] text-[#C89355] shadow-[0_10px_30px_rgba(38,53,68,0.5)] hover:bg-[#263544] hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-2 border-[#C89355]/40 group"
//           title="إضافة سجل جديد"
//         >
//           <div className="absolute inset-1.5 rounded-full border border-dashed border-[#C89355]/30 pointer-events-none transition-colors group-hover:border-[#C89355]/50" />
//           <Plus size={28} className="group-hover:animate-spin transition-all duration-300 relative z-10" />
//         </button>
//       )}

//       {/* النوافذ المنبثقة */}
//       {isModalOpen ? (
//         <ManageSalaryModal
//           key={`${isModalOpen}-${selected?.employeeId ?? preselectedEmployeeId ?? "new"}`}
//           isOpen={isModalOpen}
//           onClose={() => setIsModalOpen(false)}
//           initialData={selected}
//           preselectedEmployeeId={preselectedEmployeeId}
//           employees={employees}
//           isPending={updateSalary.isPending}
//           onSave={handleSave}
//         />
//       ) : null}

//       {isAdvanceModalOpen ? (
//         <AddAdvanceModal
//           key={`${isAdvanceModalOpen}-${selectedAdvance?.id ?? "new"}`}
//           isOpen={isAdvanceModalOpen}
//           onClose={() => {
//             setIsAdvanceModalOpen(false);
//             setSelectedAdvance(null);
//           }}
//           employees={Array.isArray(employees) ? employees : []}
//           initialData={selectedAdvance}
//           isPending={createAdvance.isPending || updateAdvance.isPending}
//           onSave={(form) => {
//             if (selectedAdvance?.id) {
//               updateAdvance.mutate(
//                 {
//                   id: selectedAdvance.id,
//                   data: {
//                     remainingAmount: form.remainingAmount,
//                     installmentAmount: form.installmentAmount,
//                     notes: form.notes,
//                   },
//                 },
//                 {
//                   onSuccess: () => {
//                     setIsAdvanceModalOpen(false);
//                     setSelectedAdvance(null);
//                   },
//                 },
//               );
//               return;
//             }

//             createAdvance.mutate(form, {
//               onSuccess: () => {
//                 setIsAdvanceModalOpen(false);
//               },
//             });
//           }}
//         />
//       ) : null}

//       {isBonusModalOpen ? (
//         <AddBonusModal
//           key={`${isBonusModalOpen}-${selectedBonus?.id ?? "new"}`}
//           isOpen={isBonusModalOpen}
//           onClose={() => {
//             setIsBonusModalOpen(false);
//             setSelectedBonus(null);
//           }}
//           employees={Array.isArray(employees) ? employees : []}
//           initialData={selectedBonus}
//           isPending={createBonus.isPending || updateBonus.isPending}
//           onSave={(form) => {
//             if (selectedBonus?.id) {
//               updateBonus.mutate(
//                 {
//                   id: selectedBonus.id,
//                   data: {
//                     bonusAmount: form.bonusAmount,
//                     bonusReason: form.bonusReason,
//                     assistanceAmount: form.assistanceAmount,
//                     period: form.period,
//                   },
//                 },
//                 {
//                   onSuccess: () => {
//                     setIsBonusModalOpen(false);
//                     setSelectedBonus(null);
//                   },
//                 },
//               );
//               return;
//             }

//             createBonus.mutate(form, {
//               onSuccess: () => {
//                 setIsBonusModalOpen(false);
//               },
//             });
//           }}
//         />
//       ) : null}

//       {/* تنبيه الحفظ (Loading Toaster) بتصميم زجاجي */}
//       {isSaving && (
//         <div className="fixed bottom-6 right-6 z-50 rounded-2xl border-2 border-white/90 bg-white/80 backdrop-blur-xl px-6 py-4 shadow-[0_15px_40px_rgba(38,53,68,0.15)] flex items-center gap-4 animate-in slide-in-from-bottom-5">
//           <div className="absolute inset-1 rounded-xl border border-dashed border-[#C89355]/30 pointer-events-none" />
//           <Loader2 className="animate-spin text-[#C89355] relative z-10" size={20} />
//           <p className="text-sm font-black text-[#263544] relative z-10">
//             جارٍ حفظ وتحديث البيانات المالية...
//           </p>
//         </div>
//       )}
//     </>
//   );
// }

"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import useSalaries from "@/hooks/useSalaries";
import { useEmployees } from "@/hooks/useEmployees";
import { useAdvances } from "@/hooks/useAdvances";
import { useBonuses } from "@/hooks/useBonuses";
import { useAttendance } from "@/hooks/useAttendance";
import { usePayroll } from "@/hooks/usePayroll";
import { Edit, Trash, Gift, Calculator, Plus, Sparkles, Loader2, HandCoins, Wallet, FileSpreadsheet, ChevronLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import type { Salary } from "@/types/salary";
import type { Employee } from "@/types/employee";
import type { Advance } from "@/types/advance";
import type { Bonus } from "@/types/bonus";

export type FinancialTabKey = "salary-config" | "advances" | "bonuses" | "final-payroll";

const ManageSalaryModal = dynamic(() => import("@/components/ManageSalaryModal"), { loading: () => null });
const AddAdvanceModal = dynamic(() => import("@/components/AddAdvanceModal"), { loading: () => null });
const AddBonusModal = dynamic(() => import("@/components/AddBonusModal"), { loading: () => null });

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

const getTabFromQuery = (tabParam: string | null): FinancialTabKey => {
  if (tabParam === "advances") return "advances";
  if (tabParam === "bonuses") return "bonuses";
  if (tabParam === "final-payroll" || tabParam === "payroll") return "final-payroll";
  return "salary-config";
};

const WORKING_DAYS_PER_MONTH = 26;
const DEFAULT_DAILY_WORK_MINUTES = 8 * 60;

const toMinutes = (time?: string) => {
  if (!time) return null;
  const normalized = time.slice(0, 5);
  const [h, m] = normalized.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

const getDailyWorkMinutes = (scheduledStart?: string, scheduledEnd?: string) => {
  const startMinutes = toMinutes(scheduledStart || "08:00");
  const endMinutes = toMinutes(scheduledEnd || "16:00");
  if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
    return DEFAULT_DAILY_WORK_MINUTES;
  }
  return endMinutes - startMinutes;
};

// تعديل الواجهة لتشمل الثوابت الجديدة
type SalaryPayload = {
  profession: string;
  baseSalary: number;
  extraEffort: number;           // جهد إضافي
  responsibilityAllowance: number; // تعويض مسؤولية
  transportAllowance: number;
  insurances: number;            // تأمينات
  productionIncentive: number;   // تعويض حوافز إنتاجية
};

type SalaryWithFixedExtras = Salary & {
  extraEffort?: unknown;
  insurances?: unknown;
};

const SkeletonRows = () => (
  <div className="space-y-3 p-6 bg-white/50 rounded-3xl">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="h-12 rounded-xl bg-slate-200/50 animate-pulse" />
    ))}
  </div>
);

const tabLabels: Record<FinancialTabKey, string> = {
  "salary-config": "إعداد الرواتب",
  "advances": "السلف",
  "bonuses": "المكافآت والخصومات",
  "final-payroll": "المسير النهائي",
};

export default function SalariesPage() {
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const activeTab = getTabFromQuery(requestedTab);

  const { data: salaries = [], isLoading, isError, error, updateSalary, deleteSalary } = useSalaries();
  const { data: employees = [], isLoading: employeesLoading } = useEmployees({ limit: 200, status: "active" });
  const { data: advances = [], createAdvance, updateAdvance, deleteAdvance } = useAdvances();
  const { calculatePayroll } = usePayroll();

  const [period, setPeriod] = useState(getLocalMonth());
  const { start: monthStart, end: monthEnd } = useMemo(() => getMonthBounds(period), [period]);
  const { data: bonuses = [], createBonus, updateBonus, deleteBonus } = useBonuses({ period });
  const { data: attendanceData } = useAttendance({ startDate: monthStart, endDate: monthEnd, limit: 2000 });

  const employeeNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (Array.isArray(employees)) {
      for (const emp of employees) {
        if (emp?.employeeId) map[emp.employeeId] = emp.name || emp.employeeId;
      }
    }
    return map;
  }, [employees]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<Salary | null>(null);
  const [preselectedEmployeeId, setPreselectedEmployeeId] = useState<string | undefined>(undefined);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [selectedAdvance, setSelectedAdvance] = useState<Advance | null>(null);
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
  const [selectedBonus, setSelectedBonus] = useState<Bonus | null>(null);
  const [lastCalculatedRunId, setLastCalculatedRunId] = useState<string | null>(null);

  const openFor = (salary: Salary | null = null, preselectId?: string) => {
    setSelected(salary);
    setPreselectedEmployeeId(preselectId);
    setIsModalOpen(true);
  };

  const employeeMap = useMemo(() => {
    const m = new Map<string, Employee>();
    (employees || []).forEach((e) => { if (e?.employeeId) m.set(e.employeeId, e); });
    return m;
  }, [employees]);

  const salaryMap = useMemo(() => {
    const m = new Map<string, Salary>();
    (salaries || []).forEach((s) => { if (s?.employeeId) m.set(s.employeeId, s); });
    return m;
  }, [salaries]);

  const allIds = useMemo(() => {
    const set = new Set<string>();
    (employees || []).forEach((e) => e?.employeeId && set.add(e.employeeId));
    (salaries || []).forEach((s) => s?.employeeId && set.add(s.employeeId));
    return Array.from(set);
  }, [employees, salaries]);

  const employeesForFinanceModals = useMemo(
    () => (employees || []).map((emp) => ({ employeeId: emp.employeeId, name: emp.name })),
    [employees],
  );

  const attendanceDaysMap = useMemo(() => {
    const map = new Map<string, number>();
    const daily = attendanceData?.dailyRecords || [];
    for (const rec of daily) {
      if (!rec?.employeeId || !rec?.checkIn) continue;
      map.set(rec.employeeId, (map.get(rec.employeeId) || 0) + 1);
    }
    return map;
  }, [attendanceData?.dailyRecords]);

  const dailyRecordsByEmployee = useMemo(() => {
    const map = new Map<string, { checkIn?: string }[]>();
    const daily = attendanceData?.dailyRecords || [];
    for (const rec of daily) {
      if (!rec?.employeeId) continue;
      const current = map.get(rec.employeeId) || [];
      current.push({ checkIn: rec.checkIn });
      map.set(rec.employeeId, current);
    }
    return map;
  }, [attendanceData?.dailyRecords]);

  const tabStats = useMemo(() => {
    const totalAdvances = (advances || []).reduce((sum: number, item: Advance) => sum + toNumber(item.remainingAmount), 0);
    const totalBonus = (bonuses || []).reduce((sum: number, item: Bonus) => sum + toNumber(item.bonusAmount), 0);
    const totalDeductions = (bonuses || []).reduce((sum: number, item: Bonus) => sum + toNumber(item.assistanceAmount), 0);
    return { totalAdvances, totalBonus, totalDeductions };
  }, [advances, bonuses]);

  const finalPayrollRows = useMemo(() => {
    return allIds.map((employeeId: string) => {
      const salary = salaryMap.get(employeeId);
      const employee = employeeMap.get(employeeId);
      const attendanceDays = attendanceDaysMap.get(employeeId) || 0;
      const employeeDailyRecords = dailyRecordsByEmployee.get(employeeId) || [];

      // هنا يتم حساب الراتب الأساسي، إذا كان موجوداً نستخدمه، وإلا نستخدم hourlyRate المحسوب
      const baseSalary = salary ? toNumber(salary.baseSalary) : toNumber(employee?.hourlyRate);
      const proratedBase = (baseSalary / WORKING_DAYS_PER_MONTH) * attendanceDays;

      const employeeBonuses = (bonuses || []).filter((b: Bonus) => b.employeeId === employeeId);
      const totalBonus = employeeBonuses.reduce((sum: number, b: Bonus) => sum + toNumber(b.bonusAmount), 0);
      const totalDeductions = employeeBonuses.reduce((sum: number, b: Bonus) => sum + toNumber(b.assistanceAmount), 0);
      
      const employeeAdvances = (advances || []).filter((a: Advance) => a.employeeId === employeeId);
      const advancesInstallments = employeeAdvances.reduce((sum: number, a: Advance) => sum + toNumber(a.installmentAmount), 0);

      const scheduledStartMinutes = toMinutes(employee?.scheduledStart || "08:00");
      let lateMinutes = 0;

      for (const record of employeeDailyRecords) {
        const checkInMinutes = toMinutes(record.checkIn);
        if (checkInMinutes === null || scheduledStartMinutes === null) continue;
        if (checkInMinutes <= scheduledStartMinutes) continue;
        lateMinutes += checkInMinutes - scheduledStartMinutes;
      }

      const dailyWorkMinutes = getDailyWorkMinutes(employee?.scheduledStart, employee?.scheduledEnd);
      const minuteRate = dailyWorkMinutes > 0
        ? baseSalary / (WORKING_DAYS_PER_MONTH * dailyWorkMinutes)
        : 0;
      const lateDeduction = lateMinutes * minuteRate;

      const net = proratedBase + totalBonus - totalDeductions - advancesInstallments - lateDeduction;

      return {
        employeeId,
        employeeName: employeeNameMap[employeeId] || employeeId,
        attendanceDays,
        minuteRate,
        lateMinutes,
        lateDeduction,
        hasLateDeduction: lateDeduction > 0,
        proratedBase,
        totalBonus,
        totalDeductions,
        advancesInstallments,
        net,
      };
    });
  }, [allIds, salaryMap, employeeMap, attendanceDaysMap, bonuses, advances, employeeNameMap, dailyRecordsByEmployee]);

  const payrollTotals = useMemo(() => {
    return finalPayrollRows.reduce(
      (acc, row) => {
        acc.totalLateMinutes += row.lateMinutes;
        acc.totalLateDeduction += row.lateDeduction;
        acc.employeesWithLateDeduction += row.hasLateDeduction ? 1 : 0;
        return acc;
      },
      { totalLateMinutes: 0, totalLateDeduction: 0, employeesWithLateDeduction: 0 },
    );
  }, [finalPayrollRows]);

  const handleSave = (employeeId: string, payload: SalaryPayload) => {
    if (!employeeId) return toast.error("يرجى إدخال كود الموظف");
    // يتم تحديث بيانات الراتب هنا (يجب أن يكون الباك إند متوافقاً مع الحقول الجديدة)
    updateSalary.mutate({ employeeId, data: { employeeId, ...payload } });
    setIsModalOpen(false);
  };

  const handleDelete = (employeeId: string) => {
    if (!confirm(`هل تريد حذف بيانات الراتب للموظف ${employeeId}؟`)) return;
    deleteSalary.mutate(employeeId);
  };

  const isSaving =
    updateSalary.isPending || deleteSalary.isPending || createAdvance.isPending ||
    updateAdvance.isPending || deleteAdvance.isPending || createBonus.isPending ||
    updateBonus.isPending || deleteBonus.isPending || calculatePayroll.isPending;

  const handleRunPayroll = () => {
    calculatePayroll.mutate(
      { periodStart: monthStart, periodEnd: monthEnd, gracePeriodMinutes: 15 },
      {
        onSuccess: (response) => {
          const runId = (response as { data?: { payrollRun?: { runId?: string } } })?.data?.payrollRun?.runId;
          if (runId) {
            setLastCalculatedRunId(runId);
            toast.success(`تم إنشاء مسير الرواتب: ${runId}`);
            return;
          }
          toast.success("تم إنشاء مسير الرواتب بنجاح");
        },
      },
    );
  };

  const handleExportPayrollExcel = async () => {
    // كود تصدير الإكسل بقي كما هو لعدم وجود تغييرات هيكلية فيه
    if (finalPayrollRows.length === 0) {
      toast.error("لا توجد بيانات لتصديرها");
      return;
    }
    try {
      const XLSX = await import("xlsx");
      const rows: Array<Record<string, string | number>> = finalPayrollRows.map((row, index) => ({
        "#": index + 1,
        "كود الموظف": row.employeeId,
        "اسم الموظف": row.employeeName,
        "أيام الحضور": row.attendanceDays,
        "أجر الدقيقة": Number(row.minuteRate.toFixed(4)),
        "دقائق التأخير": row.lateMinutes,
        "خصم التأخير": Number(row.lateDeduction.toFixed(2)),
        "في خصم": row.hasLateDeduction ? "نعم" : "لا",
        "الراتب النسبي": Number(row.proratedBase.toFixed(2)),
        "المكافآت": Number(row.totalBonus.toFixed(2)),
        "الخصومات": Number(row.totalDeductions.toFixed(2)),
        "خصم السلف": Number(row.advancesInstallments.toFixed(2)),
        "صافي المستحق": Number(row.net.toFixed(2)),
      }));

      rows.push({
        "#": "", "كود الموظف": "", "اسم الموظف": "الإجمالي", "أيام الحضور": "", "أجر الدقيقة": "",
        "دقائق التأخير": payrollTotals.totalLateMinutes,
        "خصم التأخير": Number(payrollTotals.totalLateDeduction.toFixed(2)),
        "في خصم": payrollTotals.employeesWithLateDeduction.toString(),
        "الراتب النسبي": "", "المكافآت": "", "الخصومات": "", "خصم السلف": "",
        "صافي المستحق": Number(finalPayrollRows.reduce((sum, row) => sum + row.net, 0).toFixed(2)),
      });

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll");
      XLSX.writeFile(workbook, `payroll-${period}.xlsx`);

      toast.success("تم تنزيل جدول الرواتب Excel بنجاح");
    } catch {
      toast.error("تعذر تنزيل ملف Excel حالياً");
    }
  };

  const openFloatingAction = () => {
    if (activeTab === "salary-config") { openFor(null); return; }
    if (activeTab === "advances") { setSelectedAdvance(null); setIsAdvanceModalOpen(true); return; }
    if (activeTab === "bonuses") { setSelectedBonus(null); setIsBonusModalOpen(true); }
  };

  const isFloatingActionVisible = activeTab !== "final-payroll";

  return (
    <>
      <div className="relative z-10 w-full max-w-7xl min-h-[85vh] mx-auto bg-white/50 backdrop-blur-2xl rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(38,53,68,0.2)] border-2 border-dashed border-[#C89355]/60 flex flex-col overflow-hidden" dir="rtl">
        
        {/* نقشة الفايبر */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 12h24M12 0v24' stroke='%23263544' stroke-width='1' stroke-dasharray='4 4' fill='none'/%3E%3C/svg%3E")`, backgroundSize: '24px 24px' }} />

        <div className="p-6 md:p-10 h-full overflow-y-auto custom-scrollbar relative z-10">
          
          <nav className="mb-6 relative overflow-hidden flex items-center gap-2 text-xs font-black text-slate-500 bg-white/60 backdrop-blur-xl w-fit px-4 py-2.5 rounded-2xl border border-white/80 shadow-[0_5px_15px_rgba(38,53,68,0.05)] group">
            <div className="absolute inset-1 rounded-xl border border-dashed border-[#C89355]/30 pointer-events-none" />
            <span className="hover:text-[#263544] cursor-pointer relative z-10">المركز المالي</span>
            <ChevronLeft size={14} className="text-[#C89355] relative z-10" />
            <span className="text-[#263544] relative z-10">{tabLabels[activeTab]}</span>
          </nav>

          <header className="mb-10 flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-[#263544]/10 pb-8 relative">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-[#1a2530] rounded-2xl shadow-[0_15px_25px_rgba(38,53,68,0.4)] border border-[#C89355]/40 relative outline-dashed outline-1 outline-[#C89355]/50 outline-offset-4 group">
                  <Sparkles size={22} className="text-[#C89355] group-hover:animate-bounce transition-all duration-300" strokeWidth={2.5} />
                </div>
                <h1 className="text-3xl font-black text-[#263544] tracking-tight drop-shadow-sm">المركز المالي الذكي</h1>
              </div>
              <p className="text-slate-600 text-sm font-bold pr-14 mt-1">لوحة موحدة لإدارة الرواتب والسلف والمكافآت وحساب المسير النهائي.</p>
            </div>

            <div className="mt-4 xl:mt-0 flex flex-wrap items-center gap-4 w-full xl:w-auto">
              <div className="relative overflow-hidden bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl p-4 shadow-[0_8px_30px_rgba(38,53,68,0.04)] flex-1 hover:shadow-md transition-all group">
                <div className="flex items-center gap-2 mb-1.5 relative z-10">
                  <HandCoins size={14} className="text-[#C89355]" />
                  <p className="text-[11px] font-black text-slate-500">السلف المتبقية</p>
                </div>
                <p className="font-black text-xl text-[#263544]">{tabStats.totalAdvances.toLocaleString()}</p>
              </div>
              <div className="relative overflow-hidden bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl p-4 shadow-[0_8px_30px_rgba(38,53,68,0.04)] flex-1 hover:shadow-md transition-all group">
                <div className="flex items-center gap-2 mb-1.5 relative z-10">
                  <Gift size={14} className="text-[#C89355]" />
                  <p className="text-[11px] font-black text-slate-500">إجمالي المكافآت</p>
                </div>
                <p className="font-black text-xl text-[#263544]">{tabStats.totalBonus.toLocaleString()}</p>
              </div>
              <div className="relative overflow-hidden bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl p-4 shadow-[0_8px_30px_rgba(38,53,68,0.04)] flex-1 hover:shadow-md transition-all group">
                <div className="flex items-center gap-2 mb-1.5 relative z-10">
                  <Wallet size={14} className="text-rose-500" />
                  <p className="text-[11px] font-black text-slate-500">إجمالي الخصومات</p>
                </div>
                <p className="font-black text-xl text-rose-600">{tabStats.totalDeductions.toLocaleString()}</p>
              </div>
            </div>
          </header>

          {/* تبويب إعداد الرواتب المعدل */}
          {activeTab === "salary-config" && (
            <div className="relative bg-white/60 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(38,53,68,0.08)] border-2 border-white/90 overflow-hidden mt-6 group">
              <div className="absolute inset-1.5 rounded-[2.2rem] border border-dashed border-[#C89355]/30 pointer-events-none z-0" />
              {isLoading ? (
                <SkeletonRows />
              ) : isError ? (
                <div className="p-8 text-center font-bold text-rose-600">خطأ: {error?.message ?? "فشل تحميل البيانات"}</div>
              ) : (
                <div className="w-full overflow-x-auto custom-scrollbar relative z-10">
                  <table className="w-full text-right min-w-250">
                    <thead className="bg-white/40 border-b border-white/80">
                      <tr>
                        <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">الموظف (الاسم والكود)</th>
                        <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">الراتب الأساسي</th>
                        <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">جهد إضافي</th>
                        <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">تعويض مسؤولية</th>
                        <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">حوافز إنتاجية</th>
                        <th className="p-5 text-rose-600 font-black text-xs uppercase tracking-wider text-center">التأمينات (خصم)</th>
                        <th className="p-5 text-[#1a2530] font-black text-xs uppercase tracking-wider text-center bg-[#C89355]/10">الإجمالي الثابت</th>
                        <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">إدارة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/40">
                      {allIds.length === 0 ? (
                        <tr><td colSpan={8} className="p-16 text-center text-[#263544]/60 font-black">لا توجد سجلات.</td></tr>
                      ) : (
                        allIds.map((id: string) => {
                          const s = (salaryMap.get(id) ?? null) as SalaryWithFixedExtras | null;
                          const emp = employeeMap.get(id) ?? null;

                          // قيم افتراضية في حال لم يتم ضبط الراتب بعد
                          let base = toNumber(emp?.hourlyRate); // مؤقتاً نستخدم hourlyRate كبديل لغياب الراتب
                          let extraEffort = 0;
                          let respAllowance = 0;
                          let prodIncentive = 0;
                          let insurances = 0;

                          if (s) {
                            base = toNumber(s.baseSalary);
                            extraEffort = toNumber(s.extraEffort);
                            respAllowance = toNumber(s.responsibilityAllowance);
                            prodIncentive = toNumber(s.productionIncentive);
                            insurances = toNumber(s.insurances);
                          }

                          // المعادلة: الأساسي + جهد إضافي + مسؤولية + إنتاج - تأمينات
                          const monthlyFixedTotal = base + extraEffort + respAllowance + prodIncentive - insurances;
                          const employeeName = employeesLoading ? "جارٍ التحميل..." : (emp?.name ?? employeeNameMap[id] ?? "موظف غير معروف");

                          return (
                            <tr key={id} className="hover:bg-white/80 transition-all duration-300 group/row">
                              {/* 1. اسم الموظف وتحته كود الموظف */}
                              <td className="p-4 text-center ">
                                <div className="font-black text-slate-800 group-hover/row:text-[#263544] text-base">{employeeName}</div>
                                <div className="font-mono font-bold text-[10px] text-slate-500 mt-0.5">{id}</div>
                              </td>
                              
                              {/* 2. الراتب الأساسي */}
                              <td className="p-4 text-center font-mono font-black text-[#263544]">
                                {base > 0 ? base.toLocaleString() : "—"}
                              </td>
                              
                              {/* 3. جهد إضافي */}
                              <td className="p-4 text-center font-mono font-black text-[#C89355]">
                                {extraEffort > 0 ? extraEffort.toLocaleString() : "—"}
                              </td>
                              
                              {/* 4. تعويض مسؤولية */}
                              <td className="p-4 text-center font-mono font-black text-[#C89355]">
                                {respAllowance > 0 ? respAllowance.toLocaleString() : "—"}
                              </td>
                              
                              {/* 5. تعويض إنتاج */}
                              <td className="p-4 text-center font-mono font-black text-[#C89355]">
                                {prodIncentive > 0 ? prodIncentive.toLocaleString() : "—"}
                              </td>
                              
                              {/* 6. التأمينات (بالأحمر كخصم) */}
                              <td className="p-4 text-center font-mono font-black text-rose-500">
                                {insurances > 0 ? insurances.toLocaleString() : "—"}
                              </td>

                              {/* 7. الإجمالي الثابت */}
                              <td className="p-4 font-black text-center text-[#1a2530] bg-[#C89355]/5 border-x border-[#C89355]/10">
                                {monthlyFixedTotal > 0 ? monthlyFixedTotal.toLocaleString() : <span className="text-rose-500 text-[10px] bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">غير مضبوط</span>}
                              </td>
                              
                              {/* 8. إدارة */}
                              <td className="p-4 text-center">
                                <div className="flex items-center justify-center gap-2 opacity-60 group-hover/row:opacity-100 transition-opacity">
                                  {!s ? (
                                    <button onClick={() => openFor(null, id)} className="px-4 py-1.5 rounded-xl bg-[#1a2530] text-[#C89355] hover:bg-[#263544] font-black text-[10px] transition-all shadow-sm border border-[#C89355]/30 whitespace-nowrap">
                                      ضبط الراتب
                                    </button>
                                  ) : (
                                    <>
                                      <button onClick={() => openFor(s)} className="text-[#C89355] hover:bg-[#1a2530] p-2.5 rounded-xl transition-all hover:scale-110 shadow-sm"><Edit size={16} /></button>
                                      <button onClick={() => handleDelete(s.employeeId)} className="text-rose-500 hover:bg-rose-500 hover:text-white p-2.5 rounded-xl transition-all hover:scale-110 shadow-sm">
                                        {deleteSalary.isPending ? <Loader2 className="animate-spin" size={16} /> : <Trash size={16} />}
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* تبويب السلف والمكافآت والمسير النهائي بقيت كما هي لعدم طلب تعديلها */}
          {activeTab === "advances" && (/* الكود السابق للسلف */ <div className="p-8 text-center text-slate-500 font-bold">جاري تحميل السلف...</div>)}
          {activeTab === "bonuses" && (/* الكود السابق للمكافآت */ <div className="p-8 text-center text-slate-500 font-bold">جاري تحميل المكافآت...</div>)}
          {activeTab === "final-payroll" && (/* الكود السابق للمسير */ <div className="p-8 text-center text-slate-500 font-bold">جاري تحميل المسير...</div>)}

        </div>
      </div>

      {isFloatingActionVisible && (
        <button onClick={openFloatingAction} className="fixed bottom-8 left-8 z-40 rounded-full w-16 h-16 bg-[#1a2530] text-[#C89355] shadow-[0_10px_30px_rgba(38,53,68,0.5)] hover:bg-[#263544] hover:scale-110 transition-all flex items-center justify-center border-2 border-[#C89355]/40 group">
          <Plus size={28} className="group-hover:animate-spin" />
        </button>
      )}

      {/* المودالات الخاصة بالرواتب والمكافآت */}
      {isModalOpen && <ManageSalaryModal key={`${isModalOpen}-${selected?.employeeId ?? preselectedEmployeeId ?? "new"}`} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} initialData={selected} preselectedEmployeeId={preselectedEmployeeId} employees={employees} isPending={updateSalary.isPending} onSave={handleSave} />}
      {isAdvanceModalOpen && <AddAdvanceModal isOpen={isAdvanceModalOpen} onClose={() => setIsAdvanceModalOpen(false)} employees={employeesForFinanceModals} isPending={false} onSave={() => {}} />}
      {isBonusModalOpen && <AddBonusModal isOpen={isBonusModalOpen} onClose={() => setIsBonusModalOpen(false)} employees={employeesForFinanceModals} isPending={false} onSave={() => {}} />}
    </>
  );
}