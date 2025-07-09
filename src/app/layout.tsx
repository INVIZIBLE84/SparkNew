
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MainLayout } from "@/components/layout/main-layout";
import SmoothCursor from "@/components/ui/smooth-cursor";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "S.P.A.R.K.",
  description: "Strategic Platform for Analytics, Reports & Knowledgeflow",
  icons: {
    icon: '/sogo.png',
    apple: '/sogo.png',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <SmoothCursor />
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
