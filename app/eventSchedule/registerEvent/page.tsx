"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./styles.module.css";
import Modal from "@/components/Modal";
import { authenticatedRequest } from "@/app/services/auth";
import {
  Loader,
  Center,
  Text,
  Textarea,
  TextInput,
  Badge,
  Card,
  Group,
  Stack,
  ThemeIcon,
  Divider,
  Container,
  Paper,
} from "@mantine/core";
import {
  IconTicket,
  IconCreditCard,
  IconShield,
  IconUser,
  IconCalendarEvent,
  IconMapPin,
  IconClock,
} from "@tabler/icons-react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

interface EventData {
  id: string;
  title: string;
  description: string;
  price: string;
  location: string;
  start_date: string;
  end_date: string;
  customization?: {
    card_color: string;
  };
}

interface Ticket {
  id: string;
  event: string;
  category_name: "Paid" | "Free" | "Invite";
  category_price: string;
  name: string;
  quantity: string;
}

interface Question {
  id: string;
  type: "textarea" | "text" | "checkbox" | "select" | "radio";
  title: string;
  required: boolean;
  placeholder?: string;
  options?: Array<{ id: string; text: string }>;
  order: number;
}

interface Answer {
  questionId: string;
  value: string;
}

interface UserData {
  id: number;
  email: string;
  username: string;
  phone_number?: string;
}

interface AttendeeData {
  id: string;
  event: string;
  user: number;
  email: string;
  name: string;
  phone_number: string;
  payment_status: string;
  registration_date?: string;
  responses?: Array<{
    id: string;
    question: string;
    text_response: string;
    selected_options: Array<any>;
  }>;
  is_validated?: boolean;
  validated_at?: string | null;
}

interface AttendeeRequestPayload {
  event: string;
  ticket: string;
  user: number;
  email: string;
  name: string;
  phone_number: string;
  payment_status: string;
  responses: Array<{
    question: string;
    text_response?: string;
    selected_options?: Array<{ option: string }>;
  }>;
  [key: string]: unknown;
}

interface PaymentInitializationApiResponse {
  success: boolean;
  message: string;
  data?: {
    authorization_url: string;
    reference: string;
  };
  error_code?: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://keupass-48c2ae65f897.herokuapp.com/api";

export default function RegisterEvent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const eventId = searchParams.get("eventId");

  const [event, setEvent] = useState<EventData | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uiLoading, setUiLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fees = 50.0;

  const calculateTotal = (): number => {
    if (!selectedTicket) return 0;
    const ticket = tickets.find((t) => t.id === selectedTicket);
    if (!ticket) return 0;
    const ticketPrice = Number.parseFloat(ticket.category_price) || 0;
    return ticketPrice + fees;
  };

  useEffect(() => {
    if (eventId) {
      setUiLoading(true);
      fetchAllData().finally(() => setUiLoading(false));
    } else {
      setError("Event ID is missing in URL.");
      setLoading(false);
      setUiLoading(false);
    }
  }, [eventId]);

  async function fetchAllData() {
    if (!eventId) return;
    setLoading(true);
    setError(null);

    try {
      const userResponse = await authenticatedRequest<{
        success: boolean;
        data: UserData;
        message?: string;
      }>(`${API_BASE_URL}/users/me/`, "GET");
      if (userResponse?.success && userResponse.data) {
        setUser(userResponse.data);
        setPhoneNumber(userResponse.data.phone_number || "");
      } else {
        console.error("Failed to fetch user data:", userResponse?.message);
        setError(userResponse?.message || "Could not fetch user details.");
      }

      const eventResponse = await authenticatedRequest<{
        success: boolean;
        data: EventData;
        message?: string;
      }>(`${API_BASE_URL}/events/${eventId}/`, "GET");
      if (eventResponse?.success && eventResponse.data) {
        setEvent(eventResponse.data);
      } else {
        console.error("Failed to fetch event data:", eventResponse?.message);
        setError(eventResponse?.message || "Could not fetch event details.");
      }

      const ticketsResponse = await authenticatedRequest<{
        success: boolean;
        data: Ticket[];
        message?: string;
      }>(`${API_BASE_URL}/tickets/?event=${eventId}`, "GET");
      if (ticketsResponse?.success && ticketsResponse.data) {
        setTickets(ticketsResponse.data || []);
      } else {
        console.error("Failed to fetch tickets:", ticketsResponse?.message);
        setTickets([]);
      }

      const rawQuestionsResponse = await authenticatedRequest<
        Question[] | { success: boolean; data: Question[]; message?: string }
      >(`${API_BASE_URL}/event-forms/${eventId}/questions/`, "GET");

      let questionsData: Question[] | null = null;
      let qFetchSuccess = false;

      if (Array.isArray(rawQuestionsResponse)) {
        questionsData = rawQuestionsResponse;
        qFetchSuccess = true;
      } else if (
        rawQuestionsResponse?.success &&
        rawQuestionsResponse.data
      ) {
        questionsData = rawQuestionsResponse.data;
        qFetchSuccess = true;
      } else {
        console.error(
          "Failed to fetch questions. Resp:",
          rawQuestionsResponse
        );
      }

      if (qFetchSuccess && questionsData) {
        setQuestions(
          Array.isArray(questionsData)
            ? questionsData.sort((a, b) => a.order - b.order)
            : []
        );
      } else {
        setQuestions([]);
      }
    } catch (err: any) {
      console.error("Error in fetchAllData:", err);
      setError(err.message || "Failed to load event data.");
    } finally {
      setLoading(false);
    }
  }

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    setPhoneError(value ? null : "Phone number is required.");
  };

  const handlePurchase = async () => {
    if (!isMounted || !event || !user) return;
    if (!selectedTicket) {
      alert("Please select a ticket.");
      return;
    }
    if (!phoneNumber || phoneError) {
      alert("Valid phone number required.");
      return;
    }
    for (const q of questions.filter((q) => q.required)) {
      const ans = answers.find((a) => a.questionId === q.id);
      if (!ans?.value.trim()) {
        alert(`Please answer: "${q.title}"`);
        return;
      }
    }

    setPaymentLoading(true);

    try {
      const attendeePayload: AttendeeRequestPayload = {
        event: eventId!,
        ticket: selectedTicket,
        user: user.id,
        email: user.email,
        name: user.username,
        phone_number: phoneNumber,
        payment_status: "pending",
        responses: answers.map((a) => ({
          question: a.questionId,
          text_response: a.value,
        })),
      };

      const attendeeCreationResult = await authenticatedRequest<
        AttendeeData | { message: string }
      >(`${API_BASE_URL}/attendees/`, "POST", attendeePayload);

      if (
        !(
          attendeeCreationResult &&
          (attendeeCreationResult as AttendeeData).id
        )
      ) {
        const errorMessage =
          (attendeeCreationResult as { message?: string })?.message ||
          "Could not create attendee record.";
        alert(errorMessage);
        console.error("Attendee creation failed:", attendeeCreationResult);
        setPaymentLoading(false);
        return;
      }

      const attendee = attendeeCreationResult as AttendeeData;
      const ticketObj = tickets.find((t) => t.id === selectedTicket);

      if (ticketObj?.category_name === "Free") {
        setShowModal(true);
        setPaymentLoading(false);
        return;
      }

      const totalAmountForBackend = calculateTotal();
      if (totalAmountForBackend <= 0) {
        alert("Ticket price is invalid. Cannot proceed with payment.");
        setPaymentLoading(false);
        return;
      }

      const paymentInitPayload = {
        attendee_id: attendee.id,
        amount: totalAmountForBackend.toString(),
      };

      const initResponse =
        await authenticatedRequest<PaymentInitializationApiResponse>(
          `${API_BASE_URL}/payment/initialize/`,
          "POST",
          paymentInitPayload
        );

      if (initResponse?.success && initResponse.data?.authorization_url) {
        window.location.href = initResponse.data.authorization_url;
      } else {
        const msg =
          initResponse?.message ||
          "Failed to initialize payment. Please try again.";
        alert(msg);
        console.error("Payment initialization failed:", initResponse);
        setPaymentLoading(false);
      }
    } catch (err: any) {
      alert(err.message || "An error occurred during purchase.");
      console.error("Error in handlePurchase:", err);
      setPaymentLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    if (eventId) {
      setTimeout(() => router.push(`/eventSchedule/events/${eventId}`), 3000);
    }
  };

  const getTicketTypeIcon = (type: string) => {
    switch (type) {
      case "Free":
        return <IconTicket size={20} />;
      case "Paid":
        return <IconCreditCard size={20} />;
      case "Invite":
        return <IconShield size={20} />;
      default:
        return <IconTicket size={20} />;
    }
  };

  const getTicketTypeBadge = (type: string) => {
    const colors = {
      Free: "green",
      Paid: "blue",
      Invite: "orange",
    };
    return (
      <Badge
        color={colors[type as keyof typeof colors] || "gray"}
        variant="light"
        size="sm"
        className={styles.ticketBadge}
      >
        {type}
      </Badge>
    );
  };

  if (uiLoading || !isMounted) {
    return (
      <div className={styles.loadingContainer}>
        <Center style={{ height: "80vh", flexDirection: "column" }}>
          <Loader size="lg" color="#025a3a" />
          <Text mt="md" className={styles.loadingText}>
            Initializing...
          </Text>
        </Center>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Center style={{ height: "80vh", flexDirection: "column" }}>
          <Loader size="lg" color="#025a3a" />
          <Text mt="md" className={styles.loadingText}>
            Loading event details...
          </Text>
        </Center>
      </div>
    );
  }

  if (error || !event || !user) {
    return (
      <div className={styles.errorContainer}>
        <Center
          style={{
            height: "80vh",
            textAlign: "center",
            flexDirection: "column",
            padding: "20px",
          }}
        >
          <Text color="red" size="lg" mb="md">
            {error || "Event/User data could not be loaded."}
          </Text>
          <Text>Please refresh.</Text>
        </Center>
      </div>
    );
  }

  // Expanded palette of fallback colors
  const fallbackColors = [
    "#059669", // green
    "#2563eb", // blue
    "#d97706", // orange
    "#701a75", // purple
    "#ea580c", // amber
    "#be185d", // pink
    "#047857", // teal
    "#facc15", // yellow
    "#1e293b", // slate
    "#7c3aed", // violet
  ];

  // Determine current half-hour interval index
  const intervalIndex = Math.floor(Date.now() / (30 * 60 * 1000));

  return (
    <ProtectedRoute>
      <div className={styles.pageWrapper}>
        <Container size="xl" className={styles.container}>
          {/* Header Section */}
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <Badge
                size="lg"
                variant="gradient"
                gradient={{ from: "#025a3a", to: "#059669" }}
                className={styles.headerBadge}
              >
                Event Registration
              </Badge>
              <h1 className={styles.title}>Register For {event.title}</h1>
              <p className={styles.subtitle}>
                You are just one step away from securing your spot!
              </p>

              {/* Event Info Cards */}
              <div className={styles.eventInfoGrid}>
                <Card className={styles.eventInfoCard}>
                  <Group gap="xs">
                    <ThemeIcon size="sm" variant="light" color="green">
                      <IconCalendarEvent size={16} />
                    </ThemeIcon>
                    <Text size="sm" c="dimmed">
                      Event Date
                    </Text>
                  </Group>
                  <Text fw={500} size="sm">
                    {new Date(event.start_date).toLocaleDateString()}
                  </Text>
                </Card>

                <Card className={styles.eventInfoCard}>
                  <Group gap="xs">
                    <ThemeIcon size="sm" variant="light" color="green">
                      <IconMapPin size={16} />
                    </ThemeIcon>
                    <Text size="sm" c="dimmed">
                      Location
                    </Text>
                  </Group>
                  <Text fw={500} size="sm">
                    {event.location}
                  </Text>
                </Card>

                <Card className={styles.eventInfoCard}>
                  <Group gap="xs">
                    <ThemeIcon size="sm" variant="light" color="green">
                      <IconClock size={16} />
                    </ThemeIcon>
                    <Text size="sm" c="dimmed">
                      Duration
                    </Text>
                  </Group>
                  <Text fw={500} size="sm">
                    {new Date(event.start_date).toLocaleDateString()} -{" "}
                    {new Date(event.end_date).toLocaleDateString()}
                  </Text>
                </Card>
              </div>
            </div>
          </div>

          <div className={styles.formContainer}>
            {/* Main Form Section */}
            <div className={styles.formSection}>
              <Paper className={styles.formBox}>
                {/* User Info Section */}
                <div className={styles.sectionHeader}>
                  <Group gap="sm">
                    <ThemeIcon variant="light" color="green">
                      <IconUser size={20} />
                    </ThemeIcon>
                    <Text fw={600} size="lg">
                      Personal Information
                    </Text>
                  </Group>
                </div>

                <div className={styles.questionItem}>
                  <label
                    htmlFor="phone-number-input"
                    className={styles.questionLabel}
                  >
                    Phone Number <span className={styles.required}>*</span>
                  </label>
                  <PhoneInput
                    country={"ng"}
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    inputClass={styles.phoneInput}
                    buttonClass={styles.phoneButton}
                    containerClass={styles.phoneContainer}
                    inputProps={{
                      id: "phone-number-input",
                      required: true,
                      disabled: paymentLoading,
                    }}
                    specialLabel=""
                    enableSearch={true}
                    searchPlaceholder="Search country..."
                    searchNotFound="No country found"
                    preferredCountries={["ng", "us", "gb", "ca"]}
                  />
                  {phoneError && (
                    <Text size="xs" color="red" mt={5}>
                      {phoneError}
                    </Text>
                  )}
                </div>

                <Divider my="xl" />

                {/* Ticket Selection Section */}
                <div className={styles.sectionHeader}>
                  <Group gap="sm">
                    <ThemeIcon variant="light" color="green">
                      <IconTicket size={20} />
                    </ThemeIcon>
                    <Text fw={600} size="lg">
                      Select Your Ticket
                    </Text>
                  </Group>
                </div>

                {tickets.length === 0 && !loading && (
                  <div className={styles.noSelection}>
                    No tickets are currently available for this event.
                  </div>
                )}

                <div className={styles.ticketsGrid}>
                  {tickets.map((ticket, idx) => {
                    // First ticket uses backend color;
                    // subsequent tickets use a color that changes every 30 minutes
                    const cardColor =
                      idx === 0 && event.customization?.card_color
                        ? event.customization.card_color
                        : fallbackColors[
                            (intervalIndex + (idx - 1)) % fallbackColors.length
                          ];

                    return (
                      <div
                        key={ticket.id}
                        className={`${styles.ticketCard} ${
                          selectedTicket === ticket.id ? styles.selected : ""
                        }`}
                        style={{ background: cardColor }}
                        onClick={() =>
                          setSelectedTicket((cur) =>
                            cur === ticket.id ? null : ticket.id
                          )
                        }
                      >
                        <div className={styles.ticketHeader}>
                          <div className={styles.ticketIcon}>
                            {getTicketTypeIcon(ticket.category_name)}
                          </div>
                          {getTicketTypeBadge(ticket.category_name)}
                        </div>

                        <div className={styles.ticketContent}>
                          <Text
                            fw={600}
                            size="lg"
                            className={styles.ticketName}
                          >
                            {ticket.name}
                          </Text>
                          <Text size="sm" className={styles.eventName}>
                            {event.title}
                          </Text>
                        </div>

                        <div className={styles.ticketPrice}>
                          <Text size="xs" className={styles.ticketPrice}>
                            PRICE
                          </Text>
                          <Text
                            fw={700}
                            size="xl"
                            className={styles.priceAmount}
                          >
                            ₦
                            {Number.parseFloat(
                              ticket.category_price
                            ).toFixed(2)}
                          </Text>
                        </div>

                        <div className={styles.ticketPerforations}></div>

                        {selectedTicket === ticket.id && (
                          <div className={styles.selectedIndicator}>
                            <IconTicket size={16} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Paper>
            </div>

            {/* Summary Section */}
            <div className={styles.summarySection}>
              <Paper className={styles.summaryBox}>
                {/* Questions Section */}
                {questions.length > 0 && selectedTicket && (
                  <>
                    <Divider my="xl" />
                    <div className={styles.questionsSection}>
                      <div className={styles.sectionHeader}>
                        <Text fw={600} size="lg">
                          Additional Information
                        </Text>
                        <Text size="sm" c="dimmed">
                          Please provide the following details
                        </Text>
                      </div>

                      <Stack gap="md">
                        {questions.map((q) => (
                          <div key={q.id} className={styles.questionItem}>
                            <label
                              htmlFor={`question-${q.id}`}
                              className={styles.questionLabel}
                            >
                              {q.title || "Unnamed Question"}
                              {q.required && (
                                <span className={styles.required}>*</span>
                              )}
                            </label>
                            {q.type === "textarea" ? (
                              <Textarea
                                id={`question-${q.id}`}
                                placeholder={
                                  q.placeholder || "Your answer here..."
                                }
                                value={
                                  answers.find((a) => a.questionId === q.id)
                                    ?.value || ""
                                }
                                onChange={(e) => {
                                  const currentValue = e.currentTarget.value;
                                  setAnswers((prev) => {
                                    const idx = prev.findIndex(
                                      (a) => a.questionId === q.id
                                    );
                                    const newAnswer = {
                                      questionId: q.id,
                                      value: currentValue,
                                    };
                                    if (idx > -1) {
                                      const copy = [...prev];
                                      copy[idx] = newAnswer;
                                      return copy;
                                    }
                                    return [...prev, newAnswer];
                                  });
                                }}
                                required={q.required}
                                className={styles.questionInput}
                                minRows={3}
                                disabled={paymentLoading}
                              />
                            ) : (
                              <TextInput
                                id={`question-${q.id}`}
                                placeholder={
                                  q.placeholder || "Your answer here..."
                                }
                                value={
                                  answers.find((a) => a.questionId === q.id)
                                    ?.value || ""
                                }
                                onChange={(e) => {
                                  const currentValue = e.currentTarget.value;
                                  setAnswers((prev) => {
                                    const idx = prev.findIndex(
                                      (a) => a.questionId === q.id
                                    );
                                    const newAnswer = {
                                      questionId: q.id,
                                      value: currentValue,
                                    };
                                    if (idx > -1) {
                                      const copy = [...prev];
                                      copy[idx] = newAnswer;
                                      return copy;
                                    }
                                    return [...prev, newAnswer];
                                  });
                                }}
                                required={q.required}
                                className={styles.input}
                                disabled={paymentLoading}
                              />
                            )}
                          </div>
                        ))}
                      </Stack>
                    </div>
                  </>
                )}
                <div className={styles.summaryHeader}>
                  <Group gap="sm">
                    <ThemeIcon variant="light" color="green">
                      <IconCreditCard size={20} />
                    </ThemeIcon>
                    <Text fw={600} size="lg">
                      Order Summary
                    </Text>
                  </Group>
                </div>

                <div className={styles.summaryContent}>
                  {selectedTicket &&
                  tickets.find((t) => t.id === selectedTicket) ? (
                    <>
                      <div className={styles.summaryItem}>
                        <Text size="sm">
                          Ticket (
                          {
                            tickets.find((t) => t.id === selectedTicket)
                              ?.name
                          }
                          )
                        </Text>
                        <Text fw={500}>
                          ₦{(calculateTotal() - fees).toFixed(2)}
                        </Text>
                      </div>
                      <div className={styles.summaryItem}>
                        <Text size="sm">Service Fee</Text>
                        <Text fw={500}>₦{fees.toFixed(2)}</Text>
                      </div>
                      <Divider my="md" />
                      <div className={styles.summaryTotal}>
                        <Text fw={700} size="lg">
                          Total Amount
                        </Text>
                        <Text fw={700} size="xl" className={styles.totalPrice}>
                          ₦{calculateTotal().toFixed(2)}
                        </Text>
                      </div>
                    </>
                  ) : (
                    <div className={styles.noSelection}>
                      Please select a ticket to see the summary.
                    </div>
                  )}
                </div>

                <button
                  className={styles.purchaseBtn}
                  disabled={
                    !selectedTicket ||
                    !!phoneError ||
                    paymentLoading ||
                    !event ||
                    !user ||
                    !isMounted
                  }
                  onClick={handlePurchase}
                >
                  {paymentLoading ? (
                    <Group gap="xs">
                      <Loader size="sm" color="white" />
                      <Text>Processing...</Text>
                    </Group>
                  ) : (
                    <Group gap="xs">
                      <IconCreditCard size={20} />
                      <Text>Proceed to Payment</Text>
                    </Group>
                  )}
                </button>

                {error && (
                  <Text size="xs" color="red" ta="center" mt="xs">
                    {error}
                  </Text>
                )}
              </Paper>
            </div>
          </div>
        </Container>

        <Modal
          show={showModal}
          onClose={closeModal}
          title="Registration Successful!"
          message={
            event
              ? `Registered for "${event.title}". Confirmation sent. Redirecting...`
              : "Registration successful!"
          }
        />
      </div>
    </ProtectedRoute>
  );
}
