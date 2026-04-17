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
    <div className="min-h-screen bg-slate-50 p-6 md:p-8" dir="rtl">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-[#00bba7]">بصمتي وحضوري</h1>
        <p className="text-sm text-slate-500 mt-2">
          سجل بصمتك مرة واحدة، وبعدها بصمة واحدة تسجل الحضور مباشرة مع الوقت بالدقيقة.
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-[#00bba7]/10 text-[#00bba7]">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">تسجيل البصمة</h2>
              <p className="text-xs text-slate-500">ربط هذا الجهاز بحسابك البيومتري</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 mb-4">
            <div className="flex items-start gap-3">
              <KeyRound className="text-[#E7C873] shrink-0" size={18} />
              <div className="text-sm text-slate-600">
                <p className="font-bold text-slate-700">حالة الجهاز:</p>
                {storedKey ? (
                  <p className="mt-1">
                    مسجل محلياً، معرف المفتاح: <span className="font-mono text-xs">{storedKey.keyId}</span>
                  </p>
                ) : (
                  <p className="mt-1">لا يوجد مفتاح بصمة محلي على هذا الجهاز بعد.</p>
                )}
                <p className="mt-2 text-xs text-slate-500">
                  {isHydratingProfile
                    ? "جارٍ تحديث بيانات الحساب..."
                    : `المستخدم الحالي: ${username || "غير متوفر"}`}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleRegisterBiometric}
              disabled={isEnrolling}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00bba7] text-white font-bold text-sm hover:bg-[#00bba7]/90 disabled:opacity-60 transition-all"
            >
              {isEnrolling ? <Loader2 size={16} className="animate-spin" /> : <Fingerprint size={16} />}
              {isEnrolling ? "جارٍ التسجيل..." : "تسجيل بصمة هذا الجهاز"}
            </button>

            <button
              type="button"
              onClick={handleClearBiometric}
              disabled={!storedKey}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-rose-200 text-rose-600 font-bold text-sm hover:bg-rose-50 disabled:opacity-50 transition-all"
            >
              <Trash2 size={16} />
              حذف البصمة من الجهاز
            </button>
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-[#E7C873]/20 text-[#b88710]">
              <Clock3 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">تسجيل الحضور بالبصمة</h2>
              <p className="text-xs text-slate-500">بصمة واحدة = حفظ وقت الدخول أو الخروج</p>
            </div>
          </div>

          <label className="block text-xs font-bold text-slate-500 mb-2">رقم الموظف</label>
          <input
            type="text"
            value={employeeId}
            onChange={(event) => setEmployeeId(event.target.value.toUpperCase())}
            placeholder="EMP001"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#00bba7]/40 focus:border-[#00bba7]"
            dir="ltr"
          />
          <p className="text-xs text-slate-400 mt-2">
            يجب أن يكون رقم الموظف مطابقاً لحسابك (أو لديك صلاحية إدارة لتسجيل غيرك).
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void handleBiometricAttendance("IN")}
              disabled={clockingType !== null}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00bba7] text-white font-bold text-sm hover:bg-[#00bba7]/90 disabled:opacity-60 transition-all"
            >
              {clockingType === "IN" ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
              بصمة دخول
            </button>

            <button
              type="button"
              onClick={() => void handleBiometricAttendance("OUT")}
              disabled={clockingType !== null}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 disabled:opacity-60 transition-all"
            >
              {clockingType === "OUT" ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
              بصمة خروج
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            {latestAttendance ? (
              <div className="flex items-start gap-3 text-sm">
                <CheckCircle2 className="text-[#00bba7] mt-0.5 shrink-0" size={18} />
                <div className="text-slate-700">
                  <p className="font-bold text-slate-800">
                    آخر عملية: {latestAttendance.type === "IN" ? "دخول" : "خروج"}
                  </p>
                  <p className="mt-1">
                    الوقت: <span className="font-mono">{formatAttendanceTime(latestAttendance.timestamp)}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    الحالة: {latestAttendance.action === "created" ? "سجل جديد" : "تحديث سجل اليوم"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 text-sm text-slate-500">
                <AlertCircle className="mt-0.5 shrink-0" size={18} />
                لا يوجد تسجيل حضور بالبصمة بعد.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
