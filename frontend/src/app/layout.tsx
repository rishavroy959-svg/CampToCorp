import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Navbar } from "@/components/navigation/Navbar";

export const metadata: Metadata = {
  title: "CampusLink | AI-Powered Campus-to-Corporate Placement & Analytics",
  description:
    "End-to-end placement management, student readiness profiling, AI recruiter matching, and conflict-free drive scheduling.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-campus-bg text-campus-text-primary antialiased">
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
