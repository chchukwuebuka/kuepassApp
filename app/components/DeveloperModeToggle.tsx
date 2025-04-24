"use client";

import { useState, useEffect } from "react";
import { Switch, Group, Text, Button } from "@mantine/core";
import { IconCode, IconCloud } from "@tabler/icons-react";

interface DeveloperModeToggleProps {
  defaultEnabled?: boolean;
  onToggle: (enabled: boolean) => void;
}

export default function DeveloperModeToggle({
  defaultEnabled = false,
  onToggle,
}: DeveloperModeToggleProps) {
  const [enabled, setEnabled] = useState(defaultEnabled);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // This is a simple mechanism to show the developer mode toggle
    // Press "D" 5 times quickly to show the toggle
    let count = 0;
    let lastPress = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Defensive check for e and e.key
      if (!e || !e.key) {
        console.warn("Invalid keyboard event:", e);
        return;
      }

      // Ensure the key is "d" (case-insensitive)
      if (e.key.toLowerCase() === "d") {
        const now = Date.now();
        if (now - lastPress < 500) {
          count++;
        } else {
          count = 1;
        }
        lastPress = now;

        if (count >= 5) {
          setVisible(true);
          count = 0;
        }
      }
    };

//     window.addEventListener("keydown", handleKeyDown);

//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//     };
//   }, []);


// Only add listener if window is defined (client-side)
if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeyDown);
    }

    // Cleanup listener on unmount
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, []);

  const handleToggle = (value: boolean) => {
    setEnabled(value);
    onToggle(value);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "20px",
        zIndex: 9999,
        backgroundColor: "#f8f9fa",
        padding: "10px 15px",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        border: "1px solid #e9ecef",
      }}
    >
      <Group justify="space-between" mb="xs">
        <Text fw={600} size="sm">
          Developer Mode
        </Text>
        <Button
          variant="subtle"
          size="compact-xs"
          onClick={() => setVisible(false)}
        >
          Hide
        </Button>
      </Group>

      <Switch
        checked={enabled}
        onChange={(event) => handleToggle(event.currentTarget.checked)}
        color="teal"
        size="md"
        label={
          <Group gap="xs">
            {enabled ? <IconCode size={16} /> : <IconCloud size={16} />}
            <Text size="sm">
              {enabled ? "Using mock responses" : "Using real API"}
            </Text>
          </Group>
        }
      />
    </div>
  );
}
