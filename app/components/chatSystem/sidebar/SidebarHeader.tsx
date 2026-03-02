import React from "react";

interface SidebarHeaderProps {
  view: "recent" | "all";
}

export default function SidebarHeader({ view }: SidebarHeaderProps) {
  return (
    <header className="flex items-center justify-between">
      <h1 className="text-xl font-bold tracking-tight text-[rgb(var(--app-text))] transition-colors">
        {view === "recent" ? "Messages" : "All Users"}
      </h1>
      
      {/* Optional: You can add a 'Compose' or 'Settings' icon here 
        to fill out the header space.
      */}
    </header>
  );
}