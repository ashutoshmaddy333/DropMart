import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ReduxProvider } from "@/store/provider";
import { AppInitializer } from "@/store/app-initializer";
import { SessionProvider } from "@/modules/auth/session-context";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_TAGLINE,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)} suppressHydrationWarning>
      <body className="min-h-screen overflow-x-hidden antialiased">
        <ThemeProvider>
          <ReduxProvider>
            <AppInitializer>
              <SessionProvider>
                <TooltipProvider>
                  {children}
                  <Toaster richColors position="top-center" />
                </TooltipProvider>
              </SessionProvider>
            </AppInitializer>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
