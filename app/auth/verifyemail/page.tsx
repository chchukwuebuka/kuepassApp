"use client";
import {
  Container,
  Grid,
  Button,
  Text,
  TextInput,
  Flex,
  Stack,
} from "@mantine/core";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
// import styles from "./styles.module.css";
import styles from "./styles.module.css";
import Link from "next/link";

const VerifyEmail = () => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const router = useRouter();

  const handleChange = (value: string, index: number) => {
    if (/^[0-9]*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
    }
  };

  const handleSubmit = () => {
    // Here, you would verify the OTP with the backend
    console.log("OTP submitted:", otp.join(""));
    // Redirect after successful OTP verification
    router.push("/auth/success"); // Example route for successful verification
  };

  return (
    <Container fluid className={styles.container}>
      <Grid className={styles.grid}>
        {/* Left Column with Image */}
        <Grid.Col span={6} className={styles.leftColumn}>
          <Image
            src="/images/signinImage.png"
            alt="Sign in background"
            layout="fill"
            objectFit="cover"
            className={styles.image}
          />
        </Grid.Col>

        {/* Right Column with Form */}
        <Grid.Col span={6} className={styles.rightColumn}>
          <Button
            variant="subtle"
            className={styles.goBackButton}
            onClick={() => window.history.back()}
          >
            &larr; Go Back
          </Button>

          <Text className={styles.title}>Verify Email</Text>
          <Text size="sm" color="dimmed" className={styles.subtitle}>
            Kindly provide the 4-digit code that was sent to your email for
            verification.
          </Text>

          <Grid className={styles.otpGrid}>
            {otp.map((value, index) => (
              <Grid.Col span={3} key={index}>
                <TextInput
                  maxLength={1}
                  value={value}
                  onChange={(e) => handleChange(e.target.value, index)}
                  className={styles.otpInput}
                  autoFocus={index === 0}
                />
              </Grid.Col>
            ))}
          </Grid>
          <Flex
            className={styles.verifybtn}
            // justify="space-between"
            // align="center"
            // gap="md"
          >
            {/* Verify Email Button */}
            <Button className={styles.submitButton} onClick={handleSubmit}>
              Verify Email
            </Button>

            {/* Resend OTP Section */}
            <Stack>
              <Text className={styles.resendText}>Didn’t get the code?</Text>
              <Button variant="link" className={styles.resendBTN}>
                Resend OTP
              </Button>
            </Stack>
          </Flex>

          <Stack></Stack>

          {/* </Flex> */}

          <Text className={styles.signUpText}>
            Don’t have an account?
            <Link href="/auth/signnup" style={{ textDecoration: "underline" }}>
              Sign up
            </Link>
          </Text>
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default VerifyEmail;
