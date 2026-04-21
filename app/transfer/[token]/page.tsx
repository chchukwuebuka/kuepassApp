"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { TextInput, Button, Text, Stack, Loader, Center } from "@mantine/core";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import Link from "next/link";

const sharedStyles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 50%, #16213e 100%)",
    padding: "40px 20px",
  },
  container: {
    maxWidth: "520px",
    margin: "0 auto",
  },
  card: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "32px",
    backdropFilter: "blur(20px)",
  },
  iconWrapper: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(99,102,241,0.1))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    color: "rgba(255,255,255,0.5)",
    textDecoration: "none",
    fontSize: "14px",
    marginBottom: "20px",
  },
};

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://api.kuepass.com/api/"
).replace(/\/$/, "");

export default function AcceptTransferPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = params?.token;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/transfers/accept/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transfer_token: token,
          new_name: name.trim(),
          new_email: email.trim(),
          new_phone: phone || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || "Failed to accept transfer. The link may be expired.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={sharedStyles.page}>
        <div style={sharedStyles.container}>
          <div
            style={{
              ...sharedStyles.card,
              textAlign: "center",
              background: "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.03))",
              border: "1px solid rgba(239,68,68,0.3)",
            }}
          >
            <XCircle size={48} color="#ef4444" style={{ margin: "0 auto 16px" }} />
            <Text size="xl" fw={700} c="white" mb="sm">
              Invalid Transfer Link
            </Text>
            <Text size="sm" c="dimmed">
              This link appears to be invalid. Please check with the person who sent it.
            </Text>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={sharedStyles.page}>
      <div style={sharedStyles.container}>
        <Link href="/" style={sharedStyles.backLink}>
          <ArrowLeft size={16} /> Back to Home
        </Link>

        {result ? (
          <div
            style={{
              ...sharedStyles.card,
              textAlign: "center",
              background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.03))",
              border: "1px solid rgba(34,197,94,0.3)",
            }}
          >
            <div style={sharedStyles.iconWrapper}>
              <CheckCircle size={32} color="#22c55e" />
            </div>
            <Text size="xl" fw={700} c="white" mb="xs">
              Ticket Transferred!
            </Text>
            <Text size="sm" c="dimmed" mb="md">
              Your new ticket has been activated with a new QR code.
            </Text>
            {result.new_qr_code && (
              <Text size="xs" c="dimmed" mb="md">
                QR Code: <strong>{result.new_qr_code}</strong>
              </Text>
            )}
            <Text size="xs" c="dimmed">
              Check your email at <strong>{email}</strong> for your ticket details.
            </Text>
            <Button
              color="green"
              mt="lg"
              onClick={() => router.push("/")}
            >
              Go to Home
            </Button>
          </div>
        ) : (
          <div style={sharedStyles.card}>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={sharedStyles.iconWrapper}>
                <CheckCircle size={28} color="#22c55e" />
              </div>
              <Text size="xl" fw={700} c="white" mb="xs">
                Accept Ticket Transfer
              </Text>
              <Text size="sm" c="dimmed">
                Someone is transferring their event ticket to you. Enter your details below to accept.
              </Text>
            </div>

            <Stack gap="md">
              <div>
                <Text size="xs" fw={500} c="dimmed" mb={4}>
                  Your Full Name
                </Text>
                <TextInput
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.currentTarget.value)}
                  size="md"
                  required
                  styles={{
                    input: {
                      background: "rgba(255,255,255,0.05)",
                      borderColor: "rgba(255,255,255,0.15)",
                      color: "white",
                    },
                  }}
                />
              </div>

              <div>
                <Text size="xs" fw={500} c="dimmed" mb={4}>
                  Your Email
                </Text>
                <TextInput
                  placeholder="you@email.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  size="md"
                  required
                  styles={{
                    input: {
                      background: "rgba(255,255,255,0.05)",
                      borderColor: "rgba(255,255,255,0.15)",
                      color: "white",
                    },
                  }}
                />
              </div>

              <div>
                <Text size="xs" fw={500} c="dimmed" mb={4}>
                  Phone Number
                </Text>
                <PhoneInput
                  international
                  defaultCountry="NG"
                  value={phone}
                  onChange={(val) => setPhone(val || "")}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "8px",
                    padding: "8px 14px",
                    color: "white",
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
                color="green"
                onClick={handleAccept}
                loading={loading}
                leftSection={<CheckCircle size={18} />}
                style={{ borderRadius: "12px" }}
              >
                Accept Transfer
              </Button>
            </Stack>
          </div>
        )}
      </div>
    </div>
  );
}
