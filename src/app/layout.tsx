import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const manrope = Manrope({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UroCareerz - Connect Mentors & Mentees in Urology",
  description:
    "A professional platform connecting mentors and mentees in the field of urology.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={manrope.className}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
