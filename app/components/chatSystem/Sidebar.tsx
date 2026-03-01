"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { MessageSquare, Users, Loader2, Search } from "lucide-react"; // Changed icons
import UserItem from "./UserItem";
import { User } from "../../types/chat";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";

interface SidebarProps {
  selectedUserId?: string;
  onSelectUser: (user: User) => void;
}

// Define the two possible views
type ViewMode = "recent" | "all";

export default function Sidebar({ selectedUserId, onSelectUser }: SidebarProps) {
  // Assuming your context provides a way to fetch all users vs recent chats
  const { users, loadMore, hasMore, fetchAllUsers, fetchRecentChats } = useSocket();
  const { currentUser } = useAuth();
  
  const [view, setView] = useState<ViewMode>("recent");
  const [isFetching, setIsFetching] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  // --- VIEW TOGGLE LOGIC ---
  const handleToggleView = () => {
    const nextView = view === "recent" ? "all" : "recent";
    setView(nextView);
    
    // Call specific socket events based on the view
    if (nextView === "all") {
      fetchAllUsers(); // Your new socket event for all system users
    } else {
      fetchRecentChats(); // Return to the list of active conversations
    }
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
            loadMore(); // This should be pagination-aware based on the current view in the backend
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
      <div className="p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-app-text">
          {view === "recent" ? "Messages" : "All Users"}
        </h1>
        
        {/* ACTION BUTTON: Toggle between Recent Chats and All Users */}
        <button 
          onClick={handleToggleView} 
          className="p-2 rounded-full bg-app-accent/10 text-app-accent hover:bg-app-accent/20 transition-colors"
          title={view === "recent" ? "Show All Users" : "Back to Messages"}
        >
          {view === "recent" ? <Users size={20} /> : <MessageSquare size={20} />}
        </button>
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
                onClick={() => {
                   onSelectUser(user);
                   // Optional: Switch back to recent view when a user is selected
                   // setView("recent"); 
                }}
                currentUserId={currentUser?._id || ""} 
              />
            ))}
            
            {hasMore && (
              <div ref={lastUserElementRef} className="p-6 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-app-accent opacity-50" />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 opacity-40">
             <Search size={32} />
             <p className="text-xs uppercase mt-2">
                {view === "recent" ? "No conversations yet" : "No users found"}
             </p>
          </div>
        )}
      </div>
    </aside>
  );
}