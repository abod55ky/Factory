import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import apiClient from "@/lib/api-client";
import { AdjustStockInput, InventoryItem, InventoryItemInput, StockMovement } from "@/types/inventory";
import { QUERY_GC_TIME, QUERY_STALE_TIME } from "@/lib/query-cache";

type InventoryListResponse = {
  products: Array<{
    id: string;
    sku: string;
    name: string;
    category: string;
    reorderLevel?: number;
  }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

type StockBySkuResponse = {
  sku: string;
  stockLevels: Array<{
    quantity: number;
    available: number;
  }>;
};

const toInventoryItem = (product: InventoryListResponse["products"][number], quantity: number): InventoryItem => ({
  id: product.id,
  name: product.name,
  sku: product.sku,
  category: product.category,
  quantity,
  unit: "قطعة",
  minStockLevel: Number(product.reorderLevel || 0),
});

const extractMessage = (error: unknown, fallback: string) => {
  const err = error as { response?: { data?: { message?: string; error?: { message?: string } } } };
  return err?.response?.data?.error?.message || err?.response?.data?.message || fallback;
};

export const useProducts = (params?: { page?: number; limit?: number; search?: string; category?: string; status?: string }) => {
  return useQuery({
    queryKey: ["inventory", "products", params],
    queryFn: async () => {
      const res = await apiClient.get<InventoryListResponse>("/inventory/products", { params });
      const products = Array.isArray(res.data?.products) ? res.data.products : [];

      const stockResponses = await Promise.all(
        products.map(async (product) => {
          try {
            const stockRes = await apiClient.get<StockBySkuResponse>(`/inventory/stock/${product.sku}`);
            const levels = Array.isArray(stockRes.data?.stockLevels) ? stockRes.data.stockLevels : [];
            const quantity = levels.reduce((sum, level) => sum + Number(level.available ?? level.quantity ?? 0), 0);
            return [product.sku, quantity] as const;
          } catch {
            return [product.sku, 0] as const;
          }
        }),
      );

      const quantityBySku = new Map<string, number>(stockResponses);

      return {
        products,
        items: products.map((product) => toInventoryItem(product, quantityBySku.get(product.sku) || 0)),
        pagination: res.data?.pagination,
      };
    },
    staleTime: QUERY_STALE_TIME.STANDARD,
    gcTime: QUERY_GC_TIME.RELAXED,
    placeholderData: keepPreviousData,
  });
};

export const useInventory = (params?: { page?: number; limit?: number; search?: string; category?: string; status?: string }) => {
  const queryClient = useQueryClient();

  const productsQuery = useProducts(params);

  const createItem = useMutation({
    mutationFn: async (payload: InventoryItemInput) => {
      const body = {
        sku: payload.sku,
        name: payload.name,
        category: payload.category,
        unitPrice: Number(payload.unitPrice),
        costPrice: Number(payload.costPrice),
        reorderLevel: Number(payload.reorderLevel),
      };

      return await apiClient.post("/inventory/products", body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"], exact: false });
      toast.success("تمت إضافة الصنف بنجاح");
    },
    onError: (error: unknown) => {
      toast.error(extractMessage(error, "فشل إضافة الصنف"));
    },
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InventoryItemInput> }) => {
      const body = {
        sku: data.sku,
        name: data.name,
        category: data.category,
        unitPrice: data.unitPrice !== undefined ? Number(data.unitPrice) : undefined,
        costPrice: data.costPrice !== undefined ? Number(data.costPrice) : undefined,
        reorderLevel: data.reorderLevel !== undefined ? Number(data.reorderLevel) : undefined,
      };

      return await apiClient.put(`/inventory/products/${id}`, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"], exact: false });
      toast.success("تم تحديث الصنف بنجاح");
    },
    onError: (error: unknown) => {
      toast.error(extractMessage(error, "فشل تحديث الصنف"));
    },
  });

  // NOTE: backend currently has no DELETE /inventory/products/:id endpoint.
  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.delete(`/inventory/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"], exact: false });
      toast.success("تم حذف الصنف");
    },
    onError: (error: unknown) => {
      toast.error(extractMessage(error, "الحذف غير مدعوم حالياً من الخادم"));
    },
  });

  const adjustStock = useMutation({
    mutationFn: async (input: AdjustStockInput) => {
      const quantity = Number(input.quantity || 0);
      const change = input.type === "IN" ? quantity : -quantity;

      const movementPayload = {
        type: input.type,
        quantity,
        date: new Date().toISOString(),
        note: input.note,
      } satisfies StockMovement;

      // Preferred route from frontend contract:
      try {
        return await apiClient.post(`/inventory/${input.productId}/movement`, movementPayload);
      } catch (error: unknown) {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status && status !== 404 && status !== 405) throw error;
      }

      // Fallback to current backend contract:
      const productRes = await apiClient.get(`/inventory/products/${input.productId}`);
      const sku = productRes?.data?.product?.sku;
      if (!sku) {
        throw new Error("تعذر تحديد SKU للصنف المحدد");
      }

      return await apiClient.post("/inventory/stock/adjust", {
        sku,
        location: input.location || "MAIN",
        change,
        reason: input.note || (input.type === "IN" ? "إضافة مخزون" : "صرف مخزون"),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"], exact: false });
      toast.success("تم تعديل المخزون بنجاح");
    },
    onError: (error: unknown) => {
      toast.error(extractMessage(error, "فشل تعديل المخزون"));
    },
  });

  return {
    ...productsQuery,
    createItem,
    updateItem,
    deleteItem,
    adjustStock,
  };
};
