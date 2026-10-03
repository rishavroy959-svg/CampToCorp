"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole } from "@/types";

export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  title: string;
}

export const ACTIVE_ROLES: UserRole[] = ["PLACEMENT_OFFICER", "STUDENT"];

export const PRESET_PERSONAS: Record<UserRole, AuthUser> = {
  PLACEMENT_OFFICER: {
    id: 1,
    email: "tpo@campuslink.edu",
    fullName: "Dr. Rajesh Sharma",
    role: "PLACEMENT_OFFICER",
    title: "Head of Training & Placements (TPO)",
  },
  STUDENT: {
    id: 2,
    email: "aarav.patel@campuslink.edu",
    fullName: "Aarav Patel",
    role: "STUDENT",
    title: "B.Tech Computer Science (Batch 2026)",
  },
  RECRUITER: {
    id: 1,
    email: "tpo@campuslink.edu",
    fullName: "Dr. Rajesh Sharma",
    role: "PLACEMENT_OFFICER",
    title: "Head of Training & Placements (TPO)",
  },
  MENTOR: {
    id: 1,
    email: "tpo@campuslink.edu",
    fullName: "Dr. Rajesh Sharma",
    role: "PLACEMENT_OFFICER",
    title: "Head of Training & Placements (TPO)",
  },
};

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  loginCustom: (userObj: AuthUser, token?: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateUser: (data: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(PRESET_PERSONAS.PLACEMENT_OFFICER);
  const [token, setToken] = useState<string | null>("mock-jwt-token-campuslink");

  useEffect(() => {
    const savedCustomUser = typeof window !== "undefined" ? localStorage.getItem("campuslink_custom_user") : null;
    if (savedCustomUser) {
      try {
        const parsed = JSON.parse(savedCustomUser);
        setUser(parsed);
        const savedToken = localStorage.getItem("campuslink_jwt_token") || `jwt-token-${parsed.role.toLowerCase()}`;
        setToken(savedToken);
        return;
      } catch (e) {}
    }

    const savedRole = localStorage.getItem("campuslink_active_role") as UserRole | null;
    const role = (savedRole && PRESET_PERSONAS[savedRole]) ? savedRole : "PLACEMENT_OFFICER";
    
    if (PRESET_PERSONAS[role]) {
      setUser(PRESET_PERSONAS[role]);
    }
  }, []);

  const loginCustom = (userObj: AuthUser, jwtToken?: string) => {
    setUser(userObj);
    const activeToken = jwtToken || `jwt-token-${userObj.role.toLowerCase()}`;
    setToken(activeToken);
    if (typeof window !== "undefined") {
      localStorage.setItem("campuslink_custom_user", JSON.stringify(userObj));
      localStorage.setItem("campuslink_active_role", userObj.role);
      localStorage.setItem("campuslink_jwt_token", activeToken);
    }
  };

  const login = (role: UserRole) => {
    const selected = PRESET_PERSONAS[role];
    setUser(selected);
    const activeToken = `jwt-token-${role.toLowerCase()}`;
    setToken(activeToken);
    if (typeof window !== "undefined") {
      localStorage.setItem("campuslink_active_role", role);
      localStorage.setItem("campuslink_jwt_token", activeToken);
      localStorage.removeItem("campuslink_custom_user");
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("campuslink_active_role");
      localStorage.removeItem("campuslink_custom_user");
      localStorage.removeItem("campuslink_jwt_token");
    }
  };

  const switchRole = (role: UserRole) => {
    login(role);
  };

  const updateUser = (data: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      if (typeof window !== "undefined") {
        localStorage.setItem("campuslink_custom_user", JSON.stringify(updated));
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
        login,
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
