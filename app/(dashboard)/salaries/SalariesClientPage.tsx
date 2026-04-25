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
import { Edit, Trash, Gift, Calculator, Plus, Sparkles, Loader2, HandCoins, Wallet, FileSpreadsheet } from "lucide-react";
import { toast } from "react-hot-toast";
import type { Salary } from "@/types/salary";
import type { Employee } from "@/types/employee";
import type { Advance } from "@/types/advance";
import type { Bonus } from "@/types/bonus";

export type FinancialTabKey = "salary-config" | "advances" | "bonuses" | "final-payroll";

const ManageSalaryModal = dynamic(() => import("@/components/ManageSalaryModal"), {
  loading: () => null,
});
const AddAdvanceModal = dynamic(() => import("@/components/AddAdvanceModal"), {
  loading: () => null,
});
const AddBonusModal = dynamic(() => import("@/components/AddBonusModal"), {
  loading: () => null,
});

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

type SalaryPayload = {
  profession: string;
  baseSalary: number;
  responsibilityAllowance: number;
  productionIncentive: number;
  transportAllowance: number;
};

const SkeletonRows = () => (
  <div className="space-y-3 p-6 bg-white/50 rounded-3xl">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="h-12 rounded-xl bg-slate-200/50 animate-pulse" />
    ))}
  </div>
);

export default function SalariesPage() {
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const activeTab = getTabFromQuery(requestedTab);

  const { data: salaries = [], isLoading, isError, error, updateSalary, deleteSalary } = useSalaries();
  const { data: employees = [], isLoading: employeesLoading } = useEmployees({
    limit: 200,
    status: "active",
  });
  const { data: advances = [], createAdvance, updateAdvance, deleteAdvance } = useAdvances();
  const { calculatePayroll } = usePayroll();

  const [period, setPeriod] = useState(getLocalMonth());
  const { start: monthStart, end: monthEnd } = useMemo(() => getMonthBounds(period), [period]);
  const { data: bonuses = [], createBonus, updateBonus, deleteBonus } = useBonuses({ period });
  const { data: attendanceData } = useAttendance(
    { startDate: monthStart, endDate: monthEnd, limit: 2000 }
  );

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
      {
        totalLateMinutes: 0,
        totalLateDeduction: 0,
        employeesWithLateDeduction: 0,
      },
    );
  }, [finalPayrollRows]);

  const handleSave = (employeeId: string, payload: SalaryPayload) => {
    if (!employeeId) return toast.error("يرجى إدخال كود الموظف");
    updateSalary.mutate({ employeeId, data: { employeeId, ...payload } });
    setIsModalOpen(false);
  };

  const handleDelete = (employeeId: string) => {
    if (!confirm(`هل تريد حذف بيانات الراتب للموظف ${employeeId}؟`)) return;
    deleteSalary.mutate(employeeId);
  };

  const isSaving =
    updateSalary.isPending ||
    deleteSalary.isPending ||
    createAdvance.isPending ||
    updateAdvance.isPending ||
    deleteAdvance.isPending ||
    createBonus.isPending ||
    updateBonus.isPending ||
    deleteBonus.isPending ||
    calculatePayroll.isPending;

  const handleRunPayroll = () => {
    calculatePayroll.mutate(
      {
        periodStart: monthStart,
        periodEnd: monthEnd,
        gracePeriodMinutes: 15,
      },
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
        "#": "",
        "كود الموظف": "",
        "اسم الموظف": "الإجمالي",
        "أيام الحضور": "",
        "أجر الدقيقة": "",
        "دقائق التأخير": payrollTotals.totalLateMinutes,
        "خصم التأخير": Number(payrollTotals.totalLateDeduction.toFixed(2)),
        "في خصم": payrollTotals.employeesWithLateDeduction.toString(),
        "الراتب النسبي": "",
        "المكافآت": "",
        "الخصومات": "",
        "خصم السلف": "",
        "صافي المستحق": Number(finalPayrollRows.reduce((sum, row) => sum + row.net, 0).toFixed(2)),
      });

      const worksheet = XLSX.utils.json_to_sheet(rows);
      worksheet["!cols"] = [
        { wch: 5 }, { wch: 14 }, { wch: 24 }, { wch: 12 }, { wch: 12 }, 
        { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 14 }, { wch: 12 }, 
        { wch: 12 }, { wch: 12 }, { wch: 14 },
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll");
      XLSX.writeFile(workbook, `payroll-${period}.xlsx`);

      toast.success("تم تنزيل جدول الرواتب Excel بنجاح");
    } catch {
      toast.error("تعذر تنزيل ملف Excel حالياً");
    }
  };

  const openFloatingAction = () => {
    if (activeTab === "salary-config") {
      openFor(null);
      return;
    }
    if (activeTab === "advances") {
      setSelectedAdvance(null);
      setIsAdvanceModalOpen(true);
      return;
    }
    if (activeTab === "bonuses") {
      setSelectedBonus(null);
      setIsBonusModalOpen(true);
    }
  };

  const isFloatingActionVisible = activeTab !== "final-payroll";

  return (
    <>
      <div className="relative z-10 w-full max-w-7xl min-h-[85vh] mx-auto bg-white/70 backdrop-blur-3xl rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border-2 border-[#C89355]/80 flex flex-col overflow-hidden" dir="rtl">
        
        <div className="p-6 md:p-10 h-full overflow-y-auto custom-scrollbar">
          
          <header className="mb-10 flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-black/5 pb-8 relative">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-linear-to-br from-[#101720] to-[#008275] rounded-2xl shadow-lg shadow-[#101720]/20 border border-[#101720]/20 group">
                  <Sparkles size={24} className="text-white group-hover:animate-bounce transition-all duration-300" />
                </div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                  المركز المالي الذكي
                </h1>
              </div>
              <p className="text-slate-500 text-sm font-medium pr-14 mt-1">لوحة موحدة لإدارة الرواتب والسلف والمكافآت وحساب المسير النهائي بدقة مؤسسية.</p>
            </div>

            <div className="mt-4 xl:mt-0 flex flex-wrap items-center gap-4 w-full xl:w-auto">
              <div className="bg-white/80 backdrop-blur-md border border-white/80 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-1 xl:flex-none hover:shadow-md transition-all group min-w-35">
                <div className="flex items-center gap-2 mb-1.5">
                  <HandCoins size={14} className="text-[#C89355] group-hover:animate-pulse transition-all duration-300" />
                  <p className="text-[11px] font-bold text-slate-500">إجمالي السلف المتبقية</p>
                </div>
                <p className="font-black text-xl text-slate-800">{tabStats.totalAdvances.toLocaleString()}</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-md border border-white/80 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-1 xl:flex-none hover:shadow-md transition-all group ">
                <div className="flex items-center gap-2 mb-1.5">
                  <Gift size={14} className="text-[#101720] group-hover:animate-pulse transition-all duration-300" />
                  <p className="text-[11px] font-bold text-slate-500">إجمالي المكافآت</p>
                </div>
                <p className="font-black text-xl text-[#101720]">{tabStats.totalBonus.toLocaleString()}</p>
              </div>

              <div className="bg-white/80 backdrop-blur-md border border-white/80 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-1 xl:flex-none hover:shadow-md transition-all group ">
                <div className="flex items-center gap-2 mb-1.5">
                  <Wallet size={14} className="text-rose-500 group-hover:animate-pulse transition-all duration-300" />
                  <p className="text-[11px] font-bold text-slate-500">إجمالي الخصومات</p>
                </div>
                <p className="font-black text-xl text-rose-600">{tabStats.totalDeductions.toLocaleString()}</p>
              </div>
            </div>
          </header>

          {activeTab === "salary-config" && (
            <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-[0_25px_50px_rgba(0,0,0,0.05)] border border-white/80 overflow-hidden mt-6">
              {isLoading ? (
                <SkeletonRows />
              ) : isError ? (
                <div className="p-8 text-center font-bold text-rose-600 bg-rose-50/50">خطأ: {error?.message ?? "فشل تحميل البيانات"}</div>
              ) : (
                <div className="w-full overflow-x-auto custom-scrollbar">
                  <table className="w-full text-right min-w-245">
                    <thead className="bg-slate-50/50 border-b border-slate-100/80">
                      <tr>
                        <th className="p-5 text-[#101720] font-black text-xs uppercase tracking-wider text-center">كود الموظف</th>
                        <th className="p-5 text-[#101720] font-black text-xs uppercase tracking-wider text-center">اسم الموظف</th>
                        <th className="p-5 text-[#101720] font-black text-xs uppercase tracking-wider text-center">المهنة</th>
                        <th className="p-5 text-[#101720] font-black text-xs uppercase tracking-wider text-center">الراتب الأساسي</th>
                        <th className="p-5 text-[#101720] font-black text-xs uppercase tracking-wider text-center">إجمالي البدلات</th>
                        <th className="p-5 text-[#101720] font-black text-xs uppercase tracking-wider text-center">الإجمالي الثابت الشهري</th>
                        <th className="p-5 text-[#101720] font-black text-xs uppercase tracking-wider text-center">إدارة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {allIds.length === 0 ? (
                        <tr><td colSpan={7} className="p-16 text-center text-slate-500 font-medium">لا توجد سجلات.</td></tr>
                      ) : (
                        allIds.map((id: string) => {
                          const s = salaryMap.get(id) ?? null;
                          const emp = employeeMap.get(id) ?? null;

                          if (!s) {
                            const baseFromEmployee = toNumber(emp?.hourlyRate);
                            const monthlyFixedTotal = baseFromEmployee;

                            return (
                              <tr key={id} className="hover:bg-[#101720]/2 transition-colors group">
                                <td className="p-4 font-mono text-center text-sm text-slate-500">{id}</td>
                                <td className="p-4 text-center font-bold text-slate-800">{employeesLoading ? "جارٍ التحميل..." : (emp?.name ?? "موظف محذوف")}</td>
                                <td className="p-4 text-center text-sm text-slate-600 font-medium">{emp?.profession ?? emp?.department ?? "—"}</td>
                                <td className="p-4 text-center font-mono font-bold text-slate-700">{baseFromEmployee > 0 ? baseFromEmployee.toLocaleString() : "—"}</td>
                                <td className="p-4 text-center text-slate-400">0</td>
                                <td className="p-4 font-black text-center text-slate-800">{monthlyFixedTotal > 0 ? monthlyFixedTotal.toLocaleString() : <span className="text-rose-500 text-xs">لم يتم ضبط الراتب</span>}</td>
                                <td className="p-4 text-center">
                                  <div className="flex items-center gap-3 justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openFor(null, id)} className="px-4 py-1.5 rounded-xl bg-[#101720]/10 text-[#101720] hover:bg-[#101720] hover:text-white font-bold text-xs transition-all shadow-sm">
                                      ضبط الراتب
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          }

                          const base = Number(s.baseSalary || 0);
                          const resp = Number(s.responsibilityAllowance || 0);
                          const prod = Number(s.productionIncentive || 0);
                          const trans = Number(s.transportAllowance || 0);
                          const totalAllowances = resp + prod + trans;
                          const monthlyFixedTotal = base + totalAllowances;
                          const employeeName = employeeNameMap[s.employeeId];

                          return (
                            <tr key={s.employeeId} className="hover:bg-[#101720]/2 transition-colors group">
                              <td className="p-4 font-mono text-center text-sm text-slate-500">{s.employeeId}</td>
                              <td className="p-4 text-center font-bold text-slate-800">{employeesLoading ? "جارٍ التحميل..." : (employeeName ?? "موظف محذوف")}</td>
                              <td className="p-4 text-center text-sm text-slate-600 font-medium">{s.profession}</td>
                              <td className="p-4 text-center font-mono font-bold text-slate-700">{base.toLocaleString()}</td>
                              <td className="p-4 text-center font-mono font-bold text-[#C89355]">{totalAllowances.toLocaleString()}</td>
                              <td className="p-4 font-black text-center text-[#101720]">{monthlyFixedTotal.toLocaleString()}</td>
                              <td className="p-4 text-center">
                                <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => openFor(s)} className="text-[#C89355] hover:bg-[#C89355]/10 p-2.5 rounded-xl transition-all hover:scale-110" title="تعديل الراتب">
                                    <Edit size={16} />
                                  </button>
                                  <button onClick={() => handleDelete(s.employeeId)} className="text-rose-500 hover:bg-rose-50 p-2.5 rounded-xl transition-all hover:scale-110" title="حذف">
                                    {deleteSalary.isPending ? <Loader2 className="animate-spin" size={16} /> : <Trash size={16} />}
                                  </button>
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

          {activeTab === "advances" && (
            <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-[0_25px_50px_rgba(0,0,0,0.05)] border border-white/80 overflow-hidden mt-6">
              <div className="w-full overflow-x-auto custom-scrollbar">
                <table className="w-full text-right min-w-245">
                  <thead className="bg-slate-50/50 border-b border-slate-100/80">
                    <tr>
                      <th className="p-5 text-[#101720] font-black text-xs uppercase tracking-wider text-center">الموظف</th>
                      <th className="p-5 text-[#101720] font-black text-xs uppercase tracking-wider text-center">إجمالي السلفة</th>
                      <th className="p-5 text-[#101720] font-black text-xs uppercase tracking-wider text-center">القسط الشهري</th>
                      <th className="p-5 text-[#101720] font-black text-xs uppercase tracking-wider text-center">المتبقي</th>
                      <th className="p-5 text-[#101720] font-black text-xs uppercase tracking-wider text-center">تاريخ الإصدار</th>
                      <th className="p-5 text-[#101720] font-black text-xs uppercase tracking-wider text-center">حالة الخصم</th>
                      <th className="p-5 text-[#101720] font-black text-xs uppercase tracking-wider text-center">إدارة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {(advances || []).length === 0 ? (
                      <tr><td colSpan={7} className="p-16 text-center text-slate-500 font-medium">لا توجد سلف مسجلة حالياً.</td></tr>
                    ) : (
                      (advances || []).map((item: Advance) => {
                        const remaining = toNumber(item.remainingAmount);
                        return (
                          <tr key={item.id} className="hover:bg-[#101720]/2 transition-colors group">
                            <td className="p-4 text-center font-bold text-slate-800">{employeeNameMap[item.employeeId] || item.employeeId}</td>
                            <td className="p-4 text-center font-mono font-bold text-slate-700">{toNumber(item.totalAmount).toLocaleString()}</td>
                            <td className="p-4 text-center font-mono font-bold text-[#C89355]">{toNumber(item.installmentAmount).toLocaleString()}</td>
                            <td className="p-4 text-center font-black text-[#101720]">{remaining.toLocaleString()}</td>
                            <td className="p-4 text-center font-mono text-sm text-slate-500">{new Date(item.issueDate).toLocaleDateString("ar-EG")}</td>
                            <td className="p-4 text-center">
                              <span className={`px-4 py-1.5 rounded-xl text-[11px] font-bold border shadow-sm ${remaining > 0 ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-[#101720]/10 text-[#101720] border-[#101720]/20"}`}>
                                {remaining > 0 ? "جارٍ الخصم" : "مكتمل"}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => {
                                    setSelectedAdvance(item);
                                    setIsAdvanceModalOpen(true);
                                  }}
                                  className="text-[#C89355] hover:bg-[#C89355]/10 p-2.5 rounded-xl transition-all hover:scale-110"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => deleteAdvance.mutate(item.id)}
                                  className="text-rose-500 hover:bg-rose-50 p-2.5 rounded-xl transition-all hover:scale-110"
                                >
                                  {deleteAdvance.isPending ? <Loader2 className="animate-spin" size={16} /> : <Trash size={16} />}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "bonuses" && (
            <div className="space-y-6 mt-6">
              <div className="flex justify-between items-center rounded-2xl border border-white/80 bg-white/80 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5">
                <h2 className="font-black text-slate-800 flex items-center gap-3 text-lg">
                  <Gift size={20} className="text-[#101720] animate-pulse" /> إدارة المكافآت والخصومات
                </h2>
                <div className="relative">
                  <input
                    type="month"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white font-mono text-sm text-slate-700 outline-none focus:border-[#101720] focus:ring-2 focus:ring-[#101720]/20 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-[0_25px_50px_rgba(0,0,0,0.05)] border border-white/80 overflow-hidden">
                <div className="w-full overflow-x-auto custom-scrollbar">
                  <table className="w-full text-right min-w-245">
                    <thead className="bg-slate-50/50 border-b border-slate-100/80">
                      <tr>
                        <th className="p-5 text-[#101720] font-black text-xs uppercase tracking-wider text-center">الموظف</th>
                        <th className="p-5 text-[#101720] font-black text-xs uppercase tracking-wider text-center">الفترة</th>
                        <th className="p-5 text-[#101720] font-black text-xs uppercase tracking-wider text-center">المكافأة</th>
                        <th className="p-5 text-[#101720] font-black text-xs uppercase tracking-wider text-center">الخصومات</th>
                        <th className="p-5 text-[#101720] font-black text-xs uppercase tracking-wider text-center">السبب</th>
                        <th className="p-5 text-[#101720] font-black text-xs uppercase tracking-wider text-center">إدارة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {(bonuses || []).length === 0 ? (
                        <tr><td colSpan={6} className="p-16 text-center text-slate-500 font-medium">لا توجد سجلات في هذه الفترة.</td></tr>
                      ) : (
                        (bonuses || []).map((item: Bonus) => (
                          <tr key={item.id} className="hover:bg-[#101720]/2 transition-colors group">
                            <td className="p-4 text-center font-bold text-slate-800">{employeeNameMap[item.employeeId] || item.employeeId}</td>
                            <td className="p-4 text-center font-mono text-sm text-slate-500">{item.period || "—"}</td>
                            <td className="p-4 text-center text-[#101720] font-black">{toNumber(item.bonusAmount).toLocaleString()}</td>
                            <td className="p-4 text-center text-rose-600 font-black">{toNumber(item.assistanceAmount).toLocaleString()}</td>
                            <td className="p-4 text-center text-slate-600 text-sm font-medium">{item.bonusReason || "—"}</td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => {
                                    setSelectedBonus(item);
                                    setIsBonusModalOpen(true);
                                  }}
                                  className="text-[#C89355] hover:bg-[#C89355]/10 p-2.5 rounded-xl transition-all hover:scale-110"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => deleteBonus.mutate(item.id)}
                                  className="text-rose-500 hover:bg-rose-50 p-2.5 rounded-xl transition-all hover:scale-110"
                                >
                                  {deleteBonus.isPending ? <Loader2 className="animate-spin" size={16} /> : <Trash size={16} />}
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
            </div>
          )}

          {activeTab === "final-payroll" && (
            <div className="space-y-6 mt-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 rounded-2xl border border-white/80 bg-white/80 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5">
                <h2 className="font-black text-slate-800 flex items-center gap-3 text-lg">
                  <Calculator size={20} className="text-[#101720] animate-pulse" /> المسير النهائي للفترة
                </h2>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <input
                    type="month"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white font-mono text-sm text-slate-700 outline-none focus:border-[#101720] focus:ring-2 focus:ring-[#101720]/20 transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={handleExportPayrollExcel}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md active:scale-95"
                  >
                    <FileSpreadsheet size={16} />
                    تصدير Excel
                  </button>
                  <button
                    type="button"
                    onClick={handleRunPayroll}
                    disabled={calculatePayroll.isPending}
                    className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-[#101720] to-[#008275] hover:from-[#00a392] hover:to-[#006e63] px-4 py-2.5 text-sm font-bold text-white shadow-[0_10px_20px_rgba(0,187,167,0.3)] transition-all active:scale-95 border border-[#101720]/50 disabled:opacity-60 disabled:cursor-not-allowed group"
                  >
                    {calculatePayroll.isPending ? <Loader2 size={16} className="animate-spin" /> : <Calculator size={16} className="group-hover:animate-bounce" />}
                    تشغيل المسير
                  </button>
                </div>
              </div>

              {lastCalculatedRunId ? (
                <div className="text-sm text-[#101720] bg-[#101720]/10 border border-[#101720]/20 rounded-xl px-4 py-3 font-bold flex items-center gap-2 shadow-sm">
                  <Sparkles size={16} /> آخر تشغيل ناجح للمسير: <span className="font-mono">{lastCalculatedRunId}</span>
                </div>
              ) : null}

              <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-[0_25px_50px_rgba(0,0,0,0.05)] border border-white/80 overflow-hidden">
                <div className="w-full overflow-x-auto custom-scrollbar">
                  <table className="w-full text-right min-w-245">
                    <thead className="bg-slate-50/50 border-b border-slate-100/80">
                      <tr>
                        <th className="p-5 text-[#101720] font-black text-xs uppercase tracking-wider text-center">الموظف</th>
                        <th className="p-5 text-[#101720] font-black text-xs uppercase tracking-wider text-center">أيام الحضور</th>
                        <th className="p-5 text-[#101720] font-black text-xs uppercase tracking-wider text-center">الراتب النسبي</th>
                        <th className="p-5 text-rose-500 font-black text-xs uppercase tracking-wider text-center">خصم التأخير</th>
                        <th className="p-5 text-[#101720] font-black text-xs uppercase tracking-wider text-center">المكافآت</th>
                        <th className="p-5 text-[#101720] font-black text-xs uppercase tracking-wider text-center">الخصومات</th>
                        <th className="p-5 text-[#101720] font-black text-xs uppercase tracking-wider text-center">خصم السلف</th>
                        <th className="p-5 text-[#101720] font-black text-xs uppercase tracking-wider text-center">صافي المستحق</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {finalPayrollRows.length === 0 ? (
                        <tr><td colSpan={8} className="p-16 text-center text-slate-500 font-medium">لا توجد بيانات كافية لحساب المسير.</td></tr>
                      ) : (
                        finalPayrollRows.map((row) => (
                          <tr key={row.employeeId} className="hover:bg-[#101720]/2 transition-colors group">
                            <td className="p-4 text-center font-bold text-slate-800">{row.employeeName}</td>
                            <td className="p-4 text-center font-mono font-bold text-slate-600">{row.attendanceDays}</td>
                            <td className="p-4 text-center font-mono font-bold text-slate-700">{row.proratedBase.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                            <td className="p-4 text-center font-mono font-bold text-rose-600 bg-rose-50/30">{row.lateDeduction.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                            <td className="p-4 text-center font-black text-[#101720]">{row.totalBonus.toLocaleString()}</td>
                            <td className="p-4 text-center font-black text-rose-600">{row.totalDeductions.toLocaleString()}</td>
                            <td className="p-4 text-center font-black text-[#C89355]">{row.advancesInstallments.toLocaleString()}</td>
                            <td className="p-4 text-center font-black text-xl text-slate-900 bg-[#101720]/5">{row.net.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium px-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C89355]"></span>
                المعادلة: (الراتب الأساسي ÷ 26 × أيام الحضور) + المكافآت - الخصومات - أقساط السلف - خصم التأخير.
              </p>
            </div>
          )}

        </div>
      </div>

      {/* زر الإضافة العائم */}
      {isFloatingActionVisible && (
        <button
          onClick={openFloatingAction}
          className="fixed bottom-8 left-8 z-40 rounded-full w-14 h-14 bg-linear-to-br from-[#101720] to-[#008275] text-white shadow-[0_10px_30px_rgba(0,187,167,0.4)] hover:scale-110 active:scale-95 transition-all flex items-center justify-center border border-[#101720]/50 group"
          title="إضافة سجل جديد"
        >
          <Plus size={26} className="group-hover:animate-spin" />
        </button>
      )}

      {/* النوافذ المنبثقة */}
      {isModalOpen ? (
        <ManageSalaryModal
          key={`${isModalOpen}-${selected?.employeeId ?? preselectedEmployeeId ?? "new"}`}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialData={selected}
          preselectedEmployeeId={preselectedEmployeeId}
          employees={employees}
          isPending={updateSalary.isPending}
          onSave={handleSave}
        />
      ) : null}

      {isAdvanceModalOpen ? (
        <AddAdvanceModal
          key={`${isAdvanceModalOpen}-${selectedAdvance?.id ?? "new"}`}
          isOpen={isAdvanceModalOpen}
          onClose={() => {
            setIsAdvanceModalOpen(false);
            setSelectedAdvance(null);
          }}
          employees={Array.isArray(employees) ? employees : []}
          initialData={selectedAdvance}
          isPending={createAdvance.isPending || updateAdvance.isPending}
          onSave={(form) => {
            if (selectedAdvance?.id) {
              updateAdvance.mutate(
                {
                  id: selectedAdvance.id,
                  data: {
                    remainingAmount: form.remainingAmount,
                    installmentAmount: form.installmentAmount,
                    notes: form.notes,
                  },
                },
                {
                  onSuccess: () => {
                    setIsAdvanceModalOpen(false);
                    setSelectedAdvance(null);
                  },
                },
              );
              return;
            }

            createAdvance.mutate(form, {
              onSuccess: () => {
                setIsAdvanceModalOpen(false);
              },
            });
          }}
        />
      ) : null}

      {isBonusModalOpen ? (
        <AddBonusModal
          key={`${isBonusModalOpen}-${selectedBonus?.id ?? "new"}`}
          isOpen={isBonusModalOpen}
          onClose={() => {
            setIsBonusModalOpen(false);
            setSelectedBonus(null);
          }}
          employees={Array.isArray(employees) ? employees : []}
          initialData={selectedBonus}
          isPending={createBonus.isPending || updateBonus.isPending}
          onSave={(form) => {
            if (selectedBonus?.id) {
              updateBonus.mutate(
                {
                  id: selectedBonus.id,
                  data: {
                    bonusAmount: form.bonusAmount,
                    bonusReason: form.bonusReason,
                    assistanceAmount: form.assistanceAmount,
                    period: form.period,
                  },
                },
                {
                  onSuccess: () => {
                    setIsBonusModalOpen(false);
                    setSelectedBonus(null);
                  },
                },
              );
              return;
            }

            createBonus.mutate(form, {
              onSuccess: () => {
                setIsBonusModalOpen(false);
              },
            });
          }}
        />
      ) : null}

      {/* تنبيه الحفظ (Loading Toaster) */}
      {isSaving && (
        <div className="fixed bottom-6 right-6 z-40 rounded-2xl border border-white/60 bg-white/85 backdrop-blur-md px-5 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.1)] flex items-center gap-3">
          <Loader2 className="animate-spin text-[#101720]" size={18} />
          <p className="text-sm font-bold text-slate-700">
            جارٍ حفظ التعديلات المالية...
          </p>
        </div>
      )}
    </>
  );
}
