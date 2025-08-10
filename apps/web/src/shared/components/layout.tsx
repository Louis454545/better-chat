import React, { memo } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import type { BaseComponentProps } from "@/shared/types";

interface AppLayoutProps extends BaseComponentProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  showHeader?: boolean;
  headerContent?: React.ReactNode;
}

export const AppLayout = memo(function AppLayout({
  sidebar,
  children,
  showHeader = true,
  headerContent,
  className = ""
}: AppLayoutProps) {
  return (
    <SidebarProvider>
      {sidebar}
      <SidebarInset>
        <div className={`flex h-full flex-col ${className}`}>
          {showHeader && (
            <header className="flex h-16 items-center gap-2 px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <SidebarTrigger />
              <div className="flex-1" />
              {headerContent}
            </header>
          )}
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
});

interface PageHeaderProps extends BaseComponentProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader = memo(function PageHeader({
  title,
  description,
  actions,
  className = ""
}: PageHeaderProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    </div>
  );
});

interface CenteredLayoutProps extends BaseComponentProps {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  padding?: boolean;
}

export const CenteredLayout = memo(function CenteredLayout({
  children,
  maxWidth = 'md',
  padding = true,
  className = ""
}: CenteredLayoutProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  };

  return (
    <div className={`flex items-center justify-center min-h-screen ${className}`}>
      <div className={`w-full ${maxWidthClasses[maxWidth]} ${padding ? 'p-6' : ''}`}>
        {children}
      </div>
    </div>
  );
});