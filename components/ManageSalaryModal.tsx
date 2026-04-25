// "use client";

// import { useState } from "react";
// import { X, Loader2, Save } from "lucide-react";
// import type { Employee } from "@/types/employee";
// import type { Salary } from "@/types/salary";

// type SalaryPayload = {
//   profession: string;
//   baseSalary: number;
//   responsibilityAllowance: number;
//   productionIncentive: number;
//   transportAllowance: number;
// };

// type SalaryFormState = {
//   employeeId: string;
//   profession: string;
//   baseSalary: string;
//   responsibilityAllowance: string;
//   productionIncentive: string;
//   transportAllowance: string;
// };

// interface Props {
//   isOpen: boolean;
//   onClose: () => void;
//   onSave: (employeeId: string, data: SalaryPayload) => void;
//   isPending?: boolean;
//   initialData?: Salary | null;
//   employees?: Employee[];
//   preselectedEmployeeId?: string | undefined;
// }

// const defaultForm: SalaryFormState = {
//   employeeId: "",
//   profession: "",
//   baseSalary: "",
//   responsibilityAllowance: "",
//   productionIncentive: "",
//   transportAllowance: "",
// };

// const toText = (value: number | string | { $numberDecimal: string } | undefined) => {
//   if (value && typeof value === "object" && "$numberDecimal" in value) {
//     return value.$numberDecimal;
//   }
//   return value?.toString() ?? "";
// };

// const calculateBaseSalary = (employee: Employee) => {
//   const raw = employee.hourlyRate;
//   const enteredWage = Number(toText(raw) || 0);
//   return enteredWage > 0 ? enteredWage.toString() : "";
// };

// const buildForm = ({
//   initialData,
//   preselectedEmployeeId,
//   employees,
// }: {
//   initialData?: Salary | null;
//   preselectedEmployeeId?: string;
//   employees: Employee[];
// }): SalaryFormState => {
//   if (initialData) {
//     return {
//       employeeId: initialData.employeeId || "",
//       profession: initialData.profession || "",
//       baseSalary: toText(initialData.baseSalary),
//       responsibilityAllowance: toText(initialData.responsibilityAllowance),
//       productionIncentive: toText(initialData.productionIncentive),
//       transportAllowance: toText(initialData.transportAllowance),
//     };
//   }

//   if (preselectedEmployeeId) {
//     const employee = employees.find((entry) => entry.employeeId === preselectedEmployeeId);
//     if (employee) {
//       return {
//         employeeId: preselectedEmployeeId,
//         profession: employee.department || "",
//         baseSalary: calculateBaseSalary(employee),
//         responsibilityAllowance: "",
//         productionIncentive: "",
//         transportAllowance: "",
//       };
//     }
//   }

//   return defaultForm;
// };

// export default function ManageSalaryModal({ isOpen, onClose, onSave, isPending, initialData, employees = [], preselectedEmployeeId }: Props) {
//   const [form, setForm] = useState<SalaryFormState>(() =>
//     buildForm({ initialData, preselectedEmployeeId, employees }),
//   );

//   if (!isOpen) return null;

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     // Convert numeric fields to numbers before sending
//     const payload = {
//       profession: form.profession,
//       baseSalary: Number(form.baseSalary || 0),
//       responsibilityAllowance: Number(form.responsibilityAllowance || 0),
//       productionIncentive: Number(form.productionIncentive || 0),
//       transportAllowance: Number(form.transportAllowance || 0),
//     };
//     onSave(form.employeeId, payload);
//   };

//   return (
//     <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
//       <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
//         <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
//           <h2 className="text-xl font-bold text-slate-800">{initialData ? "تعديل الراتب" : "إدارة الراتب"}</h2>
//           <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
//             <X size={24} />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
//           <div>
//             <label className="block text-sm font-bold text-slate-700 mb-2">كود الموظف (ID)</label>
//             {/* employees are passed from parent to avoid duplicate fetches */}
//             <select
//               required
//               value={form.employeeId}
//               onChange={(e) => {
//                 const empId = e.target.value;
//                 const emp = employees.find((entry) => entry.employeeId === empId);

//                 if (!emp) {
//                   setForm((p) => ({ ...p, employeeId: empId }));
//                   return;
//                 }

//                 // auto-calc base salary and sync profession from department
//                 setForm((p) => ({
//                   ...p,
//                   employeeId: empId,
//                   profession: emp.department || "",
//                   baseSalary: calculateBaseSalary(emp),
//                 }));
//               }}
//               className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dir-ltr text-left font-mono"
//               disabled={!!initialData}
//             >
//               <option value="">اختر موظفاً...</option>
//               {employees.map((emp) => (
//                 <option key={emp.employeeId} value={emp.employeeId}>
//                   {emp.employeeId} — {emp.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-bold text-slate-700 mb-2">المهنة / الوظيفة</label>
//             <input
//               type="text"
//               list="profession-options"
//               value={form.profession}
//               onChange={(e) => setForm((p) => ({ ...p, profession: e.target.value }))}
//               className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
//             />
//             <datalist id="profession-options">
//               {Array.from(
//                 new Set(
//                   employees
//                     .map((emp) => emp.department)
//                     .filter((department): department is string => Boolean(department)),
//                 ),
//               ).map((department) => (
//                 <option key={department} value={department} />
//               ))}
//             </datalist>
//           </div>

//           <div>
//             <label className="block text-sm font-bold text-slate-700 mb-2">الراتب الأساسي</label>
//             <input
//               type="number"
//               value={form.baseSalary}
//               onChange={(e) => setForm((p) => ({ ...p, baseSalary: e.target.value }))}
//               className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-bold text-slate-700 mb-2">بدل المسؤولية</label>
//             <input
//               type="number"
//               value={form.responsibilityAllowance}
//               onChange={(e) => setForm((p) => ({ ...p, responsibilityAllowance: e.target.value }))}
//               className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-bold text-slate-700 mb-2">حافز الإنتاج</label>
//             <input
//               type="number"
//               value={form.productionIncentive}
//               onChange={(e) => setForm((p) => ({ ...p, productionIncentive: e.target.value }))}
//               className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-bold text-slate-700 mb-2">بدل النقل</label>
//             <input
//               type="number"
//               value={form.transportAllowance}
//               onChange={(e) => setForm((p) => ({ ...p, transportAllowance: e.target.value }))}
//               className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
//             />
//           </div>

//           <div className="md:col-span-2 pt-4 border-t border-slate-100 flex justify-end gap-3">
//             <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all">
//               إلغاء
//             </button>
//             <button type="submit" disabled={isPending} className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all disabled:bg-slate-300">
//               {isPending ? <Loader2 className="animate-spin" /> : <Save size={20} />}
//               حفظ
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }



"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Save, Coins, Zap, Briefcase, Sparkles, Shield, Search, Wallet } from "lucide-react";
import type { Employee } from "@/types/employee";
import type { Salary } from "@/types/salary";

// 1. تحديث الـ Payload ليتطابق مع الثوابت الجديدة
type SalaryPayload = {
  profession: string;
  baseSalary: number;
  transportAllowance: number;
  extraEffort: number;
  responsibilityAllowance: number;
  productionIncentive: number;
  insurances: number;
};

type SalaryFormState = {
  employeeId: string;
  baseSalary: string;
  extraEffort: string;
  responsibilityAllowance: string;
  productionIncentive: string;
  insurances: string;
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
  baseSalary: "",
  extraEffort: "",
  responsibilityAllowance: "",
  productionIncentive: "",
  insurances: "",
};

const toText = (value: unknown) => {
  if (value && typeof value === "object" && "$numberDecimal" in (value as Record<string, unknown>)) {
    return String((value as { $numberDecimal: string }).$numberDecimal || "");
  }
  return value ? String(value) : "";
};

// حساب الراتب الأساسي المبدئي إن لم يكن موجوداً
const calculateBaseSalary = (employee: Employee) => {
  const raw = employee.hourlyRate;
  const enteredWage = Number(toText(raw) || 0);
  return enteredWage > 0 ? enteredWage.toString() : "";
};

type SalaryWithFixedExtras = Salary & {
  extraEffort?: unknown;
  insurances?: unknown;
};

const buildInitialForm = ({
  initialData,
  preselectedEmployeeId,
  employees,
}: {
  initialData?: Salary | null;
  preselectedEmployeeId?: string;
  employees: Employee[];
}): SalaryFormState => {
  if (initialData) {
    const safeInitial = initialData as SalaryWithFixedExtras;
    return {
      employeeId: safeInitial.employeeId || "",
      baseSalary: toText(safeInitial.baseSalary),
      extraEffort: toText(safeInitial.extraEffort),
      responsibilityAllowance: toText(safeInitial.responsibilityAllowance),
      productionIncentive: toText(safeInitial.productionIncentive),
      insurances: toText(safeInitial.insurances),
    };
  }

  if (preselectedEmployeeId) {
    const emp = employees.find((entry) => entry.employeeId === preselectedEmployeeId);
    if (emp) {
      return {
        ...defaultForm,
        employeeId: preselectedEmployeeId,
        baseSalary: calculateBaseSalary(emp),
      };
    }
  }

  return defaultForm;
};

const buildInitialSearchQuery = ({
  initialData,
  preselectedEmployeeId,
  employees,
}: {
  initialData?: Salary | null;
  preselectedEmployeeId?: string;
  employees: Employee[];
}) => {
  if (initialData?.employeeId) {
    const emp = employees.find((entry) => entry.employeeId === initialData.employeeId);
    return emp ? `${emp.employeeId} - ${emp.name}` : initialData.employeeId;
  }

  if (preselectedEmployeeId) {
    const emp = employees.find((entry) => entry.employeeId === preselectedEmployeeId);
    return emp ? `${emp.employeeId} - ${emp.name}` : "";
  }

  return "";
};

export default function ManageSalaryModal({ isOpen, onClose, onSave, isPending, initialData, employees = [], preselectedEmployeeId }: Props) {
  
  // حالات البحث الذكي عن الموظف
  const [searchQuery, setSearchQuery] = useState(() =>
    buildInitialSearchQuery({ initialData, preselectedEmployeeId, employees }),
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<SalaryFormState>(() =>
    buildInitialForm({ initialData, preselectedEmployeeId, employees }),
  );

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  // إغلاق القائمة المنسدلة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // فلترة الموظفين بناءً على البحث (الاسم أو الكود)
  const filteredEmployees = useMemo(() => {
    if (!searchQuery) return employees;
    return employees.filter(emp => 
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [employees, searchQuery]);

  if (!isOpen) return null;
  if (typeof document === "undefined") return null;

  const handleSelectEmployee = (emp: Employee) => {
    setForm(p => ({ ...p, employeeId: emp.employeeId, baseSalary: calculateBaseSalary(emp) }));
    setSearchQuery(`${emp.employeeId} - ${emp.name}`);
    setIsDropdownOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeId) return alert("الرجاء اختيار الموظف");

    const payload: SalaryPayload = {
      profession: "",
      baseSalary: Number(form.baseSalary || 0),
      transportAllowance: 0,
      extraEffort: Number(form.extraEffort || 0),
      responsibilityAllowance: Number(form.responsibilityAllowance || 0),
      productionIncentive: Number(form.productionIncentive || 0),
      insurances: Number(form.insurances || 0),
    };
    onSave(form.employeeId, payload);
  };

  // حساب الإجمالي اللحظي للعرض
  const netTotal = 
    Number(form.baseSalary || 0) + 
    Number(form.extraEffort || 0) + 
    Number(form.responsibilityAllowance || 0) + 
    Number(form.productionIncentive || 0) - 
    Number(form.insurances || 0);

  return createPortal(
    <div className="fixed inset-0 z-999999 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md transition-all duration-300" dir="rtl">
      <div className="bg-[#101720] rounded-[2.5rem] shadow-[0_30px_90px_-15px_rgba(0,0,0,0.9)] w-full max-w-3xl max-h-[95vh] overflow-hidden flex flex-col border border-white/10 outline-dashed outline-1 outline-[#C89355]/30 -outline-offset-8">
        
        {/* الترويسة */}
        <div className="p-6 sm:p-8 border-b border-white/5 flex justify-between items-center bg-[#1a2530]/80 shrink-0 relative z-10">
          <div className="flex items-center gap-4">
            <div className="bg-[#C89355]/10 p-3 rounded-2xl border border-[#C89355]/20 shadow-[0_0_20px_rgba(200,147,85,0.15)]">
               <Wallet className="text-[#C89355]" size={28} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                {initialData ? "تعديل راتب الموظف" : "ضبط الراتب والثوابت"}
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-rose-400 bg-[#263544] p-2.5 rounded-2xl border border-transparent hover:border-rose-400/30 transition-all active:scale-90">
            <X size={24} />
          </button>
        </div>

        {/* جسم النموذج */}
        <div className="overflow-y-auto custom-scrollbar flex-1 p-8 sm:p-10 relative">
          <form id="salaryForm" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
            
            {/* اختيار الموظف (البحث الذكي) */}
            <div className="md:col-span-2" ref={dropdownRef}>
              <label className="block text-xs font-black text-[#C89355] mb-2 uppercase">الموظف (الاسم أو الكود)</label>
              <div className="relative group">
                <input 
                  type="text" 
                  required 
                  placeholder="اكتب للبحث عن موظف..." 
                  className="w-full p-4 bg-[#1a2530] border border-[#263544] rounded-2xl focus:ring-2 focus:ring-[#C89355]/30 focus:border-[#C89355] outline-none transition-all text-white font-bold shadow-inner pr-12 placeholder:text-slate-500 disabled:opacity-50"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  disabled={!!initialData} // نمنع تغيير الموظف إذا كنا في وضع التعديل
                />
                <Search className="absolute right-4 top-4 text-slate-500 group-focus-within:text-[#C89355] transition-colors" size={22} />
                
                {/* القائمة المنسدلة لنتائج البحث */}
                {isDropdownOpen && !initialData && (
                  <div className="absolute top-[calc(100%+8px)] left-0 w-full max-h-56 overflow-y-auto custom-scrollbar bg-[#1a2530] border border-[#263544] rounded-2xl shadow-2xl z-50 p-2">
                    {filteredEmployees.length === 0 ? (
                      <div className="p-4 text-center text-slate-500 font-bold text-sm">لا يوجد موظف بهذا الاسم أو الكود</div>
                    ) : (
                      filteredEmployees.map((emp) => (
                        <div 
                          key={emp.employeeId} 
                          onClick={() => handleSelectEmployee(emp)}
                          className="flex items-center gap-3 p-3 hover:bg-[#263544] rounded-xl cursor-pointer transition-colors"
                        >
                          <div className="bg-[#101720] px-2 py-1 rounded text-xs font-mono font-bold text-[#C89355] border border-[#263544]">{emp.employeeId}</div>
                          <span className="font-bold text-white text-sm">{emp.name}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* الحقول المالية */}
            <div>
              <label className="block text-xs font-black text-[#C89355] mb-2 uppercase">الراتب الأساسي (ل.س)</label>
              <div className="relative group">
                <input type="number" min={0} required className="w-full p-4 bg-[#101720] border border-[#263544] rounded-2xl focus:border-[#C89355] outline-none text-white text-lg font-mono font-black pr-12 shadow-inner" value={form.baseSalary} onChange={(e) => setForm(p => ({ ...p, baseSalary: e.target.value }))} />
                <Coins className="absolute right-4 top-4.5 text-slate-500 group-focus-within:text-[#C89355]" size={22} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-[#C89355] mb-2 uppercase">جهد إضافي (ل.س)</label>
              <div className="relative group">
                <input type="number" min={0} className="w-full p-4 bg-[#101720] border border-[#263544] rounded-2xl focus:border-[#C89355] outline-none text-white text-lg font-mono font-black pr-12 shadow-inner" value={form.extraEffort} onChange={(e) => setForm(p => ({ ...p, extraEffort: e.target.value }))} />
                <Zap className="absolute right-4 top-4.5 text-slate-500 group-focus-within:text-[#C89355]" size={22} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-[#C89355] mb-2 uppercase">تعويض مسؤولية (ل.س)</label>
              <div className="relative group">
                <input type="number" min={0} className="w-full p-4 bg-[#101720] border border-[#263544] rounded-2xl focus:border-[#C89355] outline-none text-white text-lg font-mono font-black pr-12 shadow-inner" value={form.responsibilityAllowance} onChange={(e) => setForm(p => ({ ...p, responsibilityAllowance: e.target.value }))} />
                <Briefcase className="absolute right-4 top-4.5 text-slate-500 group-focus-within:text-[#C89355]" size={22} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-[#C89355] mb-2 uppercase">حوافز إنتاجية (ل.س)</label>
              <div className="relative group">
                <input type="number" min={0} className="w-full p-4 bg-[#101720] border border-[#263544] rounded-2xl focus:border-[#C89355] outline-none text-white text-lg font-mono font-black pr-12 shadow-inner" value={form.productionIncentive} onChange={(e) => setForm(p => ({ ...p, productionIncentive: e.target.value }))} />
                <Sparkles className="absolute right-4 top-4.5 text-slate-500 group-focus-within:text-[#C89355]" size={22} />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-black text-rose-500 mb-2 uppercase">التأمينات - خصم (ل.س)</label>
              <div className="relative group">
                <input type="number" min={0} className="w-full p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl focus:border-rose-500 outline-none text-rose-500 text-lg font-mono font-black pr-12 shadow-inner" value={form.insurances} onChange={(e) => setForm(p => ({ ...p, insurances: e.target.value }))} />
                <Shield className="absolute right-4 top-4.5 text-rose-500/50 group-focus-within:text-rose-500" size={22} />
              </div>
            </div>

            {/* عرض الإجمالي اللحظي */}
            <div className="md:col-span-2 mt-4 bg-[#1a2530] border border-[#263544] p-5 rounded-2xl flex justify-between items-center shadow-inner">
              <span className="text-sm font-black text-slate-400">الإجمالي الثابت (الراتب + البدلات - التأمينات)</span>
              <span className="text-2xl font-mono font-black text-[#C89355]">{netTotal.toLocaleString()} <span className="text-xs text-slate-500">ل.س</span></span>
            </div>

          </form>
        </div>

        {/* أزرار الإجراءات */}
        <div className="p-6 sm:p-8 bg-[#1a2530]/80 border-t border-white/5 flex justify-between shrink-0 relative z-10">
          <button type="button" onClick={onClose} className="px-8 py-3.5 rounded-2xl font-bold text-slate-400 bg-[#263544] hover:text-white transition-all active:scale-95">
            إلغاء التعديل
          </button>

          <button type="submit" form="salaryForm" disabled={isPending} className="bg-[#C89355] text-[#101720] px-10 py-3.5 rounded-2xl font-black flex items-center gap-3 hover:bg-[#d0b468] active:scale-95 transition-all shadow-[0_0_20px_rgba(200,147,85,0.3)] disabled:opacity-50">
            {isPending ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} 
            {isPending ? "جاري الحفظ..." : "حفظ بيانات الراتب"}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}