import type { Metadata } from "next";

import "./globals.css";

import QueryProvider from "@/providers/QueryProvider";
import AuthGuard from "@/components/AuthGuard";

export const metadata: Metadata = {
  title: "Meeting Room Booking",
  description: "Meeting room booking application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased">
        <QueryProvider>
          <AuthGuard>{children}</AuthGuard>
        </QueryProvider>
      </body>
    </html>
  );
}
