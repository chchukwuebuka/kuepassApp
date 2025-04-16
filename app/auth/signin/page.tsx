"use client"

import type React from "react"

import { useState } from "react"
import { TextInput, PasswordInput, Button, Text, Stack, Notification, Box, Title } from "@mantine/core"
import { useForm } from "@mantine/form"
import Image from "next/image"
import { IconAt, IconArrowLeft, IconLock, IconBrandGoogle } from "@tabler/icons-react"
import styles from "./styles.module.css"
import Link from "next/link"
import { useDispatch } from "react-redux"
import { login } from "@/store/store" // Adjust the path as necessary
import { useRouter } from "next/navigation"

const SignIn: React.FC = () => {
  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Please enter a valid email address"),
      password: (value) => (value.length >= 6 ? null : "Password must be at least 6 characters"),
    },
  })

  const dispatch = useDispatch()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const handleSignIn = async (values: typeof form.values) => {
    setLoading(true)
    setError(null)
    try {
      // Replace this with your actual authentication logic
      // For demonstration, we'll mock a successful sign-in
      const mockUser = {
        name: "John Doe",
        email: values.email,
        profilePicture: "/images/avatar.png", // Ensure this image exists
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      dispatch(login(mockUser))
      router.push("/") // Redirect to home page after sign-in
    } catch {
      setError("Failed to sign in. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.pageContainer}>
      {/* Left Column with Image */}
      <div className={styles.leftColumn}>
        <div className={styles.overlay}></div>
        <div className={styles.welcomeTextOverlay}>
          <Title className={styles.welcomeTitle}>Welcome Back</Title>
          <Text className={styles.welcomeSubtitle}>We&apos;re excited to see you again</Text>
        </div>
        <Image src="/images/clubDance.png" alt="Sign in background" fill className={styles.image} priority />
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
            <Text className={styles.subtitle}>Log in to your account to continue your journey</Text>
          </div>

          {error && (
            <Notification color="red" onClose={() => setError(null)} className={styles.notification} withCloseButton>
              {error}
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
                  leftSection={<IconLock size={18} className={styles.inputIcon} />}
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
                  <Link href="/auth/forgotPassword" className={styles.forgotPassword}>
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

            <Stack spacing="md">
              <Button
                variant="outline"
                fullWidth
                className={styles.socialButton}
                leftSection={<IconBrandGoogle size={18} />}
              >
                Continue with Google
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
  )
}

export default SignIn
