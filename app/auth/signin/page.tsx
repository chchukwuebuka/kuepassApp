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
import { useAppDispatch } from "@/store/store";
import { login } from "@/store/store";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/app/services/api";
import { setAuthToken, setUserData } from "@/app/services/auth";
import { jwtDecode } from "jwt-decode"; // Add jwt-decode for token parsing
import { useGoogleLogin } from "@react-oauth/google";

interface JwtPayload {
  user_id: number;
  username: string;
  phone_number: string;
  exp: number;
  iat: number;
  jti: string;
  token_type: string;
}

const SignIn: React.FC = () => {
  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (value) =>
        /^\S+@\S+$/.test(value) ? null : "Please enter a valid email address",
      password: (value) =>
        value.length >= 6 ? null : "Password must be at least 6 characters",
    },
  });

  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);

  // Check for registered=true parameter
  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccess(
        "Account created successfully! Please sign in with your new credentials."
      );
    }
  }, [searchParams]);

  /**
   * Function to handle Google login API call
   * @param {string} accessToken - The access token received from Google OAuth
   */
  async function handleGoogleLogin(accessToken: string) {
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://keupass-48c2ae65f897.herokuapp.com/api";

      // Use the working Google login endpoint
      const response = await fetch(`${apiUrl}/google-login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: accessToken, // This is the key - access_token needs to be named exactly like this
        }),
      });

      const data = await response.json();
      console.log("Google login response:", data);

      if (data.success) {
        // Login successful - save tokens using your auth utilities
        if (data.data?.tokens?.access) {
          setAuthToken(data.data.tokens.access);
        }

        if (data.data?.user) {
          // Prioritize Google profile picture if available
          const googleProfilePicture =
            data.data.user.picture ||
            data.data.user.image ||
            data.data.user.profile_url ||
            null;

          console.log("Google profile picture found:", googleProfilePicture);

          // Use a default image if none is provided
          const profileImage = googleProfilePicture || "/images/avatar.png";

          const userData = {
            // For username, use existing username if available, otherwise use email or Google name
            username:
              data.data.user.username ||
              data.data.user.email?.split("@")[0] ||
              "",
            email: data.data.user.email || "",
            name: data.data.user.name || data.data.user.username || "",
            // Prioritize Google profile picture
            profilePicture: profileImage,
            profile_url: googleProfilePicture || undefined,
            phone_number: data.data.user.phone_number,
          };

          console.log("Setting user data with profile:", userData);
          setUserData(userData);

          // Dispatch to Redux store with complete user profile
          dispatch(
            login({
              name: userData.name,
              username: userData.username,
              email: userData.email || "",
              // Ensure profile picture is set
              profilePicture: profileImage,
              profile_url: googleProfilePicture || undefined,
              phone_number: userData.phone_number,
              active: data.data.user.active,
            })
          );
        }

        // Redirect to profile page instead of homepage
        router.push("/profile/profile");
        return data.data;
      } else {
        // Handle error
        throw new Error(data.message || "Google login failed");
      }
    } catch (error) {
      console.error("Error during Google login:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Google sign-in failed. Please try again."
      );
      setGoogleLoading(false);
      throw error;
    }
  }

  // Google login hook at component level
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Get the access token from Google
        const { access_token } = tokenResponse;

        // Call the function to handle Google login
        await handleGoogleLogin(access_token);
      } catch {
        // Error is already handled in handleGoogleLogin
      }
    },
    onError: (errorResponse) => {
      console.error("Google login error:", errorResponse);
      setError("Google authentication failed. Please try again.");
      setGoogleLoading(false);
    },
  });

  // Handle Google login button click
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);

    try {
      // Trigger the Google login popup
      googleLogin();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Google sign-in failed. Please try again.";
      setError(errorMessage);
      console.error("Error during Google signup:", err);
      setGoogleLoading(false);
    }
  };

  const handleSignIn = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Sending login request with:", {
        email: values.email,
        password: `XXXX (length: ${values.password.length})`,
      });

      const response = await signIn({
        email: values.email,
        password: values.password,
      });

      console.log("Login response:", response);

      // Check if the response follows the success format
      if (response.success === true && response.data) {
        // Check if tokens exist in response.data
        const tokens = response.data.tokens;
        const user = response.data.user;

        if (tokens?.access) {
          // Store the JWT token
          const token = tokens.access;
          setAuthToken(token);

          let userData;

          // If user data is available in the response
          if (user) {
            // Get profile picture if available
            const profilePicture =
              user.profilePicture || user.profile_url || null;

            console.log("Profile picture from API:", profilePicture);

            // Set default if not provided
            const profileImage = profilePicture || "/images/avatar.png";

            userData = {
              username: user.username || values.email.split("@")[0],
              email: user.email || values.email,
              name: user.name || user.username || values.email.split("@")[0],
              profilePicture: profileImage,
              profile_url: profilePicture,
              phone_number: user.phone_number,
            };
          } else {
            // Try to extract data from JWT
            try {
              const decoded: JwtPayload = jwtDecode(token);
              userData = {
                username: decoded.username || values.email.split("@")[0],
                email: values.email,
                name: decoded.username || values.email.split("@")[0],
                profilePicture: "/images/avatar.png",
                profile_url: undefined,
                phone_number: decoded.phone_number,
              };
            } catch (decodeError) {
              console.error("Failed to decode JWT:", decodeError);
              // Fallback to basic user data
              userData = {
                username: values.email.split("@")[0],
                email: values.email,
                name: values.email.split("@")[0],
                profilePicture: "/images/avatar.png",
                profile_url: undefined,
              };
            }
          }

          console.log("Setting user data:", userData);
          setUserData(userData);

          // Update Redux store
          dispatch(
            login({
              username: userData.username,
              email: userData.email,
              name: userData.name || "",
              profilePicture: userData.profilePicture,
              profile_url: userData.profile_url,
              phone_number: userData.phone_number,
              active: user?.active,
            })
          );

          router.push("/profile/profile"); // Redirect to profile page
        } else {
          console.error("No access token in response:", response);
          setError("Login successful but no access token was provided.");
        }
      } else {
        console.error("Unexpected login response format:", response);
        setError(
          response.message || "Login failed. Unexpected response from server."
        );
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message.includes("401")
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
      {/* Left Column with Image */}
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

      {/* Right Column with Form */}
      <div className={styles.rightColumn}>
        <div className={styles.formContainer}>
          <Button
            variant="subtle"
            className={styles.goBackButton}
            onClick={() => router.back()}
            leftSection={<IconArrowLeft size={18} />}
          >
            Go Back
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
            <form onSubmit={form.onSubmit(handleSignIn)}>
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
              <Button
                variant="outline"
                fullWidth
                className={styles.socialButton}
                leftSection={!googleLoading && <IconBrandGoogle size={18} />}
                loading={googleLoading}
                onClick={handleGoogleSignIn}
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
