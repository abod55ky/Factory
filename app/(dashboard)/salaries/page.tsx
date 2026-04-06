"use client";

import { useMemo, useState } from "react";
import useSalaries from "@/hooks/useSalaries";
import { useEmployees } from "@/hooks/useEmployees";
import ManageSalaryModal from "@/components/ManageSalaryModal";
import { DollarSign, Edit, Trash } from "lucide-react";
import { toast } from "react-hot-toast";

export default function SalariesPage() {
  const { data: salaries = [], isLoading, isError, error, useEmployeeSalary, updateSalary, deleteSalary } = useSalaries();
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();

  // build a lookup map employeeId -> name
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
  const [selected, setSelected] = useState<any | null>(null);
  const [preselectedEmployeeId, setPreselectedEmployeeId] = useState<string | undefined>(undefined);

  const openFor = (salary?: any, preselectId?: string) => {
    setSelected(salary ?? null);
    setPreselectedEmployeeId(preselectId);
    setIsModalOpen(true);
  };

  // build maps and union of ids so we show employees without salary too
  const employeeMap = useMemo(() => {
    const m = new Map<string, any>();
    (employees || []).forEach((e: any) => { if (e?.employeeId) m.set(e.employeeId, e); });
    return m;
  }, [employees]);

  const salaryMap = useMemo(() => {
    const m = new Map<string, any>();
    (salaries || []).forEach((s: any) => { if (s?.employeeId) m.set(s.employeeId, s); });
    return m;
  }, [salaries]);

  const allIds = useMemo(() => {
    const set = new Set<string>();
    (employees || []).forEach((e: any) => e?.employeeId && set.add(e.employeeId));
    (salaries || []).forEach((s: any) => s?.employeeId && set.add(s.employeeId));
    return Array.from(set);
  }, [employees, salaries]);

  const handleSave = (employeeId: string, payload: any) => {
    if (!employeeId) return toast.error("يرجى إدخال كود الموظف");
    updateSalary.mutate({ employeeId, data: { employeeId, ...payload } });
    setIsModalOpen(false);
  };

  const handleDelete = (employeeId: string) => {
    if (!confirm(`هل تريد حذف بيانات الراتب للموظف ${employeeId}؟`)) return;
    deleteSalary.mutate(employeeId);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3"><DollarSign /> إدارة الرواتب الثابتة</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => openFor(null)} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors">إضافة / إدارة راتب</button>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6">جارٍ تحميل بيانات الرواتب...</div>
        ) : isError ? (
          <div className="p-6 text-red-600">خطأ: {(error as any)?.message ?? "فشل تحميل البيانات"}</div>
        ) : (
          <table className="w-full text-right">
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
                    return (
                      <tr key={id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-mono text-center">{id}</td>
                        <td className="p-4 text-center">{employeesLoading ? "جارٍ التحميل..." : (emp?.name ?? "موظف محذوف")}</td>
                        <td className="p-4 text-center">{emp?.profession ?? "—"}</td>
                        <td className="p-4 text-center">—</td>
                        <td className="p-4 text-center">—</td>
                        <td className="p-4 font-bold text-center">لم يتم ضبط الراتب</td>
                        <td className="p-4 text-center">
                          <div className="flex items-center gap-3 justify-center">
                            <button onClick={() => openFor(null, id)} className="px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700">إضافة راتب</button>
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
                          <button onClick={() => openFor(s)} className="p-2 rounded-lg text-slate-600 hover:bg-slate-100">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDelete(s.employeeId)} className="p-2 rounded-lg text-red-600 hover:bg-red-50">
                            <Trash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      <ManageSalaryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selected}
        employees={employees}
        employeesLoading={employeesLoading}
        isPending={(updateSalary as any)?.isLoading}
        onSave={handleSave}
      />
    </div>
  );
}
