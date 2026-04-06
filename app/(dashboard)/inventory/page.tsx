"use client";

import { Plus, Search, Edit, Trash2, Package } from "lucide-react";
import { useProducts } from '@/hooks/useInventory';

export default function InventoryPage() {
  const { data, isLoading } = useProducts();

  // backend returns { products, pagination }
  const products = data?.products || [
    { sku: 'SH-CL-001', name: 'قميص رجالي كلاسيكي', category: 'قمصان', quantity: 150, price: '89 ر.س', value: '13,350 ر.س' },
  ];

  if (isLoading) return <div className="p-8">جاري تحميل بيانات المخزون...</div>;

  return (
    <div className="p-8 bg-[#f9fafb] min-h-screen" dir="rtl">
      <header className="flex justify-between items-start mb-8">
        <div className="text-right">
          <h1 className="text-2xl font-bold text-slate-800">إدارة المخزون</h1>
          <p className="text-slate-500 text-sm mt-1">{products.length} صنف • قيمة إجمالية: —</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all shadow-md active:scale-95">
          <Plus size={20} />
          إضافة صنف
        </button>
      </header>

      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-6 flex items-center justify-start">
        <div className="relative w-full max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="بحث بالاسم أو الفئة أو SKU..." 
            className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="p-4 text-xs font-bold text-slate-500">SKU</th>
              <th className="p-4 text-xs font-bold text-slate-500">المنتج</th>
              <th className="p-4 text-xs font-bold text-slate-500">الفئة</th>
              <th className="p-4 text-xs font-bold text-slate-500 text-center">الكمية</th>
              <th className="p-4 text-xs font-bold text-slate-500">السعر</th>
              <th className="p-4 text-xs font-bold text-slate-500">القيمة</th>
              <th className="p-4 text-xs font-bold text-slate-500 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {products.map((item: any) => (
              <tr key={item.sku || item.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 text-xs text-slate-400 font-mono tracking-tight">{item.sku}</td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                      <Package size={16} className="text-blue-600" />
                    </div>
                    <span className="font-bold text-slate-700 text-sm whitespace-nowrap">{item.name}</span>
                  </div>
                </td>
                <td className="p-4 text-xs text-slate-400">{item.category}</td>
                <td className="p-4 text-sm font-bold text-slate-800 text-center">
                   <span className={item.quantity < 30 ? 'text-orange-500' : 'text-slate-800'}>
                    {item.quantity}
                   </span>
                </td>
                <td className="p-4 text-sm font-medium text-slate-600 tracking-tighter">{item.price || item.unitPrice || '—'}</td>
                <td className="p-4 text-sm font-bold text-slate-800 tracking-tighter">{item.value || '—'}</td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="تعديل">
                      <Edit size={16} />
                    </button>
                    <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="حذف">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}