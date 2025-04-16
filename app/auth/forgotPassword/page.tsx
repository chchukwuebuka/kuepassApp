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

// const  ForgotPassword= () => {
//       const form = useForm({
//             initialValues: {
//               email: "",
//             },
//             validate: {
//               email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
//             },
//           });

//           const handleSubmit = (values: { email: string }) => {
//             console.log("Forgot password request submitted:", values);
//             // Handle the forgot password logic (e.g., call an API to send reset instructions)
//           };

//   const icon = <IconAt size={16} />;

//   return (
//     <Container fluid className={styles.container}>
//       <Grid className={styles.grid}>
//         {/* Left Column with Image */}
//         <Grid.Col span={6} className={styles.leftColumn}>
//           <Image
//             src="/images/signinImage.png"
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

//           <Text className={styles.title}>Reset Password</Text>
//           <Text size="sm" color="dimmed" className={styles.subtitle}>
//           Kindly input your functional email and we will send you an OTP to help you proceed
//           </Text>

//           <form
//             onSubmit={form.onSubmit((values) => {
//                   handleSubmit(values);
//                 })}
//           >
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
//             <Stack className={styles.submitBtn}>
//             <Button type="submit" fullWidth className={styles.submitButton} mt="md">
//           Reset
//         </Button>
//             </Stack>
//           </form>
//         </Grid.Col>
//       </Grid>
//     </Container>
//   );
// };

// export default  ForgotPassword;

"use client";

import { useState } from "react";
import { TextInput, Button, Text, Box, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import Image from "next/image";
import {
  IconAt,
  IconArrowLeft,
  IconSend,
  IconCheck,
} from "@tabler/icons-react";
import styles from "./styles.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ForgotPassword = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
    console.log("Forgot password request submitted:", values);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Show success message
      setSubmitted(true);
    } catch (error) {
      console.error("Error sending reset email:", error);
      form.setErrors({
        email: "Failed to send reset email. Please try again.",
      });
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
              Enter your email address and we&apos;ll send you instructions to
              reset your password
            </Text>
          </div>
          <Box className={styles.formWrapper}>
            {submitted ? (
              <div className={styles.successContainer}>
                <div className={styles.successIconWrapper}>
                  <IconCheck size={40} className={styles.successIcon} />
                </div>
                <Title order={2} className={styles.successTitle}>
                  Check Your Email
                </Title>
                <Text className={styles.successText}>
                  We&apos;ve sent password reset instructions to{" "}
                  <strong>{form.values.email}</strong>
                </Text>
                <Text className={styles.successSubtext}>
                  If you don&apos;t see the email, check your spam folder or
                  make sure you entered the correct email address.
                </Text>
                <Button
                  className={styles.returnButton}
                  onClick={() => router.push("/auth/verifyemail")}
                >
                  Got to Verify Email
                </Button>
              </div>
            ) : (
              <form onSubmit={form.onSubmit(handleSubmit)}>
                <TextInput
                  label="Email Address"
                  placeholder="Enter your email address"
                  leftSection={
                    <IconAt size={18} className={styles.inputIcon} />
                  }
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
                  {loading ? "Sending..." : "Send Reset Instructions"}
                </Button>

                <Text className={styles.signInText}>
                  Remember your password?{" "}
                  <Link href="/auth/signin" className={styles.signInLink}>
                    Sign In
                  </Link>
                </Text>
              </form>
            )}
          </Box>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
