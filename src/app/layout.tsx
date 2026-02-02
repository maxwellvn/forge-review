import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "@uploadthing/react/styles.css";
import "./globals.css";
import { LayoutWrapper } from "@/components/shared/LayoutWrapper";
import { Providers } from "@/components/providers";
import { PageLoader } from "@/components/shared/PageLoader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "APP Review - Discover & Review Digital Products",
  description: "A modern community-driven platform for discovering and reviewing apps, web tools, and digital products. Join our tiered reviewer system and share your insights.",
  keywords: ["app reviews", "digital products", "software reviews", "app discovery", "community reviews"],
  icons: {
    icon: "/logo.webp",
    shortcut: "/logo.webp",
    apple: "/logo.webp",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#141414" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Providers>
          <Suspense fallback={null}>
            <PageLoader />
          </Suspense>
          <LayoutWrapper>{children}</LayoutWrapper>
          <Toaster position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
