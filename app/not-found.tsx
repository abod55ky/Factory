import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4" dir="rtl">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-sm p-6 text-right">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-700 mb-4">
          <SearchX size={22} />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">الصفحة غير موجودة</h1>
        <p className="mt-2 text-sm text-slate-600 leading-7">
          الرابط الذي فتحته غير صحيح أو تم نقله. يمكنك العودة للوحة الرئيسية.
        </p>

        <div className="mt-5">
          <Link
            href="/home"
            className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
          >
            الذهاب إلى الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
