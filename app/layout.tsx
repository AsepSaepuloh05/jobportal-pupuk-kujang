import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { APP_NAME, APP_NAME_LENGKAP, APP_DESKRIPSI } from "@/lib/app-config";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME_LENGKAP,
    template: "%s · " + APP_NAME,
  },
  description: APP_DESKRIPSI,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
      </body>
    </html>
  );
}