import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export const useAttendance = (params?: { date?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['attendance', params?.date || 'all', params?.page, params?.limit],
    queryFn: async () => {
      const res = await apiClient.get('/attendance', { params });
      return res.data;
    },
    staleTime: 1000 * 30,
  });
};
