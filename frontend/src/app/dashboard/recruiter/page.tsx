"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RecruiterRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/tpo");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-campus-bg">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-campus-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <div className="text-sm font-semibold text-campus-text-primary">
          Redirecting to Placement Officer Dashboard...
        </div>
        <p className="text-xs text-campus-text-secondary">
          Only Student and Placement Officer dashboards are active.
        </p>
      </div>
    </div>
  );
}
