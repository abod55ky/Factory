"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  // نقوم بإنشاء العميل مرة واحدة فقط لتجنب إعادة التحميل غير الضرورية
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // البيانات تبقى صالحة لدقيقة قبل إعادة جلبها في الخلفية (أداء احترافي)
        refetchOnWindowFocus: false, // لا تعيد الجلب كلما تنقل المستخدم بين التبويبات
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* هنا نزرع مكتبة الإشعارات لتعمل في كل صفحات الموقع */}
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            fontFamily: 'inherit',
            direction: 'rtl',
          }
        }} 
      />
    </QueryClientProvider>
  );
}