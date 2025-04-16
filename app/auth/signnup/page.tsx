

// "use client";
// import {
//   Container,
//   Grid,
//   TextInput,
//   PasswordInput,
//   Button,
//   Text,
//   Stack,
//   Box,
//   Divider,
// } from "@mantine/core";
// import { useForm } from "@mantine/form";
// import Image from "next/image";
// import { IconAt, IconArrowLeft, IconUser, IconPhone, IconLock } from "@tabler/icons-react";
// import styles from "./styles.module.css";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useState, useEffect } from "react";
// import { useLoadingState } from "../../../store/loadingHook";  // Import loading state hook

// const SignUp = () => {
//   const router = useRouter();
//   const { withLoading } = useLoadingState(); // Use the loading hook
  
//   const form = useForm({
//     initialValues: {
//       name: "",
//       email: "",
//       number: "",
//       password: "",
//     },
//     validate: {
//       email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email format"),
//       password: (value) =>
//         value.length < 6 
//           ? "Password must be at least 6 characters" 
//           : !/[A-Z]/.test(value) 
//             ? "Password must contain at least one uppercase letter" 
//             : !/[0-9]/.test(value) 
//               ? "Password must contain at least one number" 
//               : null,
//       name: (value) => (value.trim().length === 0 ? "Name is required" : null),
//       number: (value) =>
//         /^[0-9]{10,15}$/.test(value) ? null : "Please enter a valid phone number (10-15 digits)",
//     },
//   });

//   const [loading, setLoading] = useState(false);

//   // Clear errors when form values change
//   useEffect(() => {
//     // This will run whenever any form value changes
//     form.clearErrors();
//   }, [form.values]);

//   const handleSignUp = async (values: typeof form.values) => {
//     // Set local loading state for button
//     setLoading(true);
    
//     // Use global loading state for full-screen loader
//     await withLoading(async () => {
//       try {
//         console.log("Form submitted with values:", values);
        
//         // Simulate API call delay
//         await new Promise((resolve) => setTimeout(resolve, 1500));
        
//         // Redirect to verification page
//         router.push("/auth/verifyemail");
//       } catch (err: any) {
//         console.error("Error during signup:", err.message);
//       } finally {
//         setLoading(false);
//       }
//     });
//   };

//   return (
//     <Container fluid className={styles.container}>
//       <Grid className={styles.grid} gutter={0}>
//         {/* Left Column with Image - Hidden on mobile */}
//         <Grid.Col span={{ base: 0, md: 6 }} className={styles.leftColumn}>
//           <Image
//             src="/images/clubdance.png"
//             alt="Sign up background"
//             layout="fill"
//             objectFit="cover"
//             className={styles.image}
//             priority
//           />
//           <div className={styles.overlayText}>
//             <Text className={styles.welcomeText}>Join Kuepass Today</Text>
//             <Text className={styles.tagline}>Discover and book amazing events near you</Text>
//           </div>
//         </Grid.Col>

//         {/* Right Column with Form */}
//         <Grid.Col span={{ base: 12, md: 6 }} className={styles.rightColumn}>
//           <Box className={styles.formContainer}>
//             <Button
//               variant="subtle"
//               className={styles.goBackButton}
//               onClick={() => router.back()}
//               leftSection={<IconArrowLeft size={16} />}
//             >
//               Go Back
//             </Button>

//             <Text className={styles.title}>Create an Account</Text>
//             <Text size="sm" color="dimmed" className={styles.subtitle}>
//               Can't wait to show you the happening events around you.
//             </Text>

//             <form onSubmit={form.onSubmit(handleSignUp)}>
//               <TextInput
//                 label="Full Name"
//                 placeholder="Enter your full name"
//                 leftSection={<IconUser size={16} />}
//                 {...form.getInputProps("name")}
//                 className={styles.input}
//                 autoComplete="name"
//               />

//               <TextInput
//                 label="Email Address"
//                 placeholder="Enter your email address"
//                 leftSection={<IconAt size={16} />}
//                 {...form.getInputProps("email")}
//                 className={styles.input}
//                 autoComplete="email"
//               />

//               <TextInput
//                 label="Phone Number"
//                 type="tel"
//                 placeholder="Enter your phone number"
//                 leftSection={<IconPhone size={16} />}
//                 {...form.getInputProps("number")}
//                 className={styles.input}
//                 autoComplete="tel"
//               />

//               <PasswordInput
//                 label="Password"
//                 placeholder="Create a strong password"
//                 leftSection={<IconLock size={16} />}
//                 {...form.getInputProps("password")}
//                 className={styles.input}
//                 autoComplete="new-password"
//               />
              
//               <Text size="xs" color="dimmed" className={styles.passwordHint}>
//                 Password must be at least 6 characters with one uppercase letter and one number
//               </Text>

//               <Stack className={styles.submitBtn}>
//                 <Button
//                   type="submit"
//                   fullWidth
//                   className={styles.submitButton}
//                   loading={loading}
//                 >
//                   Create Account
//                 </Button>
//               </Stack>
              
//               <Divider my="md" label="or continue with" labelPosition="center" />
              
//               <Button
//                 variant="outline"
//                 className={styles.googleButton}
//                 onClick={() => console.log("Google Sign-Up Clicked")}
//                 fullWidth
//               >
//                 <Image
//                   src="/images/google-icon.png"
//                   alt="Google Icon"
//                   width={20}
//                   height={20}
//                   style={{ marginRight: "8px" }}
//                 />
//                 Sign Up with Google
//               </Button>
//             </form>

//             <Text className={styles.signUpText}>
//               Already have an account?{" "}
//               <Link href="/auth/signin" className={styles.signInLink}>
//                 Sign In
//               </Link>
//             </Text>
//           </Box>
//         </Grid.Col>
//       </Grid>
//     </Container>
//   );
// };

// export default SignUp;



"use client"

import { useState } from "react"
import { TextInput, PasswordInput, Button, Text, Box, Title, Divider } from "@mantine/core"
import { useForm } from "@mantine/form"
import Image from "next/image"
import { IconAt, IconArrowLeft, IconUser, IconPhone, IconLock, IconCheck, IconBrandGoogle } from "@tabler/icons-react"
import styles from "./styles.module.css"
import Link from "next/link"
import { useRouter } from "next/navigation"

const SignUp = () => {
  const router = useRouter()
  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      number: "",
      password: "",
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Please enter a valid email address"),
      password: (value) => (value.length >= 6 ? null : "Password must be at least 6 characters"),
      name: (value) => (value.trim().length > 0 ? null : "Name is required"),
      number: (value) => (/^[0-9]{10,15}$/.test(value) ? null : "Please enter a valid phone number"),
    },
  })

  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleSubmit = async (values: typeof form.values) => {
    console.log("Form submitted with values:", values)
    setLoading(true)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simulate successful signup
      console.log("Mock API call successful")

      // Redirect to the Verify Email page
      router.push("/auth/verifyemail")
    } catch (error: unknown) {
      console.error("Error during signup:", error instanceof Error ? error.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true)
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simulate successful Google signup
      console.log("Google sign up successful")

      // Redirect after successful Google sign up
      router.push("/")
    } catch (error: unknown) {
      console.error("Error during Google signup:", error instanceof Error ? error.message : "Unknown error")
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className={styles.pageContainer}>
      {/* Left Column with Image - hidden on mobile */}
      <div className={styles.leftColumn}>
        <div className={styles.overlay}></div>
        <div className={styles.welcomeTextOverlay}>
          <Title className={styles.welcomeTitle}>Join Our Community</Title>
          <Text className={styles.welcomeSubtitle}>Discover amazing events around you</Text>
        </div>
        <Image src="/images/clubDance.png" alt="Sign up background" fill className={styles.image} priority />
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
            <Text className={styles.subtitle}>Join us to discover amazing events around you</Text>
          </div>

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

            <Divider label="Or sign up with email" labelPosition="center" className={styles.divider} />

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <TextInput
                label="Full Name"
                placeholder="Enter your full name"
                leftSection={<IconUser size={18} className={styles.inputIcon} />}
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
                leftSection={<IconPhone size={18} className={styles.inputIcon} />}
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
                leftSection={<IconLock size={18} className={styles.inputIcon} />}
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
  )
}

export default SignUp
