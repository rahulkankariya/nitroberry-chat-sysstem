"use client";

import { useState, useEffect, useMemo } from "react";
import SidebarHeader from "./SidebarHeader";
import SearchBar from "./SearchBar";
import UserList from "./UserList";
import { User } from "@/app/types/chat";
import { useSocket } from "@/app/context/SocketContext";
import { useAuth } from "@/app/context/AuthContext";

type ViewMode = "recent" | "all";
type FilterMode = "all" | "unread";

interface SidebarProps {
  selectedUserId?: string;
  onSelectUser: (user: User) => void;
  view: ViewMode;
}

export default function Sidebar({
  selectedUserId,
  onSelectUser,
  view,
}: SidebarProps) {
  const {
    users,
    loadMore,
    hasMore,
    fetchAllUsers,
    fetchRecentChats,
    searchUsers,
  } = useSocket();
  const { currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");

  // Reset filter when switching between Recent and All Directory
  useEffect(() => {
    setSearchQuery("");
    setFilter("all");
  }, [view]);

  // Fetching Logic with Debounced Search
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

  // Filter Logic: Unread logic only applies to 'recent' view
  const displayedUsers = useMemo(() => {
    if (view === "recent" && filter === "unread") {
      return users.filter((u) => (u.unreadCount ?? 0) > 0);
    }
    return users;
  }, [users, filter, view]);

  const unreadChatsCount = useMemo(() => {
    return users.filter((u) => (u.unreadCount ?? 0) > 0).length;
  }, [users]);

  return (
    <aside className="w-80 h-full border-r border-[rgb(var(--app-border))] bg-[rgb(var(--app-bg))] flex flex-col overflow-hidden transition-colors duration-200">
      <div className="p-4 flex flex-col gap-3">
        <SidebarHeader view={view} />
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* --- SUB-TABS: Only shown in 'recent' view --- */}
      {view === "recent" && (
        <>
          <div className="flex items-center gap-2 px-4 mb-3">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                filter === "all"
                  ? "bg-[rgb(var(--app-accent))] text-white shadow-sm"
                  : "bg-[rgb(var(--app-border))] text-[rgb(var(--app-text-muted))] hover:opacity-80"
              }`}
            >
              All
            </button>

            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center gap-2 ${
                filter === "unread"
                  ? "bg-[rgb(var(--app-accent))] text-white shadow-sm"
                  : "bg-[rgb(var(--app-border))] text-[rgb(var(--app-text-muted))] hover:opacity-80"
              }`}
            >
              Unread
              {unreadChatsCount > 0 && (
                <span
                  className={`flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-full text-[10px] ${
                    filter === "unread"
                      ? "bg-white text-[rgb(var(--app-accent))]"
                      : "bg-[rgb(var(--app-accent))] text-white"
                  }`}
                >
                  {unreadChatsCount}
                </span>
              )}
            </button>
          </div>
          <hr className="border-[rgb(var(--app-border))] mx-4 opacity-50 mb-1" />
        </>
      )}

      {/* --- USER LIST AREA --- */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <UserList
          users={displayedUsers}
          hasMore={hasMore && filter === "all"}
          loadMore={loadMore}
          searchQuery={searchQuery}
          selectedUserId={selectedUserId}
          currentUserId={currentUser?._id || ""}
          onSelectUser={onSelectUser}
        />

        {/* Empty States */}
        {filter === "unread" && view === "recent" && displayedUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center p-10 text-center">
            <p className="text-sm text-[rgb(var(--app-text-muted))] opacity-60">
              No unread messages
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}