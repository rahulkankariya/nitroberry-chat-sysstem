"use client";

import { useState } from "react";
import { useSocket } from "../../context/SocketContext";
import { User } from "../../types/chat";
import Sidebar from "./sidebar/";
import ChatArea from "./ChatArea";
import ChatNavbar from "./ChatNavbar"; 
import EmptyState from "./EmptyState";

type ViewMode = "recent" | "all";

export function ChatContent() {
  const { isConnected } = useSocket();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewMode>("recent");

  return (
    <div className="absolute inset-0 z-50 flex flex-col md:flex-row bg-[rgb(var(--app-bg))] overflow-hidden animate-in fade-in duration-500">
      
      {/* 1. NAVIGATION (Sidebar rail on Desktop, Bottom Bar on Mobile) */}
      <header className="fixed bottom-0 left-0 right-0 z-50 h-20 w-full border-t border-[rgb(var(--app-border))] bg-[rgb(var(--nav-bg))] md:static md:h-full md:w-20 md:border-t-0 md:border-r transition-all duration-300">
        <ChatNavbar 
          isConnected={isConnected} 
          view={view} 
          onViewChange={setView} 
        />
      </header>

      {/* 2. MAIN CONTENT CONTAINER */}
      {/* Added pb-20 on mobile to prevent content from hiding behind the bottom bar */}
      <div className="flex-1 flex p-3 md:p-5 gap-4 overflow-hidden pb-20 md:pb-5">
        
        {/* SIDEBAR (Contacts List) */}
        {/* On mobile: Hidden if a user is selected so the chat can take full screen */}
        <aside className={`
          ${selectedUser ? "hidden" : "flex"} 
          lg:flex w-full lg:w-80 flex-col bg-[rgb(var(--app-surface))] rounded-4xl border border-[rgb(var(--app-border))] shadow-sm overflow-hidden
        `}>
          <Sidebar
            view={view}
            selectedUserId={selectedUser?._id}
            onSelectUser={setSelectedUser}
          />
        </aside>

        {/* CHAT AREA (Conversation) */}
        {/* On mobile: Only shows if a user is selected */}
        <main className={`
          ${!selectedUser ? "hidden" : "flex"} 
          flex-1 flex-col bg-[rgb(var(--app-surface))] bg-opacity-60 backdrop-blur-xl rounded-[2.5rem] border border-[rgb(var(--app-border))] overflow-hidden relative shadow-sm
          lg:flex
        `}>
          {selectedUser ? (
            <ChatArea activeUser={selectedUser} />
          ) : (
            <EmptyState />
          )}
        </main>
      </div>
    </div>
  );
}