// Get API URL from environment variables
const BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "https://keupass-48c2ae65f897.herokuapp.com/api"
).replace(/\/$/, "");

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

// // --- IMPORTS ---
// // Import functions for token management from your auth file
// import {
//   getAccessToken,
//   getRefreshToken,
//   setTokens,
//   removeTokens,
//   removeUserData,
//   UserData, // Assuming UserData is also exported from auth.ts
// } from "./auth"; // Adjust path if needed

// // Import your Redux store and logout action to dispatch from outside a component
// import { store, logout as reduxLogout } from "../../store/store"; // Adjust path to your store file

// import { jwtDecode } from "jwt-decode";

// // --- CONSTANTS & TYPE DEFINITIONS ---

// const BASE_URL =
//   process.env.NEXT_PUBLIC_API_URL ||
//   "https://keupass-48c2ae65f897.herokuapp.com/api";

// // Re-defining types here as they were in your original file
// // You might consider moving these to a central types file
// export interface AuthResponse {
//   success?: boolean;
//   message?: string;
//   detail?: string;
//   refresh?: string;
//   access?: string;
//   data?: {
//     tokens?: {
//       access: string;
//       refresh?: string;
//     };
//     user?: UserData;
//   };
//   token?: string;
//   user?: UserData;
//   error_code?: string;
// }

// export interface SignUpData {
//   // Define properties for SignUpData based on your needs
//   email: string;
//   password_one: string;
//   password_two: string;
//   username: string;
//   phone_number: string;
// }

// export interface SignInData {
//   email: string;
//   password: string;
// }

// export interface ResetPasswordData {
//   email: string;
// }

// export interface VerifyPasswordData {
//   uidb64: string;
//   token: string;
//   password?: string;
// }

// export interface VerifyEmailData {
//   uidb64: string;
//   token: string;
// }

// interface JwtPayload {
//   user_id: number;
//   username: string;
//   phone_number: string;
//   exp: number;
//   iat: number;
//   jti: string;
//   token_type: string;
// }

// // --- HELPER FUNCTIONS ---

// /**
//  * Helper to get CSRF token from cookies
//  */
// function getCsrfToken(): string | null {
//   if (typeof document === "undefined") return null; // Safety check for SSR
//   const name = "csrftoken";
//   let cookieValue = null;
//   if (document.cookie && document.cookie !== "") {
//     const cookies = document.cookie.split(";");
//     for (let i = 0; i < cookies.length; i++) {
//       const cookie = cookies[i].trim();
//       if (cookie.substring(0, name.length + 1) === name + "=") {
//         cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//         break;
//       }
//     }
//   }
//   return cookieValue;
// }

// /**
//  * Helper to format errors from the Django backend
//  */
// const formatDjangoError = (errorData: any): string => {
//   if (!errorData) return "An unknown error occurred on the server.";
//   if (typeof errorData.detail === "string") return errorData.detail;
//   if (typeof errorData === "object" && Object.keys(errorData).length > 0) {
//     const errorMessages = Object.entries(errorData).map(([field, errors]) => {
//       const errorList = Array.isArray(errors)
//         ? errors.join(" ")
//         : String(errors);
//       const formattedField =
//         field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, " ");
//       return `${formattedField}: ${errorList}`;
//     });
//     return errorMessages.join("\n");
//   }
//   if (typeof errorData.message === "string") return errorData.message;
//   return "The server sent back an unformatted error. Check the Network tab.";
// };

// // --- CORE API LOGIC (THE NEW INTERCEPTOR) ---

// /**
//  * The NEW safeFetch function with built-in interceptor logic for
//  * JWT refresh and monitoring. This replaces your old safeFetch.
//  */
// export async function safeFetch<T>(
//   url: string,
//   options: RequestInit,
//   fallbackErrorMessage = "Network error. Please check your internet connection."
// ): Promise<T> {
//   const startTime = new Date();
//   console.log(
//     `[MONITORING] Starting Request: ${options.method || "GET"} ${url}`
//   );

//   const makeRequest = async (currentOptions: RequestInit): Promise<any> => {
//     const response = await fetch(url, currentOptions);
//     const duration = new Date().getTime() - startTime.getTime();
//     console.log(
//       `[MONITORING] Response for ${url} in ${duration}ms with status ${response.status}`
//     );

//     if (!response.ok) {
//       const errorData = await response
//         .json()
//         .catch(() => ({ message: response.statusText }));
//       const error = new Error(formatDjangoError(errorData));
//       (error as any).status = response.status;
//       (error as any).data = errorData;
//       throw error;
//     }

//     if (response.status === 204) return {};
//     return response.json();
//   };

//   try {
//     return await makeRequest(options);
//   } catch (error: any) {
//     // Interceptor logic for 401 Unauthorized errors
//     if (error.status === 401) {
//       console.log(
//         "[AUTH] Access token expired or invalid. Attempting to refresh..."
//       );
//       const refreshToken = getRefreshToken();

//       if (!refreshToken) {
//         console.error("[AUTH] No refresh token available. Logging out.");
//         store.dispatch(reduxLogout());
//         removeTokens();
//         removeUserData();
//         if (typeof window !== "undefined") window.location.href = "/login";
//         return Promise.reject(error);
//       }

//       try {
//         const refreshResponse = await fetch(`${BASE_URL}/auth/token/refresh/`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ refresh: refreshToken }),
//         });

//         if (!refreshResponse.ok) throw new Error("Refresh token is invalid.");

//         const { access, refresh: newRefreshToken } =
//           await refreshResponse.json();
//         setTokens(access, newRefreshToken || refreshToken);
//         console.log("[AUTH] Token refreshed. Retrying original request...");

//         const newHeaders = new Headers(options.headers);
//         newHeaders.set("Authorization", `Bearer ${access}`);
//         const newOptions = { ...options, headers: newHeaders };

//         return await makeRequest(newOptions);
//       } catch (refreshError) {
//         console.error(
//           "[AUTH] Failed to refresh token. Logging out.",
//           refreshError
//         );
//         store.dispatch(reduxLogout());
//         removeTokens();
//         removeUserData();
//         if (typeof window !== "undefined") window.location.href = "/login";
//         return Promise.reject(refreshError);
//       }
//     }

//     // For all other errors (non-401 or network errors)
//     if (error instanceof TypeError && error.message.includes("fetch")) {
//       throw new Error(fallbackErrorMessage);
//     }
//     return Promise.reject(error);
//   }
// }

// // --- API ENDPOINT FUNCTIONS ---

// /**
//  * Wrapper for authenticated requests. This function now automatically uses the new safeFetch.
//  */
// export async function authenticatedRequest<T>(
//   url: string,
//   method: string = "GET",
//   data: Record<string, unknown> | FormData | null = null
// ): Promise<T> {
//   const token = getAccessToken();
//   const headers: HeadersInit = {};

//   if (token) {
//     headers["Authorization"] = `Bearer ${token}`;
//   }

//   const csrfToken = getCsrfToken();
//   if (csrfToken) {
//     headers["X-CSRFToken"] = csrfToken;
//   }

//   const options: RequestInit = {
//     method,
//     headers,
//     credentials: "include",
//   };

//   if (data && method !== "GET") {
//     if (data instanceof FormData) {
//       options.body = data; // Let the browser set the Content-Type for FormData
//     } else {
//       headers["Content-Type"] = "application/json";
//       options.body = JSON.stringify(data);
//     }
//   }

//   return safeFetch<T>(url, options);
// }

// /**
//  * Register a new user
//  */
// export async function signUp(data: SignUpData): Promise<AuthResponse> {
//   return safeFetch<AuthResponse>(
//     `${BASE_URL}/signup/`, // Ensure this is your correct DRF signup URL
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(data),
//       credentials: "include",
//     },
//     "Failed to connect to the server. Please check your internet connection and try again."
//   );
// }

// /**
//  * Sign in a user
//  */
// export async function signIn(data: SignInData): Promise<AuthResponse> {
//   const response = await safeFetch<AuthResponse>(
//     `${BASE_URL}/auth/login/`, // Using the dj-rest-auth default URL
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "X-CSRFToken": getCsrfToken() || "",
//       },
//       // Note: dj-rest-auth usually uses 'email' and 'password' by default, not 'username'
//       body: JSON.stringify({ email: data.email, password: data.password }),
//       credentials: "include",
//     },
//     "Failed to connect to the server. Please check your internet connection and try again."
//   );

//   // UPDATED: Correctly store both access and refresh tokens upon successful login
//   if (response.access && response.refresh) {
//     setTokens(response.access, response.refresh);
//     try {
//       const decoded: JwtPayload = jwtDecode(response.access);
//       const userData: UserData = {
//         username: decoded.username,
//         email: data.email,
//         name: decoded.username,
//         phone_number: decoded.phone_number,
//         profile_url: "", // Set this from a user profile endpoint later
//       };
//       setUserData(userData);
//     } catch (error) {
//       console.error("Failed to decode JWT:", error);
//     }
//   }

//   return response;
// }

// /**
//  * Verify email with token
//  */
// export async function verifyEmail(
//   data: VerifyEmailData
// ): Promise<AuthResponse> {
//   return safeFetch<AuthResponse>(
//     `${BASE_URL}/email-verify/${data.uidb64}/${data.token}/`,
//     {
//       method: "GET",
//       headers: { "Content-Type": "application/json" },
//       credentials: "include",
//     },
//     "Failed to verify email. Please check your internet connection and try again."
//   );
// }

// /**
//  * Request password reset verification code
//  */
// export async function requestPasswordReset(
//   data: ResetPasswordData
// ): Promise<AuthResponse> {
//   return safeFetch<AuthResponse>(
//     `${BASE_URL}/password-reset/`,
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(data),
//       credentials: "include",
//     },
//     "Failed to request verification code. Please check your internet connection and try again."
//   );
// }

// /**
//  * Verify and reset password with token
//  */
// export async function verifyAndResetPassword(
//   data: VerifyPasswordData
// ): Promise<AuthResponse> {
//   return safeFetch<AuthResponse>(
//     `${BASE_URL}/password-reset-confirm/${data.uidb64}/${data.token}/`,
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "X-CSRFToken": getCsrfToken() || "",
//       },
//       body: JSON.stringify({ password: data.password }),
//       credentials: "include",
//     },
//     "Failed to reset password. Please check your internet connection and try again."
//   );
// }

// /**
//  * Logout the current user (client-side part)
//  */
// export function logout(): void {
//   // This function is a wrapper for clearAuth which does the full server/client logout
//   // You can call clearAuth directly from your UI components
//   // Or call this if you only want the client-side part for some reason
//   removeTokens();
//   removeUserData();
// }

// /**
//  * Get user profile data
//  */
// export async function getUserProfile(): Promise<UserData> {
//   // Use the dj-rest-auth default user endpoint
//   return authenticatedRequest<UserData>(`${BASE_URL}/auth/user/`, "GET");
// }
