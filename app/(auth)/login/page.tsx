// "use client";

// import { ChangeEvent, FormEvent, useMemo, useState } from "react";
// import { Factory, Loader2, Lock, Eye, EyeOff, User } from "lucide-react";
// import apiClient from "@/lib/api-client";


// import { useRouter } from 'next/navigation';
// import { LoginResponse } from '@/types/employee';
// import { toast } from 'react-hot-toast'; // أو أي مكتبة تنبيهات تستخدمها

// interface LoginRequest {
//   username: string;
//   password: string;
// }

// interface LoginResponse {
//   accessToken: string;
//   refreshToken?: string;
//   user?: {
//     id: string;
//     name: string;
//     role: string;
//   };
// }

// interface LoginFormState {
//   username: string;
//   password: string;
// }

// type FeedbackState =
//   | {
//       type: "error" | "success";
//       message: string;
//     }
//   | null;

// const initialFormState: LoginFormState = {
//   username: "",
//   password: "",
// };

// export default function LoginPage() {
//   const router = useRouter();
//   const [formState, setFormState] = useState<LoginFormState>(initialFormState);
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [feedback, setFeedback] = useState<FeedbackState>(null);
//   const [formData, setFormData] = useState({ username: '', password: '' });
//   const [loading, setLoading] = useState(false);

//   const isSubmitDisabled = useMemo(() => {
//     return !formState.username.trim() || !formState.password.trim() || isLoading;
//   }, [formState.password, formState.username, isLoading]);

//   const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = event.target;
//     setFormState((currentState) => ({
//       ...currentState,
//       [name]: value,
//     }));
//   };

// const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       // نرسل البيانات للباك إند بناءً على AuthController
//       const response = await apiClient.post<LoginResponse>('/auth/login', formData);
      
//       const { token, user } = response.data;

//       // تخزين التوكن وبيانات المستخدم
//       localStorage.setItem('token', token);
//       localStorage.setItem('user', JSON.stringify(user));

//       toast.success('تم تسجيل الدخول بنجاح');
      
//       // التوجيه للوحة التحكم
//       router.push('/dashboard'); 
//     } catch (error: any) {
//       const message = error.response?.data?.message || 'خطأ في اسم المستخدم أو كلمة المرور';
//       toast.error(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     setFeedback(null);
//     setIsLoading(true);

//     const payload: LoginRequest = {
//       username: formState.username.trim(),
//       password: formState.password,
//     };

//     try {
//       await apiClient.post<LoginResponse>("/auth/login", payload);
//       setFeedback({
//         type: "success",
//         message: "Login request sent successfully. Connect token persistence and navigation when the backend flow is finalized.",
//       });
//     } catch (error) {
//       const message =
//         error instanceof Error
//           ? error.message
//           : "Unable to sign in right now. Verify the API endpoint and credentials mapping.";

//       setFeedback({
//         type: "error",
//         message,
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#f8fafc] px-4 py-10 sm:px-6 lg:px-8">
//       <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
//         <div className="grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm lg:grid-cols-[1.05fr_0.95fr]">
//           <div className="hidden bg-slate-900 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
//             <div className="space-y-8">
//               <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-300">
//                 <Factory size={28} />
//               </div>
//               <div className="space-y-4">
//                 <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">
//                   Factory OS
//                 </p>
//                 <h1 className="text-4xl font-bold leading-tight">
//                   Warehouse and payroll access in one secure workspace
//                 </h1>
//                 <p className="max-w-md text-sm leading-7 text-slate-300">
//                   Sign in to manage employees, inventory, attendance, and payroll from the same operational dashboard.
//                 </p>
//               </div>
//             </div>

//             <div className="grid gap-4 sm:grid-cols-2">
//               <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
//                 <p className="text-sm text-slate-300">Operations modules</p>
//                 <p className="mt-2 text-2xl font-bold text-white">4</p>
//               </div>
//               <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
//                 <p className="text-sm text-slate-300">Secure API ready</p>
//                 <p className="mt-2 text-2xl font-bold text-white">NestJS</p>
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-12">
//             <div className="w-full max-w-md" dir="ltr">
//               <div className="mb-8 space-y-3">
//                 <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-700">
//                   <span className="h-2 w-2 rounded-full bg-blue-600" />
//                   System Login
//                 </div>
//                 <div>
//                   <h2 className="text-3xl font-bold text-slate-800">Welcome back</h2>
//                   <p className="mt-2 text-sm leading-6 text-slate-500">
//                     Use your username or email and password to access the factory control panel.
//                   </p>
//                 </div>
//               </div>

//               <form className="space-y-5" onSubmit={onSubmit}>
//                 <div className="space-y-2">
//                   <label
//                     className="block text-sm font-semibold text-slate-700"
//                     htmlFor="username"
//                   >
//                     Username or Email
//                   </label>
//                   <div className="relative">
//                     <User
//                       className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
//                       size={18}
//                     />
//                     <input
//                       id="username"
//                       name="username"
//                       type="text"
//                       autoComplete="username"
//                       placeholder="Enter your username or email"
//                       value={formState.username}
//                       onChange={handleChange}
//                       className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-4 pl-11 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-200 focus:ring-2 focus:ring-blue-500"
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <label
//                     className="block text-sm font-semibold text-slate-700"
//                     htmlFor="password"
//                   >
//                     Password
//                   </label>
//                   <div className="relative">
//                     <Lock
//                       className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
//                       size={18}
//                     />
//                     <input
//                       id="password"
//                       name="password"
//                       type={showPassword ? "text" : "password"}
//                       autoComplete="current-password"
//                       placeholder="Enter your password"
//                       value={formState.password}
//                       onChange={handleChange}
//                       className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-12 pl-11 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-200 focus:ring-2 focus:ring-blue-500"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPassword((currentValue) => !currentValue)}
//                       className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
//                       aria-label={showPassword ? "Hide password" : "Show password"}
//                     >
//                       {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                     </button>
//                   </div>
//                 </div>

//                 {feedback ? (
//                   <div
//                     className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${
//                       feedback.type === "success"
//                         ? "border-blue-100 bg-blue-50 text-blue-700"
//                         : "border-red-100 bg-red-50 text-red-600"
//                     }`}
//                   >
//                     {feedback.message}
//                   </div>
//                 ) : null}

//                 <button
//                   type="submit"
//                   disabled={isSubmitDisabled}
//                   className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-blue-100 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
//                 >
//                   {isLoading ? (
//                     <>
//                       <Loader2 size={18} className="animate-spin" />
//                       Signing in...
//                     </>
//                   ) : (
//                     "Sign in"
//                   )}
//                 </button>
//               </form>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client"; // لأن الصفحة تحتوي على تفاعل المستخدم (كتابة ونقر)

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, Loader2, AlertCircle } from "lucide-react";
import apiClient from "@/lib/api-client"; // ملف الاتصال الذي أنشأناه سابقاً
import axios from "axios";
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

      const { user } = response.data as { user?: unknown };
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
      // 3. إذا فشل الطلب (هنا نصطاد الخطأ بدقة)
      console.error("❌ [Login Error] حدث خطأ أثناء الاتصال:");
      
      if (axios.isAxiosError<{ message?: string }>(error) && error.response) {
        // السيرفر رد ولكن بوجود خطأ (مثل: كلمة سر خاطئة)
        console.error("📌 تفاصيل من السيرفر:", error.response.data);
        setErrorMessage(error.response.data?.message || "بيانات الدخول غير صحيحة");
      } else if (axios.isAxiosError(error) && error.request) {
        // السيرفر لم يرد أبداً (السيرفر طافي أو هناك مشكلة بالإنترنت)
        console.error("📌 السيرفر لا يستجيب أبداً:", error.request);
        setErrorMessage("السيرفر لا يستجيب. قد يكون نائماً، انتظر قليلاً وجرب مرة أخرى.");
      } else if (error instanceof Error) {
        console.error("📌 خطأ داخلي في المتصفح:", error.message);
        setErrorMessage("حدث خطأ غير متوقع.");
      } else {
        // خطأ في كود الفرونت إند نفسه
        console.error("📌 خطأ داخلي في المتصفح:", error);
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