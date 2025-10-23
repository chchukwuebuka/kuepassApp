"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./styles.module.css";
import QRCodePopup from "@/components/QRCodePopup";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import {
  Loader,
  Center,
  Text,
  Textarea,
  Badge,
  Group,
  Stack,
  Divider,
  Container,
  Paper,
  Select,
  Checkbox,
  Radio,
  Image,
  Button,
} from "@mantine/core";
import {
  IconTicket,
  IconCreditCard,
  IconShield,
  IconX,
} from "@tabler/icons-react";
import { useLoadingState } from "@/store/loadingHook";

// --- INTERFACES ---
interface EventData {
  id: string;
  title: string;
  description: string;
  price: string;
  location: string;
  start_date: string;
  end_date: string;
  banner_url?: string;
  customization?: {
    card_color: string;
    banner_url?: string;
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
  id: string; // This should be the value for the option
  text: string; // This is the label for the option
}

interface Question {
  id: string;
  type: "textarea" | "text" | "checkbox" | "select" | "radio" | "email";
  title: string;
  required: boolean;
  placeholder?: string;
  options?: QuestionOption[]; // Array of options for select, checkbox, radio
  order: number;
}

interface Answer {
  questionId: string;
  value: string | string[]; // string for most, string[] for checkbox group
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
    /* ... */
  }>; // Define more specifically if needed
  is_validated?: boolean;
  validated_at?: string | null;
}

interface AttendeeRequestPayload {
  event: string;
  ticket: string;
  user: number;
  email: string;
  name: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  payment_method?: string;
  payment_status: string;
  responses: Array<{
    question: string;
    text_response?: string;
    selected_options?: Array<{ option: string }>; // For select, checkbox, radio
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

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://keupass-48c2ae65f897.herokuapp.com/api"
).replace(/\/$/, "");

export default function RegisterEvent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const eventId = searchParams.get("eventId");
  const { withLoading } = useLoadingState();

  const [event, setEvent] = useState<EventData | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedTickets, setSelectedTickets] = useState<{
    [ticketId: string]: number;
  }>({});
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uiLoading, setUiLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [registeredAttendeeId, setRegisteredAttendeeId] = useState<
    string | null
  >(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Tickets, 2: Email Preference, 3: Contact, 4: Payment
  const [contactForms, setContactForms] = useState<
    Array<{
      ticketId: string;
      ticketName: string;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
      questionAnswers: Answer[];
    }>
  >([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-select first ticket with quantity 1 when tickets are loaded
  useEffect(() => {
    if (tickets.length > 0 && Object.keys(selectedTickets).length === 0) {
      const firstTicket = tickets[0];
      if (firstTicket) {
        setSelectedTickets({ [firstTicket.id]: 1 });
      }
    }
  }, [tickets, selectedTickets]);

  // const fees = 500.0; // Commented out - not needed for now

  const calculateTotal = (): number => {
    let total = 0;
    let totalTickets = 0;

    Object.entries(selectedTickets).forEach(([ticketId, quantity]) => {
      if (quantity > 0) {
        const ticket = tickets.find((t) => t.id === ticketId);
        if (ticket) {
          const ticketPrice = Number.parseFloat(ticket.category_price) || 0;
          total += ticketPrice * quantity;
          totalTickets += quantity;
        }
      }
    });

    // Add fees multiplied by total number of tickets - commented out
    // const totalFees = fees * totalTickets;
    // return total > 0 ? total + totalFees : 0;
    return total > 0 ? total : 0;
  };

  const handleQuantityChange = (ticketId: string, newQuantity: number) => {
    setSelectedTickets((prev) => {
      if (newQuantity === 0) {
        const { [ticketId]: removed, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [ticketId]: newQuantity,
      };
    });
  };

  const hasSelectedTickets = (): boolean => {
    return Object.values(selectedTickets).some((quantity) => quantity > 0);
  };

  const initializeContactForms = () => {
    const forms: Array<{
      ticketId: string;
      ticketName: string;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
      questionAnswers: Answer[];
    }> = [];

    const totalTickets = Object.values(selectedTickets).reduce(
      (sum, qty) => sum + qty,
      0
    );

    // Always start with one form by default
    const firstTicket = Object.entries(selectedTickets).find(
      ([_, quantity]) => quantity > 0
    );
    if (firstTicket) {
      const [ticketId] = firstTicket;
      const ticket = tickets.find((t) => t.id === ticketId);
      if (ticket) {
        forms.push({
          ticketId,
          ticketName:
            totalTickets === 1 ? ticket.name : `${totalTickets} tickets`,
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          questionAnswers: [],
        });
      }
    }

    setContactForms(forms);
  };

  const addAdditionalContactForms = () => {
    const forms: Array<{
      ticketId: string;
      ticketName: string;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
      questionAnswers: Answer[];
    }> = [];

    // Create separate forms for each ticket
    Object.entries(selectedTickets).forEach(([ticketId, quantity]) => {
      if (quantity > 0) {
        const ticket = tickets.find((t) => t.id === ticketId);
        if (ticket) {
          for (let i = 0; i < quantity; i++) {
            forms.push({
              ticketId,
              ticketName: ticket.name,
              firstName: "",
              lastName: "",
              email: "",
              phoneNumber: "",
              questionAnswers: [],
            });
          }
        }
      }
    });

    setContactForms(forms);
  };

  const updateContactForm = (index: number, field: string, value: string) => {
    setContactForms((prev) =>
      prev.map((form, i) => (i === index ? { ...form, [field]: value } : form))
    );
  };

  const updateContactFormQuestion = (
    formIndex: number,
    questionId: string,
    value: string | string[]
  ) => {
    setContactForms((prev) =>
      prev.map((form, i) => {
        if (i === formIndex) {
          const existingAnswerIndex = form.questionAnswers.findIndex(
            (a) => a.questionId === questionId
          );
          const newAnswer = { questionId, value };

          let updatedAnswers;
          if (existingAnswerIndex > -1) {
            updatedAnswers = [...form.questionAnswers];
            updatedAnswers[existingAnswerIndex] = newAnswer;
          } else {
            updatedAnswers = [...form.questionAnswers, newAnswer];
          }

          return { ...form, questionAnswers: updatedAnswers };
        }
        return form;
      })
    );
  };

  const handleContinueToContact = () => {
    if (!hasSelectedTickets()) {
      alert("Please select at least one ticket.");
      return;
    }

    const totalTickets = Object.values(selectedTickets).reduce(
      (sum, qty) => sum + qty,
      0
    );

    // If more than one ticket, automatically create separate forms for each ticket
    if (totalTickets > 1) {
      addAdditionalContactForms(); // Create separate forms for each ticket
      setCurrentStep(3); // Go directly to contact forms
    } else {
      // Single ticket - initialize forms and proceed to contact forms
      initializeContactForms();
      setCurrentStep(3); // Show contact forms
    }
  };

  const handleContinueFromContact = () => {
    // Validate contact forms
    for (let i = 0; i < contactForms.length; i++) {
      const form = contactForms[i];
      if (
        !form.firstName.trim() ||
        !form.lastName.trim() ||
        !form.email.trim() ||
        !form.phoneNumber.trim()
      ) {
        alert("Please fill in all required fields correctly.");
        return;
      }

      // Validate phone number format (E.164 format)
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!phoneRegex.test(form.phoneNumber.trim())) {
        alert(
          `Please enter a valid phone number in international format (e.g., +2348012345678) for Ticket ${
            i + 1
          }.`
        );
        return;
      }

      // Validate required questions
      for (const question of questions) {
        if (question.required) {
          const answer = form.questionAnswers.find(
            (a) => a.questionId === question.id
          );
          if (!answer?.value) {
            alert(`Please answer the required question: ${question.title}`);
            return;
          }
          if (Array.isArray(answer.value) && answer.value.length === 0) {
            alert(`Please answer the required question: ${question.title}`);
            return;
          }
          if (typeof answer.value === "string" && answer.value.trim() === "") {
            alert(`Please answer the required question: ${question.title}`);
            return;
          }
        }
      }
    }

    // Check if it's a free event
    const totalAmount = calculateTotal();
    if (totalAmount <= 0) {
      // Free event - proceed directly to registration
      handlePurchase();
    } else {
      // Paid event - go to payment step
      setCurrentStep(4);
    }
  };

  const handleGoBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
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
    if (!eventId) {
      setLoading(false);
      setUiLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await withLoading(async () => {
        // Fetch event data using regular fetch (no authentication required)
        const eventResponse = await fetch(
          `${API_BASE_URL}/events/${eventId}/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        if (!eventResponse.ok) {
          throw new Error(`Failed to fetch event: ${eventResponse.status}`);
        }

        const eventData = await eventResponse.json();
        const eventResult = eventData?.data || eventData;
        if (eventResult && eventResult.id) {
          setEvent(eventResult as EventData);
        } else {
          throw new Error("Event data not found in response.");
        }

        // Fetch tickets using regular fetch
        console.log("Fetching tickets for eventId:", eventId);
        const ticketsResponse = await fetch(`${API_BASE_URL}/tickets/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        console.log("Tickets response status:", ticketsResponse.status);
        if (ticketsResponse.ok) {
          const ticketsData = await ticketsResponse.json();
          console.log("Raw tickets data:", ticketsData);
          const ticketsResult = ticketsData?.data || ticketsData;
          console.log("Processed tickets result:", ticketsResult);

          // Filter tickets for the current event
          const eventTickets = Array.isArray(ticketsResult)
            ? ticketsResult.filter((ticket) => ticket.event === eventId)
            : [];

          console.log("Filtered tickets for event:", eventTickets);
          setTickets(eventTickets);
        } else {
          console.log("Tickets fetch failed:", ticketsResponse.status);
          const errorText = await ticketsResponse.text();
          console.log("Error response:", errorText);
          setTickets([]);
        }

        // Fetch questions using regular fetch
        const questionsResponse = await fetch(
          `${API_BASE_URL}/event-forms/${eventId}/questions/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        console.log("Questions response status:", questionsResponse.status);
        if (questionsResponse.ok) {
          const questionsData = await questionsResponse.json();
          console.log("Raw questions data:", questionsData);

          // The API returns an array directly
          if (Array.isArray(questionsData)) {
            console.log("Setting questions:", questionsData);
            setQuestions(questionsData.sort((a, b) => a.order - b.order));
          } else {
            console.log("Questions data is not an array:", questionsData);
            setQuestions([]);
          }
        } else {
          console.log("Questions fetch failed:", questionsResponse.status);
          const errorText = await questionsResponse.text();
          console.log("Error response:", errorText);
          setQuestions([]);
        }
      });
    } catch (err: any) {
      setError(err.message || "Failed to load event data.");
    } finally {
      setLoading(false);
    }
  }

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

  const handlePurchase = async () => {
    if (!isMounted || !event) return;

    if (currentStep === 1) {
      handleContinueToContact();
      return;
    }

    if (currentStep === 3) {
      handleContinueFromContact();
      return;
    }

    setPaymentLoading(true);
    setError(null);
    try {
      await withLoading(async () => {
        // Collect data from the FIRST contact form for the payment
        const primaryForm = contactForms[0];
        const totalAmount = calculateTotal();

        if (totalAmount <= 0) {
          // Handle free ticket registration directly
          console.log("Processing free ticket registration...");

          // Create attendee records for all contact forms
          for (let i = 0; i < contactForms.length; i++) {
            const form = contactForms[i];

            // Prepare attendee payload
            const attendeePayload: AttendeeRequestPayload = {
              event: eventId!,
              ticket: form.ticketId,
              user: 0, // Guest user
              email: form.email,
              name: `${form.firstName} ${form.lastName}`,
              first_name: form.firstName,
              last_name: form.lastName,
              phone_number: form.phoneNumber.trim(),
              payment_status: "completed", // Free tickets are automatically completed
              responses: form.questionAnswers.map((answer) => ({
                question: answer.questionId,
                text_response:
                  typeof answer.value === "string" ? answer.value : undefined,
                selected_options: Array.isArray(answer.value)
                  ? answer.value.map((val) => ({ option: val }))
                  : undefined,
              })),
            };

            console.log(`Creating attendee ${i + 1}:`, attendeePayload);

            // Create attendee record
            const attendeeResponse = await fetch(`${API_BASE_URL}/attendees/`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify(attendeePayload),
            });

            if (!attendeeResponse.ok) {
              const errorData = await attendeeResponse.json();
              throw new Error(
                `Failed to register attendee ${i + 1}: ${
                  errorData?.message || "Unknown error"
                }`
              );
            }

            const attendeeData = await attendeeResponse.json();
            console.log(
              `Attendee ${i + 1} created successfully:`,
              attendeeData
            );

            // Store the first attendee ID for QR code generation
            if (i === 0) {
              setRegisteredAttendeeId(
                attendeeData.id || attendeeData.attendee_id
              );
            }
          }

          // Show QR code modal instead of success modal
          setShowQRModal(true);
          setPaymentLoading(false);
          return;
        }

        // For paid tickets, validate payment method selection
        if (currentStep === 4 && !selectedPaymentMethod) {
          alert("Please select a payment method.");
          setPaymentLoading(false);
          return;
        }

        // Handle Opay selection
        if (selectedPaymentMethod === "opay") {
          alert(
            "Opay payment service is not available at the moment. Please select 'Pay with Card or Bank' to continue."
          );
          setPaymentLoading(false);
          return;
        }

        // Handle Cash payment - treat as free registration
        if (selectedPaymentMethod === "cash") {
          console.log("Processing cash payment registration...");

          // Create attendee records for all contact forms
          for (let i = 0; i < contactForms.length; i++) {
            const form = contactForms[i];

            // Prepare attendee payload
            const attendeePayload: AttendeeRequestPayload = {
              event: eventId!,
              ticket: form.ticketId,
              user: 0, // Guest user
              email: form.email,
              name: `${form.firstName} ${form.lastName}`,
              first_name: form.firstName,
              last_name: form.lastName,
              phone_number: form.phoneNumber.trim(),
              payment_method: "cash", // This tells the backend it's a cash payment
              payment_status: "pending", // Backend will handle the status logic
              responses: form.questionAnswers.map((answer) => ({
                question: answer.questionId,
                text_response:
                  typeof answer.value === "string" ? answer.value : undefined,
                selected_options: Array.isArray(answer.value)
                  ? answer.value.map((val) => ({ option: val }))
                  : undefined,
              })),
            };

            console.log(
              `Creating attendee ${
                i + 1
              } for cash payment (method: cash, status: pending):`,
              attendeePayload
            );

            // Create attendee record
            const attendeeResponse = await fetch(`${API_BASE_URL}/attendees/`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify(attendeePayload),
            });

            if (!attendeeResponse.ok) {
              const errorData = await attendeeResponse.json();
              throw new Error(
                `Failed to register attendee ${i + 1}: ${
                  errorData?.message || "Unknown error"
                }`
              );
            }

            const attendeeData = await attendeeResponse.json();
            console.log(
              `Attendee ${
                i + 1
              } created successfully for cash payment (method: cash, status: pending):`,
              attendeeData
            );

            // Store the first attendee ID for QR code generation
            if (i === 0) {
              setRegisteredAttendeeId(
                attendeeData.id || attendeeData.attendee_id
              );
            }
          }

          // Show QR code modal instead of success modal
          setShowQRModal(true);
          setPaymentLoading(false);
          return;
        }

        // Prepare metadata with all attendee information
        const metadata = {
          event_id: eventId,
          contact_forms: contactForms.map((form, index) => ({
            ticket_id: form.ticketId,
            first_name: form.firstName,
            last_name: form.lastName,
            email: form.email,
            phone_number: form.phoneNumber.trim(),
            question_answers: form.questionAnswers,
          })),
          selected_tickets: selectedTickets,
        };

        const paymentInitPayload = {
          email: primaryForm.email,
          amount: totalAmount.toString(),
          metadata: metadata,
        };

        console.log(
          "Sending payment initialization with metadata:",
          paymentInitPayload
        );

        // Call the payment initialization endpoint
        const paymentResponse = await fetch(
          `${API_BASE_URL}/payment/initialize/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(paymentInitPayload),
          }
        );

        if (!paymentResponse.ok) {
          const errorData = await paymentResponse.json();
          alert(errorData?.message || "Failed to initialize payment.");
          console.error("Payment initialization failed:", errorData);
          setPaymentLoading(false);
          return;
        }

        const initResponse = await paymentResponse.json();
        console.log("Payment initialization response:", initResponse);

        if (initResponse?.success && initResponse.data?.authorization_url) {
          // Redirect user to Paystack
          window.location.href = initResponse.data.authorization_url;
        } else {
          alert(initResponse?.message || "Failed to initialize payment.");
          console.error("Payment initialization failed:", initResponse);
          setPaymentLoading(false);
        }
      });
    } catch (err: any) {
      alert(err.message || "An error occurred during purchase.");
      console.error("Error in handlePurchase:", err);
      setPaymentLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    if (eventId)
      setTimeout(
        () => router.push(`/eventSchedule/eventDetails/${eventId}`),
        2000
      );
  };

  const closeQRModal = () => {
    setShowQRModal(false);
    setRegisteredAttendeeId(null);
    if (eventId)
      setTimeout(
        () => router.push(`/eventSchedule/eventDetails/${eventId}`),
        1000
      );
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

  if (uiLoading || !isMounted) {
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
        <Text color="red" size="lg" mb="md">
          {error || "Event data could not be loaded."}
        </Text>
        <Text>Please refresh.</Text>
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

  // Get banner URL from event data
  let bannerUrl = "/images/placeholder.jpg";
  if (event) {
    if (
      event.customization?.banner_url &&
      event.customization.banner_url.trim() !== ""
    ) {
      bannerUrl = event.customization.banner_url;
    } else if (event.banner_url && event.banner_url.trim() !== "") {
      bannerUrl = event.banner_url;
    }
  }

  return (
    <div className={styles.pageWrapper}>
      <Container size="xl" className={styles.container}>
        {/* Main Content */}
        <div className={styles.mainContent}>
          {/* Left Column - Ticket Selection */}
          <div className={styles.leftColumn}>
            <div className={styles.header}>
              <div className={styles.headerContent}>
                <h1 className={styles.title}>{event.title}</h1>
                <Text className={styles.eventDate}>
                  {new Date(event.start_date).toLocaleDateString()},{" "}
                  {new Date(event.start_date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  WAT
                </Text>
              </div>
              <Button
                variant="subtle"
                leftSection={<IconX size={26} />}
                onClick={() => router.back()}
                className={styles.backButton}
              ></Button>
            </div>

            <div className={styles.progressSection}>
              <div className={styles.progressHeader}>
                <div className={styles.progressSteps}>
                  <div
                    className={`${styles.progressStep} ${
                      currentStep >= 1 ? styles.active : ""
                    }`}
                  >
                    <div className={styles.stepCircle}>
                      {currentStep > 1 ? "✓" : "1"}
                    </div>
                    <Text size="sm">Tickets</Text>
                  </div>
                  <div className={styles.progressLine}></div>
                  <div
                    className={`${styles.progressStep} ${
                      currentStep >= 3 ? styles.active : ""
                    }`}
                  >
                    <div className={styles.stepCircle}>
                      {currentStep > 3 ? "✓" : "2"}
                    </div>
                    <Text size="sm">Contact</Text>
                  </div>
                  {calculateTotal() > 0 && (
                    <>
                      <div className={styles.progressLine}></div>
                      <div
                        className={`${styles.progressStep} ${
                          currentStep >= 4 ? styles.active : ""
                        }`}
                      >
                        <div className={styles.stepCircle}>
                          {currentStep > 4 ? "✓" : "3"}
                        </div>
                        <Text size="sm">Payment</Text>
                      </div>
                    </>
                  )}
                </div>
                {currentStep > 1 && (
                  <Button
                    variant="subtle"
                    leftSection={<IconX size={16} />}
                    onClick={handleGoBack}
                    className={styles.backButton}
                    size="sm"
                  >
                    Back
                  </Button>
                )}
              </div>
            </div>
            {/* Ticket Selection Section */}
            {currentStep === 1 && (
              <div className={styles.ticketSection}>
                <Text fw={600} size="lg" className={styles.sectionTitle}>
                  Select Your Ticket
                </Text>
                <Text size="sm" color="dimmed" mb="md">
                  Select the number of tickets you want to purchase
                </Text>
                {/* Debug info */}
                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginBottom: "10px",
                  }}
                >
                  Debug: tickets.length = {tickets.length}, loading ={" "}
                  {loading.toString()}
                </div>
                {tickets.length === 0 && !loading && (
                  <div className={styles.noSelection}>
                    <Text c="red" fw={500}>
                      No tickets available for this event.
                    </Text>
                    <Text size="sm" c="dimmed" mt="xs">
                      Please contact the event organizer or try refreshing the
                      page.
                    </Text>
                  </div>
                )}
                <div className={styles.ticketsList}>
                  {tickets.length > 0 ? (
                    tickets.map((ticket, idx) => {
                      const badgeColor =
                        idx === 0 && event.customization?.card_color
                          ? event.customization.card_color
                          : fallbackColors[
                              (intervalIndex + idx) % fallbackColors.length
                            ];
                      return (
                        <div
                          key={ticket.id}
                          className={`${styles.ticketCard} ${
                            selectedTickets[ticket.id] > 0
                              ? styles.selected
                              : ""
                          }`}
                        >
                          <div className={styles.ticketInfo}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: "0.75rem",
                                marginBottom: "0.5rem",
                                borderBottom: "1px solid #e0e0e0",
                                paddingBottom: "0.5rem",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  gap: "0.75rem",
                                }}
                              >
                                <Text
                                  fw={600}
                                  size="lg"
                                  className={styles.ticketName}
                                >
                                  {ticket.name}
                                </Text>
                                <div
                                  className={styles.ticketBadge}
                                  style={{
                                    backgroundColor: badgeColor,
                                    color: "#ffffff",
                                  }}
                                >
                                  {ticket.category_name}
                                </div>
                              </div>
                              <div className={styles.quantitySelector}>
                                <select
                                  className={styles.quantityDropdown}
                                  value={selectedTickets[ticket.id] || 0}
                                  onChange={(e) =>
                                    handleQuantityChange(
                                      ticket.id,
                                      Number.parseInt(e.target.value)
                                    )
                                  }
                                >
                                  {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                                    <option key={num} value={num}>
                                      {num}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className={styles.ticketDescription}>
                              <div className={styles.ticketDescriptionItem}>
                                <Text
                                  size="sm"
                                  className={styles.ticketDescription}
                                >
                                  Admits {selectedTickets[ticket.id] || 0}
                                </Text>
                                <Text
                                  size="sm"
                                  className={styles.ticketDescription}
                                >
                                  This tickets includes
                                </Text>
                              </div>
                              <div className={styles.ticketPrice}>
                                <Text
                                  fw={700}
                                  size="xl"
                                  className={styles.priceAmount}
                                >
                                  {Number.parseFloat(ticket.category_price) ===
                                  0
                                    ? "Free"
                                    : `₦${Number.parseFloat(
                                        ticket.category_price
                                      ).toFixed(2)}`}
                                </Text>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div
                      style={{
                        padding: "1rem",
                        textAlign: "center",
                        color: "#666",
                      }}
                    >
                      No tickets to display
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contact Information Section */}
            {currentStep === 3 && contactForms.length > 0 && (
              <div className={styles.contactSection}>
                <Text fw={600} size="lg" className={styles.sectionTitle}>
                  Contact information
                </Text>
                <div className={styles.contactForm}>
                  {contactForms.map((form, index) => (
                    <div key={index} className={styles.contactFormItem}>
                      {contactForms.length > 1 && (
                        <Text fw={500} size="md" mb="md" color="dark">
                          Ticket {index + 1}: {form.ticketName}
                        </Text>
                      )}
                      <Stack gap="md">
                        <div className={styles.formRow}>
                          <div className={styles.inputGroup}>
                            <label className={styles.label}>
                              First Name{" "}
                              <span className={styles.required}>*</span>
                            </label>
                            <input
                              style={{ marginBottom: "1rem" }}
                              type="text"
                              placeholder="Enter first name"
                              value={form.firstName}
                              onChange={(e) =>
                                updateContactForm(
                                  index,
                                  "firstName",
                                  e.currentTarget.value
                                )
                              }
                              required
                              className={styles.input}
                            />
                          </div>
                          <div className={styles.inputGroup}>
                            <label className={styles.label}>
                              Last Name{" "}
                              <span className={styles.required}>*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="Enter last name"
                              value={form.lastName}
                              onChange={(e) =>
                                updateContactForm(
                                  index,
                                  "lastName",
                                  e.currentTarget.value
                                )
                              }
                              required
                              className={styles.input}
                            />
                          </div>
                        </div>
                        <div className={styles.inputGroup}>
                          <label className={styles.label}>
                            Email address{" "}
                            <span className={styles.required}>*</span>
                          </label>
                          <input
                            type="email"
                            placeholder="Enter email address"
                            value={form.email}
                            onChange={(e) =>
                              updateContactForm(
                                index,
                                "email",
                                e.currentTarget.value
                              )
                            }
                            required
                            className={styles.input}
                          />
                        </div>
                        <div>
                          <Text size="sm" fw={500} mb="xs">
                            Phone number <span style={{ color: "red" }}>*</span>
                          </Text>
                          <PhoneInput
                            international
                            defaultCountry="NG"
                            placeholder="Enter phone number"
                            value={form.phoneNumber}
                            onChange={(value) =>
                              updateContactForm(
                                index,
                                "phoneNumber",
                                value || ""
                              )
                            }
                            className={styles.phoneInput}
                          />
                        </div>
                      </Stack>

                      {/* Vendor Questions Section */}
                      {questions.length > 0 ? (
                        <div className={styles.questionsSection}>
                          <Text fw={500} size="md" mb="md" color="dark">
                            Additional Information ({questions.length}{" "}
                            questions)
                          </Text>
                          <Stack gap="md">
                            {questions.map((q) => {
                              const currentAnswer = form.questionAnswers.find(
                                (a) => a.questionId === q.id
                              );
                              const hasValidOptions =
                                q.options &&
                                Array.isArray(q.options) &&
                                q.options.length > 0;

                              return (
                                <div key={q.id} className={styles.questionItem}>
                                  <label
                                    htmlFor={`question-${q.id}-${index}`}
                                    className={styles.questionLabel}
                                  >
                                    {q.title || "Unnamed Question"}
                                    {q.required && (
                                      <span className={styles.required}>*</span>
                                    )}
                                  </label>

                                  {q.type === "textarea" ? (
                                    <Textarea
                                      id={`question-${q.id}-${index}`}
                                      placeholder={
                                        q.placeholder || "Your answer here..."
                                      }
                                      value={
                                        (currentAnswer?.value as string) || ""
                                      }
                                      onChange={(e) =>
                                        updateContactFormQuestion(
                                          index,
                                          q.id,
                                          e.currentTarget.value
                                        )
                                      }
                                      required={q.required}
                                      className={styles.questionInput}
                                      minRows={3}
                                      disabled={paymentLoading}
                                    />
                                  ) : q.type === "text" ||
                                    q.type === "email" ? (
                                    <input
                                      id={`question-${q.id}-${index}`}
                                      type={
                                        q.type === "email" ? "email" : "text"
                                      }
                                      placeholder={
                                        q.placeholder || "Your answer here..."
                                      }
                                      value={
                                        (currentAnswer?.value as string) || ""
                                      }
                                      onChange={(e) =>
                                        updateContactFormQuestion(
                                          index,
                                          q.id,
                                          e.currentTarget.value
                                        )
                                      }
                                      required={q.required}
                                      className={styles.input}
                                      disabled={paymentLoading}
                                    />
                                  ) : q.type === "select" ? (
                                    hasValidOptions ? (
                                      <Select
                                        id={`question-${q.id}-${index}`}
                                        placeholder={
                                          q.placeholder || "Select an option..."
                                        }
                                        data={q.options!.map((opt) => ({
                                          value: opt.id,
                                          label: opt.text,
                                        }))}
                                        value={
                                          (currentAnswer?.value as string) ||
                                          null
                                        }
                                        onChange={(selectedValue) =>
                                          updateContactFormQuestion(
                                            index,
                                            q.id,
                                            selectedValue || ""
                                          )
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
                                        id={`question-${q.id}-${index}`}
                                        value={
                                          (currentAnswer?.value as string[]) ||
                                          []
                                        }
                                        onChange={(selectedValues) =>
                                          updateContactFormQuestion(
                                            index,
                                            q.id,
                                            selectedValues
                                          )
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
                                                    backgroundColor:
                                                      "#15302B !important",
                                                    borderColor:
                                                      "#15302B !important",
                                                  },
                                                  "&[data-checked]": {
                                                    backgroundColor:
                                                      "#15302B !important",
                                                    borderColor:
                                                      "#15302B !important",
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
                                        id={`question-${q.id}-${index}`}
                                        value={
                                          (currentAnswer?.value as string) || ""
                                        }
                                        onChange={(selectedValue) =>
                                          updateContactFormQuestion(
                                            index,
                                            q.id,
                                            selectedValue
                                          )
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
                                    <input
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
                      ) : (
                        <div className={styles.questionsSection}>
                          <Text fw={500} size="md" mb="md" color="dimmed">
                            No additional questions for this event
                          </Text>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Section */}
            {currentStep === 4 && (
              <div className={styles.contactSection}>
                <Text fw={600} size="lg" className={styles.sectionTitle}>
                  {calculateTotal() <= 0
                    ? "Registration Confirmation"
                    : "Payment"}
                </Text>
                <div className={styles.contactForm}>
                  <Stack gap="md">
                    {calculateTotal() <= 0 ? (
                      <Paper p="md" bg="green.0" radius="md">
                        <Text size="md" c="green.8" fw={500}>
                          🎉 This is a free event! You can register without any
                          payment.
                        </Text>
                        <Text size="sm" c="green.7" mt="xs">
                          Click &quot;Register for free&quot; to complete your
                          registration.
                        </Text>
                      </Paper>
                    ) : (
                      <>
                        <Radio.Group
                          value={selectedPaymentMethod}
                          onChange={setSelectedPaymentMethod}
                        >
                          <Stack gap="sm">
                            <Radio
                              value="card"
                              label={
                                <div>
                                  <Text fw={500}>Pay with Card or Bank</Text>
                                  <Text size="sm" c="dimmed">
                                    Pay with Mastercard, Visa, Verve or with
                                    bank transfer
                                  </Text>
                                </div>
                              }
                            />
                            <Radio value="opay" label="Pay with Opay" />
                            <Radio
                              value="cash"
                              label={
                                <div>
                                  <Text fw={500}>Pay with Cash</Text>
                                  <Text size="sm" c="dimmed">
                                    Pay at the event venue on arrival
                                  </Text>
                                </div>
                              }
                            />
                          </Stack>
                        </Radio.Group>

                        {/* Legal Disclaimer */}
                        <Paper p="md" bg="green.0" radius="md">
                          <Text size="sm" c="green.8">
                            By completing your purchase, you agree to the
                            Kuepass{" "}
                            <Text
                              component="span"
                              c="green.9"
                              fw={500}
                              style={{ cursor: "pointer" }}
                            >
                              Terms and Conditions
                            </Text>
                            ,{" "}
                            <Text
                              component="span"
                              c="green.9"
                              fw={500}
                              style={{ cursor: "pointer" }}
                            >
                              Refund Policy
                            </Text>
                            , and{" "}
                            <Text
                              component="span"
                              c="green.9"
                              fw={500}
                              style={{ cursor: "pointer" }}
                            >
                              Privacy Policy
                            </Text>
                            .
                          </Text>
                        </Paper>

                        {/* Cash Payment Notice */}
                        {selectedPaymentMethod === "cash" && (
                          <Paper p="md" bg="orange.0" radius="md">
                            <Text size="sm" c="orange.8" fw={500}>
                              💰 Cash Payment Notice
                            </Text>
                            <Text size="sm" c="orange.7" mt="xs">
                              You will be registered for the event and receive a
                              confirmation email with your QR code ticket. You
                              can pay the ticket amount in cash when you arrive
                              at the venue. Please bring the exact amount and
                              arrive early to complete payment.
                            </Text>
                          </Paper>
                        )}
                      </>
                    )}
                  </Stack>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Image and Summary */}
          <div className={styles.rightColumn}>
            {/* Event Image */}
            <div className={styles.imageSection}>
              <Image
                src={bannerUrl}
                alt={event.title}
                className={styles.eventImage}
                width={600}
                height={300}
              />
            </div>

            {/* Summary Section */}
            <div className={styles.summarySection}>
              <Text fw={600} size="lg" className={styles.summaryTitle}>
                Summary
              </Text>
              <div className={styles.summaryContent}>
                {hasSelectedTickets() ? (
                  <>
                    {calculateTotal() > 0 ? (
                      <>
                        {Object.entries(selectedTickets).map(
                          ([ticketId, quantity]) => {
                            if (quantity <= 0) return null;
                            const ticket = tickets.find(
                              (t) => t.id === ticketId
                            );
                            if (!ticket) return null;

                            const ticketPrice =
                              Number.parseFloat(ticket.category_price) || 0;
                            const subtotal = ticketPrice * quantity;

                            return (
                              <div
                                key={ticketId}
                                className={styles.summaryItem}
                              >
                                <Text size="sm">
                                  {quantity} x {ticket.name.toLowerCase()}
                                </Text>
                                <Text fw={500}>₦{subtotal.toFixed(2)}</Text>
                              </div>
                            );
                          }
                        )}
                        <Divider my="md" />
                        <div className={styles.summaryTotal}>
                          <Text fw={700} size="lg">
                            Total
                          </Text>
                          <Text
                            fw={700}
                            size="xl"
                            className={styles.totalPrice}
                          >
                            ₦{calculateTotal().toFixed(2)}
                          </Text>
                        </div>
                      </>
                    ) : (
                      // For free tickets, show a simple message
                      <div className={styles.freeTicketMessage}>
                        <Text size="sm" c="green.7" fw={500}>
                          Free ticket selected
                        </Text>
                      </div>
                    )}
                  </>
                ) : (
                  <div className={styles.noSelection}>
                    Please select a ticket.
                  </div>
                )}
              </div>
              <Button
                className={styles.continueButton}
                disabled={
                  (currentStep === 1 && !hasSelectedTickets()) ||
                  (currentStep === 3 &&
                    contactForms.some((form) => {
                      // Check basic fields
                      if (
                        !form.firstName.trim() ||
                        !form.lastName.trim() ||
                        !form.email.trim() ||
                        !form.phoneNumber.trim()
                      ) {
                        return true;
                      }
                      // Check phone number format (E.164 format)
                      const phoneRegex = /^\+[1-9]\d{1,14}$/;
                      if (!phoneRegex.test(form.phoneNumber.trim())) {
                        return true;
                      }
                      // Check required questions
                      return questions
                        .filter((q) => q.required)
                        .some((q) => {
                          const ans = form.questionAnswers.find(
                            (a) => a.questionId === q.id
                          );
                          if (!ans?.value) return true;
                          if (Array.isArray(ans.value))
                            return ans.value.length === 0;
                          if (typeof ans.value === "string")
                            return ans.value.trim() === "";
                          return true;
                        });
                    })) ||
                  (currentStep === 4 &&
                    calculateTotal() > 0 &&
                    !selectedPaymentMethod) ||
                  paymentLoading ||
                  !event ||
                  !isMounted
                }
                onClick={
                  currentStep === 1 ? handleContinueToContact : handlePurchase
                }
                fullWidth
              >
                {paymentLoading ? (
                  <Group justify="center" gap="xs">
                    <Loader size="sm" color="white" />
                    <Text>Processing...</Text>
                  </Group>
                ) : currentStep === 1 ? (
                  "Continue"
                ) : currentStep === 3 ? (
                  calculateTotal() <= 0 ? (
                    "Register for free"
                  ) : (
                    "Continue to Payment"
                  )
                ) : currentStep === 4 ? (
                  selectedPaymentMethod ? (
                    selectedPaymentMethod === "cash" ? (
                      "Register with Cash Payment"
                    ) : (
                      "Order ticket"
                    )
                  ) : (
                    "Select a payment method"
                  )
                ) : calculateTotal() <= 0 ? (
                  "Register for free"
                ) : (
                  "Order ticket"
                )}
              </Button>
            </div>
          </div>
        </div>
      </Container>
      <QRCodePopup
        show={showQRModal}
        onClose={closeQRModal}
        attendeeId={registeredAttendeeId || undefined}
        email={contactForms[0]?.email || undefined}
        eventId={event?.id || undefined}
      />
    </div>
  );
}
