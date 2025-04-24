"use client";

import { useState } from "react";
import {
  PasswordInput,
  Button,
  Text,
  Notification,
  Box,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import Image from "next/image";
import { IconLock, IconArrowLeft, IconCheck, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { verifyAndResetPassword } from "@/app/services/api";
import styles from "../../../signin/styles.module.css"; // Reusing signin styles

interface ResetPasswordPageProps {
  params: {
    uidb64: string;
    token: string;
  };
}

const ResetPassword = ({ params }: ResetPasswordPageProps) => {
  const { uidb64, token } = params;

  const form = useForm({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validate: {
      password: (value) =>
        value.length >= 6 ? null : "Password must be at least 6 characters",
      confirmPassword: (value, values) =>
        value === values.password ? null : "Passwords do not match",
    },
  });

  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [tokenValid, setTokenValid] = useState<boolean>(true);

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Call the API to reset password using the URL parameters
      const response = await verifyAndResetPassword({
        uidb64,
        token,
        password: values.password,
      });

      if (response.success) {
        setSuccess("Your password has been reset successfully.");
        form.reset();
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          router.push("/auth/signin");
        }, 3000);
      } else {
        setError(
          response.message || "Failed to reset password. Please try again."
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to reset password. Please try again.";
      setError(errorMessage);
      setTokenValid(false);
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.rightColumn} style={{ width: "100%" }}>
          <div className={styles.formContainer}>
            <Notification color="red" className={styles.notification}>
              Invalid or expired password reset link. Please request a new one.
            </Notification>
            <Button
              component={Link}
              href="/auth/forgot-password"
              fullWidth
              className={styles.submitButton}
            >
              Request New Reset Link
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* Left Column with Image */}
      <div className={styles.leftColumn}>
        <div className={styles.overlay}></div>
        <div className={styles.welcomeTextOverlay}>
          <Title className={styles.welcomeTitle}>New Password</Title>
          <Text className={styles.welcomeSubtitle}>
            Create a strong password for your account
          </Text>
        </div>
        <Image
          src="/images/clubDance.png"
          alt="Reset password background"
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
            component={Link}
            href="/auth/signin"
            leftSection={<IconArrowLeft size={18} />}
          >
            Back to Sign In
          </Button>

          <div className={styles.formHeader}>
            <Title className={styles.title}>Reset Password</Title>
            <Text className={styles.subtitle}>
              Enter your new password below
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
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <PasswordInput
                label="New Password"
                placeholder="Enter your new password"
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

              <PasswordInput
                label="Confirm Password"
                placeholder="Confirm your new password"
                leftSection={
                  <IconLock size={18} className={styles.inputIcon} />
                }
                {...form.getInputProps("confirmPassword")}
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

              <Button
                type="submit"
                fullWidth
                className={styles.submitButton}
                loading={loading}
                loaderProps={{ size: "sm" }}
              >
                {loading ? "Resetting Password..." : "Reset Password"}
              </Button>
            </form>
          </Box>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
