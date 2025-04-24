"use client";

import { useState } from "react";
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

const SignUp = () => {
  const router = useRouter();
  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      number: "",
      password: "",
    },
    validate: {
      email: (value) =>
        /^\S+@\S+$/.test(value) ? null : "Please enter a valid email address",
      password: (value) =>
        value.length >= 6 ? null : "Password must be at least 6 characters",
      name: (value) => (value.trim().length > 0 ? null : "Name is required"),
      number: (value) =>
        /^[0-9]{10,15}$/.test(value)
          ? null
          : "Please enter a valid phone number",
    },
  });

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);

    try {
      // Call the API service to register the user
      const response = await signUp({
        name: values.name,
        email: values.email,
        password: values.password,
        number: values.number,
        // Note: phone number is not included in the API interface,
        // you may need to update the API service to include it
      });

      if (response.success) {
        // Store authentication data if returned (may not be needed until after verification)
        if (response.token) {
          setAuthToken(response.token);
        }
        if (response.user) {
          setUserData(response.user);
        }

        // Use the appropriate approach for Next.js router
        router.push("/auth/verifyemail");
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
      // TODO: Implement Google OAuth integration with your API
      // This would typically redirect to a Google authentication page
      // and then handle the OAuth callback

      // For now, just simulate the process
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Google sign up would be processed here");

      // After successful OAuth, you would redirect
      router.push("/");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Google sign-in failed. Please try again.";
      setError(errorMessage);
      console.error("Error during Google signup:", err);
    } finally {
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
              <TextInput
                label="Full Name"
                placeholder="Enter your full name"
                leftSection={
                  <IconUser size={18} className={styles.inputIcon} />
                }
                {...form.getInputProps("name")}
                className={styles.input}
                classNames={{
                  input: styles.inputField,
                  label: styles.inputLabel,
                  error: styles.inputError,
                  wrapper: styles.inputWrapper,
                }}
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
                description="Must be at least 6 characters"
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
