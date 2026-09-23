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
    id: 3,
    email: "priya.sen@microsoft.com",
    fullName: "Priya Sen",
    role: "RECRUITER",
    title: "Lead Talent Partner, Microsoft IDC",
  },
  MENTOR: {
    id: 4,
    email: "anita.desai@campuslink.edu",
    fullName: "Prof. Anita Desai",
    role: "MENTOR",
    title: "Faculty Placement Coordinator & Mentor",
  },
};

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
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
    if (savedRole && PRESET_PERSONAS[savedRole]) {
      setUser(PRESET_PERSONAS[savedRole]);
    }
  }, []);

  const login = (role: UserRole) => {
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

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        login,
        logout,
        switchRole,
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
