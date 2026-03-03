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
    <div className="flex flex-row md:flex-col h-full w-full items-center justify-between px-6 md:px-0 md:py-6 transition-colors duration-500 bg-[rgba(var(--nav-bg))] border-[rgba(var(--app-border),0.3)]">
      
      {/* LOGO - Hidden on mobile bottom bar to save space */}
      <div className="hidden md:flex h-16 items-center justify-center mb-8 transition-transform hover:rotate-6 duration-300">
        <Logo variant="header" />
      </div>

      {/* NAVIGATION ICONS */}
      <nav className="flex flex-row md:flex-col gap-8 md:gap-4 items-center">
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

      {/* THEME & LOGOUT */}
      <div className="flex flex-row md:flex-col items-center gap-4 md:gap-6">
        <button
          onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
          className="group w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-2xl transition-all active:scale-90 hover:bg-[rgb(var(--app-accent))]/10"
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
          className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-2xl transition-all active:scale-90 hover:bg-red-500/10"
          title="Terminate Session"
        >
          <LogOut size={20} className="text-red-500/60" />
        </button>
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
      className={`
      relative group w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300
      ${active
          ? "bg-[rgb(var(--app-accent))] text-white shadow-xl shadow-indigo-500/20 scale-105"
          : "hover:bg-[rgba(var(--app-accent),0.1)] text-slate-500 dark:text-app-text/50"
      }
    `}
    >
      {icon}
      {/* Tooltip - Only visible on desktop hover */}
      <span className="hidden md:block absolute left-16 scale-0 group-hover:scale-100 transition-all origin-left text-[11px] px-3 py-1.5 rounded-lg font-medium shadow-2xl pointer-events-none z-50 bg-app-text text-app-bg">
        {title}
      </span>
    </button>
  );
}