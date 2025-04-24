"use client";

import { ReactNode, useState, useEffect } from "react";
import OfflineIndicator from "./OfflineIndicator";
import DeveloperModeToggle from "./DeveloperModeToggle";

interface AppProvidersProps {
  children: ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  const [useMockResponses, setUseMockResponses] = useState(false);

  // Handle developer mode toggle
  const handleDevModeToggle = (enabled: boolean) => {
    setUseMockResponses(enabled);

    // Update the mock responses flag in local storage
    if (typeof window !== "undefined") {
      if (enabled) {
        localStorage.setItem("kuepass_dev_mode", "true");
      } else {
        localStorage.removeItem("kuepass_dev_mode");
      }
    }

    // Force reload to apply the changes
    window.location.reload();
  };

  // Check for developer mode on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const devMode = localStorage.getItem("kuepass_dev_mode") === "true";
      setUseMockResponses(devMode);

      // Update the USE_MOCK_RESPONSES variable if we can
      try {
        // This is dynamically importing a module, which might not work in all environments
        import("@/app/services/mockResponses")
          .then((module) => {
            if (module && typeof module.USE_MOCK_RESPONSES !== "undefined") {
              // @ts-ignore - we're intentionally modifying this for dev purposes
              module.USE_MOCK_RESPONSES = devMode;
            }
          })
          .catch(() => {
            // Silently fail if we can't import
          });
      } catch (e) {
        // Silently fail
      }
    }
  }, []);

  return (
    <>
      {children}
      <OfflineIndicator />
      <DeveloperModeToggle
        defaultEnabled={useMockResponses}
        onToggle={handleDevModeToggle}
      />
    </>
  );
}
