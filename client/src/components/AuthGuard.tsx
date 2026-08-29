"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { getToken } from "@/lib/auth";

type AuthGuardProps = {
  children: ReactNode;
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isPublicRoute = pathname === "/login" || pathname === "/register";

    if (isPublicRoute) {
      return;
    }

    if (!getToken()) {
      router.replace("/login");
    }
  }, [pathname, router]);

  const isPublicRoute = pathname === "/login" || pathname === "/register";

  if (!isPublicRoute && typeof window !== "undefined" && !getToken()) {
    return null;
  }

  return children;
}
