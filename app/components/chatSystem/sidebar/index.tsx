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

  // 1. Reset states when switching between "Recent" and "Directory"
  useEffect(() => {
    setSearchQuery("");
    setFilter("all");
  }, [view]);

  // 2. API/Socket Fetching Logic: Triggered by Search, View, OR Filter change
  useEffect(() => {
    // If searching, ignore the tabs and fetch search results
    if (searchQuery.trim() !== "") {
      const delayDebounceFn = setTimeout(() => {
        searchUsers(searchQuery);
      }, 400);
      return () => clearTimeout(delayDebounceFn);
    }

    // If not searching, fetch based on the active tab/filter
    if (view === "all") {
      fetchAllUsers();
    } else {
      // Pass the 'filter' parameter (all | unread) to your socket function
      fetchRecentChats(filter);
    }
  }, [searchQuery, view, filter, fetchAllUsers, fetchRecentChats, searchUsers]);

  // 3. UI logic for the unread badge (calculated from the current list)
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
          users={users} // Display whatever the API returned
          hasMore={hasMore}
          loadMore={() => loadMore(filter)} // Pass current filter to pagination logic
          searchQuery={searchQuery}
          selectedUserId={selectedUserId}
          currentUserId={currentUser?._id || ""}
          onSelectUser={onSelectUser}
        />

        {/* Empty State for Unread Filter */}
        {filter === "unread" && view === "recent" && users.length === 0 && (
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