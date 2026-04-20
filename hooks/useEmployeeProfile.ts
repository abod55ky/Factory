import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { QUERY_GC_TIME, QUERY_STALE_TIME } from "@/lib/query-cache";
import type { EmployeeProfileQuery, EmployeeProfileResponse } from "@/types/employee-profile";

type UseEmployeeProfileOptions = {
  enabled?: boolean;
};

const sanitizePositiveInt = (value: number | undefined) => {
  if (!Number.isFinite(value)) return undefined;
  const normalized = Math.trunc(Number(value));
  return normalized > 0 ? normalized : undefined;
};

const normalizeQuery = (query?: EmployeeProfileQuery): EmployeeProfileQuery => {
  return {
    startDate: query?.startDate || undefined,
    endDate: query?.endDate || undefined,
    period: query?.period || undefined,
    attendanceLimit: sanitizePositiveInt(query?.attendanceLimit),
    advancesLimit: sanitizePositiveInt(query?.advancesLimit),
    bonusesLimit: sanitizePositiveInt(query?.bonusesLimit),
  };
};

export const useEmployeeProfile = (
  employeeId: string,
  query?: EmployeeProfileQuery,
  options?: UseEmployeeProfileOptions,
) => {
  const normalizedQuery = normalizeQuery(query);

  return useQuery<EmployeeProfileResponse>({
    queryKey: [
      "employee-profile",
      employeeId,
      normalizedQuery.startDate || "",
      normalizedQuery.endDate || "",
      normalizedQuery.period || "",
      normalizedQuery.attendanceLimit || 0,
      normalizedQuery.advancesLimit || 0,
      normalizedQuery.bonusesLimit || 0,
    ],
    queryFn: async () => {
      const response = await apiClient.get<EmployeeProfileResponse>(`/employees/${employeeId}/profile`, {
        params: normalizedQuery,
      });
      return response.data;
    },
    enabled: Boolean(employeeId) && (options?.enabled ?? true),
    staleTime: QUERY_STALE_TIME.STANDARD,
    gcTime: QUERY_GC_TIME.RELAXED,
  });
};

