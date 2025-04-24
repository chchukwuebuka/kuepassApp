"use client";

import type React from "react";

import { useState } from "react";
import {
  TextInput,
  Button,
  Text,
  Notification,
  Box,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import Image from "next/image";
import { IconAt, IconArrowLeft, IconCheck } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { requestPasswordReset } from "@/app/services/api";
import styles from "../signin/styles.module.css"; // Reusing signin styles

const ForgotPassword: React.FC = () => {
  const form = useForm({
    initialValues: {
      email: "",
    },
    validate: {
      email: (value) =>
        /^\S+@\S+$/.test(value) ? null : "Please enter a valid email address",
    },
  });

  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Call the API with the form values
      const response = await requestPasswordReset({
        email: values.email,
      });

      if (response.success) {
        setSuccess(
          "Password reset instructions have been sent to your email. Please check your inbox."
        );
        form.reset();
      } else {
        setError(
          response.message || "Failed to process request. Please try again."
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to process request. Please try again.";
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
          <Title className={styles.welcomeTitle}>Reset Password</Title>
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
            <Title className={styles.title}>Forgot Password</Title>
            <Text className={styles.subtitle}>
              Enter your email and we&apos;ll send you a reset link
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
              icon={<IconCheck size={20} />}
            >
              {success}
            </Notification>
          )}

          <Box className={styles.formWrapper}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
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

              <Button
                type="submit"
                fullWidth
                className={styles.submitButton}
                loading={loading}
                loaderProps={{ size: "sm" }}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>

            <Text className={styles.signUpText}>
              Remember your password?{" "}
              <Link href="/auth/signin" className={styles.signUpLink}>
                Sign in
              </Link>
            </Text>
          </Box>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
