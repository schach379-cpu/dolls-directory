import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SessionProvider } from "next-auth/react";
import { AgeVerification } from "@/components/AgeVerification";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DollsDirectory – Sexpuppen Studios & Anbieter finden",
  description:
    "Finde Sexpuppen-Studios und Anbieter in deiner Nähe. Seriöse Inserate, echte Bewertungen.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className={`${inter.className} bg-gray-950 text-gray-100 min-h-screen flex flex-col`}>
        <SessionProvider>
          <AgeVerification />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
