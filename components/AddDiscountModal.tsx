"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Save, Search, Wallet, FileText, AlertOctagon, Coins, Calendar } from "lucide-react";
import type { Employee } from "@/types/employee";

export type DiscountPayload = {
  employeeId: string;
  type: string;
  amount: number;
  date: string;
  notes?: string;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: DiscountPayload) => void;
  isPending?: boolean;
  employees?: Employee[];
}

export default function AddDiscountModal({ isOpen, onClose, onSave, isPending, employees = [] }: Props) {
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [form, setForm] = useState({
    employeeId: "",
    type: "سلفة",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    notes: "",
  });

  // control body overflow when modal is open
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredEmployees = useMemo(() => {
    if (!searchQuery) return employees;
    return employees.filter(emp => 
      (emp.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
      (emp.employeeId || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [employees, searchQuery]);

  if (!isOpen) return null;

  const handleSelectEmployee = (emp: Employee) => {
    setForm(p => ({ ...p, employeeId: (emp.employeeId || "") }));
    setSearchQuery(`${emp.employeeId} - ${emp.name}`);
    setIsDropdownOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeId) return alert("الرجاء اختيار الموظف");
    if (!form.amount || Number(form.amount) <= 0) return alert("الرجاء إدخال مبلغ صحيح");

    onSave({
      ...form,
      amount: Number(form.amount)
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-999999 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md transition-all duration-300" dir="rtl">
      <div className="bg-[#101720] rounded-[2.5rem] shadow-[0_30px_90px_-15px_rgba(225,29,72,0.15)] w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col border border-white/10 outline-dashed outline-[#C89355]/30 -outline-offset-8">
        <div className="p-6 sm:p-8 border-b border-white/5 flex justify-between items-center bg-[#1a2530]/80 shrink-0 relative z-10">
          <div className="flex items-center gap-4">
            <div className="bg-rose-500/10 p-3 rounded-2xl border border-rose-500/20 shadow-[0_0_20px_rgba(225,29,72,0.15)]">
               <Wallet className="text-rose-500" size={28} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                إضافة خصم أو سلفة
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-rose-400 bg-[#263544] p-2.5 rounded-2xl border border-transparent hover:border-rose-400/30 transition-all active:scale-90">
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1 p-8 sm:p-10 relative">
          <form id="discountForm" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
            <div className="md:col-span-2" ref={dropdownRef}>
              <label className="block text-xs font-black text-[#C89355] mb-2 uppercase">الموظف (الاسم أو الكود)</label>
              <div className="relative group">
                <input 
                  type="text" 
                  required 
                  placeholder="اكتب للبحث عن موظف..." 
                  className="w-full p-4 bg-[#1a2530] border border-[#263544] rounded-2xl focus:ring-2 focus:ring-[#C89355]/30 focus:border-[#C89355] outline-none transition-all text-white font-bold shadow-inner pr-12 placeholder:text-slate-500"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                />
                <Search className="absolute right-4 top-4 text-slate-500 group-focus-within:text-[#C89355] transition-colors" size={22} />

                {isDropdownOpen && (
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

            <div>
              <label className="block text-xs font-black text-[#C89355] mb-2 uppercase">نوع الإجراء</label>
              <div className="relative group">
                <select 
                  className="w-full p-4 bg-[#1a2530] border border-[#263544] rounded-2xl focus:border-[#C89355] outline-none text-white font-bold cursor-pointer pr-12 appearance-none"
                  value={form.type}
                  onChange={(e) => setForm(p => ({ ...p, type: e.target.value }))}
                >
                  <option value="سلفة">سلفة مالية</option>
                  <option value="تأخير">خصم تأخير</option>
                  <option value="عقوبة">عقوبة إدارية</option>
                  <option value="إجازة بلا راتب">إجازة بلا راتب</option>
                  <option value="خصم متنوع">خصم متنوع</option>
                </select>
                <AlertOctagon className="absolute right-4 top-4 text-slate-500 group-focus-within:text-[#C89355] pointer-events-none" size={22} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-[#C89355] mb-2 uppercase">تاريخ الإجراء</label>
              <div className="relative group">
                <input 
                  type="date" 
                  required 
                  className="w-full p-4 bg-[#1a2530] border border-[#263544] rounded-2xl focus:border-[#C89355] outline-none text-white font-mono font-bold pr-12 scheme-dark"
                  value={form.date}
                  onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))}
                />
                <Calendar className="absolute right-4 top-4 text-slate-500 group-focus-within:text-[#C89355]" size={22} />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-black text-rose-500 mb-2 uppercase">القي́مة / المبلغ المستقطع (ل.س)</label>
              <div className="relative group">
                <input 
                  type="number" 
                  min={1} 
                  required 
                  placeholder="مثال: 50000"
                  className="w-full p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl focus:border-rose-500 outline-none text-rose-500 text-xl font-mono font-black pr-12 shadow-inner" 
                  value={form.amount} 
                  onChange={(e) => setForm(p => ({ ...p, amount: e.target.value }))} 
                />
                <Coins className="absolute right-4 top-4.5 text-rose-500/50 group-focus-within:text-rose-500" size={22} />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-black text-[#C89355] mb-2 uppercase">ملاحظات أخرى (اختياري)</label>
              <div className="relative group">
                <textarea 
                  rows={3} 
                  placeholder="أي تفاصيل أو أسباب إضافة هذا الإجراء..."
                  className="w-full p-4 bg-[#1a2530] border border-[#263544] rounded-2xl focus:border-[#C89355] outline-none text-white font-bold pr-12 resize-none placeholder:text-slate-600" 
                  value={form.notes} 
                  onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))} 
                />
                <FileText className="absolute right-4 top-4 text-slate-500 group-focus-within:text-[#C89355]" size={22} />
              </div>
            </div>

          </form>
        </div>

        <div className="p-6 sm:p-8 bg-[#1a2530]/80 border-t border-white/5 flex justify-between shrink-0 relative z-10">
          <button type="button" onClick={onClose} className="px-8 py-3.5 rounded-2xl font-bold text-slate-400 bg-[#263544] hover:text-white transition-all active:scale-95">
            إلغاء
          </button>

          <button type="submit" form="discountForm" disabled={isPending} className="bg-rose-600 text-white px-10 py-3.5 rounded-2xl font-black flex items-center gap-3 hover:bg-rose-700 active:scale-95 transition-all shadow-[0_0_20px_rgba(225,29,72,0.3)] disabled:opacity-50">
            <Save size={20} /> 
            {isPending ? "جاري الحفظ..." : "اعتماد الخصم"}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
