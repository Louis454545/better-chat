"use client";

import { useQuery, useMutation } from "convex/react";
import { Authenticated, Unauthenticated } from "convex/react";
import { api } from "@my-better-t-app/backend/convex/_generated/api";
import { SettingsForm } from "@/components/settings/settings-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import { toast } from "sonner";

function SettingsInterface() {
  const userSettings = useQuery(api.settings.getUserSettings);
  const updateSettings = useMutation(api.settings.updateUserSettings);

  const handleSaveSettings = async (apiKey: string, model: string) => {
    try {
      await updateSettings({
        googleApiKey: apiKey,
        selectedModel: model,
      });
      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
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
          onSave={handleSaveSettings}
        />

        {/* Help Section */}
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold">Getting Started</h2>
          <div className="prose prose-sm max-w-none">
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Get your Google AI API key from{" "}
                <a
                  href="https://ai.google.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Google AI Studio
                </a>
              </li>
              <li>Enter your API key in the form above</li>
              <li>Choose your preferred AI model</li>
              <li>Click "Save Settings" to apply your changes</li>
              <li>Go back to the chat to start conversations with AI</li>
            </ol>
          </div>
        </div>

        {/* Model Information */}
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold">Available Models</h2>
          <div className="grid gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium">Gemini 2.5 Flash</h3>
              <p className="text-sm text-muted-foreground">
                Fast and efficient model for most conversations
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium">Gemini 2.5 Pro</h3>
              <p className="text-sm text-muted-foreground">
                More capable model for complex tasks and reasoning
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium">Gemini 1.5 Flash</h3>
              <p className="text-sm text-muted-foreground">
                Previous generation fast model
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium">Gemini 1.5 Pro</h3>
              <p className="text-sm text-muted-foreground">
                Previous generation pro model
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UnauthenticatedSettings() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Please sign in to access your settings and configure your AI preferences.
        </p>
        <div className="flex gap-4 justify-center">
          <SignInButton mode="modal">
            <Button variant="outline">Sign In</Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button>Get Started</Button>
          </SignUpButton>
        </div>
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <>
      <Authenticated>
        <SettingsInterface />
      </Authenticated>
      <Unauthenticated>
        <UnauthenticatedSettings />
      </Unauthenticated>
    </>
  );
}