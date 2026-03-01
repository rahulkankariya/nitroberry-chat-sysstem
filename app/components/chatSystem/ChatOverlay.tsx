"use client";

import { AuthProvider } from "@/app/context/AuthContext";
import { SocketProvider } from "../../context/SocketContext";
import { ChatContent } from "./ChatContent";

export function ChatOverlay() {
  return (
    <AuthProvider>
 <SocketProvider>
      <ChatContent />
    </SocketProvider>
    </AuthProvider>
   
  );
}