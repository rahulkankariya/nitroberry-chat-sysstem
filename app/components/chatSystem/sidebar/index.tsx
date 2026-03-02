"use client";

import { useState, useEffect } from "react";

import SidebarHeader from "./SidebarHeader";
import SearchBar from "./SearchBar";
import UserList from "./UserList";
import { User } from "@/app/types/chat";
import { useSocket } from "@/app/context/SocketContext";
import { useAuth } from "@/app/context/AuthContext";

type ViewMode = "recent" | "all";

interface SidebarProps {
  selectedUserId?: string;
  onSelectUser: (user: User) => void;
  view: ViewMode;
}

export default function Sidebar({ selectedUserId, onSelectUser, view }: SidebarProps) {
  const { users, loadMore, hasMore, fetchAllUsers, fetchRecentChats, searchUsers } = useSocket();
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Reset search when switching tabs
  useEffect(() => {
    setSearchQuery("");
  }, [view]);

  // Handle Search & View Logic
  useEffect(() => {
    if (searchQuery.trim() === "") {
      view === "all" ? fetchAllUsers() : fetchRecentChats();
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      searchUsers(searchQuery);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, view, fetchAllUsers, fetchRecentChats, searchUsers]);

  return (
    <aside className="w-80 h-full border-r border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg))] flex flex-col overflow-hidden transition-colors duration-200">
      <div className="p-4 flex flex-col gap-3">
        <SidebarHeader view={view} />
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      <hr className="border-[rgb(var(--app-border))] mx-4 opacity-50" />

      <UserList 
        users={users}
        hasMore={hasMore}
        loadMore={loadMore}
        searchQuery={searchQuery}
        selectedUserId={selectedUserId}
        currentUserId={currentUser?._id || ""}
        onSelectUser={onSelectUser}
      />
    </aside>
  );
}