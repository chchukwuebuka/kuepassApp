"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  TextInput,
  PasswordInput,
  Button,
  Text,
  Stack,
  Notification,
  Box,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import Image from "next/image";
import {
  IconAt,
  IconArrowLeft,
  IconLock,
  IconBrandGoogle,
} from "@tabler/icons-react";
import styles from "./styles.module.css";
import Link from "next/link";
import { useAppDispatch } from "@/store/store"; // Assuming this is your custom hook: () => useDispatch<AppDispatch>()
import { login, User as ReduxUser } from "@/store/store"; // Import your Redux login action and User type
import { useRouter, useSearchParams } from "next/navigation";
import { signIn as apiSignIn } from "@/app/services/api"; // Assuming this is your email/password signIn
import {
  setAuthToken,
  setUserData,
  UserData as LocalStorageUserData,
  AuthResponse,
} from "@/app/services/auth"; // Your auth utilities
// jwtDecode might not be needed here if backend returns full user object
// import { jwtDecode } from "jwt-decode";
import { useGoogleLogin, CredentialResponse } from "@react-oauth/google"; // Corrected import

// Removed duplicate JwtPayload, use UserData from auth.ts or Redux User type

const SignIn: React.FC = () => {
  const form = useForm({
    initialValues: { email: "", password: "" },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) => (value.length >= 6 ? null : "Password too short"),
    },
  });

  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccess("Account created! Please sign in.");
    }
  }, [searchParams]);

  // Helper to process backend auth response and update state/storage
  const processAuthResponse = (
    backendResponse: AuthResponse,
    sourceEmail?: string
  ) => {
    if (
      backendResponse.success &&
      backendResponse.data?.tokens?.access &&
      backendResponse.data?.user
    ) {
      const { access, refresh } = backendResponse.data.tokens;
      const backendApiUser = backendResponse.data.user;

      setAuthToken(access);
      if (refresh) localStorage.setItem("kuepass_refresh_token", refresh);

      // Prepare payload for Redux store, ensuring all fields match ReduxUser type
      const userForRedux: ReduxUser = {
        id: backendApiUser.id!, // Assuming backendApiUser has id and it's required for ReduxUser
        username:
          backendApiUser.username ||
          (sourceEmail ? sourceEmail.split("@")[0] : "User"),
        email: backendApiUser.email || sourceEmail || "",
        name:
          backendApiUser.name ||
          backendApiUser.username ||
          (sourceEmail ? sourceEmail.split("@")[0] : "User"),
        profile_url: backendApiUser.profile_url || undefined, // Use profile_url from backend
        phone_number: backendApiUser.phone_number || undefined,
        // Add other fields required by ReduxUser, providing defaults if necessary
        profilePicture: backendApiUser.profile_url || "/images/avatar.png", // If you still use this
        country: backendApiUser.country || undefined,
        currency: backendApiUser.currency || undefined,
        language: backendApiUser.language || undefined,
        active:
          backendApiUser.active !== undefined ? backendApiUser.active : true,
      };

      dispatch(login(userForRedux));

      // Prepare data for localStorage (subset, matching LocalStorageUserData)
      const userForLocalStorage: LocalStorageUserData = {
        username: userForRedux.username,
        email: userForRedux.email,
        name: userForRedux.name,
        profile_url: userForRedux.profile_url,
      };
      setUserData(userForLocalStorage);

      router.push("/"); // Or to a dashboard/profile page
    } else {
      const errorMessage =
        backendResponse.message ||
        backendResponse.detail ||
        "Authentication failed.";
      console.error(
        "Processing Auth Response Error:",
        errorMessage,
        backendResponse
      );
      setError(errorMessage);
    }
  };

  async function handleGoogleAuthWithBackend(googleAccessToken: string) {
    setGoogleLoading(true);
    setError(null);
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://keupass-48c2ae65f897.herokuapp.com/api";
      const response = await fetch(`${apiUrl}/google-login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: googleAccessToken }),
      });

      const backendAuthResponse: AuthResponse = await response.json();
      console.log("Google login backend response:", backendAuthResponse);

      if (!response.ok) {
        throw new Error(
          backendAuthResponse.message ||
            backendAuthResponse.detail ||
            "Google login backend processing failed"
        );
      }

      // Use the common processing function
      // The email used for Google sign-in might come from backendAuthResponse.data.user.email
      processAuthResponse(
        backendAuthResponse,
        backendAuthResponse.data?.user?.email
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Google sign-in failed. Please try again.";
      console.error("Error during Google login with backend:", err);
      setError(errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  }

  const googleLoginFlow = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("Google useGoogleLogin onSuccess:", tokenResponse);
      if (tokenResponse.access_token) {
        await handleGoogleAuthWithBackend(tokenResponse.access_token);
      } else {
        console.error(
          "Google access_token not found in tokenResponse from useGoogleLogin"
        );
        setError("Failed to get access token from Google.");
        setGoogleLoading(false);
      }
    },
    onError: (errorResponse) => {
      console.error("Google useGoogleLogin error:", errorResponse);
      setError("Google authentication failed. Please try again.");
      setGoogleLoading(false);
    },
    // flow: 'implicit', // or 'auth-code' if your backend handles code exchange
  });

  const handleGoogleSignInClick = () => {
    setGoogleLoading(true);
    setError(null);
    googleLoginFlow(); // This initiates the Google popup
  };

  const handleRegularSignIn = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Sending regular login request with email:", values.email);
      const backendAuthResponse = await apiSignIn({
        // This is your imported signIn from services/api
        email: values.email,
        password: values.password,
      });
      console.log("Regular login backend response:", backendAuthResponse);

      // Use the common processing function
      processAuthResponse(backendAuthResponse, values.email);
    } catch (err) {
      console.error("Regular login error:", err);
      const errorMessage =
        err instanceof Error
          ? (err as any).data?.detail ||
            err.message.includes("401") ||
            err.message.includes("400") // Check for specific error details from backend
            ? "Invalid email or password."
            : err.message
          : "Failed to sign in. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Left Column ... (no changes needed here) */}
      <div className={styles.leftColumn}>
        <div className={styles.overlay}></div>
        <div className={styles.welcomeTextOverlay}>
          <Title className={styles.welcomeTitle}>Welcome Back</Title>
          <Text className={styles.welcomeSubtitle}>
            We&apos;re excited to see you again
          </Text>
        </div>
        <Image
          src="/images/clubDance.png"
          alt="Sign in background"
          fill
          className={styles.image}
          priority
        />
      </div>

      {/* Right Column with Form ... */}
      <div className={styles.rightColumn}>
        <div className={styles.formContainer}>
          <Button
            variant="subtle"
            className={styles.goBackButton}
            onClick={() => router.push("/")}
            leftSection={<IconArrowLeft size={18} />}
          >
            Go Home
          </Button>
          <div className={styles.formHeader}>
            <Title className={styles.title}>Sign In</Title>
            <Text className={styles.subtitle}>
              Log in to your account to continue your journey
            </Text>
          </div>

          {error && (
            <Notification
              color="red"
              onClose={() => setError(null)}
              className={styles.notification}
              withCloseButton
            >
              {error}
            </Notification>
          )}
          {success && (
            <Notification
              color="green"
              onClose={() => setSuccess(null)}
              className={styles.notification}
              withCloseButton
            >
              {success}
            </Notification>
          )}

          <Box className={styles.formWrapper}>
            <form onSubmit={form.onSubmit(handleRegularSignIn)}>
              <TextInput
                label="Email address"
                leftSection={<IconAt size={18} className={styles.inputIcon} />}
                placeholder="Enter your email address"
                {...form.getInputProps("email")}
                required
                className={styles.input}
                classNames={{
                  input: styles.inputField,
                  label: styles.inputLabel,
                  error: styles.inputError,
                  wrapper: styles.inputWrapper,
                }}
              />
              <div className={styles.passwordContainer}>
                <PasswordInput
                  label="Password"
                  placeholder="Enter your password"
                  leftSection={
                    <IconLock size={18} className={styles.inputIcon} />
                  }
                  {...form.getInputProps("password")}
                  required
                  className={styles.input}
                  classNames={{
                    input: styles.inputField,
                    label: styles.inputLabel,
                    error: styles.inputError,
                    innerInput: styles.passwordInput,
                    wrapper: styles.inputWrapper,
                  }}
                />
                <div className={styles.forgotPasswordContainer}>
                  <Link
                    href="/auth/forgotPassword"
                    className={styles.forgotPassword}
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>
              <Button
                type="submit"
                fullWidth
                className={styles.submitButton}
                loading={loading}
                loaderProps={{ size: "sm" }}
              >
                {loading ? "Signing In" : "Sign In"}
              </Button>
            </form>

            <div className={styles.divider}>
              <span className={styles.dividerText}>OR</span>
            </div>

            <Stack gap="md">
              {/* Replace GoogleLogin component with a button that calls googleLoginFlow */}
              <Button
                variant="outline"
                fullWidth
                className={styles.socialButton}
                leftSection={!googleLoading && <IconBrandGoogle size={18} />}
                loading={googleLoading}
                onClick={handleGoogleSignInClick} // Use the new handler
              >
                {googleLoading ? "Connecting..." : "Continue with Google"}
              </Button>
            </Stack>

            <Text className={styles.signUpText}>
              Don&apos;t have an account?{" "}
              <Link href="/auth/signnup" className={styles.signUpLink}>
                Sign up
              </Link>
            </Text>
          </Box>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
