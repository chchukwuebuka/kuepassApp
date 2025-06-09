import axios from "axios";
import { store } from "../store/store";
import { showLoading, hideLoading } from "../store/loadingSlice";

// Create a new axios instance with your base URL
const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL || "https://your-api-base-url.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    store.dispatch(showLoading());
    return config;
  },
  (error) => {
    store.dispatch(hideLoading());
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    store.dispatch(hideLoading());
    return response;
  },
  (error) => {
    store.dispatch(hideLoading());
    return Promise.reject(error);
  }
);

export default api;
