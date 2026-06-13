import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const headingFont = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["italic", "normal"],
});

const sansFont = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SmartDoc IA - Gerador de Contratos",
  description: "Ecossistema de alta tecnologia e inteligência artificial para redação, auditoria e blindagem contratual definitiva.",
  icons: {
    icon: [
      { url: "/icon-app-v3.svg?v=28", type: "image/svg+xml" }
    ],
    shortcut: "/icon-app-v3.svg?v=28",
    apple: "/icon-mobile.svg?v=28"
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json?v=29",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SmartDoc",
  },
};

import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";
import { SinapsesPlansModal } from "@/components/ui/sinapses-plans-modal";
import { PwaInstallModal } from "@/components/ui/pwa-install-modal";
import { NativePwaHandler } from "@/components/ui/native-pwa-handler";
import { TrackerInit } from "@/components/ui/tracker-init";
import { CopiesProvider } from "@/contexts/copies-context";
import { getCopies } from "@/lib/copies";
import { cookies } from "next/headers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Busca copies ativas com cache ISR e seed do cookie (A/B testing)
  const cookieStore = await cookies();
  const seed = cookieStore.get('ex_variant_seed')?.value;
  const copies = await getCopies(seed);

  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${sansFont.variable} ${headingFont.variable} h-full antialiased`}
    >
      <head>
        <meta name="google" content="notranslate" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function adjustScale() {
                  var dpr = window.devicePixelRatio || 1;
                  var targetDPR = 1.25;
                  var ratio = targetDPR / dpr;
                  var clampedRatio = Math.max(0.75, Math.min(1.5, ratio));
                  var basePercent = 102;
                  document.documentElement.style.fontSize = (basePercent * clampedRatio) + '%';
                }
                adjustScale();
                window.addEventListener('resize', adjustScale);
              })();
            `
          }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-background text-foreground">
        {/* Google tag (gtag.js) */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=AW-18209824209" strategy="lazyOnload" />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            if (!window.gtagInitialized) {
              gtag('js', new Date());
              gtag('config', 'AW-18209824209');
              window.gtagInitialized = true;
            }
          `}
        </Script>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <TooltipProvider>
            <CopiesProvider initialCopies={copies}>
              {children}
              <Toaster richColors closeButton theme="dark" position="bottom-right" />
              <SinapsesPlansModal />
              <PwaInstallModal />
              <NativePwaHandler />
              <TrackerInit />
              <Analytics />
              <SpeedInsights />

              {/* PWA Service Worker Registration */}
              <Script id="pwa-init" strategy="lazyOnload">
                {`
                  if ('serviceWorker' in navigator) {
                    window.addEventListener('load', function() {
                      navigator.serviceWorker.register('/sw.js').then(
                        function(registration) {
                          console.log('Service Worker registration successful');
                        },
                        function(err) {
                          console.log('Service Worker registration failed: ', err);
                        }
                      );
                    });
                  }
                `}
              </Script>
            </CopiesProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
