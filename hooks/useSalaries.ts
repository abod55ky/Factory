// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import apiClient from "@/lib/api-client";
// import { toast } from "react-hot-toast";
// import { Salary, SalaryInput } from "@/types/salary";

// // Hook that provides salaries list + helpers for single salary + mutations
// export const useSalaries = () => {
//   const queryClient = useQueryClient();

//   const salariesQuery = useQuery<Salary[]>({
//     queryKey: ["salaries"],
//     queryFn: async () => {
//       const res = await apiClient.get("/salary");
//       // backend might return array directly or wrap it
//       const data = res.data?.salaries ?? res.data;
//       return Array.isArray(data) ? data : [];
//     },
//   });

//   // convenience hook for a single employee salary
//   const useEmployeeSalary = (employeeId?: string) =>
//     useQuery<Salary | null>({
//       queryKey: ["salary", employeeId],
//       enabled: !!employeeId,
//       queryFn: async () => {
//         try {
//           const res = await apiClient.get(`/salary/${employeeId}`);
//           return res.data ?? null;
//         } catch (err: any) {
//           const status = err?.response?.status;
//           // If not found or bad request because salary record doesn't exist, return null silently
//           if (status === 404 || status === 400) {
//             return null;
//           }
//           // rethrow other errors (connection, 500, etc.) so react-query handles retries and error states
//           throw err;
//         }
//       },
//     });

//   const updateSalary = useMutation({
//     mutationFn: async ({ employeeId, data }: { employeeId: string; data: SalaryInput }) => {
//       // ensure numeric fields are numbers
//       const payload = {
//         ...data,
//         baseSalary: Number(data.baseSalary),
//         responsibilityAllowance: Number(data.responsibilityAllowance),
//         productionIncentive: Number(data.productionIncentive),
//         transportAllowance: Number(data.transportAllowance),
//       };
//       return await apiClient.put(`/salary/${employeeId}`, payload);
//     },
//     onSuccess: (_data, variables) => {
//       queryClient.invalidateQueries({ queryKey: ["salaries"] });
//       if (variables?.employeeId) queryClient.invalidateQueries({ queryKey: ["salary", variables.employeeId] });
//       toast.success("تم حفظ مكونات الراتب بنجاح");
//     },
//     onError: (error: any) => {
//       const msg = error?.response?.data?.message || "فشل حفظ الراتب";
//       toast.error(msg);
//     },
//   });

//   const deleteSalary = useMutation({
//     mutationFn: async (employeeId: string) => {
//       return await apiClient.delete(`/salary/${employeeId}`);
//     },
//     onSuccess: (_data, employeeId) => {
//       queryClient.invalidateQueries({ queryKey: ["salaries"] });
//       if (employeeId) queryClient.invalidateQueries({ queryKey: ["salary", employeeId] });
//       toast.success("تم حذف بيانات الراتب");
//     },
//     onError: (error: any) => {
//       toast.error(error?.response?.data?.message || "فشل حذف الراتب");
//     },
//   });

//   return {
//     // list query props
//     ...salariesQuery,
//     // helpers
//     useEmployeeSalary,
//     updateSalary,
//     deleteSalary,
//   };
// };

// export default useSalaries;


import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { toast } from "react-hot-toast";
import { Salary, SalaryInput } from "@/types/salary";

// Hook that provides salaries list + helpers for single salary + mutations
export const useSalaries = () => {
  const queryClient = useQueryClient();

  const salariesQuery = useQuery<Salary[]>({
    queryKey: ["salaries"],
    queryFn: async () => {
      const res = await apiClient.get("/salary");
      const data = res.data?.salaries ?? res.data;
      return Array.isArray(data) ? data : [];
    },
  });

  const useEmployeeSalary = (employeeId?: string) =>
    useQuery<Salary | null>({
      queryKey: ["salary", employeeId],
      enabled: !!employeeId,
      queryFn: async () => {
        try {
          const res = await apiClient.get(`/salary/${employeeId}`);
          return res.data ?? null;
        } catch (err: any) {
          const status = err?.response?.status;
          if (status === 404 || status === 400) {
            return null;
          }
          throw err;
        }
      },
      retry: false, // لضمان عدم تكرار الطلب الفاشل في حال عدم وجود سجل
    });

  const updateSalary = useMutation({
    mutationFn: async ({ employeeId, data }: { employeeId: string; data: SalaryInput }) => {
      
      // 📝 التعديل الجوهري هنا:
      // نستخرج الحقول المالية فقط ونستبعد employeeId من الجسم (Body)
      const payload = {
        profession: data.profession,
        baseSalary: Number(data.baseSalary),
        responsibilityAllowance: Number(data.responsibilityAllowance),
        productionIncentive: Number(data.productionIncentive),
        transportAllowance: Number(data.transportAllowance),
      };

      console.log(`📤 [Put] Sending cleaned payload to /salary/${employeeId}`, payload);
      
      return await apiClient.put(`/salary/${employeeId}`, payload);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["salaries"] });
      if (variables?.employeeId) {
        queryClient.invalidateQueries({ queryKey: ["salary", variables.employeeId] });
      }
      toast.success("تم حفظ مكونات الراتب بنجاح");
    },
    onError: (error: any) => {
      // إظهار رسالة الخطأ القادمة من السيرفر بدقة
      const msg = error?.response?.data?.error?.message || error?.response?.data?.message || "فشل حفظ الراتب";
      toast.error(msg);
      console.error("❌ Salary Update Error:", error.response?.data);
    },
  });

  const deleteSalary = useMutation({
    mutationFn: async (employeeId: string) => {
      return await apiClient.delete(`/salary/${employeeId}`);
    },
    onSuccess: (_data, employeeId) => {
      queryClient.invalidateQueries({ queryKey: ["salaries"] });
      if (employeeId) {
        queryClient.invalidateQueries({ queryKey: ["salary", employeeId] });
      }
      toast.success("تم حذف بيانات الراتب");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "فشل حذف الراتب");
    },
  });

  return {
    ...salariesQuery,
    useEmployeeSalary,
    updateSalary,
    deleteSalary,
  };
};

export default useSalaries;