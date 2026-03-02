"use client";

import { User } from "../../types/chat";
import { useSocket } from "../../context/SocketContext";
import { useMemo } from "react";
import { Phone, Video, MoreHorizontal } from "lucide-react";
import { notify } from "@/app/utils/toast";

export default function ChatHeader({ user: initialUser }: { user: User }) {
  const { users } = useSocket();

  const user = useMemo(() => {
    return users.find((u) => u._id === initialUser._id) || initialUser;
  }, [users, initialUser]);

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const formatLastSeen = (date: string | Date) => {
    const lastSeenDate = new Date(date);
    return lastSeenDate.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const handleFeatureComingSoon = () => {
    notify.error("This feature will be available in the future!");
  };

  return (
    /* Glassmorphism that adapts to Light/Dark via CSS Variables */
    <div className="h-20 px-8 border-b border-[rgb(var(--app-border))]/50 flex items-center justify-between bg-[rgb(var(--app-bg))]/80 backdrop-blur-md sticky top-0 z-30 transition-colors duration-200">
      
      <div className="flex items-center gap-4">
        {/* Avatar Section */}
        <div className="relative group shrink-0">
          <div className="w-12 h-12 rounded-full border border-[rgb(var(--app-border))] bg-[rgb(var(--app-accent))]/10 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-[rgb(var(--app-accent))]/40 shadow-sm">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.fullName} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <span className="text-[rgb(var(--app-accent))] font-bold text-sm">
                {getInitials(user.fullName)}
              </span>
            )}
          </div>

          {/* Status Dot with dynamic border color */}
          <div 
            className={`
              absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 
              rounded-full border-2 border-[rgb(var(--app-bg))] 
              transition-colors duration-500
              ${user.isOnline ? "bg-green-500" : "bg-zinc-500"}
            `} 
            title={user.isOnline ? "Active" : "Offline"}
          />
        </div>

        {/* User Info Section */}
        <div className="flex flex-col">
          <h2 className="text-sm font-bold text-[rgb(var(--app-text))] tracking-tight flex items-center gap-2">
            {user.fullName}
            {user.isOnline && (
              <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            )}
          </h2>
          
          <div className="flex items-center gap-2 h-4">
            {user.isOnline ? (
              <span className="text-[10px] text-green-500 uppercase tracking-widest font-bold">
                Online
              </span>
            ) : (
              <span className="text-[10px] text-[rgb(var(--app-text))]/50 uppercase tracking-widest font-medium">
                Last seen: <span className="font-mono">{user.lastSeen ? formatLastSeen(user.lastSeen) : "Recently"}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex items-center gap-1">
        <button 
          onClick={handleFeatureComingSoon}
          className="p-2.5 rounded-full hover:bg-[rgb(var(--app-text))]/5 text-[rgb(var(--app-text))]/40 hover:text-[rgb(var(--app-accent))] transition-all"
        >
          <Phone size={18} />
        </button>

        <button 
          onClick={handleFeatureComingSoon}
          className="p-2.5 rounded-full hover:bg-[rgb(var(--app-text))]/5 text-[rgb(var(--app-text))]/40 hover:text-[rgb(var(--app-accent))] transition-all"
        >
          <Video size={18} />
        </button>
      </div>
    </div>
  );
}