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
    <div className="flex items-center justify-center min-h-screen bg-black text-white overflow-hidden">
      <div className="z-10 text-center animate-in fade-in zoom-in-90 duration-1000">
        <video
          src="/logo-animation.mp4"
          width="280"
          height="280"
          autoPlay
          muted
          playsInline
          className="mx-auto mb-6 filter drop-shadow-lg"
        />
        <p className="mt-4 text-lg text-blue-300/80 animate-pulse">
          Launching...
        </p>
      </div>
    </div>
  );
}
