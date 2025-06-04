"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/app/services/auth";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = false,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (requireAuth && !isAuthenticated()) {
      router.push(
        "/auth/signin?redirect=" + encodeURIComponent(window.location.pathname)
      );
    }
    setIsLoading(false);
  }, [router, requireAuth]);

  if (isLoading) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
};

export default AuthGuard;
