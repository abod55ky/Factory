
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { toast } from "react-hot-toast";
import axios from "axios";
import type { Employee } from "@/types/employee";
import { QUERY_GC_TIME, QUERY_STALE_TIME } from "@/lib/query-cache";

type ApiErrorBody = {
  message?: string | string[];
  error?: { message?: string | string[] };
};

const normalizeMessage = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value.join(" | ");
  }
  if (typeof value === "string") {
    return value;
  }
  return "";
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const message =
      normalizeMessage(error.response?.data?.error?.message) ||
      normalizeMessage(error.response?.data?.message);
    if (message.trim()) {
      return message;
    }
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
};

const toHourlyRateNumber = (value: Employee["hourlyRate"]) => {
  if (value && typeof value === "object" && "$numberDecimal" in value) {
    return Number(value.$numberDecimal || 0);
  }
  return Number(value || 0);
};

export const useEmployees = () => {
  const queryClient = useQueryClient();

  // 1. جلب الموظفين
  const query = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: async () => {
      const response = await apiClient.get("/employees");
      const employeesData = response.data?.employees;
      if (Array.isArray(employeesData)) return employeesData;
      return [];
    },
    staleTime: QUERY_STALE_TIME.STANDARD,
    gcTime: QUERY_GC_TIME.RELAXED,
  });

  // 2. إضافة موظف
  const createMutation = useMutation({
    mutationFn: async (newEmployee: Employee) => {
      const payload = { ...newEmployee, hourlyRate: toHourlyRateNumber(newEmployee.hourlyRate) };
      return await apiClient.post("/employees", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("تم إضافة الموظف بنجاح!");
    },
    onError: (error: unknown) => {
      let finalMessage = getErrorMessage(error, "حدث خطأ غير متوقع");
      if (finalMessage.includes("employeeId must match")) {
        finalMessage = "خطأ: يجب أن يبدأ كود الموظف بـ EMP متبوعاً بأرقام (مثال: EMP001)";
      }
      toast.error(finalMessage, { duration: 5000 });
    }
  });

  // 3. تعديل موظف (استخدمنا employeeId بناءً على الباك إند)
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Employee> }) => {
      const payload = {
        ...data,
        ...(data.hourlyRate !== undefined ? { hourlyRate: toHourlyRateNumber(data.hourlyRate) } : {}),
      };
      return await apiClient.put(`/employees/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("تم تحديث بيانات الموظف بنجاح!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "فشل تحديث بيانات الموظف"));
    }
  });

  // 4. حذف موظف
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.delete(`/employees/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("تم حذف الموظف بنجاح!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "فشل حذف الموظف"));
    }
  });

  // إرجاع كل الدوال لتعمل في الصفحة
  return { 
    ...query, 
    createEmployee: createMutation, 
    updateEmployee: updateMutation, 
    deleteEmployee: deleteMutation 
  };
};