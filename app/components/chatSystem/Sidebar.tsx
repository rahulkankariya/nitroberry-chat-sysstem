"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import UserItem from "./UserItem";
import { User } from "../../types/chat";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";

interface SidebarProps {
  selectedUserId?: string;
  onSelectUser: (user: User) => void;
}

export default function Sidebar({ selectedUserId, onSelectUser }: SidebarProps) {
  const { users, loadMore, hasMore } = useSocket();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // --- LOCAL GUARD STATE ---
  const [isFetching, setIsFetching] = useState(false);

  // Reset fetching state whenever the 'users' list updates
  useEffect(() => {
    setIsFetching(false);
  }, [users]);

  const observer = useRef<IntersectionObserver | null>(null);

  const lastUserElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      // If we are already fetching, don't re-attach or trigger
      if (isFetching) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && searchTerm === "") {
            console.log("DEBUG: Sentinel visible. Fetching next page...");
            setIsFetching(true); // Lock the calls
            loadMore();
          }
        },
        { threshold: 0.1 } // Trigger as soon as 10% of the loader is visible
      );

      if (node) observer.current.observe(node);
    },
    [isFetching, hasMore, searchTerm, loadMore]
  );

  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const toggleSearch = () => {
    setIsSearchOpen((prev) => !prev);
    if (isSearchOpen) setSearchTerm("");
  };

  return (
    <aside className="w-80 h-full border-r border-app-border bg-app-bg flex flex-col overflow-hidden">
      <div className="p-4 pb-2 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-app-text">Messages</h1>
        <button onClick={toggleSearch} className="p-2 rounded-full hover:bg-app-text/5">
          {isSearchOpen ? <X size={20} /> : <Search size={20} />}
        </button>
      </div>

      <div className={`px-4 overflow-hidden transition-all duration-300 ${isSearchOpen ? "max-h-16 mb-4" : "max-h-0"}`}>
        <input 
          autoFocus={isSearchOpen}
          type="text" 
          placeholder="Search..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-app-text/5 border border-app-accent/30 rounded-xl py-2 px-4 text-sm focus:outline-none"
        />
      </div>

      <hr className="border-app-border/50 mx-4" />

      <div className="flex-1 overflow-y-auto custom-scrollbar mt-2 relative">
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
            
            {/* The sentinel div */}
            {hasMore && searchTerm === "" && (
              <div ref={lastUserElementRef} className="p-6 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-app-accent opacity-50" />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 opacity-40">
             <Search size={32} />
             <p className="text-xs uppercase mt-2">No Results</p>
          </div>
        )}
      </div>
    </aside>
  );
}