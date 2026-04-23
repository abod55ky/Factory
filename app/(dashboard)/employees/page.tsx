// "use client";

// import { useState, useMemo } from "react";
// import dynamic from "next/dynamic";
// import Link from "next/link";
// import { useEmployees } from "@/hooks/useEmployees";
// import type { Employee } from "@/types/employee";
// import type { AddEmployeeFormData } from "@/components/AddEmployeeModal";
// import { Plus, Edit2, Trash2, Loader2, Search, Filter, ChevronLeft, Users, Scissors } from "lucide-react";

// const AddEmployeeModal = dynamic(() => import("@/components/AddEmployeeModal"), {
//   loading: () => null,
// });

// const asHourlyRateText = (value: Employee["hourlyRate"]) => {
//   if (value && typeof value === "object" && "$numberDecimal" in value) {
//     return value.$numberDecimal;
//   }
//   return value ?? "";
// };

// const toNumber = (value: string | number | undefined) => {
//   if (typeof value === "number") return Number.isFinite(value) ? value : 0;
//   if (typeof value !== "string") return 0;

//   const normalized = value.replace(/,/g, "").trim();
//   const parsed = Number(normalized);
//   return Number.isFinite(parsed) ? parsed : 0;
// };

// const buildFallbackEmail = (employeeId: string) =>
//   `${employeeId.toLowerCase()}@factory.local`;

// export default function EmployeesPage() {
//   const { data: employees, isLoading, createEmployee, updateEmployee, deleteEmployee } = useEmployees();
//   const visibleEmployees = useMemo(
//     () => (employees || []).filter((emp) => emp.status !== "terminated"),
//     [employees],
//   );
  
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
//   // حالات البحث والفلترة
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isSearchExpanded, setIsSearchExpanded] = useState(false);
//   const [selectedDept, setSelectedDept] = useState("الكل");

//   // استخراج الأقسام الفريدة للفلتر
//   const departments = useMemo(() => {
//     if (!visibleEmployees.length) return ["الكل"];
//     const depts = new Set(visibleEmployees.map(emp => emp.department));
//     return ["الكل", ...Array.from(depts)];
//   }, [visibleEmployees]);

//   // تطبيق البحث والفلترة
//   const filteredEmployees = useMemo(() => {
//     if (!visibleEmployees.length) return [];
//     return visibleEmployees.filter(emp => {
//       const matchesSearch = emp.name.includes(searchTerm) || emp.employeeId.includes(searchTerm);
//       const matchesDept = selectedDept === "الكل" || emp.department === selectedDept;
//       return matchesSearch && matchesDept;
//     });
//   }, [visibleEmployees, searchTerm, selectedDept]);

//   const handleDelete = async (id: string, name: string) => {
//      if (window.confirm(`هل أنت متأكد من حذف الموظف: ${name}؟`)) {
//        try {
//          await deleteEmployee.mutateAsync(id);
//        } catch {}
//      }
//   };

//   const handleEditClick = (emp: Employee) => {
//     setSelectedEmployee(emp);
//     setIsModalOpen(true);
//   };

//   const handleSaveEmployee = async (formData: AddEmployeeFormData) => {
//     const normalizedEmployeeId = formData.employeeId.trim();
//     const payload: Partial<Employee> = {
//       employeeId: normalizedEmployeeId,
//       name: formData.name.trim(),
//       mobile: formData.mobile.trim(),
//       department: formData.department,
//       roleId: formData.roleId,
//       scheduledStart: formData.scheduledStart,
//       scheduledEnd: formData.scheduledEnd,
//       hourlyRate: toNumber(formData.monthlySalary),
//       email: selectedEmployee?.email || buildFallbackEmail(normalizedEmployeeId),
//     };

//     try {
//       if (selectedEmployee) {
//         await updateEmployee.mutateAsync({ id: selectedEmployee.employeeId, data: payload });
//       } else {
//         await createEmployee.mutateAsync(payload as Employee);
//       }
//       setIsModalOpen(false);
//       setSelectedEmployee(null);
//     } catch {}
//   };

//   return (
//     <div className="relative z-10 w-full max-w-7xl min-h-[85vh] mx-auto bg-white/50 backdrop-blur-2xl rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(38,53,68,0.2)] border-2 border-dashed border-[#C89355]/60 flex flex-col overflow-hidden" dir="rtl">
        
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
                
//           {/* مسار التنقل (Breadcrumbs) - درزة من الداخل */}
//           <nav className="mb-6 relative overflow-hidden flex items-center gap-2 text-xs font-black text-slate-500 bg-white/60 backdrop-blur-xl w-fit px-4 py-2.5 rounded-2xl border border-white/80 shadow-[0_5px_15px_rgba(38,53,68,0.05)] group">
//             <div className="absolute inset-1 rounded-xl border border-dashed border-[#C89355]/30 pointer-events-none transition-colors group-hover:border-[#C89355]/50" />
//             <span className="hover:text-[#263544] cursor-pointer transition-colors relative z-10">إدارة الموارد البشرية</span>
//             <ChevronLeft size={14} className="text-[#C89355] relative z-10" />
//             <span className="text-[#263544] relative z-10">قائمة الموظفين</span>
//           </nav>

//           {/* الهيدر وأدوات التحكم مدمجة بأسلوب لوحة التحكم */}
//           <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#263544]/10 pb-6 relative">
//             <div>
//               <div className="flex items-center gap-3 mb-2">
//                 {/* أيقونة العنوان بهوية الماركة الكحلية والنحاسية مع الدرزة */}
//                 <div className="p-3 bg-[#1a2530] rounded-2xl shadow-[0_15px_25px_rgba(38,53,68,0.4)] border border-[#C89355]/40 relative outline-dashed outline-1 outline-[#C89355]/50 outline-offset-4">
//                   <Users size={22} className="text-[#C89355] animate-bounce" strokeWidth={2.5} />
//                 </div>
//                 <h1 className="text-3xl font-black text-[#263544] tracking-tight drop-shadow-sm">
//                   إدارة الموظفين
//                 </h1>
//               </div>
//               <p className="text-slate-600 text-sm font-bold pr-14 flex items-center gap-2">
//                 <Scissors size={14} className="text-[#C89355]" />
//                 البحث، الفلترة، وإدارة الكوادر
//               </p>
//             </div>
            
//             <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
//               {/* شريط البحث - درزة من الداخل */}
//               <div className="relative group">
//                 <div className={`relative overflow-hidden flex items-center bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl px-3 py-2.5 shadow-sm transition-all duration-300 focus-within:border-[#C89355] focus-within:ring-2 focus-within:ring-[#C89355]/20 hover:shadow-md ${isSearchExpanded ? 'w-64' : 'w-10 md:w-48'}`}>
//                   <div className="absolute inset-1 rounded-xl border border-dashed border-[#C89355]/30 pointer-events-none transition-colors group-focus-within:border-[#C89355]/50" />
//                   <Search size={18} className="text-[#C89355] ml-2 shrink-0 cursor-pointer group-hover:animate-pulse relative z-10" onClick={() => setIsSearchExpanded(true)} />
//                   <input 
//                     type="text" 
//                     placeholder="ابحث بالاسم أو الرمز..." 
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     onFocus={() => setIsSearchExpanded(true)}
//                     onBlur={() => { if(!searchTerm) setIsSearchExpanded(false) }}
//                     className={`bg-transparent text-sm font-bold text-[#263544] outline-none transition-all w-full placeholder:text-slate-400 relative z-10 ${isSearchExpanded ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}
//                   />
//                 </div>
//               </div>

//               {/* فلتر الأقسام - درزة من الداخل */}
//               <div className="relative overflow-hidden flex items-center bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl px-3 py-2.5 shadow-sm focus-within:border-[#C89355] focus-within:ring-2 focus-within:ring-[#C89355]/20 transition-all duration-300 hover:shadow-md group">
//                 <div className="absolute inset-1 rounded-xl border border-dashed border-[#C89355]/30 pointer-events-none transition-colors group-hover:border-[#C89355]/50" />
//                 <Filter size={16} className="text-[#C89355] ml-2 group-hover:animate-pulse relative z-10" />
//                 <select 
//                   value={selectedDept}
//                   onChange={(e) => setSelectedDept(e.target.value)}
//                   className="bg-transparent text-sm font-black text-[#263544] outline-none cursor-pointer appearance-none pr-2 relative z-10"
//                 >
//                   {departments.map(dept => (
//                     <option key={dept} value={dept}>{dept}</option>
//                   ))}
//                 </select>
//               </div>

//               <div className="w-full md:w-auto flex justify-end">
//                 {/* زر إضافة موظف بتصميم "رقعة الجلد/الدرزة" */}
//                 <button 
//                   onClick={() => { setSelectedEmployee(null); setIsModalOpen(true); }}
//                   className="relative overflow-hidden bg-[#1a2530] hover:bg-[#263544] text-[#C89355] px-5 py-2.5 rounded-2xl flex items-center gap-2 shadow-[0_10px_20px_rgba(38,53,68,0.3)] transition-all active:scale-95 text-sm font-black border border-[#C89355]/40 group"
//                 >
//                   <div className="absolute inset-1.5 rounded-xl border border-dashed border-[#C89355]/30 pointer-events-none transition-colors group-hover:border-[#C89355]/50" />
//                   <Plus size={18} className="group-hover:animate-spin relative z-10" /> 
//                   <span className="relative z-10 tracking-wide">إضافة موظف</span>
//                 </button>
//               </div>
//             </div>
//           </header>

//           {/* الجدول بتصميم الكارد الزجاجي العميق - درزة من الداخل */}
//           <div className="relative bg-white/60 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(38,53,68,0.08)] border-2 border-white/90 overflow-hidden group">
//             <div className="absolute inset-1.5 rounded-[2.2rem] border border-dashed border-[#C89355]/30 pointer-events-none transition-colors group-hover:border-[#C89355]/50 z-0" />
//             <div className="w-full overflow-x-auto custom-scrollbar relative z-10">
//               <table className="w-full text-right min-w-175">
//                 <thead className="bg-white/40 border-b border-white/80">
//                   <tr>
//                     <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">الموظف</th>
//                     <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">القسم</th>
//                     <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">أجر الساعة</th>
//                     <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">الحالة</th>
//                     <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">إجراءات</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-white/40">
//                   {isLoading ? (
//                     <tr>
//                       <td colSpan={5} className="p-16 text-center">
//                         <div className="flex flex-col items-center gap-3">
//                           <Loader2 className="animate-spin text-[#C89355]" size={40} />
//                           <span className="font-black text-[#263544] animate-pulse">جاري تحميل قائمة الموظفين...</span>
//                         </div>
//                       </td>
//                     </tr>
//                   ) : filteredEmployees.length === 0 ? (
//                     <tr>
//                       <td colSpan={5} className="p-16 text-center text-[#263544]/60 font-black text-lg">
//                         لا يوجد بيانات مطابقة للبحث.
//                       </td>
//                     </tr>
//                   ) : (
//                     filteredEmployees.map((emp: Employee) => (
//                       <tr key={emp.employeeId} className="hover:bg-white/80 transition-all duration-300 group/row">
//                         <td className="p-4">
//                           <Link href={`/employees/${emp.employeeId}`} className="flex items-center justify-center gap-3 w-fit mx-auto">
//                             <div>
//                               <div className="font-black text-slate-800 group-hover/row:text-[#263544] transition-colors">{emp.name}</div>
//                               <div className="text-[11px] text-slate-500 font-mono mt-0.5 text-center">{emp.employeeId}</div>
//                             </div>
//                           </Link>
//                         </td>
//                         <td className="p-4 text-center">
//                           <span className="bg-white/80 backdrop-blur-md text-[#263544] px-3 py-1.5 rounded-xl text-[11px] font-black border border-white shadow-sm">
//                             {emp.department}
//                           </span>
//                         </td>
//                         <td className="p-4 text-center font-mono font-black text-[#263544] text-sm">
//                           {asHourlyRateText(emp.hourlyRate)} <span className="text-[10px] text-[#C89355] mr-1">ل.س</span>
//                         </td>
//                         <td className="p-4 text-center">
//                           <span className={`px-4 py-1.5 rounded-xl text-[11px] font-black border shadow-sm ${
//                             emp.status === 'active' 
//                               ? 'bg-[#1a2530] text-[#C89355] border-[#C89355]/30' 
//                               : 'bg-rose-50 text-rose-600 border-rose-100'
//                           }`}>
//                             {emp.status === 'active' ? 'نشط' : 'متوقف'}
//                           </span>
//                         </td>
//                         <td className="p-4 text-center">
//                           <div className="flex justify-center gap-2 opacity-60 group-hover/row:opacity-100 transition-opacity">
//                             <button 
//                               onClick={() => handleEditClick(emp)}
//                               className="text-[#C89355] hover:bg-[#1a2530] hover:text-[#C89355] p-2.5 rounded-xl transition-all duration-300 hover:scale-110 shadow-sm border border-transparent hover:border-[#C89355]/30"
//                               title="تعديل بيانات الموظف"
//                             >
//                               <Edit2 size={16} />
//                             </button>
//                             <button 
//                               onClick={() => handleDelete(emp.employeeId, emp.name)}
//                               className="text-rose-500 hover:bg-rose-500 hover:text-white p-2.5 rounded-xl transition-all duration-300 hover:scale-110 shadow-sm border border-transparent hover:border-rose-400"
//                               title="حذف الموظف"
//                             >
//                               <Trash2 size={16} />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {/* نافذة الإضافة والتعديل */}
//           {isModalOpen && (
//             <AddEmployeeModal 
//               key={`${isModalOpen}-${selectedEmployee?.employeeId ?? "new"}`}
//               isOpen={isModalOpen} 
//               onClose={() => { setIsModalOpen(false); setSelectedEmployee(null); }} 
//               onSave={handleSaveEmployee}
//               isPending={createEmployee.isPending || updateEmployee.isPending}
//               initialData={selectedEmployee ?? undefined}
//             />
//           )}
//         </div>
//     </div>
//   );
// }



  // "use client";

  // import { useState, useMemo } from "react";
  // import dynamic from "next/dynamic";
  // import Link from "next/link";
  // import { useEmployees } from "@/hooks/useEmployees";
  // import type { Employee } from "@/types/employee";
  // import type { AddEmployeeFormData } from "@/components/AddEmployeeModal";
  // import { Plus, Edit2, Loader2, Search, Filter, ChevronLeft, Users, Scissors, UserMinus } from "lucide-react";

  // const AddEmployeeModal = dynamic(() => import("@/components/AddEmployeeModal"), {
  //   loading: () => null,
  // });

  // // استيراد مودال الإقالة الذي تم تصميمه في المرة السابقة
  // const FireEmployeeModal = dynamic(() => import("@/components/FireEmployeeModal"), {
  //   loading: () => null,
  // });

  // const asHourlyRateText = (value: Employee["hourlyRate"]) => {
  //   if (value && typeof value === "object" && "$numberDecimal" in value) {
  //     return value.$numberDecimal;
  //   }
  //   return value ?? "";
  // };

  // const toNumber = (value: string | number | undefined) => {
  //   if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  //   if (typeof value !== "string") return 0;

  //   const normalized = value.replace(/,/g, "").trim();
  //   const parsed = Number(normalized);
  //   return Number.isFinite(parsed) ? parsed : 0;
  // };

  // const buildFallbackEmail = (employeeId: string) =>
  //   `${employeeId.toLowerCase()}@factory.local`;

  // export default function EmployeesPage() {
  //   const { data: employees, isLoading, createEmployee, updateEmployee, deleteEmployee } = useEmployees();
  //   const visibleEmployees = useMemo(
  //     () => (employees || []).filter((emp) => emp.status !== "terminated"),
  //     [employees],
  //   );
    
  //   const [isModalOpen, setIsModalOpen] = useState(false);
  //   const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    
  //   // حالات مودال الإقالة
  //   const [isFireModalOpen, setIsFireModalOpen] = useState(false);
  //   const [employeeToFire, setEmployeeToFire] = useState<Employee | null>(null);
    
  //   // حالات البحث والفلترة
  //   const [searchTerm, setSearchTerm] = useState("");
  //   const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  //   const [selectedDept, setSelectedDept] = useState("الكل");

  //   // استخراج الأقسام الفريدة للفلتر
  //   const departments = useMemo(() => {
  //     if (!visibleEmployees.length) return ["الكل"];
  //     const depts = new Set(visibleEmployees.map(emp => emp.department));
  //     return ["الكل", ...Array.from(depts)];
  //   }, [visibleEmployees]);

  //   // تطبيق البحث والفلترة
  //   const filteredEmployees = useMemo(() => {
  //     if (!visibleEmployees.length) return [];
  //     return visibleEmployees.filter(emp => {
  //       const matchesSearch = emp.name.includes(searchTerm) || emp.employeeId.includes(searchTerm);
  //       const matchesDept = selectedDept === "الكل" || emp.department === selectedDept;
  //       return matchesSearch && matchesDept;
  //     });
  //   }, [visibleEmployees, searchTerm, selectedDept]);

  //   const handleEditClick = (emp: Employee) => {
  //     setSelectedEmployee(emp);
  //     setIsModalOpen(true);
  //   };

  //   const handleSaveEmployee = async (formData: AddEmployeeFormData) => {
  //     const normalizedEmployeeId = formData.employeeId.trim();
  //     const payload: Partial<Employee> = {
  //       employeeId: normalizedEmployeeId,
  //       name: formData.name.trim(),
  //       mobile: formData.mobile.trim(),
  //       department: formData.department,
  //       roleId: formData.roleId,
  //       scheduledStart: formData.scheduledStart,
  //       scheduledEnd: formData.scheduledEnd,
  //       hourlyRate: toNumber(formData.monthlySalary),
  //       email: selectedEmployee?.email || buildFallbackEmail(normalizedEmployeeId),
  //     };

  //     try {
  //       if (selectedEmployee) {
  //         await updateEmployee.mutateAsync({ id: selectedEmployee.employeeId, data: payload });
  //       } else {
  //         await createEmployee.mutateAsync(payload as Employee);
  //       }
  //       setIsModalOpen(false);
  //       setSelectedEmployee(null);
  //     } catch {}
  //   };

  //   const handleConfirmFire = async (fireData: any) => {
  //     try {
  //       await deleteEmployee.mutateAsync(fireData.employeeId);
  //       setIsFireModalOpen(false);
  //       setEmployeeToFire(null);
  //     } catch {}
  //   };

  //   return (
  //     <div className="relative z-10 w-full max-w-7xl min-h-[85vh] mx-auto bg-white/50 backdrop-blur-2xl rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(38,53,68,0.2)] border-2 border-dashed border-[#C89355]/60 flex flex-col overflow-hidden" dir="rtl">
          
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
                  
  //           {/* مسار التنقل (Breadcrumbs) - درزة من الداخل */}
  //           <nav className="mb-6 relative overflow-hidden flex items-center gap-2 text-xs font-black text-slate-500 bg-white/60 backdrop-blur-xl w-fit px-4 py-2.5 rounded-2xl border border-white/80 shadow-[0_5px_15px_rgba(38,53,68,0.05)] group">
  //             <div className="absolute inset-1 rounded-xl border border-dashed border-[#C89355]/30 pointer-events-none transition-colors group-hover:border-[#C89355]/50" />
  //             <span className="hover:text-[#263544] cursor-pointer transition-colors relative z-10">إدارة الموارد البشرية</span>
  //             <ChevronLeft size={14} className="text-[#C89355] relative z-10" />
  //             <span className="text-[#263544] relative z-10">قائمة الموظفين</span>
  //           </nav>

  //           {/* الهيدر وأدوات التحكم مدمجة بأسلوب لوحة التحكم */}
  //           <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#263544]/10 pb-6 relative">
  //             <div>
  //               <div className="flex items-center gap-3 mb-2">
  //                 {/* أيقونة العنوان بهوية الماركة الكحلية والنحاسية مع الدرزة */}
  //                 <div className="p-3 bg-[#1a2530] rounded-2xl shadow-[0_15px_25px_rgba(38,53,68,0.4)] border border-[#C89355]/40 relative outline-dashed outline-1 outline-[#C89355]/50 outline-offset-4">
  //                   <Users size={22} className="text-[#C89355] animate-bounce" strokeWidth={2.5} />
  //                 </div>
  //                 <h1 className="text-3xl font-black text-[#263544] tracking-tight drop-shadow-sm">
  //                   إدارة الموظفين
  //                 </h1>
  //               </div>
  //               <p className="text-slate-600 text-sm font-bold pr-14 flex items-center gap-2">
  //                 <Scissors size={14} className="text-[#C89355]" />
  //                 البحث، الفلترة، وإدارة الكوادر
  //               </p>
  //             </div>
              
  //             <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
  //               {/* شريط البحث - درزة من الداخل */}
  //               <div className="relative group">
  //                 <div className={`relative overflow-hidden flex items-center bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl px-3 py-2.5 shadow-sm transition-all duration-300 focus-within:border-[#C89355] focus-within:ring-2 focus-within:ring-[#C89355]/20 hover:shadow-md ${isSearchExpanded ? 'w-64' : 'w-10 md:w-48'}`}>
  //                   <div className="absolute inset-1 rounded-xl border border-dashed border-[#C89355]/30 pointer-events-none transition-colors group-focus-within:border-[#C89355]/50" />
  //                   <Search size={18} className="text-[#C89355] ml-2 shrink-0 cursor-pointer group-hover:animate-pulse relative z-10" onClick={() => setIsSearchExpanded(true)} />
  //                   <input 
  //                     type="text" 
  //                     placeholder="ابحث بالاسم أو الرمز..." 
  //                     value={searchTerm}
  //                     onChange={(e) => setSearchTerm(e.target.value)}
  //                     onFocus={() => setIsSearchExpanded(true)}
  //                     onBlur={() => { if(!searchTerm) setIsSearchExpanded(false) }}
  //                     className={`bg-transparent text-sm font-bold text-[#263544] outline-none transition-all w-full placeholder:text-slate-400 relative z-10 ${isSearchExpanded ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}
  //                   />
  //                 </div>
  //               </div>

  //               {/* فلتر الأقسام - درزة من الداخل */}
  //               <div className="relative overflow-hidden flex items-center bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl px-3 py-2.5 shadow-sm focus-within:border-[#C89355] focus-within:ring-2 focus-within:ring-[#C89355]/20 transition-all duration-300 hover:shadow-md group">
  //                 <div className="absolute inset-1 rounded-xl border border-dashed border-[#C89355]/30 pointer-events-none transition-colors group-hover:border-[#C89355]/50" />
  //                 <Filter size={16} className="text-[#C89355] ml-2 group-hover:animate-pulse relative z-10" />
  //                 <select 
  //                   value={selectedDept}
  //                   onChange={(e) => setSelectedDept(e.target.value)}
  //                   className="bg-transparent text-sm font-black text-[#263544] outline-none cursor-pointer appearance-none pr-2 relative z-10"
  //                 >
  //                   {departments.map(dept => (
  //                     <option key={dept} value={dept}>{dept}</option>
  //                   ))}
  //                 </select>
  //               </div>

  //               <div className="w-full md:w-auto flex justify-end">
  //                 {/* زر إضافة موظف بتصميم "رقعة الجلد/الدرزة" */}
  //                 <button 
  //                   onClick={() => { setSelectedEmployee(null); setIsModalOpen(true); }}
  //                   className="relative overflow-hidden bg-[#1a2530] hover:bg-[#263544] text-[#C89355] px-5 py-2.5 rounded-2xl flex items-center gap-2 shadow-[0_10px_20px_rgba(38,53,68,0.3)] transition-all active:scale-95 text-sm font-black border border-[#C89355]/40 group"
  //                 >
  //                   <div className="absolute inset-1.5 rounded-xl border border-dashed border-[#C89355]/30 pointer-events-none transition-colors group-hover:border-[#C89355]/50" />
  //                   <Plus size={18} className="group-hover:animate-spin relative z-10" /> 
  //                   <span className="relative z-10 tracking-wide">إضافة موظف</span>
  //                 </button>
  //               </div>
  //             </div>
  //           </header>

  //           {/* الجدول بتصميم الكارد الزجاجي العميق - درزة من الداخل */}
  //           <div className="relative bg-white/60 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(38,53,68,0.08)] border-2 border-white/90 overflow-hidden group">
  //             <div className="absolute inset-1.5 rounded-[2.2rem] border border-dashed border-[#C89355]/30 pointer-events-none transition-colors group-hover:border-[#C89355]/50 z-0" />
  //             <div className="w-full overflow-x-auto custom-scrollbar relative z-10">
  //               <table className="w-full text-right min-w-175">
  //                 <thead className="bg-white/40 border-b border-white/80">
  //                   <tr>
  //                     <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">الكود</th>
  //                     <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-cneter ">الاسم الكامل</th>
  //                     <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">القسم / الوظيفة</th>
  //                     <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">الراتب الشهري</th>
  //                     <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">رقم الموبايل</th>
  //                     <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">إجراءات</th>
  //                   </tr>
  //                 </thead>
  //                 <tbody className="divide-y divide-white/40">
  //                   {isLoading ? (
  //                     <tr>
  //                       <td colSpan={6} className="p-16 text-center">
  //                         <div className="flex flex-col items-center gap-3">
  //                           <Loader2 className="animate-spin text-[#C89355]" size={40} />
  //                           <span className="font-black text-[#263544] animate-pulse">جاري تحميل قائمة الموظفين...</span>
  //                         </div>
  //                       </td>
  //                     </tr>
  //                   ) : filteredEmployees.length === 0 ? (
  //                     <tr>
  //                       <td colSpan={6} className="p-16 text-center text-[#263544]/60 font-black text-lg">
  //                         لا يوجد بيانات مطابقة للبحث.
  //                       </td>
  //                     </tr>
  //                   ) : (
  //                     filteredEmployees.map((emp: any) => (
  //                       <tr key={emp.employeeId} className="hover:bg-white/80 transition-all duration-300 group/row">
                          
  //                         {/* كود الموظف */}
  //                         <td className="p-4 text-center font-mono font-bold text-slate-500 text-sm">
  //                           {emp.employeeId}
  //                         </td>
                          
  //                         {/* اسم الموظف */}
  //                         <td className="p-4 text-right pr-2">
  //                           <Link href={`/employees/${emp.employeeId}`} className="font-black text-slate-800 group-hover/row:text-[#263544] transition-colors text-base">
  //                             {emp.name}
  //                           </Link>
  //                         </td>

  //                         {/* القسم / الوظيفة كنص عادي (بدون Div) */}
  //                         <td className="p-4 text-center font-bold text-slate-700 text-sm">
  //                           {emp.department} <span className="text-[#C89355] mx-1">/</span> {emp.jobTitle || 'موظف'}
  //                         </td>

  //                         {/* الراتب الشهري */}
  //                         <td className="p-4 text-center font-mono font-black text-[#263544] text-sm">
  //                           {Number(emp.monthlySalary || 0).toLocaleString()} <span className="text-[10px] text-[#C89355] mr-1">ل.س</span>
  //                         </td>

  //                         {/* رقم الموبايل */}
  //                         <td className="p-4 text-center font-mono font-bold text-slate-600 text-sm dir-ltr">
  //                           {emp.mobile || '—'}
  //                         </td>

  //                         {/* إجراءات (التعديل والإقالة بنفس التصميم) */}
  //                         <td className="p-4 text-center">
  //                           <div className="flex justify-center gap-2 opacity-60 group-hover/row:opacity-100 transition-opacity">
  //                             <button 
  //                               onClick={() => handleEditClick(emp)}
  //                               className="text-[#C89355] hover:bg-[#1a2530] hover:text-[#C89355] p-2.5 rounded-xl transition-all duration-300 hover:scale-110 shadow-sm border border-transparent hover:border-[#C89355]/30"
  //                               title="تعديل بيانات الموظف"
  //                             >
  //                               <Edit2 size={16} />
  //                             </button>
  //                             <button 
  //                               onClick={() => { setEmployeeToFire(emp); setIsFireModalOpen(true); }}
  //                               className="text-rose-500 hover:bg-[#1a2530] hover:text-rose-500 p-2.5 rounded-xl transition-all duration-300 hover:scale-110 shadow-sm border border-transparent hover:border-rose-500/30"
  //                               title="إقالة الموظف"
  //                             >
  //                               <UserMinus size={16} />
  //                             </button>
  //                           </div>
  //                         </td>
  //                       </tr>
  //                     ))
  //                   )}
  //                 </tbody>
  //               </table>
  //             </div>
  //           </div>

  //           {/* نافذة الإضافة والتعديل الأساسية */}
  //           {isModalOpen && (
  //             <AddEmployeeModal 
  //               key={`${isModalOpen}-${selectedEmployee?.employeeId ?? "new"}`}
  //               isOpen={isModalOpen} 
  //               onClose={() => { setIsModalOpen(false); setSelectedEmployee(null); }} 
  //               onSave={handleSaveEmployee}
  //               isPending={createEmployee.isPending || updateEmployee.isPending}
  //               initialData={selectedEmployee ?? undefined}
  //             />
  //           )}

  //           {/* نافذة الإقالة (Popup Page) */}
  //           {isFireModalOpen && employeeToFire && (
  //             <FireEmployeeModal 
  //               isOpen={isFireModalOpen}
  //               onClose={() => { setIsFireModalOpen(false); setEmployeeToFire(null); }}
  //               employee={employeeToFire}
  //               onConfirm={handleConfirmFire}
  //               isPending={deleteEmployee.isPending}
  //             />
  //           )}

  //         </div>
  //     </div>
  //   );
  // }

  "use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEmployees } from "@/hooks/useEmployees";
import type { Employee } from "@/types/employee";
import type { AddEmployeeFormData } from "@/components/AddEmployeeModal";
import type { FireEmployeePayload } from "@/components/FireEmployeeModal";
import { Plus, Edit2, Loader2, ChevronLeft, Users, Scissors, UserMinus } from "lucide-react";

// استيراد المكونات المنفصلة
import FilterComponent from "@/components/Filter";
const AddEmployeeModal = dynamic(() => import("@/components/AddEmployeeModal"), { loading: () => null });
const FireEmployeeModal = dynamic(() => import("@/components/FireEmployeeModal"), { loading: () => null });

const toNumber = (value: unknown) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "object" && value && "$numberDecimal" in value) {
    const parsed = Number((value as { $numberDecimal?: string }).$numberDecimal || 0);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (typeof value !== "string") return 0;
  const normalized = value.replace(/,/g, "").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const buildFallbackEmail = (employeeId: string) => `${employeeId.toLowerCase()}@factory.local`;

type EmployeeRow = Employee & {
  monthlySalary?: number | string;
  jobTitle?: string;
};

const resolveDisplayedMonthlySalary = (employee: EmployeeRow) => {
  if (employee.monthlySalary !== undefined && employee.monthlySalary !== null && employee.monthlySalary !== "") {
    const parsed = toNumber(employee.monthlySalary);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  const hourly = toNumber(employee.hourlyRate);
  return Math.round(hourly * 8 * 30);
};

export default function EmployeesPage() {
  const { data: employees, isLoading, createEmployee, updateEmployee } = useEmployees();
  const visibleEmployees = useMemo(
    () => (employees || []).filter((emp) => emp.status !== "terminated"),
    [employees],
  );
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  // حالات مودال الإقالة
  const [isFireModalOpen, setIsFireModalOpen] = useState(false);
  const [employeeToFire, setEmployeeToFire] = useState<Employee | null>(null);
  
  // حالات البحث والفلترة الممررة للمكون الجديد
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("الكل");

  const departments = useMemo(() => {
    if (!visibleEmployees.length) return ["الكل"];
    const depts = new Set(
      visibleEmployees
        .map((emp) => emp.department)
        .filter((department): department is string => Boolean(department && department.trim())),
    );
    return ["الكل", ...Array.from(depts)];
  }, [visibleEmployees]);

  const filteredEmployees = useMemo(() => {
    if (!visibleEmployees.length) return [];
    return visibleEmployees.filter(emp => {
      const matchesSearch = emp.name.includes(searchTerm) || emp.employeeId.includes(searchTerm);
      const matchesDept = selectedDept === "الكل" || emp.department === selectedDept;
      return matchesSearch && matchesDept;
    });
  }, [visibleEmployees, searchTerm, selectedDept]);

  const handleEditClick = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsModalOpen(true);
  };

  const handleSaveEmployee = async (formData: AddEmployeeFormData) => {
    const normalizedEmployeeId = formData.employeeId.trim();
    const payload: Partial<Employee> = {
      employeeId: normalizedEmployeeId,
      name: formData.name.trim(),
      mobile: formData.mobile.trim(),
      department: formData.department,
      roleId: formData.roleId,
      scheduledStart: formData.scheduledStart,
      scheduledEnd: formData.scheduledEnd,
      hourlyRate: toNumber(formData.monthlySalary),
      email: selectedEmployee?.email || buildFallbackEmail(normalizedEmployeeId),
    };

    try {
      if (selectedEmployee) {
        await updateEmployee.mutateAsync({ id: selectedEmployee.employeeId, data: payload });
      } else {
        await createEmployee.mutateAsync(payload as Employee);
      }
      setIsModalOpen(false);
      setSelectedEmployee(null);
    } catch {}
  };

  const handleConfirmFire = async (fireData: FireEmployeePayload) => {
    try {
      await updateEmployee.mutateAsync({
        id: fireData.employeeId,
        data: {
          status: "terminated",
          terminationDate: fireData.fireDate,
        },
      });
      setIsFireModalOpen(false);
      setEmployeeToFire(null);
    } catch {}
  };

  return (
    <div className="relative z-10 w-full max-w-7xl min-h-[85vh] mx-auto bg-white/50 backdrop-blur-2xl rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(38,53,68,0.2)] border-2 border-dashed border-[#C89355]/60 flex flex-col overflow-hidden" dir="rtl">
        
        {/* نقشة الفايبر */}
        <div 
          className="absolute inset-0 opacity-[0.04] pointer-events-none z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 12h24M12 0v24' stroke='%23263544' stroke-width='1' stroke-dasharray='4 4' fill='none'/%3E%3C/svg%3E")`,
            backgroundSize: '24px 24px'
          }}
        />

        <div className="p-6 md:p-10 h-full overflow-y-auto custom-scrollbar relative z-10">
                
          {/* مسار التنقل */}
          <nav className="mb-6 relative overflow-hidden flex items-center gap-2 text-xs font-black text-slate-500 bg-white/60 backdrop-blur-xl w-fit px-4 py-2.5 rounded-2xl border border-white/80 shadow-[0_5px_15px_rgba(38,53,68,0.05)] group">
            <div className="absolute inset-1 rounded-xl border border-dashed border-[#C89355]/30 pointer-events-none transition-colors group-hover:border-[#C89355]/50" />
            <span className="hover:text-[#263544] cursor-pointer transition-colors relative z-10">إدارة الموارد البشرية</span>
            <ChevronLeft size={14} className="text-[#C89355] relative z-10" />
            <span className="text-[#263544] relative z-10">قائمة الموظفين</span>
          </nav>

          {/* الهيدر وأدوات التحكم */}
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#263544]/10 pb-6 relative">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-[#1a2530] rounded-2xl shadow-[0_15px_25px_rgba(38,53,68,0.4)] border border-[#C89355]/40 relative outline-dashed outline-1 outline-[#C89355]/50 outline-offset-4">
                  <Users size={22} className="text-[#C89355]" strokeWidth={2.5} />
                </div>
                <h1 className="text-3xl font-black text-[#263544] tracking-tight drop-shadow-sm">
                  إدارة الموظفين
                </h1>
              </div>
              <p className="text-slate-600 text-sm font-bold pr-14 flex items-center gap-2">
                <Scissors size={14} className="text-[#C89355]" />
                البحث، الفلترة، وإدارة الكوادر
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-end gap-5 w-full md:w-auto">
              
              {/* استدعاء مكون الفلتر المستقل هنا */}
              <FilterComponent 
                searchTerm={searchTerm} 
                onSearchChange={setSearchTerm} 
                selectedDept={selectedDept} 
                onDeptChange={setSelectedDept} 
                departments={departments} 
              />

              <div className="w-full md:w-auto flex justify-end">
                <button 
                  onClick={() => { setSelectedEmployee(null); setIsModalOpen(true); }}
                  className="relative overflow-hidden bg-[#1a2530] hover:bg-[#263544] text-[#C89355] px-5 py-3 rounded-2xl flex items-center gap-2 shadow-[0_10px_20px_rgba(38,53,68,0.3)] transition-all active:scale-95 text-sm font-black border border-[#C89355]/40 group"
                >
                  <div className="absolute inset-1.5 rounded-xl border border-dashed border-[#C89355]/30 pointer-events-none transition-colors group-hover:border-[#C89355]/50" />
                  <Plus size={18} className="group-hover:animate-spin relative z-10" /> 
                  <span className="relative z-10 tracking-wide">إضافة موظف</span>
                </button>
              </div>
            </div>
          </header>

          {/* الجدول بالديزاين المطلوب */}
          <div className="relative bg-white/60 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(38,53,68,0.08)] border-2 border-white/90 overflow-hidden group">
            <div className="absolute inset-1.5 rounded-[2.2rem] border border-dashed border-[#C89355]/30 pointer-events-none transition-colors group-hover:border-[#C89355]/50 z-0" />
            <div className="w-full overflow-x-auto custom-scrollbar relative z-10">
              <table className="w-full text-right min-w-200">
                <thead className="bg-white/40 border-b border-white/80">
                  <tr>
                    {/* ترتيب الأعمدة الجديد */}
                    <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center w-24">كود الموظف</th>
                    <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center ">الاسم</th>
                    <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">القسم / الوظيفة</th>
                    <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">الراتب الشهري</th>
                    <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">رقم الموبايل</th>
                    <th className="p-5 text-[#263544] font-black text-xs uppercase tracking-wider text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/40">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="p-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="animate-spin text-[#C89355]" size={40} />
                          <span className="font-black text-[#263544] animate-pulse">جاري تحميل قائمة الموظفين...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-16 text-center text-[#263544]/60 font-black text-lg">
                        لا يوجد بيانات مطابقة للبحث.
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp) => {
                      const row = emp as EmployeeRow;

                      return (
                      <tr key={emp.employeeId} className="hover:bg-white/80 transition-all duration-300 group/row">
                        
                        {/* 1. الكود */}
                        <td className="p-4 text-center font-mono font-bold text-slate-500 text-sm">
                          {emp.employeeId}
                        </td>

                        {/* 2. الاسم (على قرب من الكود بمحاذاة اليمين) */}
                        <td className="p-4 text-center">
                          <Link href={`/employees/${emp.employeeId}`} className="font-black text-slate-800 hover:text-[#C89355] transition-colors text-base">
                            {emp.name}
                          </Link>
                        </td>

                        {/* 3. القسم / الوظيفة كنص عادي (بدون Div) */}
                        <td className="p-4 text-center font-bold text-[#263544] text-sm">
                          {emp.department} <span className="text-[#C89355] mx-1">/</span> {row.jobTitle || 'موظف'}
                        </td>

                        {/* 4. الراتب الشهري */}
                        <td className="p-4 text-center font-mono font-black text-[#263544] text-sm">
                          {resolveDisplayedMonthlySalary(row).toLocaleString()} <span className="text-[10px] text-[#C89355] mr-1">ل.س</span>
                        </td>

                        {/* 5. رقم الموبايل */}
                        <td className="p-4 text-center font-mono font-bold text-slate-600 text-sm dir-ltr">
                          {emp.mobile || '—'}
                        </td>

                        {/* 6. إجراءات (تعديل وإقالة موحدة التصميم) */}
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-2 opacity-60 group-hover/row:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleEditClick(emp)}
                              className="text-[#C89355] hover:bg-[#C89355]/10 p-2.5 rounded-xl transition-all duration-300 hover:scale-110 shadow-sm border border-transparent hover:border-[#C89355]/30"
                              title="تعديل بيانات الموظف"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => { setEmployeeToFire(emp); setIsFireModalOpen(true); }}
                              className="text-rose-500 hover:bg-rose-500/10 p-2.5 rounded-xl transition-all duration-300 hover:scale-110 shadow-sm border border-transparent hover:border-rose-500/30"
                              title="إقالة الموظف"
                            >
                              <UserMinus size={16} />
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

          {/* نوافذ الـ Modals */}
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

          {isFireModalOpen && employeeToFire && (
            <FireEmployeeModal 
               isOpen={isFireModalOpen}
               onClose={() => { setIsFireModalOpen(false); setEmployeeToFire(null); }}
               employee={employeeToFire}
               onConfirm={handleConfirmFire}
               isPending={updateEmployee.isPending}
            />
          )}

        </div>
    </div>
  );
}