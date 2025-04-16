// "use client";

// import {
//   Container,
//   Grid,
//   TextInput,
//   PasswordInput,
//   Button,
//   Text,
//   Stack,
//   Notification,
// } from "@mantine/core";
// import { useForm } from "@mantine/form";
// import Image from "next/image";
// import { IconAt } from "@tabler/icons-react";
// import styles from "./styles.module.css"; // Adjust the path as necessary
// import Link from "next/link";
// import { useDispatch } from "react-redux";
// import { login } from "@/store/store"; // Adjust the path as necessary
// import { useRouter } from "next/navigation";
// import { useState } from "react";
// // import { useLoadingState } from "../../../store/loadingHook";
// const SignIn: React.FC = () => {
//   const form = useForm({
//     initialValues: {
//       email: "",
//       password: "",
//     },
//     validate: {
//       email: (value) =>
//         /^\S+@\S+$/.test(value) ? null : "Invalid email",
//       password: (value) =>
//         value.length >= 6 ? null : "Password must be at least 6 characters",
//     },
//   });

//   const icon = <IconAt size={16} />;
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);

//   const handleSignIn = async (values: typeof form.values) => {
//     setLoading(true);
//     setError(null);
//     try {
//       // Replace this with your actual authentication logic
//       // For demonstration, we'll mock a successful sign-in
//       const mockUser = {
//         name: "John Doe",
//         email: values.email,
//         profilePicture: "/images/avatar.png", // Ensure this image exists
//       };

//       // Simulate API call
//       await new Promise((resolve) => setTimeout(resolve, 1000));

//       dispatch(login(mockUser));
//       router.push("/"); // Redirect to home page after sign-in
//     } catch (err) {
//       setError("Failed to sign in. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

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

//           <Text className={styles.title}>Welcome Back!</Text>
//           <Text size="sm" color="dimmed" className={styles.subtitle}>
//             We are so glad to have you back! Log in from where you stopped.
//           </Text>

//           {error && (
//             <Notification color="red" onClose={() => setError(null)}>
//               {error}
//             </Notification>
//           )}

//           <form onSubmit={form.onSubmit(handleSignIn)}>
//             <TextInput
//               label="Email address"
//               rightSection={icon}
//               placeholder="Enter your email address"
//               {...form.getInputProps("email")}
//               required
//               className={styles.input}
//             />
//             <PasswordInput
//               label="Password"
//               placeholder="Enter your password"
//               {...form.getInputProps("password")}
//               required
//               className={styles.input}
//             />

//             <div className={styles.forgotPasswordContainer}>
//               <Link href="/auth/forgotPassword" className={styles.forgotPassword}>
//                 Forgot Password?
//               </Link>
//             </div>
//             <Stack className={styles.submitBtn}>
//               <Button
//                 type="submit"
//                 fullWidth
//                 className={styles.submitButton}
//                 loading={loading}
//               >
//                 Sign In
//               </Button>
//             </Stack>
//           </form>

//           <Text className={styles.signUpText}>
//             Don’t have an account?{" "}
//             <Link href="/auth/signnup" style={{ textDecoration: "underline" }}>
//               Sign up
//             </Link>
//           </Text>
//         </Grid.Col>
//       </Grid>
//     </Container>
//   );
// };

// export default SignIn;


// "use client";
// import {
//   Container,
//   Grid,
//   TextInput,
//   PasswordInput,
//   Button,
//   Text,
//   Stack,
//   Notification,
//   Box,
// } from "@mantine/core";
// import { useForm } from "@mantine/form";
// import Image from "next/image";
// import { IconAt, IconArrowLeft, IconLock } from "@tabler/icons-react";
// import styles from "./styles.module.css";
// import Link from "next/link";
// import { useAppDispatch } from "@/store/store"; // Using typed dispatch
// import { login } from "@/store/store";
// import { useRouter } from "next/navigation";
// import { useState, useEffect } from "react";
// import { useLoadingState } from "../../../store/loadingHook"; // Import loading state hook

// const SignIn: React.FC = () => {
//   const form = useForm({
//     initialValues: {
//       email: "",
//       password: "",
//     },
//     validate: {
//       email: (value) =>
//         /^\S+@\S+$/.test(value) ? null : "Invalid email format",
//       password: (value) =>
//         value.length >= 6 ? null : "Password must be at least 6 characters",
//     },
//   });

//   const dispatch = useAppDispatch();
//   const router = useRouter();
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);
//   const { withLoading } = useLoadingState(); // Use the loading hook

//   // Clear error when form values change
//   useEffect(() => {
//     if (error) setError(null);
//   }, [form.values, error]);

//   const handleSignIn = async (values: typeof form.values) => {
//     // Use local loading state for button
//     setLoading(true);
    
//     // Use global loading state for full-screen loader
//     await withLoading(async () => {
//       try {
//         // Replace this with your actual authentication logic
//         // For demonstration, we'll mock a successful sign-in
//         const mockUser = {
//           name: "John Doe",
//           email: values.email,
//           profilePicture: "/images/avatar.png",
//         };

//         // Simulate API call
//         await new Promise((resolve) => setTimeout(resolve, 1500));

//         dispatch(login(mockUser));
//         router.push("/"); // Redirect to home page after sign-in
//       } catch (err) {
//         setError("Failed to sign in. Please check your credentials and try again.");
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
//             alt="Sign in background"
//             layout="fill"
//             objectFit="cover"
//             className={styles.image}
//             priority // Add priority for faster loading
//           />
//           <div className={styles.overlayText}>
//             <Text className={styles.welcomeText}>Welcome to Kuepass</Text>
//             <Text className={styles.tagline}>Your gateway to amazing events</Text>
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

//             <Text className={styles.title}>Welcome Back!</Text>
//             <Text size="sm" color="dimmed" className={styles.subtitle}>
//               We are so glad to have you back! Log in from where you stopped.
//             </Text>

//             {error && (
//               <Notification color="red" onClose={() => setError(null)} className={styles.notification}>
//                 {error}
//               </Notification>
//             )}

//             <form onSubmit={form.onSubmit(handleSignIn)}>
//               <TextInput
//                 label="Email address"
//                 placeholder="Enter your email address"
//                 leftSection={<IconAt size={16} />}
//                 {...form.getInputProps("email")}
//                 required
//                 className={styles.input}
//                 autoComplete="email"
//               />
//               <PasswordInput
//                 label="Password"
//                 placeholder="Enter your password"
//                 leftSection={<IconLock size={16} />}
//                 {...form.getInputProps("password")}
//                 required
//                 className={styles.input}
//                 autoComplete="current-password"
//               />

//               <div className={styles.forgotPasswordContainer}>
//                 <Link href="/auth/forgotPassword" className={styles.forgotPassword}>
//                   Forgot Password?
//                 </Link>
//               </div>
              
//               <Stack className={styles.submitBtn}>
//                 <Button
//                   type="submit"
//                   fullWidth
//                   className={styles.submitButton}
//                   loading={loading}
//                 >
//                   Sign In
//                 </Button>
//               </Stack>
//             </form>

//             <Text className={styles.signUpText}>
//               Don't have an account?{" "}
//               <Link href="/auth/signnup" className={styles.signUpLink}>
//                 Sign up
//               </Link>
//             </Text>
//           </Box>
//         </Grid.Col>
//       </Grid>
//     </Container>
//   );
// };

// export default SignIn;


"use client";

import {
  Container,
  Grid,
  TextInput,
  PasswordInput,
  Button,
  Text,
  Stack,
  Notification,
  Box,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import Image from "next/image";
import { IconAt, IconArrowLeft, IconLock } from "@tabler/icons-react";
import styles from "./styles.module.css";
import Link from "next/link";
import { useAppDispatch } from "@/store/store"; // Using typed dispatch
import { login } from "@/store/store";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useLoadingState } from "../../../store/loadingHook"; // Import loading state hook

const SignIn: React.FC = () => {
  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (value) =>
        /^\S+@\S+$/.test(value) ? null : "Invalid email format",
      password: (value) =>
        value.length >= 6 ? null : "Password must be at least 6 characters",
    },
  });

  const dispatch = useAppDispatch();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { withLoading } = useLoadingState(); // Use the loading hook

  // Clear error when form values change
  useEffect(() => {
    if (error) setError(null);
  }, [form.values, error]);

  const handleSignIn = async (values: typeof form.values) => {
    // Use local loading state for button
    setLoading(true);
    
    // Use global loading state for full-screen loader
    await withLoading(async () => {
      try {
        // Replace this with your actual authentication logic
        // For demonstration, we'll mock a successful sign-in
        const mockUser = {
          name: "John Doe",
          email: values.email,
          profilePicture: "/images/avatar.png",
        };

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        dispatch(login(mockUser));
        router.push("/"); // Redirect to home page after sign-in
      } catch (err) {
        setError("Failed to sign in. Please check your credentials and try again.");
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
            alt="Sign in background"
            layout="fill"
            objectFit="cover"
            className={styles.image}
            priority // Add priority for faster loading
          />
          <div className={styles.overlayText}>
            <Text className={styles.welcomeText}>Welcome to Kuepass</Text>
            <Text className={styles.tagline}>Your gateway to amazing events</Text>
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

            <Text className={styles.title}>Welcome Back!</Text>
            <Text size="sm" color="dimmed" className={styles.subtitle}>
              We are so glad to have you back! Log in from where you stopped.
            </Text>

            {error && (
              <Notification color="red" onClose={() => setError(null)} className={styles.notification}>
                {error}
              </Notification>
            )}

            <form onSubmit={form.onSubmit(handleSignIn)}>
              <TextInput
                label="Email address"
                placeholder="Enter your email address"
                leftSection={<IconAt size={16} />}
                {...form.getInputProps("email")}
                required
                className={styles.input}
                autoComplete="email"
              />
              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                leftSection={<IconLock size={16} />}
                {...form.getInputProps("password")}
                required
                className={styles.input}
                autoComplete="current-password"
              />

              <div className={styles.forgotPasswordContainer}>
                <Link href="/auth/forgotPassword" className={styles.forgotPassword}>
                  Forgot Password?
                </Link>
              </div>
              
              <Stack className={styles.submitBtn}>
                <Button
                  type="submit"
                  fullWidth
                  className={styles.submitButton}
                  loading={loading}
                >
                  Sign In
                </Button>
              </Stack>
            </form>

            <Text className={styles.signUpText}>
              Don't have an account?{" "}
              <Link href="/auth/signnup" className={styles.signUpLink}>
                Sign up
              </Link>
            </Text>
          </Box>
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default SignIn;