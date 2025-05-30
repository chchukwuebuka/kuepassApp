// Get API URL from environment variables
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://keupass-48c2ae65f897.herokuapp.com/api";

// Import types from separate file
import {
  AuthResponse,
  SignUpData,
  SignInData,
  ResetPasswordData,
  VerifyPasswordData,
  VerifyEmailData,
} from "./apiTypes";

import { jwtDecode } from "jwt-decode";
import { setAuthToken, setUserData, getAuthToken, UserData } from "./auth";

interface JwtPayload {
  user_id: number;
  username: string;
  phone_number: string;
  exp: number;
  iat: number;
  jti: string;
  token_type: string;
}

/**
 * Function to get CSRF token from cookies
 */
function getCsrfToken() {
  if (typeof document === "undefined") return null; // Safety check for SSR

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
 * Helper to handle API responses
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP error! Status: ${response.status}`
    );
  }
  return response.json();
}

/**
 * Helper to handle fetch errors including network issues
 */
async function safeFetch<T>(
  url: string,
  options: RequestInit,
  fallbackErrorMessage = "Network error. Please check your internet connection."
): Promise<T> {
  try {
    const response = await fetch(url, options);
    return await handleResponse<T>(response);
  } catch (error) {
    // Check if the error is a network error
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(fallbackErrorMessage);
    }
    // Otherwise rethrow the original error
    throw error;
  }
}

/**
 * For authenticated requests that need the JWT token
 */
export async function authenticatedRequest<T>(
  url: string,
  method: string = "GET",
  data: Record<string, unknown> | null = null
): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // For requests that need CSRF protection
  const csrfToken = getCsrfToken();
  if (csrfToken) {
    headers["X-CSRFToken"] = csrfToken;
  }

  const options: RequestInit = {
    method,
    headers,
    credentials: "include", // Include cookies for session-based auth
  };

  if (data && method !== "GET") {
    options.body = JSON.stringify(data);
  }

  return safeFetch<T>(url, options);
}

/**
 * Register a new user
 */
export async function signUp(data: SignUpData): Promise<AuthResponse> {
  return safeFetch<AuthResponse>(
    `${BASE_URL}/signup/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include", // Enable cookies for session-based auth
    },
    "Failed to connect to the server. Please check your internet connection and try again."
  );
}

export async function signIn(data: SignInData): Promise<AuthResponse> {
  const response = await safeFetch<AuthResponse>(
    `${BASE_URL}/login/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCsrfToken() || "", // Include CSRF token
      },
      body: JSON.stringify({
        username: data.email, // Backend expects email as username
        password: data.password,
      }),
      credentials: "include",
    },
    "Failed to connect to the server. Please check your internet connection and try again."
  );

  // Handle response with access and refresh tokens
  if (response.access) {
    setAuthToken(response.access); // Store access token
    try {
      // Decode JWT to extract user details
      const decoded: JwtPayload = jwtDecode(response.access);
      const userData: UserData = {
        username: decoded.username, // e.g., "Oracle"
        email: data.email, // Use email from input
        name: decoded.username, // Fallback to username if name is unavailable
        // profilePicture: "/images/avatar.png",
        profile_url: "", // Empty string as default
      };
      setUserData(userData); // Store user data in localStorage
    } catch (error) {
      console.error("Failed to decode JWT:", error);
    }
  }

  return response;
}

/**
 * Verify email with token
 */
export async function verifyEmail(
  data: VerifyEmailData
): Promise<AuthResponse> {
  return safeFetch<AuthResponse>(
    `${BASE_URL}/email-verify/${data.uidb64}/${data.token}/`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Enable cookies for session-based auth
    },
    "Failed to verify email. Please check your internet connection and try again."
  );
}

/**
 * Request password reset verification code
 */
export async function requestPasswordReset(
  data: ResetPasswordData
): Promise<AuthResponse> {
  return safeFetch<AuthResponse>(
    `${BASE_URL}/password-reset/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include", // Enable cookies for session-based auth
    },
    "Failed to request verification code. Please check your internet connection and try again."
  );
}

/**
 * Verify and reset password with token
 */
export async function verifyAndResetPassword(
  data: VerifyPasswordData
): Promise<AuthResponse> {
  const csrfToken = getCsrfToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (csrfToken) {
    headers["X-CSRFToken"] = csrfToken;
  }

  return safeFetch<AuthResponse>(
    `${BASE_URL}/password-reset-confirm/${data.uidb64}/${data.token}/`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        password: data.password,
      }),
      credentials: "include", // Enable cookies for session-based auth
    },
    "Failed to reset password. Please check your internet connection and try again."
  );
}

/**
 * Logout the current user (client-side)
 */
export function logout(): void {
  // This function would clear tokens from localStorage/cookies
  // and can be expanded when implementing actual token storage
  localStorage.removeItem("authToken");
  return;
}

/**
 * Get user profile data
 */
export async function getUserProfile(): Promise<UserData> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication token is missing");
  }

  return authenticatedRequest<UserData>(`${BASE_URL}/user/profile/`, "GET");
}

