"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEmployees } from "@/hooks/useEmployees";
import type { Employee } from "@/types/employee";
import { Plus, Edit2, Trash2, Loader2, Search, Filter, ChevronLeft, Users } from "lucide-react";

const AddEmployeeModal = dynamic(() => import("@/components/AddEmployeeModal"), {
  loading: () => null,
});

const asHourlyRateText = (value: Employee["hourlyRate"]) => {
  if (value && typeof value === "object" && "$numberDecimal" in value) {
    return value.$numberDecimal;
  }
  return value ?? "";
};

export default function EmployeesPage() {
  const { data: employees, isLoading, createEmployee, updateEmployee, deleteEmployee } = useEmployees();
  const visibleEmployees = useMemo(
    () => (employees || []).filter((emp) => emp.status !== "terminated"),
    [employees],
  );
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  // حالات البحث والفلترة
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [selectedDept, setSelectedDept] = useState("الكل");

  // استخراج الأقسام الفريدة للفلتر
  const departments = useMemo(() => {
    if (!visibleEmployees.length) return ["الكل"];
    const depts = new Set(visibleEmployees.map(emp => emp.department));
    return ["الكل", ...Array.from(depts)];
  }, [visibleEmployees]);

  // تطبيق البحث والفلترة
  const filteredEmployees = useMemo(() => {
    if (!visibleEmployees.length) return [];
    return visibleEmployees.filter(emp => {
      const matchesSearch = emp.name.includes(searchTerm) || emp.employeeId.includes(searchTerm);
      const matchesDept = selectedDept === "الكل" || emp.department === selectedDept;
      return matchesSearch && matchesDept;
    });
  }, [visibleEmployees, searchTerm, selectedDept]);

  const handleDelete = async (id: string, name: string) => {
     if (window.confirm(`هل أنت متأكد من حذف الموظف: ${name}؟`)) {
       try {
         await deleteEmployee.mutateAsync(id);
       } catch {}
     }
  };

  const handleEditClick = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsModalOpen(true);
  };

  const handleSaveEmployee = async (formData: Employee) => {
    try {
      if (selectedEmployee) {
        await updateEmployee.mutateAsync({ id: selectedEmployee.employeeId, data: formData });
      } else {
        await createEmployee.mutateAsync(formData);
      }
      setIsModalOpen(false);
      setSelectedEmployee(null);
    } catch {}
  };

  return (
    /* الخلفية المتدرجة الأساسية */
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-gradient-to-br from-[#00bba7] via-[#00bba7]/90 to-[#E7C873]" dir="rtl">
      
      {/* الحاوية الرئيسية (Wrapper) الزجاجية مع البوردر الذهبي والشادو */}
      <div className="relative z-10 w-full max-w-7xl min-h-[90vh] bg-white/70 backdrop-blur-3xl rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border-2 border-[#E7C873]/80 flex flex-col overflow-hidden">
        
        {/* المحتوى الداخلي */}
        <div className="p-6 md:p-10 h-full overflow-y-auto custom-scrollbar">
          
          {/* الهيدر وأدوات التحكم مدمجة بأسلوب لوحة التحكم */}
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-black/5 pb-6 relative">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-gradient-to-br from-[#00bba7] to-[#008275] rounded-2xl shadow-lg shadow-[#00bba7]/20 border border-[#00bba7]/20">
                  {/* أنيميشن قفز لأيقونة العنوان */}
                  <Users size={24} className="text-white animate-bounce" />
                </div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                  إدارة الموظفين
                </h1>
              </div>
              {/* مسار التنقل (Breadcrumbs) */}
              <nav className="flex items-center gap-2 text-sm font-bold text-slate-500 pr-14">
                <span>إدارة الموارد البشرية</span>
                <ChevronLeft size={14} className="animate-pulse text-[#E7C873]" />
                <span className="text-[#00bba7]">قائمة الموظفين</span>
              </nav>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* شريط البحث */}
              <div className="relative group">
                <div className={`flex items-center bg-white/80 backdrop-blur-md border border-white/80 rounded-xl px-3 py-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 focus-within:border-[#00bba7] focus-within:ring-2 focus-within:ring-[#00bba7]/20 hover:shadow-md ${isSearchExpanded ? 'w-64' : 'w-10 md:w-48'}`}>
                  <Search size={18} className="text-[#E7C873] ml-2 shrink-0 cursor-pointer group-hover:animate-pulse" onClick={() => setIsSearchExpanded(true)} />
                  <input 
                    type="text" 
                    placeholder="ابحث بالاسم أو الرمز..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsSearchExpanded(true)}
                    onBlur={() => { if(!searchTerm) setIsSearchExpanded(false) }}
                    className={`bg-transparent text-sm font-medium text-slate-700 outline-none transition-all w-full placeholder:text-slate-400 ${isSearchExpanded ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}
                  />
                </div>
              </div>

              {/* فلتر الأقسام */}
              <div className="relative flex items-center bg-white/80 backdrop-blur-md border border-white/80 rounded-xl px-3 py-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus-within:border-[#00bba7] focus-within:ring-2 focus-within:ring-[#00bba7]/20 transition-all duration-300 hover:shadow-md group">
                <Filter size={16} className="text-[#E7C873] ml-2 group-hover:animate-pulse" />
                <select 
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="w-full md:w-auto flex justify-end">
                <button 
                  onClick={() => { setSelectedEmployee(null); setIsModalOpen(true); }}
                  className="bg-gradient-to-r from-[#00bba7] to-[#008275] hover:from-[#00a392] hover:to-[#006e63] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-[0_10px_20px_rgba(0,187,167,0.3)] transition-all active:scale-95 text-sm font-bold border border-[#00bba7]/50 group"
                >
                  <Plus size={18} className="group-hover:animate-spin" /> إضافة موظف
                </button>
              </div>
            </div>
          </header>

          {/* الجدول بتصميم الكارد مع الشادو */}
          <div className="bg-white rounded-[2.5rem] shadow-[0_25px_50px_rgba(0,0,0,0.05)] border border-white/80 overflow-hidden">
            <div className="w-full overflow-x-auto custom-scrollbar">
              <table className="w-full text-right min-w-150">
                <thead className="bg-slate-50/50 border-b border-slate-100/80">
                  <tr>
                    <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider">الموظف</th>
                    <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">القسم</th>
                    <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">أجر الساعة</th>
                    <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">الحالة</th>
                    <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="p-16 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="animate-spin text-[#E7C873]" size={40} />
                          <span className="font-bold text-[#00bba7] animate-pulse">جاري تحميل قائمة الموظفين...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-16 text-center text-slate-400 font-medium">
                        لا يوجد بيانات مطابقة للبحث.
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp: Employee) => (
                      <tr key={emp.employeeId} className="hover:bg-[#00bba7]/[0.02] transition-colors group">
                        <td className="p-4">
                          <Link href={`/employees/${emp.employeeId}`} className="flex items-center gap-3 w-fit">
                            <div>
                              <div className="font-bold text-slate-800 group-hover:text-[#00bba7] transition-colors">{emp.name}</div>
                              <div className="text-[11px] text-slate-400 font-mono mt-0.5">{emp.employeeId}</div>
                            </div>
                          </Link>
                        </td>
                        <td className="p-4 text-center">
                          <span className="bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg text-[11px] font-bold border border-slate-100">
                            {emp.department}
                          </span>
                        </td>
                        <td className="p-4 text-center font-mono font-bold text-slate-700 text-sm">
                          {asHourlyRateText(emp.hourlyRate)} <span className="text-[10px] text-slate-400">ل.س</span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-4 py-1.5 rounded-xl text-[11px] font-bold border ${
                            emp.status === 'active' 
                              ? 'bg-[#00bba7]/10 text-[#00bba7] border-[#00bba7]/20 shadow-sm' 
                              : 'bg-rose-50 text-rose-600 border-rose-100 shadow-sm'
                          }`}>
                            {emp.status === 'active' ? 'نشط' : 'متوقف'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleEditClick(emp)}
                              className="text-[#E7C873] hover:bg-[#E7C873]/10 p-2.5 rounded-xl transition-all hover:scale-110"
                              title="تعديل بيانات الموظف"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(emp.employeeId, emp.name)}
                              className="text-rose-500 hover:bg-rose-50 p-2.5 rounded-xl transition-all hover:scale-110"
                              title="حذف الموظف"
                            >
                              <Trash2 size={16} />
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

          {/* نافذة الإضافة والتعديل */}
          {isModalOpen && (
            <AddEmployeeModal 
              key={`${isModalOpen}-${selectedEmployee?.employeeId ?? "new"}`}
              isOpen={isModalOpen} 
              onClose={() => { setIsModalOpen(false); setSelectedEmployee(null); }} 
              onSave={handleSaveEmployee}
              isPending={createEmployee.isPending || updateEmployee.isPending}
              initialData={selectedEmployee ?? undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
}