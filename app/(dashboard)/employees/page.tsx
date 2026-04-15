// "use client";

// import { useState } from "react";
// import dynamic from "next/dynamic";
// import { useEmployees } from "@/hooks/useEmployees";
// import type { Employee } from "@/types/employee";
// import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";

// const AddEmployeeModal = dynamic(() => import("@/components/AddEmployeeModal"), {
//   loading: () => null,
// });

// const asHourlyRateText = (value: Employee["hourlyRate"]) => {
//   if (value && typeof value === "object" && "$numberDecimal" in value) {
//     return value.$numberDecimal;
//   }
//   return value ?? "";
// };

// export default function EmployeesPage() {
//   // 1. استخدام الـ Hook لجلب البيانات والعمليات
//   const { 
//     data: employees, 
//     isLoading, 
//     createEmployee, 
//     updateEmployee, 
//     deleteEmployee 
//   } = useEmployees();
  
//   // 2. حالات التحكم في النافذة والبيانات المختارة
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

//   // 3. دالة الحذف مع التأكيد
//   const handleDelete = async (id: string, name: string) => {
//      if (window.confirm(`هل أنت متأكد من حذف الموظف: ${name}؟`)) {
//        try {
//          await deleteEmployee.mutateAsync(id);
//        } catch {
//          // الخطأ يتم معالجته غالباً داخل الـ Hook عبر Toast
//        }
//      }
//   };

//   // 4. دالة فتح النافذة للتعديل
//   const handleEditClick = (emp: Employee) => {
//     setSelectedEmployee(emp);
//     setIsModalOpen(true);
//   };

//   // 5. دالة الحفظ الذكية (إضافة أو تعديل)
//   const handleSaveEmployee = async (formData: Employee) => {
//     try {
//       if (selectedEmployee) {
//         // تعديل موظف موجود
//         await updateEmployee.mutateAsync({ 
//           id: selectedEmployee.employeeId, 
//           data: formData 
//         });
//       } else {
//         // إضافة موظف جديد
//         await createEmployee.mutateAsync(formData);
//       }
//       setIsModalOpen(false);
//       setSelectedEmployee(null);
//     } catch {
//       // الخطأ يظهر عبر التوست في الـ Hook
//     }
//   };

//   return (
//     <div className="p-8 font-sans bg-[#f8fafc] min-h-screen" dir="rtl">
//       {/* الهيدر */}
//       <header className="flex justify-between items-center mb-8">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-800">إدارة الموظفين</h1>
//           <p className="text-slate-500 text-sm">
//             إجمالي الموظفين: {employees?.length || 0}
//           </p>
//         </div>
        
//         <button 
//           onClick={() => { setSelectedEmployee(null); setIsModalOpen(true); }}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition-all active:scale-95"
//         >
//           <Plus size={20} /> إضافة موظف جديد
//         </button>
//       </header>

//       {/* الجدول */}
//       <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
//         <div className="w-full overflow-x-auto">
//         <table className="w-full text-right min-w-245">
//           <thead className="bg-slate-50 border-b border-slate-100">
//             <tr>
//               <th className="p-4 text-slate-600 font-semibold text-sm">الموظف</th>
//               <th className="p-4 text-slate-600 font-semibold text-sm text-center">القسم</th>
//               <th className="p-4 text-slate-600 font-semibold text-sm text-center">أجر الساعة</th>
//               <th className="p-4 text-slate-600 font-semibold text-sm text-center">الحالة</th>
//               <th className="p-4 text-slate-600 font-semibold text-sm text-center">إجراءات</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-slate-50">
//             {isLoading ? (
//               <tr>
//                 <td colSpan={5} className="p-12 text-center text-slate-500">
//                   <div className="flex flex-col items-center gap-2">
//                     <Loader2 className="animate-spin text-blue-600" size={32} />
//                     <span>جاري تحميل قائمة الموظفين...</span>
//                   </div>
//                 </td>
//               </tr>
//             ) : employees?.length === 0 ? (
//               <tr>
//                 <td colSpan={5} className="p-12 text-center text-slate-500">
//                   لا يوجد موظفين حالياً. أضف موظفاً جديداً للبدء!
//                 </td>
//               </tr>
//             ) : (
// employees?.map((emp: Employee) => (
//                 <tr key={emp.employeeId} className="hover:bg-slate-50/50 transition-colors">
//                   <td className="p-4">
//                     <div className="font-bold text-slate-700">{emp.name}</div>
//                     <div className="text-[10px] text-slate-400 font-mono">{emp.employeeId}</div>
//                   </td>
//                   <td className="p-4 text-center">
//                     <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold">
//                       {emp.department}
//                     </span>
//                   </td>
//                   <td className="p-4 text-center font-mono font-bold text-slate-600">
//                     {asHourlyRateText(emp.hourlyRate)}
//                   </td>
//                   <td className="p-4 text-center">
//                     <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
//                       emp.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
//                     }`}>
//                       {emp.status === 'active' ? 'نشط' : 'متوقف'}
//                     </span>
//                   </td>
//                   <td className="p-4 text-center">
//                     <div className="flex justify-center gap-3">
//                       <button 
//                         onClick={() => handleEditClick(emp)}
//                         className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors active:scale-95"
//                         title="تعديل"
//                       >
//                         <Edit2 size={16} />
//                       </button>
//                       <button 
//                         onClick={() => handleDelete(emp.employeeId, emp.name)}
//                         className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors active:scale-95"
//                         title="حذف"
//                       >
//                         <Trash2 size={16} />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//         </div>
//       </div>

//       {/* نافذة الإضافة والتعديل */}
//       {isModalOpen ? (
//         <AddEmployeeModal 
//           key={`${isModalOpen}-${selectedEmployee?.employeeId ?? "new"}`}
//           isOpen={isModalOpen} 
//           onClose={() => {
//             setIsModalOpen(false);
//             setSelectedEmployee(null);
//           }} 
//           onSave={handleSaveEmployee}
//           isPending={createEmployee.isPending || updateEmployee.isPending}
//           initialData={selectedEmployee ?? undefined}
//         />
//       ) : null}
//     </div>
//   );
// }
// app/(dashboard)/employees/page.tsx
"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEmployees } from "@/hooks/useEmployees";
import type { Employee } from "@/types/employee";
import { Plus, Edit2, Trash2, Loader2, Search, Filter, ChevronLeft } from "lucide-react";

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
    <div className="p-6 md:p-8 font-sans bg-slate-50 min-h-screen relative" dir="rtl">
      
      {/* مسار التنقل (Breadcrumbs) المتطابق مع الصورة */}
      <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-6">
        <span>إدارة الموارد البشرية</span>
        <ChevronLeft size={14} />
        <span className="text-[#00bba7]">قائمة الموظفين</span>
      </nav>

      {/* الهيدر وأدوات التحكم */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* شريط البحث المتمدد */}
          <div className="relative group">
            <div className={`flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-sm transition-all duration-300 focus-within:border-[#00bba7] focus-within:ring-2 focus-within:ring-[#00bba7]/20 ${isSearchExpanded ? 'w-64' : 'w-10 md:w-48'}`}>
              <Search size={18} className="text-[#E7C873] ml-2 shrink-0 cursor-pointer" onClick={() => setIsSearchExpanded(true)} />
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
          <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-sm focus-within:border-[#00bba7] focus-within:ring-2 focus-within:ring-[#00bba7]/20 transition-all duration-300">
            <Filter size={16} className="text-[#E7C873] ml-2" />
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
        </div>

        <div className="w-full md:w-auto flex justify-end">
          <button 
            onClick={() => { setSelectedEmployee(null); setIsModalOpen(true); }}
            className="bg-[#00bba7] hover:bg-[#00bba7]/90 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-[#00bba7]/20 transition-all active:scale-95 text-sm font-bold"
          >
            <Plus size={18} /> إضافة موظف
          </button>
        </div>
      </header>

      {/* الجدول */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-right min-w-150">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="p-5 text-[#00bba7] font-extrabold text-xs uppercase tracking-wider">الموظف</th>
                <th className="p-5 text-[#00bba7] font-extrabold text-xs uppercase tracking-wider text-center">القسم</th>
                <th className="p-5 text-[#00bba7] font-extrabold text-xs uppercase tracking-wider text-center">أجر الساعة</th>
                <th className="p-5 text-[#00bba7] font-extrabold text-xs uppercase tracking-wider text-center">الحالة</th>
                <th className="p-5 text-[#00bba7] font-extrabold text-xs uppercase tracking-wider text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-16 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-[#00bba7]" size={36} />
                      <span className="font-bold text-slate-400">جاري تحميل قائمة الموظفين...</span>
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
                  <tr key={emp.employeeId} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4">
                      {/* رابط لصفحة البروفايل */}
                      <Link href={`/employees/${emp.employeeId}`} className="flex items-center gap-3 w-fit">

                        <div>
                          <div className="font-bold text-slate-800 group-hover:text-[#00bba7] transition-colors">{emp.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">{emp.employeeId}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-[11px] font-bold">
                        {emp.department}
                      </span>
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-slate-700 text-sm">
                      {asHourlyRateText(emp.hourlyRate)} <span className="text-[10px] text-slate-400">ل.س</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-4 py-1.5 rounded-xl text-[11px] font-bold border ${
                        emp.status === 'active' 
                          ? 'bg-[#00bba7]/10 text-[#00bba7] border-[#00bba7]/20' 
                          : 'bg-rose-50 text-rose-600 border-rose-100'
                      }`}>
                        {emp.status === 'active' ? 'نشط' : 'متوقف'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditClick(emp)}
                          className="text-[#E7C873] hover:bg-[#E7C873]/10 p-2.5 rounded-xl transition-colors"
                          title="تعديل بيانات الموظف"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(emp.employeeId, emp.name)}
                          className="text-rose-500 hover:bg-rose-50 p-2.5 rounded-xl transition-colors"
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
  );
}