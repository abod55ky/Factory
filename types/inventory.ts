export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unit: string;
  minStockLevel: number;
}

export interface StockMovement {
  type: "IN" | "OUT";
  quantity: number;
  date: string;
  note?: string;
}

export interface InventoryItemInput {
  sku: string;
  name: string;
  category: string;
  unitPrice: number | string;
  costPrice: number | string;
  reorderLevel: number | string;
  unit?: string;
}

export interface AdjustStockInput {
  productId: string;
  type: "IN" | "OUT";
  quantity: number | string;
  note: string;
  location?: string;
}

