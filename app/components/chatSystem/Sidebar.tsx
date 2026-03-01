"use client";

import { useState, useMemo } from "react";
import { Search, UserPlus } from "lucide-react";
import UserItem from "./UserItem";
import { User } from "../../types/chat";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext"; // Assuming you have an AuthContext

interface SidebarProps {
  selectedUserId?: string;
  onSelectUser: (user: User) => void;
}

export default function Sidebar({ selectedUserId, onSelectUser }: SidebarProps) {
  const { users } = useSocket();
  const { currentUser } = useAuth(); // Crucial for "isMe" logic
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  return (
    <aside className="w-80 h-full border-r border-app-border bg-app-bg flex flex-col overflow-hidden">
      {/* Sidebar Header */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">Messages</h1>
          <button className="p-2 hover:bg-app-accent/10 rounded-full transition-colors">
            <UserPlus size={20} className="text-app-accent" />
          </button>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-app-text/30 group-focus-within:text-app-accent transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search conversations..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-app-text/5 border border-transparent rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:bg-app-bg focus:border-app-accent/50 transition-all"
          />
        </div>
      </div>

      {/* User List Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredUsers.length > 0 ? (
          <div className="flex flex-col">
            {filteredUsers.map((user) => (
              <UserItem 
                key={user._id}
                user={user}
                isActive={selectedUserId === user._id}
                onClick={() => onSelectUser(user)}
                currentUserId={currentUser?._id || ""} 
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center opacity-40">
            <div className="bg-app-text/5 p-4 rounded-full mb-3">
               <Search size={32} />
            </div>
            <p className="text-xs uppercase tracking-widest font-semibold">No Results</p>
          </div>
        )}
      </div>
    </aside>
  );
}