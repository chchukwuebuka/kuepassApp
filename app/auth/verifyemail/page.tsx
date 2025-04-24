"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button, Text, Box, Title, Notification } from "@mantine/core";
import Image from "next/image";
import { IconArrowLeft, IconCheck, IconX } from "@tabler/icons-react";
import styles from "./styles.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { verifyEmail } from "@/app/services/api";
import { setAuthToken, setUserData } from "@/app/services/auth";
import { useDispatch } from "react-redux";
import { login } from "@/store/store"; // Adjust the path as necessary

const VerifyEmail = () => {
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const dispatch = useDispatch();

  // Get URL params if any
  useEffect(() => {
    // The email verification happens via a link sent to email
    // which would have URL parameters like /email-verify/{uidb64}/{token}/
    // If the current URL has these parameters, verify the email automatically
    const urlParams = new URLSearchParams(window.location.search);
    const uidb64 = urlParams.get("uidb64");
    const token = urlParams.get("token");

    if (uidb64 && token) {
      handleVerifyEmail(uidb64, token);
    }
  }, []);

  const handleVerifyEmail = async (uidb64: string, token: string) => {
    setLoading(true);
    setError(null);

    try {
      // Call API to verify the email with token
      const response = await verifyEmail({
        uidb64,
        token,
      });

      if (response.success) {
        // Show success state
        setVerified(true);
        setSuccess("Your email has been successfully verified!");

        // If the API returns token and user data after verification
        if (response.token) {
          setAuthToken(response.token);
        }

        if (response.user) {
          setUserData(response.user);

          // Create a properly typed user object for Redux
          const user = {
            name: response.user.name || "", // Default if undefined
            email: response.user.email,
            profilePicture:
              response.user.profilePicture || "/images/avatar.png", // Default avatar
          };

          dispatch(login(user));
        }

        // Redirect after a delay
        setTimeout(() => {
          router.push("/"); // Redirect to home page
        }, 2000);
      } else {
        setError(
          response.message || "Failed to verify email. Please try again."
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Verification failed. Please try again.";
      setError(errorMessage);
      console.error("Error verifying email:", err);
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
          <Title className={styles.welcomeTitle}>Verify Your Email</Title>
          <Text className={styles.welcomeSubtitle}>
            One last step to secure your account
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
            <Title className={styles.title}>Email Verification</Title>
            <Text className={styles.subtitle}>
              {loading
                ? "Verifying your email..."
                : verified
                ? "Your email has been verified!"
                : "Check your email for a verification link. Click the link to verify your account."}
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
                  Email Verified!
                </Title>
                <Text className={styles.successText}>
                  Your email has been successfully verified.
                </Text>
                <Text className={styles.successSubtext}>
                  You will be redirected to continue...
                </Text>
              </div>
            ) : loading ? (
              <div className={styles.loadingContainer}>
                <Text ta="center">Verifying your email address...</Text>
                <Button loading className={styles.loadingButton}>
                  Verifying
                </Button>
              </div>
            ) : error ? (
              <div className={styles.errorContainer}>
                <Text ta="center" color="red" mb="md">
                  {error}
                </Text>
                <Button
                  onClick={() => router.push("/auth/signnup")}
                  className={styles.submitButton}
                >
                  Back to Sign Up
                </Button>
              </div>
            ) : (
              <div className={styles.instructionsContainer}>
                <Text ta="center" mb="xl">
                  We&apos;ve sent a verification link to your email address.
                  Please check your inbox and click on the link to verify your
                  account.
                </Text>
                <Button
                  onClick={() => router.push("/auth/signin")}
                  className={styles.submitButton}
                >
                  Go to Sign In
                </Button>
                <Text className={styles.signUpText} ta="center" mt="xl">
                  Didn&apos;t receive the email?{" "}
                  <Link href="/auth/signnup" className={styles.signUpLink}>
                    Try signing up again
                  </Link>
                </Text>
              </div>
            )}
          </Box>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
