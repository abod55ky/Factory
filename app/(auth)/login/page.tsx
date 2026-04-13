"use client"; // لأن الصفحة تحتوي على تفاعل المستخدم (كتابة ونقر)

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, Loader2, AlertCircle } from "lucide-react";
import apiClient from "@/lib/api-client"; // ملف الاتصال الذي أنشأناه سابقاً
import axios from "axios";
import { setAuthSession } from "@/lib/auth-session";
import { resetAuthVerificationCache, verifyAuthSession } from "@/lib/auth-verify";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const setStatus = useAuthStore((state) => state.setStatus);
  const clear = useAuthStore((state) => state.clear);

  useEffect(() => {
    let active = true;

    const checkExistingSession = async () => {
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
    };

    checkExistingSession();

    return () => {
      active = false;
    };
  }, [router, clear, setStatus]);

  // 1. تعريف حالات الصفحة (States)
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // حالة التحميل أثناء انتظار رد السيرفر
  const [errorMessage, setErrorMessage] = useState(""); // لحفظ رسالة الخطأ إن وجدت

  // 2. دالة إرسال البيانات (The Submit Function)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await apiClient.post("/auth/login", {
        username: username,
        password: password,
      });

      const { user, token } = response.data as {
        user?: unknown;
        token?: string;
      };
      setAuthSession(user ?? null, typeof token === "string" ? token : null);
      setUser((user ?? null) as { name?: string; username?: string; role?: string } | null);
      resetAuthVerificationCache();

      const sessionCheck = await verifyAuthSession({ force: true });
      if (!sessionCheck.authorized) {
        setStatus("unauthenticated");
        clear();
        setErrorMessage("تم تسجيل الدخول لكن لم يتم تثبيت جلسة آمنة. تحقق من إعدادات الكوكيز في الخادم.");
        return;
      }

      setStatus("authenticated");
      router.push("/home");
    } catch (error: unknown) {
      // هذه أخطاء متوقعة أثناء الاتصال، لذلك نستخدم تحذير بدل console.error لتجنب ضوضاء الـ overlay.
      if (axios.isAxiosError<{ message?: string }>(error) && error.response) {
        const status = error.response.status;

        console.warn("[Login] API responded with error", {
          status,
          url: error.config?.url,
          method: error.config?.method,
          data: error.response.data,
        });

        if (status === 502 || status === 503 || status === 504) {
          setErrorMessage("الخادم المرفوع غير متاح حالياً (Gateway Error). حاول مرة أخرى بعد دقيقة.");
        } else if (status >= 500) {
          setErrorMessage("الخادم غير متاح حالياً. تأكد من تشغيل الـ API أو صحة الرابط ثم حاول مجدداً.");
        } else if (status === 404) {
          setErrorMessage("مسار تسجيل الدخول غير موجود. تحقق من NEXT_PUBLIC_API_URL وأن الخادم يعمل على /api.");
        } else {
          setErrorMessage(error.response.data?.message || "بيانات الدخول غير صحيحة");
        }
      } else if (axios.isAxiosError(error) && error.request) {
        // السيرفر لم يرد أبداً (تعطل بالخادم، CORS، DNS، أو شبكة)
        console.warn("[Login] No response received", {
          code: error.code,
          message: error.message,
          url: error.config?.url,
          baseURL: error.config?.baseURL,
        });
        setErrorMessage("تعذر الوصول إلى الخادم. تحقق من رابط API (NEXT_PUBLIC_API_URL) وإعدادات CORS ثم حاول مجدداً.");
      } else if (error instanceof Error) {
        console.warn("[Login] Browser/runtime error", error.message);
        setErrorMessage("حدث خطأ غير متوقع.");
      } else {
        console.warn("[Login] Unknown error", error);
        setErrorMessage("حدث خطأ غير متوقع.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 3. تصميم واجهة المستخدم (UI)
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">تسجيل الدخول</h1>
          <p className="text-slate-500">مرحباً بك في نظام إدارة المعمل</p>
        </div>

        {/* مربع عرض الأخطاء إن وجدت */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm font-bold border border-red-100">
            <AlertCircle size={20} />
            <p>{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6 flex flex-col items-end text-right">
          <div className="w-full">
            <label className="block text-sm font-bold text-slate-700 mb-2">اسم المستخدم أو الإيميل</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <User className="text-slate-400" size={20} />
              </div>
              <input
                type="text"
                required
                className="w-full pl-4 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all text-right"
                placeholder="أدخل اسم المستخدم"
                value={username}
                onChange={(e) => setUsername(e.target.value)} // تحديث الحالة عند الكتابة
                dir="rtl"
              />
            </div>
          </div>

          <div className="w-full">
            <label className="block text-sm font-bold text-slate-700 mb-2">كلمة المرور</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Lock className="text-slate-400" size={20} />
              </div>
              <input
                type="password"
                required
                className="w-full pl-4 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all text-right font-sans"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                dir="ltr"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all flex justify-center items-center h-12"
          >
            {isLoading ? <Loader2 className="animate-spin" size={24} /> : "دخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
