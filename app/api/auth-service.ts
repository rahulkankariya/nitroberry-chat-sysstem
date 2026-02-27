import api from "./axios-instance";

export const authService = {
  login: async (credentials: any) => {
    const { data } = await api.post("/login", credentials);
    let token =data?.data.token
    
    if (token) {
      localStorage.setItem("token", token);
    }
    return data;
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