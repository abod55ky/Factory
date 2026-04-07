// "use client";

// import { useState, useEffect } from "react";
// import { X, Loader2, Save } from "lucide-react";
// import { useQuery } from "@tanstack/react-query";
// import apiClient from "@/lib/api-client";

// interface Props {
//   isOpen: boolean;
//   onClose: () => void;
//   onSave: (data: any) => void;
//   isPending: boolean;
//   initialData?: any; // حقل جديد للتعديل
// }

// export default function AddEmployeeModal({ isOpen, onClose, onSave, isPending ,initialData }: Props) {
//     // 1. جلب قائمة الصلاحيات (Roles) من الباك إند ذكياً (فقط عندما تفتح النافذة)
//   const { data: roles, isLoading: rolesLoading } = useQuery({
//     queryKey: ["roles"],
//     queryFn: async () => {
//       const response = await apiClient.get("/auth/roles");
//       return response.data;
//     },
//     enabled: isOpen, 
//   });

//   // 2. تحديث هيكل البيانات ليتطابق 100% مع الباك إند (حذفنا status وأضفنا email و roleId)
//   const initialState = {
//       employeeId: "",
//       name: "",
//       email: "", // حقل جديد
//       department: "Warehouse",
//       hourlyRate: "",
//       scheduledStart: "08:00",
//       scheduledEnd: "16:00",
//       roleId: "", // حقل جديد
//     };
//     const [formData, setFormData] = useState(initialState);
    
//     useEffect(() => {
//     if (isOpen) {
//       if (initialData) {
//         // إذا كانت هناك بيانات أولية (وضع التعديل)
//         setFormData({
//           ...initialData,
//           hourlyRate: initialData.hourlyRate?.$numberDecimal || initialData.hourlyRate
//         });
//       } else {
//         // إذا كانت الإضافة (تصفير الفورم)
//         setFormData(initialState);
//       }
//     }
//   }, [isOpen, initialData]);

//   // 3. تحديد أول صلاحية كقيمة افتراضية بمجرد وصول البيانات من السيرفر
//   useEffect(() => {
//     if (roles && roles.length > 0 && !formData.roleId) {
//       setFormData((prev) => ({ ...prev, roleId: roles[0].id }));
//     }
//   }, [roles, formData.roleId]);

//   if (!isOpen) return null;

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onSave(formData);
//   };

//   return (
//     <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
//       <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
//         <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
//           <h2 className="text-xl font-bold text-slate-800">إضافة موظف جديد</h2>
//           <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
//             <X size={24} />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
          
//           <div>
//             <label className="block text-sm font-bold text-slate-700 mb-2">اسم الموظف</label>
//             <input 
//               type="text" required
//               className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
//               value={formData.name}
//               onChange={(e) => setFormData({...formData, name: e.target.value})}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-bold text-slate-700 mb-2">البريد الإلكتروني</label>
//             <input 
//               type="email" required placeholder="example@factory.com"
//               className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
//               value={formData.email}
//               onChange={(e) => setFormData({...formData, email: e.target.value})}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-bold text-slate-700 mb-2">كود الموظف (ID)</label>
//             <input 
//               type="text" placeholder="مثلاً EMP001" required
//               className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
//               value={formData.employeeId}
//               onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-bold text-slate-700 mb-2">القسم</label>
//             <select 
//               className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
//               value={formData.department}
//               onChange={(e) => setFormData({...formData, department: e.target.value})}
//             >
//               <option value="Warehouse">المستودع</option>
//               <option value="Production">الإنتاج</option>
//               <option value="Admin">الإدارة</option>
//               <option value="Finance">المالية</option>
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-bold text-slate-700 mb-2">الصلاحية (الرتبة)</label>
//             <select 
//               required
//               className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
//               value={formData.roleId}
//               onChange={(e) => setFormData({...formData, roleId: e.target.value})}
//               disabled={rolesLoading}
//             >
//               {rolesLoading ? (
//                 <option value="">جاري تحميل الصلاحيات...</option>
//               ) : (
//                 roles?.map((role: any) => (
//                   <option key={role.id} value={role.id}>
//                     {role.name}
//                   </option>
//                 ))
//               )}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-bold text-slate-700 mb-2">أجر الساعة</label>
//             <input 
//               type="number" required
//               className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
//               value={formData.hourlyRate}
//               onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-bold text-slate-700 mb-2">بداية الدوام</label>
//             <input 
//               type="time" 
//               className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
//               value={formData.scheduledStart}
//               onChange={(e) => setFormData({...formData, scheduledStart: e.target.value})}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-bold text-slate-700 mb-2">نهاية الدوام</label>
//             <input 
//               type="time"
//               className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
//               value={formData.scheduledEnd}
//               onChange={(e) => setFormData({...formData, scheduledEnd: e.target.value})}
//             />
//           </div>

//           <div className="md:col-span-2 pt-4 border-t border-slate-100 flex justify-end gap-3">
//             <button 
//               type="button" onClick={onClose}
//               className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
//             >
//               إلغاء
//             </button>
//             <button 
//               type="submit"
//               disabled={isPending}
//               className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all disabled:bg-slate-300"
//             >
//               {isPending ? <Loader2 className="animate-spin" /> : <Save size={20} />}
//               حفظ الموظف
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { X, Loader2, Save } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { Employee } from "@/types/employee";

const asHourlyRateText = (value?: Employee["hourlyRate"]) => {
  if (value && typeof value === "object" && "$numberDecimal" in value) {
    return value.$numberDecimal;
  }
  return value?.toString() || "";
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Employee) => void;
  isPending: boolean;
  initialData?: Employee;
}

interface RoleOption {
  id: string;
  name: string;
}

// القالب الأساسي لتصفير الفورم
const defaultFormState = {
  employeeId: "",
  name: "",
  email: "",
  department: "Warehouse",
  hourlyRate: "",
  scheduledStart: "08:00",
  scheduledEnd: "16:00",
  roleId: "",
};

export default function AddEmployeeModal({ isOpen, onClose, onSave, isPending, initialData }: Props) {
  const [formData, setFormData] = useState(() => {
    if (initialData) {
      return {
        employeeId: initialData.employeeId || "",
        name: initialData.name || "",
        email: initialData.email || "",
        department: initialData.department || "Warehouse",
        hourlyRate: asHourlyRateText(initialData.hourlyRate),
        scheduledStart: initialData.scheduledStart || "08:00",
        scheduledEnd: initialData.scheduledEnd || "16:00",
        roleId: initialData.roleId || "",
      };
    }
    return {
      ...defaultFormState,
      roleId: "",
    };
  });

  // جلب الصلاحيات من الباك إند
  const { data: roles = [], isLoading: rolesLoading } = useQuery<RoleOption[]>({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await apiClient.get("/auth/roles");
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: isOpen, // لا تقم بالجلب إلا إذا كانت النافذة مفتوحة
  });

  const resolvedRoleId = formData.roleId || initialData?.roleId || roles[0]?.id || "";

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      roleId: resolvedRoleId,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">
            {initialData ? "تعديل بيانات الموظف" : "إضافة موظف جديد"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">اسم الموظف</label>
            <input 
              type="text" required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">البريد الإلكتروني</label>
            <input 
              type="email" required placeholder="example@factory.com"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">كود الموظف (ID)</label>
            <input 
              type="text" placeholder="مثال: EMP001" required
              pattern="^EMP[0-9]{3,}$"
              disabled={!!initialData} // لا يمكن تغيير الكود عند التعديل
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dir-ltr text-left font-mono disabled:opacity-50"
              value={formData.employeeId}
              onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">القسم</label>
            <select 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
            >
              <option value="Warehouse">المستودع</option>
              <option value="Production">الإنتاج</option>
              <option value="Admin">الإدارة</option>
              <option value="Finance">المالية</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">الصلاحية (الرتبة)</label>
            <select 
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={resolvedRoleId}
              onChange={(e) => setFormData({...formData, roleId: e.target.value})}
              disabled={rolesLoading}
            >
              {rolesLoading ? (
                <option value="">جاري التحميل...</option>
              ) : (
                roles.map((role) => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">أجر الساعة</label>
            <input 
              type="number" required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.hourlyRate}
              onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">بداية الدوام</label>
            <input 
              type="time" 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.scheduledStart}
              onChange={(e) => setFormData({...formData, scheduledStart: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">نهاية الدوام</label>
            <input 
              type="time"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.scheduledEnd}
              onChange={(e) => setFormData({...formData, scheduledEnd: e.target.value})}
            />
          </div>

          <div className="md:col-span-2 pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button 
              type="button" onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
            >
              إلغاء
            </button>
            <button 
              type="submit"
              disabled={isPending}
              className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all disabled:bg-slate-300"
            >
              {isPending ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              حفظ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}