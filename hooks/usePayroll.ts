import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export const usePayrollSummary = (period?: { start?: string; end?: string }) => {
  return useQuery({
    queryKey: ['payroll', 'summary', period?.start, period?.end],
    queryFn: async () => {
      const res = await apiClient.get('/payroll/summary', { params: { periodStart: period?.start, periodEnd: period?.end } });
      return res.data;
    },
    staleTime: 1000 * 30,
  });
};

export const usePayrollList = (params?: any) => {
  return useQuery({
    queryKey: ['payroll', 'list', params],
    queryFn: async () => {
      const res = await apiClient.get('/payroll', { params });
      return res.data;
    },
    staleTime: 1000 * 30,
  });
};
