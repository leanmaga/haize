// src/app/providers.jsx
"use client";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/context/AuthContext";
import { GlobalFeedbackProvider } from "@/components/ui/GlobalFeedbackProvider";

export function Providers({ children, session }) {
  return (
    <SessionProvider session={session}>
      <AuthProvider>
        <GlobalFeedbackProvider>{children}</GlobalFeedbackProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
