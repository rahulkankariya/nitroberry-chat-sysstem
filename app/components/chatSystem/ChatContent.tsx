"use client";

import { useState } from "react";
import { useSocket } from "../../context/SocketContext";
import { User } from "../../types/chat";
// import Sidebar from "./Sidebar";
import Sidebar from "./sidebar/";
import ChatArea from "./ChatArea";
import ChatNavbar from "./ChatNavbar"; 
import { Menu, X } from "lucide-react"; 
import EmptyState from "./EmptyState";

type ViewMode = "recent" | "all";

export function ChatContent() {
  const { isConnected } = useSocket();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [view, setView] = useState<ViewMode>("recent");

  return (
    // Body Background
    <div className="absolute inset-0 z-50 flex bg-[rgb(var(--app-bg))] overflow-hidden animate-in fade-in duration-500">
      
      {/* 1. MOBILE HAMBURGER */}
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-60 p-2 bg-[rgb(var(--app-accent))] text-white rounded-xl shadow-lg hover:scale-105 transition-transform"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* 2. VERTICAL NAVBAR (Dark rail from Image 1 & 2) */}
      <header className={`
        fixed inset-y-0 left-0 z-50 w-20 shrink-0 border-r border-[rgb(var(--app-border))] bg-[rgb(var(--nav-bg))]
        transition-transform duration-300 md:translate-x-0 md:static
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <ChatNavbar 
          isConnected={isConnected} 
          view={view} 
          onViewChange={setView} 
        />
      </header>

      {/* 3. MAIN CONTENT CONTAINER */}
      <div className="flex-1 flex p-3 md:p-5 gap-4 overflow-hidden">
        {/* SIDEBAR (The Contacts List) */}
        <aside className="hidden lg:flex w-80 flex-col bg-[rgb(var(--app-surface))] rounded-4xl border border-[rgb(var(--app-border))] shadow-sm overflow-hidden">
          <Sidebar
            view={view}
            selectedUserId={selectedUser?._id}
            onSelectUser={setSelectedUser}
          />
        </aside>

        {/* CHAT AREA (The main Conversation) */}
        <main className="flex-1 flex flex-col bg-[rgb(var(--app-surface))] bg-opacity-60 backdrop-blur-xl rounded-[2.5rem] border border-[rgb(var(--app-border))] overflow-hidden relative shadow-sm">
          {selectedUser ? (
            <ChatArea activeUser={selectedUser} />
          ) : (
           <EmptyState />
          )}
        </main>
      </div>

      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}