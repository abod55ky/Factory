// hooks/useEmployeeDetails.ts
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { Employee } from "@/types/employee";

export function useEmployeeDetails(employeeId: string) {
  return useQuery({
    // مفتاح الكاش: يتغير بتغير الـ id
    queryKey: ["employee", employeeId], 
    queryFn: async () => {
      // نضرب على الـ Endpoint الجاهز في NestJS
      const response = await apiClient.get<Employee>(`/employees/${employeeId}`);
      // الباك يرجع الكائن مباشرة حسب شرحك، لذا نأخذ data فوراً
      return response.data;
    },
    enabled: !!employeeId, // لا يعمل الطلب إلا إذا كان الـ id موجوداً
  });
}
