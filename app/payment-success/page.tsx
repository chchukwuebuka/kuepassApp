"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Center,
  Text,
  Title,
  Paper,
  Button,
  Group,
  Loader,
} from "@mantine/core"; // Added Loader import
import Link from "next/link";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [reference, setReference] = useState<string | null>(null);

  useEffect(() => {
    const ref = searchParams.get("reference");
    const stat = searchParams.get("status");

    setReference(ref);

    if (stat === "success") {
      console.log("Payment successful for reference:", ref);
      // You could potentially fetch more order details here using the reference if needed
      // Or clear cart, etc.

      // Optional: Redirect to a main page or user dashboard after a few seconds
      // const timer = setTimeout(() => {
      //   router.push('/'); // Redirect to homepage
      // }, 5000); // 5 seconds
      // return () => clearTimeout(timer);
    } else {
      // Handle cases where status might not be 'success' even on this page (shouldn't happen if backend routes correctly)
      console.warn(
        "Landed on success page, but status is not 'success':",
        stat
      );
    }
  }, [searchParams, router]);

  return (
    <Center style={{ minHeight: "80vh", padding: "20px" }}>
      <Paper
        shadow="md"
        p="xl"
        radius="md"
        withBorder
        style={{ maxWidth: "500px", width: "100%" }}
      >
        <Title order={2} ta="center" mb="lg" c="green">
          Payment Successful!
        </Title>
        <Text ta="center" mb="md">
          Thank you for your payment. Your registration has been confirmed.
        </Text>
        {reference && (
          <Text ta="center" c="dimmed" size="sm" mb="xl">
            Transaction Reference: {reference}
          </Text>
        )}
        <Text ta="center" mb="xl">
          You should receive a confirmation email shortly.
        </Text>
        <Group justify="center">
          <Button component={Link} href="/" variant="light">
            Go to Homepage
          </Button>
          {/* You can add a link to view their event registrations or tickets */}
          {/* <Button component={Link} href="/my-events">View My Events</Button> */}
        </Group>
      </Paper>
    </Center>
  );
}

export default function PaymentSuccessPage() {
  // Suspense is required by Next.js when using useSearchParams in a page component directly
  return (
    <Suspense
      fallback={
        <Center style={{ height: "80vh" }}>
          <Loader />
        </Center>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
