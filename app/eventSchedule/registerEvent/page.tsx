"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./styles.module.css";
import Modal from "@/components/Modal";
import { authenticatedRequest } from "@/app/services/auth";
import { Loader, Center, Text, Textarea, TextInput } from "@mantine/core";
import ProtectedRoute from "@/app/components/ProtectedRoute";

// Interface definitions (mostly the same, PaystackHookResponse not needed here)
interface EventData {
  id: string;
  title: string;
  description: string;
  price: string;
  location: string;
  start_date: string;
  end_date: string;
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

// Expected response from YOUR backend's /payment/initialize/
interface PaymentInitializationApiResponse {
  success: boolean;
  message: string;
  data?: {
    authorization_url: string;
    reference: string;
    // access_code might also be returned by Paystack, your backend can pass it if needed
  };
  error_code?: string;
}

// const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY; May not be needed on frontend for this flow
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
  const [showModal, setShowModal] = useState(false); // This modal might be for free tickets or initial success
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
    const ticketPrice = parseFloat(ticket.category_price) || 0;
    return ticketPrice + fees;
  };

  useEffect(() => {
    console.log("Page loaded. EventId:", eventId);
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
      return;
    }
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
      if (eventResponse?.success && eventResponse.data)
        setEvent(eventResponse.data);
      else {
        console.error("Failed to fetch event data:", eventResponse?.message);
        setError(eventResponse?.message || "Could not fetch event details.");
      }

      const ticketsResponse = await authenticatedRequest<{
        success: boolean;
        data: Ticket[];
        message?: string;
      }>(`${API_BASE_URL}/tickets/?event=${eventId}`, "GET");
      if (ticketsResponse?.success && ticketsResponse.data)
        setTickets(ticketsResponse.data || []);
      else {
        console.error("Failed to fetch tickets:", ticketsResponse?.message);
        setTickets([]);
      }

      const rawQuestionsResponse = await authenticatedRequest<
        Question[] | { success: boolean; data: Question[]; message?: string }
      >(`${API_BASE_URL}/event-forms/${eventId}/questions/`, "GET");
      let questionsData: Question[] | null = null;
      let qFetchSuccess = false;
      let qResponseMessage: string | undefined = undefined;
      if (Array.isArray(rawQuestionsResponse)) {
        questionsData = rawQuestionsResponse;
        qFetchSuccess = true;
      } else if (rawQuestionsResponse?.success && rawQuestionsResponse.data) {
        questionsData = rawQuestionsResponse.data;
        qFetchSuccess = true;
        qResponseMessage = rawQuestionsResponse.message;
      } else if (
        rawQuestionsResponse &&
        typeof rawQuestionsResponse === "object" &&
        "data" in rawQuestionsResponse &&
        Array.isArray((rawQuestionsResponse as any).data)
      ) {
        questionsData = (rawQuestionsResponse as any).data;
        qFetchSuccess = true;
        qResponseMessage = (rawQuestionsResponse as any).message;
      } else if (
        rawQuestionsResponse &&
        typeof rawQuestionsResponse === "object"
      ) {
        qResponseMessage = (rawQuestionsResponse as any).message;
      }
      if (qFetchSuccess && questionsData) {
        setQuestions(
          Array.isArray(questionsData)
            ? questionsData.sort((a, b) => a.order - b.order)
            : []
        );
      } else {
        console.error(
          "Failed to fetch questions. Resp:",
          rawQuestionsResponse,
          "Msg:",
          qResponseMessage
        );
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
    const pattern = /^\+\d{8,15}$/;
    if (!value) setPhoneError("Phone number is required.");
    else if (!pattern.test(value))
      setPhoneError("Invalid format (e.g., +2349012345678).");
    else setPhoneError(null);
  };

  const handlePurchase = async () => {
    // Renamed back to handlePurchase
    if (!isMounted) {
      alert("Page is still initializing.");
      return;
    }
    if (!event || !user) {
      alert("Event/User data missing.");
      return;
    }
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
        AttendeeData | { message: string; [key: string]: any }
      >(`${API_BASE_URL}/attendees/`, "POST", attendeePayload);
      console.log(
        "DEBUG: Attendee Creation Response:",
        JSON.stringify(attendeeCreationResult, null, 2)
      );

      if (
        !(
          attendeeCreationResult &&
          typeof (attendeeCreationResult as AttendeeData).id === "string"
        )
      ) {
        setPaymentLoading(false);
        const errorMessage =
          (attendeeCreationResult as { message?: string })?.message ||
          "Could not create attendee record.";
        alert(errorMessage);
        console.error("Attendee creation failed:", attendeeCreationResult);
        return;
      }
      const attendee = attendeeCreationResult as AttendeeData;

      const ticketObj = tickets.find((t) => t.id === selectedTicket);
      if (ticketObj?.category_name === "Free") {
        // For free tickets, you might want to update payment_status to 'success' on backend
        // or consider the attendee created as 'registered'.
        console.log("Free ticket flow completed for attendee:", attendee.id);
        setShowModal(true); // Show local success modal
        setPaymentLoading(false);
        return;
      }

      // For paid tickets, now call backend to initialize Paystack payment
      const totalAmountForBackend = calculateTotal(); // This is in main currency (e.g., NGN)
      console.log(
        "DEBUG: Total amount for backend initialization (e.g., NGN):",
        totalAmountForBackend
      );

      if (totalAmountForBackend <= 0) {
        alert("Ticket price is invalid. Cannot proceed with payment.");
        setPaymentLoading(false);
        return;
      }

      const paymentInitPayload = {
        attendee_id: attendee.id,
        amount: totalAmountForBackend.toString(), // Backend expects amount (e.g., in NGN)
        // email: user.email, // Your backend InitializePaymentView uses attendee.email already
      };

      console.log(
        "DEBUG: Calling backend /payment/initialize/ with payload:",
        paymentInitPayload
      );

      // Expecting PaymentInitializationApiResponse from your backend
      const initResponse =
        await authenticatedRequest<PaymentInitializationApiResponse>(
          `${API_BASE_URL}/payment/initialize/`,
          "POST",
          paymentInitPayload
        );

      console.log(
        "DEBUG: Backend /payment/initialize/ response:",
        JSON.stringify(initResponse, null, 2)
      );

      if (initResponse?.success && initResponse.data?.authorization_url) {
        console.log(
          "Redirecting to Paystack payment page:",
          initResponse.data.authorization_url
        );
        // Redirect the user to Paystack's page
        window.location.href = initResponse.data.authorization_url;
        // setPaymentLoading(false); // Don't set to false, user is being redirected.
        // Page will unload.
      } else {
        setPaymentLoading(false);
        alert(
          initResponse?.message ||
            "Failed to initialize payment with our server. Please try again."
        );
        console.error("Backend payment initialization failed:", initResponse);
      }
    } catch (err: any) {
      setPaymentLoading(false);
      alert(
        err.message || "An critical error occurred in the purchase process."
      );
      console.error("Critical Error in handlePurchase:", err);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    if (eventId)
      setTimeout(() => router.push(`/eventSchedule/events/${eventId}`), 3000);
  };

  // --- UI Rendering ---
  if (uiLoading || !isMounted) {
    return (
      <Center style={{ height: "80vh", flexDirection: "column" }}>
        <Loader size="lg" />
        <Text mt="md">Initializing...</Text>
      </Center>
    );
  }
  if (loading) {
    return (
      <Center style={{ height: "80vh", flexDirection: "column" }}>
        <Loader size="lg" />
        <Text mt="md">Loading event details...</Text>
      </Center>
    );
  }
  if (error || !event || !user) {
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
          {error || "Event/User data could not be loaded."}
        </Text>
        <Text>Please refresh.</Text>
      </Center>
    );
  }

  return (
    <ProtectedRoute>
      <div className={styles.container}>
        <h1 className={styles.title}>Register For {event.title}</h1>
        <p className={styles.subtitle}>You are just one step away!</p>

        <div className={styles.formContainer}>
          <div className={styles.formBox}>
            {/* Phone Number Input */}
            <div className={styles.questionItem}>
              <label
                htmlFor="phone-number-input"
                className={styles.questionLabel}
              >
                Phone Number <span className={styles.required}>*</span>
              </label>
              <TextInput
                id="phone-number-input"
                placeholder="+2349012345678"
                value={phoneNumber}
                onChange={(e) => handlePhoneChange(e.currentTarget.value)}
                error={phoneError}
                required
                className={styles.input}
                disabled={paymentLoading}
              />
            </div>

            {/* Tickets Mapping */}
            {tickets.length === 0 && !loading && (
              <div
                className={styles.noSelection}
                style={{ marginTop: "1rem", marginBottom: "1rem" }}
              >
                {" "}
                No tickets are currently available for this event.{" "}
              </div>
            )}
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                className={`${styles.formBox1} ${
                  selectedTicket === ticket.id ? styles.selected : ""
                }`}
                onClick={() =>
                  setSelectedTicket((currentId) =>
                    currentId === ticket.id ? null : ticket.id
                  )
                }
                aria-pressed={selectedTicket === ticket.id}
                disabled={paymentLoading}
              >
                {" "}
                <div>
                  {" "}
                  <div className={styles.formGroup}>
                    {" "}
                    <Text component="label" size="sm" fw={500}>
                      Ticket Type
                    </Text>{" "}
                    <TextInput
                      value={ticket.name}
                      readOnly
                      className={styles.input}
                      variant="filled"
                    />{" "}
                  </div>{" "}
                  <div className={`${styles.formGroup} ${styles.formGroup1}`}>
                    {" "}
                    <Text component="label" size="sm" fw={500}>
                      Event
                    </Text>{" "}
                    <TextInput
                      value={event.title}
                      readOnly
                      className={styles.input}
                      variant="filled"
                    />{" "}
                  </div>{" "}
                </div>{" "}
                <div className={`${styles.formGroup} ${styles.formPrice}`}>
                  {" "}
                  <Text component="label" size="sm" fw={500}>
                    Price
                  </Text>{" "}
                  <TextInput
                    value={`NGN ${parseFloat(ticket.category_price).toFixed(
                      2
                    )}`}
                    readOnly
                    className={styles.inputPrice}
                    variant="filled"
                  />{" "}
                </div>{" "}
              </button>
            ))}

            {/* Questions Display Section */}
            {questions.length > 0 && selectedTicket && (
              <div className={styles.questionsSection}>
                {" "}
                <h3 className={styles.questionsSectionTitle}>
                  {" "}
                  Additional Information Required{" "}
                </h3>{" "}
                {questions.map((q) => (
                  <div key={q.id} className={styles.questionItem}>
                    {" "}
                    <label
                      htmlFor={`question-${q.id}`}
                      className={styles.questionLabel}
                    >
                      {" "}
                      {q.title || "Unnamed Question"}{" "}
                      {q.required && <span className={styles.required}>*</span>}{" "}
                    </label>{" "}
                    {q.type === "textarea" ? (
                      <Textarea
                        id={`question-${q.id}`}
                        placeholder={q.placeholder || "Your answer here..."}
                        value={
                          answers.find((a) => a.questionId === q.id)?.value ||
                          ""
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
                        placeholder={q.placeholder || "Your answer here..."}
                        value={
                          answers.find((a) => a.questionId === q.id)?.value ||
                          ""
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
                    )}{" "}
                  </div>
                ))}{" "}
              </div>
            )}
            {questions.length === 0 && selectedTicket && !loading && (
              <Text size="sm" color="dimmed" mt="md" align="center">
                No additional questions for this ticket.
              </Text>
            )}
          </div>

          <div className={styles.summaryBox}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>
            <div className={styles.summaryContent}>
              {selectedTicket &&
              tickets.find((t) => t.id === selectedTicket) ? (
                <>
                  <div className={styles.summaryItem}>
                    <span>
                      Ticket (
                      {tickets.find((t) => t.id === selectedTicket)?.name}):
                    </span>
                    <span>NGN {(calculateTotal() - fees).toFixed(2)}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Service Fee:</span>
                    <span>NGN {fees.toFixed(2)}</span>
                  </div>
                  <div className={styles.summaryTotal}>
                    <span>Total Amount:</span>
                    <span>NGN {calculateTotal().toFixed(2)}</span>
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
              onClick={handlePurchase} // Calls the updated handlePurchase
              title={
                !isMounted
                  ? "Initializing..."
                  : !selectedTicket
                  ? "Please select a ticket"
                  : !!phoneError
                  ? "Invalid phone number"
                  : "Proceed to Payment"
              }
            >
              {paymentLoading ? (
                <Loader size="sm" color="white" />
              ) : (
                "Proceed to Payment"
              )}
            </button>
            {error && (
              <Text size="xs" color="red" align="center" mt="xs">
                {error}
              </Text>
            )}
          </div>
        </div>

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
