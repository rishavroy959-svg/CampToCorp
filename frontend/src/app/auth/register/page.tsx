"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/auth/login?mode=register");
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm font-medium text-slate-600">
      Redirecting to registration portal...
    </div>
  );
}
