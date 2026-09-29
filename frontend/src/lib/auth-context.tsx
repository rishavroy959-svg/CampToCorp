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
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateUser: (data: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Default to Placement Officer for initial review, or read from localStorage
  const [user, setUser] = useState<AuthUser | null>(PRESET_PERSONAS.PLACEMENT_OFFICER);
  const [token, setToken] = useState<string | null>("mock-jwt-token-campuslink");

  useEffect(() => {
    const savedRole = localStorage.getItem("campuslink_active_role") as UserRole | null;
    const role = (savedRole && PRESET_PERSONAS[savedRole]) ? savedRole : "PLACEMENT_OFFICER";
    
    // Check if there is a custom profile override saved for this role
    const savedOverride = localStorage.getItem(`campuslink_user_override_${role}`);
    if (savedOverride) {
      try {
        setUser(JSON.parse(savedOverride));
        return;
      } catch (e) {}
    }

    if (PRESET_PERSONAS[role]) {
      setUser(PRESET_PERSONAS[role]);
    }
  }, []);

  const login = (role: UserRole) => {
    const savedOverride = typeof window !== "undefined" ? localStorage.getItem(`campuslink_user_override_${role}`) : null;
    if (savedOverride) {
      try {
        setUser(JSON.parse(savedOverride));
        setToken(`jwt-token-${role.toLowerCase()}`);
        localStorage.setItem("campuslink_active_role", role);
        return;
      } catch (e) {}
    }

    const selected = PRESET_PERSONAS[role];
    setUser(selected);
    setToken(`jwt-token-${role.toLowerCase()}`);
    localStorage.setItem("campuslink_active_role", role);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("campuslink_active_role");
  };

  const switchRole = (role: UserRole) => {
    login(role);
  };

  const updateUser = (data: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      if (typeof window !== "undefined") {
        localStorage.setItem(`campuslink_user_override_${prev.role}`, JSON.stringify(updated));
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
