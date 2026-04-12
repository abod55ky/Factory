// "use client"; // لأننا سنحتاج للتنقل بين الصفحات

// import Link from 'next/link';
// import { usePathname, useRouter } from 'next/navigation';
// import { 
//   LayoutDashboard, Users, ClipboardList, 
//   Wallet, Box, FileInput, Settings, Factory, LogOut
// } from 'lucide-react';
// import { resetAuthVerificationCache } from '@/lib/auth-verify';
// import apiClient from '@/lib/api-client';
// import { useAuthStore } from '@/stores/auth-store';

// const menuItems = [
//   { name: 'لوحة التحكم', icon: LayoutDashboard, href: '/home' },
//   { name: 'الموظفون', icon: Users, href: '/employees', roles: ['admin', 'hr', 'manager'] },
//   { name: 'سجل الحضور', icon: ClipboardList, href: '/attendance', roles: ['admin', 'hr', 'manager'] },
//   { name: 'الرواتب', icon: Wallet, href: '/salaries', roles: ['admin', 'finance', 'manager'] },
//   { name: 'المخزون', icon: Box, href: '/inventory', roles: ['admin', 'warehouse', 'manager'] },
//   { name: 'استيراد البيانات', icon: FileInput, href: '/importData', roles: ['admin', 'manager'] },
//   { name: 'الإعدادات', icon: Settings, href: '/settings', roles: ['admin'] },
// ];

// export default function Sidebar() {
//   const pathname = usePathname();
//   const router = useRouter();
//   const currentUser = useAuthStore((state) => state.user);
//   const clear = useAuthStore((state) => state.clear);
//   const hasAnyRole = useAuthStore((state) => state.hasAnyRole);
//   const displayName = currentUser?.name || currentUser?.username || 'مدير النظام';
//   const displayRole = currentUser?.role || 'مشرف عام';
//   const visibleMenuItems = menuItems.filter((item) => {
//     if (!item.roles || item.roles.length === 0) return true;
//     return hasAnyRole(item.roles);
//   });

//   const handleLogout = async () => {
//     try {
//       await apiClient.post('/auth/logout');
//     } catch {
//       // Continue local cleanup even if backend has no logout endpoint.
//     }

//     clear();
//     resetAuthVerificationCache();
//     router.replace('/login');
//   };

//   return (
//     <aside className="w-64 bg-[#0f172a] text-slate-300 h-screen sticky top-0 flex flex-col p-4 z-50">
//       {/* شعار النظام */}
//       <div className="mb-10 px-2">
//         <div className="flex items-center gap-2 text-white mt-5 mb-1">
//           <Factory size={24} className="text-blue-500" />
//           <h1 className="text-xl font-bold">إدارة المصنع</h1>
//         </div>
//         <p className="text-[10px] text-slate-500 mr-8">نظام إدارة الإنتاج والرواتب</p>
//       </div>

//       {/* الروابط */}
//       <nav className="flex-1 space-y-1">
//         {visibleMenuItems.map((item) => {
//           const isActive = pathname === item.href;
//           return (
//             <Link
//               key={item.href}
//               href={item.href}
//               className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
//                 isActive 
//                 ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
//                 : 'hover:bg-slate-800 hover:text-white'
//               }`}
//             >
//               <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'} />
//               <span className="text-sm font-medium">{item.name}</span>
//             </Link>
//           );
//         })}
//       </nav>

//       {/* ملف المستخدم في الأسفل */}
//       <div className="border-t border-slate-800 pt-4 mt-auto">
//         <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
//           <div className="w-9 h-9 rounded-full bg-linear-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold shadow-sm">
//             {displayName.slice(0, 1)}
//           </div>
//           <div className="overflow-hidden flex-1">
//             <p className="text-sm font-medium text-white truncate">{displayName}</p>
//             <p className="text-[10px] text-slate-500 truncate">{displayRole}</p>
//           </div>
//           <button
//             onClick={handleLogout}
//             className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
//             title="تسجيل الخروج"
//             aria-label="تسجيل الخروج"
//           >
//             <LogOut size={16} />
//           </button>
//         </div>
//       </div>
//     </aside>
//   );
// }


"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, ClipboardList,
  Wallet, Box, FileInput, Settings,
  Menu, PanelLeftClose, ChevronDown, LogOut, Hexagon
} from 'lucide-react';

// استيراد أدوات الحالة والاتصال بالسيرفر
import { useAuthStore } from '@/stores/auth-store';
import { resetAuthVerificationCache } from '@/lib/auth-verify';
import apiClient from '@/lib/api-client';

// تعريف القائمة مع دمج الصلاحيات (Roles) والأقسام الفرعية (SubItems)
const menuItems = [
  { name: 'الرئيسية: إحصائيات', icon: LayoutDashboard, href: '/home' },
  {
    name: 'إدارة الموظفين',
    icon: Users,
    href: '/employees',
    roles: ['admin', 'hr', 'manager']
  },
  {
    name: 'سجل الحضور',
    icon: ClipboardList,
    href: '/attendance',
    roles: ['admin', 'hr', 'manager']
  },
  {
    name: 'الرواتب',
    icon: Wallet,
    roles: ['admin', 'finance', 'manager'],
    subItems: [
      { name: 'إعدادات الرواتب', href: '/salaries' },
      { name: 'السلف', href: '/salaries/advances' },
      { name: 'المكافآت والخصومات', href: '/salaries/bonuses' },
      { name: 'مسير الرواتب', href: '/salaries/payroll' },
    ]
  },
  {
    name: 'مخزن الشغل',
    icon: Box,
    href: '/inventory',
    roles: ['admin', 'warehouse', 'manager']
  },
  {
    name: 'استيراد البيانات',
    icon: FileInput,
    href: '/importData',
    roles: ['admin', 'manager']
  },
  {
    name: 'الإعدادات',
    icon: Settings,
    href: '/settings',
    roles: ['admin']
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // جلب بيانات المستخدم ومنطق الصلاحيات من الـ Store
  const currentUser = useAuthStore((state) => state.user);
  const clear = useAuthStore((state) => state.clear);
  const hasAnyRole = useAuthStore((state) => state.hasAnyRole);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // بيانات العرض للمستخدم مع قيم افتراضية
  const displayName = currentUser?.name || currentUser?.username || 'مدير النظام';
  const displayRole = currentUser?.role || 'مشرف عام';

  // تصفية القائمة بناءً على صلاحيات المستخدم المسجل حالياً
  const visibleMenuItems = menuItems.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    return hasAnyRole(item.roles);
  });


  const activeSubMenu = menuItems.find(item =>
    item.subItems?.some(sub => pathname.startsWith(sub.href))
  )?.name;
  // فتح القائمة المنسدلة تلقائياً إذا كان المسار الحالي ينتمي إليها
  // useEffect(() => {
  //   const activeItem = menuItems.find(item =>
  //     item.subItems?.some(sub => pathname.startsWith(sub.href))
  //   );
  //   if (activeItem && openMenu !== activeItem.name) {
  //     setOpenMenu(activeItem.name);
  //   }
  // }, [pathname, openMenu]);

  const toggleSubMenu = (menuName: string) => {
    if (isCollapsed) setIsCollapsed(false);
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // تجاهل الخطأ في حال لم يكن هناك endpoint للـ logout في الباك إند
    }
    clear(); // تنظيف بيانات المستخدم محلياً
    resetAuthVerificationCache(); // مسح كاش التوثيق
    router.replace('/login'); // التوجيه لصفحة الدخول
  };

  return (
    <aside
      className={`bg-white border-l border-slate-200 text-slate-800 h-screen sticky top-0 flex flex-col transition-all duration-300 z-50 shadow-sm
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* 1. اللوغو وزر التحكم بالطي */}
      <div className="flex items-center justify-between p-5 mb-2">
        <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
          <div className="bg-blue-700 text-white p-1.5 rounded-lg shadow-md shadow-blue-700/20">
            <Hexagon size={24} className="fill-blue-700" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">BookS</h1>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">For Clothes Factories</p>
          </div>
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-700 transition-colors"
        >
          {isCollapsed ? <Menu size={22} /> : <PanelLeftClose size={22} />}
        </button>
      </div>

      {/* 2. روابط التنقل (مفلترة حسب الصلاحية) */}
      <nav className="flex-1 space-y-1.5 px-3 overflow-y-auto custom-scrollbar">
        {visibleMenuItems.map((item) => {
          const hasSubItems = !!item.subItems;

          // حل مشكلة التحديد: نختبر إذا كان المسار يبدأ بـ item.href أو إذا كان أحد الروابط الفرعية مفعلاً
          const isMainActive = (item.href && pathname.startsWith(item.href)) ||
            (hasSubItems && item.subItems?.some(sub => pathname.startsWith(sub.href)));

          const isOpen = openMenu === item.name || activeSubMenu === item.name;

          return (
            <div key={item.name}>
              {hasSubItems ? (
                <button
                  onClick={() => toggleSubMenu(item.name)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group
                    ${isMainActive || isOpen
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'hover:bg-slate-100 text-slate-700'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} className={isMainActive || isOpen ? 'text-white' : 'text-slate-500 group-hover:text-blue-600'} />
                    {!isCollapsed && (
                      <span className={`text-sm ${isMainActive || isOpen ? 'font-bold text-white' : 'font-semibold'}`}>
                        {item.name}
                      </span>
                    )}
                  </div>
                  {!isCollapsed && (
                    <ChevronDown size={16} className={`${isMainActive || isOpen ? 'text-white/80' : 'text-slate-400'} transition-transform duration-200 ${isOpen ? '' : 'rotate-90'}`} />
                  )}
                </button>
              ) : (
                <Link
                  href={item.href || '#'}
                  onClick={() => setOpenMenu(null)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group
                    ${item.href && pathname.startsWith(item.href)
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'hover:bg-slate-100 text-slate-700'}
                  `}
                >
                  <item.icon size={20} className={item.href && pathname.startsWith(item.href) ? 'text-white' : 'text-slate-500 group-hover:text-blue-600'} />
                  {!isCollapsed && (
                    <span className={`text-sm ${item.href && pathname.startsWith(item.href) ? 'font-bold text-white' : 'font-semibold'}`}>
                      {item.name}
                    </span>
                  )}
                </Link>
              )}

              {/* القوائم الفرعية */}
              {hasSubItems && !isCollapsed && (
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-60 mt-2 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="flex flex-col gap-1 pr-11 pl-2 border-r-2 border-slate-200 mr-5 py-1">
                    {item.subItems?.map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        className={`text-sm py-2 px-3 rounded-lg transition-colors
                          ${pathname.startsWith(sub.href)
                            ? 'font-bold text-blue-700 bg-blue-50'
                            : 'font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100'}
                        `}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* 3. بطاقة المستخدم الحقيقية */}
      <div className="p-3 mt-auto">
        <div className={`flex items-center bg-blue-700 rounded-2xl shadow-lg shadow-blue-900/10 p-2 transition-all duration-300 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>

          <div className={`flex items-center gap-3 ${isCollapsed ? 'hidden' : 'w-3/4'}`}>
            <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-400 shadow-sm flex items-center justify-center text-blue-700 font-bold">
              {displayName.slice(0, 1)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{displayName}</p>
              <p className="text-[10px] font-medium text-blue-100 bg-blue-800/50 inline-block px-2 py-0.5 rounded-full mt-0.5 border border-blue-600/50">
                {displayRole}
              </p>
            </div>
          </div>

          {!isCollapsed && <div className="w-px h-8 bg-blue-500/50 mx-1"></div>}

          {/* زر تسجيل الخروج الفعال */}
          <button
            onClick={handleLogout}
            className={`flex items-center justify-center text-blue-200 hover:text-white hover:bg-red-500 p-2 rounded-xl transition-all duration-200 ${isCollapsed ? 'w-full' : 'w-1/4'}`}
            title="تسجيل الخروج"
          >
            <LogOut size={18} className={isCollapsed ? 'rotate-180' : ''} />
          </button>

        </div>
      </div>
    </aside>
  );
}