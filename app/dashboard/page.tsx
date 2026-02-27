"use client";
import { useEffect } from "react";
import { ChatOverlay } from "../components/chatSystem/ChatOverlay";


export default function DashboardPage() {
  

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
  }, []);

  return (
    <main>
      <div className="w-full ">
     <ChatOverlay/>
      </div>
    </main>
  );
}
