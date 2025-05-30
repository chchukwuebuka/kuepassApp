"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/app/services/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push(
        "/login?redirect=" + encodeURIComponent(window.location.pathname)
      );
    }
  }, [router]);

  if (!isAuthenticated()) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
};

export default ProtectedRoute;
