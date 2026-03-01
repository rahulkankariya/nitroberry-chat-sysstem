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

  // Helper to get initials: "Rahul Kanarkuya" -> "RK"
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
  // Assuming 'notify' is your notification object/function
  notify.error("This feature will be available in the future!");
};
  return (
    <div className="h-20 px-8 border-b border-app-border/50 flex items-center justify-between bg-app-bg/40 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-4">
        
        {/* Avatar Section */}
        <div className="relative group shrink-0">
          <div className="w-12 h-12 rounded-full border border-app-border bg-app-accent/10 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-app-accent/40 shadow-inner">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.fullName} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <span className="text-app-accent font-black text-sm tracking-tighter">
                {getInitials(user.fullName)}
              </span>
            )}
          </div>

          {/* Status Dot with Professional "Knockout" Border */}
         <div 
  className={`
    absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 
    rounded-full  border-app-bg 
    transition-colors duration-500
    ${user.isOnline ? "bg-green-500" : "bg-red-900"}
  `} 
  title={user.isOnline ? "Active" : "Offline"}
/>
        </div>

        {/* User Info Section */}
        <div>
          <h2 className="text-[14px] font-bold text-app-text tracking-tight flex items-center gap-2">
            {user.fullName}
            {user.isOnline && (
              <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            )}
          </h2>
          
          <div className="flex items-center gap-2 h-4">
            {user.isOnline ? (
              <span className="text-[10px] text-green-500 uppercase tracking-widest font-bold">
                Connection Live
              </span>
            ) : (
              <span className="text-[10px] text-app-text/40 uppercase tracking-widest font-medium">
                Offline • <span className="font-mono">{user.lastSeen ? formatLastSeen(user.lastSeen) : "00:00"}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex items-center gap-1">
        <button 
  onClick={handleFeatureComingSoon}
  className="p-2.5 rounded-full hover:bg-app-text/5 text-app-text/40 hover:text-app-accent transition-all"
>
  <Phone size={18} />
</button>

<button 
  onClick={handleFeatureComingSoon}
  className="p-2.5 rounded-full hover:bg-app-text/5 text-app-text/40 hover:text-app-accent transition-all"
>
  <Video size={18} />
</button>
        
      </div>
    </div>
  );
}