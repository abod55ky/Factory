"use client";

import { io, type Socket } from "socket.io-client";
import { DEFAULT_API_URL } from "@/lib/api-url";

export type AttendanceRealtimeEventPayload = {
  employeeId: string;
  employeeName: string;
  type: "IN" | "OUT";
  timestamp: string;
  date: string;
  time: string;
  source: "biometric";
  status: "success";
  action: "created" | "updated";
  message: string;
};

declare global {
  interface Window {
    __factoryAttendanceSocket?: Socket;
  }
}

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const stripApiSuffix = (pathname: string) => {
  const cleanPath = trimTrailingSlash(pathname || "");
  if (!cleanPath) return "";
  if (cleanPath.toLowerCase().endsWith("/api")) {
    return cleanPath.slice(0, -4);
  }
  return cleanPath;
};

const resolveSocketBaseUrl = () => {
  if (typeof window === "undefined") {
    return "";
  }

  const rawApiUrl = String(process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL).trim();

  if (!rawApiUrl) {
    return window.location.origin;
  }

  if (rawApiUrl.startsWith("/")) {
    return window.location.origin;
  }

  try {
    const parsed = new URL(rawApiUrl);
    const maybeBasePath = stripApiSuffix(parsed.pathname || "");
    const basePath = maybeBasePath === "/" ? "" : maybeBasePath;
    return `${parsed.origin}${basePath}`;
  } catch {
    return window.location.origin;
  }
};

export const getAttendanceSocket = () => {
  if (typeof window === "undefined") {
    return null;
  }

  if (window.__factoryAttendanceSocket) {
    return window.__factoryAttendanceSocket;
  }

  const socketBase = trimTrailingSlash(resolveSocketBaseUrl());
  const socket = io(`${socketBase}/realtime`, {
    path: "/socket.io",
    transports: ["websocket", "polling"],
    withCredentials: true,
    autoConnect: true,
  });

  window.__factoryAttendanceSocket = socket;
  return socket;
};

