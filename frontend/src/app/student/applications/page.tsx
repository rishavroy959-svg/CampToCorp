"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StudentApplicationsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/student?tab=applications");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-campus-bg">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-2 border-campus-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <div className="text-sm font-semibold text-campus-text-primary">Loading Application & Offer Status...</div>
      </div>
    </div>
  );
}
