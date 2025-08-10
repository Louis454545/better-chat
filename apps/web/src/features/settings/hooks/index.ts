import { useCallback } from "react";
import { useSettings } from "@/shared/hooks";
import type { SettingsFormData } from "@/shared/types";

export function useSettingsPage() {
  const { userSettings, updateSettings, loadingState, isReady } = useSettings();

  const handleSaveSettings = useCallback(async (data: SettingsFormData): Promise<boolean> => {
    return await updateSettings(data);
  }, [updateSettings]);

  return {
    userSettings,
    handleSaveSettings,
    loadingState,
    isReady,
  };
}