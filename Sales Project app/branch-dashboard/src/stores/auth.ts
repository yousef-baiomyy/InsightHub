import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppUser } from "@/lib/auth";
import { authenticate } from "@/lib/auth";

interface AuthState {
  user: AppUser | null;
  hydrated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  setHydrated: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      hydrated: false,
      login: (username, password) => {
        const user = authenticate(username, password);
        if (user) {
          set({ user });
          return true;
        }
        return false;
      },
      logout: () => set({ user: null }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "bsd-auth",
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);
