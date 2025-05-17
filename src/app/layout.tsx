
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const geistSans = GeistSans; // Using GeistSans directly
const geistMono = GeistMono; // Using GeistMono directly

export const metadata: Metadata = {
  title: 'Product Search',
  description: 'Autocomplete product search by Firebase Studio',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body 
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`} 
        suppressHydrationWarning={true}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
