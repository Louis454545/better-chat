"use client";

import React, { memo } from "react";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { useMutation } from "convex/react";
import { api } from "@my-better-t-app/backend/convex/_generated/api";
import { toast } from "sonner";

// Feature imports
import { AuthWrapper, WelcomeMessage } from "@/features/auth/components";
import { ChatInterface } from "@/features/chat/components";
import { useChatInterface } from "@/features/chat/hooks";

// Shared imports
import { 
  ErrorBoundary, 
  ChatErrorFallback, 
  AppLayout
} from "@/shared/components";
import { useSettings } from "@/shared/hooks";

// UI imports
import { AppSidebar } from "@/components/app-sidebar";

const AuthenticatedChatApp = memo(function AuthenticatedChatApp() {
  const updateUserSettings = useMutation(api.domains.settings.index.updateUserSettings);
  const { userSettings } = useSettings();
  
  const {
    state,
    messages,
    handleInputChange,
    handleFileSelect,
    handleRemoveAttachment,
    handleSendMessage,
    handleModelChange,
    handleNewConversation,
    handleSelectConversation,
  } = useChatInterface(userSettings, updateUserSettings);

  return (
    <ErrorBoundary fallback={(error, reset) => <ChatErrorFallback error={error} reset={reset} />}>
      <AppLayout
        sidebar={
          <AppSidebar
            selectedConversationId={state.selectedConversationId}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
          />
        }
      >
        <ChatInterface
          messages={messages}
          hasSelectedConversation={!!state.selectedConversationId}
          input={state.input}
          onInputChange={handleInputChange}
          attachments={state.attachments}
          selectedModel={state.selectedModel}
          onModelChange={handleModelChange}
          onFileSelect={handleFileSelect}
          onRemoveAttachment={handleRemoveAttachment}
          onSendMessage={handleSendMessage}
          isGenerating={state.generating}
          isUploading={state.uploading}
          emptyStateTitle="Start a new conversation"
          emptyStateDescription="Type a message below to begin chatting with AI"
          newConversationPlaceholder="Type your message to start a new conversation..."
        />
      </AppLayout>
    </ErrorBoundary>
  );
});

const UnauthenticatedView = memo(function UnauthenticatedView() {
  const handleAuthRequired = () => {
    toast.info("Please sign in to access this feature");
  };

  return (
    <AppLayout
      sidebar={
        <AppSidebar
          selectedConversationId={undefined}
          onSelectConversation={handleAuthRequired}
          onNewConversation={handleAuthRequired}
        />
      }
    >
      <div className="flex h-full items-center justify-center">
        <WelcomeMessage />
      </div>
    </AppLayout>
  );
});

const AuthLoadingView = memo(function AuthLoadingView() {
  return null; // Remove loading skeleton during auth
});

function AuthStateManager() {
  return (
    <AuthWrapper
      authenticatedContent={<AuthenticatedChatApp />}
      unauthenticatedContent={<UnauthenticatedView />}
    />
  );
}

export default function HomePage() {
  return (
    <ErrorBoundary>
      <AuthLoading>
        <AuthLoadingView />
      </AuthLoading>
      <AuthStateManager />
    </ErrorBoundary>
  );
}