/**
 * Mock API responses for offline development and testing
 *
 * This file provides mock responses for API calls when working offline or
 * when the actual API is unavailable. It's useful for development and testing.
 */

// Types for the mock responses
import {
  SignUpData,
  SignInData,
  ResetPasswordData,
  VerifyPasswordData,
  VerifyEmailData,
} from "./apiTypes";

// Flag to enable/disable mock responses
export const USE_MOCK_RESPONSES = false; // Set to true to use mock responses

// Mock user data
const MOCK_USER = {
  name: "Test User",
  email: "test@example.com",
  profilePicture: "/images/avatar.png",
};

// Mock token
const MOCK_TOKEN = "mock_jwt_token_for_testing_purposes_only";

// Mock responses
export const mockResponses = {
  // Sign up response
  signup: (data: SignUpData) => ({
    success: true,
    message: "Account created successfully. Please verify your email.",
    user: {
      name: data.name,
      email: data.email,
      profilePicture: "/images/avatar.png",
    },
  }),

  // Sign in response
  login: (data: SignInData) => ({
    success: true,
    message: "Logged in successfully",
    token: MOCK_TOKEN,
    user: {
      ...MOCK_USER,
      email: data.email,
    },
  }),

  // Email verification response
  verifyEmail: (data: VerifyEmailData) => ({
    success: true,
    message: "Email verified successfully",
    token: MOCK_TOKEN,
    user: MOCK_USER,
  }),

  // Password reset request response
  passwordReset: (data: ResetPasswordData) => ({
    success: true,
    message: "Password reset instructions sent to your email",
  }),

  // Password reset confirmation response
  passwordResetConfirm: (data: VerifyPasswordData) => ({
    success: true,
    message: "Password reset successfully",
  }),
};

/**
 * Helper function to simulate API delay
 */
export const simulateApiDelay = (ms = 800) =>
  new Promise((resolve) => setTimeout(resolve, ms));
