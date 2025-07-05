import type { Metadata } from "next";
import "./globals.css";

import { Header } from "@/components/layout/Header";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ThemeClientWrapper } from "@/components/providers/ThemeClientWrapper";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { NavigationLoading } from "@/components/ui/NavigationLoading";
import { PageTransition } from "@/components/ui/PageTransition";
import { SessionProvider } from "@/components/providers/SessionProvider";

export const metadata: Metadata = {
  title: "Movie Explorer - Discover Amazing Movies",
  description:
    "Explore, search, and save your favorite movies with Movie Explorer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SessionProvider>
          <ThemeProvider>
            <ThemeClientWrapper>
              <div
                className="min-h-screen transition-colors duration-200"
                style={{
                  background: "var(--background)",
                  color: "var(--foreground)",
                }}
              >
                <NavigationLoading />
                <Header />
                <main className="min-h-screen">
                  <PageTransition>{children}</PageTransition>
                </main>
                <ToastProvider />
              </div>
            </ThemeClientWrapper>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
