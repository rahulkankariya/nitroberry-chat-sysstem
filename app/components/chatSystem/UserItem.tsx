"use client";
import { User } from "../../types/chat";
import { MESSAGE_TYPES } from "../../constants/chat";
import { CheckCheck, Check } from "lucide-react";

interface UserItemProps {
  user: User;
  isActive: boolean;
  onClick: () => void;
  currentUserId: string;
}

export default function UserItem({
  user,
  isActive,
  onClick,
  currentUserId,
}: UserItemProps) {
  const lastMessage = user.lastMessage;
  const unreadCount = user.unreadCount ?? 0;

  // Logic: Only show ticks if the last message was sent by the current user
  const isSentByMe = lastMessage?.sender === currentUserId;
  const isSeen = lastMessage?.status === "seen";

  const getDisplayContent = () => {
    if (!lastMessage) return "No messages yet";
    switch (lastMessage.messageType) {
      case MESSAGE_TYPES.IMAGE: return "📷 Photo";
      case MESSAGE_TYPES.VIDEO: return "🎥 Video";
      case MESSAGE_TYPES.AUDIO: return "🎙️ Voice message";
      case MESSAGE_TYPES.FILE: return "📄 Document";
      default: return lastMessage.content || "";
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const time = lastMessage?.createdAt
    ? new Date(lastMessage.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : null;

  return (
    <div
      onClick={onClick}
      className={`group flex items-center p-3.5 mx-2 my-1 rounded-xl cursor-pointer transition-all duration-200 
    ${isActive ? "bg-slate-100 dark:bg-white/5" : "hover:bg-slate-100 dark:hover:bg-white/5"}`}
    >
      {/* --- AVATAR SECTION --- */}
      <div className="relative shrink-0">
        <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm overflow-hidden border-2 relative 
            ${isActive ? "border-app-accent scale-105" : "bg-slate-100 dark:bg-zinc-900 border-slate-200 dark:border-white/10 group-hover:border-app-accent/40"}`}>
          {user.avatar ? (
            <img src={user.avatar} alt={user.fullName} className="h-full w-full object-cover" />
          ) : (
            <span className={`text-sm font-bold ${isActive ? "text-app-accent" : "text-slate-500 dark:text-zinc-400"}`}>
              {getInitials(user.fullName)}
            </span>
          )}
        </div>
        <div className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 transition-all duration-300 
          ${isActive ? "border-slate-100 dark:border-zinc-800" : "border-white dark:border-zinc-950"} 
          ${user.isOnline ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-400 dark:bg-zinc-600"}`} 
        />
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="ml-4 flex-1 min-w-0 flex justify-between items-center">
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm truncate ${isActive ? "text-slate-900 dark:text-slate-100 font-semibold" : "text-slate-700 dark:text-zinc-300"}`}>
            {user.fullName}
          </h3>
          <p className={`text-xs truncate mt-0.5 ${unreadCount > 0 && !isActive ? "text-slate-900 dark:text-slate-200 font-bold" : "text-slate-500 dark:text-zinc-500"}`}>
            {getDisplayContent()}
          </p>
        </div>

        <div className="flex flex-col items-end shrink-0 ml-3 gap-1.5">
          {time && (
            <span className={`text-[10px] font-medium transition-colors ${unreadCount > 0 && !isActive ? "text-emerald-500 dark:text-emerald-400" : "text-slate-400 dark:text-zinc-500"}`}>
              {time}
            </span>
          )}

          <div className="flex items-center justify-end h-5 min-w-5">
            {/* Show Unread Count if exists, OTHERWISE show status ticks if I sent the message */}
            {unreadCount > 0 && !isActive ? (
              <div className="flex items-center justify-center bg-emerald-500 min-w-4.5 h-4.5 rounded-full shadow-sm">
                <span className="text-[10px] font-bold text-white leading-none px-1">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              </div>
            ) : isSentByMe ? (
              <span className="shrink-0">
                {isSeen ? (
                  <CheckCheck size={16} className="text-sky-500" />
                ) : (
                  <CheckCheck size={16} className="text-slate-400 dark:text-zinc-500" />
                )}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}