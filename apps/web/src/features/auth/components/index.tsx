import React from "react";
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import type { BaseComponentProps } from "@/shared/types";

interface AuthButtonGroupProps extends BaseComponentProps {
  variant?: "modal" | "redirect";
  showUserButton?: boolean;
}

export function AuthButtonGroup({ 
  variant = "modal", 
  showUserButton = true,
  className = "" 
}: AuthButtonGroupProps) {
  return (
    <>
      <SignedIn>
        {showUserButton && <UserButton />}
      </SignedIn>
      <SignedOut>
        <div className={`space-y-2 ${className}`}>
          <SignInButton mode={variant}>
            <Button variant="outline" className="w-full">
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton mode={variant}>
            <Button className="w-full">
              Sign Up
            </Button>
          </SignUpButton>
        </div>
      </SignedOut>
    </>
  );
}

interface AuthWrapperProps extends BaseComponentProps {
  authenticatedContent: React.ReactNode;
  unauthenticatedContent: React.ReactNode;
}

export function AuthWrapper({ 
  authenticatedContent, 
  unauthenticatedContent
}: AuthWrapperProps) {
  return (
    <>
      <SignedIn>
        {authenticatedContent}
      </SignedIn>
      <SignedOut>
        {unauthenticatedContent}
      </SignedOut>
    </>
  );
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  return (
    <SignedIn>
      {children}
    </SignedIn>
  );
}

interface WelcomeMessageProps extends BaseComponentProps {
  title?: string;
  description?: string;
}

export function WelcomeMessage({ 
  title = "Welcome to AI Chat",
  description = "Sign in to start chatting with AI assistants powered by Google's Gemini models.",
  className = ""
}: WelcomeMessageProps) {
  return (
    <div className={`text-center space-y-4 max-w-md ${className}`}>
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
      <div className="flex gap-4 justify-center">
        <AuthButtonGroup variant="modal" showUserButton={false} />
      </div>
    </div>
  );
}