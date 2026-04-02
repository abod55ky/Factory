"use client";

import { Plus, Search, Edit, Trash2, Package } from "lucide-react";

// بيانات تجريبية مطابقة تماماً للصورة
const inventoryData = [
  { sku: "SH-CL-001", name: "قميص رجالي كلاسيكي", category: "قمصان", quantity: 150, price: "89 ر.س", value: "13,350 ر.س" },
  { sku: "PT-JN-002", name: "بنطلون جينز", category: "بناطيل", quantity: 80, price: "120 ر.س", value: "9,600 ر.س" },
  { sku: "DR-EV-003", name: "فستان سهرة", category: "فساتين", quantity: 25, price: "350 ر.س", value: "8,750 ر.س" },
  { sku: "JK-WN-004", name: "جاكيت شتوي", category: "جاكيتات", quantity: 45, price: "220 ر.س", value: "9,900 ر.س" },
  { sku: "TS-CT-005", name: "تيشيرت قطني", category: "تيشيرتات", quantity: 200, price: "45 ر.س", value: "9,000 ر.س" },
  { sku: "SH-SP-006", name: "حذاء رياضي", category: "أحذية", quantity: 60, price: "180 ر.س", value: "10,800 ر.س" },
  { sku: "AB-WM-007", name: "عباية نسائية", category: "عبايات", quantity: 35, price: "280 ر.س", value: "9,800 ر.س" },
  { sku: "AC-SM-008", name: "شماغ رجالي", category: "إكسسوارات", quantity: 100, price: "65 ر.س", value: "6,500 ر.س" },
];

export default function InventoryPage() {
  return (
    <div className="p-8 bg-[#f9fafb] min-h-screen" dir="rtl">
      
      {/* الهيدر - العنوان وزر الإضافة */}
      <header className="flex justify-between items-start mb-8">
        <div className="text-right">
          <h1 className="text-2xl font-bold text-slate-800">إدارة المخزون</h1>
          <p className="text-slate-500 text-sm mt-1">8 صنف • قيمة إجمالية: 77,700 ر.س</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all shadow-md active:scale-95">
          <Plus size={20} />
          إضافة صنف
        </button>
      </header>

      {/* شريط البحث */}
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

      {/* جدول المخزون */}
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
            {inventoryData.map((item) => (
              <tr key={item.sku} className="hover:bg-slate-50/50 transition-colors">
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
                   {/* تمييز الكميات القليلة لونياً إذا أردت مستقبلاً */}
                   <span className={item.quantity < 30 ? "text-orange-500" : "text-slate-800"}>
                    {item.quantity}
                   </span>
                </td>
                <td className="p-4 text-sm font-medium text-slate-600 tracking-tighter">{item.price}</td>
                <td className="p-4 text-sm font-bold text-slate-800 tracking-tighter">{item.value}</td>
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