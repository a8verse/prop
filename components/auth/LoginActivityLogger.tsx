"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function LoginActivityLogger() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Log login activity
      fetch("/api/auth/log-activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          metadata: {
            timestamp: new Date().toISOString(),
          },
        }),
      }).catch((err) => console.error("Error logging login activity:", err));
    }
  }, [status, session]);

  return null; // This component doesn't render anything
}

