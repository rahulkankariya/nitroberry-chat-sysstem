"use client";
import { User } from "../../types/chat";
import { MESSAGE_TYPES } from "../../constants/chat";
import { Check } from "lucide-react"; // Import Check icon

interface UserItemProps {
  user: User;
  isActive: boolean;
  onClick: () => void;
  currentUserId: string;
}

export default function UserItem({ user, isActive, onClick }: UserItemProps) {
  // console.log("Rendering UserItem for:", user); // Debug log to track rendering
  const lastMessage = user.lastMessage;

  const senderId = typeof lastMessage?.sender === 'object' 
    ? lastMessage?.sender?._id 
    : lastMessage?.sender;

  const sidebarUserId = String(user._id);

  // Logic: If the sender ID of the last message is NOT the person in the sidebar, 
  // then YOU must be the sender.
  const isMe = lastMessage && senderId && String(senderId) !== sidebarUserId;
  // console.log("ISME",isMe)
  const unreadCount = user.unreadCount ?? 0;

  // --- Read Status Logic for Sidebar ---
  const isSeen = lastMessage?.status === "seen" || (lastMessage?.readStatus?.some((s: any) => s.readAt));

  // --- Managed Message Type Logic ---
  const getDisplayContent = () => {
    if (!lastMessage) return "No messages";

    let content = "";
    switch (lastMessage.messageType) {
      case MESSAGE_TYPES.IMAGE: content = "📷 Photo"; break;
      case MESSAGE_TYPES.VIDEO: content = "🎥 Video"; break;
      case MESSAGE_TYPES.AUDIO: content = "🎙️ Audio"; break;
      case MESSAGE_TYPES.FILE: content = "📄 Document"; break;
      default: content = lastMessage.content || ""; break;
    }
    return content;
  };

  const displayMsg = getDisplayContent();

  const time = lastMessage?.createdAt 
    ? new Date(lastMessage.createdAt).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }) 
    : null;

  return (
    <div 
      onClick={onClick} 
      className={`flex items-center p-4 cursor-pointer border-l-2 transition-all ${
        isActive ? 'bg-app-accent/10 border-app-accent' : 'border-transparent hover:bg-app-text/5'
      }`}
    >
      {/* Avatar Section */}
      <div className="relative shrink-0">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs border ${
          isActive ? "bg-app-accent text-white" : "bg-app-accent/10 text-app-accent"
        }`}>
          {user.fullName.substring(0, 2).toUpperCase()}
        </div>
        <div className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-app-bg ${
          user.isOnline ? "bg-emerald-500" : "bg-rose-500"
        }`} />
      </div>

      {/* Content Section */}
      <div className="ml-3 flex-1 overflow-hidden">
        <div className="flex justify-between items-baseline">
          <p className="text-sm font-medium truncate">{user.fullName}</p>
          {time && (
            <span className={`text-[10px] font-mono shrink-0 ml-2 ${unreadCount > 0 ? 'text-app-accent font-bold' : 'opacity-40'}`}>
              {time}
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-0.5">
          <div className="flex items-center gap-1 flex-1 min-w-0">
            {/* Show Checkmarks only if I am the sender */}
            {isMe && lastMessage && (
              <div className="flex items-center shrink-0">
                <div className="flex -space-x-2">
                  <Check size={14} className={isSeen ? "text-blue-500" : "text-app-text/30"} strokeWidth={3} />
                  <Check size={14} className={isSeen ? "text-blue-500" : "text-app-text/30"} strokeWidth={3} />
                </div>
              </div>
            )}

            <p className={`text-[11px] truncate ${
              unreadCount > 0 && !isActive ? "text-app-text font-semibold opacity-100" : "opacity-50"
            }`}>
              {/* If not me, show message directly. If me, show checks + message */}
              {!isMe && unreadCount > 0 ? <span className="text-app-accent font-bold mr-1">•</span> : null}
              {displayMsg}
            </p>
          </div>
          
          {unreadCount > 0 && (
            <span className="ml-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-app-accent px-1 text-[9px] font-bold text-white shadow-sm">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}