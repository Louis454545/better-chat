"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";

interface SettingsFormProps {
  initialApiKey?: string;
  initialModel?: string;
  onSave: (apiKey: string, model: string) => void;
}

const GOOGLE_MODELS = [
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
  { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
];

export function SettingsForm({ initialApiKey = "", initialModel = "gemini-2.5-flash", onSave }: SettingsFormProps) {
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [selectedModel, setSelectedModel] = useState(initialModel);

  useEffect(() => {
    setApiKey(initialApiKey);
    setSelectedModel(initialModel);
  }, [initialApiKey, initialModel]);

  const handleSave = () => {
    if (apiKey.trim()) {
      onSave(apiKey.trim(), selectedModel);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Settings</CardTitle>
        <CardDescription>
          Configure your Google AI settings to start chatting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="apiKey">Google AI API Key</Label>
          <Input
            id="apiKey"
            type="password"
            placeholder="Enter your Google AI API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Get your API key from{" "}
            <a
              href="https://ai.google.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Google AI Studio
            </a>
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <select
            id="model"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full h-10 px-3 py-2 border border-input bg-background text-sm ring-offset-background rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {GOOGLE_MODELS.map((model) => (
              <option key={model.value} value={model.value}>
                {model.label}
              </option>
            ))}
          </select>
        </div>

        <Button onClick={handleSave} disabled={!apiKey.trim()}>
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
}