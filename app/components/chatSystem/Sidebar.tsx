"use client";

import { useState, useMemo } from "react";
import { Search, ListFilter } from "lucide-react";
import UserItem from "./UserItem";
import { User } from "../../types/chat";
import { useSocket } from "../../context/SocketContext"; // Import the hook

interface SidebarProps {
  selectedUserId?: string;
  onSelectUser: (user: User) => void;
}

export default function Sidebar({ selectedUserId, onSelectUser }: SidebarProps) {
  // 1. Pull the live, synced users array from Context
  const { users } = useSocket();
  const [searchTerm, setSearchTerm] = useState("");

  // 2. Filter users based on search input while keeping them sorted (sorting is handled in Context)
  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  return (
    <div className="w-80 h-full border-r border-app-border bg-app-bg flex flex-col">
      {/* Sidebar Top Bar */}
      <div className="p-4 border-b border-app-border bg-app-text/5">
      
        
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-app-text/30" size={14} />
          <input 
            type="text" 
            placeholder="Search Name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-app-bg border border-app-border rounded-md py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-app-accent/50 transition-all text-app-text"
          />
        </div>
      </div>

      {/* User List Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <UserItem 
              key={user._id}
              user={user}
              isActive={selectedUserId === user._id}
              onClick={() => onSelectUser(user)}
               currentUserId={""}            />
          ))
        ) : (
          <div className="p-8 text-center">
            <p className="text-[10px] uppercase tracking-widest text-app-text/30">No Data Found</p>
          </div>
        )}
      </div>
    </div>
  );
}