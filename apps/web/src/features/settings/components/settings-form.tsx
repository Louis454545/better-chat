import React, { useState, useEffect, memo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, ExternalLink } from "lucide-react";
import type { AIModel, BaseComponentProps, LoadingState, SettingsFormData } from "@/shared/types";
import { GOOGLE_MODELS } from "@/shared/types";

interface SettingsFormProps extends BaseComponentProps {
  initialApiKey?: string;
  initialModel?: string;
  onSave: (data: SettingsFormData) => Promise<boolean>;
  loadingState?: LoadingState;
  models?: AIModel[];
}

export const SettingsForm = memo(function SettingsForm({ 
  initialApiKey = "", 
  initialModel = "gemini-2.5-flash", 
  onSave,
  loadingState = 'idle',
  models = GOOGLE_MODELS,
  className = ""
}: SettingsFormProps) {
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [selectedModel, setSelectedModel] = useState(initialModel);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    setApiKey(initialApiKey);
    setSelectedModel(initialModel);
  }, [initialApiKey, initialModel]);

  const handleSave = async () => {
    if (apiKey.trim()) {
      await onSave({
        googleApiKey: apiKey.trim(),
        selectedModel,
      });
    }
  };

  const isLoading = loadingState === 'loading';
  const isDisabled = !apiKey.trim() || isLoading;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>AI Settings</CardTitle>
        <CardDescription>
          Configure your Google AI settings to start chatting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="apiKey">Google AI API Key</Label>
          <div className="relative">
            <Input
              id="apiKey"
              type={showApiKey ? "text" : "password"}
              placeholder="Enter your Google AI API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Get your API key from{" "}
            <a
              href="https://ai.google.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="underline inline-flex items-center gap-1 hover:text-foreground"
            >
              Google AI Studio
              <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Select
            value={selectedModel}
            onValueChange={setSelectedModel}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  <div className="flex flex-col">
                    <span>{model.name}</span>
                    {model.description && (
                      <span className="text-xs text-muted-foreground">
                        {model.description}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={isDisabled}
          className="w-full"
        >
          {isLoading ? "Saving..." : "Save Settings"}
        </Button>
      </CardContent>
    </Card>
  );
});

interface ModelInfoCardProps extends BaseComponentProps {
  model: AIModel;
}

export function ModelInfoCard({ model, className = "" }: ModelInfoCardProps) {
  return (
    <div className={`border rounded-lg p-4 ${className}`}>
      <h3 className="font-medium">{model.name}</h3>
      {model.description && (
        <p className="text-sm text-muted-foreground mt-1">
          {model.description}
        </p>
      )}
    </div>
  );
}

interface ModelInfoGridProps extends BaseComponentProps {
  models?: AIModel[];
  title?: string;
}

export function ModelInfoGrid({ 
  models = GOOGLE_MODELS, 
  title = "Available Models",
  className = ""
}: ModelInfoGridProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="grid gap-4">
        {models.map((model) => (
          <ModelInfoCard key={model.value} model={model} />
        ))}
      </div>
    </div>
  );
}

interface SettingsHelpProps extends BaseComponentProps {
  title?: string;
}

export function SettingsHelp({ 
  title = "Getting Started",
  className = ""
}: SettingsHelpProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="prose prose-sm max-w-none">
        <ol className="list-decimal list-inside space-y-2">
          <li>
            Get your Google AI API key from{" "}
            <a
              href="https://ai.google.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              Google AI Studio
              <ExternalLink className="h-3 w-3" />
            </a>
          </li>
          <li>Enter your API key in the form above</li>
          <li>Choose your preferred AI model</li>
          <li>Click "Save Settings" to apply your changes</li>
          <li>Go back to the chat to start conversations with AI</li>
        </ol>
      </div>
    </div>
  );
}