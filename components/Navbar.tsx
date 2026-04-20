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
        
        {/* Mobile menu button بتصميم زجاجي مع درازة داخلية */}
        {/* تم إزالة overflow-hidden لمنع قص أي عناصر مستقبلية */}
        <button 
          onClick={onMenuClick}
          className="md:hidden relative p-2.5 bg-white/60 backdrop-blur-md rounded-2xl text-[#263544] hover:text-[#C89355] border-2 border-white/90 hover:border-[#C89355]/40 shadow-sm hover:shadow-md transition-all active:scale-95 group/menu"
        >
          <div className="absolute inset-1 rounded-xl border border-dashed border-[#263544]/10 group-hover/menu:border-[#C89355]/30 pointer-events-none transition-colors" />
          <Menu size={22} className="relative z-10" />
        </button>

        {/* Bell button بتصميم زجاجي مع درازة داخلية */}
        {/* تم إزالة overflow-hidden ليسمح لشارة الإشعارات بالبروز للخارج */}
        <button 
          onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          className={`relative p-2.5 rounded-2xl transition-all active:scale-95 border-2 shadow-sm hover:shadow-md group/bell
            ${isNotificationsOpen || notifications.length > 0 
              ? 'bg-[#1a2530] text-[#C89355] border-[#C89355]/40 shadow-[0_8px_15px_rgba(38,53,68,0.3)]' 
              : 'bg-white/60 backdrop-blur-md text-[#263544] hover:text-[#C89355] border-white/90 hover:border-[#C89355]/40'}
          `}
        >
          <div className={`absolute inset-1 rounded-xl border border-dashed pointer-events-none transition-colors ${isNotificationsOpen || notifications.length > 0 ? 'border-[#C89355]/30' : 'border-[#263544]/10 group-hover/bell:border-[#C89355]/30'}`} />
          
          {notifications.length > 0 ? <BellRing size={22} className="animate-pulse relative z-10" /> : <Bell size={22} className="relative z-10" />}
          
          {/* شارة الإشعارات تطفو الآن بشكل صحيح خارج حدود الزر */}
          {notifications.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-black text-white border-2 border-[#1a2530] shadow-sm animate-bounce z-20">
              {notifications.length}
            </span>
          )}
        </button>

        {/* مربع الإشعارات بتصميم Glassmorphism + درازة */}
        {isNotificationsOpen && (
          <div className="absolute right-0 top-[calc(100%+12px)] w-80 bg-white/80 backdrop-blur-3xl border-2 border-white/90 rounded-[2.5rem] shadow-[0_25px_60px_rgba(38,53,68,0.15)] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 z-[99999] group/notif">
            
            <div className="absolute inset-1.5 rounded-[2.2rem] border border-dashed border-[#C89355]/30 pointer-events-none z-0" />
            
            <div className="relative z-10 p-5 border-b border-white/60 bg-white/40 flex items-center justify-between">
              <h3 className="font-black text-[#263544] text-sm flex items-center gap-2">
                <div className="p-1.5 bg-[#1a2530] rounded-lg shadow-inner border border-[#C89355]/30">
                  <Bell size={14} className="text-[#C89355]" />
                </div>
                الإشعارات
              </h3>
              {notifications.length > 0 && (
                <span className="bg-[#1a2530] text-[#C89355] border border-[#C89355]/30 shadow-sm text-[10px] font-black px-2 py-1 rounded-lg">
                  {notifications.length} جديد
                </span>
              )}
            </div>

            <div className="relative z-10 max-h-[350px] overflow-y-auto custom-scrollbar p-3">
              {notifications.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
                  <div className="w-14 h-14 bg-white/60 border border-white shadow-inner rounded-2xl flex items-center justify-center">
                    <Bell size={24} className="text-[#263544]/30" />
                  </div>
                  <p className="text-[#263544]/60 text-sm font-black">لا توجد إشعارات جديدة</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className="p-3 mb-2 last:mb-0 rounded-2xl border border-white/60 bg-white/40 hover:bg-white/90 shadow-sm hover:shadow-md hover:border-white flex items-start gap-3 group transition-all">
                    <div className={`mt-0.5 p-2.5 rounded-xl shrink-0 shadow-inner border ${notif.type === 'warning' ? 'bg-orange-50 border-orange-100 text-orange-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                      <AlertTriangle size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#263544] font-black leading-relaxed">{notif.text}</p>
                      <p className="text-[10px] text-[#263544]/60 mt-1.5 font-bold font-mono">{notif.time}</p>
                    </div>
                    <button 
                      onClick={() => dismissNotification(notif.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 bg-white/80 border border-white/90 rounded-lg text-[#263544]/40 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 shadow-sm transition-all shrink-0 active:scale-95"
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