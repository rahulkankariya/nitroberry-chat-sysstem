"use client";

import { User } from "../../types/chat";
import { useSocket } from "../../context/SocketContext"; // Import your hook
import { useMemo } from "react";

export default function ChatHeader({ user: initialUser }: { user: User }) {
  const { users } = useSocket();

  // Find the "Live" version of this user from the context
  const user = useMemo(() => {
    return users.find((u) => u._id === initialUser._id) || initialUser;
  }, [users, initialUser]);

  const formatLastSeen = (date: string | Date) => {
    const lastSeenDate = new Date(date);
    // Use 'intl' for better formatting or just keep your logic
    return lastSeenDate.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="p-4 border-b border-app-border flex items-center justify-between bg-app-bg/80 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center gap-4">
        {/* Status Indicator Avatar */}
        <div className="relative">
          <div className="w-10 h-10 rounded bg-app-accent/10 border border-app-accent/20 flex items-center justify-center text-app-accent font-bold">
            {user.fullName.charAt(0)}
          </div>
          {/* This dot will now toggle colors in real-time */}
          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-app-bg transition-colors duration-500 ${
            user.isOnline ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-zinc-600"
          }`} />
        </div>

        <div>
          <h2 className="text-sm font-bold text-app-accent uppercase tracking-widest">
            {user.fullName}
          </h2>
          <div className="flex items-center gap-2 mt-0.5 h-4"> {/* Fixed height prevents jitter */}
            {user.isOnline ? (
              <span className="text-[10px] text-green-500 uppercase tracking-tighter font-medium animate-pulse">
                Live Connection
              </span>
            ) : (
              <span className="text-[10px] text-app-text/40 uppercase tracking-tighter">
                Last Sync: {user.lastSeen ? formatLastSeen(user.lastSeen) : "Offline"}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-4 text-app-text/20">
        <div className="h-1 w-8 bg-app-accent/10 rounded-full" />
      </div>
    </div>
  );
}