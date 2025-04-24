"use client";

import { useState, useRef } from "react";
import {
  TextInput,
  PasswordInput,
  Button,
  Text,
  Box,
  Title,
  Divider,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import Image from "next/image";
import {
  IconAt,
  IconArrowLeft,
  IconUser,
  IconPhone,
  IconLock,
  IconCheck,
  IconBrandGoogle,
} from "@tabler/icons-react";
import styles from "./styles.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/app/services/api";
import { setAuthToken, setUserData } from "@/app/services/auth";
import { useDispatch } from "react-redux";
import { login } from "@/store/store"; // Adjust the path as necessary
import { useGoogleLogin } from "@react-oauth/google";

const SignUp = () => {
  const router = useRouter();
  const form = useForm({
    initialValues: {
      username: "",
      email: "",
      number: "",
      password: "",
    },
    validate: {
      email: (value) =>
        /^\S+@\S+$/.test(value) ? null : "Please enter a valid email address",
      password: (value) =>
        value.length >= 8 ? null : "Password must be at least 8 characters",
      username: (value) => {
        if (!value.trim()) return "Username is required";
        if (value.length > 150)
          return "Username must be 150 characters or fewer";
        return null;
      },
      number: (value) =>
        !value || /^[0-9]{10,15}$/.test(value)
          ? null
          : "Please enter a valid phone number",
    },
  });

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imgSrc, setImgSrc] = useState<string>("/images/avatar.png");
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dispatch = useDispatch();

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
            // Set profile picture
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImgSrc(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    setImgFile(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);

    try {
      let profileImageUrl = "";

      // Upload profile image if selected
      if (imgFile) {
        setUploading(true);
        try {
          const formData = new FormData();
          formData.append("file", imgFile);

          const apiUrl =
            process.env.NEXT_PUBLIC_API_URL ||
            "https://keupass-48c2ae65f897.herokuapp.com/api";

          const imageResponse = await fetch(`${apiUrl}/upload/image`, {
            method: "POST",
            body: formData,
          });

          if (imageResponse.ok) {
            const imageData = await imageResponse.json();
            profileImageUrl = imageData.url;
          } else {
            console.error(
              "Failed to upload image:",
              await imageResponse.text()
            );
            // Continue with signup even if image upload fails
          }
        } catch (error) {
          console.error("Error uploading image:", error);
          // Continue with signup even if image upload fails
        } finally {
          setUploading(false);
        }
      }

      // Call the API service to register the user
      const response = await signUp({
        username: values.username,
        email: values.email,
        password: values.password,
        phone_number: values.number,
        profile_url: profileImageUrl || undefined,
      });

      if (response.success) {
        let userData;

        // Handle new response structure
        if (response.data) {
          const { tokens, user } = response.data;

          // Store the JWT token if available
          if (tokens?.access) {
            setAuthToken(tokens.access);
          }

          if (user) {
            userData = {
              ...user,
              // Use username from form input
              username: values.username,
              // Handle profile picture with both possible field names
              profilePicture:
                profileImageUrl || user.profile_url || "/images/avatar.png",
              profile_url: profileImageUrl || user.profile_url,
            };
          }
        }
        // Handle legacy response structure for backward compatibility
        else if (response.token) {
          setAuthToken(response.token);

          if (response.user) {
            userData = {
              ...response.user,
              // Use username from form input
              username: values.username,
              profilePicture: profileImageUrl || "/images/avatar.png",
              profile_url: profileImageUrl,
            };
          }
        }

        if (userData) {
          setUserData(userData);

          // Also dispatch to Redux store for immediate UI update
          const user = {
            name: userData.name || values.username,
            username: userData.username || "",
            email: userData.email || "",
            profilePicture: userData.profilePicture || "/images/avatar.png",
            profile_url: userData.profile_url,
            phone_number: values.number,
          };
          dispatch(login(user));
        }

        // Use the appropriate approach for Next.js router
        router.push("/auth/signin?registered=true");
      } else {
        setError(
          response.message || "Failed to create account. Please try again."
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred during sign up. Please try again.";
      setError(errorMessage);
      console.error("Error during signup:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
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

  return (
    <div className={styles.pageContainer}>
      {/* Left Column with Image - hidden on mobile */}
      <div className={styles.leftColumn}>
        <div className={styles.overlay}></div>
        <div className={styles.welcomeTextOverlay}>
          <Title className={styles.welcomeTitle}>Join Our Community</Title>
          <Text className={styles.welcomeSubtitle}>
            Discover amazing events around you
          </Text>
        </div>
        <Image
          src="/images/clubDance.png"
          alt="Sign up background"
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
            onClick={() => router.push("/")}
            leftSection={<IconArrowLeft size={18} />}
          >
            Home
          </Button>

          <div className={styles.formHeader}>
            <Title className={styles.title}>Create Account</Title>
            <Text className={styles.subtitle}>
              Join us to discover amazing events around you
            </Text>
          </div>

          {error && (
            <div className={styles.errorContainer}>
              <Text color="red" size="sm">
                {error}
              </Text>
            </div>
          )}

          <Box className={styles.formWrapper}>
            <Button
              fullWidth
              variant="outline"
              className={styles.googleButton}
              onClick={handleGoogleSignUp}
              loading={googleLoading}
              leftSection={!googleLoading && <IconBrandGoogle size={18} />}
            >
              {googleLoading ? "Connecting..." : "Continue with Google"}
            </Button>

            <Divider
              label="Or sign up with email"
              labelPosition="center"
              className={styles.divider}
            />

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <div className={styles.profileImageUpload}>
                <div className={styles.profileImageContainer}>
                  <Image
                    src={imgSrc}
                    alt="Profile"
                    width={80}
                    height={80}
                    className={styles.profileImage}
                  />
                  <button
                    type="button"
                    className={styles.uploadImageButton}
                    onClick={triggerFileInput}
                  >
                    {uploading ? "Uploading..." : "Choose Photo"}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                </div>
              </div>

              <TextInput
                label="Username"
                placeholder="Enter your username"
                leftSection={
                  <IconUser size={18} className={styles.inputIcon} />
                }
                {...form.getInputProps("username")}
                className={styles.input}
                classNames={{
                  input: styles.inputField,
                  label: styles.inputLabel,
                  error: styles.inputError,
                  wrapper: styles.inputWrapper,
                }}
                description="Use your preferred username"
              />

              <TextInput
                label="Email Address"
                placeholder="Enter your email address"
                leftSection={<IconAt size={18} className={styles.inputIcon} />}
                {...form.getInputProps("email")}
                className={styles.input}
                classNames={{
                  input: styles.inputField,
                  label: styles.inputLabel,
                  error: styles.inputError,
                  wrapper: styles.inputWrapper,
                }}
                description="We'll send a verification link to this email"
              />

              <TextInput
                label="Phone Number"
                type="tel"
                placeholder="Enter your phone number"
                leftSection={
                  <IconPhone size={18} className={styles.inputIcon} />
                }
                {...form.getInputProps("number")}
                className={styles.input}
                classNames={{
                  input: styles.inputField,
                  label: styles.inputLabel,
                  error: styles.inputError,
                  wrapper: styles.inputWrapper,
                }}
              />

              <PasswordInput
                label="Password"
                placeholder="Create a strong password"
                leftSection={
                  <IconLock size={18} className={styles.inputIcon} />
                }
                {...form.getInputProps("password")}
                className={styles.input}
                classNames={{
                  input: styles.inputField,
                  label: styles.inputLabel,
                  error: styles.inputError,
                  innerInput: styles.passwordInput,
                  wrapper: styles.inputWrapper,
                }}
                description="Must be at least 8 characters"
              />

              <div className={styles.termsContainer}>
                <Text size="sm" className={styles.termsText}>
                  By signing up, you agree to our{" "}
                  <Link href="/terms" className={styles.termsLink}>
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className={styles.termsLink}>
                    Privacy Policy
                  </Link>
                </Text>
              </div>

              <Button
                type="submit"
                fullWidth
                className={styles.submitButton}
                loading={loading}
                rightSection={!loading && <IconCheck size={18} />}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <Text className={styles.signInText}>
              Already have an account?{" "}
              <Link href="/auth/signin" className={styles.signInLink}>
                Sign In
              </Link>
            </Text>
          </Box>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
