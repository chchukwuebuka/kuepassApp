/**
 * Types for API requests and responses
 */

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    name?: string;
    email: string;
    profilePicture?: string;
  };
}

export interface SignUpData {
  name: string;
  email: string;
  password: string;
  number?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface VerifyPasswordData {
  uidb64: string;
  token: string;
  password: string;
}

export interface VerifyEmailData {
  uidb64: string;
  token: string;
}
