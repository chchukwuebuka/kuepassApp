"use client";

import { useState } from "react";
import {
  Paper,
  Text,
  TextInput,
  Button,
  Group,
  Stack,
  Badge,
  Loader,
} from "@mantine/core";
import { IconListCheck, IconCheck } from "@tabler/icons-react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

interface WaitlistButtonProps {
  eventId: string;
  ticketTypeId: string;
  ticketName: string;
  apiBaseUrl: string;
}

export default function WaitlistButton({
  eventId,
  ticketTypeId,
  ticketName,
  apiBaseUrl,
}: WaitlistButtonProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    position: number;
    message: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/waitlist/join/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: eventId,
          ticket_type_id: ticketTypeId,
          name: name.trim(),
          email: email.trim(),
          phone_number: phone || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          position: data.waitlist?.position || data.position || 0,
          message: data.message || "Added to waitlist",
        });
      } else {
        setError(data.error || data.message || "Could not join waitlist");
      }
    } catch (err) {
      setError("Failed to join waitlist. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <Paper
        p="md"
        radius="md"
        style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))",
          border: "1px solid rgba(99,102,241,0.3)",
          textAlign: "center",
        }}
      >
        <Stack gap="xs" align="center">
          <IconCheck size={28} color="#6366f1" />
          <Text size="sm" fw={600} c="white">
            You&apos;re on the waitlist!
          </Text>
          <Badge size="lg" color="violet" variant="light">
            Position #{result.position}
          </Badge>
          <Text size="xs" c="dimmed">
            We&apos;ll notify you at <strong>{email}</strong> when a spot opens up.
          </Text>
        </Stack>
      </Paper>
    );
  }

  if (!showForm) {
    return (
      <Button
        fullWidth
        variant="light"
        color="violet"
        size="md"
        leftSection={<IconListCheck size={18} />}
        onClick={() => setShowForm(true)}
        style={{
          borderRadius: "12px",
          border: "1px dashed rgba(139,92,246,0.4)",
        }}
      >
        Sold Out — Join Waitlist for {ticketName}
      </Button>
    );
  }

  return (
    <Paper
      p="md"
      radius="md"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <Stack gap="sm">
        <Group gap="xs">
          <IconListCheck size={18} color="#a78bfa" />
          <Text size="sm" fw={600} c="white">
            Join Waitlist — {ticketName}
          </Text>
        </Group>

        <TextInput
          placeholder="Your full name"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          size="sm"
          required
          styles={{
            input: {
              background: "rgba(255,255,255,0.05)",
              borderColor: "rgba(255,255,255,0.15)",
              color: "white",
            },
          }}
        />

        <TextInput
          placeholder="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          size="sm"
          required
          styles={{
            input: {
              background: "rgba(255,255,255,0.05)",
              borderColor: "rgba(255,255,255,0.15)",
              color: "white",
            },
          }}
        />

        <div>
          <PhoneInput
            international
            defaultCountry="NG"
            value={phone}
            onChange={(val) => setPhone(val || "")}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "8px",
              padding: "6px 12px",
              color: "white",
            }}
          />
        </div>

        {error && (
          <Text size="xs" c="red">
            {error}
          </Text>
        )}

        <Group gap="xs">
          <Button
            onClick={handleJoin}
            loading={loading}
            color="violet"
            size="sm"
            style={{ flex: 1 }}
          >
            Join Waitlist
          </Button>
          <Button
            variant="subtle"
            color="gray"
            size="sm"
            onClick={() => setShowForm(false)}
          >
            Cancel
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
}
