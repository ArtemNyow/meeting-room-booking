import type { Metadata } from "next";

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
      <body>
        <QueryProvider>
          <AuthGuard>{children}</AuthGuard>
        </QueryProvider>
      </body>
    </html>
  );
}
