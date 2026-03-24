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
  IconCheck,
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
  const [passwordRequirements, setPasswordRequirements] = useState({
    hasNumber: false,
    hasUppercase: false,
    hasLowercase: false,
    hasSpecialChar: false,
  });

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccess("Account created! Please sign in.");
    }
  }, [searchParams]);

  // Check password requirements as user types
  useEffect(() => {
    const password = form.values.password;
    if (password) {
      setPasswordRequirements({
        hasNumber: /\d/.test(password),
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      });
    } else {
      setPasswordRequirements({
        hasNumber: false,
        hasUppercase: false,
        hasLowercase: false,
        hasSpecialChar: false,
      });
    }
  }, [form.values.password]);

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

      // Prioritize Google profile picture if available (check multiple possible fields)
      const profilePicture =
        (backendApiUser as any).picture ||
        (backendApiUser as any).image ||
        backendApiUser.profile_url ||
        undefined;

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
        profile_url: profilePicture || undefined, // Use profile picture from any available field
        phone_number: backendApiUser.phone_number || undefined,
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
      // Fetch Google profile info to get the profile picture
      let googleProfilePicture: string | undefined;
      try {
        const googleUserInfoResponse = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${googleAccessToken}` },
          }
        );
        if (googleUserInfoResponse.ok) {
          const googleUserInfo = await googleUserInfoResponse.json();
          console.log("Google userinfo:", googleUserInfo);
          googleProfilePicture = googleUserInfo.picture || undefined;
        }
      } catch (googleInfoErr) {
        console.warn("Could not fetch Google profile info:", googleInfoErr);
      }

      const API_BASE_URL = (
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        "https://api.kuepass.com/api/"
      ).replace(/\/$/, "");

      const response = await fetch(`${API_BASE_URL}/google-login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: googleAccessToken }),
      });

      // Try to parse JSON; if it fails, surface a clear error
      const text = await response.text();
      let backendAuthResponse: AuthResponse;
      try {
        backendAuthResponse = JSON.parse(text);
      } catch {
        throw new Error(
          `Unexpected response from server (status ${response.status}).`
        );
      }
      console.log("Google login backend response:", backendAuthResponse);

      if (!response.ok) {
        throw new Error(
          backendAuthResponse.message ||
            backendAuthResponse.detail ||
            "Google login backend processing failed"
        );
      }

      // Inject Google profile picture into the backend response if backend didn't provide one
      if (
        googleProfilePicture &&
        backendAuthResponse.data?.user &&
        !backendAuthResponse.data.user.profile_url &&
        !(backendAuthResponse.data.user as any).picture &&
        !(backendAuthResponse.data.user as any).image
      ) {
        (backendAuthResponse.data.user as any).picture = googleProfilePicture;
      }

      // Use the common processing function
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
      {/* Left Column: Form */}
      <div className={styles.leftColumn}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <Title className={styles.title}>
              Kuepass helps your events run smoothly
            </Title>
            <Text className={styles.subtitle}>
              Login to your kuepass account
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
                label="Email"
                placeholder=""
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
                  placeholder=""
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
                {form.values.password && (
                  <div className={styles.passwordRequirements}>
                    <div
                      className={`${styles.requirementItem} ${
                        passwordRequirements.hasNumber
                          ? styles.requirementMet
                          : styles.requirementUnmet
                      }`}
                    >
                      <IconCheck size={16} className={styles.requirementIcon} />
                      <span className={styles.requirementText}>Number</span>
                    </div>
                    <div
                      className={`${styles.requirementItem} ${
                        passwordRequirements.hasUppercase
                          ? styles.requirementMet
                          : styles.requirementUnmet
                      }`}
                    >
                      <IconCheck size={16} className={styles.requirementIcon} />
                      <span className={styles.requirementText}>uppercase</span>
                    </div>
                    <div
                      className={`${styles.requirementItem} ${
                        passwordRequirements.hasLowercase
                          ? styles.requirementMet
                          : styles.requirementUnmet
                      }`}
                    >
                      <IconCheck size={16} className={styles.requirementIcon} />
                      <span className={styles.requirementText}>lowercase</span>
                    </div>
                    <div
                      className={`${styles.requirementItem} ${
                        passwordRequirements.hasSpecialChar
                          ? styles.requirementMet
                          : styles.requirementUnmet
                      }`}
                    >
                      <IconCheck size={16} className={styles.requirementIcon} />
                      <span className={styles.requirementText}>
                        Special character
                      </span>
                    </div>
                  </div>
                )}
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
              <span className={styles.dividerText}>Or</span>
            </div>

            <Stack gap="md" className={styles.socialStack}>
              <Button
                variant="default"
                fullWidth
                className={styles.socialButton}
                leftSection={!googleLoading && <IconBrandGoogle size={18} />}
                loading={googleLoading}
                onClick={handleGoogleSignInClick}
              >
                {googleLoading ? "Connecting..." : "Sign in with Google"}
              </Button>
              {/* Apple Sign In would go here */}
            </Stack>

            <Text className={styles.footerText}>
              by continuing you are agreeing to kuepass{" "}
              <Link href="/terms" className={styles.footerLink}>
                terms of service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className={styles.footerLink}>
                privacy
              </Link>
            </Text>

            <Text className={styles.signUpText}>
              Don&apos;t have an account?{" "}
              <Link href="/auth/signnup" className={styles.signUpLink}>
                Sign up
              </Link>
            </Text>
          </Box>
        </div>
      </div>

      {/* Right Column: Image */}
      <div className={styles.rightColumn}>
        <Image
          src="/images/signimage.png"
          alt="Sign in background"
          fill
          className={styles.image}
          priority
        />
      </div>
    </div>
  );
};

export default SignIn;
