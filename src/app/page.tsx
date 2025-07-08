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
        <svg width="140" height="140" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-6 filter drop-shadow-lg">
          <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" stroke="url(#paint0_linear_1_2)" strokeWidth="1.5"/>
          <path d="M9.08984 8.99991C9.08984 7.89534 9.98522 6.99997 11.0898 6.99997H14.8898C15.9944 6.99997 16.8898 7.89534 16.8898 8.99991C16.8898 10.1045 15.9944 11 14.8898 11H11.0898C9.98522 11 9.08984 11.8954 9.08984 13C9.08984 14.1045 9.98522 15 11.0898 15H14.8898C15.9944 15 16.8898 15.8954 16.8898 17C16.8898 18.1045 15.9944 19 14.8898 19H11.0898" stroke="url(#paint1_linear_1_2)" strokeWidth="1.5" strokeLinecap="round"/>
          <defs>
            <linearGradient id="paint0_linear_1_2" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" stopOpacity="0.5"/>
              <stop offset="1" stopColor="#FFFFFF" stopOpacity="0"/>
            </linearGradient>
            <linearGradient id="paint1_linear_1_2" x1="12.9898" y1="7" x2="12.9898" y2="19" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF"/>
              <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.6"/>
            </linearGradient>
          </defs>
        </svg>
        <p className="mt-4 text-lg text-blue-300/80 animate-pulse">
          Launching...
        </p>
      </div>
    </div>
  );
}
