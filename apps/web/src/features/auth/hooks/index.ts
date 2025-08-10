"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback } from "react";

export function useAuthStatus() {
  const { isLoaded, isSignedIn, userId } = useAuth();

  const isAuthenticated = isLoaded && isSignedIn;
  const isLoading = !isLoaded;

  return {
    isAuthenticated,
    isLoading,
    userId,
    isLoaded,
    isSignedIn,
  };
}

export function useAuthActions() {
  const signOut = useCallback(() => {
    // Clerk handles sign out automatically through UserButton
    // This hook can be extended for additional auth actions
  }, []);

  return {
    signOut,
  };
}