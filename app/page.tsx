"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // If logged in, go to dashboard
      router.push("/dashboard");
    } else {
      // If not logged in, go to login page
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="animate-pulse text-gray-500">Checking session...</p>
    </div>
  );
}