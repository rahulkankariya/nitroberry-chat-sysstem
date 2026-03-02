"use client";
import { memo, useEffect, useState } from "react";
import { Check, FileText, CheckCheck, Film } from "lucide-react";
import { MESSAGE_TYPES } from "../../constants/chat";

interface MessageItemProps {
  msg: any;
  isOwn: boolean;
  activeUserId: string;
}

const MessageItem = memo(({ msg, isOwn, activeUserId }: MessageItemProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // --- Theme Observer: Ensures UI updates when theme toggles ---
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
      console.log(
        `[Theme Check]: ${isDark ? "🌙 Dark Mode" : "☀️ Light Mode"}`,
      );
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // --- Message Status Logic ---
  const recipientStatus = msg.readStatus?.find(
    (status: any) => String(status.user) === String(activeUserId),
  );
  const isRead = msg.status === "seen" || !!recipientStatus?.readAt;
  const isDelivered =
    msg.status === "seen" ||
    msg.status === "delivered" ||
    !!recipientStatus?.deliveredAt;

  const formatTime = (dateString?: string) => {
    if (!dateString) return "--:--";
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // --- Content Renderer with Explicit Color Logic ---
  const renderContent = () => {
    // Shared text color logic to prevent "White on White" in Light Mode
    const contentTextColor = isDarkMode
      ? "text-white"
      : "text-slate-900 dark:text-slate-100";

    const mediaContainerClass = isDarkMode
      ? "bg-white/10 border-white/20"
      : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10";

    switch (msg.messageType) {
      case MESSAGE_TYPES.IMAGE:
        return (
          <div className="rounded-lg overflow-hidden mb-1 border border-black/5 shadow-sm">
            <img
              src={msg.content}
              alt="Shared"
              className="w-48 sm:w-64 h-32 sm:h-40 object-cover hover:opacity-95 transition-opacity cursor-pointer"
            />
          </div>
        );

      case MESSAGE_TYPES.AUDIO:
        return (
          <div
            className={`flex items-center gap-2 p-2 rounded-xl border ${mediaContainerClass}`}
          >
            <audio
              controls
              className={`h-8 w-48 sm:w-56 custom-audio-player ${isDarkMode ? "dark-audio" : ""}`}
            >
              <source src={msg.content} type="audio/mpeg" />
            </audio>
          </div>
        );

      case MESSAGE_TYPES.FILE:
        return (
          <div
            className={`flex items-center gap-3 p-2.5 rounded-xl border w-48 sm:w-56 ${mediaContainerClass}`}
          >
            <div className="p-2 bg-app-accent rounded-lg text-white shrink-0 shadow-sm">
              <FileText size={18} />
            </div>
            <div className="flex flex-col overflow-hidden leading-tight">
              <span
                className={`text-[12px] font-semibold truncate ${contentTextColor}`}
              >
                Document
              </span>
              <span
                className={`text-[10px] opacity-60 uppercase font-bold tracking-tighter ${contentTextColor}`}
              >
                {msg.content.split(".").pop() || "FILE"}
              </span>
            </div>
          </div>
        );
      case MESSAGE_TYPES.VIDEO:
        return (
          <div
            className={`relative group max-w-70 sm:max-w-xs rounded-2xl overflow-hidden border border-[rgb(var(--app-border))]/50 shadow-sm ${mediaContainerClass}`}
          >
            {/* 1. Video Player */}
            <video
              src={msg.content}
              className="w-full h-auto aspect-video object-cover"
              controls={false} // We keep controls off for the preview look
              playsInline
            />

            {/* 2. Professional Play Overlay */}
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-100 group-hover:bg-black/40 transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-xl transform transition-transform group-hover:scale-110">
                {/* Using a play icon style */}
                <div className="ml-1 w-0 h-0 border-t-8 border-t-transparent border-l-14 border-l-white border-b-8 border-b-transparent" />
              </div>
            </div>

            {/* 3. Bottom Video Info Bar (Optional) */}
            <div className="absolute bottom-0 inset-x-0 p-2 bg-linear-to-t from-black/60 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Film size={12} className="text-white/80" />
                <span className="text-[10px] text-white/90 font-bold uppercase tracking-widest">
                  {msg.content.split(".").pop() || "MP4"}
                </span>
              </div>
            </div>

            {/* 4. Click to View Fullscreen (Add logic to your parent component) */}
            <button
              onClick={() => window.open(msg.content, "_blank")}
              className="absolute inset-0 z-10"
              title="Play Video"
            />
          </div>
        );
      case MESSAGE_TYPES.TEXT:
      default:
        return (
          <p
            className={`whitespace-pre-wrap wrap-break-word text-[14.5px] leading-relaxed font-[450] lg:font-normal ${contentTextColor}`}
          >
            {msg.content}
          </p>
        );
    }
  };

  return (
    <div
      className={`flex w-full mb-2 ${isOwn ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-1 duration-300 px-4`}
    >
      <div
        className={`relative p-3 rounded-2xl max-w-[85%] lg:max-w-[70%] shadow-sm transition-all duration-300 ${
          isDarkMode
            ? "bg-app-accent text-b rounded-tr-none shadow-blue-500/20"
            : "bg-white dark:bg-[#1e1e1e] rounded-tl-none border border-slate-200 dark:border-white/5 shadow-sm shadow-slate-200/40"
        }`}
      >
        {/* Dynamic Content */}
        {renderContent()}

        {/* Footer: Time & Status */}
        <div
          className={`flex items-center justify-end gap-1 mt-1.5 select-none 
          ${isDarkMode ? "text-white/80" : "text-slate-500 dark:text-slate-400"}`}
        >
          <span className="text-[9px] font-bold uppercase tracking-tight">
            {formatTime(msg.createdAt)}
          </span>

          {isOwn && (
            <div className="flex items-center ml-1">
              {isRead ? (
                <CheckCheck
                  size={14}
                  strokeWidth={3}
                  className="text-blue-500"
                />
              ) : isDelivered ? (
                <CheckCheck size={14} strokeWidth={3} className="opacity-70" />
              ) : (
                <Check size={14} strokeWidth={3} className="opacity-40" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

MessageItem.displayName = "MessageItem";
export default MessageItem;
