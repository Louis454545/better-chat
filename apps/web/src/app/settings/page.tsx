"use client";

import React from "react";
import { Authenticated, Unauthenticated } from "convex/react";
import { AuthWrapper, WelcomeMessage } from "@/features/auth/components";
import { SettingsPage } from "@/features/settings/components";
import { useSettingsPage } from "@/features/settings/hooks";
import { ErrorBoundary, CenteredLayout } from "@/shared/components";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

function AuthenticatedSettingsPage() {
  const { userSettings, handleSaveSettings, loadingState } = useSettingsPage();

  return (
    <SettingsPage
      userSettings={userSettings || undefined}
      onSaveSettings={handleSaveSettings}
      loadingState={loadingState}
      backUrl="/"
    />
  );
}

function UnauthenticatedSettingsPage() {
  return (
    <CenteredLayout>
      <div className="text-center space-y-6">
        <WelcomeMessage 
          title="Settings"
          description="Please sign in to access your settings and configure your AI preferences."
        />
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    </CenteredLayout>
  );
}

export default function SettingsPageRoute() {
  return (
    <ErrorBoundary>
      <AuthWrapper
        authenticatedContent={<AuthenticatedSettingsPage />}
        unauthenticatedContent={<UnauthenticatedSettingsPage />}
      />
    </ErrorBoundary>
  );
}