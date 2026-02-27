"use client";
import { useEffect, useState } from "react";
import { authService } from "../api/auth-service";
import { Button } from "../components/common/button";
import { Loader } from "../components/common/loader";


export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);

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
      Hello World
      </div>
    </main>
  );
}
