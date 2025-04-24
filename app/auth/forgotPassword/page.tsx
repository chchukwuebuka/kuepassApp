"use client";

import { useState } from "react";
import {
  TextInput,
  Button,
  Text,
  Box,
  Title,
  Notification,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import Image from "next/image";
import { IconAt, IconArrowLeft, IconSend, IconX } from "@tabler/icons-react";
import styles from "./styles.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ForgotPassword = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      email: "",
    },
    validate: {
      email: (value) =>
        /^\S+@\S+$/.test(value) ? null : "Please enter a valid email address",
    },
  });

  const handleSubmit = async (values: { email: string }) => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://keupass-48c2ae65f897.herokuapp.com/api";
      console.log("Sending request to:", `${apiUrl}/password-reset/`);
      console.log("Request body:", JSON.stringify({ email: values.email }));

      const response = await fetch(`${apiUrl}/password-reset/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Origin: window.location.origin,
        },
        body: JSON.stringify({
          email: values.email,
        }),
        credentials: "include",
      });

      console.log("Response status:", response.status);
      if (response.status === 500) {
        setError("Server error. Please contact support or try again later.");
        return;
      }

      let data;
      try {
        data = await response.json();
        console.log("Response data:", data);
      } catch (jsonError) {
        console.error("Error parsing JSON response:", jsonError);
        setError("Invalid response from server. Please try again.");
        return;
      }

      if (response.ok) {
        // Show success message and redirect to verification page
        router.push(
          `/auth/verifyemail?email=${encodeURIComponent(
            values.email
          )}&mode=reset`
        );
      } else {
        // Show error from API
        setError(
          data.message ||
            data.detail ||
            "Failed to send verification code. Please try again."
        );
      }
    } catch (err) {
      console.error("Error sending verification code:", err);
      if (err instanceof Error) {
        console.error("Error details:", {
          name: err.name,
          message: err.message,
          stack: err.stack,
        });
      }
      setError("Network error. Please check your connection and try again.");
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
          <Title className={styles.welcomeTitle}>Password Recovery</Title>
          <Text className={styles.welcomeSubtitle}>
            We&apos;ll help you get back into your account
          </Text>
        </div>
        <Image
          src="/images/clubDance.png"
          alt="Password reset background"
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
            <Title className={styles.title}>Reset Password</Title>
            <Text className={styles.subtitle}>
              Enter your email address and we&apos;ll send you a verification
              code
            </Text>
          </div>

          {error && (
            <Notification
              color="red"
              onClose={() => setError(null)}
              className={styles.notification}
              withCloseButton
              icon={<IconX size={18} />}
            >
              {error}
            </Notification>
          )}

          <Box className={styles.formWrapper}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
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
                description="We'll send a verification code to this email"
              />

              <Button
                type="submit"
                fullWidth
                className={styles.submitButton}
                loading={loading}
                rightSection={!loading && <IconSend size={18} />}
              >
                {loading ? "Sending..." : "Send Verification Code"}
              </Button>

              <Text className={styles.signInText}>
                Remember your password?{" "}
                <Link href="/auth/signin" className={styles.signInLink}>
                  Sign In
                </Link>
              </Text>
            </form>
          </Box>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
