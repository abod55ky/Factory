// import type { Metadata } from "next";
// import { Tajawal } from "next/font/google"; // استخدام خط عربي احترافي
// import "./globals.css";
// import Sidebar from "@/components/Sidebar";

// const tajawal = Tajawal({ 
//   subsets: ["arabic"], 
//   weight: ['400', '500', '700'] 
// });

// export const metadata: Metadata = {
//   title: "نظام إدارة المصنع",
//   description: "منصة متكاملة لتنظيم الإنتاج والرواتب",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="ar" dir="rtl">
//       <body className={`${tajawal.className} antialiased bg-[#f8fafc] text-slate-900`}>
//         <div className="flex min-h-screen">
//           {/* القائمة الجانبية الثابتة */}
//           <Sidebar />

//           {/* محتوى الصفحات المتغير */}
//           <main className="flex-1 min-w-0">
//             {children}
//           </main>
//         </div>
//       </body>
//     </html>
//   );
// }
import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

// الإبقاء على إعدادات الخط كما هي
const tajawal = Tajawal({ 
  subsets: ["arabic"], 
  weight: ['400', '500', '700'] 
});

export const metadata: Metadata = {
  title: "نظام إدارة المصنع",
  description: "نظام متكامل لإدارة الموظفين والرواتب والمخزون", // الوصف الجديد
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
          {children}
        </Providers>
      </body>
    </html>
  );
}