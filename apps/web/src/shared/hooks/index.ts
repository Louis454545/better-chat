import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@my-better-t-app/backend/convex/_generated/api";
import type { Id } from "@my-better-t-app/backend/convex/_generated/dataModel";
import { toast } from "sonner";
import type { 
  ChatState, 
  FileAttachment, 
  LoadingState, 
  MessageHandler,
  ModelChangeHandler,
  FileSelectHandler,
  FileRemoveHandler,
  SettingsFormData
} from "@/shared/types";
import { 
  ConversationService, 
  MessageService, 
  FileService, 
  SettingsService, 
  ErrorService 
} from "@/shared/services";

// Chat state management hook
export function useChatState() {
  const [state, setState] = useState<ChatState>(() => SettingsService.createInitialChatState());

  const updateState = useCallback((updates: Partial<ChatState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const resetInput = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      input: '', 
      attachments: [] 
    }));
  }, []);

  const setSelectedConversation = useCallback((conversationId?: Id<"conversations">) => {
    setState(prev => ({ ...prev, selectedConversationId: conversationId }));
  }, []);

  // Memoize the state object to prevent unnecessary re-renders
  const memoizedState = useMemo(() => state, [
    state.selectedConversationId,
    state.selectedModel,
    state.input,
    state.attachments.length,
    state.uploading,
    state.generating
  ]);

  return {
    state: memoizedState,
    updateState,
    resetInput,
    setSelectedConversation,
  };
}

// Settings hook
export function useSettings() {
  const userSettings = useQuery(api.settings.getUserSettings);
  const updateUserSettings = useMutation(api.settings.updateUserSettings);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');

  const updateSettings = useCallback(async (settings: SettingsFormData) => {
    if (!SettingsService.validateApiKey(settings.googleApiKey)) {
      toast.error("Please enter a valid API key");
      return false;
    }

    setLoadingState('loading');
    try {
      await SettingsService.updateSettings(updateUserSettings, settings);
      toast.success("Settings saved successfully!");
      setLoadingState('success');
      return true;
    } catch (error) {
      const errorMessage = ErrorService.handleSettingsError(error);
      toast.error(errorMessage);
      setLoadingState('error');
      return false;
    }
  }, [updateUserSettings]);

  return {
    userSettings,
    updateSettings,
    loadingState,
    isReady: !!userSettings?.googleApiKey,
  };
}

// File upload hook
export function useFileUpload() {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect: FileSelectHandler = useCallback(async (files) => {
    if (!files?.length) return [];

    setUploading(true);
    const uploadedAttachments: FileAttachment[] = [];
    
    try {
      for (const file of Array.from(files)) {
        const uploadUrl = await FileService.generateUploadUrl(generateUploadUrl);
        const result = await FileService.uploadFile(uploadUrl, file);
        const attachment = await FileService.createFileAttachment(file, result.storageId);
        uploadedAttachments.push(attachment);
      }
      return uploadedAttachments;
    } catch (error) {
      const errorMessage = ErrorService.handleUploadError(error);
      toast.error(errorMessage);
      return [];
    } finally {
      setUploading(false);
    }
  }, [generateUploadUrl]);

  const removeAttachment: FileRemoveHandler = useCallback((attachmentId) => {
    return attachmentId; // Just return the ID to remove, not a function
  }, []);

  return {
    handleFileSelect,
    removeAttachment,
    uploading,
  };
}

// Messages hook
export function useMessages(conversationId?: Id<"conversations">) {
  return useQuery(
    api.messages.getMessages,
    conversationId ? { conversationId } : "skip"
  );
}

// Conversations hook
export function useConversations() {
  const conversations = useQuery(api.conversations.getConversations);
  const createConversation = useMutation(api.conversations.createConversation);
  const updateConversationTitle = useMutation(api.conversations.updateConversationTitle);
  const deleteConversation = useMutation(api.conversations.deleteConversation);

  const createNewConversation = useCallback(async (title?: string) => {
    try {
      return await ConversationService.createConversation(createConversation, title);
    } catch (error) {
      const errorMessage = ErrorService.handleConversationError(error);
      toast.error(errorMessage);
      throw error;
    }
  }, [createConversation]);

  const updateTitle = useCallback(async (conversationId: Id<"conversations">, title: string) => {
    try {
      await ConversationService.updateConversationTitle(updateConversationTitle, conversationId, title);
      toast.success("Conversation title updated");
    } catch (error) {
      const errorMessage = ErrorService.handleConversationError(error);
      toast.error(errorMessage);
      throw error;
    }
  }, [updateConversationTitle]);

  const deleteConv = useCallback(async (conversationId: Id<"conversations">) => {
    try {
      await ConversationService.deleteConversation(deleteConversation, conversationId);
      toast.success("Conversation deleted");
    } catch (error) {
      const errorMessage = ErrorService.handleConversationError(error);
      toast.error(errorMessage);
      throw error;
    }
  }, [deleteConversation]);

  return {
    conversations,
    createNewConversation,
    updateTitle,
    deleteConversation: deleteConv,
  };
}

// Message sending hook
export function useMessageSending() {
  const saveMessage = useMutation(api.messages.saveMessage);
  const generateAIResponseStream = useAction(api.ai.generateAIResponseStream);
  const [generating, setGenerating] = useState(false);

  const sendMessage: MessageHandler = useCallback(async (content, attachments) => {
    setGenerating(true);
    try {
      // This will be implemented by the calling component
      // as it needs access to conversation and settings state
      throw new Error("sendMessage must be implemented by the calling component");
    } finally {
      setGenerating(false);
    }
  }, []);

  const createSendMessage = useCallback((
    selectedConversationId: Id<"conversations"> | undefined,
    userSettings: any,
    selectedModel: string,
    createNewConversation: () => Promise<Id<"conversations">>
  ) => {
    return async (content: string, attachments?: Id<"_storage">[]) => {
      if (!userSettings?.googleApiKey) {
        toast.error("Please configure your API key in settings");
        return;
      }

      setGenerating(true);
      try {
        let conversationId = selectedConversationId;

        if (!conversationId) {
          const title = content.length > 50 ? content.substring(0, 50) + "..." : content;
          conversationId = await createNewConversation();
        }

        await MessageService.saveMessage(saveMessage, {
          conversationId,
          role: "user",
          content,
          attachments,
        });

        await MessageService.generateAIResponse(generateAIResponseStream, {
          conversationId,
          apiKey: userSettings.googleApiKey,
          selectedModel,
        });
      } catch (error) {
        const errorMessage = ErrorService.handleMessageError(error);
        toast.error(errorMessage);
      } finally {
        setGenerating(false);
      }
    };
  }, [saveMessage, generateAIResponseStream]);

  return {
    generating,
    createSendMessage,
  };
}

// Model selection hook
export function useModelSelection(userSettings: any, updateUserSettings: any) {
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');

  useEffect(() => {
    if (userSettings?.selectedModel) {
      setSelectedModel(userSettings.selectedModel);
    }
  }, [userSettings]);

  const handleModelChange: ModelChangeHandler = useCallback(async (model) => {
    setSelectedModel(model);
    if (userSettings) {
      await SettingsService.updateSettings(updateUserSettings, {
        googleApiKey: userSettings.googleApiKey,
        selectedModel: model,
      });
    }
  }, [userSettings, updateUserSettings]);

  return {
    selectedModel,
    handleModelChange,
  };
}