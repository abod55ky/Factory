"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { verifyAuthSession } from "@/lib/auth-verify";
import { useAuthStore } from "@/stores/auth-store";

const ROUTE_ROLE_MAP: Record<string, string[]> = {
  "/settings": ["admin"],
  "/importData": ["admin", "manager"],
  "/resigned": ["admin", "hr", "manager"],
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const status = useAuthStore((state) => state.status);
  const currentUser = useAuthStore((state) => state.user);
  const hasAnyRole = useAuthStore((state) => state.hasAnyRole);
  const setStatus = useAuthStore((state) => state.setStatus);
  const clear = useAuthStore((state) => state.clear);

  useEffect(() => {
    let active = true;

    const verifySession = async () => {
      const result = await verifyAuthSession();

      if (!active) {
        return;
      }

      if (result.authorized) {
        setStatus("authenticated");
        setChecking(false);
        return;
      }

      const isHardAuthFailure = result.status === 401 || result.status === 403;
      if (isHardAuthFailure) {
        setStatus("unauthenticated");
        clear();
        setChecking(false);
        router.replace("/login");
        return;
      }

      const isTransientFailure =
        result.status === 429
        || result.status === 503
        || result.status === 504
        || typeof result.status === "undefined";

      if (isTransientFailure && currentUser) {
        setStatus("authenticated");
        setChecking(false);
        return;
      }

      setChecking(false);
      router.replace("/login");
    };

    verifySession();

    return () => {
      active = false;
    };
  }, [router, clear, currentUser, setStatus]);

  useEffect(() => {
    if (status !== "authenticated") return;
    const requiredRoles = ROUTE_ROLE_MAP[pathname];
    if (!requiredRoles || requiredRoles.length === 0) return;
    if (!hasAnyRole(requiredRoles)) {
      router.replace("/home");
    }
  }, [hasAnyRole, pathname, router, status]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={28} />
      </div>
    );
  }

  if (status !== "authenticated") {
    return null;
  }

  const requiredRoles = ROUTE_ROLE_MAP[pathname];
  if (requiredRoles && requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return null;
  }


  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}


// "use client";

// import { useEffect, useState } from "react";
// import { usePathname, useRouter } from "next/navigation";
// import { Loader2 } from "lucide-react";
// import Sidebar from "@/components/Sidebar";
// import TopNavbar from "@/components/TopNavbar"; // تأكد من صحة مسار الملف
// import { verifyAuthSession } from "@/lib/auth-verify";
// import { useAuthStore } from "@/stores/auth-store";

// const ROUTE_ROLE_MAP: Record<string, string[]> = {
//   "/settings": ["admin"],
//   "/importData": ["admin", "manager"],
// };

// export default function DashboardLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   const router = useRouter();
//   const pathname = usePathname();
//   const [checking, setChecking] = useState(true);
//   const status = useAuthStore((state) => state.status);
//   const hasAnyRole = useAuthStore((state) => state.hasAnyRole);
//   const setStatus = useAuthStore((state) => state.setStatus);
//   const clear = useAuthStore((state) => state.clear);

//   // 1. منطق التحقق من الجلسة (Auth Logic)
//   useEffect(() => {
//     let active = true;

//     const verifySession = async () => {
//       const result = await verifyAuthSession();

//       if (result.authorized) {
//         if (active) {
//           setStatus("authenticated");
//           setChecking(false);
//         }
//         return;
//       }

//       if (result.status === 401 || result.status === 403) {
//         setStatus("unauthenticated");
//         clear();
//       }

//       if (active) {
//         setChecking(false);
//         router.replace("/login");
//       }
//     };

//     verifySession();

//     return () => {
//       active = false;
//     };
//   }, [router, clear, setStatus]);

//   // 2. منطق التحقق من الصلاحيات (RBAC Logic)
//   useEffect(() => {
//     if (status !== "authenticated") return;
//     const requiredRoles = ROUTE_ROLE_MAP[pathname];
//     if (!requiredRoles || requiredRoles.length === 0) return;
//     if (!hasAnyRole(requiredRoles)) {
//       router.replace("/home");
//     }
//   }, [hasAnyRole, pathname, router, status]);

//   // شاشة التحميل الأولية
//   if (checking) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-slate-50">
//         <Loader2 className="animate-spin text-[#00bba7]" size={32} />
//       </div>
//     );
//   }

//   // منع الرندرة إذا لم يكن موثقاً
//   if (status !== "authenticated") return null;

//   const requiredRoles = ROUTE_ROLE_MAP[pathname];
//   if (requiredRoles && requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
//     return null;
//   }

//   // 3. الهيكل البصري الجديد (The New Architecture)
//   return (
//     <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
      
//       {/* القائمة الجانبية ثابتة العرض */}
//       <Sidebar />

//       {/* منطقة المحتوى: تجمع الـ Navbar والصفحات */}
//       <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
//         {/* الهيدر العلوي الجديد - سيظهر في كل الصفحات الآن */}
//         <TopNavbar />

//         {/* مساحة عرض الصفحات مع سكرول داخلي مستقل */}
//         <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50">
//           {children}
//         </main>
        
//       </div>
//     </div>
//   );
// }