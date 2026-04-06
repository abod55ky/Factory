import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export const useProducts = (params?: { page?: number; limit?: number; search?: string }) => {
  return useQuery({
    queryKey: ['inventory', 'products', params?.page, params?.limit, params?.search],
    queryFn: async () => {
      const res = await apiClient.get('/inventory/products', { params });
      return res.data;
    },
    staleTime: 1000 * 30,
  });
};
