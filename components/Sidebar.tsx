"use client"; // لأننا سنحتاج للتنقل بين الصفحات

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, ClipboardList, 
  Wallet, Box, FileInput, Settings, Factory 
} from 'lucide-react';

const menuItems = [
  { name: 'لوحة التحكم', icon: LayoutDashboard, href: '/home' },
  { name: 'الموظفون', icon: Users, href: '/employees' },
  { name: 'سجل الحضور', icon: ClipboardList, href: '/attendance' },
  { name: 'الرواتب', icon: Wallet, href: '/salaries' },
  { name: 'المخزون', icon: Box, href: '/inventory' },
  { name: 'استيراد البيانات', icon: FileInput, href: '/importData' },
  { name: 'الإعدادات', icon: Settings, href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0f172a] text-slate-300 h-screen sticky top-0 flex flex-col p-4 z-50">
      {/* شعار النظام */}
      <div className="mb-10 px-2">
        <div className="flex items-center gap-2 text-white mt-5 mb-1">
          <Factory size={24} className="text-blue-500" />
          <h1 className="text-xl font-bold">إدارة المصنع</h1>
        </div>
        <p className="text-[10px] text-slate-500 mr-8">نظام إدارة الإنتاج والرواتب</p>
      </div>
      
      {/* الروابط */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
                isActive 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'} />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* ملف المستخدم في الأسفل */}
      <div className="border-t border-slate-800 pt-4 mt-auto">
        <div className="flex items-center gap-3 px-2 py-2 hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">
          <div className="w-9 h-9 rounded-full bg-linear-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold shadow-sm">
            م
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">مدير النظام</p>
            <p className="text-[10px] text-slate-500">مشرف عام</p>
          </div>
        </div>
      </div>
    </aside>
  );
}