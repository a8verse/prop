"use client";

import { SessionProvider } from "next-auth/react";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoginActivityLogger from "@/components/auth/LoginActivityLogger";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <LoginActivityLogger />
        {children}
      </SessionProvider>
    </ErrorBoundary>
  );
}

