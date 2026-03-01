"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Define the shape of your User object
interface AuthUser {
  _id: string;
  fullName: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  setCurrentUser: (user: AuthUser | null) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Check local storage or a cookie for an existing session
    const savedUser = localStorage.getItem("chat-user");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to parse user from storage", error);
      }
    }
    setIsLoading(false);
  }, []);

  // Update localStorage whenever the user changes
  const handleSetUser = (user: AuthUser | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem("chat-user", JSON.stringify(user));
    } else {
      localStorage.removeItem("chat-user");
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser: handleSetUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}