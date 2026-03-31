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
  Badge,
  Image,
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
  order?: number;
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
    customization?: {
      banner_url?: string | string[];
      card_color?: string;
    };
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
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [cardColor, setCardColor] = useState<string>("#025a3a");

  // Fetch pre-registration data, then also fetch full event details for banner + questions
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/preregistration/${token}/`);
        const json = await res.json();

        if (res.ok && json.success) {
          const preRegData = json.data as PreRegData;

          // Try to fetch full event details (to get banner_url from customization)
          try {
            const eventRes = await fetch(
              `${API_BASE_URL}/events/${preRegData.event.id}/`
            );
            const eventJson = await eventRes.json();
            const fullEvent = eventJson?.data || eventJson;

            if (fullEvent?.customization?.banner_url) {
              const bannerData = fullEvent.customization.banner_url;
              if (Array.isArray(bannerData) && bannerData.length > 0) {
                const firstValid = bannerData.find(
                  (u: string) =>
                    typeof u === "string" && u.startsWith("http")
                );
                if (firstValid) setBannerUrl(firstValid);
              } else if (
                typeof bannerData === "string" &&
                bannerData.startsWith("http")
              ) {
                setBannerUrl(bannerData);
              }
            }

            if (fullEvent?.customization?.card_color) {
              setCardColor(fullEvent.customization.card_color);
            }
          } catch {
            // Non-fatal - banner won't display
          }

          // If preregistration has no questions, try fetching from event-forms
          let questions = preRegData.questions || [];
          if (questions.length === 0) {
            try {
              const qRes = await fetch(
                `${API_BASE_URL}/event-forms/${preRegData.event.id}/questions/`
              );
              if (qRes.ok) {
                const qJson = await qRes.json();
                const qData = qJson?.data || qJson;
                if (Array.isArray(qData) && qData.length > 0) {
                  questions = qData.sort(
                    (a: any, b: any) => (a.order || 0) - (b.order || 0)
                  );
                }
              }
            } catch {
              // Non-fatal
            }
          }

          preRegData.questions = questions;
          setData(preRegData);

          // Initialize responses
          const initial: Record<string, any> = {};
          questions.forEach((q: Question) => {
            if (q.type === "checkbox") {
              initial[q.id] = [];
            } else {
              initial[q.id] = "";
            }
          });
          setResponses(initial);
        } else if (res.status === 410) {
          setIsUsed(true);
          setPageError(
            json.error || "This registration has already been completed."
          );
        } else {
          setPageError(json.error || "Invalid registration link.");
        }
      } catch (err) {
        setPageError(
          "Network error. Please check your connection and try again."
        );
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
      const responsePayload = data.questions
        .filter(
          (q) =>
            responses[q.id] &&
            (typeof responses[q.id] === "string"
              ? responses[q.id].trim()
              : true)
        )
        .map((q) => {
          const val = responses[q.id];

          if (q.type === "checkbox" && Array.isArray(val)) {
            return {
              question: q.id,
              text_response: null,
              selected_options: val.map((optId: string) => ({
                option: optId,
              })),
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

      const res = await fetch(
        `${API_BASE_URL}/preregistration/${token}/complete/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ responses: responsePayload }),
        }
      );

      const json = await res.json();

      if (res.ok && json.success) {
        setSuccess(true);
      } else {
        setError(
          json.error || "Failed to complete registration. Please try again."
        );
      }
    } catch (err) {
      setError(
        "Network error. Please check your connection and try again."
      );
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

  // ─── LOADING ─────────────────────────────────
  if (loading) {
    return (
      <div style={styles.page}>
        <Center style={{ minHeight: "80vh" }}>
          <Stack align="center" gap="md">
            <Loader color="white" size="lg" />
            <Text c="dimmed" size="sm">
              Loading your registration...
            </Text>
          </Stack>
        </Center>
      </div>
    );
  }

  // ─── ERROR / USED TOKEN ──────────────────────
  if (pageError) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <Link href="/" style={styles.backLink}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div
            style={{
              ...styles.card,
              textAlign: "center" as const,
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
                <div
                  style={{
                    ...styles.iconCircle,
                    background:
                      "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(99,102,241,0.1))",
                  }}
                >
                  <CheckCircle size={32} color="#22c55e" />
                </div>
                <Text size="xl" fw={700} c="white" mb="sm">
                  Already Completed
                </Text>
                <Text size="sm" c="dimmed" mb="lg">
                  You&apos;ve already completed your registration. Check your
                  email for your confirmation and QR code.
                </Text>
              </>
            ) : (
              <>
                <XCircle
                  size={48}
                  color="#ef4444"
                  style={{ margin: "0 auto 16px" }}
                />
                <Text size="xl" fw={700} c="white" mb="sm">
                  Invalid Link
                </Text>
                <Text size="sm" c="dimmed" mb="lg">
                  {pageError}
                </Text>
              </>
            )}
            <Button
              color={isUsed ? "green" : "gray"}
              mt="md"
              onClick={() => router.push("/")}
            >
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── SUCCESS ─────────────────────────────────
  if (success) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          {/* Banner on success */}
          {bannerUrl && (
            <div style={styles.bannerWrapper}>
              <Image
                src={bannerUrl}
                alt={data?.event.title || "Event"}
                style={styles.bannerImage}
                fallbackSrc="/images/placeholder.jpg"
              />
              <div style={styles.bannerOverlay} />
            </div>
          )}

          <div
            style={{
              ...styles.card,
              textAlign: "center" as const,
              background:
                "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.03))",
              border: "1px solid rgba(34,197,94,0.3)",
            }}
          >
            <div
              style={{
                ...styles.iconCircle,
                background:
                  "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(99,102,241,0.1))",
              }}
            >
              <CheckCircle size={32} color="#22c55e" />
            </div>
            <Text size="xl" fw={700} c="white" mb="xs">
              Registration Complete! 🎉
            </Text>
            <Text size="sm" c="dimmed" mb="md">
              Your registration for{" "}
              <strong style={{ color: "#F5B645" }}>
                {data?.event.title}
              </strong>{" "}
              is confirmed.
            </Text>
            <Text size="xs" c="dimmed" mb="xl">
              A confirmation email with your QR code has been sent to{" "}
              <strong style={{ color: "white" }}>
                {data?.attendee.email}
              </strong>
              .
            </Text>

            <div style={styles.ticketCodeBox}>
              <Text size="xs" c="dimmed" mb={4}>
                Ticket Code
              </Text>
              <Text
                size="lg"
                fw={700}
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

          <Text size="xs" c="dimmed" ta="center" mt="xl">
            Powered by{" "}
            <a
              href="https://kuepass.com"
              style={{
                color: "#F5B645",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Kuepass
            </a>
          </Text>
        </div>
      </div>
    );
  }

  // ─── MAIN FORM ───────────────────────────────
  if (!data) return null;

  const hasQuestions = data.questions.length > 0;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <Link href="/" style={styles.backLink}>
          <ArrowLeft size={16} /> Back to Home
        </Link>

        {/* Banner Image */}
        {bannerUrl && (
          <div style={styles.bannerWrapper}>
            <Image
              src={bannerUrl}
              alt={data.event.title}
              style={styles.bannerImage}
              fallbackSrc="/images/placeholder.jpg"
            />
            <div style={styles.bannerOverlay} />
            <div style={styles.bannerContent}>
              <Badge
                size="sm"
                variant="filled"
                style={{
                  background: "rgba(245,182,69,0.9)",
                  color: "#000",
                  fontWeight: 600,
                }}
              >
                Pre-Registration
              </Badge>
            </div>
          </div>
        )}

        {/* Event Info Card */}
        <div
          style={{
            ...styles.card,
            marginBottom: "16px",
            borderTop: `3px solid ${cardColor}`,
          }}
        >
          <div style={{ textAlign: "center" as const, marginBottom: "20px" }}>
            {!bannerUrl && (
              <Badge
                size="sm"
                variant="light"
                color="yellow"
                style={{ marginBottom: "12px" }}
              >
                Pre-Registration
              </Badge>
            )}
            <Text size="xl" fw={700} c="white" mb="xs">
              {data.event.title}
            </Text>
            <Text size="sm" c="dimmed">
              Hello{" "}
              <strong style={{ color: "white" }}>{data.attendee.name}</strong>,
              complete your registration below.
            </Text>
          </div>

          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.06)",
              paddingTop: "12px",
            }}
          >
            <div style={styles.infoRow}>
              <Calendar size={16} color="#F5B645" />
              <Text size="sm" c="dimmed">
                {formatDate(data.event.start_date)}
              </Text>
            </div>
            <div style={styles.infoRow}>
              <MapPin size={16} color="#F5B645" />
              <Text size="sm" c="dimmed">
                {data.event.address || data.event.location || "TBA"}
              </Text>
            </div>
            <div style={{ ...styles.infoRow, borderBottom: "none" }}>
              <Ticket size={16} color="#F5B645" />
              <Text size="sm" c="dimmed">
                Ticket:{" "}
                <strong style={{ color: "white" }}>
                  {data.attendee.ticket_code}
                </strong>
              </Text>
            </div>
          </div>
        </div>

        {/* Questions Form Card */}
        {hasQuestions ? (
          <div style={styles.card}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "24px",
              }}
            >
              <ClipboardList size={20} color="#F5B645" />
              <Text size="lg" fw={600} c="white">
                Follow-up Questions
              </Text>
            </div>
            <Text size="xs" c="dimmed" mb="lg">
              The event organizer requires the following information to complete
              your registration.
            </Text>

            <Stack gap="lg">
              {data.questions.map((q, index) => (
                <div key={q.id} style={styles.questionBlock}>
                  <Text size="sm" fw={500} c="white" mb={6}>
                    {index + 1}. {q.title}
                    {q.required && (
                      <span style={{ color: "#ef4444", marginLeft: "4px" }}>
                        *
                      </span>
                    )}
                  </Text>

                  {/* Text input */}
                  {(q.type === "text" ||
                    q.type === "short_text" ||
                    q.type === "email" ||
                    q.type === "number" ||
                    q.type === "phone") && (
                    <TextInput
                      placeholder={q.placeholder || "Your answer..."}
                      value={responses[q.id] || ""}
                      onChange={(e) =>
                        updateResponse(q.id, e.currentTarget.value)
                      }
                      size="md"
                      styles={{
                        input: {
                          background: "rgba(255,255,255,0.06)",
                          borderColor: "rgba(255,255,255,0.15)",
                          color: "white",
                          borderRadius: "10px",
                          "&:focus": {
                            borderColor: "#F5B645",
                          },
                        },
                      }}
                    />
                  )}

                  {/* Long text */}
                  {(q.type === "long_text" ||
                    q.type === "textarea" ||
                    q.type === "paragraph") && (
                    <Textarea
                      placeholder={q.placeholder || "Your answer..."}
                      value={responses[q.id] || ""}
                      onChange={(e) =>
                        updateResponse(q.id, e.currentTarget.value)
                      }
                      minRows={3}
                      size="md"
                      styles={{
                        input: {
                          background: "rgba(255,255,255,0.06)",
                          borderColor: "rgba(255,255,255,0.15)",
                          color: "white",
                          borderRadius: "10px",
                        },
                      }}
                    />
                  )}

                  {/* Select dropdown */}
                  {q.type === "select" && (
                    <Select
                      placeholder="Select an option"
                      data={q.options.map((o) => ({
                        value: o.id,
                        label: o.text,
                      }))}
                      value={responses[q.id] || null}
                      onChange={(val) => updateResponse(q.id, val)}
                      size="md"
                      styles={{
                        input: {
                          background: "rgba(255,255,255,0.06)",
                          borderColor: "rgba(255,255,255,0.15)",
                          color: "white",
                          borderRadius: "10px",
                        },
                        dropdown: {
                          background: "#1a1a2e",
                          border: "1px solid rgba(255,255,255,0.15)",
                        },
                        option: {
                          color: "white",
                          "&[data-selected]": { background: "#F5B645" },
                        },
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
                            label={
                              <Text size="sm" c="dimmed">
                                {o.text}
                              </Text>
                            }
                            styles={{
                              radio: {
                                background: "rgba(255,255,255,0.05)",
                                borderColor: "rgba(255,255,255,0.2)",
                              },
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
                            label={
                              <Text size="sm" c="dimmed">
                                {o.text}
                              </Text>
                            }
                          />
                        ))}
                      </Stack>
                    </Checkbox.Group>
                  )}
                </div>
              ))}

              {error && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    justifyContent: "center",
                    padding: "12px",
                    background: "rgba(239,68,68,0.1)",
                    borderRadius: "10px",
                    border: "1px solid rgba(239,68,68,0.2)",
                  }}
                >
                  <AlertCircle size={16} color="#ef4444" />
                  <Text size="sm" c="red">
                    {error}
                  </Text>
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
                  background: `linear-gradient(135deg, ${cardColor}, ${cardColor}dd)`,
                  color: "#fff",
                  fontWeight: 600,
                  height: "52px",
                  fontSize: "16px",
                  border: "none",
                  transition: "all 0.2s ease",
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
              ...styles.card,
              textAlign: "center" as const,
              background:
                "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.03))",
              border: "1px solid rgba(34,197,94,0.3)",
            }}
          >
            <div
              style={{
                ...styles.iconCircle,
                background:
                  "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(99,102,241,0.1))",
              }}
            >
              <CheckCircle size={32} color="#22c55e" />
            </div>
            <Text size="xl" fw={700} c="white" mb="sm">
              You&apos;re All Set!
            </Text>
            <Text size="sm" c="dimmed" mb="md">
              No additional information is needed. Your registration is
              complete.
            </Text>
            <Text size="xs" c="dimmed">
              Check your email for your confirmation and QR code.
            </Text>
          </div>
        )}

        {/* Footer */}
        <Text size="xs" c="dimmed" ta="center" mt="xl">
          Powered by{" "}
          <a
            href="https://kuepass.com"
            style={{
              color: "#F5B645",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Kuepass
          </a>
        </Text>
      </div>
    </div>
  );
}

// ─── Inline Styles ─────────────────────────────
const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 50%, #16213e 100%)",
    padding: "40px 20px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  container: {
    maxWidth: "580px",
    margin: "0 auto",
  },
  card: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "32px",
    backdropFilter: "blur(20px)",
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    color: "rgba(255,255,255,0.5)",
    textDecoration: "none",
    fontSize: "14px",
    marginBottom: "20px",
    transition: "color 0.2s ease",
  },
  bannerWrapper: {
    borderRadius: "16px",
    overflow: "hidden",
    marginBottom: "16px",
    position: "relative" as const,
    height: "220px",
  },
  bannerImage: {
    width: "100%",
    height: "220px",
    objectFit: "cover" as const,
    display: "block",
  },
  bannerOverlay: {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: "80px",
    background:
      "linear-gradient(to top, rgba(10,10,26,0.9), transparent)",
    pointerEvents: "none" as const,
  },
  bannerContent: {
    position: "absolute" as const,
    bottom: "16px",
    left: "20px",
    zIndex: 2,
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  iconCircle: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
  },
  ticketCodeBox: {
    background: "rgba(255,255,255,0.03)",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "20px",
  },
  questionBlock: {
    padding: "16px",
    background: "rgba(255,255,255,0.02)",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.05)",
  },
};
