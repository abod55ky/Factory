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
import { Edit, Trash, Gift, Calculator, Plus, Sparkles, Loader2 } from "lucide-react";
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
  <div className="space-y-3 p-6">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="h-12 rounded-xl bg-slate-100/80 animate-pulse" />
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

  // build maps and union of ids so we show employees without salary too
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
    <div className="min-h-screen p-8 bg-[radial-gradient(circle_at_10%_20%,rgba(59,130,246,0.13),transparent_36%),radial-gradient(circle_at_90%_15%,rgba(16,185,129,0.12),transparent_35%),#f8fafc]" dir="rtl">
      <div className="mb-6">
        <div className="rounded-3xl border border-white/40 bg-white/70 backdrop-blur-xl shadow-[0_10px_40px_-25px_rgba(15,23,42,0.35)] p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                <Sparkles className="text-blue-600" />
                المركز المالي الذكي
              </h1>
              <p className="text-sm text-slate-500 mt-2">لوحة موحدة لإدارة الرواتب والسلف والمكافآت وحساب المسير النهائي بدقة مؤسسية.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-right">
                <p className="text-[11px] text-slate-500">إجمالي السلف المتبقية</p>
                <p className="font-bold text-slate-900">{tabStats.totalAdvances.toLocaleString()}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-right">
                <p className="text-[11px] text-slate-500">إجمالي المكافآت</p>
                <p className="font-bold text-emerald-700">{tabStats.totalBonus.toLocaleString()}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-right">
                <p className="text-[11px] text-slate-500">إجمالي الخصومات</p>
                <p className="font-bold text-rose-700">{tabStats.totalDeductions.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <FinancialHubTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          </div>
        </div>
      </div>

      {activeTab === "salary-config" && (
        <div className="bg-white/85 backdrop-blur border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
{isLoading ? (
             <SkeletonRows />
           ) : isError ? (
             <div className="p-6 text-red-600">خطأ: {error?.message ?? "فشل تحميل البيانات"}</div>
           ) : (
            <div className="w-full overflow-x-auto">
            <table className="w-full text-right min-w-245">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-4 font-medium text-center">كود الموظف</th>
                <th className="p-4 font-medium text-center">اسم الموظف</th>
                <th className="p-4 font-medium text-center">المهنة</th>
                <th className="p-4 font-medium text-center">الراتب الأساسي</th>
                <th className="p-4 font-medium text-center">إجمالي البدلات</th>
                <th className="p-4 font-medium text-center">الإجمالي الثابت الشهري</th>
                <th className="p-4 font-medium text-center">إدارة</th>
              </tr>
            </thead>
            <tbody>
              {allIds.length === 0 ? (
                <tr><td colSpan={7} className="p-6 text-center text-slate-500">لا توجد سجلات</td></tr>
              ) : (
                allIds.map((id: string) => {
                  const s = salaryMap.get(id) ?? null;
                  const emp = employeeMap.get(id) ?? null;

                  if (!s) {
                    // Employee exists but no salary record
                    const baseFromEmployee = toNumber(emp?.hourlyRate);
                    const monthlyFixedTotal = baseFromEmployee;

                    return (
                      <tr key={id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-mono text-center">{id}</td>
                        <td className="p-4 text-center">{employeesLoading ? "جارٍ التحميل..." : (emp?.name ?? "موظف محذوف")}</td>
                        <td className="p-4 text-center">{emp?.profession ?? emp?.department ?? "—"}</td>
                        <td className="p-4 text-center">{baseFromEmployee > 0 ? baseFromEmployee.toLocaleString() : "—"}</td>
                        <td className="p-4 text-center">0</td>
                        <td className="p-4 font-bold text-center">{monthlyFixedTotal > 0 ? monthlyFixedTotal.toLocaleString() : "لم يتم ضبط الراتب"}</td>
                        <td className="p-4 text-center">
                          <div className="flex items-center gap-3 justify-center">
                            <button onClick={() => openFor(null, id)} className="px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 active:scale-95">تعديل</button>
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
                  const monthlyFixedTotal = base + totalAllowances; // monthly fixed total
                  const employeeName = employeeNameMap[s.employeeId];

                  return (
                    <tr key={s.employeeId} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono text-center">{s.employeeId}</td>
                      <td className="p-4 text-center">{employeesLoading ? "جارٍ التحميل..." : (employeeName ?? "موظف محذوف")}</td>
                      <td className="p-4 text-center">{s.profession}</td>
                      <td className="p-4 text-center">{base.toLocaleString()}</td>
                      <td className="p-4 text-center">{totalAllowances.toLocaleString()}</td>
                      <td className="p-4 font-bold text-center">{monthlyFixedTotal.toLocaleString()}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center gap-3 justify-center">
                          <button onClick={() => openFor(s)} className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 active:scale-95">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDelete(s.employeeId)} className="p-2 rounded-lg text-red-600 hover:bg-red-50 active:scale-95">
                            {deleteSalary.isPending ? <Loader2 className="animate-spin" size={18} /> : <Trash size={18} />}
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
        <div className="bg-white/85 backdrop-blur border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-right min-w-245">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-4 text-center">الموظف</th>
                  <th className="p-4 text-center">إجمالي السلفة</th>
                  <th className="p-4 text-center">القسط الشهري</th>
                  <th className="p-4 text-center">المتبقي</th>
                  <th className="p-4 text-center">تاريخ الإصدار</th>
                  <th className="p-4 text-center">حالة الخصم</th>
                  <th className="p-4 text-center">إدارة</th>
                </tr>
              </thead>
              <tbody>
                {(advances || []).length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-500">لا توجد سلف مسجلة حالياً.</td></tr>
                ) : (
                  (advances || []).map((item: Advance) => {
                    const remaining = toNumber(item.remainingAmount);
                    return (
                      <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-center">{employeeNameMap[item.employeeId] || item.employeeId}</td>
                        <td className="p-4 text-center">{toNumber(item.totalAmount).toLocaleString()}</td>
                        <td className="p-4 text-center">{toNumber(item.installmentAmount).toLocaleString()}</td>
                        <td className="p-4 text-center font-bold text-blue-700">{remaining.toLocaleString()}</td>
                        <td className="p-4 text-center">{new Date(item.issueDate).toLocaleDateString("ar-EG")}</td>
                        <td className="p-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${remaining > 0 ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}`}>
                            {remaining > 0 ? "جارٍ الخصم" : "مكتمل"}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedAdvance(item);
                                setIsAdvanceModalOpen(true);
                              }}
                              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 active:scale-95"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => deleteAdvance.mutate(item.id)}
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50 active:scale-95"
                            >
                              {deleteAdvance.isPending ? <Loader2 className="animate-spin" size={18} /> : <Trash size={18} />}
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
        <div className="space-y-4">
          <div className="flex justify-between items-center rounded-2xl border border-white/50 bg-white/75 backdrop-blur p-4">
            <h2 className="font-bold text-slate-800 flex items-center gap-2"><Gift size={18} /> إدارة المكافآت والخصومات</h2>
            <input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="p-2 rounded-lg border border-slate-200 bg-white"
            />
          </div>

          <div className="bg-white/85 backdrop-blur border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-right min-w-245">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="p-4 text-center">الموظف</th>
                    <th className="p-4 text-center">الفترة</th>
                    <th className="p-4 text-center">المكافأة</th>
                    <th className="p-4 text-center">الخصومات</th>
                    <th className="p-4 text-center">السبب</th>
                    <th className="p-4 text-center">إدارة</th>
                  </tr>
                </thead>
                <tbody>
                  {(bonuses || []).length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-500">لا توجد سجلات في هذه الفترة.</td></tr>
                  ) : (
                    (bonuses || []).map((item: Bonus) => (
                      <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-center">{employeeNameMap[item.employeeId] || item.employeeId}</td>
                        <td className="p-4 text-center">{item.period || "—"}</td>
                        <td className="p-4 text-center text-emerald-700 font-bold">{toNumber(item.bonusAmount).toLocaleString()}</td>
                        <td className="p-4 text-center text-rose-700 font-bold">{toNumber(item.assistanceAmount).toLocaleString()}</td>
                        <td className="p-4 text-center">{item.bonusReason || "—"}</td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedBonus(item);
                                setIsBonusModalOpen(true);
                              }}
                              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 active:scale-95"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => deleteBonus.mutate(item.id)}
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50 active:scale-95"
                            >
                              {deleteBonus.isPending ? <Loader2 className="animate-spin" size={18} /> : <Trash size={18} />}
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
        <div className="space-y-4">
          <div className="flex justify-between items-center rounded-2xl border border-white/50 bg-white/75 backdrop-blur p-4">
            <h2 className="font-bold text-slate-800 flex items-center gap-2"><Calculator size={18} /> المسير النهائي للفترة</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRunPayroll}
                disabled={calculatePayroll.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {calculatePayroll.isPending ? <Loader2 size={14} className="animate-spin" /> : <Calculator size={14} />}
                تشغيل المسير على الخادم
              </button>
              <input
                type="month"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="p-2 rounded-lg border border-slate-200 bg-white"
              />
            </div>
          </div>

          {lastCalculatedRunId ? (
            <p className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
              آخر تشغيل ناجح للمسير: {lastCalculatedRunId}
            </p>
          ) : null}

          <div className="bg-white/85 backdrop-blur border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-right min-w-245">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="p-4 text-center">الموظف</th>
                    <th className="p-4 text-center">أيام الحضور</th>
                    <th className="p-4 text-center">الراتب النسبي</th>
                    <th className="p-4 text-center">المكافآت</th>
                    <th className="p-4 text-center">الخصومات</th>
                    <th className="p-4 text-center">خصم السلف</th>
                    <th className="p-4 text-center">صافي المستحق</th>
                  </tr>
                </thead>
                <tbody>
                  {finalPayrollRows.length === 0 ? (
                    <tr><td colSpan={7} className="p-8 text-center text-slate-500">لا توجد بيانات كافية لحساب المسير.</td></tr>
                  ) : (
                    finalPayrollRows.map((row) => (
                      <tr key={row.employeeId} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-center">{row.employeeName}</td>
                        <td className="p-4 text-center">{row.attendanceDays}</td>
                        <td className="p-4 text-center">{row.proratedBase.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                        <td className="p-4 text-center text-emerald-700">{row.totalBonus.toLocaleString()}</td>
                        <td className="p-4 text-center text-rose-700">{row.totalDeductions.toLocaleString()}</td>
                        <td className="p-4 text-center text-orange-700">{row.advancesInstallments.toLocaleString()}</td>
                        <td className="p-4 text-center font-extrabold text-blue-700">{row.net.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-xs text-slate-500 px-2">المعادلة: (الراتب الأساسي ÷ 26 × أيام الحضور) + المكافآت - الخصومات - أقساط السلف.</p>
        </div>
      )}

      {isFloatingActionVisible && (
        <button
          onClick={openFloatingAction}
          className="fixed bottom-8 left-8 z-40 rounded-full w-14 h-14 bg-blue-600 text-white shadow-xl hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center"
          title="إضافة سجل جديد"
        >
          <Plus size={24} />
        </button>
      )}

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

      {isSaving && (
        <div className="fixed bottom-6 right-6 z-40 rounded-2xl border border-white/60 bg-white/85 backdrop-blur px-4 py-3 shadow-lg">
          <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Loader2 className="animate-spin" size={16} />
            جارٍ حفظ التعديلات المالية...
          </p>
        </div>
      )}
    </div>
  );
}
