"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { MessageSquare, Users, Loader2, Search, X } from "lucide-react";
import UserItem from "./UserItem";
import { User } from "../../types/chat";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";

interface SidebarProps {
  selectedUserId?: string;
  onSelectUser: (user: User) => void;
}

type ViewMode = "recent" | "all";

export default function Sidebar({ selectedUserId, onSelectUser }: SidebarProps) {
  // Use searchUsers from your context
  const { 
    users, 
    loadMore, 
    hasMore, 
    fetchAllUsers, 
    fetchRecentChats, 
    searchUsers 
  } = useSocket();
  
  const { currentUser } = useAuth();
  
  const [view, setView] = useState<ViewMode>("recent");
  const [isFetching, setIsFetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const observer = useRef<IntersectionObserver | null>(null);

  // --- SEARCH & VIEW LOGIC ---
  useEffect(() => {
    // If there is no search query, just fetch the default list for the current view
    if (searchQuery.trim() === "") {
      if (view === "all") {
        fetchAllUsers();
      } else {
        fetchRecentChats();
      }
      return;
    }

    // If there IS a search query, use your dedicated searchUsers function
    const delayDebounceFn = setTimeout(() => {
      searchUsers(searchQuery);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, view, fetchAllUsers, fetchRecentChats, searchUsers]);

  const handleToggleView = () => {
    const nextView = view === "recent" ? "all" : "recent";
    setView(nextView);
    setSearchQuery(""); // Clear search when switching modes
  };

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
    <aside className="w-80 h-full border-r border-app-border bg-app-bg flex flex-col overflow-hidden">
      {/* HEADER SECTION */}
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-app-text">
            {view === "recent" ? "Messages" : "All Users"}
          </h1>
          
          <button 
            onClick={handleToggleView} 
            className="p-2 rounded-full bg-app-accent/10 text-app-accent hover:bg-app-accent/20 transition-colors"
          >
            {view === "recent" ? <Users size={20} /> : <MessageSquare size={20} />}
          </button>
        </div>

        {/* SEARCH INPUT */}
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

      {/* USER LIST */}
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