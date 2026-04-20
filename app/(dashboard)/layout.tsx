"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { Shirt, Scissors, Tag } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    /* خلفية فاتحة ومريحة جداً للعين (Light Cotton Grey) */
    <div className="min-h-screen bg-[#f4f6f8] flex flex-col md:flex-row overflow-hidden font-sans relative" dir="rtl">
      
      {/* 1. نقشة نسيج الجينز (Denim Twill Weave) مائلة وشفافة جداً */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M-2 14L14 -2M-2 2L2 -2M10 14L14 10' stroke='%23263544' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
          backgroundSize: '12px 12px'
        }}
      />

      {/* 2. تدرجات ناعمة بألوان البراند لكسر الجمود (بدون إعتام الصفحة) */}
      <div className="absolute top-0 right-0 w-[40%] h-[50%] bg-linear-to-bl from-[#263544]/4 to-transparent blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-linear-to-tr from-[#C89355]/6 to-transparent blur-3xl pointer-events-none z-0" />

      {/* 3. علامات مائية فنية تعبر عن "مصنع الألبسة" (شفافية 2% كي لا تزعج العين) */}
      {/* مقص تفصيل كبير في الزاوية العلوية اليسرى */}
      <div className="absolute -top-10 -left-10 text-[#263544] opacity-[0.02] -rotate-12 pointer-events-none z-0">
        <Scissors size={450} strokeWidth={0.7} />
      </div>

      {/* بطاقة ملابس (Leather Tag) في الزاوية السفلية اليمنى */}
      <div className="absolute -bottom-10 right-10 text-[#C89355] opacity-[0.03] rotate-12 pointer-events-none z-0">
        <Tag size={350} strokeWidth={1} />
      </div>

      {/* قميص ضخم في المنتصف بخطوط رفيعة جداً */}
      <div className="absolute top-1/2 left-[40%] -translate-y-1/2 text-[#263544] opacity-[0.015] rotate-15 pointer-events-none z-0">
        <Shirt size={600} strokeWidth={0.5} />
      </div>

      {/* Sidebar - Desktop only */}
      <div className="hidden md:block relative z-40">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-50">
        
        {/* Header with Navbar */}
        <header className="sticky top-0 z-40 bg-transparent">
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 md:h-20 relative">
            <Navbar onMenuClick={() => setIsMobileMenuOpen(true)} />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar relative z-10">
          <div className="w-full mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          {/* خلفية ضبابية تعزل الصفحة عند فتح القائمة */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-9998 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* القائمة الجانبية للموبايل */}
          <div className="fixed inset-y-0 right-0 w-72 bg-[#101720]/95 backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border-l border-white/5 z-9999 outline-dashed outline-1 outline-[#C89355]/30 -outline-offset-8">
            <Sidebar />
            
            {/* زر الإغلاق */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-6 left-6 p-2.5 bg-[#1a2530] text-slate-400 border border-[#C89355]/20 rounded-full shadow-lg hover:text-[#C89355] hover:scale-110 hover:border-[#C89355]/50 transition-all z-10000"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
