"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { MessageSquare, Users, Loader2, Search, X } from "lucide-react";
import UserItem from "./UserItem";
import { User } from "../../types/chat";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";

type ViewMode = "recent" | "all";

interface SidebarProps {
  selectedUserId?: string;
  onSelectUser: (user: User) => void;
  view: ViewMode; // Received from parent
}

export default function Sidebar({ selectedUserId, onSelectUser, view }: SidebarProps) {
  const { 
    users, 
    loadMore, 
    hasMore, 
    fetchAllUsers, 
    fetchRecentChats, 
    searchUsers 
  } = useSocket();
  
  const { currentUser } = useAuth();
  const [isFetching, setIsFetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const observer = useRef<IntersectionObserver | null>(null);

  // Clear search when the view mode changes via Navbar
  useEffect(() => {
    setSearchQuery("");
  }, [view]);

  // --- SEARCH & VIEW LOGIC ---
  useEffect(() => {
    if (searchQuery.trim() === "") {
      if (view === "all") {
        fetchAllUsers();
      } else {
        fetchRecentChats();
      }
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      searchUsers(searchQuery);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, view, fetchAllUsers, fetchRecentChats, searchUsers]);

  useEffect(() => {
    setIsFetching(false);
  }, [users]);

  // --- INFINITE SCROLL ---
  const lastUserElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetching) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            setIsFetching(true);
            loadMore(); 
          }
        },
        { threshold: 0.1 }
      );

      if (node) observer.current.observe(node);
    },
    [isFetching, hasMore, loadMore]
  );

  return (
    <aside className="w-80 h-full  border-app-border bg-app-bg flex flex-col overflow-hidden">
      <div className="p-4 flex flex-col gap-3">
        <h1 className="text-xl font-bold tracking-tight text-app-text">
          {view === "recent" ? "Messages" : "All Users"}
        </h1>

        <div className="relative group">
          <Search 
            size={16} 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-app-text/40 group-focus-within:text-app-accent" 
          />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-app-border/20 border border-transparent focus:border-app-accent/30 py-2 pl-10 pr-10 rounded-lg text-sm outline-none transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-app-text/40 hover:text-app-text"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <hr className="border-app-border/50 mx-4" />

      <div className="flex-1 overflow-y-auto custom-scrollbar mt-2 relative">
        {users.length > 0 ? (
          <div className="flex flex-col">
            {users.map((user) => (
              <UserItem 
                key={user._id}
                user={user}
                isActive={selectedUserId === user._id}
                onClick={() => onSelectUser(user)}
                currentUserId={currentUser?._id || ""} 
              />
            ))}
            
            {hasMore && (
              <div ref={lastUserElementRef} className="p-4 flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-app-accent opacity-50" />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 opacity-40 text-center">
             <Search size={32} />
             <p className="text-xs uppercase mt-2">
                {searchQuery ? `No results for "${searchQuery}"` : "No users found"}
             </p>
          </div>
        )}
      </div>
    </aside>
  );
}