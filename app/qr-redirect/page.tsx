"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

export const dynamic = 'force-dynamic';
import { Center, Loader, Text, Stack } from "@mantine/core";

function QRRedirectPageContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  useEffect(() => {
    if (userId) {
      // Redirect to user profile page using dynamic route
      console.log("QR Redirect: Redirecting to /user/" + userId);
      window.location.replace(`/user/${userId}`);
    } else {
      // If no userId, redirect to home
      console.log("QR Redirect: No userId found, redirecting to home");
      window.location.replace("/");
    }
  }, [userId]);

  return (
    <Center style={{ height: "100vh" }}>
      <Stack align="center">
        <Loader size="xl" />
        <Text size="lg" c="dimmed">
          {userId ? "Redirecting to user profile..." : "Redirecting to home..."}
        </Text>
      </Stack>
    </Center>
  );
}

export default function QRRedirectPage() {
  return (
    <Suspense
      fallback={
        <Center style={{ height: "100vh" }}>
          <Stack align="center">
            <Loader size="xl" />
            <Text size="lg" c="dimmed">
              Loading...
            </Text>
          </Stack>
        </Center>
      }
    >
      <QRRedirectPageContent />
    </Suspense>
  );
}
