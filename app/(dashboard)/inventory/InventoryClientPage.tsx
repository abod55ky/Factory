"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Plus, Search, Edit, ArrowRightLeft, Package2, AlertTriangle, Boxes, Sparkles, Upload, Download, History, Loader2 } from "lucide-react";
import { useInventory } from "@/hooks/useInventory";
import { InventoryItem, InventoryItemInput, AdjustStockInput } from "@/types/inventory";
import { toast } from "react-hot-toast";
import apiClient from "@/lib/api-client";

const AddEditItemModal = dynamic(() => import("@/components/AddEditItemModal"), {
  loading: () => null,
});
const AdjustStockModal = dynamic(() => import("@/components/AdjustStockModal"), {
  loading: () => null,
});

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
  const [searchInput, setSearchInput] = useState("");
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

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(searchInput);
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

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
    <div className="space-y-3 p-6 bg-white/50 rounded-3xl">
      {Array.from({ length: 7 }).map((_, idx) => (
        <div key={idx} className="h-12 rounded-xl bg-slate-200/50 animate-pulse" />
      ))}
    </div>
  );

  const statusBadge = (item: InventoryItem) => {
    if (item.quantity <= item.minStockLevel) {
      return <span className="px-4 py-1.5 rounded-xl text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-100 shadow-sm flex items-center gap-1.5 w-fit mx-auto"><AlertTriangle size={12}/> كمية منخفضة</span>;
    }

    return <span className="px-4 py-1.5 rounded-xl text-[11px] font-bold bg-[#00bba7]/10 text-[#00bba7] border border-[#00bba7]/20 shadow-sm flex items-center gap-1.5 w-fit mx-auto"><Package2 size={12}/> مخزون جيد</span>;
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
    /* الخلفية المتدرجة الأساسية للموقع */
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-gradient-to-br from-[#00bba7] via-[#00bba7]/90 to-[#E7C873]" dir="rtl">
      
      {/* الحاوية الرئيسية (Wrapper) الزجاجية مع البوردر الذهبي */}
      <div className="relative z-10 w-full max-w-7xl min-h-[90vh] bg-white/70 backdrop-blur-3xl rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border-2 border-[#E7C873]/80 flex flex-col overflow-hidden">
        
        {/* المحتوى الداخلي */}
        <div className="p-6 md:p-10 h-full overflow-y-auto custom-scrollbar">
          
          <header className="mb-10 flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-black/5 pb-8 relative">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-gradient-to-br from-[#00bba7] to-[#008275] rounded-2xl shadow-lg shadow-[#00bba7]/20 border border-[#00bba7]/20">
                  <Sparkles size={24} className="text-white animate-bounce" />
                </div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                  مركز إدارة المخزون
                </h1>
              </div>
              <p className="text-slate-500 text-sm font-medium pr-14 mt-1">إدارة الأصناف وحالة المخزون وتنبيهات النقص عبر لوحة تشغيل احترافية.</p>
            </div>

            <div className="mt-4 xl:mt-0 flex flex-wrap items-center gap-3 w-full xl:w-auto">
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
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 disabled:opacity-60 transition-all shadow-sm group"
              >
                <Upload size={16} className="group-hover:-translate-y-1 transition-transform" />
                استيراد CSV
              </button>

              <button
                onClick={handleExportCsv}
                disabled={isLoading || items.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 disabled:opacity-60 transition-all shadow-sm group"
              >
                <Download size={16} className="group-hover:-translate-y-1 transition-transform" />
                تصدير CSV
              </button>

              <button
                onClick={handleDownloadCsvTemplate}
                disabled={pending}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#00bba7]/30 bg-[#00bba7]/10 text-[#00bba7] font-bold text-sm hover:bg-[#00bba7]/20 disabled:opacity-60 transition-all shadow-sm group"
              >
                <Download size={16} className="group-hover:-translate-y-1 transition-transform" />
                تحميل قالب CSV
              </button>
            </div>
          </header>

          {/* كروت الإحصائيات */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-md border border-white/80 rounded-[2rem] p-7 shadow-[0_15px_30px_rgba(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-1 transition-all group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-[#00bba7]/10 rounded-xl border border-[#00bba7]/20">
                  <Boxes className="text-[#00bba7] group-hover:animate-pulse" size={22}/>
                </div>
                <p className="font-extrabold text-slate-600 text-sm">إجمالي الأصناف</p>
              </div>
              <p className="text-4xl font-black text-[#00bba7]">{items.length}</p>
            </div>

            <div className="bg-white/80 backdrop-blur-md border border-white/80 rounded-[2rem] p-7 shadow-[0_15px_30px_rgba(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-1 transition-all group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-[#E7C873]/10 rounded-xl border border-[#E7C873]/20">
                  <Package2 className="text-[#E7C873] group-hover:animate-pulse" size={22}/>
                </div>
                <p className="font-extrabold text-slate-600 text-sm">إجمالي الكمية المتاحة</p>
              </div>
              <p className="text-4xl font-black text-slate-800">{totalQuantity.toLocaleString()}</p>
            </div>

            <div className="bg-rose-50/80 backdrop-blur-md border border-rose-100 rounded-[2rem] p-7 shadow-[0_15px_30px_rgba(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-1 transition-all group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-rose-100 rounded-xl border border-rose-200">
                  <AlertTriangle className="text-rose-600 group-hover:animate-pulse" size={22}/>
                </div>
                <p className="font-extrabold text-rose-600 text-sm">تنبيهات المخزون المنخفض</p>
              </div>
              <p className="text-4xl font-black text-rose-600">{lowStockCount}</p>
            </div>
          </div>

          {/* شريط البحث والفلترة الزجاجي */}
          <div className="bg-white/80 backdrop-blur-md border border-white/80 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative group">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[#E7C873] group-hover:animate-pulse" size={18} />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="ابحث باسم الصنف أو SKU..."
                  className="w-full pr-12 pl-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00bba7]/40 focus:border-[#00bba7] transition-all shadow-sm"
                />
              </div>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full py-3.5 px-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00bba7]/40 focus:border-[#00bba7] transition-all shadow-sm cursor-pointer appearance-none"
              >
                <option value="all">كل الفئات</option>
                {categories.filter((c) => c !== "all").map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* جدول الأصناف */}
          <div className="bg-white rounded-[2.5rem] shadow-[0_25px_50px_rgba(0,0,0,0.05)] border border-white/80 overflow-hidden mb-10">
            {isLoading ? (
              <SkeletonTable />
            ) : (
            <div className="w-full overflow-x-auto custom-scrollbar">
              <table className="w-full text-right border-collapse min-w-245">
                <thead className="bg-slate-50/80 border-b border-slate-100/80">
                  <tr>
                    <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">اسم الصنف</th>
                    <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">SKU / الباركود</th>
                    <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">الفئة</th>
                    <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">الكمية في المخزون</th>
                    <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">الوحدة</th>
                    <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">الحالة</th>
                    <th className="p-5 text-[#00bba7] font-black text-xs uppercase tracking-wider text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-16 text-center text-slate-500 font-medium">لا توجد بيانات مطابقة لنتائج البحث الحالية</td>
                    </tr>
                  ) : (
                    items.map((item) => (
                    <tr
                      key={item.id}
                      className={`group transition-colors ${
                        item.quantity <= item.minStockLevel ? "bg-rose-50/40 hover:bg-rose-50/80" : "hover:bg-[#00bba7]/[0.02]"
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-inner border ${item.quantity <= item.minStockLevel ? 'bg-rose-100 border-rose-200' : 'bg-slate-50 border-slate-100'}`}>
                            <Package2 size={16} className={item.quantity <= item.minStockLevel ? 'text-rose-500' : 'text-[#00bba7]'} />
                          </div>
                          <span className="font-bold text-slate-800 text-sm whitespace-nowrap group-hover:text-[#00bba7] transition-colors">{item.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center text-xs text-slate-500 font-mono tracking-wider">{item.sku}</td>
                      <td className="p-4 text-xs font-bold text-slate-500 text-center">{item.category}</td>
                      <td className="p-4 text-base font-black text-slate-800 text-center">{Number(item.quantity || 0).toLocaleString()}</td>
                      <td className="p-4 text-center text-xs font-bold text-slate-600">{item.unit}</td>
                      <td className="p-4 text-center">
                        {statusBadge(item)}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setIsItemModalOpen(true);
                            }}
                            className="p-2.5 text-[#E7C873] hover:bg-[#E7C873]/10 rounded-xl transition-all hover:scale-110"
                            title="تعديل الصنف"
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setIsStockModalOpen(true);
                            }}
                            className="p-2.5 text-[#00bba7] hover:bg-[#00bba7]/10 rounded-xl transition-all hover:scale-110"
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

          {/* جدول آخر حركات المخزون */}
          <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-[0_15px_30px_rgba(0,0,0,0.04)] border border-white/80 overflow-hidden mt-10">
            <div className="p-6 border-b border-slate-100/80 flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-3">
                <History size={20} className="text-[#E7C873] animate-pulse" />
                آخر حركات المخزون
              </h2>
              <span className="text-xs font-bold text-[#00bba7] bg-[#00bba7]/10 px-3 py-1 rounded-lg">{movementHistory.length} حركة</span>
            </div>

            {movementHistory.length === 0 ? (
              <p className="p-12 text-center text-sm font-bold text-slate-400">لا توجد حركات حتى الآن. ستظهر الحركات اليدوية والاستيراد الجماعي هنا.</p>
            ) : (
              <div className="w-full overflow-x-auto custom-scrollbar">
                <table className="w-full text-right min-w-245">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="p-4 text-xs font-extrabold text-[#00bba7] uppercase tracking-wider text-center">الصنف</th>
                      <th className="p-4 text-xs font-extrabold text-[#00bba7] uppercase tracking-wider text-center">SKU</th>
                      <th className="p-4 text-xs font-extrabold text-[#00bba7] uppercase tracking-wider text-center">النوع</th>
                      <th className="p-4 text-xs font-extrabold text-[#00bba7] uppercase tracking-wider text-center">الكمية</th>
                      <th className="p-4 text-xs font-extrabold text-[#00bba7] uppercase tracking-wider text-center">الموقع</th>
                      <th className="p-4 text-xs font-extrabold text-[#00bba7] uppercase tracking-wider text-center">المصدر</th>
                      <th className="p-4 text-xs font-extrabold text-[#00bba7] uppercase tracking-wider text-center">التاريخ</th>
                      <th className="p-4 text-xs font-extrabold text-[#00bba7] uppercase tracking-wider text-center">ملاحظة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {movementHistory.map((entry) => (
                      <tr key={entry.id} className="hover:bg-white transition-colors">
                        <td className="p-4 text-sm font-bold text-slate-700 text-center whitespace-nowrap">{entry.itemName}</td>
                        <td className="p-4 text-xs text-slate-500 text-center font-mono">{entry.sku}</td>
                        <td className="p-4 text-center">
                          <span className={`px-3 py-1 rounded-xl text-[10px] font-bold border shadow-sm ${entry.type === "IN" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-orange-50 text-orange-600 border-orange-100"}`}>
                            {entry.type === "IN" ? "إضافة" : "صرف"}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-center font-black text-slate-800">{entry.quantity}</td>
                        <td className="p-4 text-xs text-center font-bold text-slate-600">{entry.location}</td>
                        <td className="p-4 text-xs text-center font-bold text-slate-600">{entry.source === "MANUAL" ? "يدوي" : "استيراد"}</td>
                        <td className="p-4 text-xs text-center font-mono text-slate-500">{new Date(entry.createdAt).toLocaleString("ar-EG")}</td>
                        <td className="p-4 text-xs text-center text-slate-600">{entry.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* الأزرار العائمة والمودال */}
          <button
            onClick={() => {
              setSelectedItem(null);
              setIsItemModalOpen(true);
            }}
            className="fixed bottom-8 left-8 z-40 rounded-full w-14 h-14 bg-gradient-to-br from-[#00bba7] to-[#008275] text-white shadow-[0_10px_30px_rgba(0,187,167,0.4)] hover:scale-110 active:scale-95 transition-all flex items-center justify-center border border-[#00bba7]/50 group"
            title="إضافة صنف جديد"
          >
            <Plus size={26} className="group-hover:animate-spin" />
          </button>

          {isItemModalOpen ? (
            <AddEditItemModal
              key={`${isItemModalOpen}-${selectedItem?.id ?? "new"}`}
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
          ) : null}

          {isStockModalOpen ? (
            <AdjustStockModal
              key={`${isStockModalOpen}-${selectedItem?.id ?? "new"}`}
              isOpen={isStockModalOpen}
              onClose={() => {
                setIsStockModalOpen(false);
                setSelectedItem(null);
              }}
              item={selectedItem}
              isPending={adjustStock.isPending}
              onSave={handleAdjustStock}
            />
          ) : null}

          {/* تنبيه الحفظ (Loading Toaster) */}
          {pending && (
            <div className="fixed bottom-6 right-6 z-40 rounded-2xl border border-white/60 bg-white/85 backdrop-blur-md px-5 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.1)] flex items-center gap-3">
              <Loader2 className="animate-spin text-[#00bba7]" size={18} />
              <p className="text-sm font-bold text-slate-700">
                جارٍ تنفيذ العملية...
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}