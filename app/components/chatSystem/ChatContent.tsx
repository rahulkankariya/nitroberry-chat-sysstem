"use client";

import { useState } from "react";
import { useSocket } from "../../context/SocketContext";
import { User } from "../../types/chat";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";
import ChatNavbar from "./ChatNavbar"; 
import { Menu, X } from "lucide-react"; 

// Define the ViewMode type locally or import it
type ViewMode = "recent" | "all";

export function ChatContent() {
  const { isConnected } = useSocket();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- LIFTED STATE ---
  // This state controls what the Navbar shows as active and what the Sidebar filters
  const [view, setView] = useState<ViewMode>("recent");

  return (
    <div className="absolute inset-0 z-50 flex bg-[rgb(var(--app-bg))] overflow-hidden animate-in fade-in duration-500">
      
      {/* 1. MOBILE HAMBURGER */}
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-60 p-2 bg-[rgb(var(--app-accent))] text-white rounded-xl shadow-lg"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* 2. VERTICAL NAVBAR */}
      <header className={`
        fixed inset-y-0 left-0 z-50 w-20 shrink-0  border-[rgb(var(--app-text))/5] bg-[rgb(var(--bubble-secondary))]
        transition-transform duration-300 md:translate-x-0 md:static
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* ADDED PROPS HERE */}
        <ChatNavbar 
          isConnected={isConnected} 
          view={view} 
          onViewChange={setView} 
        />
      </header>

      {/* 3. MAIN CONTENT CONTAINER */}
      <div className="flex-1 flex p-3 md:p-5 gap-4 overflow-hidden">
        
        {/* SIDEBAR */}
        <aside className="hidden lg:flex w-80 flex-col bg-[rgb(var(--bubble-secondary))] rounded-4xl shadow-sm  border-[rgb(var(--app-text))/5] overflow-hidden">
          {/* ADDED VIEW PROP HERE */}
          <Sidebar
            view={view}
            selectedUserId={selectedUser?._id}
            onSelectUser={setSelectedUser}
          />
        </aside>

        {/* CHAT AREA */}
        <main className="flex-1 flex flex-col bg-[rgb(var(--bubble-secondary))/40] backdrop-blur-xl rounded-[2.5rem]  border-[rgb(var(--app-text))/5] overflow-hidden relative">
          {selectedUser ? (
            <ChatArea activeUser={selectedUser} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-40">
              <div className="w-16 h-16 bg-[rgb(var(--app-accent))] rounded-full mb-4 animate-bounce" />
              <p className="text-xl font-semibold text-app-text">Select a chat to begin</p>
            </div>
          )}
        </main>
      </div>

      {/* MOBILE OVERLAY CLOAK */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}