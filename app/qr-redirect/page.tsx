"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Center, Loader, Text, Stack } from "@mantine/core";

export default function QRRedirectPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  useEffect(() => {
    if (userId) {
      // Redirect to user profile page
      window.location.href = `/user/${userId}`;
    } else {
      // If no userId, redirect to home
      window.location.href = "/";
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
