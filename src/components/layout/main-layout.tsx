
"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/sidebar";
import CustomCursor from "@/components/ui/custom-cursor";

const NO_LAYOUT_PATHS = ["/", "/login", "/admin/register"];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const showLayout = !NO_LAYOUT_PATHS.includes(pathname);

  return (
    <>
      <CustomCursor />
      {showLayout ? (
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <Header />
            <main className="flex-1 p-4 md:p-6">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      ) : (
        <>{children}</>
      )}
      <Toaster />
    </>
  );
}
