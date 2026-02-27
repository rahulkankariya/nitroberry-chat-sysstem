import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: { 
    "Content-Type": "application/json",
    // Adding the x-api-key from environment variables
    "x-api-key": process.env.NEXT_PUBLIC_API_KEY 
  },
});

api.interceptors.request.use((config) => {
  // Ensure we are on the client side before accessing localStorage
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;