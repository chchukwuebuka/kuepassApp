"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  registration_source_id?: string;
  responses: Array<{
    question: string;
    text_response?: string;
    selected_options?: Array<{ option: string }>;
  }>;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://keupass-48c2ae65f897.herokuapp.com/api";

export default function PartnerRegisterEvent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const eventId = searchParams.get("eventId");

  // Extract the referral/source ID directly from URL
  const registrationSourceId = searchParams.get("refId");

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

  // Form data for manual registration
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    title: "",
    institution: "",
  });
  const [formErrors, setFormErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    title: "",
    institution: "",
  });

  useEffect(() => {
    setIsMounted(true);
    // Log the registration source ID if present
    if (registrationSourceId) {
      console.log("🔗 Registration Source ID detected:", registrationSourceId);
    }
  }, [registrationSourceId]);

  const fees = 50.0;

  const calculateTotal = (): number => {
    if (!selectedTicket) return 0;
    const ticket = tickets.find((t) => t.id === selectedTicket);
    if (!ticket) return 0;
    const ticketPrice = Number.parseFloat(ticket.category_price) || 0;
    return ticketPrice > 0 ? ticketPrice + fees : 0;
  };

  useEffect(() => {
    // Hardcoded event ID
    const hardcodedEventId = "505";
    fetchAllData(hardcodedEventId);
  }, []);

  async function fetchAllData(eventId: string) {
    setLoading(true);
    setError(null);

    try {
      // Fetch event details
      const eventResponse = await fetch(`${API_BASE_URL}/events/${eventId}/`);
      if (eventResponse.ok) {
        const eventData = await eventResponse.json();
        console.log("Raw event data:", eventData);

        // Handle different response structures
        const eventResult = eventData?.data || eventData;
        console.log("Processed event data:", eventResult);

        if (eventResult && eventResult.id) {
          setEvent(eventResult as EventData);
          console.log("Event set successfully:", eventResult.title);
        } else {
          throw new Error("Event data not found in response.");
        }
      } else {
        setError("Could not fetch event details.");
      }

      // Fetch tickets
      const ticketsResponse = await fetch(
        `${API_BASE_URL}/tickets/?event=${eventId}`
      );
      if (ticketsResponse.ok) {
        const ticketsData = await ticketsResponse.json();
        setTickets(ticketsData || []);
      } else {
        setTickets([]);
      }

      // Fetch questions
      const questionsResponse = await fetch(
        `${API_BASE_URL}/event-forms/${eventId}/questions/`
      );
      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json();
        setQuestions(
          Array.isArray(questionsData)
            ? questionsData.sort((a, b) => a.order - b.order)
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

  const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({ ...prev, phoneNumber: value }));

    if (!value || value.length < 10) {
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
  };

  const validateForm = () => {
    const errors = {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      title: "",
      institution: "",
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
    if (!formData.title.trim()) {
      errors.title = "Professional title is required.";
    }
    if (!formData.institution.trim()) {
      errors.institution = "Institution/Organization is required.";
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

    setPaymentLoading(true);
    setError(null);

    try {
      // Hardcoded values
      const hardcodedEventId = "505";
      const hardcodedTicketId = "0de854ce-a750-49e0-89d6-2db94d1ecca6";

      // Format phone number - react-phone-input-2 returns the number without the + sign
      const formattedPhone = formData.phoneNumber.trim().startsWith("+")
        ? formData.phoneNumber.trim()
        : `+${formData.phoneNumber.trim()}`;

      const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;

      console.log("📞 Phone number formatting:");
      console.log("- Original:", formData.phoneNumber.trim());
      console.log("- Formatted:", formattedPhone);

      const requestBody: any = {
        name: fullName,
        email: formData.email.trim(),
        phone_number: formattedPhone,
        title: formData.title.trim(),
        institution: formData.institution.trim(),
        event: hardcodedEventId,
        ticket_id: hardcodedTicketId,
        payment_status: "bypassed",
        registration_source: "partner_link",
      };

      // Add the registration source ID if available
      if (registrationSourceId) {
        requestBody.registration_source_id = registrationSourceId;
        console.log(
          "🔗 Including registration source ID:",
          registrationSourceId
        );
      }

      console.log("🔍 Request details:");
      console.log("- URL:", `${API_BASE_URL}/attendees/`);
      console.log("- Method: POST");
      console.log(
        "- Registration Source ID:",
        registrationSourceId || "NOT PROVIDED"
      );
      console.log("- Request Body:", requestBody);

      const response = await fetch(`${API_BASE_URL}/attendees/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("🔍 Response details:");
      console.log("- Status:", response.status);
      console.log("- Status Text:", response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.log("❌ Error Response Body:", errorText);

        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        try {
          const errorData = JSON.parse(errorText);
          console.log("❌ Parsed Error Data:", errorData);
          errorMessage =
            errorData.detail ||
            errorData.message ||
            errorData.error ||
            errorMessage;
        } catch (parseError) {
          console.log("❌ Could not parse error response as JSON:", parseError);
          errorMessage = errorText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("✅ Success Response:", result);

      // Store the attendee ID for QR code generation
      setRegisteredAttendeeId(result.id || result.attendee_id);
      setShowQRModal(true);
      setPaymentLoading(false);
    } catch (err: any) {
      console.error("Failed to add attendee:", err);
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        alert(
          "Network error: Unable to connect to the server. Please check your internet connection and try again."
        );
      } else {
        alert(err.message || "An error occurred during registration.");
      }
      console.error("Error in handleRegistration:", err);
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
      title: "",
      institution: "",
    });
    setFormErrors({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      title: "",
      institution: "",
    });
    setAnswers([]);
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

  if (error || !event) {
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
                Partner Registration
                {registrationSourceId && (
                  <Text component="span" size="xs" ml={5}>
                    ({registrationSourceId})
                  </Text>
                )}
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

            {/* Alert when no refId is provided */}
            {!registrationSourceId && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="⚠️ No Registration Source ID"
                color="yellow"
                mb="md"
                variant="light"
              >
                This registration link is missing a source ID. Add{" "}
                <code>?refId=YourID</code> to the URL to track this registration
                source.
                <br />
                <Text size="xs" mt="xs" c="dimmed">
                  Example: <code>/partner-register?refId=PartnerA</code>
                </Text>
              </Alert>
            )}

            <div className={styles.eventInfoGrid}></div>
          </div>
        </div>

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
                    className={styles.input}
                    disabled={paymentLoading}
                  />
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
                  <PhoneInput
                    country={"ng"}
                    value={formData.phoneNumber}
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
                  />
                  {formErrors.phoneNumber && (
                    <Text size="xs" color="red" mt={5}>
                      {formErrors.phoneNumber}
                    </Text>
                  )}
                </div>

                <div className={styles.questionItem}>
                  <label className={styles.questionLabel}>
                    Employment Status <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g.,  Employed, Self Employed, Student etc."
                    value={formData.title}
                    onChange={(e) =>
                      handleInputChange("title", e.currentTarget.value)
                    }
                    className={styles.input}
                    disabled={paymentLoading}
                  />
                  {formErrors.title && (
                    <Text size="xs" color="red" mt={5}>
                      {formErrors.title}
                    </Text>
                  )}
                </div>

                <div className={styles.questionItem}>
                  <label className={styles.questionLabel}>
                    Business Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g.,  Type Your Company Name"
                    value={formData.institution}
                    onChange={(e) =>
                      handleInputChange("institution", e.currentTarget.value)
                    }
                    className={styles.input}
                    disabled={paymentLoading}
                  />
                  {formErrors.institution && (
                    <Text size="xs" color="red" mt={5}>
                      {formErrors.institution}
                    </Text>
                  )}
                </div>
              </div>

              <Divider my="xl" />
            </Paper>
          </div>

          <div className={styles.summarySection}>
            <Paper className={styles.summaryBox}>
              {questions.length > 0 && selectedTicket && (
                <>
                  <Divider my="lg" />
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
                                placeholder={
                                  q.placeholder || "Your answer here..."
                                }
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
                                placeholder={
                                  q.placeholder || "Your answer here..."
                                }
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
                                  placeholder={
                                    q.placeholder || "Select an option..."
                                  }
                                  data={q.options!.map((opt) => ({
                                    value: opt.id,
                                    label: opt.text,
                                  }))}
                                  value={
                                    (currentAnswer?.value as string) || null
                                  }
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
                                  value={
                                    (currentAnswer?.value as string[]) || []
                                  }
                                  onChange={(selectedValues) =>
                                    updateAnswer(q.id, selectedValues)
                                  }
                                  required={q.required}
                                >
                                  <Stack mt="xs" gap="xs">
                                    {q.options!.map((opt) => (
                                      <Checkbox
                                        key={opt.id}
                                        value={opt.id}
                                        label={opt.text}
                                        disabled={paymentLoading}
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
                  </div>
                </>
              )}

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
                  !formData.firstName ||
                  !formData.lastName ||
                  !formData.email ||
                  !formData.phoneNumber ||
                  !formData.title ||
                  !formData.institution ||
                  Object.values(formErrors).some((error) => error !== "") ||
                  paymentLoading ||
                  !event ||
                  !isMounted
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
        eventId={event?.id || undefined}
      />
    </div>
  );
}
