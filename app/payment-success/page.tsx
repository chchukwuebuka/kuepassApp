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

  useEffect(() => {
    const ref = searchParams.get("reference");
    const event = searchParams.get("eventId");
    const userEmail = searchParams.get("email");
    const stat = searchParams.get("status");

    setReference(ref);
    setEventId(event);
    setEmail(userEmail);

    // Basic validation
    if (!ref || !event) {
      console.warn("URL is missing payment reference or event ID.");
      // Redirect to error page after timeout
      setTimeout(() => router.push("/error"), 5000);
      return;
    }

    if (stat === "success" || stat === "verified") {
      console.log(`Payment successful for reference: ${ref}, event: ${event}`);
      // Show QR modal after a short delay to ensure payment is processed
      setTimeout(() => {
        setShowQRModal(true);
        setLoading(false);
      }, 1000);
    } else {
      console.warn(
        "Landed on success page, but status is not 'success':",
        stat
      );
      setLoading(false);
    }
  }, [searchParams, router]);

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
        email={email || undefined}
        eventId={eventId || undefined}
      />

      {/* Fallback content if QR modal fails to load */}
      {!showQRModal && (
        <Center style={{ height: "100vh" }}>
          <Text>
            Payment successful! Please check your email for confirmation.
          </Text>
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
