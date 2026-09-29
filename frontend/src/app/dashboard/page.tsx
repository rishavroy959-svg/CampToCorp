"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function DashboardIndex() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    switch (user.role) {
      case "STUDENT":
        router.push("/dashboard/student");
        break;
      case "PLACEMENT_OFFICER":
      default:
        router.push("/dashboard/tpo");
        break;
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-campus-bg">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-2 border-campus-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <div className="text-sm font-medium text-campus-text-secondary">
          Redirecting to your role-based dashboard...
        </div>
      </div>
    </div>
  );
}
