import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import axios from "axios";
import { io } from "socket.io-client";


export const useAuthStore = create((set, get) => ({
  authUser: null,
  isAuthenticated: false,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const token = localStorage.getItem('token');
      console.log('Checking auth with token:', token);
      if (!token) {
        set({ isAuthenticated: false, authUser: null, isCheckingAuth: false });
        console.log('No token found');
        return false;
      }
      const response = await axiosInstance.get("/auth/check", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Check auth response:', response.data);
      set({ isAuthenticated: true, authUser: response.data.user, isCheckingAuth: false });
       get().connectSocket();
      return true;
    } catch (error) {
      console.error('Check auth error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isAuthenticated: false, authUser: null, isCheckingAuth: false });
      localStorage.removeItem('token');
      return false;
    }
  },

  signup: async (data) => {
  set({ isSigningUp: true });
  try {
    const res = await axiosInstance.post("/auth/signup", data);
    set({ authUser: res.data.user, isAuthenticated: true });
    localStorage.setItem('token', res.data.token);
    toast.success("Account created successfully");
     get().connectSocket();
    await get().checkAuth(); // Call checkAuth after signup
  } catch (error) {
    console.error('Signup error:', error.response?.data);
    toast.error(error.response?.data?.message || "Signup failed");
  } finally {
    set({ isSigningUp: false });
  }
},

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data.user, isAuthenticated: true });
      localStorage.setItem('token', res.data.token);
      toast.success("Logged in successfully");
      get().connectSocket();

    } catch (error) {
      console.error('Login error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null, isAuthenticated: false });
      localStorage.removeItem('token');
      toast.success("Logged out successfully");
      get().disconnectSocket();
      window.location.href = "/login";
    } catch (error) {
      console.error('Logout error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      toast.error(error.response?.data?.message || "Logout failed");
    }
  },


  updateProfile: async ({ profilepic }) => {
    set({ isUpdatingProfile: true });
    try {
      const token = localStorage.getItem('token');
      console.log('Token for updateProfile:', token);
      if (!token) {
        console.log('No token found for updateProfile');
        toast.error('Please log in again');
        throw new Error('No token available');
      }
      console.log('Sending to backend:', { 
        profilepic: profilepic ? `${profilepic.substring(0, 50)}... (length: ${profilepic.length})` : null 
      });
      const response = await axiosInstance.put('/auth/user-profile', 
        { profilepic },
        { 
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );
      set({ authUser: response.data.user, isAuthenticated: true });
      toast.success('Profile updated successfully');
      return response.data;
    } catch (error) {
      console.error('Update profile error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      toast.error(error.response?.data?.message || 'Profile update failed');
      throw error;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

 
   connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

   const socket = io("/", {
  query: { userId: authUser._id },
});

    socket.connect();

    set({ socket: socket });

     socket.on("getOnlineUsers", (userIds) => {
    console.log("📡 Received online users:", userIds); // ✅ Add this
    set({ onlineUsers: userIds });
  });

   
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));