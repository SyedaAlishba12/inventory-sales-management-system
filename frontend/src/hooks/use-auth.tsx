"use client";

/**
 * frontend/src/hooks/use-auth.tsx
 * --------------------------------
 * Auth context + hook for Taha's module.
 *
 * Token storage: localStorage.
 *   Rationale: api-client.ts uses a `TokenProvider` callback (setTokenProvider) —
 *   it does NOT read cookies itself. There is no existing httpOnly-cookie pattern
 *   in the codebase. localStorage is the simplest fit with the existing
 *   ApiClient.setTokenProvider pattern and works with Next.js client components.
 *
 * The singleton `apiClient` is configured with a token provider once on mount
 * so every downstream call automatically attaches the Bearer header without
 * each page needing to forward the token manually.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { apiClient } from "@/utils/api-client";
import type {
  AuthUser,
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  UpdateProfileRequest,
} from "@/types/auth";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TOKEN_KEY = "inventra_access_token";

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

interface AuthContextValue {
  /** Currently authenticated user, or null when logged-out / not yet loaded. */
  user: AuthUser | null;
  /** True while the initial token-check / me-fetch is in flight. */
  isLoading: boolean;
  /** True when the user is confirmed authenticated. */
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Token helpers (localStorage — server-safe via checks)
// ---------------------------------------------------------------------------

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);

  // Wire the apiClient token provider once — all requests pick up the token
  // automatically from localStorage without each call forwarding it.
  useEffect(() => {
    apiClient.setTokenProvider(getStoredToken);
  }, []);

  // Fetch /api/auth/me to hydrate the user from a stored token.
  const fetchMe = useCallback(async (token: string): Promise<AuthUser | null> => {
    try {
      const me = await apiClient.get<AuthUser>("/api/auth/me", { token });
      return me;
    } catch {
      return null;
    }
  }, []);

  // On first mount: check whether a token is already stored and, if so, fetch
  // the user. This handles page refreshes without forcing a re-login.
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const token = getStoredToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    fetchMe(token).then((me) => {
      if (me) {
        setUser(me);
      } else {
        // Token is stale / invalid — clear it.
        clearStoredToken();
      }
      setIsLoading(false);
    });
  }, [fetchMe]);

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------

  const login = useCallback(
    async ({ email, password }: LoginRequest) => {
      const response = await apiClient.post<LoginResponse>("/api/auth/login", {
        email,
        password,
      });
      setStoredToken(response.access_token);
      const me = await fetchMe(response.access_token);
      if (!me) throw new Error("Failed to fetch user after login.");
      setUser(me);
    },
    [fetchMe],
  );

  const signup = useCallback(
    async (data: SignupRequest) => {
      // POST /api/auth/signup — backend returns the new user (no token on signup).
      // After signup the user is redirected to /login to authenticate explicitly.
      await apiClient.post<AuthUser>("/api/auth/signup", data);
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/api/auth/logout");
    } catch {
      // Proceed even if the logout endpoint errors — we still clear local state.
    } finally {
      clearStoredToken();
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(async (data: UpdateProfileRequest) => {
    const updated = await apiClient.patch<AuthUser>("/api/auth/me", data);
    setUser(updated);
  }, []);

  const changePassword = useCallback(async (data: ChangePasswordRequest) => {
    await apiClient.post("/api/auth/change-password", data);
  }, []);

  // -------------------------------------------------------------------------
  // Context value (memoised — stable reference for consumers)
  // -------------------------------------------------------------------------

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      login,
      signup,
      logout,
      updateProfile,
      changePassword,
    }),
    [user, isLoading, login, signup, logout, updateProfile, changePassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>.");
  }
  return ctx;
}
