"use client";
import {
  Container,
  Grid,
  TextInput,
  PasswordInput,
  Button,
  Text,
  Stack,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import Image from "next/image";
import { IconAt } from "@tabler/icons-react";
import styles from "./styles.module.css";

const  ForgotPassword= () => {
      const form = useForm({
            initialValues: {
              email: "",
            },
            validate: {
              email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
            },
          });
        
          const handleSubmit = (values: { email: string }) => {
            console.log("Forgot password request submitted:", values);
            // Handle the forgot password logic (e.g., call an API to send reset instructions)
          };
        
  const icon = <IconAt size={16} />;

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

          <Text className={styles.title}>Reset Password</Text>
          <Text size="sm" color="dimmed" className={styles.subtitle}>
          Kindly input your functional email and we will send you an OTP to help you proceed
          </Text>

          <form
            onSubmit={form.onSubmit((values) => {
                  handleSubmit(values);
                })}
          >
            <TextInput
              label="Email address"
              rightSection={icon}
              placeholder="Enter your email address"
              {...form.getInputProps("email")}
              required
              className={styles.input}
            />
            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              {...form.getInputProps("password")}
              required
              className={styles.input}
            />
            <Stack className={styles.submitBtn}>
            <Button type="submit" fullWidth className={styles.submitButton} mt="md">
          Reset 
        </Button>
            </Stack>
          </form>
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default  ForgotPassword;
