"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Fingerprint,
  KeyRound,
  Loader2,
  LogIn,
  LogOut,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import apiClient from "@/lib/api-client";
import {
  biometricApi,
  buildBiometricPayload,
  type BiometricAttendanceResult,
} from "@/lib/biometric-api";
import { useAuthStore } from "@/stores/auth-store";

type StoredBiometricKey = {
  keyId: string;
  publicKeyBase64: string;
  privateKeyBase64: string;
  createdAt: string;
};

type AuthMeResponse = {
  id?: string;
  name?: string;
  username?: string;
  email?: string;
  role?: string;
  employeeId?: string | null;
};

const BIOMETRIC_STORAGE_KEY = "factory_biometric_key_v1";
const EMPLOYEE_ID_REGEX = /^EMP[0-9]{3,}$/;
const textEncoder = new TextEncoder();

const toBase64Url = (data: ArrayBuffer | Uint8Array) => {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const fromBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = normalized.length % 4 === 0 ? 0 : 4 - (normalized.length % 4);
  const padded = `${normalized}${"=".repeat(padLength)}`;
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
};

const readStoredKey = (): StoredBiometricKey | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(BIOMETRIC_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredBiometricKey>;
    if (
      !parsed ||
      typeof parsed.keyId !== "string" ||
      typeof parsed.publicKeyBase64 !== "string" ||
      typeof parsed.privateKeyBase64 !== "string"
    ) {
      return null;
    }

    return {
      keyId: parsed.keyId,
      publicKeyBase64: parsed.publicKeyBase64,
      privateKeyBase64: parsed.privateKeyBase64,
      createdAt: parsed.createdAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
};

const saveStoredKey = (key: StoredBiometricKey) => {
  localStorage.setItem(BIOMETRIC_STORAGE_KEY, JSON.stringify(key));
};

const clearStoredKey = () => {
  localStorage.removeItem(BIOMETRIC_STORAGE_KEY);
};

const ensureCryptoSupport = () => {
  if (typeof window === "undefined") {
    throw new Error("لا يمكن تنفيذ البصمة خارج المتصفح.");
  }

  if (!window.isSecureContext) {
    throw new Error("ميزة البصمة تتطلب HTTPS أو localhost.");
  }

  if (!window.crypto?.subtle) {
    throw new Error("المتصفح الحالي لا يدعم Web Crypto المطلوبة لتوقيع البصمة.");
  }
};

const randomHex = (bytesLength: number) => {
  const bytes = new Uint8Array(bytesLength);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
};

const generateBiometricKeyPair = async (): Promise<StoredBiometricKey> => {
  ensureCryptoSupport();

  const keyPair = (await window.crypto.subtle.generateKey(
    { name: "Ed25519" } as AlgorithmIdentifier,
    true,
    ["sign", "verify"],
  )) as CryptoKeyPair;

  const publicKeyRaw = await window.crypto.subtle.exportKey("raw", keyPair.publicKey);
  const privateKeyPkcs8 = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

  const key: StoredBiometricKey = {
    keyId: `WEB-${Date.now().toString(36).toUpperCase()}-${randomHex(4).toUpperCase()}`,
    publicKeyBase64: toBase64Url(publicKeyRaw),
    privateKeyBase64: toBase64Url(privateKeyPkcs8),
    createdAt: new Date().toISOString(),
  };

  saveStoredKey(key);
  return key;
};

const signPayload = async (privateKeyBase64: string, payload: string) => {
  ensureCryptoSupport();

  const privateKeyBytes = fromBase64Url(privateKeyBase64);
  const privateKey = await window.crypto.subtle.importKey(
    "pkcs8",
    privateKeyBytes,
    { name: "Ed25519" } as AlgorithmIdentifier,
    false,
    ["sign"],
  );

  const signature = await window.crypto.subtle.sign(
    { name: "Ed25519" } as AlgorithmIdentifier,
    privateKey,
    textEncoder.encode(payload),
  );

  return toBase64Url(signature);
};

const formatAttendanceTime = (timestamp: string) => {
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) return "--:--";

  return new Intl.DateTimeFormat("ar-SY", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(parsed);
};

const parseErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as
      | { message?: string | string[]; error?: { message?: string | string[] } }
      | undefined;
    const message = payload?.error?.message ?? payload?.message;

    if (Array.isArray(message)) {
      return message.join(" | ");
    }

    if (typeof message === "string" && message.trim()) {
      return message;
    }

    if (typeof error.message === "string" && error.message.trim()) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
};

export default function BiometricPage() {
  const currentUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [storedKey, setStoredKey] = useState<StoredBiometricKey | null>(null);
  const [employeeId, setEmployeeId] = useState("");
  const [latestAttendance, setLatestAttendance] =
    useState<BiometricAttendanceResult | null>(null);
  const [isHydratingProfile, setIsHydratingProfile] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [clockingType, setClockingType] = useState<"IN" | "OUT" | null>(null);

  const username = useMemo(
    () => (currentUser?.username || currentUser?.email || "").trim(),
    [currentUser?.email, currentUser?.username],
  );

  useEffect(() => {
    setStoredKey(readStoredKey());
  }, []);

  useEffect(() => {
    if (currentUser?.employeeId && !employeeId) {
      setEmployeeId(currentUser.employeeId);
    }
  }, [currentUser?.employeeId, employeeId]);

  useEffect(() => {
    let active = true;

    const hydrateUserProfile = async () => {
      setIsHydratingProfile(true);
      try {
        const response = await apiClient.get<AuthMeResponse>("/auth/me");
        const profile = response.data;

        if (!active || !profile) return;

        setUser({
          id: profile.id,
          name: profile.name,
          username: profile.username,
          email: profile.email,
          role: profile.role,
          employeeId: profile.employeeId || undefined,
        });

        if (profile.employeeId && !employeeId) {
          setEmployeeId(profile.employeeId);
        }
      } catch {
        // Silent failure: page can still work using current store data.
      } finally {
        if (active) {
          setIsHydratingProfile(false);
        }
      }
    };

    void hydrateUserProfile();

    return () => {
      active = false;
    };
  }, [employeeId, setUser]);

  const ensureKey = async () => {
    const cached = storedKey || readStoredKey();
    if (cached) {
      setStoredKey(cached);
      return cached;
    }

    const generated = await generateBiometricKeyPair();
    setStoredKey(generated);
    return generated;
  };

  const handleRegisterBiometric = async () => {
    setIsEnrolling(true);

    try {
      const key = await ensureKey();
      const start = await biometricApi.registerStart({
        keyId: key.keyId,
        publicKeyBase64: key.publicKeyBase64,
        deviceName: `Factory Web (${navigator.platform || "browser"})`,
      });

      const payload = buildBiometricPayload(
        "REGISTER",
        start.challengeId,
        start.challengeBase64,
      );
      const signatureBase64 = await signPayload(key.privateKeyBase64, payload);

      await biometricApi.registerFinish({
        challengeId: start.challengeId,
        challengeBase64: start.challengeBase64,
        signatureBase64,
      });

      toast.success("تم تسجيل بصمتك على هذا الجهاز بنجاح.");
    } catch (error: unknown) {
      toast.error(parseErrorMessage(error, "فشل تسجيل البصمة. حاول مرة أخرى."));
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleBiometricAttendance = async (attendanceType: "IN" | "OUT") => {
    if (!username) {
      toast.error("لا يمكن تنفيذ البصمة لأن اسم المستخدم غير متوفر.");
      return;
    }

    const normalizedEmployeeId = employeeId.trim().toUpperCase();
    if (!EMPLOYEE_ID_REGEX.test(normalizedEmployeeId)) {
      toast.error("أدخل رقم موظف صحيح بصيغة EMP001.");
      return;
    }

    setClockingType(attendanceType);

    try {
      const key = await ensureKey();
      const start = await biometricApi.loginStart({ username });

      if (!start.allowedKeyIds.includes(key.keyId)) {
        throw new Error("هذا الجهاز غير مسجل بصمة لهذا الحساب. سجل البصمة أولاً.");
      }

      const payload = buildBiometricPayload("LOGIN", start.challengeId, start.challengeBase64);
      const signatureBase64 = await signPayload(key.privateKeyBase64, payload);

      const finish = await biometricApi.loginFinish({
        challengeId: start.challengeId,
        challengeBase64: start.challengeBase64,
        keyId: key.keyId,
        signatureBase64,
        markAttendance: true,
        employeeId: normalizedEmployeeId,
        attendanceType,
        attendanceDeviceId: key.keyId,
        attendanceLocation: "factory-web",
      });

      if (finish.user) {
        setUser({
          id: finish.user.id,
          name: finish.user.name,
          username: finish.user.username,
          role: finish.user.role,
          employeeId: normalizedEmployeeId,
        });
      }

      if (finish.attendance) {
        setLatestAttendance(finish.attendance);

        const attendanceTime = formatAttendanceTime(finish.attendance.timestamp);
        const actionLabel = finish.attendance.type === "IN" ? "دخول" : "خروج";

        toast.success(`تم تسجيل ${actionLabel} الساعة ${attendanceTime}`);
      } else {
        toast.success("تم التحقق بالبصمة لكن لم يتم تسجيل الحضور.");
      }
    } catch (error: unknown) {
      toast.error(parseErrorMessage(error, "فشلت عملية البصمة أو تسجيل الحضور."));
    } finally {
      setClockingType(null);
    }
  };

  const handleClearBiometric = async () => {
    if (!storedKey) return;

    const shouldProceed = window.confirm("هل تريد حذف البصمة من هذا الجهاز؟");
    if (!shouldProceed) return;

    try {
      await biometricApi.revoke({ keyId: storedKey.keyId });
    } catch {
      // If server-side credential is missing (e.g., restart in testing mode), still clear local key.
    } finally {
      clearStoredKey();
      setStoredKey(null);
      toast.success("تم حذف بيانات البصمة من هذا الجهاز.");
    }
  };

  return (
    <div className="relative z-10 w-full max-w-7xl min-h-[85vh] mx-auto bg-white/70 backdrop-blur-3xl rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border-2 border-[#E7C873]/80 flex flex-col overflow-hidden" dir="rtl">
        
        {/* المحتوى الداخلي */}
        <div className="p-6 md:p-10 h-full overflow-y-auto custom-scrollbar">
          
          <header className="mb-10 text-right border-b border-black/5 pb-6 relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-gradient-to-br from-[#00bba7] to-[#008275] rounded-2xl shadow-lg shadow-[#00bba7]/20 border border-[#00bba7]/20">
                {/* أنيميشن قفز لأيقونة العنوان */}
                <Fingerprint size={24} className="text-white animate-bounce" />
              </div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">بصمتي وحضوري</h1>
            </div>
            <p className="text-slate-500 text-sm font-medium pr-14 mt-1">
              سجل بصمتك مرة واحدة، وبعدها بصمة واحدة تسجل الحضور مباشرة مع الوقت بالدقيقة.
            </p>
          </header>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            
            {/* كارد تسجيل البصمة (Glassmorphism) */}
            <section className="bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-white/80 shadow-[0_15px_30px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all p-8 group">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-[#00bba7]/10 text-[#00bba7] border border-[#00bba7]/20">
                  <ShieldCheck size={22} className="group-hover:animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800">تسجيل البصمة</h2>
                  <p className="text-xs text-slate-500 font-medium">ربط هذا الجهاز بحسابك البيومتري</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6 hover:border-[#00bba7]/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-[#E7C873]/10 rounded-lg">
                    <KeyRound className="text-[#E7C873] shrink-0" size={20} />
                  </div>
                  <div className="text-sm text-slate-600 w-full">
                    <p className="font-black text-slate-800">حالة الجهاز:</p>
                    {storedKey ? (
                      <div className="mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-emerald-600 font-bold text-xs mb-1 flex items-center gap-1"><CheckCircle2 size={14}/> مسجل محلياً</p>
                        <p className="text-xs text-slate-500">معرف المفتاح: <span className="font-mono font-bold text-slate-700">{storedKey.keyId}</span></p>
                      </div>
                    ) : (
                      <p className="mt-2 text-rose-500 font-bold text-xs bg-rose-50 p-3 rounded-xl border border-rose-100 flex items-center gap-1"><AlertCircle size={14}/> لا يوجد مفتاح بصمة محلي على هذا الجهاز بعد.</p>
                    )}
                    <p className="mt-3 text-xs font-bold text-slate-500 flex items-center justify-between border-t border-slate-100 pt-3">
                      <span>المستخدم الحالي:</span>
                      <span className="text-[#00bba7] px-2 py-1 bg-[#00bba7]/10 rounded-md font-mono">
                        {isHydratingProfile ? "تحديث..." : (username || "غير متوفر")}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleRegisterBiometric}
                  disabled={isEnrolling}
                  className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#00bba7] to-[#008275] text-white font-bold text-sm hover:from-[#00a392] hover:to-[#006e63] shadow-[0_8px_20px_rgba(0,187,167,0.3)] active:scale-95 disabled:opacity-60 transition-all border border-[#00bba7]/50"
                >
                  {isEnrolling ? <Loader2 size={18} className="animate-spin" /> : <Fingerprint size={18} />}
                  {isEnrolling ? "جارٍ التسجيل..." : "تسجيل بصمة هذا الجهاز"}
                </button>

                <button
                  type="button"
                  onClick={handleClearBiometric}
                  disabled={!storedKey}
                  className="flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-rose-200 text-rose-600 font-bold text-sm hover:bg-rose-50 shadow-sm active:scale-95 disabled:opacity-50 transition-all"
                  title="حذف البصمة من الجهاز"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </section>

            {/* كارد تسجيل الحضور (Glassmorphism) */}
            <section className="bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-white/80 shadow-[0_15px_30px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all p-8 group">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-[#E7C873]/20 text-[#b88710] border border-[#E7C873]/30">
                  <Clock3 size={22} className="group-hover:animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800">تسجيل الحضور بالبصمة</h2>
                  <p className="text-xs text-slate-500 font-medium">بصمة واحدة = حفظ وقت الدخول أو الخروج</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-black text-slate-700 mb-2">رقم الموظف</label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(event) => setEmployeeId(event.target.value.toUpperCase())}
                  placeholder="EMP001"
                  className="w-full rounded-2xl border border-slate-200 bg-white/50 backdrop-blur-sm px-4 py-3 font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#00bba7]/40 focus:border-[#00bba7] shadow-inner transition-all text-lg"
                  dir="ltr"
                />
                <p className="text-[11px] font-bold text-slate-400 mt-2 flex items-center gap-1.5">
                  <AlertCircle size={12} className="text-[#E7C873]"/>
                  يجب أن يكون رقم الموظف مطابقاً لحسابك.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void handleBiometricAttendance("IN")}
                  disabled={clockingType !== null}
                  className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-3.5 rounded-xl bg-gradient-to-r from-[#00bba7] to-[#008275] text-white font-bold text-sm shadow-[0_8px_20px_rgba(0,187,167,0.3)] active:scale-95 disabled:opacity-60 transition-all border border-[#00bba7]/50"
                >
                  {clockingType === "IN" ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} className="group-hover:animate-bounce" />}
                  بصمة دخول
                </button>

                <button
                  type="button"
                  onClick={() => void handleBiometricAttendance("OUT")}
                  disabled={clockingType !== null}
                  className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-3.5 rounded-xl border border-slate-200 bg-white shadow-sm text-slate-700 font-bold text-sm hover:bg-slate-50 hover:border-slate-300 active:scale-95 disabled:opacity-60 transition-all"
                >
                  {clockingType === "OUT" ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} className="group-hover:animate-bounce" />}
                  بصمة خروج
                </button>
              </div>

              {/* النتيجة / آخر سجل */}
              <div className="mt-8 rounded-2xl border border-slate-100 bg-white/50 backdrop-blur-sm p-5 shadow-sm">
                {latestAttendance ? (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full shrink-0">
                      <CheckCircle2 size={20} />
                    </div>
                    <div className="text-slate-700 w-full">
                      <p className="font-black text-slate-800 text-base">
                        آخر عملية: <span className={latestAttendance.type === "IN" ? "text-[#00bba7]" : "text-rose-500"}>{latestAttendance.type === "IN" ? "دخول" : "خروج"}</span>
                      </p>
                      <div className="mt-2 bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500">الوقت المسجل:</span>
                        <span className="font-mono font-black text-lg text-slate-800">{formatAttendanceTime(latestAttendance.timestamp)}</span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-400 mt-2 text-center bg-slate-50 py-1 rounded-lg">
                        {latestAttendance.action === "created" ? "سجل جديد" : "تحديث سجل اليوم"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 text-sm text-slate-400 py-4">
                    <Fingerprint className="text-slate-300" size={32} />
                    <span className="font-bold">لا يوجد تسجيل حضور بالبصمة بعد.</span>
                  </div>
                )}
              </div>
            </section>
          </div>
          
        </div>
    </div>
  );
}