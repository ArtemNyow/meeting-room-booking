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
  const isPublicRoute =
    pathname === "/login" || pathname === "/register" || pathname === "/";

  useEffect(() => {
    const token = getToken();

    if (isPublicRoute) {
      if (token && pathname !== "/") {
        router.replace("/rooms");
      }

      if (!token && pathname === "/") {
        router.replace("/login");
      }

      return;
    }

    if (!token) {
      router.replace("/login");
    }
  }, [isPublicRoute, pathname, router]);

  if (!isPublicRoute && typeof window !== "undefined" && !getToken()) {
    return null;
  }

  return children;
}
