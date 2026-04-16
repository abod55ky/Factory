import { api } from "@/lib/http/api";

export type BiometricPayloadPurpose = "REGISTER" | "LOGIN";

export type BiometricRegisterStartRequest = {
  keyId: string;
  publicKeyBase64: string;
  deviceName?: string;
};

export type BiometricRegisterStartResponse = {
  challengeId: string;
  challengeBase64: string;
  expiresAt: string;
  note?: string;
};

export type BiometricRegisterFinishRequest = {
  challengeId: string;
  challengeBase64: string;
  signatureBase64: string;
};

export type BiometricRegisterFinishResponse = {
  ok: boolean;
  keyId: string;
  message?: string;
};

export type BiometricLoginStartRequest = {
  username: string;
};

export type BiometricLoginStartResponse = {
  challengeId: string;
  challengeBase64: string;
  expiresAt: string;
  allowedKeyIds: string[];
  note?: string;
};

export type BiometricLoginFinishRequest = {
  challengeId: string;
  challengeBase64: string;
  keyId: string;
  signatureBase64: string;
};

export type BiometricLoginFinishResponse = {
  user?: {
    id?: string;
    name?: string;
    username?: string;
    role?: string;
  };
  roles?: string[];
  permissions?: string[];
  token?: string;
};

export type BiometricRevokeRequest = {
  keyId: string;
};

export type BiometricRevokeResponse = {
  ok: boolean;
  keyId: string;
  message?: string;
};

export const buildBiometricPayload = (
  purpose: BiometricPayloadPurpose,
  challengeId: string,
  challengeBase64: string,
) => {
  return `${purpose}.${challengeId}.${challengeBase64}`;
};

export const biometricApi = {
  registerStart: (body: BiometricRegisterStartRequest) => {
    return api.post<BiometricRegisterStartResponse>("/auth/biometric/register/start", body);
  },
  registerFinish: (body: BiometricRegisterFinishRequest) => {
    return api.post<BiometricRegisterFinishResponse>("/auth/biometric/register/finish", body);
  },
  loginStart: (body: BiometricLoginStartRequest) => {
    return api.post<BiometricLoginStartResponse>("/auth/biometric/login/start", body);
  },
  loginFinish: (body: BiometricLoginFinishRequest) => {
    return api.post<BiometricLoginFinishResponse>("/auth/biometric/login/finish", body);
  },
  revoke: (body: BiometricRevokeRequest) => {
    return api.post<BiometricRevokeResponse>("/auth/biometric/revoke", body);
  },
};
