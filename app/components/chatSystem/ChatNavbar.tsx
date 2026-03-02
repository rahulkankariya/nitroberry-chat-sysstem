"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, LogOut, MessageSquare, Users } from "lucide-react";
import { useTheme } from "next-themes";
import { useSocket } from "../../context/SocketContext";
import { authService } from "@/app/api/auth-service";
import { Logo } from "../common/logo";

type ViewMode = "recent" | "all";

interface ChatHeaderProps {
  isConnected: boolean;
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export default function ChatNavbar({ isConnected, view, onViewChange }: ChatHeaderProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { socket } = useSocket();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleLogout = async () => {
    if (socket) socket.disconnect();
    authService.logout();
    window.location.href = "/login";
  };

  const currentTheme = theme === "system" ? resolvedTheme : theme;

  return (
    <div className="flex flex-col h-full w-full items-center py-6 justify-between shrink-0 backdrop-blur-md transition-colors duration-500 bg-[rgba(var(--nav-bg))]  border-[rgba(var(--app-border),0.3)]">
      
      {/* 1. TOP SECTION */}
      <div className="flex flex-col items-center w-full">
        <div className="hidden md:flex h-16 items-center justify-center mb-8 transition-transform hover:rotate-6 duration-300">
          <Logo variant="header" />
        </div>

        <nav className="flex flex-col gap-4 w-full px-3 mt-16 md:mt-0">
          <NavIcon 
            icon={<MessageSquare size={22} />} 
            active={view === "recent"} 
            title="Messages" 
            onClick={() => onViewChange("recent")}
          />
          <NavIcon 
            icon={<Users size={22} />} 
            active={view === "all"} 
            title="Contacts" 
            onClick={() => onViewChange("all")}
          />
        </nav>
      </div>

      {/* 2. BOTTOM SECTION */}
      <div className="flex flex-col items-center gap-6 w-full px-3">
        <div className="relative group">
          <div
            className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
              isConnected 
                ? "bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.4)] animate-pulse" 
                : "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]"
            }`}
          />
        </div>

        <div className="flex flex-col items-center gap-2 w-full">
          <button
            onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
            className="group w-12 h-12 flex items-center justify-center rounded-2xl transition-all active:scale-90 hover:bg-[rgb(var(--app-accent))]/10"
          >
            {!mounted ? (
              <div className="w-5 h-5" />
            ) : currentTheme === "dark" ? (
              <Sun size={20} className="text-amber-400 group-hover:rotate-45 transition-transform" />
            ) : (
              <Moon size={20} className="text-indigo-600 group-hover:-rotate-12 transition-transform" />
            )}
          </button>

          <button
            onClick={handleLogout}
            className="w-12 h-12 flex items-center justify-center rounded-2xl transition-all active:scale-90 hover:bg-red-500/10"
            title="Terminate Session"
          >
            <LogOut size={20} className="text-red-500/60" />
          </button>
        </div>
      </div>
    </div>
  );
}

function NavIcon({
  icon,
  active = false,
  title,
  onClick
}: {
  icon: React.ReactNode;
  active?: boolean;
  title: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`
      relative group w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300
      ${active
          ? "bg-[rgb(var(--app-accent))] text-white shadow-xl shadow-indigo-500/20 scale-105"
          : "hover:bg-[rgba(var(--app-accent),0.1)] text-app-text/50"
      }
    `}
    >
      {icon}
      <span 
        className="absolute left-16 scale-0 group-hover:scale-100 transition-all origin-left text-[11px] px-3 py-1.5 rounded-lg font-medium shadow-2xl pointer-events-none z-50 bg-app-text text-app-bg"
      >
        {title}
      </span>
    </button>
  );
}