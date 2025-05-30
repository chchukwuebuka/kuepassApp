

"use client";
import React, { useState, FormEvent, useEffect } from "react";
import styles from "./styles.module.css";
import Navbar from "@/components/navbar";
import DetailsStep from "../DetailsStep";
import TicketsStep from "../TicketsStep";
import StepIndicator from "../StepIndicator";
import NavigationButtons from "../NavigationButtons/NavigationButtons";
import TicketModal from "../Ticket/ticketModal";
import { v4 as uuidv4 } from "uuid";
import { EventFormData, Ticket, Question } from "../../store/types";
import AppearanceStep from "../AppearanceStep";
import { Stack, Text } from "@mantine/core";
import { CustomQuestionsStep } from "../customQustion/CustomQuestionsStep Component";
import { authenticatedRequest, isAuthenticated } from "../../app/services/auth";

// Function to validate URLs
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url); // This will throw an error if the URL is invalid
    return true;
  } catch (error) {
    return false;
  }
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://keupass-48c2ae65f897.herokuapp.com/api";
const DEFAULT_BANNER_URL = "https://via.placeholder.com/150";

const CreateEventForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    location: "Virtual",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    tickets: [],
    appearance: "",
    cardColor: "#FF0000",
    questions: [],
    address: "",
    eventURL: "",
    price: "0.00",
  });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // useEffect(() => {
  //   if (!isAuthenticated()) {
  //     window.location.href = "/login";
  //   }
  // }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = "/login";
      return;
    }
  
    const fetchEventCustomization = async () => {
      if (!formData.eventURL) return;
      const eventId = formData.eventURL.split("/").pop();
      try {
        const response = await authenticatedRequest(
          `${API_BASE_URL}/event-customizations/by-event?event=${eventId}`,
          "GET"
        );
        console.log("Fetched customization:", response);
        setFormData((prev) => ({
          ...prev,
          appearance: response.banner_url || DEFAULT_BANNER_URL,
          cardColor: response.card_color || "#FF0000",
        }));
      } catch (error: any) {
        console.error("Failed to fetch customization:", error);
        // Use defaults if no customization exists
        setFormData((prev) => ({
          ...prev,
          appearance: DEFAULT_BANNER_URL,
          cardColor: "#FF0000",
        }));
      }
    };
  
    fetchEventCustomization();
  }, [formData.eventURL]);

  // API helper functions
  const createEvent = async (data: Partial<EventFormData>) => {
    const res = await authenticatedRequest<{ data: any }>(
      `${API_BASE_URL}/events/`,
      "POST",
      data
    );
    return res.data;
  };

const createEventCustomization = async (data: {
  event: string; // This is the eventId
  banner_url: string;
  font: string;
  card_color: string;
  is_active: boolean;
}) => {
  console.log("Event Customization Payload for event ID:", data.event, JSON.stringify(data, null, 2));
  try {
    // Attempt to fetch existing customizations for this event
    // Use the standard LIST endpoint with a filter
    const existingCustomizationsResponse = await authenticatedRequest<any[]>( // Expecting an array
      `<span class="math-inline">\{API\_BASE\_URL\}/event\-customizations/?event\=</span>{data.event}`, // CORRECTED URL
      "GET"
    );
    console.log("Fetched existing customizations for event:", data.event, existingCustomizationsResponse);

    // Assuming you only care about the first active one, or if one exists at all
    const existingActiveCustomization = existingCustomizationsResponse?.find(cust => cust.is_active);

    if (existingActiveCustomization && existingActiveCustomization.id) {
      console.log("Found existing active customization, ID:", existingActiveCustomization.id);
      // Update existing customization
      await authenticatedRequest(
        `<span class="math-inline">\{API\_BASE\_URL\}/event\-customizations/</span>{existingActiveCustomization.id}/`, // Standard DETAIL endpoint for PUT
        "PUT",
        data // Send the full data for update
      );
      console.log("Updated existing customization for event:", data.event);
    } else {
      console.log("No existing active customization found, creating new for event:", data.event);
      await authenticatedRequest(
        `${API_BASE_URL}/event-customizations/`, // Standard LIST endpoint for POST
        "POST", // Your backend 'create' method handles upsert
        data // 'data' includes the 'event' field (eventId)
      );
      console.log("Created/Upserted customization for event:", data.event);
    }
  } catch (error: any) {
    if (error.message && error.message.includes("404")) { // Basic check for 404
        console.log("No existing customization found (404), proceeding to create new for event:", data.event);
        try {
            await authenticatedRequest(
                `${API_BASE_URL}/event-customizations/`,
                "POST",
                data
            );
            console.log("Created new customization after 404 on GET, for event:", data.event);
        } catch (createError: any) {
            console.error("Error creating customization after initial 404:", createError);
            throw new Error(createError.message || "Failed to create event customization.");
        }
    } else {
        console.error("Error saving/fetching customization:", error);
        throw new Error(error.message || "Failed to save event customization.");
    }
  }
};

  const createQuestion = async (data: {
    event_id: string;
    type: string;
    title: string;
    required: boolean;
    placeholder: string | null;
    order: number;
  }) => {
    await authenticatedRequest(
      `${API_BASE_URL}/questions/`,
      "POST",
      data
    );
  };

  const createTicketType = async (data: {
    event: string;
    category_name: "Paid" | "Free" | "Invite";
    category_price: number;
    name: string;
    quantity?: number | string | null;
  }) => {
    // Validate payload
    if (!data.event) throw new Error("Event ID is required");
    if (!["Paid", "Free", "Invite"].includes(data.category_name)) {
      throw new Error("Invalid category_name");
    }
    if (data.category_name === "Paid" && (isNaN(data.category_price) || data.category_price < 0)) {
      throw new Error("Invalid category_price");
    }
    if (!data.name) throw new Error("Ticket name is required");

    const payload: {
      event: string;
      category_name: "Paid" | "Free" | "Invite";
      category_price: string;
      name: string;
      quantity?: string | null;
    } = {
      event: data.event,
      category_name: data.category_name,
      category_price: data.category_price.toFixed(2),
      name: data.name,
    };
    if (data.quantity !== undefined) {
      payload.quantity = data.quantity === "Unlimited" ? "Unlimited" : data.quantity.toString();
    }
    console.log("Ticket type payload:", payload);
    try {
      await authenticatedRequest(
        `${API_BASE_URL}/tickets/`,
        "POST",
        payload
      );
    } catch (error: any) {
      console.error("Ticket type error:", error);
      const errorMessage = error.message || "Failed to create ticket type.";
      throw new Error(errorMessage);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("image", file);
    const res = await authenticatedRequest<{
      success: boolean;
      message: string;
      data: { url: string };
    }>(`${API_BASE_URL}/upload-image/`, "POST", form);
    if (!res.success) throw new Error(res.message);

    let imageUrl = res.data.url;
    // Strip any incorrect localhost prefix
    if (imageUrl.startsWith("http://localhost:8000")) {
      imageUrl = imageUrl.replace("http://localhost:8000", "");
    }
    // Ensure the URL is absolute
    if (!imageUrl.startsWith("https://")) {
      imageUrl = `https://res.cloudinary.com${imageUrl}`;
    }
    // Validate the URL
    try {
      new URL(imageUrl);
    } catch {
      throw new Error(`Invalid image URL: ${imageUrl}`);
    }
    return imageUrl; // Return the URL to the uploaded image
  };

  // Handlers for form steps
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((p) => ({ ...p, [id]: value }));
  };

  const handleLocationChange = (value: "Virtual" | "Physical") => {
    setFormData((p) => ({ ...p, location: value }));
  };

  const handleUpdateQuestions = (questions: Question[]) => {
    setFormData((p) => ({ ...p, questions }));
  };

  const handleTicketTypeChange = (index: number, value: string) => {
    const validTypes = ["Paid", "Free", "Invite"] as const;
    if (!validTypes.includes(value as any)) return;
    const updated = [...formData.tickets];
    updated[index].type = value;
    if (value === "Free") updated[index].price = 0;
    if (value !== "Invite") delete updated[index].inviteEmail;
    setFormData((p) => ({ ...p, tickets: updated }));
  };

  const handleSendInvite = (ticketId: string) => {
    const email = prompt("Enter invitee's email:");
    if (email) {
      setFormData((p) => ({
        ...p,
        tickets: p.tickets.map((t) =>
          t.id === ticketId ? { ...t, inviteEmail: email } : t
        ),
      }));
      alert(`Invite sent to ${email}`);
    }
  };

  const addTicket = (ticket: Omit<Ticket, "id">) => {
    const price = parseFloat(ticket.price.toString());
    if (isNaN(price) || price < 0) {
      alert("Please enter a valid ticket price.");
      return;
    }
    if (ticket.type === "Paid" && price > 1000) {
      alert("Ticket price cannot exceed $1000.00.");
      return;
    }
    if (!ticket.name) {
      alert("Ticket name is required.");
      return;
    }
    const newTicket: Ticket = {
      ...ticket,
      id: uuidv4(),
      price: price,
      quantity: ticket.quantity || 0,
      type: ticket.type || "Paid",
    };
    console.log("Added ticket:", newTicket); // Debug
    setFormData((p) => ({
      ...p,
      tickets: [...p.tickets, newTicket],
      price: price.toFixed(2),
    }));
    setIsModalOpen(false);
  };

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
  };

  // Final submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentStep < 4) return setCurrentStep((p) => p + 1);

    setIsLoading(true);
    try {
      // Basic validation
      if (!formData.title) throw new Error("Event title is required.");
      if (!formData.tickets.length) throw new Error("At least one ticket is required.");

      // Upload banner image if a file is selected
      let imageUrl = formData.appearance; // If appearance is already set, use it
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile); // Upload the image and get the URL
        if (!isValidUrl(imageUrl)) {
          throw new Error(`Invalid banner URL: ${imageUrl}`);
        }
        setFormData((p) => ({ ...p, appearance: imageUrl }));
      }

      // Use default banner URL if no image is uploaded
      const bannerUrl = imageUrl || DEFAULT_BANNER_URL;
      if (!isValidUrl(bannerUrl)) {
        throw new Error(`Invalid default banner URL: ${bannerUrl}`);
      }

      if (!/^#[0-9A-Fa-f]{6}$/.test(formData.cardColor)) {
        throw new Error("Invalid card color. Must be a 6-digit hex code (e.g., #800080)");
      }

      // Create the event
      const evt = await createEvent({
        title: formData.title,
        description: formData.description,
        location: formData.location,
        start_date: `${formData.startDate}T${formData.startTime}:00Z`,
        end_date: `${formData.endDate}T${formData.endTime}:00Z`,
        price: formData.price,
        is_active: true,
      });
      const eventId = evt.id;
      if (!eventId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eventId)) {
        throw new Error("Invalid event ID");
      }
      setFormData((p) => ({ ...p, eventURL: `${API_BASE_URL}/events/${eventId}` }));

      // 3) Event Customization
      await createEventCustomization({
        event: eventId,
        banner_url: bannerUrl, // Use the uploaded or default banner URL
        font: "Arial",
        card_color: formData.cardColor,
        is_active: true,
      });

      // 4) Questions
      for (const q of formData.questions) {
        await createQuestion({
          event_id: eventId,
          type: q.type || "text",
          title: q.title,
          required: q.required || false,
          placeholder: q.placeholder || null,
          order: q.order || 0,
        });
      }

      // 5) Tickets & Ticket Types
      for (const t of formData.tickets) {
        const payload = {
          event: eventId,
          category_name: t.type,
          category_price: t.type === "Free" ? 0 : t.price,
          name: t.name || "General Ticket",
          quantity: t.quantity,
        };
        await createTicketType(payload);
      }

      alert("Event created successfully!");

      // Reset form after submission
      setFormData({
        title: "",
        description: "",
        location: "Virtual",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        tickets: [],
        appearance: "",
        cardColor: "#FF0000",
        questions: [],
        address: "",
        eventURL: "",
        price: "0.00",
      });
      setSelectedFile(null);
      setCurrentStep(1);
    } catch (err: any) {
      console.error("Error creating event:", err);
      alert(err.message || "Failed to create event. Please check the form and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => currentStep > 1 && setCurrentStep((p) => p - 1);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <DetailsStep
            formData={formData}
            handleChange={handleChange}
            handleLocationChange={handleLocationChange}
          />
        );
      case 2:
        return (
          <TicketsStep
            tickets={formData.tickets}
            openModal={() => setIsModalOpen(true)}
            handleTicketTypeChange={handleTicketTypeChange}
            handleSendInvite={handleSendInvite}
          />
        );
      case 3:
        return (
          <CustomQuestionsStep
            questions={formData.questions}
            setQuestions={handleUpdateQuestions}
          />
        );
      case 4:
        return (
          <AppearanceStep
            formData={formData}
            updateFormData={(u) => setFormData((p) => ({ ...p, ...u }))}
            onFileSelect={handleFileSelect}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.formContainer}>
      <Stack>
        <Navbar />
      </Stack>
      <h1 className={styles.title}>Create A New Event</h1>
      <p className={styles.subtitle}>You are Just Four Steps Away!</p>
      <StepIndicator currentStep={currentStep} totalSteps={4} />
      <form onSubmit={handleSubmit} className={styles.eventForm}>
        {renderStepContent()}
        <NavigationButtons
          currentStep={currentStep}
          handleBack={handleBack}
          isLastStep={currentStep === 4}
          isLoading={isLoading}
        />
      </form>
      <TicketModal
        isModalOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        addTicket={addTicket}
      />
    </div>
  );
};

export default CreateEventForm;





{/* <Text>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Voluptatem assumenda est excepturi! Minima, adipisci dolorem? Pariatur, voluptatum. Eaque, aliquid illum animi odit obcaecati esse inventore ad! Commodi omnis ut, excepturi unde, praesentium ducimus cum, doloremque odio nesciunt illo nulla non.</Text> */}