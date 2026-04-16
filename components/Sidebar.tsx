"use client";

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, ClipboardList,
  Wallet, Box, FileInput, Settings, Fingerprint,
  ChevronDown, LogOut, Hexagon,
  ChevronsRight, UserMinus
} from 'lucide-react';

import { useAuthStore } from '@/stores/auth-store';
import { resetAuthVerificationCache } from '@/lib/auth-verify';
import apiClient from '@/lib/api-client';

const menuItems = [
  { name: 'الرئيسية: إحصائيات', icon: LayoutDashboard, href: '/home' },
  { name: 'إدارة الموظفين', icon: Users, href: '/employees', roles: ['admin', 'hr', 'manager'] },
  { name: 'المستقيلون', icon: UserMinus, href: '/resigned', roles: ['admin', 'hr', 'manager'] },
  { name: 'سجل الحضور', icon: ClipboardList, href: '/attendance', roles: ['admin', 'hr', 'manager'] },
  {
    name: 'الرواتب', icon: Wallet, roles: ['admin', 'finance', 'manager'],
    subItems: [
      { name: 'إعدادات الرواتب', href: '/salaries' },
      { name: 'السلف', href: '/salaries/advances' },
      { name: 'المكافآت والخصومات', href: '/salaries/bonuses' },
      { name: 'مسير الرواتب', href: '/salaries/payroll' },
    ]
  },
  { name: 'بصمتي وحضوري', icon: Fingerprint, href: '/biometric' },
  { name: 'مخزن الشغل', icon: Box, href: '/inventory', roles: ['admin', 'warehouse', 'manager'] },
  { name: 'استيراد البيانات', icon: FileInput, href: '/importData', roles: ['admin', 'manager'] },
  { name: 'الإعدادات', icon: Settings, href: '/settings', roles: ['admin'] },
];

function useIsHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const isHydrated = useIsHydrated();

  const currentUser = useAuthStore((state) => state.user);
  const clear = useAuthStore((state) => state.clear);
  const hasAnyRole = useAuthStore((state) => state.hasAnyRole);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const displayName = currentUser?.name || currentUser?.username || 'مدير النظام';
  const displayRole = currentUser?.role || 'مشرف عام';

  const visibleMenuItems = menuItems.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    if (!isHydrated) return false;
    return hasAnyRole(item.roles);
  });

  const activeSubMenu = menuItems.find(item =>
    item.subItems?.some(sub => pathname.startsWith(sub.href))
  )?.name;

  const toggleSubMenu = (menuName: string) => {
    if (isCollapsed) setIsCollapsed(false);
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  const handleLogout = async () => {
    try { await apiClient.post('/auth/logout'); } catch {}
    clear();
    resetAuthVerificationCache();
    router.replace('/login');
  };

  return (
    <div className="h-screen sticky top-0 flex bg-slate-50 font-sans" dir="rtl">
      <aside
        className={`relative h-full bg-white/70 backdrop-blur-2xl border-y border-l border-white/80 shadow-[0_20px_60px_-15px_rgba(0,187,167,0.15)] rounded-l-4xl flex flex-col transition-all duration-500 ease-out z-50
          ${isCollapsed ? 'w-24' : 'w-72'}
        `}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -left-4 top-10 bg-white border border-slate-100 shadow-lg shadow-[#00bba7]/10 p-2 rounded-full text-[#E7C873] hover:text-[#00bba7] hover:scale-110 transition-all duration-300 z-50 group"
          aria-label="Toggle Sidebar"
        >
          <ChevronsRight size={18} className={`transition-transform duration-500 ease-out ${isCollapsed ? 'rotate-180 text-[#00bba7]' : ''}`} />
        </button>

        <div className="flex items-center gap-4 p-6 mb-4">
          <div className="relative group shrink-0">
            <div className="absolute inset-0 bg-[#00bba7] blur-md opacity-30 group-hover:opacity-60 transition-opacity duration-300 rounded-xl" />
            <div className="relative bg-linear-to-br from-[#00bba7] to-[#009485] p-2.5 rounded-xl shadow-md border border-white/20">
              <Hexagon size={26} className="fill-[#E7C873] text-[#E7C873] animate-[spin_10s_linear_infinite]" style={{ animationPlayState: 'paused' }} onMouseEnter={(e) => e.currentTarget.style.animationPlayState = 'running'} onMouseLeave={(e) => e.currentTarget.style.animationPlayState = 'paused'} />
            </div>
          </div>
          <div className={`overflow-hidden transition-all duration-500 ease-out ${isCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100'}`}>
            <h1 className="text-2xl font-black bg-linear-to-l from-slate-800 to-slate-500 bg-clip-text text-transparent tracking-tight">BookS</h1>
            <p className="text-[10px] font-bold text-[#00bba7] uppercase tracking-widest mt-0.5">Clothes Factory</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-4 pb-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {visibleMenuItems.map((item) => {
            const hasSubItems = !!item.subItems;
            const isMainActive = (item.href && pathname.startsWith(item.href)) || 
                                 (hasSubItems && item.subItems?.some(sub => pathname.startsWith(sub.href)));
            const isOpen = openMenu === item.name || activeSubMenu === item.name;

            return (
              <div key={item.name} className="relative">
                <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-1.5 bg-[#E7C873] rounded-l-full shadow-[0_0_12px_rgba(231,200,115,0.8)] transition-all duration-500 z-10 ${isMainActive ? 'h-8 opacity-100' : 'h-0 opacity-0'}`} />

                {hasSubItems ? (
                  <button
                    onClick={() => toggleSubMenu(item.name)}
                    className={`w-full flex items-center justify-between py-2.5 px-4 rounded-xl transition-all duration-300 group relative overflow-hidden
                      ${isMainActive || isOpen ? 'bg-linear-to-l from-[#00bba7]/10 to-transparent' : 'hover:bg-slate-50/80'}
                    `}
                  >
                    <div className="flex items-center gap-3 relative z-10">
                      <div className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center
                        ${isMainActive || isOpen 
                          ? 'bg-[#00bba7] text-[#E7C873] shadow-md shadow-[#00bba7]/30' 
                          : 'bg-slate-100 text-[#E7C873] group-hover:bg-[#E7C873]/10'}
                      `}>
                        <item.icon 
                          size={20} 
                          strokeWidth={isMainActive ? 2.5 : 2} 
                          className="transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3" 
                        />
                      </div>
                      {!isCollapsed && (
                        <span className={`text-sm transition-all duration-300 ${isMainActive || isOpen ? 'font-bold text-[#00bba7]' : 'font-semibold text-slate-500 group-hover:text-slate-800'}`}>
                          {item.name}
                        </span>
                      )}
                    </div>
                    {!isCollapsed && (
                      <ChevronDown size={18} className={`transition-transform duration-300 ${isOpen ? 'text-[#00bba7] rotate-180' : 'text-[#E7C873]/70 group-hover:text-[#E7C873] group-hover:translate-y-0.5'}`} />
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href || '#'}
                    onClick={() => setOpenMenu(null)}
                    className={`flex items-center gap-3 py-2.5 px-4 rounded-xl transition-all duration-300 group relative overflow-hidden
                      ${isMainActive ? 'bg-linear-to-l from-[#00bba7]/10 to-transparent' : 'hover:bg-slate-50/80'}
                    `}
                  >
                    <div className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center
                      ${isMainActive 
                        ? 'bg-[#00bba7] text-[#E7C873] shadow-md shadow-[#00bba7]/30' 
                        : 'bg-slate-100 text-[#E7C873] group-hover:bg-[#E7C873]/10'}
                    `}>
                      <item.icon 
                        size={20} 
                        strokeWidth={isMainActive ? 2.5 : 2} 
                        className="transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3" 
                      />
                    </div>
                    {!isCollapsed && (
                      <span className={`text-sm transition-all duration-300 ${isMainActive ? 'font-bold text-[#00bba7]' : 'font-semibold text-slate-500 group-hover:text-slate-800'}`}>
                        {item.name}
                      </span>
                    )}
                  </Link>
                )}

                {hasSubItems && !isCollapsed && (
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-60 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                    <div className="flex flex-col gap-1 pr-14 pl-2 relative before:absolute before:right-8 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 before:rounded-full">
                      {item.subItems?.map((sub) => {
                        const isSubActive = pathname.startsWith(sub.href);
                        return (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            prefetch={false}
                            className={`relative text-sm py-2.5 px-4 rounded-xl transition-all duration-300 flex items-center gap-3
                              ${isSubActive ? 'font-bold text-[#00bba7] bg-white shadow-sm ring-1 ring-slate-100' : 'font-medium text-slate-400 hover:text-slate-700 hover:bg-slate-50 hover:-translate-x-1'}
                            `}
                          >
                            <div className={`absolute -right-5.75 w-3 h-3 rounded-full border-2 border-white transition-all duration-300 ${isSubActive ? 'bg-[#E7C873] scale-100' : 'bg-slate-200 scale-0'}`} />
                            {sub.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 mt-auto shrink-0">
          <div className={`relative overflow-hidden bg-linear-to-br from-[#00bba7] to-[#008f80] rounded-3xl shadow-xl shadow-[#00bba7]/30 transition-all duration-500 ${isCollapsed ? 'p-3' : 'p-4'}`}>
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-[#E7C873]/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-white/20 rounded-full blur-xl pointer-events-none" />

            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} relative z-10`}>
              <div className={`flex items-center gap-3 overflow-hidden transition-all duration-500 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-[70%] opacity-100'}`}>
                <div className="relative">
                  <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center text-white text-lg font-bold shadow-inner">
                    {displayName.slice(0, 1)}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#E7C873] border-2 border-[#00bba7] rounded-full" />
                </div>
                <div className="overflow-hidden flex-1">
                  <p className="text-sm font-bold text-white truncate">{displayName}</p>
                  <p className="text-xs text-white/80 truncate mt-0.5 font-medium">{displayRole}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className={`group flex items-center justify-center bg-white/10 hover:bg-rose-500/90 text-[#E7C873] hover:text-white p-2.5 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/10 hover:border-rose-400 hover:shadow-lg hover:shadow-rose-500/40
                  ${isCollapsed ? 'w-full' : 'w-auto'}
                `}
                title="تسجيل الخروج"
              >
                <LogOut 
                  size={18} 
                  strokeWidth={2.5}
                  className={`transition-all duration-300 group-hover:scale-110 group-hover:-translate-x-1 ${isCollapsed ? 'rotate-180' : ''}`} 
                />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
