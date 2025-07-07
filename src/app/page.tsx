"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getCurrentUser } from "@/types/user";

export default function LaunchPage() {
  const router = useRouter();

  React.useEffect(() => {
    const determineRedirect = async () => {
      const currentUser = await getCurrentUser();

      // Wait for a minimum splash screen time before redirecting
      await new Promise(resolve => setTimeout(resolve, 2500)); 

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
        <Image
          src="/logo.png"
          alt="S.P.A.R.K. Logo"
          data-ai-hint="spark app logo"
          width={140}
          height={140}
          className="mx-auto mb-6 filter drop-shadow-lg blur-[1px]"
          priority
        />
        <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-[0.2em] text-white"
            style={{ textShadow: '0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(183, 228, 255, 0.5)' }}>
          S.P.A.R.K.
        </h1>
        <p className="mt-4 text-lg text-blue-300/80 animate-pulse">
          Launching...
        </p>
      </div>
    </div>
  );
}
