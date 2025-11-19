"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import styles from "./styles.module.css";
import QRCodePopup from "@/components/QRCodePopup";
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
  Select,
  Checkbox,
  Radio,
  Button,
  Alert,
} from "@mantine/core";
import {
  IconTicket,
  IconCreditCard,
  IconShield,
  IconUser,
  IconCalendarEvent,
  IconMapPin,
  IconClock,
  IconMail,
  IconPhone,
  IconCheck,
  IconAlertCircle,
} from "@tabler/icons-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
// --- INTERFACES ---
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

interface QuestionOption {
  id: string;
  text: string;
}

interface Question {
  id: string;
  type: "textarea" | "text" | "checkbox" | "select" | "radio" | "email";
  title: string;
  required: boolean;
  placeholder?: string;
  options?: QuestionOption[];
  order: number;
}

interface Answer {
  questionId: string;
  value: string | string[];
}

interface AttendeeRequestPayload {
  event: string;
  ticket: string;
  email: string;
  name: string;
  phone_number: string;
  payment_status: string;
  responses: Array<{
    question: string;
    text_response?: string;
    selected_options?: Array<{ option: string }>;
  }>;
}

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://api.kuepass.com/api/"
).replace(/\/$/, "");

export default function ManualRegisterEvent() {
  const params = useParams<{ eventId?: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get eventId from URL params (priority) or query string (fallback)
  // Filter out invalid values like "[eventId]" literal string
  const eventId = useMemo(() => {
    const paramId = params?.eventId;
    const queryId = searchParams.get("eventId");

    // Check if paramId is valid (not the literal "[eventId]" string)
    if (paramId && paramId !== "[eventId]" && !paramId.includes("[")) {
      return paramId;
    }

    // Fallback to query param if valid
    if (queryId && queryId !== "[eventId]" && !queryId.includes("[")) {
      return queryId;
    }

    return "";
  }, [params?.eventId, searchParams]);

  const [event, setEvent] = useState<EventData | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [registeredAttendeeId, setRegisteredAttendeeId] = useState<
    string | null
  >(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Cross-event registration prevention
  const [existingRegEventId, setExistingRegEventId] = useState<string | null>(
    null
  );
  const [checkingExisting, setCheckingExisting] = useState(false);
  const [crossEventError, setCrossEventError] = useState<string | null>(null);

  // Form data for manual registration
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });
  const [selectedCountryCode, setSelectedCountryCode] = useState("+234"); // Store country code separately
  const [formErrors, setFormErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only proceed if eventId exists and is valid
  useEffect(() => {
    // Check if eventId is empty or invalid (contains brackets, which means it's the literal "[eventId]")
    if (
      !eventId ||
      eventId === "[eventId]" ||
      eventId.includes("[") ||
      eventId.includes("]")
    ) {
      setError(
        "No eventId provided in the URL. Please use /eventSchedule/manual-register/[eventId] or /eventSchedule/manual-register?eventId={eventId}"
      );
      setLoading(false);
      return;
    }
    fetchAllData(eventId);
  }, [eventId]);

  // Auto-select first ticket when tickets are loaded
  useEffect(() => {
    if (tickets.length > 0 && !selectedTicket) {
      setSelectedTicket(tickets[0].id);
    }
  }, [tickets, selectedTicket]);

  const fees = 50.0;

  const calculateTotal = (): number => {
    if (!selectedTicket) return 0;
    const ticket = tickets.find((t) => t.id === selectedTicket);
    if (!ticket) return 0;
    const ticketPrice = Number.parseFloat(ticket.category_price) || 0;
    return ticketPrice > 0 ? ticketPrice + fees : 0;
  };

  async function fetchAllData(eventId: string) {
    setLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel for faster loading
      const [eventResponse, ticketsResponse, questionsResponse] =
        await Promise.all([
          fetch(`${API_BASE_URL}/events/${eventId}/`),
          fetch(`${API_BASE_URL}/tickets/?event=${eventId}`),
          fetch(`${API_BASE_URL}/event-forms/${eventId}/questions/`),
        ]);

      // Process event data
      if (eventResponse.ok) {
        const eventData = await eventResponse.json();
        const eventResult = eventData?.data || eventData;

        if (eventResult && eventResult.id) {
          setEvent(eventResult as EventData);
        } else {
          throw new Error("Event data not found in response.");
        }
      } else {
        throw new Error("Could not fetch event details.");
      }

      // Process tickets data
      if (ticketsResponse.ok) {
        const ticketsData = await ticketsResponse.json();
        const ticketsResult = ticketsData?.data || ticketsData;
        setTickets(Array.isArray(ticketsResult) ? ticketsResult : []);
      } else {
        setTickets([]);
      }

      // Process questions data
      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json();
        const questionsResult = questionsData?.data || questionsData;
        setQuestions(
          Array.isArray(questionsResult)
            ? questionsResult.sort((a, b) => a.order - b.order)
            : []
        );
      } else {
        setQuestions([]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load event data.");
    } finally {
      setLoading(false);
    }
  }

  const handlePhoneChange = (value: string, countryData: any) => {
    // Track country code from countryData
    if (countryData?.dialCode) {
      const code = `+${countryData.dialCode}`;
      setSelectedCountryCode(code);
    }

    // value from react-phone-input-2 includes the country code prefix (e.g., "2348101234567")
    // Extract only the local number by removing the country code digits
    const dialCode =
      countryData?.dialCode || selectedCountryCode.replace("+", "") || "234";
    let localNumber = value;

    // Remove country code prefix if it exists at the start
    const dialCodeStr = String(dialCode);
    if (value.startsWith(dialCodeStr)) {
      localNumber = value.substring(dialCodeStr.length);
    }

    // Store only the local number (without country code) in formData
    setFormData((prev) => ({ ...prev, phoneNumber: localNumber }));

    // Validate phone number (check local number length)
    const digitsOnly = localNumber.replace(/\D/g, "");
    if (!localNumber || digitsOnly.length < 7) {
      setFormErrors((prev) => ({
        ...prev,
        phoneNumber: "Please enter a valid phone number.",
      }));
    } else {
      setFormErrors((prev) => ({ ...prev, phoneNumber: "" }));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: "" }));

    // Clear cross-event error when email changes
    if (field === "email") {
      setCrossEventError(null);
      setExistingRegEventId(null);
    }
  };

  // Frontend guard: check if this email already registered for another event
  const checkExistingRegistration = async (email: string) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    if (!eventId) return;

    try {
      setCheckingExisting(true);
      // Check if email is registered for any event
      const res = await fetch(
        `${API_BASE_URL}/attendees/?email=${encodeURIComponent(email)}`
      );

      if (res.ok) {
        const data = await res.json();
        const rows: any[] = Array.isArray(data)
          ? data
          : data?.results || data?.data || [];

        // If they've registered for a different event, block registration
        const otherEvent = rows.find(
          (row) => String(row.event) && String(row.event) !== String(eventId)
        );

        if (otherEvent) {
          setExistingRegEventId(String(otherEvent.event));
          setCrossEventError(
            "This email is already registered for a different event. You cannot register for another event with the same email."
          );
        } else {
          setExistingRegEventId(null);
          setCrossEventError(null);
        }
      }
    } catch {
      // Non-fatal; let backend enforce hard rule
    } finally {
      setCheckingExisting(false);
    }
  };

  const validateForm = () => {
    const errors = {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
    };

    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required.";
    }
    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required.";
    }
    if (!formData.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address.";
    }
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required.";
    } else if (formData.phoneNumber.trim().length < 10) {
      errors.phoneNumber = "Please enter a valid phone number.";
    }

    // Validate required questions
    for (const question of questions) {
      if (question.required) {
        const answer = answers.find((a) => a.questionId === question.id);
        if (!answer?.value) {
          alert(`Please answer the required question: ${question.title}`);
          return false;
        }
        if (Array.isArray(answer.value) && answer.value.length === 0) {
          alert(`Please answer the required question: ${question.title}`);
          return false;
        }
        if (typeof answer.value === "string" && answer.value.trim() === "") {
          alert(`Please answer the required question: ${question.title}`);
          return false;
        }
      }
    }

    setFormErrors(errors);
    return !Object.values(errors).some((error) => error !== "");
  };

  const updateAnswer = (questionId: string, value: string | string[]) => {
    setAnswers((prevAnswers) => {
      const existingAnswerIndex = prevAnswers.findIndex(
        (a) => a.questionId === questionId
      );
      const newAnswer = { questionId, value };
      if (existingAnswerIndex > -1) {
        const updatedAnswers = [...prevAnswers];
        updatedAnswers[existingAnswerIndex] = newAnswer;
        return updatedAnswers;
      }
      return [...prevAnswers, newAnswer];
    });
  };

  const handleRegistration = async () => {
    if (!isMounted || !event) return;

    if (!validateForm()) {
      return;
    }

    // Frontend cross-event lock
    if (existingRegEventId && existingRegEventId !== String(eventId)) {
      alert(
        "You are already registered for a different event with this email. Please use the same event link or a different email."
      );
      return;
    }

    if (!eventId) {
      alert("Event ID is missing. Please refresh the page.");
      return;
    }

    if (!selectedTicket) {
      alert("Please select a ticket.");
      return;
    }

    setPaymentLoading(true);
    setError(null);

    try {
      // Format phone number - combine country code with local number
      const localNumber = formData.phoneNumber.replace(/\D/g, ""); // Remove any non-digits from local number
      const formattedPhone = `${selectedCountryCode}${localNumber}`;

      const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;

      // Prepare request body - use dynamic eventId and selectedTicket
      const requestBody: any = {
        event: String(eventId),
        ticket: String(selectedTicket),
        email: formData.email.trim(),
        name: fullName,
        phone_number: formattedPhone,
        payment_status: "bypassed",
        registration_source: "manual_entry", // Track manual registrations
        responses: answers.map((answer) => ({
          question: answer.questionId,
          text_response:
            typeof answer.value === "string" ? answer.value : undefined,
          selected_options: Array.isArray(answer.value)
            ? answer.value.map((val) => ({ option: val }))
            : undefined,
        })),
      };

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      try {
        const response = await fetch(`${API_BASE_URL}/attendees/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

          try {
            const errorText = await response.text();
            const errorData = JSON.parse(errorText);
            errorMessage =
              errorData.detail ||
              errorData.message ||
              errorData.error ||
              errorMessage;
          } catch {
            // If parsing fails, use default error message
          }

          throw new Error(errorMessage);
        }

        const result = await response.json();

        // Handle different response structures from backend
        const attendeeId =
          result.id ||
          result.attendee_id ||
          result.data?.id ||
          result.data?.attendee_id;

        if (!attendeeId) {
          throw new Error(
            "Registration successful but attendee ID not found in response."
          );
        }

        // Store the attendee ID for QR code generation
        setRegisteredAttendeeId(attendeeId);
        setShowQRModal(true);
        setPaymentLoading(false);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);

        if (fetchError.name === "AbortError") {
          throw new Error(
            "Request timed out. Please check your connection and try again."
          );
        }
        throw fetchError;
      }
    } catch (err: any) {
      console.error("Failed to add attendee:", err);

      let errorMessage = "An error occurred during registration.";

      if (err instanceof TypeError && err.message === "Failed to fetch") {
        errorMessage =
          "Network error: Unable to connect to the server. Please check your internet connection and try again.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      alert(errorMessage);
      setPaymentLoading(false);
    }
  };

  const closeQRModal = () => {
    setShowQRModal(false);
    setRegisteredAttendeeId(null);
    // Reset form after successful registration
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
    });
    setSelectedCountryCode("+234"); // Reset to default
    setFormErrors({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
    });
    setAnswers([]);
    setExistingRegEventId(null);
    setCrossEventError(null);
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
    const colors: { [key: string]: string } = {
      Free: "green",
      Paid: "blue",
      Invite: "orange",
    };
    return (
      <Badge
        color={colors[type] || "gray"}
        variant="light"
        size="sm"
        className={styles.ticketBadge}
      >
        {type}
      </Badge>
    );
  };

  if (!isMounted) {
    return (
      <Center style={{ height: "80vh", flexDirection: "column" }}>
        <Loader size="lg" color="#025a3a" />
        <Text mt="md">Initializing...</Text>
      </Center>
    );
  }

  if (loading) {
    return (
      <Center style={{ height: "80vh", flexDirection: "column" }}>
        <Loader size="lg" color="#025a3a" />
        <Text mt="md">Loading event details...</Text>
      </Center>
    );
  }

  if (error || !eventId || !event) {
    return (
      <Center
        style={{
          height: "80vh",
          textAlign: "center",
          flexDirection: "column",
          padding: "20px",
        }}
      >
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error"
          color="red"
          mb="md"
        >
          {error || "Event data could not be loaded."}
        </Alert>
        <Button
          onClick={() => router.push("/eventSchedule/exploreEvent")}
          leftSection={<IconCalendarEvent size={16} />}
        >
          Back to Events
        </Button>
      </Center>
    );
  }

  const fallbackColors = [
    "#059669",
    "#2563eb",
    "#d97706",
    "#701a75",
    "#ea580c",
    "#be185d",
    "#047857",
    "#facc15",
    "#1e293b",
    "#7c3aed",
  ];
  const intervalIndex = Math.floor(Date.now() / (30 * 60 * 1000));

  return (
    <div className={styles.pageWrapper}>
      <Container size="xl" className={styles.container}>
        {/* Header Section */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <Group
              justify="space-between"
              align="center"
              className={styles.headerTop}
            >
              <Badge
                size="lg"
                variant="gradient"
                gradient={{ from: "#025a3a", to: "#059669" }}
                className={styles.headerBadge}
              >
                Event Registration
              </Badge>
              <Button
                variant="light"
                color="green"
                leftSection={<IconCalendarEvent size={16} />}
                onClick={() => router.push("/")}
                className={styles.homeButton}
              >
                Home
              </Button>
            </Group>
            <h1 className={styles.title}>Register For {event.title}</h1>
            <p className={styles.subtitle}>
              You are just one step away from securing your spot!
            </p>
            <div className={styles.eventInfoGrid}></div>
          </div>
        </div>

        {/* Cross-event registration lock notice */}
        {crossEventError && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            mb="lg"
            title="Registration Restricted"
          >
            {crossEventError}
          </Alert>
        )}

        <div className={styles.formContainer}>
          {/* Main Form Section */}
          <div className={styles.formSection}>
            <Paper className={styles.formBox}>
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

              <div className={styles.formGrid}>
                <div className={styles.questionItem}>
                  <label className={styles.questionLabel}>
                    First Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.currentTarget.value)
                    }
                    className={styles.input}
                    disabled={paymentLoading}
                  />
                  {formErrors.firstName && (
                    <Text size="xs" color="red" mt={5}>
                      {formErrors.firstName}
                    </Text>
                  )}
                </div>

                <div className={styles.questionItem}>
                  <label className={styles.questionLabel}>
                    Last Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.currentTarget.value)
                    }
                    className={styles.input}
                    disabled={paymentLoading}
                  />
                  {formErrors.lastName && (
                    <Text size="xs" color="red" mt={5}>
                      {formErrors.lastName}
                    </Text>
                  )}
                </div>

                <div className={styles.questionItem}>
                  <label className={styles.questionLabel}>
                    Email Address <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) =>
                      handleInputChange("email", e.currentTarget.value)
                    }
                    onBlur={() =>
                      checkExistingRegistration(formData.email.trim())
                    }
                    className={styles.input}
                    disabled={paymentLoading || checkingExisting}
                  />
                  {checkingExisting && (
                    <Text size="xs" color="dimmed" mt={5}>
                      Checking registration status...
                    </Text>
                  )}
                  {formErrors.email && (
                    <Text size="xs" color="red" mt={5}>
                      {formErrors.email}
                    </Text>
                  )}
                </div>

                <div className={styles.questionItem}>
                  <label className={styles.questionLabel}>
                    Phone Number <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.phoneInputWrapper}>
                    <PhoneInput
                      country={"ng"}
                      value={
                        selectedCountryCode.replace("+", "") +
                        formData.phoneNumber
                      }
                      onChange={handlePhoneChange}
                      inputClass={styles.phoneInput}
                      buttonClass={styles.phoneButton}
                      containerClass={styles.phoneContainer}
                      inputProps={{
                        required: true,
                        disabled: paymentLoading,
                        placeholder: "810 123 4567",
                      }}
                      specialLabel=""
                      enableSearch={true}
                      searchPlaceholder="Search country..."
                      searchNotFound="No country found"
                      preferredCountries={["ng", "us", "gb", "ca"]}
                      disableCountryCode={false}
                      countryCodeEditable={false}
                      autoFormat={false}
                      prefix=""
                    />
                  </div>
                  {formErrors.phoneNumber && (
                    <Text size="xs" color="red" mt={5}>
                      {formErrors.phoneNumber}
                    </Text>
                  )}
                </div>
              </div>

              <Divider my="xl" />

              {/* Custom Questions Section */}
              {questions.length > 0 && (
                <div className={styles.sectionHeader}>
                  <Group gap="sm">
                    <ThemeIcon variant="light" color="green">
                      <IconTicket size={20} />
                    </ThemeIcon>
                    <Text fw={600} size="lg">
                      Additional Information
                    </Text>
                  </Group>
                  <Text size="sm" c="dimmed">
                    Please provide the following details ({questions.length}{" "}
                    questions)
                  </Text>
                </div>
              )}

              <Stack gap="md">
                {questions.map((q) => {
                  const currentAnswer = answers.find(
                    (a) => a.questionId === q.id
                  );
                  const hasValidOptions =
                    q.options &&
                    Array.isArray(q.options) &&
                    q.options.length > 0;

                  return (
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
                          placeholder={q.placeholder || "Your answer here..."}
                          value={(currentAnswer?.value as string) || ""}
                          onChange={(e) =>
                            updateAnswer(q.id, e.currentTarget.value)
                          }
                          required={q.required}
                          className={styles.questionInput}
                          minRows={3}
                          disabled={paymentLoading}
                        />
                      ) : q.type === "text" || q.type === "email" ? (
                        <input
                          id={`question-${q.id}`}
                          type={q.type === "email" ? "email" : "text"}
                          placeholder={q.placeholder || "Your answer here..."}
                          value={(currentAnswer?.value as string) || ""}
                          onChange={(e) =>
                            updateAnswer(q.id, e.currentTarget.value)
                          }
                          required={q.required}
                          className={styles.input}
                          disabled={paymentLoading}
                        />
                      ) : q.type === "select" ? (
                        hasValidOptions ? (
                          <Select
                            id={`question-${q.id}`}
                            placeholder={q.placeholder || "Select an option..."}
                            data={q.options!.map((opt) => ({
                              value: opt.id,
                              label: opt.text,
                            }))}
                            value={(currentAnswer?.value as string) || null}
                            onChange={(selectedValue) =>
                              updateAnswer(q.id, selectedValue || "")
                            }
                            required={q.required}
                            disabled={paymentLoading}
                            className={styles.input}
                            searchable
                            nothingFoundMessage="No options"
                          />
                        ) : (
                          <Text c="dimmed" size="sm" mt="xs">
                            No options available for this question.
                          </Text>
                        )
                      ) : q.type === "checkbox" ? (
                        hasValidOptions ? (
                          <Checkbox.Group
                            id={`question-${q.id}`}
                            value={(currentAnswer?.value as string[]) || []}
                            onChange={(selectedValues) =>
                              updateAnswer(q.id, selectedValues)
                            }
                            required={q.required}
                            className={styles.customCheckbox}
                          >
                            <Stack mt="xs" gap="xs">
                              {q.options!.map((opt) => (
                                <Checkbox
                                  key={opt.id}
                                  value={opt.id}
                                  label={opt.text}
                                  disabled={paymentLoading}
                                  className={styles.customCheckbox}
                                  styles={{
                                    input: {
                                      backgroundColor: "#15302B",
                                      borderColor: "#15302B",
                                      "&:checked": {
                                        backgroundColor: "#15302B !important",
                                        borderColor: "#15302B !important",
                                      },
                                      "&[data-checked]": {
                                        backgroundColor: "#15302B !important",
                                        borderColor: "#15302B !important",
                                      },
                                    },
                                    icon: {
                                      color: "white !important",
                                    },
                                  }}
                                />
                              ))}
                            </Stack>
                          </Checkbox.Group>
                        ) : (
                          <Text c="dimmed" size="sm" mt="xs">
                            No options available for this question.
                          </Text>
                        )
                      ) : q.type === "radio" ? (
                        hasValidOptions ? (
                          <Radio.Group
                            id={`question-${q.id}`}
                            value={(currentAnswer?.value as string) || ""}
                            onChange={(selectedValue) =>
                              updateAnswer(q.id, selectedValue)
                            }
                            required={q.required}
                          >
                            <Stack mt="xs" gap="xs">
                              {q.options!.map((opt) => (
                                <Radio
                                  key={opt.id}
                                  value={opt.id}
                                  label={opt.text}
                                  disabled={paymentLoading}
                                />
                              ))}
                            </Stack>
                          </Radio.Group>
                        ) : (
                          <Text c="dimmed" size="sm" mt="xs">
                            No options available for this question.
                          </Text>
                        )
                      ) : (
                        <TextInput
                          placeholder={`Unsupported question type: ${q.type}`}
                          disabled
                          className={styles.input}
                        />
                      )}
                    </div>
                  );
                })}
              </Stack>
            </Paper>
          </div>

          <div className={styles.summarySection}>
            <Paper className={styles.summaryBox}>
              {/* Order Summary */}
              <div className={styles.summaryHeader}></div>
              <div className={styles.summaryContent}>
                <Divider my="md" />
                <div className={styles.summaryTotal}>
                  <Text fw={700} size="lg">
                    Registration Status
                  </Text>
                  <Text fw={700} size="xl" className={styles.totalPrice}>
                    Free
                  </Text>
                </div>
              </div>
              <button
                className={styles.purchaseBtn}
                disabled={
                  !eventId ||
                  !selectedTicket ||
                  !formData.firstName ||
                  !formData.lastName ||
                  !formData.email ||
                  !formData.phoneNumber ||
                  Object.values(formErrors).some((error) => error !== "") ||
                  // Check required questions
                  questions.some((q) => {
                    if (!q.required) return false;
                    const answer = answers.find((a) => a.questionId === q.id);
                    if (!answer?.value) return true;
                    if (Array.isArray(answer.value))
                      return answer.value.length === 0;
                    if (typeof answer.value === "string")
                      return answer.value.trim() === "";
                    return true;
                  }) ||
                  paymentLoading ||
                  !event ||
                  !isMounted ||
                  !!crossEventError
                }
                onClick={handleRegistration}
              >
                {paymentLoading ? (
                  <Group justify="center" gap="xs">
                    <Loader size="sm" color="white" />
                    <Text>Processing...</Text>
                  </Group>
                ) : (
                  <Group justify="center" gap="xs">
                    <IconUser size={20} />
                    <Text>Register Now</Text>
                  </Group>
                )}
              </button>
            </Paper>
          </div>
        </div>
      </Container>
      <QRCodePopup
        show={showQRModal}
        onClose={closeQRModal}
        attendeeId={registeredAttendeeId || undefined}
        email={formData.email || undefined}
        eventId={eventId || event?.id || undefined}
      />
    </div>
  );
}
