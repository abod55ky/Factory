"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import useSalaries from "@/hooks/useSalaries";
import { useEmployees } from "@/hooks/useEmployees";
import { useAdvances } from "@/hooks/useAdvances";
import { useBonuses } from "@/hooks/useBonuses";
import { useAttendance } from "@/hooks/useAttendance";
import { usePayroll } from "@/hooks/usePayroll";
import type { FinancialTabKey } from "@/components/salaries/FinancialHubTabs";
import { Edit, Trash, Gift, Calculator, Plus, Sparkles, Loader2, Wallet, HandCoins } from "lucide-react";
import { toast } from "react-hot-toast";
import type { Salary } from "@/types/salary";
import type { Employee } from "@/types/employee";
import type { Advance } from "@/types/advance";
import type { Bonus } from "@/types/bonus";

const FinancialHubTabs = dynamic(() => import("@/components/salaries/FinancialHubTabs"), {
  loading: () => null,
});
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
  const { data: salaries = [], isLoading, isError, error, updateSalary, deleteSalary } = useSalaries();
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const { data: advances = [], createAdvance, updateAdvance, deleteAdvance } = useAdvances();
  const { calculatePayroll } = usePayroll();

  const [period, setPeriod] = useState(getLocalMonth());
  const { start: monthStart, end: monthEnd } = useMemo(() => getMonthBounds(period), [period]);
  const { data: bonuses = [], createBonus, updateBonus, deleteBonus } = useBonuses({ period });
  const { data: attendanceData } = useAttendance({ startDate: monthStart, endDate: monthEnd, limit: 2000 });

  const [activeTab, setActiveTab] = useState<FinancialTabKey>("salary-config");

  const activeEmployees = useMemo(
    () => (employees || []).filter((employee) => employee.status !== "terminated"),
    [employees],
  );

  const employeeNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (Array.isArray(activeEmployees)) {
      for (const emp of activeEmployees) {
        if (emp?.employeeId) map[emp.employeeId] = emp.name || emp.employeeId;
      }
    }
    return map;
  }, [activeEmployees]);

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
    (activeEmployees || []).forEach((e) => { if (e?.employeeId) m.set(e.employeeId, e); });
    return m;
  }, [activeEmployees]);

  const salaryMap = useMemo(() => {
    const m = new Map<string, Salary>();
    (salaries || []).forEach((s) => { if (s?.employeeId) m.set(s.employeeId, s); });
    return m;
  }, [salaries]);

  const allIds = useMemo(() => {
    return activeEmployees
      .map((employee) => employee.employeeId)
      .filter((employeeId): employeeId is string => Boolean(employeeId));
  }, [activeEmployees]);

  const attendanceDaysMap = useMemo(() => {
    const map = new Map<string, number>();
    const daily = attendanceData?.dailyRecords || [];

    for (const rec of daily) {
      if (!rec?.employeeId || !rec?.checkIn) continue;
      map.set(rec.employeeId, (map.get(rec.employeeId) || 0) + 1);
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

      const baseSalary = salary ? toNumber(salary.baseSalary) : toNumber(employee?.hourlyRate);
      const proratedBase = (baseSalary / 26) * attendanceDays;

      const employeeBonuses = (bonuses || []).filter((b: Bonus) => b.employeeId === employeeId);
      const totalBonus = employeeBonuses.reduce((sum: number, b: Bonus) => sum + toNumber(b.bonusAmount), 0);
      const totalDeductions = employeeBonuses.reduce((sum: number, b: Bonus) => sum + toNumber(b.assistanceAmount), 0);
       
      const employeeAdvances = (advances || []).filter((a: Advance) => a.employeeId === employeeId);
      const advancesInstallments = employeeAdvances.reduce((sum: number, a: Advance) => sum + toNumber(a.installmentAmount), 0);

      const net = proratedBase + totalBonus - totalDeductions - advancesInstallments;

      return {
        employeeId,
        employeeName: employeeNameMap[employeeId] || employeeId,
        attendanceDays,
        proratedBase,
        totalBonus,
        totalDeductions,
        advancesInstallments,
        net,
      };
    });
  }, [allIds, salaryMap, employeeMap, attendanceDaysMap, bonuses, advances, employeeNameMap]);

  const handleSave = (employeeId: string, payload: SalaryPayload) => {
    if (!employeeId) return toast.error("يرجى إدخال كود الموظف");
    updateSalary.mutate({ employeeId, data: { employeeId, ...payload } });
    setIsModalOpen(false);
  };

  const handleDelete = (employeeId: string) => {
    if (!confirm(`هل تريد حذف بيانات الراتب للموظف ${employeeId}؟`)) return;
    deleteSalary.mutate(employeeId);
  };

  const tabs = [
    { key: "salary-config" as const, label: "إعداد الرواتب", subtitle: "تعريف الراتب الثابت والبدلات" },
    { key: "advances" as const, label: "السلف", subtitle: "متابعة الاستحقاقات والخصومات" },
    { key: "bonuses" as const, label: "المكافآت والخصومات", subtitle: "ضبط الحوافز والاقتطاعات" },
    { key: "final-payroll" as const, label: "المسير النهائي", subtitle: "حساب صافي الراتب الشهري" },
  ];

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
    /* الخلفية المتدرجة الأساسية للموقع */
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-gradient-to-br from-[#00bba7] via-[#00bba7]/90 to-[#E7C873]" dir="rtl">
      
      {/* الحاوية الرئيسية (Wrapper) الزجاجية مع البوردر الذهبي والشادو */}
      <div className="relative z-10 w-full max-w-7xl min-h-[90vh] bg-white/70 backdrop-blur-3xl rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border-2 border-[#E7C873]/80 flex flex-col overflow-hidden">
        
        {/* المحتوى الداخلي */}
        <div className="p-6 md:p-10 h-full overflow-y-auto custom-scrollbar">
          
          <header className="mb-10 flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-black/5 pb-8 relative">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-gradient-to-br from-[#00bba7] to-[#008275] rounded-2xl shadow-lg shadow-[#00bba7]/20 border border-[#00bba7]/20">
                  {/* أنيميشن قفز لأيقونة العنوان */}
                  <Sparkles size={24} className="text-white animate-bounce" />
                </div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                  المركز المالي الذكي
                </h1>
              </div>
              <p className="text-slate-500 text-sm font-medium pr-14 mt-1">لوحة موحدة لإدارة الرواتب والسلف والمكافآت وحساب المسير النهائي بدقة مؤسسية.</p>
            </div>

            <div className="mt-4 xl:mt-0 flex flex-wrap items-center gap-4 w-full xl:w-auto">
              <div className="bg-white/80 backdrop-blur-md border border-white/80 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-1 xl:flex-none hover:shadow-md transition-all group min-w-[140px]">
                <div className="flex items-center gap-2 mb-1.5">
                  <HandCoins size={14} className="text-[#E7C873] group-hover:animate-pulse" />
                  <p className="text-[11px] font-bold text-slate-500">إجمالي السلف المتبقية</p>
                </div>
                <p className="font-black text-xl text-slate-800">{tabStats.totalAdvances.toLocaleString()}</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-md border border-white/80 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-1 xl:flex-none hover:shadow-md transition-all group min-w-[140px]">
                <div className="flex items-center gap-2 mb-1.5">
                  <Gift size={14} className="text-[#00bba7] group-hover:animate-pulse" />
                  <p className="text-[11px] font-bold text-slate-500">إجمالي المكافآت</p>
                </div>
                <p className="font-black text-xl text-[#00bba7]">{tabStats.totalBonus.toLocaleString()}</p>
              </div>

              <div className="bg-white/80 backdrop-blur-md border border-white/80 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-1 xl:flex-none hover:shadow-md transition-all group min-w-[140px]">
                <div className="flex items-center gap-2 mb-1.5">
                  <Wallet size={14} className="text-rose-500 group-hover:animate-pulse" />
                  <p className="text-[11px] font-bold text-slate-500">إجمالي الخصومات</p>
                </div>
                <p className="font-black text-xl text-rose-600">{tabStats.totalDeductions.toLocaleString()}</p>
              </div>
            </div>
          </header>

          <div className="mb-8">
            <FinancialHubTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          </div>

          {activeTab === "salary-config" && (
            <div className="bg-white rounded-[2.5rem] shadow-[0_25px_50px_rgba(0,0,0,0.05)] border border-white/80 overflow-hidden">
              {isLoading ? (
                <SkeletonRows />
              ) : isError ? (
                <div className="p-8 text-center font-bold text-rose-600 bg-rose-50/50">خطأ: {error?.message ?? "فشل تحميل البيانات"}</div>
              ) : (
                <div className="w-full overflow-x-auto custom-scrollbar">
                  <table className="w-full text-right min-w-245">
                    <thead className="bg-slate-50/50 border-b border-slate-100/80">
                      <tr>
                        <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">كود الموظف</th>
                        <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">اسم الموظف</th>
                        <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">المهنة</th>
                        <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">الراتب الأساسي</th>
                        <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">إجمالي البدلات</th>
                        <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">الإجمالي الثابت الشهري</th>
                        <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">إدارة</th>
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
                              <tr key={id} className="hover:bg-[#00bba7]/[0.02] transition-colors group">
                                <td className="p-4 font-mono text-center text-sm text-slate-500">{id}</td>
                                <td className="p-4 text-center font-bold text-slate-800">{employeesLoading ? "جارٍ التحميل..." : (emp?.name ?? "موظف محذوف")}</td>
                                <td className="p-4 text-center text-sm text-slate-600 font-medium">{emp?.profession ?? emp?.department ?? "—"}</td>
                                <td className="p-4 text-center font-mono font-bold text-slate-700">{baseFromEmployee > 0 ? baseFromEmployee.toLocaleString() : "—"}</td>
                                <td className="p-4 text-center text-slate-400">0</td>
                                <td className="p-4 font-black text-center text-slate-800">{monthlyFixedTotal > 0 ? monthlyFixedTotal.toLocaleString() : <span className="text-rose-500 text-xs">لم يتم ضبط الراتب</span>}</td>
                                <td className="p-4 text-center">
                                  <div className="flex items-center gap-3 justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openFor(null, id)} className="px-4 py-1.5 rounded-xl bg-[#00bba7]/10 text-[#00bba7] hover:bg-[#00bba7] hover:text-white font-bold text-xs transition-all shadow-sm">
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
                            <tr key={s.employeeId} className="hover:bg-[#00bba7]/[0.02] transition-colors group">
                              <td className="p-4 font-mono text-center text-sm text-slate-500">{s.employeeId}</td>
                              <td className="p-4 text-center font-bold text-slate-800">{employeesLoading ? "جارٍ التحميل..." : (employeeName ?? "موظف محذوف")}</td>
                              <td className="p-4 text-center text-sm text-slate-600 font-medium">{s.profession}</td>
                              <td className="p-4 text-center font-mono font-bold text-slate-700">{base.toLocaleString()}</td>
                              <td className="p-4 text-center font-mono font-bold text-[#E7C873]">{totalAllowances.toLocaleString()}</td>
                              <td className="p-4 font-black text-center text-[#00bba7]">{monthlyFixedTotal.toLocaleString()}</td>
                              <td className="p-4 text-center">
                                <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => openFor(s)} className="text-[#E7C873] hover:bg-[#E7C873]/10 p-2.5 rounded-xl transition-all hover:scale-110" title="تعديل الراتب">
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
            <div className="bg-white rounded-[2.5rem] shadow-[0_25px_50px_rgba(0,0,0,0.05)] border border-white/80 overflow-hidden">
              <div className="w-full overflow-x-auto custom-scrollbar">
                <table className="w-full text-right min-w-245">
                  <thead className="bg-slate-50/50 border-b border-slate-100/80">
                    <tr>
                      <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">الموظف</th>
                      <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">إجمالي السلفة</th>
                      <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">القسط الشهري</th>
                      <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">المتبقي</th>
                      <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">تاريخ الإصدار</th>
                      <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">حالة الخصم</th>
                      <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">إدارة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {(advances || []).length === 0 ? (
                      <tr><td colSpan={7} className="p-16 text-center text-slate-500 font-medium">لا توجد سلف مسجلة حالياً.</td></tr>
                    ) : (
                      (advances || []).map((item: Advance) => {
                        const remaining = toNumber(item.remainingAmount);
                        return (
                          <tr key={item.id} className="hover:bg-[#00bba7]/[0.02] transition-colors group">
                            <td className="p-4 text-center font-bold text-slate-800">{employeeNameMap[item.employeeId] || item.employeeId}</td>
                            <td className="p-4 text-center font-mono font-bold text-slate-700">{toNumber(item.totalAmount).toLocaleString()}</td>
                            <td className="p-4 text-center font-mono font-bold text-[#E7C873]">{toNumber(item.installmentAmount).toLocaleString()}</td>
                            <td className="p-4 text-center font-black text-[#00bba7]">{remaining.toLocaleString()}</td>
                            <td className="p-4 text-center font-mono text-sm text-slate-500">{new Date(item.issueDate).toLocaleDateString("ar-EG")}</td>
                            <td className="p-4 text-center">
                              <span className={`px-4 py-1.5 rounded-xl text-[11px] font-bold border shadow-sm ${remaining > 0 ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-[#00bba7]/10 text-[#00bba7] border-[#00bba7]/20"}`}>
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
                                  className="text-[#E7C873] hover:bg-[#E7C873]/10 p-2.5 rounded-xl transition-all hover:scale-110"
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
            <div className="space-y-6">
              <div className="flex justify-between items-center rounded-2xl border border-white/80 bg-white/80 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5">
                <h2 className="font-black text-slate-800 flex items-center gap-3 text-lg">
                  <Gift size={20} className="text-[#00bba7] animate-pulse" /> إدارة المكافآت والخصومات
                </h2>
                <div className="relative">
                  <input
                    type="month"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white font-mono text-sm text-slate-700 outline-none focus:border-[#00bba7] focus:ring-2 focus:ring-[#00bba7]/20 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] shadow-[0_25px_50px_rgba(0,0,0,0.05)] border border-white/80 overflow-hidden">
                <div className="w-full overflow-x-auto custom-scrollbar">
                  <table className="w-full text-right min-w-245">
                    <thead className="bg-slate-50/50 border-b border-slate-100/80">
                      <tr>
                        <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">الموظف</th>
                        <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">الفترة</th>
                        <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">المكافأة</th>
                        <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">الخصومات</th>
                        <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">السبب</th>
                        <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">إدارة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {(bonuses || []).length === 0 ? (
                        <tr><td colSpan={6} className="p-16 text-center text-slate-500 font-medium">لا توجد سجلات في هذه الفترة.</td></tr>
                      ) : (
                        (bonuses || []).map((item: Bonus) => (
                          <tr key={item.id} className="hover:bg-[#00bba7]/[0.02] transition-colors group">
                            <td className="p-4 text-center font-bold text-slate-800">{employeeNameMap[item.employeeId] || item.employeeId}</td>
                            <td className="p-4 text-center font-mono text-sm text-slate-500">{item.period || "—"}</td>
                            <td className="p-4 text-center text-[#00bba7] font-black">{toNumber(item.bonusAmount).toLocaleString()}</td>
                            <td className="p-4 text-center text-rose-600 font-black">{toNumber(item.assistanceAmount).toLocaleString()}</td>
                            <td className="p-4 text-center text-slate-600 text-sm font-medium">{item.bonusReason || "—"}</td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => {
                                    setSelectedBonus(item);
                                    setIsBonusModalOpen(true);
                                  }}
                                  className="text-[#E7C873] hover:bg-[#E7C873]/10 p-2.5 rounded-xl transition-all hover:scale-110"
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
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 rounded-2xl border border-white/80 bg-white/80 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5">
                <h2 className="font-black text-slate-800 flex items-center gap-3 text-lg">
                  <Calculator size={20} className="text-[#00bba7] animate-pulse" /> المسير النهائي للفترة
                </h2>
                <div className="flex items-center gap-4">
                  <input
                    type="month"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white font-mono text-sm text-slate-700 outline-none focus:border-[#00bba7] focus:ring-2 focus:ring-[#00bba7]/20 transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={handleRunPayroll}
                    disabled={calculatePayroll.isPending}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00bba7] to-[#008275] hover:from-[#00a392] hover:to-[#006e63] px-4 py-2.5 text-sm font-bold text-white shadow-[0_10px_20px_rgba(0,187,167,0.3)] transition-all active:scale-95 border border-[#00bba7]/50 disabled:opacity-60 disabled:cursor-not-allowed group"
                  >
                    {calculatePayroll.isPending ? <Loader2 size={16} className="animate-spin" /> : <Calculator size={16} className="group-hover:animate-bounce" />}
                    تشغيل المسير
                  </button>
                </div>
              </div>

              {lastCalculatedRunId ? (
                <div className="text-sm text-[#00bba7] bg-[#00bba7]/10 border border-[#00bba7]/20 rounded-xl px-4 py-3 font-bold flex items-center gap-2 shadow-sm">
                  <Sparkles size={16} /> آخر تشغيل ناجح للمسير: <span className="font-mono">{lastCalculatedRunId}</span>
                </div>
              ) : null}

              <div className="bg-white rounded-[2.5rem] shadow-[0_25px_50px_rgba(0,0,0,0.05)] border border-white/80 overflow-hidden">
                <div className="w-full overflow-x-auto custom-scrollbar">
                  <table className="w-full text-right min-w-245">
                    <thead className="bg-slate-50/50 border-b border-slate-100/80">
                      <tr>
                        <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">الموظف</th>
                        <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">أيام الحضور</th>
                        <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">الراتب النسبي</th>
                        <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">المكافآت</th>
                        <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">الخصومات</th>
                        <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">خصم السلف</th>
                        <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">صافي المستحق</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {finalPayrollRows.length === 0 ? (
                        <tr><td colSpan={7} className="p-16 text-center text-slate-500 font-medium">لا توجد بيانات كافية لحساب المسير.</td></tr>
                      ) : (
                        finalPayrollRows.map((row) => (
                          <tr key={row.employeeId} className="hover:bg-[#00bba7]/[0.02] transition-colors group">
                            <td className="p-4 text-center font-bold text-slate-800">{row.employeeName}</td>
                            <td className="p-4 text-center font-mono font-bold text-slate-600">{row.attendanceDays}</td>
                            <td className="p-4 text-center font-mono font-bold text-slate-700">{row.proratedBase.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                            <td className="p-4 text-center font-black text-[#00bba7]">{row.totalBonus.toLocaleString()}</td>
                            <td className="p-4 text-center font-black text-rose-600">{row.totalDeductions.toLocaleString()}</td>
                            <td className="p-4 text-center font-black text-[#E7C873]">{row.advancesInstallments.toLocaleString()}</td>
                            <td className="p-4 text-center font-black text-xl text-slate-900 bg-slate-50/50">{row.net.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium px-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E7C873]"></span>
                المعادلة: (الراتب الأساسي ÷ 26 × أيام الحضور) + المكافآت - الخصومات - أقساط السلف.
              </p>
            </div>
          )}

        </div>
      </div>

      {/* زر الإضافة العائم */}
      {isFloatingActionVisible && (
        <button
          onClick={openFloatingAction}
          className="fixed bottom-8 left-8 z-40 rounded-full w-14 h-14 bg-gradient-to-br from-[#00bba7] to-[#008275] text-white shadow-[0_10px_30px_rgba(0,187,167,0.4)] hover:scale-110 active:scale-95 transition-all flex items-center justify-center border border-[#00bba7]/50 group"
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
          employees={activeEmployees}
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
          employees={Array.isArray(activeEmployees) ? activeEmployees : []}
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
          employees={Array.isArray(activeEmployees) ? activeEmployees : []}
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
          <Loader2 className="animate-spin text-[#00bba7]" size={18} />
          <p className="text-sm font-bold text-slate-700">
            جارٍ حفظ التعديلات المالية...
          </p>
        </div>
      )}
    </div>
  );
}