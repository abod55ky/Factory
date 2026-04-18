"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00bba7] via-[#00bba7]/90 to-[#E7C873] flex flex-col md:flex-row overflow-hidden font-sans" dir="rtl">
      
      {/* Sidebar - Desktop only */}
      {/* تم تخفيض الـ z-index هنا إلى 40 */}
      <div className="hidden md:block relative z-40">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      {/* تم رفع الـ z-index هنا إلى 50 ليكون أعلى من الـ Sidebar */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-50">
        
        {/* Header with Navbar */}
        <header className="sticky top-0 z-40 bg-transparent">
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 md:h-20">
            <Navbar onMenuClick={() => setIsMobileMenuOpen(true)} />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
          <div className="w-full mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9998]"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-72 bg-white/80 backdrop-blur-3xl shadow-2xl border-l border-white/50 z-[9999]">
            <Sidebar />
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-6 left-6 p-2.5 bg-rose-50 text-rose-500 rounded-full shadow-md hover:bg-rose-500 hover:text-white transition-colors z-[10000]"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}