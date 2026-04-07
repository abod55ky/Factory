"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { verifyAuthSession } from "@/lib/auth-verify";
import { useAuthStore } from "@/stores/auth-store";

export default function Home() {
  const router = useRouter();
  const setStatus = useAuthStore((state) => state.setStatus);
  const clear = useAuthStore((state) => state.clear);

  useEffect(() => {
    let active = true;

    const routeBySession = async () => {
      const result = await verifyAuthSession();

      if (result.authorized) {
        if (active) {
          setStatus("authenticated");
          router.replace("/home");
        }
        return;
      }

      if (result.status === 401 || result.status === 403) {
        setStatus("unauthenticated");
        clear();
      }

      if (active) {
        router.replace("/login");
      }
    };

    routeBySession();

    return () => {
      active = false;
    };
  }, [router, clear, setStatus]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600" size={28} />
    </div>
  );
}
