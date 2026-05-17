import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ExtraJus — Inteligência Jurídica e Contratos de Alto Impacto",
  description: "Ecossistema de alta tecnologia e inteligência artificial para redação, auditoria e blindagem contratual definitiva.",
  icons: {
    icon: [
      { url: "/icon.svg?v=7", type: "image/svg+xml" }
    ],
    shortcut: "/icon.svg?v=7",
    apple: "/icon.svg?v=7"
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head />
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
            <Analytics />
            <SpeedInsights />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
