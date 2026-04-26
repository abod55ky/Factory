// "use client";

// import { useState, useMemo } from "react";
// import dynamic from "next/dynamic";
// import { Plus, Bus, ChevronLeft, MapPin, Users, Coins, BadgePercent, UserCheck } from "lucide-react";

// const AddBusModal = dynamic(() => import("@/components/AddBusModal"), { loading: () => null });
// const AddPassengerModal = dynamic(() => import("@/components/AddPassengerModal"), { loading: () => null });

// export interface Passenger {
//   employeeId: string;
//   name: string;
//   paidAmount: number;
//   isManual: boolean; // هل المبلغ يدوي أم تلقائي
// }

// export interface BusData {
//   id: string;
//   driverName: string;
//   driverPhone: string;
//   busNumber: string;
//   route: string;
//   capacity: number;
//   totalCost: number;
//   discountPercent: number;
//   passengers: Passenger[];
// }

// export default function TransportationPage() {
//   const [isAddBusOpen, setIsAddBusOpen] = useState(false);
//   const [isAddPassengerOpen, setIsAddPassengerOpen] = useState(false);
//   const [selectedBus, setSelectedBus] = useState<BusData | null>(null);

//   const [buses, setBuses] = useState<BusData[]>([
//     {
//       id: "1", driverName: "أبو محمد", driverPhone: "0933123456", busNumber: "123456",
//       route: "خط صحنايا - الكسوة", capacity: 30, totalCost: 1500000, discountPercent: 20,
//       passengers: [] 
//     }
//   ]);

//   const handleSaveBus = (newBus: any) => {
//     setBuses([...buses, { ...newBus, id: Date.now().toString(), passengers: [] }]);
//     setIsAddBusOpen(false);
//   };

//   const handleSavePassenger = (passengerData: Passenger) => {
//     setBuses(buses.map(bus => 
//       bus.id === selectedBus?.id 
//         ? { ...bus, passengers: [...bus.passengers, passengerData] }
//         : bus
//     ));
//     setIsAddPassengerOpen(false);
//   };

//   return (
//     <div className="relative z-10 w-full max-w-7xl min-h-[85vh] mx-auto bg-[#101720]/80 backdrop-blur-2xl rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] border border-white/5 flex flex-col overflow-hidden" dir="rtl">

//         <div className="absolute inset-0 opacity-[0.06] pointer-events-none z-0"
//           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 12h24M12 0v24' stroke='%23C89355' stroke-width='1' stroke-dasharray='4 4' fill='none'/%3E%3C/svg%3E")`, backgroundSize: '24px 24px' }}
//         />

//         <div className="p-6 md:p-10 h-full overflow-y-auto custom-scrollbar relative z-10">
//           <nav className="mb-6 relative overflow-hidden flex items-center gap-2 text-xs font-black text-slate-400 bg-[#1a2530]/60 backdrop-blur-xl w-fit px-4 py-2.5 rounded-2xl border border-white/5 shadow-sm group">
//             <div className="absolute inset-1 rounded-xl border border-dashed border-[#C89355]/30 pointer-events-none" />
//             <span className="text-white relative z-10">إدارة الخدمات</span>
//             <ChevronLeft size={14} className="text-[#C89355] relative z-10" />
//             <span className="text-white relative z-10">نقل الموظفين</span>
//           </nav>

//           <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-6">
//             <div>
//               <div className="flex items-center gap-4 mb-2">
//                 <div className="p-3 bg-[#1a2530] rounded-2xl shadow-lg border border-[#C89355]/40 relative outline-dashed outline-1 outline-[#C89355]/50 outline-offset-4">
//                   <Bus size={24} className="text-[#C89355]" strokeWidth={2.5} />
//                 </div>
//                 <h1 className="text-3xl font-black text-white tracking-tight">مواصلات الموظفين</h1>
//               </div>
//             </div>

//             <button onClick={() => setIsAddBusOpen(true)} className="relative overflow-hidden bg-[#1a2530] hover:bg-[#263544] text-[#C89355] px-6 py-3 rounded-2xl flex items-center gap-2 shadow-[0_10px_20px_rgba(0,0,0,0.3)] transition-all active:scale-95 text-sm font-black border border-[#C89355]/40 group">
//               <div className="absolute inset-1.5 rounded-xl border border-dashed border-[#C89355]/30 pointer-events-none" />
//               <Plus size={18} className="group-hover:animate-spin relative z-10" /> 
//               <span className="relative z-10">إضافة حافلة</span>
//             </button>
//           </header>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {buses.map((bus) => {
//               const currentPassengers = bus.passengers.length;
//               const isFull = currentPassengers >= bus.capacity;
//               const netCost = bus.totalCost - (bus.totalCost * (bus.discountPercent / 100));

//               return (
//                 <div key={bus.id} className="relative bg-[#1a2530]/40 backdrop-blur-2xl rounded-[2.5rem] shadow-sm border-2 border-[#263544] p-6 sm:p-8 overflow-hidden">
//                   <div className="absolute inset-1.5 rounded-[2.2rem] border border-dashed border-[#C89355]/20 pointer-events-none z-0" />

//                   <div className="relative z-10 flex flex-col h-full">
//                     <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-5">
//                       <div>
//                         <h2 className="text-xl font-black text-white mb-1">{bus.route}</h2>
//                         <p className="text-sm font-bold text-slate-400">السائق: {bus.driverName} | {bus.busNumber}</p>
//                       </div>
//                       <div className={`flex flex-col items-center justify-center min-w-[70px] p-2.5 rounded-2xl border ${isFull ? 'bg-rose-500/10 border-rose-500/30' : 'bg-[#101720] border-[#C89355]/30'}`}>
//                         <div className="flex items-baseline gap-1 dir-ltr">
//                           <span className={`text-xl font-black ${isFull ? 'text-rose-500' : 'text-[#C89355]'}`}>{currentPassengers}</span>
//                           <span className="text-slate-500 text-sm font-bold">/{bus.capacity}</span>
//                         </div>
//                         <span className="text-[9px] font-bold text-slate-400">الركاب</span>
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-3 gap-3 mb-8">
//                       <CostCard label="التكلفة الكلية" value={bus.totalCost} isGold={false} />
//                       <CostCard label="حسم الشركة" value={`${bus.discountPercent}%`} isGold={false} />
//                       <CostCard label="الصافي للركاب" value={netCost} isGold={true} />
//                     </div>

//                     <button onClick={() => { setSelectedBus(bus); setIsAddPassengerOpen(true); }} disabled={isFull}
//                       className="w-full bg-[#C89355] hover:bg-[#b07d45] text-[#101720] py-3.5 rounded-2xl flex justify-center items-center gap-2 shadow-[0_5px_15px_rgba(200,147,85,0.2)] transition-all font-black text-sm disabled:opacity-50">
//                       <Plus size={18} strokeWidth={3} /> إضافة موظف للباص
//                     </button>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         {isAddBusOpen && <AddBusModal isOpen={isAddBusOpen} onClose={() => setIsAddBusOpen(false)} onSave={handleSaveBus} />}
//         {isAddPassengerOpen && selectedBus && <AddPassengerModal isOpen={isAddPassengerOpen} onClose={() => setIsAddPassengerOpen(false)} onSave={handleSavePassenger} busData={selectedBus} />}
//     </div>
//   );
// }

// function CostCard({ label, value, isGold }: { label: string, value: string | number, isGold: boolean }) {
//   return (
//     <div className="bg-[#101720]/60 p-3 rounded-xl border border-[#263544]">
//       <span className="text-[9px] font-black text-slate-500 block mb-1 uppercase">{label}</span>
//       <span className={`text-sm font-mono font-black ${isGold ? 'text-[#C89355]' : 'text-white'}`}>
//         {typeof value === 'number' ? value.toLocaleString() : value}
//         {typeof value === 'number' && <span className="text-[8px] mr-1">ل.س</span>}
//       </span>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Plus, Bus, ChevronLeft, MapPin, MoreVertical, Edit2, Trash2, UserMinus } from "lucide-react";

const AddBusModal = dynamic(() => import("@/components/AddBusModal"), { loading: () => null });
const AddPassengerModal = dynamic(() => import("@/components/AddPassengerModal"), { loading: () => null });

export interface Passenger {
  id: string;
  employeeId: string;
  name: string;
  paidAmount: number;
  isManual: boolean;
}

export interface BusData {
  id: string;
  driverName: string;
  driverPhone: string;
  busNumber: string;
  route: string;
  capacity: number;
  totalCost: number;
  discountPercent: number;
  passengers: Passenger[];
}

type BusDraft = Omit<BusData, "id" | "passengers"> & {
  id?: string;
  passengers?: Passenger[];
};

export default function TransportationPage() {
  const [buses, setBuses] = useState<BusData[]>([]);
  const [isAddBusOpen, setIsAddBusOpen] = useState(false);
  const [isAddPassengerOpen, setIsAddPassengerOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState<BusData | null>(null);

  // للتحكم بقائمة الـ 3 نقاط
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleSaveBus = (newBus: BusDraft) => {
    if (newBus.id) {
      // تعديل
      setBuses(buses.map(b => b.id === newBus.id ? { ...b, ...newBus } : b));
    } else {
      // إضافة
      setBuses([...buses, { ...newBus, id: Date.now().toString(), passengers: [] }]);
    }
    setIsAddBusOpen(false);
  };

  const handleDeleteBus = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا الباص؟")) {
      setBuses(buses.filter(b => b.id !== id));
      setActiveDropdown(null);
    }
  };

  const handleSavePassenger = (passengerData: Passenger) => {
    setBuses(buses.map(bus =>
      bus.id === selectedBus?.id
        ? { ...bus, passengers: [...bus.passengers, passengerData] }
        : bus
    ));
    setIsAddPassengerOpen(false);
  };

  const handleRemovePassenger = (busId: string, passengerId: string) => {
    if (confirm("هل أنت متأكد من إزالة هذا الموظف من الباص؟")) {
      setBuses(buses.map(bus =>
        bus.id === busId
          ? { ...bus, passengers: bus.passengers.filter(p => p.id !== passengerId) }
          : bus
      ));
    }
  };

  return (
    <div className="relative z-10 w-full max-w-7xl min-h-[85vh] mx-auto bg-white/50 backdrop-blur-2xl rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(38,53,68,0.2)] border-2 border-dashed border-[#C89355]/60 flex flex-col" dir="rtl">

      {/* نقشة الفايبر (الستايل الفاتح) */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none rounded-[3rem]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 12h24M12 0v24' stroke='%23263544' stroke-width='1' stroke-dasharray='4 4' fill='none'/%3E%3C/svg%3E")`, backgroundSize: '24px 24px' }}
      />

      <div className="p-6 md:p-10 h-full overflow-y-auto custom-scrollbar relative z-10">
        <nav className="mb-6 relative flex items-center gap-2 text-xs font-black text-slate-500 bg-white/60 backdrop-blur-xl w-fit px-4 py-2.5 rounded-2xl border border-white/80 shadow-[0_5px_15px_rgba(38,53,68,0.05)]">
          <span className="text-[#263544]">إدارة الخدمات</span>
          <ChevronLeft size={14} className="text-[#C89355]" />
          <span className="text-[#263544]">مواصلات الموظفين</span>
        </nav>

        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#263544]/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#1a2530] rounded-2xl shadow-[0_15px_25px_rgba(38,53,68,0.4)] border border-[#C89355]/40 outline-dashed outline-1 outline-[#C89355]/50 outline-offset-4">
              <Bus size={22} className="text-[#C89355]" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black text-[#263544] tracking-tight drop-shadow-sm">إدارة الحافلات</h1>
          </div>

          <div className="w-full md:w-auto flex justify-end">
            <button
              onClick={() => { setSelectedBus(null); setIsAddBusOpen(true); }}
              className="relative overflow-hidden bg-[#1a2530] hover:bg-[#263544] text-[#C89355] px-5 py-3 rounded-2xl flex items-center gap-2 shadow-[0_10px_20px_rgba(38,53,68,0.3)] transition-all active:scale-95 text-sm font-black border border-[#C89355]/40 group"
            >
              {/* الدرزة الداخلية المقطعة */}
              <div className="absolute inset-1.5 rounded-xl border border-dashed border-[#C89355]/30 pointer-events-none transition-colors group-hover:border-[#C89355]/50" />

              {/* الأيقونة مع الأنيميشن */}
              <Plus size={18} className="group-hover:animate-spin relative z-10" />

              <span className="relative z-10 tracking-wide">إضافة باص جديد</span>
            </button>
          </div>
        </header>

        {buses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-white/60 p-6 rounded-full mb-4 shadow-sm border border-slate-200">
              <Bus size={48} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-700 mb-2">لا يوجد باصات مسجلة</h3>
            <p className="text-slate-500 font-bold mb-6">قم بإضافة باص جديد للبدء بتسجيل اشتراكات الموظفين.</p>
            <div className="w-full md:w-auto flex justify-end">
              <button
                onClick={() => setIsAddBusOpen(true)}
                className="relative overflow-hidden bg-[#1a2530] hover:bg-[#263544] text-[#C89355] px-5 py-3 rounded-2xl flex items-center gap-2 shadow-[0_10px_20px_rgba(38,53,68,0.3)] transition-all active:scale-95 text-sm font-black border border-[#C89355]/40 group"
              >
                {/* الدرزة الداخلية المقطعة */}
                <div className="absolute inset-1.5 rounded-xl border border-dashed border-[#C89355]/30 pointer-events-none transition-colors group-hover:border-[#C89355]/50" />

                {/* الأيقونة مع الأنيميشن */}
                <Plus size={18} className="group-hover:animate-spin relative z-10" />

                <span className="relative z-10 tracking-wide">إضافة باص</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {buses.map((bus) => {
              const currentPassengers = bus.passengers.length;
              const isFull = currentPassengers >= bus.capacity;
              const netCost = bus.totalCost - (bus.totalCost * (bus.discountPercent / 100));

              // الحساب الديناميكي للعرض
              const manualTotal = bus.passengers.filter(p => p.isManual).reduce((sum, p) => sum + p.paidAmount, 0);
              const autoCount = bus.passengers.filter(p => !p.isManual).length;
              const autoRate = autoCount > 0 ? Math.max(0, Math.round((netCost - manualTotal) / autoCount)) : 0;

              return (
                <div key={bus.id} className="relative bg-white/60 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(38,53,68,0.08)] border-2 border-white/90 p-6 sm:p-8">
                  <div className="absolute inset-1.5 rounded-[2.2rem] border border-dashed border-[#C89355]/30 pointer-events-none" />

                  <div className="relative z-10">
                    {/* ترويسة الكارت */}
                    <div className="flex justify-between items-start mb-6 border-b border-slate-200 pb-5">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <MapPin size={18} className="text-[#C89355]" />
                          <h2 className="text-2xl font-black text-[#263544]">{bus.route}</h2>
                        </div>
                        <p className="text-sm font-bold text-slate-500 pr-6">
                          السائق: <span className="text-slate-800">{bus.driverName}</span>
                          <span className="mx-2">|</span> اللوحة: <span className="font-mono text-[#C89355]">{bus.busNumber}</span>
                          <span className="mx-2">|</span> 📞 <span className="font-mono">{bus.driverPhone}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* العداد */}
                        <div className={`flex flex-col items-center justify-center min-w-17.5 p-2 rounded-xl border ${isFull ? 'bg-rose-50 border-rose-200' : 'bg-slate-100 border-slate-200'}`}>
                          <div className="flex items-baseline gap-1 dir-ltr">
                            <span className={`text-xl font-black ${isFull ? 'text-rose-500' : 'text-[#263544]'}`}>{currentPassengers}</span>
                            <span className="text-slate-400 text-sm font-bold">/{bus.capacity}</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">الركاب</span>
                        </div>

                        {/* زر الـ 3 نقاط */}
                        <div className="relative">
                          <button onClick={() => setActiveDropdown(activeDropdown === bus.id ? null : bus.id)} className="p-2 text-slate-400 hover:text-[#263544] hover:bg-slate-100 rounded-xl transition-all">
                            <MoreVertical size={20} />
                          </button>
                          {activeDropdown === bus.id && (
                            <div className="absolute left-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95">
                              <button onClick={() => { setSelectedBus(bus); setIsAddBusOpen(true); setActiveDropdown(null); }} className="w-full text-right px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-50">
                                <Edit2 size={16} className="text-[#C89355]" /> تعديل البيانات
                              </button>
                              <button onClick={() => handleDeleteBus(bus.id)} className="w-full text-right px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2">
                                <Trash2 size={16} /> مسح الباص
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* تفاصيل التكاليف */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
                        <span className="text-[10px] font-black text-slate-500 block mb-1 uppercase">التكلفة الكلية</span>
                        <span className="text-lg font-mono font-black text-[#263544]">{bus.totalCost.toLocaleString()} <span className="text-[10px]">ل.س</span></span>
                      </div>
                      <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
                        <span className="text-[10px] font-black text-slate-500 block mb-1 uppercase">حسم الشركة</span>
                        <span className="text-lg font-mono font-black text-[#00bba7]">{bus.discountPercent}%</span>
                      </div>
                      <div className="bg-[#1a2530] p-4 rounded-2xl border border-[#263544] shadow-inner">
                        <span className="text-[10px] font-black text-[#C89355] block mb-1 uppercase">الصافي المطلوب من الركاب</span>
                        <span className="text-lg font-mono font-black text-[#C89355]">{netCost.toLocaleString()} <span className="text-[10px] text-slate-400">ل.س</span></span>
                      </div>
                    </div>

                    {/* جدول الركاب (نفس ستايل الموظفين) */}
                    <div className="mb-6">
                      <div className="flex justify-between items-end mb-3 px-2">
                        <h3 className="font-black text-[#263544]">قائمة المشتركين بالباص</h3>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-right">
                          <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                              <th className="p-4 text-slate-500 font-black text-xs uppercase text-center w-24">الكود</th>
                              <th className="p-4 text-slate-500 font-black text-xs uppercase text-right pr-2">الاسم</th>
                              <th className="p-4 text-slate-500 font-black text-xs uppercase text-center">التكلفة المترتبة</th>
                              <th className="p-4 text-slate-500 font-black text-xs uppercase text-center">نوع الحساب</th>
                              <th className="p-4 text-slate-500 font-black text-xs uppercase text-center">إجراءات</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {bus.passengers.length === 0 ? (
                              <tr><td colSpan={5} className="p-8 text-center text-slate-400 font-bold">لا يوجد موظفين مسجلين في هذا الباص بعد.</td></tr>
                            ) : (
                              bus.passengers.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50/50 transition-all">
                                  <td className="p-4 text-center font-mono font-bold text-slate-500 text-sm">{p.employeeId}</td>
                                  <td className="p-4 text-right pr-2 font-black text-[#263544]">{p.name}</td>
                                  <td className="p-4 text-center font-mono font-black text-[#00bba7] text-sm">
                                    {p.isManual ? p.paidAmount.toLocaleString() : autoRate.toLocaleString()} <span className="text-[10px] text-slate-400">ل.س</span>
                                  </td>
                                  <td className="p-4 text-center">
                                    <span className={`px-3 py-1 rounded-xl text-[10px] font-black ${p.isManual ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-600'}`}>
                                      {p.isManual ? 'مخصص (يدوي)' : 'تلقائي (متساوي)'}
                                    </span>
                                  </td>
                                  <td className="p-4 text-center">
                                    <button onClick={() => handleRemovePassenger(bus.id, p.id)} className="text-rose-400 hover:bg-rose-50 p-2 rounded-xl transition-all" title="إزالة من الباص">
                                      <UserMinus size={16} />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <button onClick={() => { setSelectedBus(bus); setIsAddPassengerOpen(true); }} disabled={isFull} className="w-full bg-[#1a2530] hover:bg-[#263544] text-[#C89355] py-3.5 rounded-2xl flex justify-center items-center gap-2 shadow-md transition-all font-black text-sm disabled:opacity-50 border border-[#C89355]/30">
                      <Plus size={18} /> {isFull ? 'اكتمل العدد' : 'إضافة موظف للباص'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

  {isAddBusOpen && <AddBusModal isOpen={isAddBusOpen} onClose={() => setIsAddBusOpen(false)} onSave={handleSaveBus} initialData={selectedBus ?? undefined} />}
        {isAddPassengerOpen && selectedBus && <AddPassengerModal isOpen={isAddPassengerOpen} onClose={() => setIsAddPassengerOpen(false)} onSave={handleSavePassenger} busData={selectedBus} />}
      </div>
    </div>
  );
}