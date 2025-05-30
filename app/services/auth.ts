/**
 * Authentication utilities for token management
 */
const AUTH_TOKEN_KEY = "kuepass_auth_token";
const USER_DATA_KEY = "kuepass_user_data";

// Define user data interface
export interface UserData {
  id?: string;
  name?: string;
  username?: string;
  email?: string;
  profile_url?: string;
  phone_number?: string;
  active?: boolean;
  country?: string;
  currency?: string;
  language?: string;
  profilePicture?: string;
}

// Define sign-in data
export interface SignInData {
  email: string;
  password: string;
}

// Define auth response
export interface AuthResponse {
  success?: boolean;
  message?: string;
  detail?: string;
  refresh?: string;
  access?: string;
  data?: {
    tokens?: {
      access: string;
      refresh?: string;
    };
    user?: UserData;
  };
  token?: string;
  user?: UserData;
  error_code?: string;
}

/**
 * Store authentication token in localStorage
 */
export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
}

/**
 * Get stored authentication token
 */
export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }
  return null;
}

/**
 * Remove authentication token
 */
export function removeAuthToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

/**
 * Store user data in localStorage
 */
export function setUserData(userData: UserData): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  }
}

/**
 * Get stored user data
 */
export function getUserData(): UserData | null {
  if (typeof window !== "undefined") {
    const userData = localStorage.getItem(USER_DATA_KEY);
    if (userData) {
      try {
        return JSON.parse(userData) as UserData;
      } catch {
        return null;
      }
    }
  }
  return null;
}

/**
 * Remove user data
 */
export function removeUserData(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(USER_DATA_KEY);
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

/**
 * Clear all authentication data and perform server logout
 */
export async function clearAuth(): Promise<void> {
  removeAuthToken();
  removeUserData();

  try {
    const BASE_URL =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://keupass-48c2ae65f897.herokuapp.com/api";

    await fetch(`${BASE_URL}/logout/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCsrfToken() || "",
      },
    });
  } catch (error) {
    console.error("Server logout failed:", error);
  }
}

/**
 * Fetch CSRF token (if needed)
 */
export function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const name = "csrftoken";
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

/**
 * For authenticated requests
 */
export async function authenticatedRequest<T>(
  url: string,
  method: string = "GET",
  data: Record<string, unknown> | FormData | null = null
): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const csrfToken = getCsrfToken();
  if (csrfToken) {
    headers["X-CSRFToken"] = csrfToken;
  }

  const options: RequestInit = {
    method,
    headers,
    credentials: "include",
  };

  if (data && method !== "GET") {
    if (data instanceof FormData) {
      options.body = data;
    } else {
      headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(data);
    }
  }

  return safeFetch<T>(url, options);
}

/**
 * Fetch user profile (stub - implement based on backend endpoint)
 */
export async function getUserProfile(): Promise<UserData> {
  const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://keupass-48c2ae65f897.herokuapp.com/api";
  return authenticatedRequest<UserData>(`${BASE_URL}/user/`, "GET");
}

/**
 * Helper to handle fetch errors including network issues
 */
export async function safeFetch<T>(
  url: string,
  options: RequestInit,
  fallbackErrorMessage = "Network error. Please check your internet connection."
): Promise<T> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(
        errorData.message || `HTTP error! Status: ${response.status}`
      );
      (error as any).status = response.status;
      (error as any).data = errorData;
      throw error;
    }
    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(fallbackErrorMessage);
    }
    throw error;
  }
}
