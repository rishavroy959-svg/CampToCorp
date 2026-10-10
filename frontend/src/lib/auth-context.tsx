"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole } from "@/types";

export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  title: string;
  status?: string;
  institution?: string;
  college_id?: number | null;
  college_name?: string | null;
  college_code?: string | null;
  is_verified?: boolean;
  rejection_reason?: string | null;
}

export const ACTIVE_ROLES: UserRole[] = ["PLACEMENT_OFFICER", "STUDENT"];

export const PRESET_PERSONAS: Record<UserRole, AuthUser> = {
  PLACEMENT_OFFICER: {
    id: 1,
    email: "tpo@camptocorp.edu",
    fullName: "Dr. Rajesh Sharma",
    role: "PLACEMENT_OFFICER",
    title: "Head of Training & Placements (TPO)",
    institution: "National Institute of Technology",
  },
  STUDENT: {
    id: 2,
    email: "aarav.patel@camptocorp.edu",
    fullName: "Aarav Patel",
    role: "STUDENT",
    title: "B.Tech Computer Science (Batch 2026)",
    institution: "National Institute of Technology",
  },
  RECRUITER: {
    id: 3,
    email: "recruiter@microsoft.com",
    fullName: "Priya Sen",
    role: "RECRUITER",
    title: "Tech Recruiting Lead",
    institution: "Microsoft IDC",
  },
  MENTOR: {
    id: 4,
    email: "mentor.cs@camptocorp.edu",
    fullName: "Prof. Anita Desai",
    role: "MENTOR",
    title: "Department Mentor",
    institution: "National Institute of Technology",
  },
};

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loginCustom: (userObj: AuthUser, token?: string, sessionId?: string) => void;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  updateUser: (data: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to write client-accessible cookies for Next.js Edge Middleware
const setCookie = (name: string, value: string, days = 7) => {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
};

const deleteCookie = (name: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check local storage for persistent profile
    const savedCustomUser = typeof window !== "undefined" ? localStorage.getItem("camptocorp_custom_user") : null;
    const savedToken = typeof window !== "undefined" ? localStorage.getItem("camptocorp_jwt_token") : null;

    if (savedCustomUser) {
      try {
        const parsed = JSON.parse(savedCustomUser);
        setUser(parsed);
        const activeToken = savedToken || `jwt-token-${parsed.role.toLowerCase()}`;
        setToken(activeToken);

        // Keep cookies in sync with edge middleware
        setCookie("camptocorp_role", parsed.role);
        setCookie("camptocorp_session", localStorage.getItem("camptocorp_session_id") || `sess_${parsed.id}`);
        setCookie("camptocorp_access_token", activeToken);
        return;
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }
  }, []);

  const loginCustom = (userObj: AuthUser, jwtToken?: string, sessionId?: string) => {
    setUser(userObj);
    const activeToken = jwtToken || `jwt-token-${userObj.role.toLowerCase()}`;
    const activeSessionId = sessionId || `session_${userObj.id}_${Date.now()}`;
    setToken(activeToken);

    if (typeof window !== "undefined") {
      // Drop any cached student data from a previous account
      localStorage.removeItem("camptocorp_student_id");
      localStorage.removeItem("camptocorp_student_profile");
      localStorage.setItem("camptocorp_custom_user", JSON.stringify(userObj));
      localStorage.setItem("camptocorp_active_role", userObj.role);
      localStorage.setItem("camptocorp_jwt_token", activeToken);
      localStorage.setItem("camptocorp_jwt_token", activeToken);
      localStorage.setItem("camptocorp_session_id", activeSessionId);

      // Sync Cookies for Next.js Edge Middleware
      setCookie("camptocorp_role", userObj.role);
      setCookie("camptocorp_session", activeSessionId);
      setCookie("camptocorp_access_token", activeToken);
    }
  };

  const switchRole = (role: UserRole) => {
    const selected = PRESET_PERSONAS[role] || PRESET_PERSONAS.PLACEMENT_OFFICER;
    loginCustom(selected);
  };

  const logout = async () => {
    try {
      // Notify backend to terminate identity session & write security audit log
      await fetch("http://127.0.0.1:8000/api/v1/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      }).catch(() => {});
    } catch (e) {
      console.warn("Backend logout request failed:", e);
    }

    setUser(null);
    setToken(null);

    if (typeof window !== "undefined") {
      localStorage.removeItem("camptocorp_active_role");
      localStorage.removeItem("camptocorp_custom_user");
      localStorage.removeItem("camptocorp_jwt_token");
      localStorage.removeItem("camptocorp_jwt_token");
      localStorage.removeItem("camptocorp_session_id");
      localStorage.removeItem("camptocorp_student_id");
      localStorage.removeItem("camptocorp_student_profile");

      deleteCookie("camptocorp_role");
      deleteCookie("camptocorp_session");
      deleteCookie("camptocorp_access_token");
      deleteCookie("camptocorp_refresh_token");
    }
  };

  const updateUser = (data: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      if (typeof window !== "undefined") {
        localStorage.setItem("camptocorp_custom_user", JSON.stringify(updated));
      }
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loginCustom,
        logout,
        switchRole,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
