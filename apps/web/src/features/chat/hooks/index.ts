import { useCallback } from "react";
import { toast } from "sonner";
import type { Id } from "@my-better-t-app/backend/convex/_generated/dataModel";
import { 
  useChatState, 
  useMessages, 
  useConversations, 
  useMessageSending, 
  useModelSelection,
  useFileUpload 
} from "@/shared/hooks";
import { FileService } from "@/shared/services";
import type { FileAttachment } from "@/shared/types";

export function useChatInterface(userSettings: any, updateUserSettings: any) {
  const { state, updateState, resetInput, setSelectedConversation } = useChatState();
  const messages = useMessages(state.selectedConversationId);
  const { conversations, createNewConversation } = useConversations();
  const { generating, createSendMessage } = useMessageSending();
  const { selectedModel, handleModelChange } = useModelSelection(userSettings, updateUserSettings);
  const { handleFileSelect, removeAttachment, uploading } = useFileUpload();

  // Handle input changes
  const handleInputChange = useCallback((value: string) => {
    updateState({ input: value });
  }, [updateState]);

  // Handle file selection
  const handleFileSelectWithState = useCallback(async (files: FileList): Promise<FileAttachment[]> => {
    const uploadedFiles = await handleFileSelect(files);
    if (uploadedFiles.length > 0) {
      updateState({ 
        attachments: [...state.attachments, ...uploadedFiles] 
      });
    }
    return uploadedFiles;
  }, [handleFileSelect, state.attachments, updateState]);

  // Handle file removal
  const handleRemoveAttachment = useCallback((attachmentId: Id<"_storage">) => {
    updateState({ 
      attachments: state.attachments.filter(a => {
        if (a.id === attachmentId) {
          FileService.cleanupBlobUrl(a.url);
          return false;
        }
        return true;
      })
    });
  }, [state.attachments, updateState]);

  // Create send message handler
  const sendMessage = createSendMessage(
    state.selectedConversationId,
    userSettings,
    selectedModel,
    async () => {
      const title = state.input.length > 50 ? state.input.substring(0, 50) + "..." : state.input;
      const conversationId = await createNewConversation(title);
      setSelectedConversation(conversationId);
      return conversationId;
    }
  );

  // Handle message sending
  const handleSendMessage = useCallback(async (content: string, attachments?: Id<"_storage">[]) => {
    await sendMessage(content, attachments);
    resetInput();
    
    // Clean up blob URLs
    state.attachments.forEach(attachment => {
      FileService.cleanupBlobUrl(attachment.url);
    });
    updateState({ attachments: [] });
  }, [sendMessage, resetInput, state.attachments, updateState]);

  // Handle new conversation
  const handleNewConversation = useCallback(async () => {
    try {
      const conversationId = await createNewConversation();
      setSelectedConversation(conversationId);
    } catch (error) {
      toast.error("Failed to create conversation");
    }
  }, [createNewConversation, setSelectedConversation]);

  // Handle conversation selection
  const handleSelectConversation = useCallback((conversationId: Id<"conversations">) => {
    setSelectedConversation(conversationId);
  }, [setSelectedConversation]);

  return {
    // State
    state: {
      ...state,
      selectedModel,
      generating,
      uploading,
    },
    
    // Data
    messages,
    conversations,
    
    // Handlers
    handleInputChange,
    handleFileSelect: handleFileSelectWithState,
    handleRemoveAttachment,
    handleSendMessage,
    handleModelChange,
    handleNewConversation,
    handleSelectConversation,
  };
}