"use client";
import { useState, useEffect, useRef } from 'react';
import { Bell, AlertTriangle, X, Menu } from "lucide-react";

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
    <div className="relative" dir="rtl" ref={dropdownRef}>
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2.5 bg-white rounded-xl text-slate-500 hover:text-[#00bba7] hover:border-[#00bba7] hover:shadow-md transition-all active:scale-95"
        >
          <Menu size={22} />
        </button>

        {/* Bell button */}
        <button 
          onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          className="p-2.5 bg-white  rounded-xl text-slate-500 hover:text-[#00bba7] hover:border-[#00bba7] hover:shadow-md transition-all active:scale-95"
        >
          <Bell size={22} className={notifications.length > 0 ? "text-[#00bba7]" : ""} />
          
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
              {notifications.length}
            </span>
          )}
        </button>

        {/* مربع الإشعارات */}
        {isNotificationsOpen && (
          <div className="absolute left-0 mt-3 w-80 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">

            
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">لا توجد إشعارات</div>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className="p-3 border-b border-slate-50 hover:bg-slate-50 flex items-start gap-3 group transition-colors">
                    <div className={`mt-1 p-1.5 rounded-lg ${notif.type === 'warning' ? 'bg-orange-50 text-orange-500' : 'bg-red-50 text-red-500'}`}>
                      <AlertTriangle size={14} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[12px] text-slate-700 font-medium leading-tight">{notif.text}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{notif.time}</p>
                    </div>
                    <button 
                      onClick={() => dismissNotification(notif.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
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