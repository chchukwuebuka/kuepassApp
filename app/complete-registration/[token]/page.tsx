"use client";

import { useState, useEffect, useCallback } from "react";
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
  Clock,
  User,
  ListChecks,
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

interface ItineraryItem {
  host: string;
  title: string;
  activity?: string;
  end_time: string;
  start_time: string;
  description?: string;
  image?: string;
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
    itinerary?: ItineraryItem[];
    customization?: {
      banner_url?: string | string[];
      card_color?: string;
    };
  };
  questions: Question[];
  existing_responses?: any[];
  selected_itinerary?: ItineraryItem[];
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
  const [selectedItinerary, setSelectedItinerary] = useState<ItineraryItem[]>([]);

  const toggleItineraryItem = useCallback((item: ItineraryItem) => {
    setSelectedItinerary((prev) => {
      const exists = prev.some(
        (i) => i.title === item.title && i.start_time === item.start_time
      );
      if (exists) {
        return prev.filter(
          (i) => !(i.title === item.title && i.start_time === item.start_time)
        );
      }
      return [...prev, item];
    });
  }, []);

  const isItinerarySelected = useCallback(
    (item: ItineraryItem) =>
      selectedItinerary.some(
        (i) => i.title === item.title && i.start_time === item.start_time
      ),
    [selectedItinerary]
  );

  // Fetch pre-registration data, then also fetch full event details for banner + questions
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/preregistration/${token}/`);
        const json = await res.json();

        if (res.ok && json.success) {
          const preRegData = json.data as PreRegData;
          setIsUsed(json.is_used || false);

          if (preRegData.selected_itinerary) {
            setSelectedItinerary(preRegData.selected_itinerary);
          }

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

          if (preRegData.existing_responses) {
            preRegData.existing_responses.forEach((resp) => {
              const qType = questions.find((q: Question) => q.id === resp.question)?.type;
              if (qType === "checkbox") {
                initial[resp.question] = resp.selected_options.map((o: any) => o.option);
              } else if (qType === "radio" || qType === "select") {
                initial[resp.question] = resp.selected_options[0]?.option || "";
              } else {
                initial[resp.question] = resp.text_response || "";
              }
            });
          }

          setResponses(initial);
        } else if (res.status === 410) {
          setPageError(
            json.error || "This registration link has expired."
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
          body: JSON.stringify({
            responses: responsePayload,
            selected_itinerary: selectedItinerary.length > 0 ? selectedItinerary : [],
          }),
        }
      );

      const json = await res.json();

      if (res.ok && json.success) {
        setSuccess(true);
        setIsUsed(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => setSuccess(false), 8000);
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
              background: "linear-gradient(135deg, rgba(239,68,68,0.05), rgba(239,68,68,0.01))",
              border: "1px solid rgba(239,68,68,0.2)",
              boxShadow: "0 20px 60px rgba(239,68,68,0.1)",
            }}
          >
            <>
              <div
                style={{
                  ...styles.iconCircle,
                  background:
                    "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))",
                  boxShadow: "0 8px 32px rgba(239, 68, 68, 0.2)",
                }}
              >
                <XCircle size={40} color="#ef4444" />
              </div>
              <Text size="xl" fw={700} c="white" mb="sm">
                Unavailable
              </Text>
              <Text size="md" c="dimmed" mb="xl">
                {pageError}
              </Text>
            </>
            <Button
              color="gray"
              size="lg"
              radius="xl"
              onClick={() => router.push("/")}
              style={{ fontWeight: 600, padding: "0 32px" }}
            >
              Go to Home
            </Button>
          </div>
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
                  backdropFilter: "blur(10px)",
                }}
              >
                Pre-Registration
              </Badge>
            </div>
          </div>
        )}

        {/* Success Banner */}
        {success && (
          <div
            style={{
              padding: "20px 24px",
              background: "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))",
              borderRadius: "16px",
              border: "1px solid rgba(34,197,94,0.3)",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "24px",
              boxShadow: "0 12px 40px rgba(34, 197, 94, 0.15)",
              marginTop: bannerUrl ? "24px" : "0", 
            }}
          >
            <div style={{ padding: "8px", background: "rgba(34,197,94,0.2)", borderRadius: "50%" }}>
              <CheckCircle size={24} color="#22c55e" />
            </div>
            <div>
              <Text size="lg" fw={700} c="white">
                {isUsed ? "Registration Updated Successfully!" : "Registration Complete! 🎉"}
              </Text>
              <Text size="sm" c="gray.3" mt={4}>
                Your event details have been {isUsed ? "updated" : "saved"}. You can revisit this page anytime.
              </Text>
            </div>
          </div>
        )}

        {/* Event Info Card */}
        <div
          style={{
            ...styles.card,
            marginBottom: "24px",
            borderTop: `4px solid ${cardColor}`,
            marginTop: (bannerUrl && !success) ? "-40px" : "0", 
            zIndex: 10,
          }}
        >
          <div style={{ textAlign: "center" as const, marginBottom: "32px" }}>
            {!bannerUrl && !success && (
              <Badge
                size="sm"
                variant="light"
                color="yellow"
                style={{ marginBottom: "16px" }}
              >
                Pre-Registration
              </Badge>
            )}
            <Text size="xl" fw={800} c="white" mb="sm" style={{ letterSpacing: "-0.5px" }}>
              {data.event.title}
            </Text>
            <Text size="md" c="dimmed">
              Hello{" "}
              <strong style={{ color: "white" }}>{data.attendee.name}</strong>,
              complete your registration below.
            </Text>
          </div>

          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.06)",
              paddingTop: "16px",
            }}
          >
            <div style={styles.infoRow}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(245, 182, 69, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Calendar size={18} color="#F5B645" />
              </div>
              <Text size="sm" c="gray.4" style={{ flex: 1, lineHeight: 1.4 }}>
                {formatDate(data.event.start_date)}
              </Text>
            </div>
            <div style={styles.infoRow}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(245, 182, 69, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MapPin size={18} color="#F5B645" />
              </div>
              <Text size="sm" c="gray.4" style={{ flex: 1, lineHeight: 1.4 }}>
                {data.event.address || data.event.location || "TBA"}
              </Text>
            </div>
            <div style={{ ...styles.infoRow, borderBottom: "none", paddingBottom: 0 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(245, 182, 69, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Ticket size={18} color="#F5B645" />
              </div>
              <Text size="sm" c="gray.4" style={{ flex: 1 }}>
                Ticket:{" "}
                <strong style={{ color: "white", letterSpacing: "1px", fontFamily: "monospace", fontSize: "16px" }}>
                  {data.attendee.ticket_code}
                </strong>
              </Text>
            </div>
          </div>
        </div>

        {/* Itinerary Selection Card */}
        {data.event.itinerary && data.event.itinerary.length > 0 && (
          <div style={{ ...styles.card, padding: "32px 24px", marginBottom: "24px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <div style={{ padding: "8px", background: "rgba(139, 92, 246, 0.1)", borderRadius: "10px" }}>
                <ListChecks size={22} color="#8b5cf6" />
              </div>
              <Text size="xl" fw={700} c="white">
                Event Itinerary
              </Text>
            </div>
            <Text size="sm" c="gray.4" mb="xl">
              Select the sessions you plan to attend. This helps the organizer plan accordingly.
            </Text>

            <Stack gap="md">
              {data.event.itinerary.map((item, index) => {
                const selected = isItinerarySelected(item);
                return (
                  <div
                    key={`${item.title}-${item.start_time}-${index}`}
                    onClick={() => toggleItineraryItem(item)}
                    style={{
                      padding: "20px",
                      background: selected
                        ? "rgba(139, 92, 246, 0.08)"
                        : "rgba(255, 255, 255, 0.015)",
                      borderRadius: "16px",
                      border: selected
                        ? "1.5px solid rgba(139, 92, 246, 0.4)"
                        : "1px solid rgba(255, 255, 255, 0.04)",
                      cursor: "pointer",
                      transition: "all 0.25s ease",
                      boxShadow: selected
                        ? "0 4px 20px rgba(139, 92, 246, 0.15)"
                        : "none",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "16px",
                      }}
                    >
                      {/* Checkbox indicator */}
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "8px",
                          border: selected
                            ? "2px solid #8b5cf6"
                            : "2px solid rgba(255,255,255,0.15)",
                          background: selected
                            ? "linear-gradient(135deg, #8b5cf6, #7c3aed)"
                            : "rgba(0,0,0,0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "2px",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {selected && (
                          <CheckCircle size={14} color="white" />
                        )}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1 }}>
                        <Text size="md" fw={600} c="white" mb={4}>
                          {item.title}
                        </Text>
                        {item.description && (
                          <Text size="sm" c="gray.4" mb={8} style={{ lineHeight: 1.5 }}>
                            {item.description}
                          </Text>
                        )}

                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap" as const,
                            gap: "12px",
                            marginTop: "8px",
                          }}
                        >
                          {/* Time badge */}
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "4px 10px",
                              background: "rgba(245, 182, 69, 0.08)",
                              borderRadius: "8px",
                              border: "1px solid rgba(245, 182, 69, 0.15)",
                            }}
                          >
                            <Clock size={13} color="#F5B645" />
                            <Text size="xs" c="gray.3" fw={500}>
                              {item.start_time} — {item.end_time}
                            </Text>
                          </div>

                          {/* Host badge */}
                          {item.host && (
                            <div
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "4px 10px",
                                background: "rgba(139, 92, 246, 0.08)",
                                borderRadius: "8px",
                                border: "1px solid rgba(139, 92, 246, 0.15)",
                              }}
                            >
                              <User size={13} color="#8b5cf6" />
                              <Text size="xs" c="gray.3" fw={500}>
                                {item.host}
                              </Text>
                            </div>
                          )}
                        </div>

                        {/* Activity detail */}
                        {item.activity && (
                          <Text size="xs" c="gray.5" mt={8} style={{ fontStyle: "italic", lineHeight: 1.4 }}>
                            {item.activity}
                          </Text>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </Stack>

            {selectedItinerary.length > 0 && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px 16px",
                  background: "rgba(139, 92, 246, 0.06)",
                  borderRadius: "12px",
                  border: "1px solid rgba(139, 92, 246, 0.15)",
                  textAlign: "center" as const,
                }}
              >
                <Text size="sm" c="gray.3" fw={500}>
                  {selectedItinerary.length} session{selectedItinerary.length !== 1 ? "s" : ""} selected
                </Text>
              </div>
            )}
          </div>
        )}

        {/* Questions Form Card */}
        {hasQuestions ? (
          <div style={{ ...styles.card, padding: "32px 24px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <div style={{ padding: "8px", background: "rgba(245, 182, 69, 0.1)", borderRadius: "10px" }}>
                <ClipboardList size={22} color="#F5B645" />
              </div>
              <Text size="xl" fw={700} c="white">
                Follow-up Questions
              </Text>
            </div>
            <Text size="sm" c="gray.4" mb="xl">
              The event organizer requires the following information to complete
              your registration.
            </Text>

            <Stack gap="xl">
              {data.questions.map((q, index) => (
                <div key={q.id} style={styles.questionBlock}>
                  <Text size="md" fw={600} c="white" mb={12}>
                    {index + 1}. {q.title}
                    {q.required && (
                      <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>
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
                      size="lg"
                      styles={{
                        input: {
                          background: "rgba(0,0,0,0.15)",
                          borderColor: "rgba(255,255,255,0.08)",
                          color: "white",
                          borderRadius: "12px",
                          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                          "&:focus": {
                            borderColor: "#F5B645",
                            boxShadow: "0 0 0 4px rgba(245, 182, 69, 0.1)",
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
                      size="lg"
                      styles={{
                        input: {
                          background: "rgba(0,0,0,0.15)",
                          borderColor: "rgba(255,255,255,0.08)",
                          color: "white",
                          borderRadius: "12px",
                          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                          "&:focus": {
                            borderColor: "#F5B645",
                            boxShadow: "0 0 0 4px rgba(245, 182, 69, 0.1)",
                          },
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
                      size="lg"
                      styles={{
                        input: {
                          background: "rgba(0,0,0,0.15)",
                          borderColor: "rgba(255,255,255,0.08)",
                          color: "white",
                          borderRadius: "12px",
                          transition: "border-color 0.2s ease",
                          "&:focus": {
                            borderColor: "#F5B645",
                          },
                        },
                        dropdown: {
                          background: "#10101A",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "12px",
                        },
                        option: {
                          color: "white",
                          borderRadius: "8px",
                          "&[data-selected]": { background: "rgba(245, 182, 69, 0.2)", color: "#F5B645" },
                          "&[data-hovered]": { background: "rgba(255,255,255,0.05)" },
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
                      <Stack gap="sm" mt={8}>
                        {q.options.map((o) => (
                          <Radio
                            key={o.id}
                            value={o.id}
                            label={
                              <Text size="md" c="gray.3">
                                {o.text}
                              </Text>
                            }
                            styles={{
                              radio: {
                                background: "rgba(0,0,0,0.2)",
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
                      <Stack gap="sm" mt={8}>
                        {q.options.map((o) => (
                          <Checkbox
                            key={o.id}
                            value={o.id}
                            label={
                              <Text size="md" c="gray.3">
                                {o.text}
                              </Text>
                            }
                            styles={{
                              input: {
                                background: "rgba(0,0,0,0.2)",
                                borderColor: "rgba(255,255,255,0.2)",
                              },
                            }}
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
                    gap: "10px",
                    justifyContent: "center",
                    padding: "16px",
                    background: "rgba(239,68,68,0.1)",
                    borderRadius: "12px",
                    border: "1px solid rgba(239,68,68,0.2)",
                  }}
                >
                  <AlertCircle size={18} color="#ef4444" />
                  <Text size="sm" c="red" fw={500}>
                    {error}
                  </Text>
                </div>
              )}

              <Button
                fullWidth
                size="xl"
                radius="xl"
                onClick={handleSubmit}
                loading={submitting}
                leftSection={<CheckCircle size={20} />}
                style={{
                  background: `linear-gradient(135deg, ${cardColor}, ${cardColor}dd)`,
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "16px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                {isUsed ? "Update Details" : "Complete Registration"}
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
                "linear-gradient(135deg, rgba(34,197,94,0.05), rgba(34,197,94,0.01))",
              border: "1px solid rgba(34,197,94,0.2)",
            }}
          >
            <div
              style={{
                ...styles.iconCircle,
                background:
                  "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))",
                boxShadow: "0 8px 32px rgba(34, 197, 94, 0.2)",
              }}
            >
              <CheckCircle size={40} color="#22c55e" />
            </div>
            <Text size="xl" fw={700} c="white" mb="xs">
              You&apos;re All Set!
            </Text>
            <Text size="md" c="dimmed" mb="lg">
              No additional information is needed. Your registration is
              complete.
            </Text>
            <Text size="sm" c="gray.5">
              Check your email for your confirmation and ticket QR code.
            </Text>
          </div>
        )}

        {/* Footer */}
        <Text size="sm" c="dimmed" ta="center" mt="xl" style={{ opacity: 0.6 }}>
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
      "linear-gradient(180deg, #05050A 0%, #10101A 50%, #0a0a1a 100%)",
    padding: "60px 20px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  container: {
    width: "100%",
    maxWidth: "580px",
    margin: "0 auto",
  },
  card: {
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "24px",
    padding: "40px",
    backdropFilter: "blur(40px)",
    WebkitBackdropFilter: "blur(40px)",
    boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
    position: "relative",
    overflow: "hidden",
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    color: "rgba(255,255,255,0.6)",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: 500,
    marginBottom: "24px",
    transition: "color 0.2s ease, transform 0.2s ease",
  },
  bannerWrapper: {
    borderRadius: "20px",
    overflow: "hidden",
    marginBottom: "24px",
    position: "relative" as const,
    height: "240px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.05)",
  },
  bannerImage: {
    width: "100%",
    height: "240px",
    objectFit: "cover" as const,
    display: "block",
  },
  bannerOverlay: {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: "120px",
    background:
      "linear-gradient(to top, rgba(5,5,10,0.95), transparent)",
    pointerEvents: "none" as const,
  },
  bannerContent: {
    position: "absolute" as const,
    bottom: "20px",
    left: "24px",
    zIndex: 2,
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  iconCircle: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 24px",
    boxShadow: "0 8px 32px rgba(34, 197, 94, 0.2)",
  },
  ticketCodeBox: {
    background: "rgba(0, 0, 0, 0.3)",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "32px",
    border: "1px dashed rgba(255,255,255,0.15)",
    boxShadow: "inset 0 4px 12px rgba(0,0,0,0.2)",
  },
  questionBlock: {
    padding: "20px",
    background: "rgba(255, 255, 255, 0.015)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.04)",
  },
};
