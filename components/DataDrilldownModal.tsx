"use client";

import { X, Loader2, LucideIcon } from "lucide-react";
import { useEffect } from "react";

export interface DataDrilldownModalProps<T = unknown> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon: LucideIcon;
  isLoading: boolean;
  data: T[] | null;
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyMessage?: string;
  emptyIcon?: LucideIcon;
}

/**
 * DataDrilldownModal - Enterprise-Level Data Drilldown Modal Component
 * * Provides detailed data views for dashboard KPIs with premium glassmorphism design.
 * * Features:
 * - Dark frosted glass overlay with backdrop blur
 * - White/glass content box with dashed inner borders (stitching effect)
 * - Brand colors: #263544 (dark) and #C89355 (gold)
 * - Smooth animations and loading states
 * - Keyboard accessibility (Escape, Tab navigation)
 * - Body scroll lock when open
 * * @template T - The type of data items to display
 */
// ✅ تم استبدال any بـ unknown لحل مشكلة Linting
export function DataDrilldownModal<T = unknown>({
  isOpen,
  onClose,
  title,
  icon: Icon,
  isLoading,
  data,
  renderItem,
  emptyMessage = "لا توجد بيانات متاحة",
  emptyIcon: EmptyIcon,
}: DataDrilldownModalProps<T>) {
  // Close modal on Escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Dark Frosted Glass Overlay */}
      <div
        className="fixed inset-0 bg-[#263544]/40 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative w-full max-w-2xl max-h-[85vh] bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_40px_80px_rgba(38,53,68,0.3)] border-2 border-white/90 flex flex-col overflow-hidden pointer-events-auto animate-in zoom-in-95 duration-300"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Dashed Inner Border (Stitching Effect) */}
          <div className="absolute inset-1.5 rounded-[2.2rem] border border-dashed border-[#C89355]/40 pointer-events-none z-0" />

          {/* Fabric Pattern Background */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 12h24M12 0v24' stroke='%23263544' stroke-width='1' stroke-dasharray='4 4' fill='none'/%3E%3C/svg%3E")`,
              backgroundSize: "24px 24px",
            }}
          />

          {/* Modal Header */}
          <div className="relative z-10 flex items-center justify-between p-6 border-b border-[#263544]/10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#1a2530] rounded-2xl shadow-lg border border-[#C89355]/40">
                <Icon size={22} className="text-[#C89355]" strokeWidth={2.5} />
              </div>
              <h2
                id="modal-title"
                className="text-2xl font-black text-[#263544] tracking-tight"
              >
                {title}
              </h2>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/60 hover:bg-rose-50 border border-white/80 hover:border-rose-200 shadow-sm hover:shadow-md transition-all duration-300 group"
              aria-label="إغلاق"
            >
              <X
                size={20}
                className="text-[#263544] group-hover:text-rose-600 transition-colors"
                strokeWidth={2.5}
              />
            </button>
          </div>

          {/* Modal Body */}
          <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar p-6">
            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Loader2
                  size={48}
                  className="text-[#C89355] animate-spin"
                  strokeWidth={2.5}
                />
                <p className="text-[#263544]/70 font-bold text-sm">
                  جاري تحميل البيانات...
                </p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && (!data || data.length === 0) && (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                {EmptyIcon ? (
                  <div className="p-6 bg-[#263544]/5 rounded-3xl border-2 border-dashed border-[#263544]/20">
                    <EmptyIcon
                      size={56}
                      className="text-[#263544]/30"
                      strokeWidth={1.5}
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-[#263544]/5 border-2 border-dashed border-[#263544]/20 flex items-center justify-center">
                    <span className="text-4xl text-[#263544]/30">—</span>
                  </div>
                )}
                <p className="text-[#263544]/60 font-bold text-sm text-center max-w-xs">
                  {emptyMessage}
                </p>
              </div>
            )}

            {/* Data List */}
            {!isLoading && data && data.length > 0 && (
              <div className="flex flex-col gap-3">
                {data.map((item, index) => renderItem(item, index))}
              </div>
            )}
          </div>

          {/* Modal Footer (Optional - for future actions) */}
          {!isLoading && data && data.length > 0 && (
            <div className="relative z-10 px-6 py-4 border-t border-[#263544]/10 bg-white/50">
              <p className="text-xs font-bold text-[#263544]/60 text-center">
                إجمالي النتائج: {data.length}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}