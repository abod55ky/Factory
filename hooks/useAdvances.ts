import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import apiClient from "@/lib/api-client";
import { Advance, AdvanceInput } from "@/types/advance";

export const useAdvances = (employeeId?: string) => {
  const queryClient = useQueryClient();

  const advancesQuery = useQuery<Advance[]>({
    queryKey: ["advances", employeeId || "all"],
    queryFn: async () => {
      const res = await apiClient.get("/advances", { params: { employeeId } });
      return Array.isArray(res.data) ? res.data : [];
    },
    staleTime: 1000 * 30,
  });

  const createAdvance = useMutation({
    mutationFn: async (payload: AdvanceInput) => {
      const data = {
        employeeId: payload.employeeId,
        advanceType: payload.advanceType || "salary",
        totalAmount: Number(payload.totalAmount),
        installmentAmount: Number(payload.installmentAmount || 0),
        notes: payload.notes,
      };
      return await apiClient.post("/advances", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advances"], exact: false });
      toast.success("تمت إضافة السلفة بنجاح");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "فشل إضافة السلفة");
    },
  });

  const updateAdvance = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AdvanceInput> }) => {
      const payload = {
        remainingAmount: data.remainingAmount !== undefined ? Number(data.remainingAmount) : undefined,
        installmentAmount: data.installmentAmount !== undefined ? Number(data.installmentAmount) : undefined,
        notes: data.notes,
      };
      return await apiClient.put(`/advances/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advances"], exact: false });
      toast.success("تم تحديث السلفة");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "فشل تحديث السلفة");
    },
  });

  const deleteAdvance = useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.delete(`/advances/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advances"], exact: false });
      toast.success("تم حذف السلفة");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "فشل حذف السلفة");
    },
  });

  return {
    ...advancesQuery,
    createAdvance,
    updateAdvance,
    deleteAdvance,
  };
};
