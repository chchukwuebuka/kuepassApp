"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  TextInput,
  Textarea,
  Button,
  Text,
  Stack,
  Loader,
  Center,
  Select,
  Checkbox,
  Radio,
  Group,
  Badge,
} from "@mantine/core";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  ClipboardList,
  Calendar,
  MapPin,
  Ticket,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

const sharedStyles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 50%, #16213e 100%)",
    padding: "40px 20px",
  },
  container: {
    maxWidth: "560px",
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
  eventInfoRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
};

const inputStyles = {
  input: {
    background: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.15)",
    color: "white",
  },
};

interface QuestionOption {
  id: string;
  text: string;
}

interface Question {
  id: string;
  title: string;
  type: string;
  required: boolean;
  placeholder?: string;
  options: QuestionOption[];
}

interface PreRegData {
  attendee: {
    id: string;
    name: string;
    email: string;
    phone_number: string;
    ticket_code: string;
  };
  event: {
    id: string;
    title: string;
    description: string;
    start_date: string | null;
    end_date: string | null;
    location: string;
    address: string;
  };
  questions: Question[];
  token: string;
}

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://api.kuepass.com/api/"
).replace(/\/$/, "");

export default function CompleteRegistrationPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = params?.token;

  const [data, setData] = useState<PreRegData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [isUsed, setIsUsed] = useState(false);
  const [success, setSuccess] = useState(false);
  const [responses, setResponses] = useState<Record<string, any>>({});

  // Fetch pre-registration data
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/preregistration/${token}/`);
        const json = await res.json();

        if (res.ok && json.success) {
          setData(json.data);
          // Initialize responses
          const initial: Record<string, any> = {};
          json.data.questions.forEach((q: Question) => {
            if (q.type === "checkbox") {
              initial[q.id] = [];
            } else {
              initial[q.id] = "";
            }
          });
          setResponses(initial);
        } else if (res.status === 410) {
          setIsUsed(true);
          setPageError(json.error || "This registration has already been completed.");
        } else {
          setPageError(json.error || "Invalid registration link.");
        }
      } catch (err) {
        setPageError("Network error. Please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const updateResponse = (questionId: string, value: any) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!data) return;

    // Validate required questions
    for (const q of data.questions) {
      if (q.required) {
        const val = responses[q.id];
        if (!val || (Array.isArray(val) && val.length === 0)) {
          setError(`Please answer: "${q.title}"`);
          return;
        }
      }
    }

    setSubmitting(true);
    setError(null);

    try {
      // Build response payload
      const responsePayload = data.questions
        .filter((q) => responses[q.id] && (typeof responses[q.id] === "string" ? responses[q.id].trim() : true))
        .map((q) => {
          const val = responses[q.id];

          if (q.type === "checkbox" && Array.isArray(val)) {
            return {
              question: q.id,
              text_response: null,
              selected_options: val.map((optId: string) => ({ option: optId })),
            };
          } else if (q.type === "radio" || q.type === "select") {
            return {
              question: q.id,
              text_response: null,
              selected_options: val ? [{ option: val }] : [],
            };
          } else {
            return {
              question: q.id,
              text_response: val,
              selected_options: [],
            };
          }
        });

      const res = await fetch(`${API_BASE_URL}/preregistration/${token}/complete/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses: responsePayload }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setSuccess(true);
      } else {
        setError(json.error || "Failed to complete registration. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "TBA";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={sharedStyles.page}>
        <Center style={{ minHeight: "60vh" }}>
          <Stack align="center" gap="md">
            <Loader color="white" size="lg" />
            <Text c="dimmed" size="sm">Loading your registration...</Text>
          </Stack>
        </Center>
      </div>
    );
  }

  // Invalid / expired / used token
  if (pageError) {
    return (
      <div style={sharedStyles.page}>
        <div style={sharedStyles.container}>
          <Link href="/" style={sharedStyles.backLink}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div
            style={{
              ...sharedStyles.card,
              textAlign: "center",
              background: isUsed
                ? "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.03))"
                : "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.03))",
              border: isUsed
                ? "1px solid rgba(34,197,94,0.3)"
                : "1px solid rgba(239,68,68,0.3)",
            }}
          >
            {isUsed ? (
              <>
                <div style={{ ...sharedStyles.iconWrapper, background: "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(99,102,241,0.1))" }}>
                  <CheckCircle size={32} color="#22c55e" />
                </div>
                <Text size="xl" fw={700} c="white" mb="sm">
                  Already Completed
                </Text>
                <Text size="sm" c="dimmed" mb="lg">
                  You&apos;ve already completed your registration. Check your email for your confirmation and QR code.
                </Text>
              </>
            ) : (
              <>
                <XCircle size={48} color="#ef4444" style={{ margin: "0 auto 16px" }} />
                <Text size="xl" fw={700} c="white" mb="sm">
                  Invalid Link
                </Text>
                <Text size="sm" c="dimmed" mb="lg">
                  {pageError}
                </Text>
              </>
            )}
            <Button color={isUsed ? "green" : "gray"} mt="md" onClick={() => router.push("/")}>
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div style={sharedStyles.page}>
        <div style={sharedStyles.container}>
          <div
            style={{
              ...sharedStyles.card,
              textAlign: "center",
              background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.03))",
              border: "1px solid rgba(34,197,94,0.3)",
            }}
          >
            <div style={{ ...sharedStyles.iconWrapper, background: "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(99,102,241,0.1))" }}>
              <CheckCircle size={32} color="#22c55e" />
            </div>
            <Text size="xl" fw={700} c="white" mb="xs">
              Registration Complete! 🎉
            </Text>
            <Text size="sm" c="dimmed" mb="md">
              Your registration for <strong style={{ color: "#F5B645" }}>{data?.event.title}</strong> is confirmed.
            </Text>
            <Text size="xs" c="dimmed" mb="xl">
              A confirmation email with your QR code has been sent to{" "}
              <strong style={{ color: "white" }}>{data?.attendee.email}</strong>.
            </Text>

            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "20px",
              }}
            >
              <Text size="xs" c="dimmed" mb={4}>Ticket Code</Text>
              <Text
                size="lg"
                fw={700}
                c="white"
                style={{
                  fontFamily: "'Courier New', monospace",
                  letterSpacing: "3px",
                  background: "linear-gradient(135deg, #F5B645, #f59e0b)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {data?.attendee.ticket_code}
              </Text>
            </div>

            <Button
              color="green"
              size="md"
              onClick={() => router.push("/")}
              style={{ borderRadius: "12px" }}
            >
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main form
  if (!data) return null;

  return (
    <div style={sharedStyles.page}>
      <div style={sharedStyles.container}>
        <Link href="/" style={sharedStyles.backLink}>
          <ArrowLeft size={16} /> Back to Home
        </Link>

        {/* Event info card */}
        <div style={{ ...sharedStyles.card, marginBottom: "16px" }}>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <Badge
              size="sm"
              variant="light"
              color="yellow"
              style={{ marginBottom: "12px" }}
            >
              Pre-Registration
            </Badge>
            <Text size="xl" fw={700} c="white" mb="xs">
              {data.event.title}
            </Text>
            <Text size="sm" c="dimmed">
              Hello <strong style={{ color: "white" }}>{data.attendee.name}</strong>, complete your registration below.
            </Text>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}>
            <div style={sharedStyles.eventInfoRow}>
              <Calendar size={16} color="#F5B645" />
              <Text size="sm" c="dimmed">{formatDate(data.event.start_date)}</Text>
            </div>
            <div style={sharedStyles.eventInfoRow}>
              <MapPin size={16} color="#F5B645" />
              <Text size="sm" c="dimmed">{data.event.address || data.event.location || "TBA"}</Text>
            </div>
            <div style={{ ...sharedStyles.eventInfoRow, borderBottom: "none" }}>
              <Ticket size={16} color="#F5B645" />
              <Text size="sm" c="dimmed">
                Ticket: <strong style={{ color: "white" }}>{data.attendee.ticket_code}</strong>
              </Text>
            </div>
          </div>
        </div>

        {/* Questions form card */}
        {data.questions.length > 0 ? (
          <div style={sharedStyles.card}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
              <ClipboardList size={20} color="#F5B645" />
              <Text size="lg" fw={600} c="white">
                Follow-up Questions
              </Text>
            </div>

            <Stack gap="lg">
              {data.questions.map((q, index) => (
                <div key={q.id}>
                  <Text size="sm" fw={500} c="white" mb={6}>
                    {index + 1}. {q.title}
                    {q.required && <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>}
                  </Text>

                  {/* Text input */}
                  {(q.type === "text" || q.type === "short_text" || q.type === "email" || q.type === "number" || q.type === "phone") && (
                    <TextInput
                      placeholder={q.placeholder || "Your answer..."}
                      value={responses[q.id] || ""}
                      onChange={(e) => updateResponse(q.id, e.currentTarget.value)}
                      size="md"
                      styles={inputStyles}
                    />
                  )}

                  {/* Long text */}
                  {(q.type === "long_text" || q.type === "textarea" || q.type === "paragraph") && (
                    <Textarea
                      placeholder={q.placeholder || "Your answer..."}
                      value={responses[q.id] || ""}
                      onChange={(e) => updateResponse(q.id, e.currentTarget.value)}
                      minRows={3}
                      size="md"
                      styles={inputStyles}
                    />
                  )}

                  {/* Select dropdown */}
                  {q.type === "select" && (
                    <Select
                      placeholder="Select an option"
                      data={q.options.map((o) => ({ value: o.id, label: o.text }))}
                      value={responses[q.id] || null}
                      onChange={(val) => updateResponse(q.id, val)}
                      size="md"
                      styles={{
                        input: inputStyles.input,
                        dropdown: { background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.15)" },
                        option: { color: "white", "&[data-selected]": { background: "#F5B645" } },
                      }}
                    />
                  )}

                  {/* Radio buttons */}
                  {q.type === "radio" && (
                    <Radio.Group
                      value={responses[q.id] || ""}
                      onChange={(val) => updateResponse(q.id, val)}
                    >
                      <Stack gap="xs" mt={4}>
                        {q.options.map((o) => (
                          <Radio
                            key={o.id}
                            value={o.id}
                            label={<Text size="sm" c="dimmed">{o.text}</Text>}
                            styles={{
                              radio: { background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.2)" },
                            }}
                          />
                        ))}
                      </Stack>
                    </Radio.Group>
                  )}

                  {/* Checkboxes */}
                  {q.type === "checkbox" && (
                    <Checkbox.Group
                      value={responses[q.id] || []}
                      onChange={(val) => updateResponse(q.id, val)}
                    >
                      <Stack gap="xs" mt={4}>
                        {q.options.map((o) => (
                          <Checkbox
                            key={o.id}
                            value={o.id}
                            label={<Text size="sm" c="dimmed">{o.text}</Text>}
                          />
                        ))}
                      </Stack>
                    </Checkbox.Group>
                  )}
                </div>
              ))}

              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                  <AlertCircle size={16} color="#ef4444" />
                  <Text size="sm" c="red">{error}</Text>
                </div>
              )}

              <Button
                fullWidth
                size="lg"
                onClick={handleSubmit}
                loading={submitting}
                leftSection={<CheckCircle size={18} />}
                style={{
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #F5B645, #f59e0b)",
                  color: "#000",
                }}
              >
                Complete Registration
              </Button>
            </Stack>
          </div>
        ) : (
          /* No questions — auto-completion message */
          <div
            style={{
              ...sharedStyles.card,
              textAlign: "center",
              background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.03))",
              border: "1px solid rgba(34,197,94,0.3)",
            }}
          >
            <div style={{ ...sharedStyles.iconWrapper, background: "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(99,102,241,0.1))" }}>
              <CheckCircle size={32} color="#22c55e" />
            </div>
            <Text size="xl" fw={700} c="white" mb="sm">
              You&apos;re All Set!
            </Text>
            <Text size="sm" c="dimmed" mb="md">
              No additional information is needed. Your registration is complete.
            </Text>
            <Text size="xs" c="dimmed">
              Check your email for your confirmation and QR code.
            </Text>
          </div>
        )}

        {/* Footer */}
        <Text size="xs" c="dimmed" ta="center" mt="xl">
          Powered by{" "}
          <a href="https://kuepass.com" style={{ color: "#F5B645", textDecoration: "none", fontWeight: 600 }}>
            Kuepass
          </a>
        </Text>
      </div>
    </div>
  );
}
