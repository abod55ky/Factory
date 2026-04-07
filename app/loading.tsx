import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm flex items-center gap-3">
        <Loader2 className="animate-spin text-blue-600" size={22} />
        <p className="text-sm font-semibold text-slate-700">جاري تحميل الصفحة...</p>
      </div>
    </div>
  );
}
