
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { toast } from "react-hot-toast";
import axios from "axios";
import type { Employee } from "@/types/employee";
import { QUERY_GC_TIME, QUERY_STALE_TIME } from "@/lib/query-cache";

type EmployeeStatus = "active" | "inactive" | "terminated";

type EmployeesPagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

type EmployeesListResponse = {
  employees: Employee[];
  pagination?: EmployeesPagination;
};

type UseEmployeesParams = {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: EmployeeStatus;
  fetchAll?: boolean;
};

const EMPLOYEE_MAX_LIMIT = 200;
const EMPLOYEE_DEFAULT_LIMIT = 50;

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

const sanitizePositiveInt = (value: number | undefined, fallback: number) => {
  if (!Number.isFinite(value)) return fallback;
  const normalized = Math.trunc(Number(value));
  return normalized > 0 ? normalized : fallback;
};

const toHourlyRateNumber = (value: Employee["hourlyRate"]) => {
  if (value && typeof value === "object" && "$numberDecimal" in value) {
    return Number(value.$numberDecimal || 0);
  }
  return Number(value || 0);
};

export const useEmployees = (params?: UseEmployeesParams) => {
  const queryClient = useQueryClient();
  const requestedPage = sanitizePositiveInt(params?.page, 1);
  const requestedLimit = sanitizePositiveInt(params?.limit, EMPLOYEE_DEFAULT_LIMIT);
  const limit = Math.min(requestedLimit, EMPLOYEE_MAX_LIMIT);
  const normalizedSearch = params?.search?.trim() || undefined;
  const normalizedDepartment = params?.department?.trim() || undefined;
  const normalizedStatus = params?.status;
  const shouldFetchAll = Boolean(params?.fetchAll);

  const query = useQuery<EmployeesListResponse>({
    queryKey: [
      "employees",
      requestedPage,
      limit,
      normalizedSearch || "",
      normalizedDepartment || "",
      normalizedStatus || "",
      shouldFetchAll ? "all" : "page",
    ],
    queryFn: async () => {
      const fetchPage = async (page: number): Promise<EmployeesListResponse> => {
        const response = await apiClient.get("/employees", {
          params: {
            page,
            limit,
            search: normalizedSearch,
            department: normalizedDepartment,
            status: normalizedStatus,
          },
        });

        return {
          employees: Array.isArray(response.data?.employees) ? response.data.employees : [],
          pagination: response.data?.pagination,
        };
      };

      if (!shouldFetchAll) {
        return fetchPage(requestedPage);
      }

      const firstPage = await fetchPage(1);
      const totalPages = Number(firstPage.pagination?.pages || 1);

      if (totalPages <= 1) {
        return firstPage;
      }

      const mergedEmployees = [...firstPage.employees];
      for (let page = 2; page <= totalPages; page += 1) {
        const nextPage = await fetchPage(page);
        if (nextPage.employees.length === 0) {
          break;
        }
        mergedEmployees.push(...nextPage.employees);
      }

      return {
        employees: mergedEmployees,
        pagination: {
          page: 1,
          limit: mergedEmployees.length,
          total: mergedEmployees.length,
          pages: 1,
        },
      };
    },
    staleTime: shouldFetchAll ? QUERY_STALE_TIME.RELAXED : QUERY_STALE_TIME.STANDARD,
    gcTime: QUERY_GC_TIME.RELAXED,
    placeholderData: keepPreviousData,
  });

  const employees = Array.isArray(query.data?.employees) ? query.data.employees : [];
  const pagination = query.data?.pagination;

  const createMutation = useMutation({
    mutationFn: async (newEmployee: Employee) => {
      const payload = { ...newEmployee, hourlyRate: toHourlyRateNumber(newEmployee.hourlyRate) };
      return await apiClient.post("/employees", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"], exact: false });
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

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Employee> }) => {
      const payload = {
        ...data,
        ...(data.hourlyRate !== undefined ? { hourlyRate: toHourlyRateNumber(data.hourlyRate) } : {}),
      };
      return await apiClient.put(`/employees/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"], exact: false });
      toast.success("تم تحديث بيانات الموظف بنجاح!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "فشل تحديث بيانات الموظف"));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.delete(`/employees/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"], exact: false });
      toast.success("تم حذف الموظف بنجاح!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "فشل حذف الموظف"));
    }
  });

  return {
    ...query,
    data: employees,
    pagination,
    listData: query.data,
    createEmployee: createMutation,
    updateEmployee: updateMutation,
    deleteEmployee: deleteMutation,
  };
};