"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Center, Text, Loader } from "@mantine/core";
import QRCodePopup from "@/components/QRCodePopup";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State for QR code modal and payment data
  const [showQRModal, setShowQRModal] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [maxRetries] = useState(3);

  useEffect(() => {
    const ref = searchParams.get("reference");
    const event = searchParams.get("eventId");
    const userEmail = searchParams.get("email");
    const stat = searchParams.get("status");
    const attendeeId = searchParams.get("attendeeId");

    console.log("Payment Success URL params:", {
      ref,
      event,
      userEmail,
      stat,
      attendeeId,
    });

    setReference(ref);
    setEventId(event);
    setEmail(userEmail);

    // Enhanced validation - allow different parameter combinations
    const hasRequiredParams =
      (ref && event) || (ref && userEmail) || attendeeId;

    if (!hasRequiredParams) {
      console.warn(
        "URL is missing required parameters for QR code generation."
      );
      // Redirect to error page after timeout
      setTimeout(() => router.push("/error"), 5000);
      return;
    }

    // Handle different success scenarios
    const isPaymentSuccess = stat === "success" || stat === "verified" || !stat;

    if (isPaymentSuccess) {
      console.log(
        `Payment successful for reference: ${ref}, event: ${event}, attendeeId: ${attendeeId}`
      );

      // Show QR modal with progressive delay based on retry count
      const delay = Math.min(1000 + retryCount * 500, 3000);

      setTimeout(() => {
        console.log("Setting showQRModal to true");
        setShowQRModal(true);
        setLoading(false);
      }, delay);
    } else {
      console.warn(
        "Landed on success page, but status indicates failure:",
        stat
      );
      setLoading(false);
    }
  }, [searchParams, router, retryCount]);

  const closeQRModal = () => {
    setShowQRModal(false);
    // Redirect to event details or home page
    if (eventId) {
      setTimeout(
        () => router.push(`/eventSchedule/eventDetails/${eventId}`),
        1000
      );
    } else {
      setTimeout(() => router.push("/"), 1000);
    }
  };

  const handleQRModalError = () => {
    console.log("QR modal failed to load, attempting retry...");
    if (retryCount < maxRetries) {
      setRetryCount((prev) => prev + 1);
      setShowQRModal(false);
      setLoading(true);
    } else {
      console.error("Max retries reached for QR code loading");
      setLoading(false);
    }
  };

  // Show loading state while processing payment
  if (loading) {
    return (
      <Center style={{ height: "100vh" }}>
        <Loader size="lg" />
        <Text ml="md">Processing your payment...</Text>
      </Center>
    );
  }

  // Show QR code modal
  return (
    <>
      <QRCodePopup
        show={showQRModal}
        onClose={closeQRModal}
        attendeeId={searchParams.get("attendeeId") || undefined}
        email={email || undefined}
        eventId={eventId || undefined}
        onRetry={handleQRModalError}
      />

      {/* Fallback content if QR modal fails to load */}
      {!showQRModal && (
        <Center
          style={{ height: "100vh", flexDirection: "column", gap: "1rem" }}
        >
          <Text size="xl" fw={600} c="green">
            ✅ Payment Successful!
          </Text>
          <Text size="lg" ta="center">
            Your payment has been processed successfully.
          </Text>
          {reference && (
            <Text size="sm" c="dimmed">
              Reference: {reference}
            </Text>
          )}
          {eventId && (
            <Text size="sm" c="dimmed">
              Event ID: {eventId}
            </Text>
          )}
          <Text size="md" ta="center" mt="md">
            Please check your email for confirmation and ticket details.
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            Your QR code ticket should appear shortly. If it doesn&apos;t,
            please refresh the page.
          </Text>
          {retryCount > 0 && (
            <Text size="sm" c="orange" ta="center">
              Attempting to load your ticket... (Attempt {retryCount + 1}/
              {maxRetries + 1})
            </Text>
          )}
        </Center>
      )}
    </>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <Center style={{ height: "100vh" }}>
          <Loader size="lg" />
        </Center>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
