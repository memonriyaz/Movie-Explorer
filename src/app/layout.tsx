import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ThemeClientWrapper } from "@/components/providers/ThemeClientWrapper";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { NavigationLoading } from "@/components/ui/NavigationLoading";
import { PageTransition } from "@/components/ui/PageTransition";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

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
      <body
        // className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <ThemeClientWrapper>
            <div
              className="min-h-screen transition-colors duration-200"
              style={{
                background: "var(--background)",
                color: "var(--foreground)",
              }}
            >
              <AuthProvider>
                <NavigationLoading />
                <Header />
                <main className="min-h-screen">
                  <PageTransition>{children}</PageTransition>
                </main>
                <ToastProvider />
              </AuthProvider>
            </div>
          </ThemeClientWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
