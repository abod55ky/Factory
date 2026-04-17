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
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50 flex flex-col md:flex-row">
      {/* Sidebar - Desktop only, hidden on mobile */}
      <div className="hidden md:block md:w-72 md:shrink-0 border-r border-slate-200 bg-white/70 backdrop-blur-sm">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header with Navbar */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 md:h-20">
            <Navbar onMenuClick={() => setIsMobileMenuOpen(true)} />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 [direction:ltr]">
          <div className="max-w-7xl mx-auto w-full [direction:rtl]">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Mobile Sidebar */}
          <div className="fixed inset-y-0 right-0 w-72 bg-white z-50 md:hidden">
            <Sidebar />
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-lg"
            >
              ✕
            </button>
          </div>
        </>
      )}
    </div>
  );
}