import { useQueries } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type {
  EmployeesStats,
  AttendanceStats,
  InventoryStats,
  AttendanceAlertsResponse,
} from '@/types/dashboard';
import { QUERY_GC_TIME, QUERY_STALE_TIME } from '@/lib/query-cache';

const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const useDashboard = (opts?: { startDate?: string; endDate?: string; alertDate?: string }) => {
  const alertsDate = opts?.alertDate ?? opts?.startDate ?? opts?.endDate ?? getLocalDateString();

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
      {
        queryKey: ['attendance', 'alerts', alertsDate],
        queryFn: async () => {
          const res = await apiClient.get('/attendance/alerts', {
            params: {
              date: alertsDate,
              lateThresholdMinutes: 15,
            },
          });
          return res.data;
        },
        staleTime: QUERY_STALE_TIME.FAST,
        gcTime: QUERY_GC_TIME.STANDARD,
        refetchInterval: 60 * 1000,
      },
    ],
  });

  return {
    employeesStats: queries[0]?.data as EmployeesStats | undefined,
    attendanceStats: queries[1]?.data as AttendanceStats | undefined,
    inventoryStats: queries[2]?.data as InventoryStats | undefined,
    attendanceAlerts: queries[3]?.data as AttendanceAlertsResponse | undefined,
    isLoading: queries.some((q) => q.isLoading),
    isError: queries.some((q) => q.isError),
  };
};
