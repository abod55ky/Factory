"use client";
import { useState, useEffect, useRef } from 'react';
import { Bell, AlertTriangle, X, Menu, BellRing } from "lucide-react";

export default function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'الموظف أحمد تأخر 15 دقيقة', type: 'warning', time: '10 د' },
    { id: 2, text: 'نقص في مخزون القماش', type: 'error', time: '1 س' },
  ]);

  // مرجع (Ref) للكشف عن النقر خارج الصندوق
  const dropdownRef = useRef<HTMLDivElement>(null);

  // منطق إغلاق القائمة عند النقر في الخارج
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dismissNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    // أضفنا z-[9999] للحاوية الخارجية للـ Navbar لتأكيد أنها دائماً فوق
    <div className="relative z-[9999]" dir="rtl" ref={dropdownRef}>
      <div className="flex items-center gap-3 relative">
        
        {/* Mobile menu button */}
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2.5 bg-white/80 backdrop-blur-md rounded-xl text-slate-500 hover:text-[#00bba7] border border-white/50 hover:border-[#00bba7]/50 shadow-sm hover:shadow-md transition-all active:scale-95"
        >
          <Menu size={22} />
        </button>

        {/* Bell button */}
        <button 
          onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          className={`relative p-2.5 rounded-xl transition-all active:scale-95 border shadow-sm hover:shadow-md
            ${isNotificationsOpen || notifications.length > 0 
              ? 'bg-gradient-to-br from-[#00bba7] to-[#008275] text-[#E7C873] border-[#00bba7]/20' 
              : 'bg-white/80 backdrop-blur-md text-slate-500 hover:text-[#00bba7] border-white/50 hover:border-[#00bba7]/50'}
          `}
        >
          {notifications.length > 0 ? <BellRing size={22} className="animate-pulse" /> : <Bell size={22} />}
          
          {notifications.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white border-2 border-white shadow-sm animate-bounce">
              {notifications.length}
            </span>
          )}
        </button>

        {/* مربع الإشعارات */}
        {/* التعديل هنا: 
            1. top-[calc(100%+12px)] لجعله يظهر تحت الزر بمسافة مناسبة 
            2. z-[99999] ليكون فوق الـ Sidebar وأي شيء آخر
            3. left-0 ليتوضع صح
        */}
        {isNotificationsOpen && (
          <div className="absolute right-0 top-[calc(100%+12px)] w-80 bg-white/95 backdrop-blur-3xl border border-white/80 rounded-[2rem] shadow-[0_25px_50px_rgba(0,0,0,0.15)] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 z-[99999]">
            
            <div className="p-4 border-b border-slate-100/80 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <Bell size={16} className="text-[#00bba7]" />
                الإشعارات
              </h3>
              {notifications.length > 0 && (
                <span className="bg-[#E7C873]/20 text-[#b88710] text-[10px] font-bold px-2 py-1 rounded-lg">
                  {notifications.length} جديد
                </span>
              )}
            </div>

            <div className="max-h-[350px] overflow-y-auto custom-scrollbar p-2">
              {notifications.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center gap-3 opacity-60">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                    <Bell size={20} className="text-slate-400" />
                  </div>
                  <p className="text-slate-500 text-sm font-bold">لا توجد إشعارات جديدة</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className="p-3 mb-1 last:mb-0 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50 flex items-start gap-3 group transition-all">
                    <div className={`mt-0.5 p-2 rounded-xl shrink-0 ${notif.type === 'warning' ? 'bg-orange-50 border border-orange-100 text-orange-500' : 'bg-rose-50 border border-rose-100 text-rose-500'}`}>
                      <AlertTriangle size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-700 font-bold leading-relaxed">{notif.text}</p>
                      <p className="text-[10px] text-slate-400 mt-1.5 font-medium">{notif.time}</p>
                    </div>
                    <button 
                      onClick={() => dismissNotification(notif.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 bg-white border border-slate-100 rounded-lg text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-all shrink-0 active:scale-95"
                      title="إخفاء"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}