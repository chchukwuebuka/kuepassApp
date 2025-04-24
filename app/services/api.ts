/**
 * API service for authentication endpoints
 */

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

// Import mock responses for offline development
import {
  USE_MOCK_RESPONSES,
  mockResponses,
  simulateApiDelay,
} from "./mockResponses";

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
 * Register a new user
 */
export async function signUp(data: SignUpData): Promise<AuthResponse> {
  // Use mock response if offline mode is enabled
  if (USE_MOCK_RESPONSES) {
    await simulateApiDelay();
    return mockResponses.signup(data);
  }

  return safeFetch<AuthResponse>(
    `${BASE_URL}/signup/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
    "Failed to connect to the server. Please check your internet connection and try again."
  );
}

/**
 * Sign in an existing user
 */
export async function signIn(data: SignInData): Promise<AuthResponse> {
  // Use mock response if offline mode is enabled
  if (USE_MOCK_RESPONSES) {
    await simulateApiDelay();
    return mockResponses.login(data);
  }

  return safeFetch<AuthResponse>(
    `${BASE_URL}/login/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
    "Failed to connect to the server. Please check your internet connection and try again."
  );
}

/**
 * Verify email with token
 */
export async function verifyEmail(
  data: VerifyEmailData
): Promise<AuthResponse> {
  // Use mock response if offline mode is enabled
  if (USE_MOCK_RESPONSES) {
    await simulateApiDelay();
    return mockResponses.verifyEmail(data);
  }

  return safeFetch<AuthResponse>(
    `${BASE_URL}/email-verify/${data.uidb64}/${data.token}/`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
    "Failed to verify email. Please check your internet connection and try again."
  );
}

/**
 * Request password reset email
 */
export async function requestPasswordReset(
  data: ResetPasswordData
): Promise<AuthResponse> {
  // Use mock response if offline mode is enabled
  if (USE_MOCK_RESPONSES) {
    await simulateApiDelay();
    return mockResponses.passwordReset(data);
  }

  return safeFetch<AuthResponse>(
    `${BASE_URL}/password-reset/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
    "Failed to request password reset. Please check your internet connection and try again."
  );
}

/**
 * Verify and reset password with token
 */
export async function verifyAndResetPassword(
  data: VerifyPasswordData
): Promise<AuthResponse> {
  // Use mock response if offline mode is enabled
  if (USE_MOCK_RESPONSES) {
    await simulateApiDelay();
    return mockResponses.passwordResetConfirm(data);
  }

  return safeFetch<AuthResponse>(
    `${BASE_URL}/password-reset-confirm/${data.uidb64}/${data.token}/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password: data.password,
      }),
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
