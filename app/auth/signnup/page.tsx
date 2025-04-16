// "use client";
// import {
//   Container,
//   Grid,
//   TextInput,
//   PasswordInput,
//   Button,
//   Text,
//   Stack,
// } from "@mantine/core";
// import { useForm } from "@mantine/form";
// import Image from "next/image";
// import { IconAt } from "@tabler/icons-react";
// import styles from "./styles.module.css";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useState } from "react";

// const SignUp = () => {
//   const router = useRouter();
//   const form = useForm({
//     initialValues: {
//       name: "",
//       email: "",
//       number: "",
//       password: "",
//     },
//     validate: {
//       email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
//       password: (value) =>
//         value.length >= 6 ? null : "Password must be at least 6 characters",
//       name: (value) => (value.trim().length > 0 ? null : "Name is required"),
//       number: (value) =>
//         /^[0-9]{10,15}$/.test(value) ? null : "Invalid phone number",
//     },
//   });

//   const icon = <IconAt size={16} />;
//   const [loading, setLoading] = useState(false);

//   return (
//     <Container fluid className={styles.container}>
//       <Grid className={styles.grid}>
//         {/* Left Column with Image */}
//         <Grid.Col span={6} className={styles.leftColumn}>
//           <Image
//             src="/images/clubdance.png"
//             alt="Sign in background"
//             layout="fill"
//             objectFit="cover"
//             className={styles.image}
//           />
//         </Grid.Col>

//         {/* Right Column with Form */}
//         <Grid.Col span={6} className={styles.rightColumn}>
//           <Button
//             variant="subtle"
//             className={styles.goBackButton}
//             onClick={() => window.history.back()}
//           >
//             &larr; Go Back
//           </Button>

//           <Text className={styles.title}>Sign Up</Text>
//           <Text size="sm" color="dimmed" className={styles.subtitle}>
//             Can't wait to show you the happening events around you.
//           </Text>

//           <form
//             onSubmit={form.onSubmit(async (values) => {
//               console.log("Form submitted with values:", values); // Log form data for debugging
//               setLoading(true);

//               try {
//                 // Simulate API call delay
//                 await new Promise((resolve) => setTimeout(resolve, 1500)); // Mock delay (1.5 seconds)

//                 // Simulate successful signup
//                 console.log("Mock API call successful");

//                 // Redirect to the Verify Email page
//                 router.push("/auth/verifyemail");
//               } catch (err: any) {
//                 console.error("Error during signup:", err.message);
//               } finally {
//                 setLoading(false); // Stop loading
//               }
//             })}
//           >
//             <TextInput
//               label="Name"
//               placeholder="Enter your Name"
//               {...form.getInputProps("name")}
//               className={styles.input}
//             />

//             <TextInput
//               mt="md"
//               label="Email address"
//               rightSection={icon}
//               placeholder="Enter your email address"
//               {...form.getInputProps("email")}
//               className={styles.input}
//               description="Provide your email address"
//             />

//             <TextInput
//               label="Phone Number"
//               type="number"
//               placeholder="Enter your phone number"
//               {...form.getInputProps("number")}
//               className={styles.input}
//             />

//             <PasswordInput
//               label="Password"
//               placeholder="Enter your password"
//               {...form.getInputProps("password")}
//               className={styles.input}
//             />

//             <Button
//               variant="outline"
//               className={styles.googleButton}
//               onClick={() => console.log("Google Sign-Up Clicked")}
//             >
//               <Image
//                 src="/images/google-icon.png"
//                 alt="Google Icon"
//                 width={20}
//                 height={20}
//                 style={{ marginRight: "8px" }}
//               />
//               Sign Up with Google
//             </Button>

//             <Stack className={styles.submitBtn}>
//               <Button
//                 type="submit"
//                 fullWidth
//                 className={styles.submitButton}
//                 loading={loading}
//               >
//                 Sign Up
//               </Button>
//               {/*  */}
//             </Stack>
//           </form>

//           <Text className={styles.signUpText}>
//             Already have an account?
//             <Link href="/auth/signin" style={{ textDecoration: "underline" }}>
//               Sign In
//             </Link>
//           </Text>
//         </Grid.Col>
//       </Grid>
//     </Container>
//   );
// };

// export default SignUp;


"use client";
import {
  Container,
  Grid,
  TextInput,
  PasswordInput,
  Button,
  Text,
  Stack,
  Box,
  Divider,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import Image from "next/image";
import { IconAt, IconArrowLeft, IconUser, IconPhone, IconLock } from "@tabler/icons-react";
import styles from "./styles.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useLoadingState } from "../../../store/loadingHook";  // Import loading state hook

const SignUp = () => {
  const router = useRouter();
  const { withLoading } = useLoadingState(); // Use the loading hook
  
  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      number: "",
      password: "",
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email format"),
      password: (value) =>
        value.length < 6 
          ? "Password must be at least 6 characters" 
          : !/[A-Z]/.test(value) 
            ? "Password must contain at least one uppercase letter" 
            : !/[0-9]/.test(value) 
              ? "Password must contain at least one number" 
              : null,
      name: (value) => (value.trim().length === 0 ? "Name is required" : null),
      number: (value) =>
        /^[0-9]{10,15}$/.test(value) ? null : "Please enter a valid phone number (10-15 digits)",
    },
  });

  const [loading, setLoading] = useState(false);

  // Clear errors when form values change
  useEffect(() => {
    // This will run whenever any form value changes
    form.clearErrors();
  }, [form.values]);

  const handleSignUp = async (values: typeof form.values) => {
    // Set local loading state for button
    setLoading(true);
    
    // Use global loading state for full-screen loader
    await withLoading(async () => {
      try {
        console.log("Form submitted with values:", values);
        
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        // Redirect to verification page
        router.push("/auth/verifyemail");
      } catch (err: any) {
        console.error("Error during signup:", err.message);
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <Container fluid className={styles.container}>
      <Grid className={styles.grid} gutter={0}>
        {/* Left Column with Image - Hidden on mobile */}
        <Grid.Col span={{ base: 0, md: 6 }} className={styles.leftColumn}>
          <Image
            src="/images/clubdance.png"
            alt="Sign up background"
            layout="fill"
            objectFit="cover"
            className={styles.image}
            priority
          />
          <div className={styles.overlayText}>
            <Text className={styles.welcomeText}>Join Kuepass Today</Text>
            <Text className={styles.tagline}>Discover and book amazing events near you</Text>
          </div>
        </Grid.Col>

        {/* Right Column with Form */}
        <Grid.Col span={{ base: 12, md: 6 }} className={styles.rightColumn}>
          <Box className={styles.formContainer}>
            <Button
              variant="subtle"
              className={styles.goBackButton}
              onClick={() => router.back()}
              leftSection={<IconArrowLeft size={16} />}
            >
              Go Back
            </Button>

            <Text className={styles.title}>Create an Account</Text>
            <Text size="sm" color="dimmed" className={styles.subtitle}>
              Can't wait to show you the happening events around you.
            </Text>

            <form onSubmit={form.onSubmit(handleSignUp)}>
              <TextInput
                label="Full Name"
                placeholder="Enter your full name"
                leftSection={<IconUser size={16} />}
                {...form.getInputProps("name")}
                className={styles.input}
                autoComplete="name"
              />

              <TextInput
                label="Email Address"
                placeholder="Enter your email address"
                leftSection={<IconAt size={16} />}
                {...form.getInputProps("email")}
                className={styles.input}
                autoComplete="email"
              />

              <TextInput
                label="Phone Number"
                type="tel"
                placeholder="Enter your phone number"
                leftSection={<IconPhone size={16} />}
                {...form.getInputProps("number")}
                className={styles.input}
                autoComplete="tel"
              />

              <PasswordInput
                label="Password"
                placeholder="Create a strong password"
                leftSection={<IconLock size={16} />}
                {...form.getInputProps("password")}
                className={styles.input}
                autoComplete="new-password"
              />
              
              <Text size="xs" color="dimmed" className={styles.passwordHint}>
                Password must be at least 6 characters with one uppercase letter and one number
              </Text>

              <Stack className={styles.submitBtn}>
                <Button
                  type="submit"
                  fullWidth
                  className={styles.submitButton}
                  loading={loading}
                >
                  Create Account
                </Button>
              </Stack>
              
              <Divider my="md" label="or continue with" labelPosition="center" />
              
              <Button
                variant="outline"
                className={styles.googleButton}
                onClick={() => console.log("Google Sign-Up Clicked")}
                fullWidth
              >
                <Image
                  src="/images/google-icon.png"
                  alt="Google Icon"
                  width={20}
                  height={20}
                  style={{ marginRight: "8px" }}
                />
                Sign Up with Google
              </Button>
            </form>

            <Text className={styles.signUpText}>
              Already have an account?{" "}
              <Link href="/auth/signin" className={styles.signInLink}>
                Sign In
              </Link>
            </Text>
          </Box>
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default SignUp;



