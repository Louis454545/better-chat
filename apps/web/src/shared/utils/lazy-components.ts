import { lazy } from "react";

// Lazy load non-critical components
export const SettingsPage = lazy(() => 
  import("@/features/settings/components").then(module => ({ 
    default: module.SettingsPage 
  }))
);

export const FileUploadZone = lazy(() => 
  import("@/features/files/components").then(module => ({ 
    default: module.FileUploadZone 
  }))
);

export const ModelInfoGrid = lazy(() => 
  import("@/features/settings/components").then(module => ({ 
    default: module.ModelInfoGrid 
  }))
);

export const SettingsHelp = lazy(() => 
  import("@/features/settings/components").then(module => ({ 
    default: module.SettingsHelp 
  }))
);