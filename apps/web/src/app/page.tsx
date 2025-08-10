"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { api } from "@my-better-t-app/backend/convex/_generated/api";
import type { Id } from "@my-better-t-app/backend/convex/_generated/dataModel";
import { ConversationList } from "@/components/chat/conversation-list";
import { Button } from "@/components/ui/button";
import { Settings, Paperclip, X } from "lucide-react";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import { toast } from "sonner";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputButton,
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
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Array<{ id: Id<"_storage">; name: string; url: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const userSettings = useQuery(api.settings.getUserSettings);
  const messages = useQuery(
    api.messages.getMessages,
    selectedConversationId ? { conversationId: selectedConversationId } : "skip"
  );

  const createConversation = useMutation(api.conversations.createConversation);
  const saveMessage = useMutation(api.messages.saveMessage);
  const generateAIResponseStream = useAction(api.ai.generateAIResponseStream);
  const updateUserSettings = useMutation(api.settings.updateUserSettings);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  // Update selected model when user settings change
  useEffect(() => {
    if (userSettings?.selectedModel) {
      setSelectedModel(userSettings.selectedModel);
    }
  }, [userSettings]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    
    try {
      for (const file of Array.from(files)) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await result.json();
        const tempUrl = URL.createObjectURL(file);
        
        setAttachments(prev => [...prev, {
          id: storageId,
          name: file.name,
          url: tempUrl
        }]);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = (id: Id<"_storage">) => {
    setAttachments(prev => {
      const attachment = prev.find(a => a.id === id);
      if (attachment?.url.startsWith('blob:')) {
        URL.revokeObjectURL(attachment.url);
      }
      return prev.filter(a => a.id !== id);
    });
  };

  const handleSendMessage = async (content: string, attachments?: Id<"_storage">[]) => {
    if (!selectedConversationId || !userSettings?.googleApiKey) {
      toast.error("Please select a conversation and configure your API key");
      return;
    }

    setGenerating(true);
    try {
      // Save user message
      await saveMessage({
        conversationId: selectedConversationId,
        role: "user",
        content,
        attachments,
      });

      // Generate AI response with streaming
      await generateAIResponseStream({
        conversationId: selectedConversationId,
        apiKey: userSettings.googleApiKey,
        selectedModel: selectedModel,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || attachments.length > 0) && !generating && !uploading) {
      handleSendMessage(input.trim(), attachments.map(a => a.id));
      setInput('');
      
      // Clean up blob URLs
      attachments.forEach(attachment => {
        if (attachment.url.startsWith('blob:')) {
          URL.revokeObjectURL(attachment.url);
        }
      });
      setAttachments([]);
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

  if (!userSettings?.googleApiKey) {
    return (
      <div className="flex h-screen">
        <div className="w-80 border-r bg-muted/10">
          <ConversationList
            selectedConversationId={selectedConversationId}
            onSelectConversation={setSelectedConversationId}
            onNewConversation={handleNewConversation}
          />
        </div>
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
      <div className="w-80 border-r bg-muted/10">
        <ConversationList
          selectedConversationId={selectedConversationId}
          onSelectConversation={setSelectedConversationId}
          onNewConversation={handleNewConversation}
        />
      </div>

      <div className="flex-1 flex flex-col">
        {selectedConversationId ? (
          <div className="max-w-4xl mx-auto p-6 relative size-full h-screen">
            <div className="flex flex-col h-full">
              <Conversation className="h-full">
                <ConversationContent>
                  {messages?.map((message) => (
                    <Message from={message.role} key={message._id}>
                      <MessageContent>
                        {/* Show attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="space-y-2 mb-2">
                            {message.attachments.map((storageId) => (
                              <AttachmentDisplay key={storageId} storageId={storageId} />
                            ))}
                          </div>
                        )}
                        
                        {/* Show message content */}
                        {message.content && (
                          <Response>{message.content}</Response>
                        )}
                      </MessageContent>
                    </Message>
                  ))}
                  {generating && <Loader />}
                </ConversationContent>
                <ConversationScrollButton />
              </Conversation>

              <div>
                {/* Attachments preview */}
                {attachments.length > 0 && (
                  <div className="p-4 pb-0">
                    <div className="flex flex-wrap gap-2">
                      {attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center gap-2 bg-secondary rounded-md px-3 py-2">
                          <span className="text-sm text-foreground truncate max-w-32">
                            {attachment.name}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(attachment.id)}
                            className="h-4 w-4 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <PromptInput onSubmit={handleSubmit} className="mt-4">
                  <PromptInputTextarea
                    onChange={(e) => setInput(e.target.value)}
                    value={input}
                    placeholder="Type your message..."
                  />
                  <PromptInputToolbar>
                    <PromptInputTools>
                      <input
                        type="file"
                        multiple
                        accept="image/*,application/pdf,.txt,.doc,.docx"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <PromptInputButton
                        type="button"
                        variant="ghost"
                        onClick={() => document.getElementById('file-upload')?.click()}
                        disabled={uploading}
                      >
                        <Paperclip className="h-4 w-4" />
                        <span>Attach</span>
                      </PromptInputButton>
                      
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
                    <PromptInputSubmit 
                      disabled={(!input.trim() && attachments.length === 0) || generating || uploading}
                      status={generating ? 'streaming' : 'ready'}
                    />
                  </PromptInputToolbar>
                </PromptInput>
              </div>
            </div>
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

function AttachmentDisplay({ storageId }: { storageId: Id<"_storage"> }) {
  const fileUrl = useQuery(api.files.getFileUrl, { storageId });
  const metadata = useQuery(api.files.getFileMetadata, { storageId });

  if (!fileUrl || !metadata) return null;

  const isImage = metadata.contentType?.startsWith('image/');
  
  return (
    <div className="border rounded-md p-2 bg-secondary/50">
      {isImage ? (
        <img 
          src={fileUrl} 
          alt="Uploaded image" 
          className="max-w-xs max-h-48 rounded object-cover"
        />
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <div className="text-sm font-medium truncate">
              File attachment
            </div>
            <div className="text-xs text-muted-foreground">
              {metadata.contentType} • {(metadata.size / 1024).toFixed(1)} KB
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UnauthenticatedView() {
  return (
    <div className="flex h-screen">
      <div className="w-80 border-r bg-muted/10">
        <ConversationList
          selectedConversationId={undefined}
          onSelectConversation={() => {}}
          onNewConversation={() => {}}
        />
      </div>
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