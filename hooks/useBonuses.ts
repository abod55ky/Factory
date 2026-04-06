import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import apiClient from "@/lib/api-client";
import { Bonus, BonusInput } from "@/types/bonus";

export const useBonuses = (params?: { employeeId?: string; period?: string }) => {
  const queryClient = useQueryClient();

  const bonusesQuery = useQuery<Bonus[]>({
    queryKey: ["bonuses", params?.employeeId || "all", params?.period || "all-periods"],
    queryFn: async () => {
      const res = await apiClient.get("/bonuses", {
        params: {
          employeeId: params?.employeeId,
          period: params?.period,
        },
      });
      return Array.isArray(res.data) ? res.data : [];
    },
    staleTime: 1000 * 30,
  });

  const createBonus = useMutation({
    mutationFn: async (payload: BonusInput) => {
      const data = {
        employeeId: payload.employeeId,
        bonusAmount: Number(payload.bonusAmount || 0),
        bonusReason: payload.bonusReason,
        assistanceAmount: Number(payload.assistanceAmount || 0),
        period: payload.period,
      };
      return await apiClient.post("/bonuses", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bonuses"], exact: false });
      toast.success("تمت إضافة المكافأة بنجاح");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "فشل إضافة المكافأة");
    },
  });

  const updateBonus = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BonusInput> }) => {
      const payload = {
        bonusAmount: data.bonusAmount !== undefined ? Number(data.bonusAmount) : undefined,
        bonusReason: data.bonusReason,
        assistanceAmount: data.assistanceAmount !== undefined ? Number(data.assistanceAmount) : undefined,
        period: data.period,
      };
      return await apiClient.put(`/bonuses/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bonuses"], exact: false });
      toast.success("تم تحديث المكافأة");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "فشل تحديث المكافأة");
    },
  });

  const deleteBonus = useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.delete(`/bonuses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bonuses"], exact: false });
      toast.success("تم حذف المكافأة");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "فشل حذف المكافأة");
    },
  });

  return {
    ...bonusesQuery,
    createBonus,
    updateBonus,
    deleteBonus,
  };
};
