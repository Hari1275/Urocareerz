import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'UroCareerz - Connect Mentors & Mentees in Urology',
  description: 'A professional platform connecting mentors and mentees in the field of urology.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
          {children}
        </div>
      </body>
    </html>
  );
}
