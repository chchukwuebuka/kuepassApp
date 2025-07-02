

"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Button,
  Text,
  Box,
  Title,
  Notification,
  PasswordInput,
  TextInput,
  Loader,
  Center,
} from "@mantine/core";
import Image from "next/image";
import { IconArrowLeft, IconCheck, IconX, IconLock } from "@tabler/icons-react";
import styles from "./styles.module.css";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyEmail } from "@/app/services/api";
// --- NEW: Import safeFetch for consistent API calls ---
import { setAuthToken, setUserData, safeFetch } from "@/app/services/auth";
import type { UserData } from "@/app/services/auth";
import { useDispatch } from "react-redux";
import { login } from "@/store/store";
import type { User } from "@/store/store";
import { useForm } from "@mantine/form";

const VerifyEmail = () => {
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  const form = useForm({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
      verificationCode: "",
    },
    validate: {
      newPassword: (value) =>
        value.length >= 8
          ? null
          : "Password must be at least 8 characters long",
      confirmPassword: (value, values) =>
        value === values.newPassword ? null : "Passwords do not match",
      verificationCode: (value) =>
        value.length > 0 ? null : "Verification code is required",
    },
  });

  // This useEffect correctly determines the page's mode (no changes needed)
  useEffect(() => {
    const email = searchParams.get("email");
    const uidb64 = searchParams.get("uidb64");
    const token = searchParams.get("token");
    const mode = searchParams.get("mode");

    if (email && mode === "reset") {
      setIsPasswordReset(true);
    } else if (uidb64 && token) {
      handleVerifyEmail(uidb64, token);
    }
  }, [searchParams]);

  // The original email verification logic (no changes needed)
  const handleVerifyEmail = async (uidb64: string, token: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await verifyEmail({ uidb64, token });
      if (response.success) {
        setVerified(true);
        setSuccess("Your email has been successfully verified!");
        let userData: UserData | undefined;
        if (response.data) {
          const { tokens, user } = response.data;
          if (tokens?.access) {
            setAuthToken(tokens.access);
          }
          if (user && user.email) {
            userData = { ...user } as UserData;
          }
        } else if (response.token) {
          setAuthToken(response.token);
          if (response.user && response.user.email) {
            userData = { ...response.user } as UserData;
          }
        }
        if (userData && userData.email) {
          setUserData(userData);
          const user: User = {
            name: userData.name || "",
            username: userData.username || "",
            email: userData.email || "",
            profilePicture: userData.profile_url || "/images/avatar.png",
          };
          dispatch(login(user));
        }
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        setError(
          response.message || "Failed to verify email. Please try again."
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Verification failed.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (values: {
    newPassword: string;
    verificationCode: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const email = searchParams.get("email");
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://keupass-48c2ae65f897.herokuapp.com/api";

      if (!email) {
        setError("Email address is missing from URL. Please start over.");
        setLoading(false);
        return;
      }

      // --- THIS IS THE FINAL FIX ---
      // Change the URL here to match your urls.py file
      await safeFetch(`${apiUrl}/password-reset/confirm/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code: values.verificationCode, // Use 'code' to match your serializer
          new_password: values.newPassword,
        }),
      });

      // If safeFetch succeeds, show the success state
      setVerified(true);
      setSuccess("Your password has been successfully reset!");
      setTimeout(() => {
        router.push("/auth/signin");
      }, 2000);
    } catch (error: any) {
      console.error("Error resetting password:", error);
      setError(error.message || "An unknown error occurred.");
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
          <Title className={styles.welcomeTitle}>
            {isPasswordReset ? "Reset Password" : "Verify Your Email"}
          </Title>
          <Text className={styles.welcomeSubtitle}>
            {isPasswordReset
              ? "Enter your new password"
              : "One last step to secure your account"}
          </Text>
        </div>
        <Image
          src="/images/clubDance.png"
          alt="Verification background"
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
            onClick={() => router.push("/auth/signin")}
            leftSection={<IconArrowLeft size={18} />}
          >
            Back to Sign In
          </Button>

          <div className={styles.formHeader}>
            <Title className={styles.title}>
              {isPasswordReset ? "Set New Password" : "Email Verification"}
            </Title>
            <Text className={styles.subtitle}>
              {loading
                ? isPasswordReset
                  ? "Resetting your password..."
                  : "Verifying your email..."
                : verified
                ? isPasswordReset
                  ? "Your password has been reset!"
                  : "Your email has been verified!"
                : isPasswordReset
                ? "Enter the verification code sent to your email and your new password"
                : "Check your email for a verification link to verify your account."}
            </Text>
          </div>

          {error && (
            <Notification
              color="red"
              onClose={() => setError(null)}
              className={styles.notification}
              withCloseButton
              icon={<IconX size={20} />}
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
              icon={<IconCheck size={20} />}
            >
              {success}
            </Notification>
          )}

          <Box className={styles.formWrapper}>
            {verified ? (
              <div className={styles.successContainer}>
                <div className={styles.successIconWrapper}>
                  <IconCheck size={40} className={styles.successIcon} />
                </div>
                <Title order={2} className={styles.successTitle}>
                  {isPasswordReset ? "Password Reset!" : "Email Verified!"}
                </Title>
                <Text className={styles.successText}>
                  {isPasswordReset
                    ? "Your password has been successfully reset."
                    : "Your email has been successfully verified."}
                </Text>
                <Text className={styles.successSubtext}>
                  You will be redirected to continue...
                </Text>
              </div>
            ) : loading ? (
              <Center style={{ padding: "2rem" }}>
                <Loader size="lg" />
              </Center>
            ) : isPasswordReset ? (
              <form onSubmit={form.onSubmit(handlePasswordReset)}>
                <TextInput
                  label="Verification Code"
                  placeholder="Enter verification code from email"
                  leftSection={
                    <IconLock size={18} className={styles.inputIcon} />
                  }
                  {...form.getInputProps("verificationCode")}
                  className={styles.input}
                  classNames={{
                    input: styles.inputField,
                    label: styles.inputLabel,
                    error: styles.inputError,
                    wrapper: styles.inputWrapper,
                  }}
                  description="Enter the 6-digit code sent to your email"
                />

                <PasswordInput
                  label="New Password"
                  placeholder="Enter new password"
                  leftSection={
                    <IconLock size={18} className={styles.inputIcon} />
                  }
                  {...form.getInputProps("newPassword")}
                  className={styles.input}
                  classNames={{
                    input: styles.inputField,
                    label: styles.inputLabel,
                    error: styles.inputError,
                    wrapper: styles.inputWrapper,
                  }}
                  description="Password must be at least 8 characters long"
                />

                <PasswordInput
                  label="Confirm New Password"
                  placeholder="Confirm new password"
                  leftSection={
                    <IconLock size={18} className={styles.inputIcon} />
                  }
                  {...form.getInputProps("confirmPassword")}
                  className={styles.input}
                  classNames={{
                    input: styles.inputField,
                    label: styles.inputLabel,
                    error: styles.inputError,
                    wrapper: styles.inputWrapper,
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  className={styles.submitButton}
                  loading={loading}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            ) : (
              <div className={styles.instructionsContainer}>
                <Text ta="center" mb="xl">
                  We've sent a verification link to your email address. Please
                  check your inbox and click on the link to verify your account.
                </Text>
                <Button
                  onClick={() => router.push("/auth/signin")}
                  className={styles.submitButton}
                >
                  Go to Sign In
                </Button>
              </div>
            )}
          </Box>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
