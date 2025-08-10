import React, { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader } from '@/components/ai-elements/loader';
import { SidebarProvider } from "@/components/ui/sidebar";
import type { BaseComponentProps } from "@/shared/types";

interface LoadingSkeletonProps extends BaseComponentProps {
  type?: 'sidebar' | 'chat' | 'full' | 'inline';
  count?: number;
}

export const LoadingSkeleton = memo(function LoadingSkeleton({ 
  type = 'inline', 
  count = 3,
  className = ""
}: LoadingSkeletonProps) {
  switch (type) {
    case 'sidebar':
      return (
        <div className={`space-y-2 p-4 ${className}`}>
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: count }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      );
      
    case 'chat':
      return (
        <div className={`space-y-4 p-6 ${className}`}>
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      );
      
    case 'full':
      return (
        <SidebarProvider>
          <div className="flex h-screen">
            {/* Sidebar skeleton */}
            <div className="w-64 border-r bg-background">
              <LoadingSkeleton type="sidebar" />
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
                <div className="flex items-center justify-between gap-2">
                  <Skeleton className="h-9 w-9" />
                  <Skeleton className="h-9 w-9" />
                  <Skeleton className="h-9 w-9" />
                </div>
              </div>
            </div>
            
            {/* Main content skeleton */}
            <div className="flex-1 flex flex-col">
              <div className="h-16 border-b p-4 flex items-center gap-2">
                <Skeleton className="h-6 w-6" />
              </div>
              <div className="flex-1 flex items-center justify-center">
                <Loader />
              </div>
            </div>
          </div>
        </SidebarProvider>
      );
      
    default:
      return (
        <div className={`space-y-2 ${className}`}>
          {Array.from({ length: count }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      );
  }
});

interface SpinnerProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const Spinner = memo(function Spinner({ 
  size = 'md', 
  text,
  className = ""
}: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-primary ${sizeClasses[size]}`} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
});

interface LoadingStateProps extends BaseComponentProps {
  isLoading: boolean;
  loadingComponent?: React.ReactNode;
  children: React.ReactNode;
}

export const LoadingState = memo(function LoadingState({
  isLoading,
  loadingComponent,
  children,
  className = ""
}: LoadingStateProps) {
  if (isLoading) {
    return (
      <div className={className}>
        {loadingComponent || <LoadingSkeleton />}
      </div>
    );
  }

  return <>{children}</>;
});