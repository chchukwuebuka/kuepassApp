
// components/CreateEventForm/CreateEventForm.tsx
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
import { EventFormData, Ticket, Question, Option } from "../../store/types";
import AppearanceStep from "../AppearanceStep";
import { Stack, Text, Button, Loader, Center } from "@mantine/core";
import { CustomQuestionsStep } from "../customQustion/CustomQuestionsStep Component";
import { authenticatedRequest, isAuthenticated } from "../../app/services/auth";
import { useLoadingState } from "@/store/loadingHook";

const isValidUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};
const isValidHex = (color: string): boolean => {
  if (!color) return false;
  return /^#[0-9A-Fa-f]{6}$/i.test(color);
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://keupass-48c2ae65f897.herokuapp.com/api";
const DEFAULT_BANNER_URL = "/images/placeholder-banner.png";
const FORM_STORAGE_KEY = "kuepassCreateEventFormDraft";

export default function CreateEventForm() {
  const initialFormData: EventFormData = {
    title: "",
    description: "",
    location: "Virtual",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    tickets: [],
    appearance: DEFAULT_BANNER_URL,
    cardColor: "#025a3a",
    questions: [],
    address: "",
    eventURL: "",
    price: "0.00",
  };

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<EventFormData>(initialFormData);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { withLoading } = useLoadingState();

  // --- NEW: State for the AI assist button's loading status ---
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href =
        "/auth/signin?redirect=" + encodeURIComponent(window.location.pathname);
      return;
    }
    const savedDraft = localStorage.getItem(FORM_STORAGE_KEY);
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        if (
          parsedDraft.formData &&
          typeof parsedDraft.currentStep === "number"
        ) {
          const loadedFormData = {
            ...initialFormData,
            ...parsedDraft.formData,
            appearance:
              parsedDraft.formData.appearance &&
              parsedDraft.formData.appearance.startsWith("blob:")
                ? initialFormData.appearance
                : parsedDraft.formData.appearance || initialFormData.appearance,
          };
          setFormData(loadedFormData);
          setCurrentStep(parsedDraft.currentStep);
        } else {
          setFormData(initialFormData);
          setCurrentStep(1);
        }
      } catch (error) {
        setFormData(initialFormData);
        setCurrentStep(1);
      }
    } else {
      setFormData(initialFormData);
      setCurrentStep(1);
    }
    setSelectedFile(null);
    setIsInitializing(false);
  }, []);

  useEffect(() => {
    if (isInitializing || !isAuthenticated()) {
      return;
    }
    const draftToSave = {
      formData: {
        ...formData,
        appearance: selectedFile
          ? initialFormData.appearance
          : formData.appearance,
      },
      currentStep,
    };
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(draftToSave));
  }, [
    formData,
    currentStep,
    isInitializing,
    selectedFile,
    initialFormData.appearance,
  ]);

  const createEvent = async (
    data: Partial<
      Omit<
        EventFormData,
        | "tickets"
        | "questions"
        | "appearance"
        | "cardColor"
        | "eventURL"
        | "startDate"
        | "startTime"
        | "endDate"
        | "endTime"
      > & { start_date: string; end_date: string }
    >
  ) => {
    const res = await authenticatedRequest<{
      data: { id: string } & EventFormData;
    }>(`${API_BASE_URL}/events/`, "POST", data);
    if (!res || !res.data || !res.data.id)
      throw new Error("Event creation failed or ID not returned by API.");
    return res.data;
  };

  const createEventCustomization = async (data: {
    event: string;
    banner_url: string;
    font: string;
    card_color: string;
    is_active: boolean;
  }) => {
    try {
      await authenticatedRequest(
        `${API_BASE_URL}/event-customizations/`,
        "POST",
        data
      );
    } catch (error: any) {
      console.error("Error saving event customization:", error);
      throw new Error(error.message || "Failed to save event customization.");
    }
  };

  const createTicketType = async (data: {
    event: string;
    category_name: "Paid" | "Free" | "Invite";
    category_price: number;
    name: string;
    quantity?: number | string | null;
  }) => {
    const payload = {
      event: data.event,
      category_name: data.category_name,
      category_price: data.category_price.toFixed(2),
      name: data.name,
      quantity:
        data.quantity === "Unlimited" ? "Unlimited" : data.quantity?.toString(),
    };
    await authenticatedRequest(`${API_BASE_URL}/tickets/`, "POST", payload);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formD = new FormData();
    formD.append("image", file);
    const res = await authenticatedRequest<{
      success: boolean;
      message: string;
      data?: { url: string };
      url?: string;
    }>(`${API_BASE_URL}/upload-image/`, "POST", formD);
    const imageUrl = res.data?.url || (res as any).url;
    if (!res.success || !imageUrl)
      throw new Error(
        (res as any).message || "Image upload failed or URL not returned."
      );
    if (!isValidUrl(imageUrl))
      throw new Error(`Invalid image URL from upload: ${imageUrl}`);
    return imageUrl;
  };

  const createQuestion = async (data: {
    event_id: string;
    type: string;
    title: string;
    required: boolean;
    placeholder: string | null;
    order: number;
    options?: { text: string; order?: number }[];
  }) => {
    await authenticatedRequest(`${API_BASE_URL}/questions/`, "POST", data);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleLocationChange = (value: "Virtual" | "Physical") => {
    setFormData((p) => ({
      ...p,
      location: value,
      address: value === "Virtual" ? "" : p.address,
    }));
  };

  const addTicket = (ticketDataFromModal: Omit<Ticket, "id">) => {
    const price = parseFloat(ticketDataFromModal.price.toString());
    if (
      isNaN(price) ||
      (ticketDataFromModal.type === "Paid" && price < 0) ||
      (ticketDataFromModal.type === "Free" && price !== 0)
    ) {
      alert("Please enter a valid ticket price.");
      return;
    }
    if (!ticketDataFromModal.name) {
      alert("Ticket name is required.");
      return;
    }

    const newTicket: Ticket = {
      ...ticketDataFromModal,
      id: uuidv4(),
      price: price,
      quantity: ticketDataFromModal.quantity,
    };
    setFormData((p) => ({ ...p, tickets: [...p.tickets, newTicket] }));
    setIsModalOpen(false);
  };

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    if (file) {
      setFormData((prev) => ({
        ...prev,
        appearance: URL.createObjectURL(file),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        appearance: initialFormData.appearance,
      }));
    }
  };

  const handleUpdateQuestions = (questions: Question[]) => {
    setFormData((p) => ({ ...p, questions }));
  };
  
  // --- UPDATED: New AI handler function ---
  const handleAiAction = async (mode: 'generate' | 'refine' | 'complete') => {
    if (!formData.title) {
        alert("Please enter an event title first.");
        return;
    }
    if ((mode === 'refine' || mode === 'complete') && !formData.description) {
        alert("Please type something in the description before using this feature.");
        return;
    }

    setIsGenerating(true);
    try {
        const response = await authenticatedRequest<{ description: string }>(
            "https://keupass-48c2ae65f897.herokuapp.com/api/generate-description/", // Your Django URL
            "POST",
            {
                title: formData.title,
                description: formData.description, // Send the current description
                mode: mode, // Send the action to be performed
            }
        );

        if (response && response.description) {
            setFormData(prev => ({ ...prev, description: response.description }));
        }
    } catch (error: any) {
        console.error("Failed to perform AI action:", error);
        alert(error.message || "Sorry, the AI action failed.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentStep < 4) {
      setCurrentStep((p) => p + 1);
      return;
    }

    setIsLoading(true);
    try {
      await withLoading(async () => {
        if (!formData.title) throw new Error("Event title is required.");
        if (formData.tickets.length === 0)
          throw new Error("At least one ticket type is required.");

        let finalBannerUrl = formData.appearance;
        if (selectedFile) {
          finalBannerUrl = await uploadImage(selectedFile);
        } else if (formData.appearance.startsWith("blob:")) {
          finalBannerUrl = initialFormData.appearance || DEFAULT_BANNER_URL;
        }

        if (!isValidUrl(finalBannerUrl) || finalBannerUrl.startsWith("blob:")) {
          finalBannerUrl = DEFAULT_BANNER_URL;
        }

        if (!isValidHex(formData.cardColor)) {
          throw new Error(
            "Invalid card color format. Please use a 6-digit hex code (e.g. #RRGGBB)."
          );
        }

        const eventApiPayload = {
          title: formData.title,
          description: formData.description,
          location: formData.location,
          start_date: `${formData.startDate}T${formData.startTime}:00Z`,
          end_date: `${formData.endDate}T${formData.endTime}:00Z`,
          price: formData.price,
          is_active: true,
          address: formData.address,
        };
        const createdEvent = await createEvent(eventApiPayload);
        const eventId = createdEvent.id;

        setFormData((p) => ({
          ...p,
          eventURL: `${API_BASE_URL}/events/${eventId}`,
        }));

        await createEventCustomization({
          event: eventId,
          banner_url: finalBannerUrl,
          font: "Arial",
          card_color: formData.cardColor,
          is_active: true,
        });

        for (const [questionIndex, q] of formData.questions.entries()) {
          const optionPayload =
            q.options?.map((opt, optIndex) => ({
              text: opt.text,
              order: typeof opt.order === "number" ? opt.order : optIndex,
            })) || [];

          const questionPayloadForApi = {
            event_id: eventId,
            type: q.type || "text",
            title: q.title,
            required: q.required || false,
            placeholder: q.placeholder || null,
            order: typeof q.order === "number" ? q.order : questionIndex,
            options: optionPayload,
          };

          console.log(
            "Frontend: Sending this question to POST /api/questions/:",
            JSON.stringify(questionPayloadForApi, null, 2)
          );

          await createQuestion(questionPayloadForApi);
        }

        for (const t of formData.tickets) {
          await createTicketType({
            event: eventId,
            category_name: t.type,
            category_price: t.type === "Free" ? 0 : Number(t.price),
            name: t.name || "General Ticket",
            quantity: t.quantity,
          });
        }

        alert("Event created successfully!");
        localStorage.removeItem(FORM_STORAGE_KEY);
        setFormData(initialFormData);
        setSelectedFile(null);
        setCurrentStep(1);
      });
    } catch (err: any) {
      console.error("Error creating event:", err);
      alert(
        err.message ||
          "Failed to create event. Please check the form and try again."
      );
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
            // --- UPDATED: Pass the new handler and state ---
            onAiAction={handleAiAction}
            isGenerating={isGenerating}
          />
        );
      case 2:
        return (
          <TicketsStep
            tickets={formData.tickets}
            openModal={() => setIsModalOpen(true)}
            handleTicketTypeChange={(index, value) => {
              const validTypes = ["Paid", "Free", "Invite"] as const;
              if (!validTypes.includes(value as any)) return;
              const updatedTickets = formData.tickets.map((t, i) => {
                if (i === index) {
                  const updatedTicket = { ...t, type: value as Ticket["type"] };
                  if (value === "Free") updatedTicket.price = 0;
                  return updatedTicket;
                }
                return t;
              });
              setFormData((prev) => ({ ...prev, tickets: updatedTickets }));
            }}
            handleSendInvite={(ticketId: string) => {
              /* ... */
            }}
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

  if (isInitializing) {
    return (
      <Center style={{ height: "100vh" }}>
        <Loader /> <Text ml="sm">Loading draft…</Text>
      </Center>
    );
  }

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
}