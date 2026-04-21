"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextInput, Button, Text, Stack, Group, Loader } from "@mantine/core";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import styles from "./styles.module.css";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://api.kuepass.com/api/"
).replace(/\/$/, "");

export default function TransferPage() {
  const router = useRouter();
  const [attendeeId, setAttendeeId] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTransfer = async () => {
    if (!attendeeId.trim() || !recipientEmail.trim()) {
      setError("Ticket ID and recipient email are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/transfers/initiate/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendee_id: attendeeId.trim(),
          recipient_email: recipientEmail.trim(),
          recipient_name: recipientName.trim() || undefined,
          reason: reason.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || "Transfer failed. Please check your details.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const transferUrl =
    result?.transfer?.transfer_token
      ? `${typeof window !== "undefined" ? window.location.origin : ""}/transfer/${result.transfer.transfer_token}`
      : "";

  const handleCopyLink = () => {
    if (transferUrl) {
      navigator.clipboard.writeText(transferUrl);
    }
  };

  return (
    <div className={styles.transferPage}>
      <div className={styles.container}>
        <Link href="/dashboard" className={styles.backLink}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        {result ? (
          <div className={styles.successCard}>
            <div className={styles.iconWrapper}>
              <Send size={28} color="#22c55e" />
            </div>
            <h2 className={styles.title} style={{ color: "#22c55e" }}>
              Transfer Initiated!
            </h2>
            <p className={styles.subtitle}>
              Share this link with <strong>{recipientEmail}</strong> to complete the transfer:
            </p>
            <div className={styles.linkBox}>{transferUrl}</div>
            <Group justify="center" gap="sm" mt="md">
              <Button color="green" onClick={handleCopyLink}>
                Copy Link
              </Button>
              <Button
                variant="subtle"
                color="gray"
                onClick={() => router.push("/dashboard")}
              >
                Done
              </Button>
            </Group>
            <Text size="xs" c="dimmed" mt="md">
              The link expires in 48 hours. The recipient will need to enter their details to accept the transfer.
            </Text>
          </div>
        ) : (
          <div className={styles.card}>
            <div className={styles.header}>
              <div className={styles.iconWrapper}>
                <Send size={28} color="#a78bfa" />
              </div>
              <h1 className={styles.title}>Transfer Ticket</h1>
              <p className={styles.subtitle}>
                Send your ticket to someone else. They&apos;ll get a new QR code.
              </p>
            </div>

            <Stack gap="md">
              <div className={styles.inputGroup}>
                <div className={styles.inputLabel}>Your Ticket / Attendee ID</div>
                <TextInput
                  placeholder="Enter your attendee ID or ticket reference"
                  value={attendeeId}
                  onChange={(e) => setAttendeeId(e.currentTarget.value)}
                  size="md"
                  styles={{
                    input: {
                      background: "rgba(255,255,255,0.05)",
                      borderColor: "rgba(255,255,255,0.15)",
                      color: "white",
                    },
                  }}
                />
              </div>

              <div className={styles.inputGroup}>
                <div className={styles.inputLabel}>Recipient&apos;s Email</div>
                <TextInput
                  placeholder="friend@email.com"
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.currentTarget.value)}
                  size="md"
                  styles={{
                    input: {
                      background: "rgba(255,255,255,0.05)",
                      borderColor: "rgba(255,255,255,0.15)",
                      color: "white",
                    },
                  }}
                />
              </div>

              <div className={styles.inputGroup}>
                <div className={styles.inputLabel}>Recipient&apos;s Name (optional)</div>
                <TextInput
                  placeholder="John Doe"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.currentTarget.value)}
                  size="md"
                  styles={{
                    input: {
                      background: "rgba(255,255,255,0.05)",
                      borderColor: "rgba(255,255,255,0.15)",
                      color: "white",
                    },
                  }}
                />
              </div>

              <div className={styles.inputGroup}>
                <div className={styles.inputLabel}>Reason (optional)</div>
                <TextInput
                  placeholder="Can't make it anymore"
                  value={reason}
                  onChange={(e) => setReason(e.currentTarget.value)}
                  size="md"
                  styles={{
                    input: {
                      background: "rgba(255,255,255,0.05)",
                      borderColor: "rgba(255,255,255,0.15)",
                      color: "white",
                    },
                  }}
                />
              </div>

              {error && (
                <Text size="sm" c="red" ta="center">
                  {error}
                </Text>
              )}

              <Button
                fullWidth
                size="lg"
                color="violet"
                onClick={handleTransfer}
                loading={loading}
                leftSection={<Send size={18} />}
                style={{ borderRadius: "12px" }}
              >
                Initiate Transfer
              </Button>
            </Stack>
          </div>
        )}
      </div>
    </div>
  );
}
