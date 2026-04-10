"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/NavBar";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const SideNavBar = dynamic(() => import("@/components/SideNavBar"), { ssr: false });

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Navbar />
      <div className="flex min-h-screen bg-background">
        <SideNavBar />
        <main className="flex-1 lg:ml-64 pt-24 pb-24 lg:pb-12">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
