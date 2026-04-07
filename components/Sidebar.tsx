"use client"; // لأننا سنحتاج للتنقل بين الصفحات

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Users, ClipboardList, 
  Wallet, Box, FileInput, Settings, Factory, LogOut
} from 'lucide-react';
import { resetAuthVerificationCache } from '@/lib/auth-verify';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

const menuItems = [
  { name: 'لوحة التحكم', icon: LayoutDashboard, href: '/home' },
  { name: 'الموظفون', icon: Users, href: '/employees', roles: ['admin', 'hr', 'manager'] },
  { name: 'سجل الحضور', icon: ClipboardList, href: '/attendance', roles: ['admin', 'hr', 'manager'] },
  { name: 'الرواتب', icon: Wallet, href: '/salaries', roles: ['admin', 'finance', 'manager'] },
  { name: 'المخزون', icon: Box, href: '/inventory', roles: ['admin', 'warehouse', 'manager'] },
  { name: 'استيراد البيانات', icon: FileInput, href: '/importData', roles: ['admin', 'manager'] },
  { name: 'الإعدادات', icon: Settings, href: '/settings', roles: ['admin'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const clear = useAuthStore((state) => state.clear);
  const hasAnyRole = useAuthStore((state) => state.hasAnyRole);
  const displayName = currentUser?.name || currentUser?.username || 'مدير النظام';
  const displayRole = currentUser?.role || 'مشرف عام';
  const visibleMenuItems = menuItems.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    return hasAnyRole(item.roles);
  });

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Continue local cleanup even if backend has no logout endpoint.
    }

    clear();
    resetAuthVerificationCache();
    router.replace('/login');
  };

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
        {visibleMenuItems.map((item) => {
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
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <div className="w-9 h-9 rounded-full bg-linear-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold shadow-sm">
            {displayName.slice(0, 1)}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-medium text-white truncate">{displayName}</p>
            <p className="text-[10px] text-slate-500 truncate">{displayRole}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="تسجيل الخروج"
            aria-label="تسجيل الخروج"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}