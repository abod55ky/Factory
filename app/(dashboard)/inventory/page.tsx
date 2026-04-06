"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Search, Edit, ArrowRightLeft, Package2, AlertTriangle, Boxes, Sparkles, Upload, Download, History } from "lucide-react";
import { useInventory } from "@/hooks/useInventory";
import { InventoryItem, InventoryItemInput, AdjustStockInput } from "@/types/inventory";
import { toast } from "react-hot-toast";
import AddEditItemModal from "@/components/AddEditItemModal";
import AdjustStockModal from "@/components/AdjustStockModal";
import apiClient from "@/lib/api-client";

type MovementLogEntry = {
  id: string;
  itemName: string;
  sku: string;
  type: "IN" | "OUT";
  quantity: number;
  location: string;
  note: string;
  source: "MANUAL" | "BULK_IMPORT";
  createdAt: string;
};

const MOVEMENT_HISTORY_STORAGE_KEY = "inventory:movement-history:v1";

const parseCsvLine = (line: string): string[] => {
  const out: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      out.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  out.push(current.trim());
  return out;
};

const escapeCsvCell = (value: string | number) => {
  const text = String(value ?? "");
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isBulkPending, setIsBulkPending] = useState(false);
  const [movementHistory, setMovementHistory] = useState<MovementLogEntry[]>([]);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const { data, isLoading, createItem, updateItem, adjustStock, refetch } = useInventory({
    page: 1,
    limit: 100,
    search: search.trim() || undefined,
    category: category === "all" ? undefined : category,
  });

  const items: InventoryItem[] = useMemo(() => data?.items || [], [data?.items]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => item.category && set.add(item.category));
    return ["all", ...Array.from(set)];
  }, [items]);

  const lowStockCount = useMemo(
    () => items.filter((item) => item.quantity <= item.minStockLevel).length,
    [items],
  );

  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [items],
  );

  const SkeletonTable = () => (
    <div className="space-y-3 p-6">
      {Array.from({ length: 7 }).map((_, idx) => (
        <div key={idx} className="h-12 rounded-xl bg-slate-100 animate-pulse" />
      ))}
    </div>
  );

  const statusBadge = (item: InventoryItem) => {
    if (item.quantity <= item.minStockLevel) {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">كمية منخفضة</span>;
    }

    return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">مخزون جيد</span>;
  };

  const pending = isBulkPending || createItem.isPending || updateItem.isPending || adjustStock.isPending;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(MOVEMENT_HISTORY_STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as MovementLogEntry[];
      if (!Array.isArray(parsed)) return;

      setMovementHistory(parsed.slice(0, 25));
    } catch {
      localStorage.removeItem(MOVEMENT_HISTORY_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(MOVEMENT_HISTORY_STORAGE_KEY, JSON.stringify(movementHistory));
  }, [movementHistory]);

  const addMovementEntry = (entry: Omit<MovementLogEntry, "id" | "createdAt">) => {
    const now = new Date().toISOString();
    setMovementHistory((prev) => [
      {
        id: `${entry.sku}-${now}`,
        createdAt: now,
        ...entry,
      },
      ...prev,
    ].slice(0, 25));
  };

  const extractMessage = (error: unknown, fallback: string) => {
    const err = error as { response?: { data?: { message?: string; error?: { message?: string } } } };
    return err?.response?.data?.error?.message || err?.response?.data?.message || fallback;
  };

  const handleExportCsv = () => {
    if (items.length === 0) {
      toast("لا توجد بيانات لتصديرها", { icon: "ℹ️" });
      return;
    }

    const headers = ["sku", "name", "category", "unit", "quantity", "reorderLevel"];
    const rows = items.map((item) => [
      item.sku,
      item.name,
      item.category,
      item.unit,
      Number(item.quantity || 0),
      Number(item.minStockLevel || 0),
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.map((cell) => escapeCsvCell(cell)).join(","))].join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    link.href = URL.createObjectURL(blob);
    link.download = `inventory-export-${date}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    toast.success("تم تصدير البيانات بنجاح");
  };

  const handleDownloadCsvTemplate = () => {
    const headers = ["sku", "name", "category", "unitPrice", "costPrice", "reorderLevel"];
    const examples = [
      ["RAW-MAT-001", "خامة بلاستيك", "خامات", 25, 18, 50],
      ["PKG-BOX-010", "صندوق تعبئة كبير", "تغليف", 4.5, 2.75, 120],
    ];

    const csv = [headers.join(","), ...examples.map((row) => row.map((cell) => escapeCsvCell(cell)).join(","))].join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = "inventory-import-template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    toast.success("تم تنزيل قالب CSV");
  };

  const handleImportCsv = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsBulkPending(true);
    try {
      const text = await file.text();
      const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

      if (lines.length < 2) {
        throw new Error("ملف CSV لا يحتوي على بيانات كافية");
      }

      const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/^\uFEFF/, "").trim());
      const requiredHeaders = ["sku", "name", "category", "unitprice", "costprice", "reorderlevel"];
      const missing = requiredHeaders.filter((key) => !headers.includes(key));

      if (missing.length > 0) {
        throw new Error(`أعمدة مفقودة: ${missing.join(", ")}`);
      }

      const idx = (key: string) => headers.indexOf(key);
      const existingBySku = new Map(items.map((item) => [item.sku.toLowerCase(), item]));
      let created = 0;
      let updated = 0;
      let failed = 0;

      for (let i = 1; i < lines.length; i++) {
        const cols = parseCsvLine(lines[i]);
        const sku = (cols[idx("sku")] || "").trim();
        const name = (cols[idx("name")] || "").trim();
        const categoryValue = (cols[idx("category")] || "").trim();
        const unitPrice = Number(cols[idx("unitprice")] || 0);
        const costPrice = Number(cols[idx("costprice")] || 0);
        const reorderLevel = Number(cols[idx("reorderlevel")] || 0);

        if (!sku || !name || !categoryValue) {
          failed++;
          continue;
        }

        try {
          const payload = {
            sku,
            name,
            category: categoryValue,
            unitPrice,
            costPrice,
            reorderLevel,
          };

          const existing = existingBySku.get(sku.toLowerCase());
          if (existing) {
            await apiClient.put(`/inventory/products/${existing.id}`, payload);
            updated++;
          } else {
            await apiClient.post("/inventory/products", payload);
            created++;
          }
        } catch {
          failed++;
        }
      }

      await refetch();

      addMovementEntry({
        itemName: "استيراد جماعي",
        sku: "BULK-CSV",
        type: "IN",
        quantity: created + updated,
        location: "MAIN",
        note: `استيراد CSV: مضاف ${created} | محدث ${updated} | فشل ${failed}`,
        source: "BULK_IMPORT",
      });

      if (failed > 0) {
        toast(`تم الاستيراد مع بعض الأخطاء: مضاف ${created} | محدث ${updated} | فشل ${failed}`, { icon: "⚠️" });
      } else {
        toast.success(`تم الاستيراد بنجاح: مضاف ${created} | محدث ${updated}`);
      }
    } catch (error) {
      toast.error(extractMessage(error, "فشل استيراد ملف CSV"));
    } finally {
      setIsBulkPending(false);
      if (importInputRef.current) {
        importInputRef.current.value = "";
      }
    }
  };

  const handleSaveItem = (payload: InventoryItemInput) => {
    if (selectedItem) {
      updateItem.mutate(
        {
          id: selectedItem.id,
          data: payload,
        },
        {
          onSuccess: () => {
            setIsItemModalOpen(false);
            setSelectedItem(null);
          },
        },
      );
      return;
    }

    createItem.mutate(payload, {
      onSuccess: () => {
        setIsItemModalOpen(false);
      },
    });
  };

  const handleAdjustStock = (input: AdjustStockInput) => {
    const currentItem = selectedItem;
    adjustStock.mutate(input, {
      onSuccess: () => {
        if (currentItem) {
          addMovementEntry({
            itemName: currentItem.name,
            sku: currentItem.sku,
            type: input.type,
            quantity: Number(input.quantity || 0),
            location: input.location || "MAIN",
            note: input.note || (input.type === "IN" ? "إضافة مخزون" : "صرف مخزون"),
            source: "MANUAL",
          });
        }
        setIsStockModalOpen(false);
        setSelectedItem(null);
      },
    });
  };

  return (
    <div className="min-h-screen p-8 bg-[radial-gradient(circle_at_10%_20%,rgba(59,130,246,0.13),transparent_36%),radial-gradient(circle_at_90%_15%,rgba(16,185,129,0.12),transparent_35%),#f8fafc]" dir="rtl">
      <header className="mb-6 rounded-3xl border border-white/40 bg-white/70 backdrop-blur-xl shadow-[0_10px_40px_-25px_rgba(15,23,42,0.35)] p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              <Sparkles className="text-blue-600" />
              مركز إدارة المخزون
            </h1>
            <p className="text-sm text-slate-500 mt-2">إدارة الأصناف وحالة المخزون وتنبيهات النقص عبر لوحة تشغيل احترافية.</p>
          </div>

          <button
            onClick={() => {
              setSelectedItem(null);
              setIsItemModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all shadow-md active:scale-95"
          >
            <Plus size={20} />
            إضافة صنف جديد
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <input
            ref={importInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleImportCsv}
            className="hidden"
          />

          <button
            onClick={() => importInputRef.current?.click()}
            disabled={pending}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-all shadow-sm active:scale-95"
          >
            <Upload size={16} />
            استيراد CSV
          </button>

          <button
            onClick={handleExportCsv}
            disabled={isLoading || items.length === 0}
            className="bg-white hover:bg-slate-50 border border-slate-200 disabled:opacity-60 disabled:cursor-not-allowed text-slate-700 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-all active:scale-95"
          >
            <Download size={16} />
            تصدير CSV
          </button>

          <button
            onClick={handleDownloadCsvTemplate}
            disabled={pending}
            className="bg-white hover:bg-slate-50 border border-slate-200 disabled:opacity-60 disabled:cursor-not-allowed text-slate-700 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-all active:scale-95"
          >
            <Download size={16} />
            تحميل قالب CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">إجمالي الأصناف</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 flex items-center gap-2"><Boxes size={20} /> {items.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">إجمالي الكمية المتاحة</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{totalQuantity.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-xs text-red-600">تنبيهات المخزون المنخفض</p>
            <p className="mt-1 text-2xl font-bold text-red-700 flex items-center gap-2"><AlertTriangle size={20} /> {lowStockCount}</p>
          </div>
        </div>
      </header>

      <div className="rounded-2xl border border-white/50 bg-white/80 backdrop-blur-sm p-4 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث باسم الصنف أو SKU..."
              className="w-full pr-10 pl-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
          >
            <option value="all">كل الفئات</option>
            {categories.filter((c) => c !== "all").map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white/85 backdrop-blur border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <SkeletonTable />
        ) : (
        <div className="w-full overflow-x-auto">
        <table className="w-full text-right border-collapse min-w-245">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="p-4 text-xs font-bold text-slate-500 text-center">اسم الصنف</th>
              <th className="p-4 text-xs font-bold text-slate-500 text-center">SKU / الباركود</th>
              <th className="p-4 text-xs font-bold text-slate-500 text-center">الفئة</th>
              <th className="p-4 text-xs font-bold text-slate-500 text-center">الكمية في المخزون</th>
              <th className="p-4 text-xs font-bold text-slate-500 text-center">الوحدة</th>
              <th className="p-4 text-xs font-bold text-slate-500 text-center">الحالة</th>
              <th className="p-4 text-xs font-bold text-slate-500 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">لا توجد بيانات مطابقة لنتائج البحث الحالية</td>
              </tr>
            ) : (
              items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
                      <Package2 size={16} className="text-blue-600" />
                    </div>
                    <span className="font-bold text-slate-700 text-sm whitespace-nowrap">{item.name}</span>
                  </div>
                </td>
                <td className="p-4 text-center text-xs text-slate-400 font-mono tracking-tight">{item.sku}</td>
                <td className="p-4 text-xs text-slate-500 text-center">{item.category}</td>
                <td className="p-4 text-sm font-bold text-slate-800 text-center">{Number(item.quantity || 0).toLocaleString()}</td>
                <td className="p-4 text-center text-sm text-slate-600">{item.unit}</td>
                <td className="p-4 text-center">
                  {statusBadge(item)}
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setIsItemModalOpen(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors active:scale-95"
                      title="تعديل"
                    >
                      <Edit size={16} />
                    </button>

                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setIsStockModalOpen(true);
                      }}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors active:scale-95"
                      title="حركة مخزون"
                    >
                      <ArrowRightLeft size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))) }
          </tbody>
        </table>
        </div>
        )}
      </div>

      <div className="mt-6 bg-white/85 backdrop-blur border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm md:text-base font-extrabold text-slate-800 flex items-center gap-2">
            <History size={18} className="text-indigo-600" />
            آخر حركات المخزون
          </h2>
          <span className="text-xs text-slate-500">{movementHistory.length} حركة</span>
        </div>

        {movementHistory.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">لا توجد حركات حتى الآن. ستظهر الحركات اليدوية والاستيراد الجماعي هنا.</p>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-right min-w-245">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100">
                  <th className="p-3 text-xs font-bold text-slate-500 text-center">الصنف</th>
                  <th className="p-3 text-xs font-bold text-slate-500 text-center">SKU</th>
                  <th className="p-3 text-xs font-bold text-slate-500 text-center">النوع</th>
                  <th className="p-3 text-xs font-bold text-slate-500 text-center">الكمية</th>
                  <th className="p-3 text-xs font-bold text-slate-500 text-center">الموقع</th>
                  <th className="p-3 text-xs font-bold text-slate-500 text-center">المصدر</th>
                  <th className="p-3 text-xs font-bold text-slate-500 text-center">التاريخ</th>
                  <th className="p-3 text-xs font-bold text-slate-500 text-center">ملاحظة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {movementHistory.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-sm font-semibold text-slate-700 text-center whitespace-nowrap">{entry.itemName}</td>
                    <td className="p-3 text-xs text-slate-500 text-center font-mono">{entry.sku}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${entry.type === "IN" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {entry.type === "IN" ? "إضافة" : "صرف"}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-center font-bold text-slate-800">{entry.quantity}</td>
                    <td className="p-3 text-xs text-center text-slate-600">{entry.location}</td>
                    <td className="p-3 text-xs text-center text-slate-600">{entry.source === "MANUAL" ? "يدوي" : "استيراد"}</td>
                    <td className="p-3 text-xs text-center text-slate-500">{new Date(entry.createdAt).toLocaleString("ar-EG")}</td>
                    <td className="p-3 text-xs text-center text-slate-600">{entry.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddEditItemModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setSelectedItem(null);
        }}
        isPending={createItem.isPending || updateItem.isPending}
        initialData={
          selectedItem
            ? {
                id: selectedItem.id,
                sku: selectedItem.sku,
                name: selectedItem.name,
                category: selectedItem.category,
                reorderLevel: selectedItem.minStockLevel,
                unit: selectedItem.unit,
                unitPrice: 0,
                costPrice: 0,
              }
            : null
        }
        onSave={handleSaveItem}
      />

      <AdjustStockModal
        isOpen={isStockModalOpen}
        onClose={() => {
          setIsStockModalOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        isPending={adjustStock.isPending}
        onSave={handleAdjustStock}
      />

      {pending && (
        <div className="fixed bottom-6 left-6 z-40 rounded-2xl border border-white/60 bg-white/85 backdrop-blur px-4 py-3 shadow-lg">
          <p className="text-sm font-bold text-slate-700">جارٍ تنفيذ العملية...</p>
        </div>
      )}
    </div>
  );
}