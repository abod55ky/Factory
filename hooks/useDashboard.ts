import { useQueries } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export const useDashboard = (opts?: { startDate?: string; endDate?: string }) => {
  const queries = useQueries({
    queries: [
      {
        queryKey: ['employees', 'stats'],
        queryFn: async () => {
          const res = await apiClient.get('/employees/stats');
          return res.data;
        },
        staleTime: 1000 * 30,
      },
      {
        queryKey: ['attendance', 'stats', opts?.startDate, opts?.endDate],
        queryFn: async () => {
          const res = await apiClient.get('/attendance/stats', {
            params: { startDate: opts?.startDate, endDate: opts?.endDate },
          });
          return res.data;
        },
        staleTime: 1000 * 30,
      },
      {
        queryKey: ['inventory', 'stats'],
        queryFn: async () => {
          const res = await apiClient.get('/inventory/stats');
          return res.data;
        },
        staleTime: 1000 * 30,
      },
    ],
  });

  return {
    employeesStats: queries[0]?.data,
    attendanceStats: queries[1]?.data,
    inventoryStats: queries[2]?.data,
    isLoading: queries.some((q) => q.isLoading),
    isError: queries.some((q) => q.isError),
  };
};
