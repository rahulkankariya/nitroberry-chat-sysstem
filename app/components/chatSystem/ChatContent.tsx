"use client";

import { useState } from "react";
import { useSocket } from "../../context/SocketContext";
import { User } from "../../types/chat";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";

import ChatNavbar from "./ChatNavbar";

export function ChatContent() {
  const { isConnected } = useSocket();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-app-bg animate-in slide-in-from-right duration-500">
      <ChatNavbar isConnected={isConnected} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          selectedUserId={selectedUser?._id}
          onSelectUser={setSelectedUser}
        />
        <ChatArea activeUser={selectedUser} />
      </div>
    </div>
  );
}