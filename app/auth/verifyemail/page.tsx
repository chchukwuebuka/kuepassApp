"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button, Text, TextInput, Box, Title } from "@mantine/core"
import Image from "next/image"
import { IconArrowLeft, IconCheck } from "@tabler/icons-react"
import styles from "./styles.module.css"
import Link from "next/link"
import { useRouter } from "next/navigation"

const VerifyEmail = () => {
  const [otp, setOtp] = useState(["", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [verified, setVerified] = useState(false)
  const router = useRouter()

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Handle countdown for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleChange = (value: string, index: number) => {
    if (/^[0-9]*$/.test(value)) {
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)

      // Auto-focus next input
      if (value && index < 3) {
        inputRefs.current[index + 1]?.focus()
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }

    // Handle arrow keys
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === "ArrowRight" && index < 3) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text")
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.slice(0, 4).split("")
      const newOtp = [...otp]

      digits.forEach((digit, index) => {
        if (index < 4) {
          newOtp[index] = digit
        }
      })

      setOtp(newOtp)

      // Focus the appropriate input after paste
      if (digits.length < 4) {
        inputRefs.current[digits.length]?.focus()
      } else {
        inputRefs.current[3]?.focus()
      }
    }
  }

  const handleSubmit = async () => {
    if (otp.join("").length !== 4) return

    setLoading(true)
    try {
      // Here, you would verify the OTP with the backend
      console.log("OTP submitted:", otp.join(""))

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Show success state
      setVerified(true)

      // Redirect after a delay
      setTimeout(() => {
        router.push("/auth/success") // Example route for successful verification
      }, 2000)
    } catch (error) {
      console.error("Error verifying OTP:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setResendLoading(true)
    try {
      // Simulate API call to resend OTP
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Reset OTP fields
      setOtp(["", "", "", ""])

      // Focus first input
      inputRefs.current[0]?.focus()

      // Start countdown
      setCountdown(60)
    } catch (error) {
      console.error("Error resending OTP:", error)
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className={styles.pageContainer}>
      {/* Left Column with Image */}
      <div className={styles.leftColumn}>
        <div className={styles.overlay}></div>
        <div className={styles.welcomeTextOverlay}>
          <Title className={styles.welcomeTitle}>Verify Your Email</Title>
          <Text className={styles.welcomeSubtitle}>One last step to secure your account</Text>
        </div>
        <Image src="/images/clubDance.png" alt="Verification background" fill className={styles.image} priority />
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
            <Title className={styles.title}>Verify Your Email</Title>
            <Text className={styles.subtitle}>
              We&apos;ve sent a 4-digit verification code to your email address. Enter the code below to confirm your email.
            </Text>
          </div>

          <Box className={styles.formWrapper}>
            {verified ? (
              <div className={styles.successContainer}>
                <div className={styles.successIconWrapper}>
                  <IconCheck size={40} className={styles.successIcon} />
                </div>
                <Title order={2} className={styles.successTitle}>
                  Email Verified!
                </Title>
                <Text className={styles.successText}>Your email has been successfully verified.</Text>
                <Text className={styles.successSubtext}>You will be redirected to continue...</Text>
              </div>
            ) : (
              <>
                <div className={styles.otpContainer}>
                  {otp.map((value, index) => (
                    <TextInput
                      key={index}
                      maxLength={1}
                      value={value}
                      onChange={(e) => handleChange(e.target.value, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className={styles.otpInput}
                      classNames={{
                        input: styles.otpInputField,
                        wrapper: styles.otpInputWrapper,
                      }}
                      autoFocus={index === 0}
                      ref={(el) => {
                        inputRefs.current[index] = el ? el.querySelector("input") : null
                      }}
                    />
                  ))}
                </div>

                <Button
                  className={styles.submitButton}
                  onClick={handleSubmit}
                  loading={loading}
                  disabled={otp.join("").length !== 4 || loading}
                >
                  {loading ? "Verifying..." : "Verify Email"}
                </Button>

                <div className={styles.resendContainer}>
                  <Text className={styles.resendText}>Didn&apos;t receive the code?</Text>
                  {countdown > 0 ? (
                    <Text className={styles.countdownText}>Resend code in {countdown}s</Text>
                  ) : (
                    <Button
                      variant="subtle"
                      className={styles.resendButton}
                      onClick={handleResendOtp}
                      loading={resendLoading}
                      disabled={resendLoading}
                    >
                      Resend Code
                    </Button>
                  )}
                </div>

                <Text className={styles.signUpText}>
                  Don&apos;t have an account?{" "}
                  <Link href="/auth/signup" className={styles.signUpLink}>
                    Sign up
                  </Link>
                </Text>
              </>
            )}
          </Box>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail
