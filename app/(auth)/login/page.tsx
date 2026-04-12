// "use client"; // لأن الصفحة تحتوي على تفاعل المستخدم (كتابة ونقر)

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { User, Lock, Loader2, AlertCircle } from "lucide-react";
// import apiClient from "@/lib/api-client"; // ملف الاتصال الذي أنشأناه سابقاً
// import axios from "axios";
// import { resetAuthVerificationCache, verifyAuthSession } from "@/lib/auth-verify";
// import { useAuthStore } from "@/stores/auth-store";

// export default function LoginPage() {
//   const router = useRouter();
//   const setUser = useAuthStore((state) => state.setUser);
//   const setStatus = useAuthStore((state) => state.setStatus);
//   const clear = useAuthStore((state) => state.clear);

//   useEffect(() => {
//     let active = true;

//     const checkExistingSession = async () => {
//       const result = await verifyAuthSession();

//       if (result.authorized) {
//         if (active) {
//           setStatus("authenticated");
//           router.replace("/home");
//         }
//         return;
//       }

//       if (result.status === 401 || result.status === 403) {
//         setStatus("unauthenticated");
//         clear();
//       }
//     };

//     checkExistingSession();

//     return () => {
//       active = false;
//     };
//   }, [router, clear, setStatus]);
  
//   // 1. تعريف حالات الصفحة (States)
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [isLoading, setIsLoading] = useState(false); // حالة التحميل أثناء انتظار رد السيرفر
//   const [errorMessage, setErrorMessage] = useState(""); // لحفظ رسالة الخطأ إن وجدت

//   // 2. دالة إرسال البيانات (The Submit Function)
// const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setErrorMessage("");

//     try {
//       const response = await apiClient.post("/auth/login", {
//         username: username,
//         password: password,
//       });

//       const { user } = response.data as { user?: unknown };
//       setUser((user ?? null) as { name?: string; username?: string; role?: string } | null);
//       resetAuthVerificationCache();

//       const sessionCheck = await verifyAuthSession({ force: true });
//       if (!sessionCheck.authorized) {
//         setStatus("unauthenticated");
//         clear();
//         setErrorMessage("تم تسجيل الدخول لكن لم يتم تثبيت جلسة آمنة. تحقق من إعدادات الكوكيز في الخادم.");
//         return;
//       }

//       setStatus("authenticated");
//       router.push("/home");
 
//      } catch (error: unknown) {
//       // 3. إذا فشل الطلب (هنا نصطاد الخطأ بدقة)
//       console.error("❌ [Login Error] حدث خطأ أثناء الاتصال:");
      
//       if (axios.isAxiosError<{ message?: string }>(error) && error.response) {
//         // السيرفر رد ولكن بوجود خطأ (مثل: كلمة سر خاطئة)
//         console.error("📌 تفاصيل من السيرفر:", error.response.data);
//         setErrorMessage(error.response.data?.message || "بيانات الدخول غير صحيحة");
//       } else if (axios.isAxiosError(error) && error.request) {
//         // السيرفر لم يرد أبداً (السيرفر طافي أو هناك مشكلة بالإنترنت)
//         console.error("📌 السيرفر لا يستجيب أبداً:", error.request);
//         setErrorMessage("السيرفر لا يستجيب. قد يكون نائماً، انتظر قليلاً وجرب مرة أخرى.");
//       } else if (error instanceof Error) {
//         console.error("📌 خطأ داخلي في المتصفح:", error.message);
//         setErrorMessage("حدث خطأ غير متوقع.");
//       } else {
//         // خطأ في كود الفرونت إند نفسه
//         console.error("📌 خطأ داخلي في المتصفح:", error);
//         setErrorMessage("حدث خطأ غير متوقع.");
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // 3. تصميم واجهة المستخدم (UI)
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
//       <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-slate-800 mb-2">تسجيل الدخول</h1>
//           <p className="text-slate-500">مرحباً بك في نظام إدارة المعمل</p>
//         </div>

//         {/* مربع عرض الأخطاء إن وجدت */}
//         {errorMessage && (
//           <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 text-sm font-bold border border-red-100">
//             <AlertCircle size={20} />
//             <p>{errorMessage}</p>
//           </div>
//         )}

//         <form onSubmit={handleLogin} className="space-y-6 flex flex-col items-end text-right">
          
//           <div className="w-full">
//             <label className="block text-sm font-bold text-slate-700 mb-2">اسم المستخدم أو الإيميل</label>
//             <div className="relative">
//               <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
//                 <User className="text-slate-400" size={20} />
//               </div>
//               <input
//                 type="text"
//                 required
//                 className="w-full pl-4 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all text-right"
//                 placeholder="أدخل اسم المستخدم"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)} // تحديث الحالة عند الكتابة
//                 dir="rtl"
//               />
//             </div>
//           </div>

//           <div className="w-full">
//             <label className="block text-sm font-bold text-slate-700 mb-2">كلمة المرور</label>
//             <div className="relative">
//               <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
//                 <Lock className="text-slate-400" size={20} />
//               </div>
//               <input
//                 type="password"
//                 required
//                 className="w-full pl-4 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all text-right font-sans"
//                 placeholder="••••••••"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 dir="ltr"
//               />
//             </div>
//           </div>

//           <button
//             type="submit"
//             disabled={isLoading}
//             className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all flex justify-center items-center h-12"
//           >
//             {isLoading ? <Loader2 className="animate-spin" size={24} /> : "دخول"}
//           </button>
//         </form>

//       </div>
//     </div>
//   );
// }



"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, Loader2, AlertCircle, Hexagon } from "lucide-react";
import apiClient from "@/lib/api-client";
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
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
      console.error("❌ [Login Error] حدث خطأ أثناء الاتصال:");
      
      if (axios.isAxiosError<{ message?: string }>(error) && error.response) {
        console.error("📌 تفاصيل من السيرفر:", error.response.data);
        setErrorMessage(error.response.data?.message || "بيانات الدخول غير صحيحة");
      } else if (axios.isAxiosError(error) && error.request) {
        console.error("📌 السيرفر لا يستجيب أبداً:", error.request);
        setErrorMessage("السيرفر لا يستجيب. قد يكون نائماً، انتظر قليلاً وجرب مرة أخرى.");
      } else if (error instanceof Error) {
        console.error("📌 خطأ داخلي في المتصفح:", error.message);
        setErrorMessage("حدث خطأ غير متوقع.");
      } else {
        console.error("📌 خطأ داخلي في المتصفح:", error);
        setErrorMessage("حدث خطأ غير متوقع.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // الخلفية العامة للصفحة مع ألوان مقتبسة من زوايا التصميم الأصلي
    <div className="min-h-screen flex items-center justify-center bg-slate-100 font-sans p-4 relative overflow-hidden" dir="rtl">
      
      {/* دوائر وزخارف خلفية محاكية للتصميم */}
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-400 rounded-full opacity-50 blur-2xl"></div>
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-rose-400 rounded-full opacity-40 blur-2xl"></div>

      {/* الحاوية الرئيسية (البطاقة المقسمة) */}
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl flex overflow-hidden relative z-10 min-h-[550px]">
        
        {/* القسم الأيمن (الترحيب الملون - يظهر في الشاشات المتوسطة والكبيرة فقط) */}
        <div className="hidden md:flex md:w-5/12 bg-teal-500 flex-col items-center justify-center p-12 text-center relative overflow-hidden">
          {/* زخارف هندسية داخل القسم الملون */}
          <div className="absolute top-10 right-10 w-16 h-16 bg-white/10 rotate-45"></div>
          <div className="absolute bottom-20 left-10 w-24 h-24 bg-white/10 rounded-full"></div>
          
          <div className="relative z-10 flex flex-col items-center text-white">
            <Hexagon size={48} className="mb-6 opacity-90" />
            <h2 className="text-4xl font-bold mb-4">مرحباً بعودتك!</h2>
            <p className="text-teal-50 leading-relaxed text-sm">
              للبقاء على اتصال معنا ومتابعة أعمالك، يرجى تسجيل الدخول باستخدام بياناتك الشخصية.
            </p>
          </div>
        </div>

        {/* القسم الأيسر (نموذج الدخول) */}
        <div className="w-full md:w-7/12 p-8 md:p-16 flex flex-col justify-center items-center bg-white">
          
          <div className="w-full max-w-sm">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-extrabold text-teal-600 mb-2">تسجيل الدخول</h1>
              <p className="text-slate-400 text-sm">أدخل بيانات الاعتماد الخاصة بك للوصول</p>
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-xl flex items-center gap-3 text-sm font-bold border border-rose-100">
                <AlertCircle size={20} />
                <p>{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5 flex flex-col text-right w-full">
              
              {/* حقل اسم المستخدم */}
              <div className="w-full relative group">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <User className="text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
                </div>
                <input
                  type="text"
                  required
                  className="w-full pl-4 pr-12 py-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all text-slate-700 font-medium placeholder:text-slate-400"
                  placeholder="اسم المستخدم أو الإيميل"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  dir="rtl"
                />
              </div>

              {/* حقل كلمة المرور */}
              <div className="w-full relative group">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <Lock className="text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
                </div>
                <input
                  type="password"
                  required
                  className="w-full pl-4 pr-12 py-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all text-slate-700 font-medium placeholder:text-slate-400"
                  placeholder="كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  dir="ltr"
                />
              </div>

              <div className="flex justify-start w-full">
                <button type="button" className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors">
                  نسيت كلمة المرور؟
                </button>
              </div>

              {/* زر الدخول */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-500 hover:bg-teal-600 active:scale-[0.98] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-teal-500/30 flex justify-center items-center h-14 mt-4"
              >
                {isLoading ? <Loader2 className="animate-spin" size={24} /> : "تسجيل الدخول"}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}