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
  const hasAnyRole = useAuthStore((state) => state.hasAnyRole);
  const setStatus = useAuthStore((state) => state.setStatus);
  const clear = useAuthStore((state) => state.clear);

  useEffect(() => {
    let active = true;

    const verifySession = async () => {
      const result = await verifyAuthSession();

      if (result.authorized) {
        if (active) {
          setStatus("authenticated");
          setChecking(false);
        }
        return;
      }

      if (result.status === 401 || result.status === 403) {
        setStatus("unauthenticated");
        clear();
      }

      if (active) {
        setChecking(false);
        router.replace("/login");
      }
    };

    verifySession();

    return () => {
      active = false;
    };
  }, [router, clear, setStatus]);

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
