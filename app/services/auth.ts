

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
  profile_url?: string; // This is the correct field from your Django API
  phone_number?: string;
  active?: boolean;
  country?: string;
  currency?: string;
  language?: string;
  // profilePicture?: string; <-- This duplicate is removed to avoid confusion
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


// --- This is the helper function from before (no changes) ---
const formatDjangoError = (errorData: any): string => {
  if (!errorData) return "An unknown error occurred on the server.";
  if (typeof errorData.detail === 'string') return errorData.detail;
  if (typeof errorData === 'object' && Object.keys(errorData).length > 0) {
    const errorMessages = Object.entries(errorData).map(([field, errors]) => {
      const errorList = Array.isArray(errors) ? errors.join(' ') : String(errors);
      const formattedField = field.charAt(0).toUpperCase() + field.slice(1);
      return `${formattedField}: ${errorList}`;
    });
    return errorMessages.join('\n');
  }
  if (typeof errorData.message === 'string') return errorData.message;
  return "The server sent back an unformatted error. Check the Network tab.";
};


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

    // --- UPDATED AND CORRECTED ERROR/SUCCESS HANDLING ---

    // For successful but empty responses (e.g., 204 No Content)
    if (response.ok && response.status === 204) {
      return {} as T;
    }

    // Try to get the response body as text first.
    const responseText = await response.text();
    // Parse it as JSON only if it's not empty.
    const data = responseText ? JSON.parse(responseText) : {};

    if (!response.ok) {
      // If we're here, it's an HTTP error (4xx or 5xx).
      // 'data' now contains the parsed error object from the server.
      const formattedMessage = formatDjangoError(data);
      const error = new Error(formattedMessage);
      (error as any).status = response.status;
      (error as any).data = data;
      throw error;
    }

    // If we're here, it's a successful response with a JSON body.
    return data as T;

  } catch (error) {
    // This outer catch handles true network failures or JSON parsing errors.
    if (error instanceof SyntaxError) {
      // This happens if the server response is not valid JSON.
      console.error("JSON Parsing Error:", error);
      throw new Error("Failed to parse server response.");
    }
    if (error instanceof TypeError && error.message.includes("fetch")) {
      // This is a network connectivity error.
      throw new Error(fallbackErrorMessage);
    }
    // Re-throw our formatted error or any other unexpected errors.
    throw error;
  }
}