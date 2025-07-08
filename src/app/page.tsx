"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/types/user";

export default function LaunchPage() {
  const router = useRouter();

  React.useEffect(() => {
    const determineRedirect = async () => {
      const currentUser = await getCurrentUser();

      // Wait for a minimum splash screen time before redirecting
      await new Promise(resolve => setTimeout(resolve, 10000)); 

      if (!currentUser) {
        router.replace('/login');
        return;
      }

      switch (currentUser.role) {
        case "student":
          router.replace("/dashboard/student");
          break;
        case "faculty":
          router.replace("/dashboard/faculty");
          break;
        case "clearance_officer":
          router.replace("/clearance");
          break;
        case "print_cell":
          router.replace("/documents");
          break;
        case "admin":
          router.replace("/admin");
          break;
        default:
          router.replace("/login");
      }
    };

    determineRedirect();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden">
      <div className="absolute inset-0 w-full h-full bg-black/30 backdrop-blur-sm"></div>
      <div className="z-10 text-center animate-in fade-in zoom-in-90 duration-1000">
        <svg width="140" height="140" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-6 filter drop-shadow-lg">
            <defs>
                <linearGradient id="sparkle" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="hsla(180, 100%, 90%, 1)" />
                    <stop offset="100%" stopColor="hsla(180, 80%, 60%, 1)" />
                </linearGradient>
            </defs>
            <path d="M48 16C48 8.26801 41.732 2 34 2C26.268 2 20 8.26801 20 16V24" stroke="url(#sparkle)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 48C16 55.732 22.268 62 30 62C37.732 62 44 55.732 44 48V40" stroke="url(#sparkle)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p className="mt-4 text-lg text-blue-300/80 animate-pulse">
          Launching...
        </p>
      </div>
    </div>
  );
}
