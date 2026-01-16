import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "NADU - Social Community",
  description: "Connect, Share, Be Yourself.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-slate-950 text-slate-50">
        <AuthProvider>
          <Header />
          <main className="pt-16 pb-20 min-h-screen px-4 max-w-md mx-auto">
            {children}
          </main>
          <BottomNav />
          <Toaster position="top-center" theme="dark" />
        </AuthProvider>
      </body>
    </html>
  );
}
