/**
 * Types for API requests and responses
 */

export interface AuthResponse {
  success?: boolean;
  message?: string;
  detail?: string;
  data?: {
    tokens?: {
      access: string;
      refresh?: string;
    };
    user?: UserData;
  };
  token?: string; // For backward compatibility
  user?: UserData; // For backward compatibility
  access?: string; // For direct JWT response format
  refresh?: string; // For direct JWT response format
}

export interface UserData {
  name?: string;
  username?: string;
  email?: string;
  profile_url?: string;
  phone_number?: string;
  active?: boolean;
  country?: string;
  currency?: string;
  language?: string;
}

export interface SignUpData {
  username: string;
  email: string;
  password: string;
  phone_number?: string;
  profile_url?: string;
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
