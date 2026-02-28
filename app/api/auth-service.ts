import { notify } from "../utils/toast";
import api from "./axios-instance";

export const authService = {
login: async (credentials: any) => {
  try {
    const { data } = await api.post("/login", credentials);
    
    // Extract the main auth token and the socket token
    const authToken = data?.data?.token;
    const socketToken = data?.data?.socketToken;

    // 1. Always store your main authentication token
    if (authToken) {
      localStorage.setItem("token", authToken);
    }

    // 2. Manage the Socket Token
    if (socketToken) {
      localStorage.setItem("socketToken", socketToken);
    } else {
      // If no socketToken, notify the user that chat is disabled
      localStorage.removeItem("socketToken"); // Clear any old tokens
      notify.error("Chat connection is off. You cannot chat at this time.");
    }

    return data;
  } catch (e:any) {
    notify.error(`Login Error: ${e.message}`);
    throw e;
  }
},
  logout: () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  },
  getProfile: async () => {
    const { data } = await api.get("/profile");
    return data;
  },
  
};