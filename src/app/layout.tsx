import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"]
});

export const metadata: Metadata = {
  title: "Birmingham Stallions | MVP",
  description: "Unofficial Fan Concept for the Birmingham Stallions (UFL).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.variable} font-sans antialiased bg-background text-foreground flex flex-col min-h-screen`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
