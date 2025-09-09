"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Center, Loader, Text } from "@mantine/core";

export default function HomePage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  useEffect(() => {
    // If userId is provided in query params, redirect to user profile page
    if (userId) {
      window.location.href = `/user/${userId}`;
    } else {
      // If no userId, redirect to the main home page or event listing
      window.location.href = "/eventSchedule/exploreEvent";
    }
  }, [userId]);

  return (
    <Center style={{ height: "100vh", flexDirection: "column" }}>
      <Loader size="lg" color="#025a3a" />
      <Text mt="md" c="dimmed">
        {userId ? "Redirecting to user profile..." : "Redirecting to events..."}
      </Text>
    </Center>
  );
}
