"use client";

import { useState, useEffect } from "react";
import { Alert, Transition } from "@mantine/core";
import { IconWifiOff } from "@tabler/icons-react";

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowAlert(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowAlert(true);
    };

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cleanup event listeners
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <Transition
      mounted={showAlert}
      transition="slide-down"
      duration={300}
      timingFunction="ease"
    >
      {(styles) => (
        <div
          style={{
            ...styles,
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            padding: "1rem",
          }}
        >
          <Alert
            icon={<IconWifiOff size="1rem" />}
            title="You're offline"
            color="red"
            variant="filled"
            radius="md"
          >
            Please check your internet connection. Some features may not work
            properly.
          </Alert>
        </div>
      )}
    </Transition>
  );
};

export default OfflineIndicator;
