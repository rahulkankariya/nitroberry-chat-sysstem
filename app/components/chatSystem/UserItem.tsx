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

  const senderId =
    typeof lastMessage?.sender === "object"
      ? lastMessage?.sender?._id
      : lastMessage?.sender;

  const isMe = lastMessage && String(senderId) === String(currentUserId);
  const isSeen =
    lastMessage?.status === "seen" ||
    lastMessage?.readStatus?.some((s: any) => s.readAt);

  const getDisplayContent = () => {
    if (!lastMessage) return "No messages yet";
    switch (lastMessage.messageType) {
      case MESSAGE_TYPES.IMAGE:
        return "📷 Photo";
      case MESSAGE_TYPES.VIDEO:
        return "🎥 Video";
      case MESSAGE_TYPES.AUDIO:
        return "🎙️ Voice message";
      case MESSAGE_TYPES.FILE:
        return "📄 Document";
      default:
        return lastMessage.content || "";
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2)
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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
      className={`group flex items-center p-3.5 mx-2 my-1 rounded-xl cursor-pointer transition-all duration-200 ${
        isActive
          ? "bg-app-accent/15 ring-1 ring-app-accent/20"
          : "hover:bg-app-text/5"
      }`}
    >
      {/* --- PROFESSIONAL AVATAR SECTION --- */}
      <div className="relative shrink-0 group">
        {/* The Avatar Container (Perfect Circle) */}
        <div
          className={`h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm overflow-hidden border-2 relative 
    ${
      isActive
        ? "bg-linear-to-br from-app-accent to-app-accent/80 border-app-accent/30 shadow-lg shadow-app-accent/20 scale-105"
        : "bg-white dark:bg-[#18181b] border-slate-100 dark:border-white/5 hover:border-app-accent/40"
    } ${!user.isOnline && !isActive ? "grayscale-[0.5] opacity-80" : ""}`}
        >
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.fullName}
              className="h-full w-full object-cover"
            />
          ) : (
            /* Clean Initials */
            <span
              className={`text-[14px] font-bold tracking-tight select-none transition-colors duration-300 ${
                isActive
                  ? "dark:text-slate-400"
                  : "text-slate-500 dark:text-slate-400 group-hover:text-app-accent"
              }`}
            >
              {getInitials(user.fullName)}
            </span>
          )}

          {/* Professional Light/Dark Overlays */}
          <div className="absolute inset-0 bg-linear-to-tr from-black/5 via-transparent to-white/10 pointer-events-none" />
        </div>

        {/* Status Indicator (Curved to the Circle) */}
        <div
          className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-[2.5px] transition-all duration-300 group-hover:scale-110 
    ${
      isActive
        ? "border-white dark:border-[#1a1a1a]"
        : "border-white dark:border-[#0c0a09]"
    } ${
      user.isOnline
        ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
        : "bg-red-900 shadow-[0_0_8px_rgba(127,29,29,0.3)]"
    }`}
        />
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="ml-4 flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-0.5">
          <h3
            className={`text-[14px] truncate transition-colors ${
              isActive
                ? "text-app-text font-bold"
                : "text-app-text/90 font-semibold"
            }`}
          >
            {user.fullName}
          </h3>
          {time && (
            <span
              className={`text-[10px] font-medium uppercase tracking-tighter ml-2 ${
                unreadCount > 0 ? "text-app-accent" : "opacity-40"
              }`}
            >
              {time}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {isMe && lastMessage && (
              <span className="shrink-0">
                {isSeen ? (
                  <CheckCheck
                    size={14}
                    className="text-blue-500"
                    strokeWidth={2.5}
                  />
                ) : (
                  <Check
                    size={14}
                    className="text-app-text/30"
                    strokeWidth={2.5}
                  />
                )}
              </span>
            )}

            <p
              className={`text-[13px] truncate ${
                unreadCount > 0 && !isActive
                  ? "text-app-text font-medium"
                  : "text-app-text/50"
              }`}
            >
              {getDisplayContent()}
            </p>
          </div>

          {unreadCount > 0 && (
            <div className="ml-2 bg-app-accent px-1.5 py-0.5 rounded-lg shadow-lg shadow-app-accent/20 animate-pulse">
              <span className="text-[10px] font-black text-white italic">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
