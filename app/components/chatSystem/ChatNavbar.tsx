"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useSocket } from "../../context/SocketContext";
import { authService } from "@/app/api/auth-service";
import { Logo } from "../common/logo";

interface ChatHeaderProps {
  isConnected: boolean;
}

export default function ChatNavbar({ isConnected }: ChatHeaderProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { socket } = useSocket();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    if (socket) socket.disconnect();
    authService.logout();
    window.location.href = "/login";
  };

  // Use resolvedTheme to handle "system" setting correctly
  const currentTheme = theme === 'system' ? resolvedTheme : theme;

  return (
    <div className="h-16 border-b border-app-border flex items-center justify-between px-8 bg-app-text/5 shrink-0">
      <Logo variant="header" />

      <div className="flex items-center gap-6">
        {/* Connection Status */}
        <div className="hidden xs:flex items-center gap-2 px-3 py-1 rounded-full bg-app-text/5 border border-app-border/50">
          <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-[9px] uppercase tracking-tighter opacity-60 font-bold">
            {isConnected ? 'Link Active' : 'Link Lost'}
          </span>
        </div>

        <div className="h-4 w-px bg-app-border hidden sm:block" />

        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button 
            onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")} 
            className="text-app-text/60 hover:text-app-accent p-2 transition-transform active:scale-95"
            aria-label="Toggle Theme"
          >
            {!mounted ? (
              <div className="w-4.5 h-4.5" /> // Spacer
            ) : currentTheme === "dark" ? (
              <Sun size={18} />
            ) : (
              <Moon size={18} />
            )}
          </button>

          {/* Logout Button */}
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 text-red-500/70 hover:text-red-500 p-2 transition-colors"
            title="Terminate Session"
          >
            <LogOut size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}