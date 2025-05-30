"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Center,
  Text,
  Title,
  Paper,
  Button,
  Group,
  Alert,
  Loader,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import Link from "next/link";

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const [reference, setReference] = useState<string | null>(null);
  const [errorReason, setErrorReason] = useState<string | null>(null);

  useEffect(() => {
    const ref = searchParams.get("reference");
    const err = searchParams.get("error") || searchParams.get("reason"); // Backend might send 'error' or 'reason'

    setReference(ref);
    setErrorReason(err);

    console.error(
      "Payment failed or was cancelled. Reference:",
      ref,
      "Reason:",
      err
    );
  }, [searchParams]);

  let message = "Your payment could not be processed or was cancelled.";
  if (errorReason) {
    if (errorReason === "paystack_declined") {
      message =
        "The payment was not successful via Paystack. Please try again or use a different payment method.";
    } else if (
      errorReason === "server_error" ||
      errorReason === "internal_payment_not_found" ||
      errorReason === "attendee_missing"
    ) {
      message =
        "There was an issue verifying your payment. Please contact support with your transaction reference if payment was made.";
    } else if (
      errorReason === "missing_reference" ||
      errorReason === "metadata_issue"
    ) {
      message =
        "There was an issue with the payment details. Please contact support.";
    }
  }

  return (
    <Center style={{ minHeight: "80vh", padding: "20px" }}>
      <Paper
        shadow="md"
        p="xl"
        radius="md"
        withBorder
        style={{ maxWidth: "500px", width: "100%" }}
      >
        <Title order={2} ta="center" mb="lg" c="red">
          Payment Failed
        </Title>
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title="Transaction Issue"
          color="red"
          mb="md"
        >
          {message}
        </Alert>
        {reference && (
          <Text ta="center" c="dimmed" size="sm" mb="xl">
            Transaction Reference (if available): {reference}
            
          </Text>
        )}
        <Text ta="center" mb="xl">
          If you believe this is an error, or if funds were deducted, please
          contact our support team.
        </Text>
        <Group justify="center">
          <Button component={Link} href="/" variant="light">
            Go to Homepage
          </Button>
          {/* You could link back to the event page or a contact page */}
          {/* <Button variant="outline" onClick={() => router.back()}>Try Again</Button> */}
        </Group>
      </Paper>
    </Center>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense
      fallback={
        <Center style={{ height: "80vh" }}>
          <Loader />
        </Center>
      }
    >
      <PaymentFailedContent />
    </Suspense>
  );
}
