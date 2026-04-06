// "use client";

// import { Plus, Search, Edit2, Trash2, MoreVertical } from "lucide-react";

// // بيانات تجريبية (Mock Data) لتعبئة الجدول
// const employees = [
//   { id: "E001", name: "أحمد محمد", role: "مدير مبيعات", rate: "45 ر.س", shift: "09:00 - 17:00", phone: "0501234567", initial: "أ", color: "bg-blue-500" },
//   { id: "E002", name: "فاطمة علي", role: "محاسبة", rate: "40 ر.س", shift: "09:00 - 17:00", phone: "0507654321", initial: "ف", color: "bg-pink-500" },
//   { id: "E003", name: "خالد سعيد", role: "مسؤول مخزن", rate: "35 ر.س", shift: "08:00 - 16:00", phone: "0509876543", initial: "خ", color: "bg-orange-500" },
//   { id: "E004", name: "نورة حسن", role: "مصممة", rate: "50 ر.س", shift: "10:00 - 18:00", phone: "0503456789", initial: "ن", color: "bg-purple-500" },
//   { id: "E005", name: "سعد العتيبي", role: "مندوب مبيعات", rate: "30 ر.س", shift: "09:00 - 17:00", phone: "0502345678", initial: "س", color: "bg-green-500" },
//   { id: "E006", name: "ريم القحطاني", role: "مسؤولة موارد بشرية", rate: "42 ر.س", shift: "09:00 - 17:00", phone: "0508765432", initial: "ر", color: "bg-yellow-500" },
// ];

// export default function EmployeesPage() {
//   return (
//     <div className="p-8 min-h-screen bg-[#f9fafb]">
//       {/* الجزء العلوي (Header) */}
//       <header className="flex justify-between items-center mb-8">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-800">إدارة الموظفين</h1>
//           <p className="text-slate-500 text-sm">{employees.length} موظف مسجل</p>
//         </div>
//         <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all shadow-md active:scale-95">
//           <Plus size={20} />
//           إضافة موظف
//         </button>
//       </header>

//       {/* شريط البحث والفلترة */}
//       <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-6 flex items-center justify-between">
//         <div className="relative w-full max-w-md">
//           <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//           <input 
//             type="text" 
//             placeholder="بحث بالاسم أو المنصب..." 
//             className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
//           />
//         </div>
//       </div>

//       {/* الجدول */}
//       <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
//         <table className="w-full text-right border-collapse">
//           <thead>
//             <tr className="bg-slate-50/50 border-b border-slate-100">
//               <th className="p-4 text-sm font-semibold text-slate-600">الرقم</th>
//               <th className="p-4 text-sm font-semibold text-slate-600">الاسم</th>
//               <th className="p-4 text-sm font-semibold text-slate-600">المنصب</th>
//               <th className="p-4 text-sm font-semibold text-slate-600">الأجر/ساعة</th>
//               <th className="p-4 text-sm font-semibold text-slate-600 text-center">الدوام</th>
//               <th className="p-4 text-sm font-semibold text-slate-600">الهاتف</th>
//               <th className="p-4 text-sm font-semibold text-slate-600 text-center">إجراءات</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-slate-50">
//             {employees.map((emp) => (
//               <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors group">
//                 <td className="p-4 text-sm text-slate-500 font-mono">{emp.id}</td>
//                 <td className="p-4">
//                   <div className="flex items-center gap-3">
//                     <div className={`w-9 h-9 rounded-full ${emp.color} text-white flex items-center justify-center text-xs font-bold shadow-sm`}>
//                       {emp.initial}
//                     </div>
//                     <span className="font-semibold text-slate-700">{emp.name}</span>
//                   </div>
//                 </td>
//                 <td className="p-4 text-sm text-slate-600">{emp.role}</td>
//                 <td className="p-4 text-sm">
//                   <span className="bg-slate-100 px-2 py-1 rounded text-slate-700 font-bold tracking-tighter">
//                     {emp.rate}
//                   </span>
//                 </td>
//                 <td className="p-4 text-sm text-slate-600 text-center">
//                   <span className="inline-block dir-ltr font-mono">{emp.shift}</span>
//                 </td>
//                 <td className="p-4 text-sm text-slate-600">{emp.phone}</td>
//                 <td className="p-4 text-center">
//                   <div className="flex justify-center gap-1">
//                     <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="تعديل">
//                       <Edit2 size={16} />
//                     </button>
//                     <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="حذف">
//                       <Trash2 size={16} />
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }





// "use client";

// import { useQuery } from "@tanstack/react-query";
// import apiClient from "@/lib/api-client";
// import { Plus, Search, Edit2, Trash2, Clock, DollarSign } from "lucide-react";

// export default function EmployeesPage() {
//   const { data: employees, isLoading, error } = useQuery({
//     queryKey: ["employees"],
//     queryFn: async () => {
//       const response = await apiClient.get("/employees");
//       // ملاحظة: الباك إند قد يعيد البيانات داخل مصفوفة، تأكد من شكل الرد
//       return response.data;
//     },
//   });

//   if (isLoading) return <div className="p-10 text-center">جاري جلب بيانات الموظفين...</div>;

//   return (
//     <div className="p-8 bg-[#f8fafc] min-h-screen">
//       <header className="flex justify-between items-center mb-8">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-800">إدارة الموظفين</h1>
//           <p className="text-slate-500 text-sm">إجمالي المسجلين: {employees?.length || 0}</p>
//         </div>
//         <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md">
//           <Plus size={20} /> إضافة موظف جديد
//         </button>
//       </header>

//       <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
//         <table className="w-full text-right">
//           <thead className="bg-slate-50 border-b border-slate-100">
//             <tr>
//               <th className="p-4 text-slate-600 font-semibold text-sm">الموظف</th>
//               <th className="p-4 text-slate-600 font-semibold text-sm text-center">القسم</th>
//               <th className="p-4 text-slate-600 font-semibold text-sm text-center">أجر الساعة</th>
//               <th className="p-4 text-slate-600 font-semibold text-sm text-center">الدوام</th>
//               <th className="p-4 text-slate-600 font-semibold text-sm text-center">الحالة</th>
//               <th className="p-4 text-slate-600 font-semibold text-sm text-center">إجراءات</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-slate-50">
//             {employees?.map((emp: any) => (
//               <tr key={emp._id} className="hover:bg-slate-50/50 transition-colors">
//                 <td className="p-4">
//                   <div className="font-bold text-slate-700">{emp.name}</div>
//                   <div className="text-[10px] text-slate-400 font-mono">{emp.employeeId}</div>
//                 </td>
//                 <td className="p-4 text-center">
//                   <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold">
//                     {emp.department}
//                   </span>
//                 </td>
//                 <td className="p-4 text-center font-mono font-bold text-slate-600">
//                   {emp.hourlyRate.$numberDecimal || emp.hourlyRate} {emp.currency}
//                 </td>
//                 <td className="p-4 text-center text-xs text-slate-500">
//                   <div className="flex items-center justify-center gap-1">
//                     <Clock size={12} />
//                     <span dir="ltr">{emp.scheduledStart} - {emp.scheduledEnd}</span>
//                   </div>
//                 </td>
//                 <td className="p-4 text-center">
//                   <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
//                     emp.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
//                   }`}>
//                     {emp.status === 'active' ? 'نشط' : 'متوقف'}
//                   </span>
//                 </td>
//                 <td className="p-4 text-center">
//                   <div className="flex justify-center gap-3">
//                     <button className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg"><Edit2 size={16} /></button>
//                     <button className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg"><Trash2 size={16} /></button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }






// "use client";

// import { useEmployees } from "@/hooks/useEmployees";
// import { Plus, Loader2, AlertCircle } from "lucide-react";

// export default function EmployeesPage() {
//   // نطلب البيانات باستخدام الـ Hook الذي أنشأناه
//   const { data: employees, isLoading, isError } = useEmployees();

//   // 1. حالة التحميل (بينما ننتظر السيرفر)
//   if (isLoading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-96 text-slate-500">
//         <Loader2 className="animate-spin mb-2" size={40} />
//         <p>جاري سحب بيانات الموظفين...</p>
//       </div>
//     );
//   }

//   // 2. حالة وجود خطأ (بما أن السيرفر طافي الآن، ستظهر لك هذه الحالة)
//   if (isError) {
//     return (
//       <div className="flex flex-col items-center justify-center h-96 text-red-500 bg-red-50 m-8 rounded-2xl border border-red-100">
//         <AlertCircle size={40} className="mb-2" />
//         <h3 className="font-bold">فشل الاتصال بالباك إند</h3>
//         <p className="text-sm">تأكد من تشغيل سيرفر NestJS على المنفذ 5001</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-8 font-sans">
//       <header className="flex justify-between items-center mb-8">
//         <h1 className="text-2xl font-bold">قائمة الموظفين</h1>
//         <button className="bg-blue-600 text-white px-5 py-2 rounded-xl flex items-center gap-2">
//           <Plus size={20} /> إضافة موظف
//         </button>
//       </header>

//       {/* الجدول */}
//       <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
//         <table className="w-full text-right">
//           <thead className="bg-slate-50">
//             <tr className="text-slate-500 text-sm">
//               <th className="p-4">الموظف</th>
//               <th className="p-4">القسم</th>
//               <th className="p-4">أجر الساعة</th>
//               <th className="p-4">الحالة</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-slate-50">
//             {employees?.map((emp) => (
//               <tr key={emp._id} className="hover:bg-slate-50">
//                 <td className="p-4 font-bold text-slate-700">{emp.name}</td>
//                 <td className="p-4 text-slate-500">{emp.department}</td>
//                 <td className="p-4 font-mono font-bold">
//                   {typeof emp.hourlyRate === 'object' ? emp.hourlyRate.$numberDecimal : emp.hourlyRate}
//                 </td>
//                 <td className="p-4">
//                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
//                      emp.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
//                    }`}>
//                      {emp.status === 'active' ? 'نشط' : 'متوقف'}
//                    </span>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }



// "use client";

// import { useEmployees } from "@/hooks/useEmployees";
// import { Loader2, AlertCircle, Users } from "lucide-react";

// export default function EmployeesPage() {
//   const { data: employees, isLoading, isError, error } = useEmployees();

//   if (isLoading) return (
//     <div className="flex flex-col items-center justify-center h-screen space-y-4">
//       <Loader2 className="animate-spin text-blue-600" size={48} />
//       <p className="text-slate-500 font-bold animate-pulse">جاري جلب الموظفين من السيرفر...</p>
//     </div>
//   );

//   if (isError) return (
//     <div className="p-8 text-center bg-red-50 text-red-600 rounded-2xl m-10 border border-red-100">
//       <AlertCircle size={40} className="mx-auto mb-4" />
//       <h2 className="text-xl font-bold">حدث خطأ أثناء تحميل البيانات</h2>
//       <p className="text-sm">{(error as any)?.message || "تأكد من اتصال الإنترنت أو صلاحيات الدخول"}</p>
//     </div>
//   );

//   return (
//     <div className="p-8 font-sans" dir="rtl">
//       <header className="flex justify-between items-center mb-10">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-800">إدارة الموظفين</h1>
//           <p className="text-slate-500 text-sm">لديك {employees?.length || 0} موظف مسجل في النظام</p>
//         </div>
//       </header>

//       <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
//         <table className="w-full text-right">
//           <thead className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
//             <tr>
//               <th className="p-4">اسم الموظف</th>
//               <th className="p-4">القسم</th>
//               <th className="p-4">الحالة</th>
//               <th className="p-4 text-center">الإجراءات</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-slate-50">
//             {employees?.map((emp) => (
//               <tr key={emp.id} className="hover:bg-blue-50/30 transition-all">
//                 <td className="p-4 font-bold text-slate-700">{emp.name}</td>
//                 <td className="p-4 text-slate-600 text-sm">{emp.department}</td>
//                 <td className="p-4">
//                   <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
//                     emp.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
//                   }`}>
//                     {emp.status === 'active' ? 'نشط' : 'متوقف'}
//                   </span>
//                 </td>
//                 <td className="p-4 text-center">
//                   <button className="text-blue-600 text-xs font-bold hover:underline">التفاصيل</button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }







// "use client";

// import { useState } from "react";
// import { useEmployees } from "@/hooks/useEmployees";
// import { Plus, X, Loader2, Save } from "lucide-react";

// export default function EmployeesPage() {
//   const { data: employees, isLoading, createEmployee } = useEmployees();
  
//   // حالة لفتح وإغلاق النافذة
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // حالة لحفظ بيانات النموذج (Form Data)
//   const [formData, setFormData] = useState({
//     employeeId: "",
//     name: "",
//     department: "Warehouse", // قيمة افتراضية
//     hourlyRate: "",
//     scheduledStart: "08:00",
//     scheduledEnd: "16:00",
//     status: "active"
//   });

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     // إرسال البيانات للباك إند
//     await createEmployee.mutateAsync(formData);
//     setIsModalOpen(false); // إغلاق النافذة عند النجاح
//     setFormData({ employeeId: "", name: "", department: "Warehouse", hourlyRate: "", scheduledStart: "08:00", scheduledEnd: "16:00", status: "active" }); // تصفير الحقول
//   };

//   return (
//     <div className="p-8 font-sans" dir="rtl">
//       {/* الهيدر */}
//       <header className="flex justify-between items-center mb-8">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-800">إدارة الموظفين</h1>
//           <p className="text-slate-500 text-sm">إجمالي الموظفين: {employees?.length || 0}</p>
//         </div>
//         <button 
//           onClick={() => setIsModalOpen(true)}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition-all active:scale-95"
//         >
//           <Plus size={20} /> إضافة موظف
//         </button>
//       </header>

//       {/* الجدول (كود الجدول السابق يوضع هنا) ... */}

//       {/* نافذة الإضافة (The Modal) */}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
//             {/* رأس النافذة */}
//             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
//               <h2 className="text-xl font-bold text-slate-800">إضافة موظف جديد</h2>
//               <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
//                 <X size={24} />
//               </button>
//             </div>

//             {/* النموذج */}
//             <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              
//               <div>
//                 <label className="block text-sm font-bold text-slate-700 mb-2">اسم الموظف</label>
//                 <input 
//                   type="text" required
//                   className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
//                   value={formData.name}
//                   onChange={(e) => setFormData({...formData, name: e.target.value})}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-bold text-slate-700 mb-2">كود الموظف (ID)</label>
//                 <input 
//                   type="text" placeholder="مثلاً EMP001" required
//                   className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
//                   value={formData.employeeId}
//                   onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-bold text-slate-700 mb-2">القسم</label>
//                 <select 
//                   className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
//                   value={formData.department}
//                   onChange={(e) => setFormData({...formData, department: e.target.value})}
//                 >
//                   <option value="Warehouse">المستودع</option>
//                   <option value="Production">الإنتاج</option>
//                   <option value="Admin">الإدارة</option>
//                   <option value="Finance">المالية</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-bold text-slate-700 mb-2">أجر الساعة</label>
//                 <input 
//                   type="number" required
//                   className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
//                   value={formData.hourlyRate}
//                   onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-bold text-slate-700 mb-2">بداية الدوام</label>
//                 <input 
//                   type="time" 
//                   className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
//                   value={formData.scheduledStart}
//                   onChange={(e) => setFormData({...formData, scheduledStart: e.target.value})}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-bold text-slate-700 mb-2">نهاية الدوام</label>
//                 <input 
//                   type="time"
//                   className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
//                   value={formData.scheduledEnd}
//                   onChange={(e) => setFormData({...formData, scheduledEnd: e.target.value})}
//                 />
//               </div>

//               <div className="md:col-span-2 pt-4 border-t border-slate-100 flex justify-end gap-3">
//                 <button 
//                   type="button" onClick={() => setIsModalOpen(false)}
//                   className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
//                 >
//                   إلغاء
//                 </button>
//                 <button 
//                   type="submit"
//                   disabled={createEmployee.isPending}
//                   className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center gap-2 hover:bg-blue-700 transition-all disabled:bg-slate-300"
//                 >
//                   {createEmployee.isPending ? <Loader2 className="animate-spin" /> : <Save size={20} />}
//                   حفظ الموظف
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { useEmployees } from "@/hooks/useEmployees";
import AddEmployeeModal from "@/components/AddEmployeeModal";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";

export default function EmployeesPage() {
  // 1. استخدام الـ Hook لجلب البيانات والعمليات
  const { 
    data: employees, 
    isLoading, 
    createEmployee, 
    updateEmployee, 
    deleteEmployee 
  } = useEmployees();
  
  // 2. حالات التحكم في النافذة والبيانات المختارة
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  // 3. دالة الحذف مع التأكيد
  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من حذف الموظف: ${name}؟`)) {
      try {
        await deleteEmployee.mutateAsync(id);
      } catch (error) {
        // الخطأ يتم معالجته غالباً داخل الـ Hook عبر Toast
      }
    }
  };

  // 4. دالة فتح النافذة للتعديل
  const handleEditClick = (emp: any) => {
    setSelectedEmployee(emp);
    setIsModalOpen(true);
  };

  // 5. دالة الحفظ الذكية (إضافة أو تعديل)
  const handleSaveEmployee = async (formData: any) => {
    try {
      if (selectedEmployee) {
        // تعديل موظف موجود
        await updateEmployee.mutateAsync({ 
          id: selectedEmployee.employeeId, 
          data: formData 
        });
      } else {
        // إضافة موظف جديد
        await createEmployee.mutateAsync(formData);
      }
      setIsModalOpen(false);
      setSelectedEmployee(null);
    } catch (error) {
      // الخطأ يظهر عبر التوست في الـ Hook
    }
  };

  return (
    <div className="p-8 font-sans bg-[#f8fafc] min-h-screen" dir="rtl">
      {/* الهيدر */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">إدارة الموظفين</h1>
          <p className="text-slate-500 text-sm">
            إجمالي الموظفين: {employees?.length || 0}
          </p>
        </div>
        
        <button 
          onClick={() => { setSelectedEmployee(null); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition-all active:scale-95"
        >
          <Plus size={20} /> إضافة موظف جديد
        </button>
      </header>

      {/* الجدول */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-4 text-slate-600 font-semibold text-sm">الموظف</th>
              <th className="p-4 text-slate-600 font-semibold text-sm text-center">القسم</th>
              <th className="p-4 text-slate-600 font-semibold text-sm text-center">أجر الساعة</th>
              <th className="p-4 text-slate-600 font-semibold text-sm text-center">الحالة</th>
              <th className="p-4 text-slate-600 font-semibold text-sm text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                    <span>جاري تحميل قائمة الموظفين...</span>
                  </div>
                </td>
              </tr>
            ) : employees?.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-slate-500">
                  لا يوجد موظفين حالياً. أضف موظفاً جديداً للبدء!
                </td>
              </tr>
            ) : (
              employees?.map((emp: any) => (
                <tr key={emp.employeeId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-slate-700">{emp.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{emp.employeeId}</div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold">
                      {emp.department}
                    </span>
                  </td>
                  <td className="p-4 text-center font-mono font-bold text-slate-600">
                    {emp.hourlyRate?.$numberDecimal || emp.hourlyRate} 
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                      emp.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {emp.status === 'active' ? 'نشط' : 'متوقف'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button 
                        onClick={() => handleEditClick(emp)}
                        className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                        title="تعديل"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(emp.employeeId, emp.name)}
                        className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                        title="حذف"
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

      {/* نافذة الإضافة والتعديل */}
      <AddEmployeeModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEmployee(null);
        }} 
        onSave={handleSaveEmployee}
        isPending={createEmployee.isPending || updateEmployee.isPending}
        initialData={selectedEmployee}
      />
    </div>
  );
}