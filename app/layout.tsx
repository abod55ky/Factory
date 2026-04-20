

import type { Metadata, Viewport } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import WebVitalsReporter from "@/components/WebVitalsReporter";

// الإبقاء على إعدادات الخط كما هي
const tajawal = Tajawal({ 
  subsets: ["arabic"], 
  weight: ['400', '500', '700'] 
});

export const metadata: Metadata = {
  title: "نظام إدارة المصنع",
  description: "نظام متكامل لإدارة الموظفين والرواتب والمخزون", // الوصف الجديد
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      {/* دمج كلاس الخط مع التنسيقات الجديدة */}
      <body className={`${tajawal.className} bg-[#f8fafc] text-slate-800 antialiased`}>
        {/* تغليف المشروع بالكامل لتعمل المكتبات بشكل صحيح */}
        <Providers>
          <WebVitalsReporter />
          {children}
        </Providers>
      </body>
    </html>
  );
}
