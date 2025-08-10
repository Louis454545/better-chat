import React, { memo, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SettingsForm } from "./settings-form";
import type { BaseComponentProps, LoadingState, SettingsFormData } from "@/shared/types";

// Lazy load heavy components
const ModelInfoGrid = React.lazy(() => 
  import("./settings-form").then(module => ({ default: module.ModelInfoGrid }))
);
const SettingsHelp = React.lazy(() => 
  import("./settings-form").then(module => ({ default: module.SettingsHelp }))
);

interface SettingsPageProps extends BaseComponentProps {
  userSettings?: {
    googleApiKey?: string;
    selectedModel?: string;
  };
  onSaveSettings: (data: SettingsFormData) => Promise<boolean>;
  loadingState?: LoadingState;
  backUrl?: string;
}

export const SettingsPage = memo(function SettingsPage({
  userSettings,
  onSaveSettings,
  loadingState = 'idle',
  backUrl = "/",
  className = ""
}: SettingsPageProps) {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <div className="container mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href={backUrl}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Chat
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Configure your AI chat preferences and API settings
          </p>
        </div>

        {/* Settings Form */}
        <SettingsForm
          initialApiKey={userSettings?.googleApiKey || ""}
          initialModel={userSettings?.selectedModel || "gemini-2.5-flash"}
          onSave={onSaveSettings}
          loadingState={loadingState}
        />

        {/* Help Section */}
        <Suspense fallback={null}>
          <SettingsHelp className="mt-8" />
        </Suspense>

        {/* Model Information */}
        <Suspense fallback={null}>
          <ModelInfoGrid className="mt-8" />
        </Suspense>
      </div>
    </div>
  );
});