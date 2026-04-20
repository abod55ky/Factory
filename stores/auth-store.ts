"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { clearAuthSession, getStoredUser, setAuthSession } from "@/lib/auth-session";

export type AuthUser = {
  id?: string;
  _id?: string;
  name?: string;
  username?: string;
  employeeId?: string;
  role?: string;
  roleId?: string;
  email?: string;
};

type AuthStatus = "unknown" | "authenticated" | "unauthenticated";

type AuthState = {
  user: AuthUser | null;
  status: AuthStatus;
  setUser: (user: AuthUser | null) => void;
  setStatus: (status: AuthStatus) => void;
  clear: () => void;
  hasAnyRole: (roles: string[]) => boolean;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      status: "unknown",
      setUser: (user) => {
        set({ user });
        setAuthSession(user);
      },
      setStatus: (status) => set({ status }),
      clear: () => {
        set({ user: null, status: "unauthenticated" });
        clearAuthSession();
      },
      hasAnyRole: (roles) => {
        const currentRole = get().user?.role;
        if (!currentRole) return false;
        return roles.includes(currentRole);
      },
    }),
    {
      name: "auth-store-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const fallbackUser = getStoredUser<AuthUser>();
        if (!state.user && fallbackUser) {
          state.user = fallbackUser;
        }
      },
    },
  ),
);

