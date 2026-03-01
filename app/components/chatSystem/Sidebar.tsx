"use client";

import { useState, useMemo } from "react";
import { Search, X, ChevronLeft } from "lucide-react"; // Added X or ChevronLeft to close
import UserItem from "./UserItem";
import { User } from "../../types/chat";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";

interface SidebarProps {
  selectedUserId?: string;
  onSelectUser: (user: User) => void;
}

export default function Sidebar({ selectedUserId, onSelectUser }: SidebarProps) {
  const { users } = useSocket();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen) setSearchTerm(""); 
  };

  return (
    <aside className="w-80 h-full border-r border-app-border bg-app-bg flex flex-col overflow-hidden">
      
      {/* 1. Static Header: Always Visible */}
      <div className="p-4 pb-2 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-app-text">Messages</h1>
        <button 
          onClick={toggleSearch}
          disabled={isSearchOpen} // Disable when open
          className={`p-2 rounded-full transition-all duration-300 ${
            isSearchOpen 
            ? "text-app-accent/30 cursor-default" // "Disabled" style
            : "hover:bg-app-text/5 text-app-text/60 hover:text-app-accent"
          }`}
        >
          <Search size={20} />
        </button>
      </div>

      {/* 2. Search Bar: Flows underneath the header */}
      <div className={`px-4 overflow-hidden transition-all duration-300 ease-in-out ${
        isSearchOpen ? "max-h-16 opacity-100 mb-4" : "max-h-0 opacity-0 mb-0"
      }`}>
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Search size={18} className="text-app-accent" />
          </div>
          <input 
            autoFocus={isSearchOpen}
            type="text" 
            placeholder="Search conversations..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-app-text/5 border border-app-accent/30 rounded-xl py-2 pl-10 pr-10 text-sm focus:outline-none focus:bg-app-bg focus:border-app-accent transition-all"
          />
          <button 
            onClick={toggleSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-app-text/40 hover:text-app-text"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <hr className="border-app-border/50 mx-4" />

      {/* 3. User List Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar mt-2">
        {filteredUsers.length > 0 ? (
          <div className="flex flex-col">
            {filteredUsers.map((user) => (
              <UserItem 
                key={user._id}
                user={user}
                isActive={selectedUserId === user._id}
                onClick={() => onSelectUser(user)}
                currentUserId={currentUser?._id || ""} 
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center opacity-40">
             <Search size={32} className="mb-3" />
             <p className="text-xs uppercase tracking-widest font-semibold">
                {searchTerm ? "No Results Found" : "No Conversations"}
             </p>
          </div>
        )}
      </div>
    </aside>
  );
}