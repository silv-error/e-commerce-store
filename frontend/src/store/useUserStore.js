import { create } from "zustand";
import { toast } from "react-hot-toast";
import axios from "../libs/axios";

export const useUserStore = create((set, get) => ({
  user: null,
  isLoading: false,
  checkingAuth: true,

  signup: async (formData) => {
    set({ isLoading: true });
    if (formData.password !== formData.confirmPassword) {
      set({ isLoading: false });
      return toast.error("Passwords do not match");
    }

    try {
      const res = await axios.post("/auth/signup", formData);
      set({ user: res.data });
      toast.success("User created successfully");
    } catch (error) {
      toast.error(error.response.data.error || "Something went wrong");
    } finally {
      set({ isLoading: false });
    }
  },

  login: async ({ email, password }) => {
    set({ isLoading: true });
    try {
      const res = await axios.post("/auth/login", { email, password });
      set({ user: res.data });
      toast.success("User logged in successfully");
    } catch (error) {
      toast.error(error.response.data.error || "Something went wrong");
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      const res = await axios.post("/auth/logout");
      set({ user: null });
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response.data.error || "Something went wrong");
    } finally {
      set({ isLoading: false });
    }
  },

  checkAuth: async () => {
    set({ checkingAuth: true });
    try {
      const res = await axios.get("/auth/profile");
      set({ user: res.data });
    } catch (error) {
      set({ user: null });
    } finally {
      set({ checkingAuth: false });
    }
  },
}));
