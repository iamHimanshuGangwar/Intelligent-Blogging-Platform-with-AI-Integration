"use client";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import PageTransition from "@/components/PageTransition";
import OnboardingOverlay from "@/components/OnboardingOverlay";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <PageTransition>
        {children}
      </PageTransition>
      <OnboardingOverlay />
    </ErrorBoundary>
  );
}
