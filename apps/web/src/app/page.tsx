"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { api } from "@my-better-t-app/backend/convex/_generated/api";
import { Id } from "@my-better-t-app/backend/convex/_generated/dataModel";
import { ConversationList } from "@/components/chat/conversation-list";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import { toast } from "sonner";
import { useChat } from '@ai-sdk/react';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import { Response } from '@/components/ai-elements/response';
import { Loader } from '@/components/ai-elements/loader';

const googleModels = [
  { name: 'Gemini 2.5 Flash', value: 'gemini-2.5-flash' },
  { name: 'Gemini 2.5 Pro', value: 'gemini-2.5-pro' },
  { name: 'Gemini 1.5 Flash', value: 'gemini-1.5-flash' },
  { name: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro' },
];

function ChatInterface() {
  const [selectedConversationId, setSelectedConversationId] = useState<Id<"conversations"> | null>(null);
  const [selectedModel, setSelectedModel] = useState(googleModels[0].value);

  const userSettings = useQuery(api.settings.getUserSettings);
  const messages = useQuery(
    api.messages.getMessages,
    selectedConversationId ? { conversationId: selectedConversationId } : "skip"
  );

  const createConversation = useMutation(api.conversations.createConversation);
  const saveMessage = useMutation(api.messages.saveMessage);
  const generateAIResponse = useAction(api.ai.generateAIResponse);
  const updateUserSettings = useMutation(api.settings.updateUserSettings);

  // Update selected model when user settings change
  useEffect(() => {
    if (userSettings?.selectedModel) {
      setSelectedModel(userSettings.selectedModel);
    }
  }, [userSettings]);

  // Custom chat implementation using Convex instead of API routes
  const handleSendMessage = async (content: string) => {
    if (!selectedConversationId || !userSettings?.googleApiKey) {
      toast.error("Please select a conversation and configure your API key");
      return;
    }

    try {
      // Save user message
      await saveMessage({
        conversationId: selectedConversationId,
        role: "user",
        content,
      });

      // Generate AI response using Convex action
      await generateAIResponse({
        conversationId: selectedConversationId,
        apiKey: userSettings.googleApiKey,
        selectedModel: selectedModel,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const handleModelChange = async (model: string) => {
    setSelectedModel(model);
    if (userSettings) {
      await updateUserSettings({
        googleApiKey: userSettings.googleApiKey,
        selectedModel: model,
      });
    }
  };

  const handleNewConversation = async () => {
    try {
      const conversationId = await createConversation({
        title: `Chat ${new Date().toLocaleDateString()}`,
      });
      setSelectedConversationId(conversationId);
    } catch (error) {
      toast.error("Failed to create conversation");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const input = formData.get('message') as string;
    if (input?.trim()) {
      handleSendMessage(input.trim());
      // Clear the form
      (e.target as HTMLFormElement).reset();
    }
  };

  if (!userSettings?.googleApiKey) {
    return (
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 border-r bg-muted/10">
          <ConversationList
            selectedConversationId={selectedConversationId}
            onSelectConversation={setSelectedConversationId}
            onNewConversation={handleNewConversation}
          />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Welcome to AI Chat</h1>
            <p className="text-muted-foreground">
              Please configure your Google AI settings to get started
            </p>
            <Link href="/settings">
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Go to Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-80 border-r bg-muted/10">
        <ConversationList
          selectedConversationId={selectedConversationId}
          onSelectConversation={setSelectedConversationId}
          onNewConversation={handleNewConversation}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversationId ? (
          <div className="flex-1 flex flex-col p-4">
            <Conversation className="flex-1">
              <ConversationContent>
                {messages?.map((message) => (
                  <Message from={message.role} key={message._id}>
                    <MessageContent>
                      <Response>{message.content}</Response>
                    </MessageContent>
                  </Message>
                ))}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>

            <PromptInput onSubmit={handleSubmit} className="mt-4">
              <PromptInputTextarea name="message" placeholder="Type your message..." />
              <PromptInputToolbar>
                <PromptInputTools>
                  <PromptInputModelSelect
                    onValueChange={handleModelChange}
                    value={selectedModel}
                  >
                    <PromptInputModelSelectTrigger>
                      <PromptInputModelSelectValue />
                    </PromptInputModelSelectTrigger>
                    <PromptInputModelSelectContent>
                      {googleModels.map((model) => (
                        <PromptInputModelSelectItem key={model.value} value={model.value}>
                          {model.name}
                        </PromptInputModelSelectItem>
                      ))}
                    </PromptInputModelSelectContent>
                  </PromptInputModelSelect>
                </PromptInputTools>
                <PromptInputSubmit />
              </PromptInputToolbar>
            </PromptInput>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p>Select a conversation or create a new one to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UnauthenticatedView() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-80 border-r bg-muted/10">
        <ConversationList
          selectedConversationId={undefined}
          onSelectConversation={() => {}}
          onNewConversation={() => {}}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-3xl font-bold">Welcome to AI Chat</h1>
          <p className="text-muted-foreground">
            Sign in to start chatting with AI assistants powered by Google's Gemini models.
          </p>
          <div className="flex gap-4 justify-center">
            <SignInButton mode="modal">
              <Button variant="outline">Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button>Get Started</Button>
            </SignUpButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <AuthLoading>
        <div className="flex h-screen items-center justify-center">
          <Loader />
        </div>
      </AuthLoading>
      <Authenticated>
        <ChatInterface />
      </Authenticated>
      <Unauthenticated>
        <UnauthenticatedView />
      </Unauthenticated>
    </>
  );
}
