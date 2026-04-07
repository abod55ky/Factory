import { useQueries } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { EmployeesStats, AttendanceStats, InventoryStats } from '@/types/dashboard';
import { QUERY_GC_TIME, QUERY_STALE_TIME } from '@/lib/query-cache';

export const useDashboard = (opts?: { startDate?: string; endDate?: string }) => {
  const queries = useQueries({
    queries: [
      {
        queryKey: ['employees', 'stats'],
        queryFn: async () => {
          const res = await apiClient.get('/employees/stats');
          return res.data;
        },
        staleTime: QUERY_STALE_TIME.STANDARD,
        gcTime: QUERY_GC_TIME.RELAXED,
      },
      {
        queryKey: ['attendance', 'stats', opts?.startDate, opts?.endDate],
        queryFn: async () => {
          const res = await apiClient.get('/attendance/stats', {
            params: { startDate: opts?.startDate, endDate: opts?.endDate },
          });
          return res.data;
        },
        staleTime: QUERY_STALE_TIME.STANDARD,
        gcTime: QUERY_GC_TIME.RELAXED,
      },
      {
        queryKey: ['inventory', 'stats'],
        queryFn: async () => {
          const res = await apiClient.get('/inventory/stats');
          return res.data;
        },
        staleTime: QUERY_STALE_TIME.STANDARD,
        gcTime: QUERY_GC_TIME.RELAXED,
      },
    ],
  });

  return {
    employeesStats: queries[0]?.data as EmployeesStats | undefined,
    attendanceStats: queries[1]?.data as AttendanceStats | undefined,
    inventoryStats: queries[2]?.data as InventoryStats | undefined,
    isLoading: queries.some((q) => q.isLoading),
    isError: queries.some((q) => q.isError),
  };
};
