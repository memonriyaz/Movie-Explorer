"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { PageLoading } from "@/components/ui/PageLoading";

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo 
}: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (requireAuth) {
      if (status === "unauthenticated") {
        router.replace(redirectTo || "/login");
        return;
      }
    } else {
      if (status === "authenticated") {
        router.replace(redirectTo || "/");
        return;
      }
    }
  }, [status, requireAuth, redirectTo, router]);

  if (status === "loading") {
    return <PageLoading />;
  }
  if (requireAuth && status === "unauthenticated") {
    return <PageLoading />;
  }

  if (!requireAuth && status === "authenticated") {
    return <PageLoading />;
  }

  return <>{children}</>;
}

export function ProtectedPage({ 
  children, 
  redirectTo = "/login" 
}: { 
  children: ReactNode; 
  redirectTo?: string; 
}) {
  return (
    <AuthGuard requireAuth={true} redirectTo={redirectTo}>
      {children}
    </AuthGuard>
  );
}

export function GuestOnlyPage({ 
  children, 
  redirectTo = "/" 
}: { 
  children: ReactNode; 
  redirectTo?: string; 
}) {
  return (
    <AuthGuard requireAuth={false} redirectTo={redirectTo}>
      {children}
    </AuthGuard>
  );
}
