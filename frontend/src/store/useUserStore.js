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

  refreshToken: async () => {
    // Prevent multiple simultaneous refresh attempts
    if (get().checkingAuth) return;

    set({ checkingAuth: true });
    try {
      const response = await axios.post("/auth/refresh-token");
      set({ checkingAuth: false });
      return response.data;
    } catch (error) {
      set({ user: null, checkingAuth: false });
      throw error;
    }
  },
}));

// Axios interceptor for token refresh
let refreshPromise = null;

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // If a refresh is already in progress, wait for it to complete
        if (refreshPromise) {
          await refreshPromise;
          return axios(originalRequest);
        }

        // Start a new refresh process
        refreshPromise = useUserStore.getState().refreshToken();
        await refreshPromise;
        refreshPromise = null;

        return axios(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login or handle as needed
        useUserStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
