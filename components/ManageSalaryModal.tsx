"use client";

import { useState } from "react";
import { X, Loader2, Save } from "lucide-react";
import type { Employee } from "@/types/employee";
import type { Salary } from "@/types/salary";

type SalaryPayload = {
  profession: string;
  baseSalary: number;
  responsibilityAllowance: number;
  productionIncentive: number;
  transportAllowance: number;
};

type SalaryFormState = {
  employeeId: string;
  profession: string;
  baseSalary: string;
  responsibilityAllowance: string;
  productionIncentive: string;
  transportAllowance: string;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employeeId: string, data: SalaryPayload) => void;
  isPending?: boolean;
  initialData?: Salary | null;
  employees?: Employee[];
  preselectedEmployeeId?: string | undefined;
}

const defaultForm: SalaryFormState = {
  employeeId: "",
  profession: "",
  baseSalary: "",
  responsibilityAllowance: "",
  productionIncentive: "",
  transportAllowance: "",
};

const toText = (value: number | string | { $numberDecimal: string } | undefined) => {
  if (value && typeof value === "object" && "$numberDecimal" in value) {
    return value.$numberDecimal;
  }
  return value?.toString() ?? "";
};

const calculateBaseSalary = (employee: Employee) => {
  const raw = employee.hourlyRate;
  const enteredWage = Number(toText(raw) || 0);
  return enteredWage > 0 ? enteredWage.toString() : "";
};

const buildForm = ({
  initialData,
  preselectedEmployeeId,
  employees,
}: {
  initialData?: Salary | null;
  preselectedEmployeeId?: string;
  employees: Employee[];
}): SalaryFormState => {
  if (initialData) {
    return {
      employeeId: initialData.employeeId || "",
      profession: initialData.profession || "",
      baseSalary: toText(initialData.baseSalary),
      responsibilityAllowance: toText(initialData.responsibilityAllowance),
      productionIncentive: toText(initialData.productionIncentive),
      transportAllowance: toText(initialData.transportAllowance),
    };
  }

  if (preselectedEmployeeId) {
    const employee = employees.find((entry) => entry.employeeId === preselectedEmployeeId);
    if (employee) {
      return {
        employeeId: preselectedEmployeeId,
        profession: employee.department || "",
        baseSalary: calculateBaseSalary(employee),
        responsibilityAllowance: "",
        productionIncentive: "",
        transportAllowance: "",
      };
    }
  }

  return defaultForm;
};

export default function ManageSalaryModal({ isOpen, onClose, onSave, isPending, initialData, employees = [], preselectedEmployeeId }: Props) {
  const [form, setForm] = useState<SalaryFormState>(() =>
    buildForm({ initialData, preselectedEmployeeId, employees }),
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert numeric fields to numbers before sending
    const payload = {
      profession: form.profession,
      baseSalary: Number(form.baseSalary || 0),
      responsibilityAllowance: Number(form.responsibilityAllowance || 0),
      productionIncentive: Number(form.productionIncentive || 0),
      transportAllowance: Number(form.transportAllowance || 0),
    };
    onSave(form.employeeId, payload);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">{initialData ? "تعديل الراتب" : "إدارة الراتب"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">كود الموظف (ID)</label>
            {/* employees are passed from parent to avoid duplicate fetches */}
            <select
              required
              value={form.employeeId}
              onChange={(e) => {
                const empId = e.target.value;
                const emp = employees.find((entry) => entry.employeeId === empId);

                if (!emp) {
                  setForm((p) => ({ ...p, employeeId: empId }));
                  return;
                }

                // auto-calc base salary and sync profession from department
                setForm((p) => ({
                  ...p,
                  employeeId: empId,
                  profession: emp.department || "",
                  baseSalary: calculateBaseSalary(emp),
                }));
              }}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dir-ltr text-left font-mono"
              disabled={!!initialData}
            >
              <option value="">اختر موظفاً...</option>
              {employees.map((emp) => (
                <option key={emp.employeeId} value={emp.employeeId}>
                  {emp.employeeId} — {emp.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">المهنة / الوظيفة</label>
            <input
              type="text"
              list="profession-options"
              value={form.profession}
              onChange={(e) => setForm((p) => ({ ...p, profession: e.target.value }))}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <datalist id="profession-options">
              {Array.from(
                new Set(
                  employees
                    .map((emp) => emp.department)
                    .filter((department): department is string => Boolean(department)),
                ),
              ).map((department) => (
                <option key={department} value={department} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">الراتب الأساسي</label>
            <input
              type="number"
              value={form.baseSalary}
              onChange={(e) => setForm((p) => ({ ...p, baseSalary: e.target.value }))}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">بدل المسؤولية</label>
            <input
              type="number"
              value={form.responsibilityAllowance}
              onChange={(e) => setForm((p) => ({ ...p, responsibilityAllowance: e.target.value }))}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">حافز الإنتاج</label>
            <input
              type="number"
              value={form.productionIncentive}
              onChange={(e) => setForm((p) => ({ ...p, productionIncentive: e.target.value }))}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">بدل النقل</label>
            <input
              type="number"
              value={form.transportAllowance}
              onChange={(e) => setForm((p) => ({ ...p, transportAllowance: e.target.value }))}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="md:col-span-2 pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all">
              إلغاء
            </button>
            <button type="submit" disabled={isPending} className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all disabled:bg-slate-300">
              {isPending ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              حفظ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
