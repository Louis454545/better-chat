import React, { Component } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw } from "lucide-react";
import type { ErrorInfo, ErrorBoundaryState } from "@/shared/types";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo);
    console.error('Error caught by boundary:', error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.reset);
      }
      
      return <DefaultErrorFallback error={this.state.error!} reset={this.reset} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error;
  reset: () => void;
}

export function DefaultErrorFallback({ error, reset }: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6">
      <div className="text-center space-y-4 max-w-md">
        <div className="flex justify-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <p className="text-sm text-muted-foreground mt-2">
            {error.message || "An unexpected error occurred"}
          </p>
        </div>
        <Button onClick={reset} variant="outline" className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          Try again
        </Button>
      </div>
    </div>
  );
}

export function ChatErrorFallback({ error, reset }: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 p-6">
      <div className="text-center space-y-4 max-w-md">
        <div className="flex justify-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <div>
          <h3 className="font-medium">Chat Error</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Unable to load the chat interface. Please try again.
          </p>
        </div>
        <Button onClick={reset} size="sm" variant="outline" className="gap-2">
          <RefreshCcw className="h-3 w-3" />
          Reload Chat
        </Button>
      </div>
    </div>
  );
}