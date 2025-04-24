"use client";

import { useState, useEffect } from "react";
import { Notification } from "@mantine/core";
import { IconWifiOff } from "@tabler/icons-react";

export default function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Check if we're currently offline
    if (typeof window !== "undefined") {
      setIsOffline(!window.navigator.onLine);

      // Add event listeners for online/offline events
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      // Clean up event listeners
      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  if (!isOffline) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 1000,
      }}
    >
      <Notification
        title="You are offline"
        color="red"
        withCloseButton={false}
        icon={<IconWifiOff size={18} />}
      >
        Some features may not work properly. Please check your internet
        connection.
      </Notification>
    </div>
  );
}
