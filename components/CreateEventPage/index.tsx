"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  IconUpload,
  IconEye,
  IconCheck,
  IconCalendar,
  IconCalendarEvent,
  IconTrash,
} from "@tabler/icons-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./styles.module.css";
import AutocompleteInput from "./AutocompleteInput";
import ProgressTracker from "./ProgressTracker";
import LocationMapSection from "./LocationMapSection";
import EventDetailsSection from "./EventDetailsSection";
import RecurringEventDetails from "./RecurringEventDetails";
import TicketsStep from "./TicketsStep";
import PreviewStep from "./PreviewStep";
import ButtonTextSelector from "./ButtonTextSelector";
import {
  getUserTimezone,
  getAllTimezoneOptions,
  type TimezoneOption,
} from "./utils/timezone";
import { authenticatedRequest, isAuthenticated } from "@/app/services/auth";
import { Ticket, Question } from "@/store/types";
import { v4 as uuidv4 } from "uuid";
import dynamic from "next/dynamic";

const TicketModal = dynamic(() => import("@/components/Ticket/ticketModal"), {
  ssr: false,
});

const QuestionModal = dynamic(() => import("./QuestionModal"), {
  ssr: false,
});

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.kuepass.com/api/"
).replace(/\/$/, "");

const DEFAULT_BANNER_URL = "/images/placeholder-banner.png";
const FORM_STORAGE_KEY = "kuepassCreateEventFormDraft";

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

// Helper function to extract URL strings from image objects or strings
const extractBannerUrls = (
  eventImagePreview: any,
  additionalImages: any[]
): string[] => {
  const urls: string[] = [];

  // 1) Main image (if any)
  if (eventImagePreview) {
    if (typeof eventImagePreview === "string") {
      // Already a string URL - only accept HTTP/HTTPS URLs, not data URLs or blob URLs
      if (
        eventImagePreview.trim() !== "" &&
        !eventImagePreview.startsWith("blob:") &&
        !eventImagePreview.startsWith("data:") &&
        (eventImagePreview.startsWith("http://") ||
          eventImagePreview.startsWith("https://")) &&
        isValidUrl(eventImagePreview)
      ) {
        urls.push(eventImagePreview);
      }
    } else if (
      typeof eventImagePreview === "object" &&
      eventImagePreview !== null
    ) {
      // Extract URL from object
      const url =
        eventImagePreview.secure_url ||
        eventImagePreview.url ||
        eventImagePreview.src ||
        eventImagePreview.public_id ||
        "";
      if (
        url &&
        typeof url === "string" &&
        url.trim() !== "" &&
        !url.startsWith("blob:") &&
        !url.startsWith("data:") &&
        (url.startsWith("http://") || url.startsWith("https://")) &&
        isValidUrl(url)
      ) {
        urls.push(url);
      }
    }
  }

  // 2) Additional images
  if (additionalImages && Array.isArray(additionalImages)) {
    additionalImages.forEach((img: any) => {
      if (!img) return;

      if (typeof img === "string") {
        // Already a string URL - only accept HTTP/HTTPS URLs, not data URLs or blob URLs
        if (
          img.trim() !== "" &&
          !img.startsWith("blob:") &&
          !img.startsWith("data:") &&
          (img.startsWith("http://") || img.startsWith("https://")) &&
          isValidUrl(img)
        ) {
          urls.push(img);
        }
      } else if (typeof img === "object" && img !== null) {
        // Extract URL from object
        const url = img.secure_url || img.url || img.src || img.public_id || "";
        if (
          url &&
          typeof url === "string" &&
          url.trim() !== "" &&
          !url.startsWith("blob:") &&
          isValidUrl(url)
        ) {
          urls.push(url);
        }
      }
    });
  }

  // Remove duplicates and return
  return Array.from(new Set(urls.filter(Boolean)));
};

export default function CreateEventPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [eventImage, setEventImage] = useState<File | null>(null);
  const [eventImagePreview, setEventImagePreview] = useState<string | null>(
    null
  );
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [timezoneOptions, setTimezoneOptions] = useState<TimezoneOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] =
    useState<boolean>(false);
  const [tickets, setTickets] = useState<
    (Ticket & {
      startDate?: string;
      endDate?: string;
      purchaseLimit?: number;
      description?: string;
      perks?: string[];
      type?: "Paid" | "Free" | "Invite" | "Donations";
    })[]
  >([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [cardColor, setCardColor] = useState<string>("#025a3a");
  const [lineupItems, setLineupItems] = useState<
    Array<{
      id: string;
      name: string;
      description: string;
      role: string;
      image?: string;
      imageFile?: File;
    }>
  >([]);
  const [schedules, setSchedules] = useState<
    Array<{
      id: string;
      name: string;
      slots: Array<{
        id: string;
        title: string;
        startTime: string;
        endTime: string;
        hostName?: string;
        description?: string;
      }>;
    }>
  >([]);
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    eventName: "",
    eventDescription: "",
    eventType: "",
    eventTimingType: "single" as "single" | "recurring",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    timezone: "",
    repeatPattern: "",
    repeatOnDays: [] as string[],
    repeatOnMonthDays: [] as string[],
    timeMode: "single" as "single" | "multiple",
    timeSlots: [] as Array<{ id: string; startTime: string; endTime: string }>,
    locationType: "venue" as "venue" | "virtual" | "tba",
    address: "",
    streetAddress: "",
    landmark: "", // Additional location details like landmarks
    country: "",
    city: "",
    state: "",
    meetingLink: "",
    additionalDetails: "",
    tags: ["Live music", "Conference", "Dance party", "Cultural festival"],
    socialLinks: {
      instagram: "",
      youtube: "",
      tiktok: "",
    },
    sections: [] as string[],
    ticketButtonText: "Get Ticket",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalFileInputRef = useRef<HTMLInputElement>(null);

  // AI-powered event creation state
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showAiSection, setShowAiSection] = useState<boolean>(true);
  const [aiGenerated, setAiGenerated] = useState<boolean>(false);
  const [aiTicketSuggestions, setAiTicketSuggestions] = useState<
    Array<{
      id: string;
      name: string;
      price: number;
      quantity: string;
      type: string;
      description: string;
      perks: string[];
    }>
  >([]);

  // AI Smart Assist state
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, any>>({});
  const [aiQuestionSuggestions, setAiQuestionSuggestions] = useState<
    Array<{
      id: string;
      type: string;
      title: string;
      required: boolean;
      placeholder: string;
      options: string[];
    }>
  >([]);
  const [smartAssistLoading, setSmartAssistLoading] = useState(false);
  const smartAssistTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());
  const [selectedVendorIds, setSelectedVendorIds] = useState<(number | string)[]>([]);

  // Fetch event types from backend
  const fetchEventTypes = async () => {
    try {
      // Try OPTIONS request to get field choices (Django REST Framework pattern)
      const optionsResponse = await fetch(`${API_BASE_URL}/events/`, {
        method: "OPTIONS",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (optionsResponse.ok) {
        const optionsData = await optionsResponse.json();
        // Check if event_type choices are in the actions.POST structure
        const postActions = optionsData?.actions?.POST;
        if (postActions?.event_type?.choices) {
          const choices = postActions.event_type.choices;
          const types = Array.isArray(choices)
            ? choices.map((choice: any) =>
                typeof choice === "string"
                  ? choice
                  : choice.value || choice.display_name || choice
              )
            : [];
          if (types.length > 0) {
            setEventTypes(types);
            return;
          }
        }
      }

      // Fallback: Try a dedicated endpoint (if backend provides one)
      try {
        const typesResponse = await authenticatedRequest(
          `${API_BASE_URL}/events/event-types/`,
          "GET"
        ).catch(() => null);

        if (typesResponse && Array.isArray(typesResponse)) {
          setEventTypes(typesResponse);
          return;
        }
        if (typesResponse && Array.isArray((typesResponse as any).data)) {
          setEventTypes((typesResponse as any).data);
          return;
        }
      } catch (error) {
        console.log("Event types endpoint not available, using fallback");
      }

      // Final fallback: Use hardcoded values (matching the 18 enum values from Swagger)
      setEventTypes([
        "Conference",
        "Workshop",
        "Seminar",
        "Concert",
        "Festival",
        "Networking",
        "Sports",
        "Wedding",
        "Birthday",
        "Anniversary",
        "Graduation",
        "Corporate",
        "Charity",
        "Fundraiser",
        "Exhibition",
        "Trade Show",
        "Meetup",
        "Other",
      ]);
    } catch (error) {
      console.error("Error fetching event types:", error);
      // Fallback to hardcoded values on error
      setEventTypes([
        "Conference",
        "Workshop",
        "Seminar",
        "Concert",
        "Festival",
        "Networking",
        "Sports",
        "Wedding",
        "Birthday",
        "Anniversary",
        "Graduation",
        "Corporate",
        "Charity",
        "Fundraiser",
        "Exhibition",
        "Trade Show",
        "Meetup",
        "Other",
      ]);
    }
  };

  // Initialize form: check auth, load draft, setup timezone
  useEffect(() => {
    const initializeForm = async () => {
      try {
        // Check authentication
        if (!isAuthenticated()) {
          router.push(
            `/auth/signin?redirect=${encodeURIComponent(
              window.location.pathname
            )}`
          );
          return;
        }

        // Load draft from localStorage
        const savedDraft = localStorage.getItem(FORM_STORAGE_KEY);
        if (savedDraft) {
          try {
            const parsedDraft = JSON.parse(savedDraft);
            if (
              parsedDraft.formData &&
              typeof parsedDraft.currentStep === "number"
            ) {
              // Extract eventImagePreview from formData before setting formData
              const imagePreview = parsedDraft.formData.eventImagePreview;
              const { eventImagePreview: _, ...formDataWithoutImage } =
                parsedDraft.formData;

              setFormData((prev) => ({
                ...prev,
                ...formDataWithoutImage,
              }));

              // Set eventImagePreview separately (it's a separate state, not part of formData)
              if (imagePreview && !imagePreview.startsWith("blob:")) {
                setEventImagePreview(imagePreview);
              } else {
                setEventImagePreview(null);
              }

              setCurrentStep(parsedDraft.currentStep);
              if (parsedDraft.tickets) {
                setTickets(parsedDraft.tickets);
              }
              if (parsedDraft.questions) {
                setQuestions(parsedDraft.questions);
              }
              if (parsedDraft.cardColor) {
                setCardColor(parsedDraft.cardColor);
              }
              if (parsedDraft.additionalImages) {
                setAdditionalImages(parsedDraft.additionalImages);
              }
              if (parsedDraft.lineupItems) {
                setLineupItems(parsedDraft.lineupItems);
              }
              if (parsedDraft.schedules) {
                setSchedules(parsedDraft.schedules);
              }
            }
          } catch (error) {
            console.error("Error parsing saved draft:", error);
          }
        }

        // Setup timezone
        try {
          const userTimezone = getUserTimezone();
          const options = getAllTimezoneOptions();
          setTimezoneOptions(options);

          setFormData((prev) => {
            if (!prev.timezone && userTimezone) {
              return { ...prev, timezone: userTimezone };
            }
            return prev;
          });
        } catch (error) {
          console.error("Error initializing timezones:", error);
          setTimezoneOptions([]);
        }

        // Fetch event types from backend
        fetchEventTypes();
      } finally {
        setIsLoading(false);
      }
    };

    initializeForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save draft to localStorage
  const saveDraft = () => {
    if (!isAuthenticated()) return;
    const draftToSave = {
      formData: {
        ...formData,
        eventImagePreview: eventImagePreview,
      },
      currentStep,
      tickets,
      cardColor,
      additionalImages,
      questions,
      lineupItems,
      schedules,
    };
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(draftToSave));
  };

  // Save draft whenever form data changes
  useEffect(() => {
    if (!isLoading) {
      saveDraft();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formData,
    currentStep,
    tickets,
    questions,
    cardColor,
    additionalImages,
    eventImagePreview,
    lineupItems,
    schedules,
  ]);

  // Clear all form data and reset to defaults
  const clearAllData = () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear all data? This will reset the form and remove any saved draft."
    );
    if (!confirmed) return;

    // Remove draft from localStorage
    localStorage.removeItem(FORM_STORAGE_KEY);

    // Reset all state to defaults
    setCurrentStep(1);
    setEventImage(null);
    setEventImagePreview(null);
    setAdditionalImages([]);
    setTickets([]);
    setQuestions([]);
    setEditingQuestion(null);
    setCardColor("#025a3a");
    setLineupItems([]);
    setSchedules([]);
    setAiPrompt("");
    setAiError(null);
    setAiGenerated(false);
    setAiTicketSuggestions([]);
    setAiSuggestions({});
    setAiQuestionSuggestions([]);
    setDismissedSuggestions(new Set());
    setShowAiSection(true);
    setFormData({
      eventName: "",
      eventDescription: "",
      eventType: "",
      eventTimingType: "single" as "single" | "recurring",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      timezone: getUserTimezone() || "",
      repeatPattern: "",
      repeatOnDays: [] as string[],
      repeatOnMonthDays: [] as string[],
      timeMode: "single" as "single" | "multiple",
      timeSlots: [] as Array<{ id: string; startTime: string; endTime: string }>,
      locationType: "venue" as "venue" | "virtual" | "tba",
      address: "",
      streetAddress: "",
      landmark: "",
      country: "",
      city: "",
      state: "",
      meetingLink: "",
      additionalDetails: "",
      tags: ["Live music", "Conference", "Dance party", "Cultural festival"],
      socialLinks: {
        instagram: "",
        youtube: "",
        tiktok: "",
      },
      sections: [] as string[],
      ticketButtonText: "Get Ticket",
    });
  };

  // Fetch event and customization data (including banner URL) when eventId is present
  const fetchEventAndCustomization = async () => {
    if (!eventId) {
      return;
    }

    console.log("Fetching event and customization for eventId:", eventId);
    setIsLoading(true);

    try {
      // Fetch customization, event, tickets, and questions in parallel
      const [cuRes, evRes, ticketsRes, questionsRes] = await Promise.all([
        authenticatedRequest(
          `${API_BASE_URL}/event-customizations/?event=${eventId}`,
          "GET",
          { headers: { "Cache-Control": "no-cache" } }
        ).catch(() => ({ data: [] })),
        authenticatedRequest(`${API_BASE_URL}/events/${eventId}/`, "GET", {
          headers: { "Cache-Control": "no-cache" },
        }),
        authenticatedRequest(
          `${API_BASE_URL}/tickets/?event=${eventId}`,
          "GET",
          { headers: { "Cache-Control": "no-cache" } }
        ).catch(() => ({ data: [] })),
        authenticatedRequest(
          `${API_BASE_URL}/event-forms/${eventId}/questions/`,
          "GET",
          { headers: { "Cache-Control": "no-cache" } }
        ).catch(() => ({ data: [] })),
      ]);

      console.log("Raw customization response:", cuRes);
      const list = Array.isArray((cuRes as any).data)
        ? (cuRes as any).data
        : Array.isArray(cuRes)
        ? cuRes
        : [];
      const existing = list.length > 0 ? list[0] : null;
      console.log("Existing customization:", existing);

      console.log("Raw event response:", evRes);
      const event = (evRes as any).data || evRes;

      // Get banner URL - prioritize customization's banner_url, then event's banner_url
      // banner_url can be an array or a string
      const bannerUrlRaw =
        existing?.banner_url || event.banner_url || DEFAULT_BANNER_URL;
      console.log("Banner URL:", bannerUrlRaw);

      // Handle both array and string formats
      let bannerUrl: string = DEFAULT_BANNER_URL;
      if (Array.isArray(bannerUrlRaw) && bannerUrlRaw.length > 0) {
        // If it's an array, use the first valid URL
        const firstUrl = bannerUrlRaw.find(
          (url: any) =>
            typeof url === "string" &&
            url.trim() !== "" &&
            !url.startsWith("blob:") &&
            !url.startsWith("data:") &&
            (url.startsWith("http://") || url.startsWith("https://")) &&
            isValidUrl(url)
        );
        if (firstUrl) {
          bannerUrl = firstUrl;
        }
      } else if (
        typeof bannerUrlRaw === "string" &&
        bannerUrlRaw.trim() !== ""
      ) {
        bannerUrl = bannerUrlRaw;
      }

      // Set banner image preview if valid URL
      if (
        bannerUrl &&
        typeof bannerUrl === "string" &&
        isValidUrl(bannerUrl) &&
        !bannerUrl.startsWith("blob:") &&
        !bannerUrl.startsWith("data:")
      ) {
        setEventImagePreview(bannerUrl);
      }

      // Get card color - prioritize customization's card_color
      const customCardColor = existing?.card_color;
      const eventCardColor = event.customization?.card_color;
      const backendCardColor = customCardColor || eventCardColor || "#025a3a";
      const cardColorValue = isValidHex(backendCardColor)
        ? backendCardColor
        : "#025a3a";
      if (cardColorValue !== cardColor) {
        setCardColor(cardColorValue);
      }

      // Get button text from customization
      const customButtonText = existing?.button_text;
      const eventButtonText = event.customization?.button_text;
      const backendButtonText =
        customButtonText || eventButtonText || "Get Ticket";

      // Parse dates from event
      const start = event.start_date ? new Date(event.start_date) : null;
      const end = event.end_date ? new Date(event.end_date) : null;

      // Populate form data with event information
      setFormData((prev) => ({
        ...prev,
        eventName: event.title || prev.eventName,
        eventDescription: event.description || prev.eventDescription,
        eventType: event.event_type || event.type || prev.eventType,
        startDate: start ? start.toISOString().slice(0, 10) : prev.startDate,
        startTime: start ? start.toTimeString().slice(0, 5) : prev.startTime,
        endDate: end ? end.toISOString().slice(0, 10) : prev.endDate,
        endTime: end ? end.toTimeString().slice(0, 5) : prev.endTime,
        locationType:
          event.location === "Virtual"
            ? "virtual"
            : event.location === "Physical"
            ? "venue"
            : prev.locationType,
        address: event.address || prev.address,
        streetAddress:
          event.street_address || event.address || prev.streetAddress,
        landmark: event.landmark || prev.landmark,
        country: event.country || prev.country,
        city: event.city || prev.city,
        state: event.state || prev.state,
        meetingLink:
          event.meeting_link || event.meetingLink || prev.meetingLink,
        additionalDetails: event.additional_details || prev.additionalDetails,
        tags: event.tags || prev.tags,
        // Handle timezone if available
        timezone: event.timezone || prev.timezone,
        // Handle button text from customization
        ticketButtonText:
          backendButtonText || prev.ticketButtonText || "Get Ticket",
        // Handle recurring event fields
        eventTimingType:
          event.event_timing_type ||
          event.eventTimingType ||
          prev.eventTimingType ||
          "single",
        repeatPattern:
          event.repeat_pattern || event.repeatPattern || prev.repeatPattern,
        repeatOnDays:
          event.repeat_on_days || event.repeatOnDays || prev.repeatOnDays || [],
        repeatOnMonthDays:
          event.repeat_on_month_days ||
          event.repeatOnMonthDays ||
          prev.repeatOnMonthDays ||
          [],
        timeMode:
          event.time_mode || event.timeMode || prev.timeMode || "single",
        timeSlots:
          event.time_slots &&
          Array.isArray(event.time_slots) &&
          event.time_slots.length > 0
            ? event.time_slots.map((slot: any) => ({
                id: slot.id || uuidv4(),
                startTime: slot.startTime || slot.start_time || "",
                endTime: slot.endTime || slot.end_time || "",
              }))
            : event.timeSlots || prev.timeSlots || [],
      }));

      // Process social_links from backend (array format)
      if (event.social_links && Array.isArray(event.social_links)) {
        const socialLinksMap: { [key: string]: string } = {};
        event.social_links.forEach((link: any) => {
          if (link.platform && link.url) {
            const platform = link.platform.toLowerCase();
            if (platform.includes("instagram")) {
              socialLinksMap.instagram = link.url;
            } else if (platform.includes("youtube")) {
              socialLinksMap.youtube = link.url;
            } else if (platform.includes("tiktok")) {
              socialLinksMap.tiktok = link.url;
            }
          }
        });
        setFormData((prev) => ({
          ...prev,
          socialLinks: {
            instagram: socialLinksMap.instagram || prev.socialLinks.instagram,
            youtube: socialLinksMap.youtube || prev.socialLinks.youtube,
            tiktok: socialLinksMap.tiktok || prev.socialLinks.tiktok,
          },
        }));
      }

      // Process line_up from backend
      if (event.line_up && Array.isArray(event.line_up)) {
        const mappedLineup = event.line_up.map((item: any) => ({
          id: item.id || uuidv4(),
          name: item.name || "",
          role: item.role || "",
          description: item.description || "",
          image: item.image || item.image_url || "",
        }));
        setLineupItems(mappedLineup);
      }

      // Process itinerary from backend
      if (event.itinerary && Array.isArray(event.itinerary)) {
        const mappedSchedules = event.itinerary.map((item: any) => ({
          id: item.id || uuidv4(),
          name: item.title || item.name || "",
          slots: [
            {
              id: uuidv4(),
              title: item.activity || item.title || "",
              startTime: item.start_time || "",
              endTime: item.end_time || "",
              hostName: item.host || "",
              description: item.description || "",
            },
          ],
        }));
        setSchedules(mappedSchedules);
      }

      // Process and set tickets
      const ticketsData = (ticketsRes as any).data || ticketsRes;
      const ticketsList = Array.isArray(ticketsData) ? ticketsData : [];
      console.log("Fetched tickets:", ticketsList);

      if (ticketsList.length > 0) {
        const mappedTickets = ticketsList.map((ticket: any) => ({
          id: ticket.id || uuidv4(),
          name: ticket.name || "General Ticket",
          price: parseFloat(ticket.category_price || ticket.price || "0"),
          quantity:
            ticket.quantity === null || ticket.quantity === undefined
              ? "Unlimited"
              : typeof ticket.quantity === "string"
              ? ticket.quantity
              : String(ticket.quantity),
          type: ticket.category_name || ticket.type || "Paid",
          startDate: ticket.start_date,
          endDate: ticket.end_date,
          validTill: ticket.valid_till || ticket.end_date, // Backend field
          ticketSold: ticket.ticket_sold || 0, // Backend readOnly field
          status: ticket.status, // Backend enum field
          purchaseLimit: ticket.purchase_limit,
          description: ticket.description,
          perks: ticket.perks,
          enable_dynamic_pricing: ticket.enable_dynamic_pricing,
          min_price: ticket.min_price
            ? parseFloat(ticket.min_price)
            : undefined,
          max_price: ticket.max_price
            ? parseFloat(ticket.max_price)
            : undefined,
        }));
        setTickets(mappedTickets as any);
      }

      // Process and set questions
      const questionsData = (questionsRes as any).data || questionsRes;
      const questionsList = Array.isArray(questionsData) ? questionsData : [];
      console.log("Fetched questions:", questionsList);

      if (questionsList.length > 0) {
        const mappedQuestions = questionsList.map((q: any) => ({
          id: q.id || uuidv4(),
          title: q.title || q.question || "",
          type: q.type || "text",
          required: q.required || false,
          placeholder: q.placeholder || "",
          options: q.options || [],
          order: q.order || 0,
        }));
        setQuestions(mappedQuestions);
      }
    } catch (err: any) {
      console.error("Error fetching event/customization:", err.message, err);
      // Don't set error state here as this is optional functionality
      // The page can still work for creating new events
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch event data when eventId is present
  useEffect(() => {
    if (eventId && isAuthenticated()) {
      fetchEventAndCustomization();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const handleImageUpload = (file: File | null) => {
    if (!file) return;

    // Validate file size (10MB = 10 * 1024 * 1024 bytes)
    if (file.size > 10 * 1024 * 1024) {
      alert("Image size must be less than 10MB");
      return;
    }

    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png)/i)) {
      alert("Only JPEG and PNG images are supported");
      return;
    }

    // Validate image dimensions
    const img = document.createElement("img");
    img.onload = () => {
      if (img.width > 2160 || img.height > 1080) {
        alert("Image dimensions must not exceed 2160 x 1080px");
        URL.revokeObjectURL(img.src);
        return;
      }
      setEventImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageDataUrl = reader.result as string;
        setEventImagePreview(imageDataUrl);
        URL.revokeObjectURL(img.src);
        // Automatically add to additional images if there's space
        if (additionalImages.length < 2) {
          setAdditionalImages((prev) => [...prev, imageDataUrl]);
        }
      };
      reader.readAsDataURL(file);
    };
    img.onerror = () => {
      alert("Invalid image file");
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  };

  const handleAdditionalImageUpload = (file: File | null, index?: number) => {
    if (!file) return;

    // Validate file size (10MB = 10 * 1024 * 1024 bytes)
    if (file.size > 10 * 1024 * 1024) {
      alert("Image size must be less than 10MB");
      return;
    }

    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png)/i)) {
      alert("Only JPEG and PNG images are supported");
      return;
    }

    // Validate image dimensions
    const img = document.createElement("img");
    img.onload = () => {
      if (img.width > 2160 || img.height > 1080) {
        alert("Image dimensions must not exceed 2160 x 1080px");
        URL.revokeObjectURL(img.src);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageDataUrl = reader.result as string;
        URL.revokeObjectURL(img.src);
        if (index !== undefined) {
          // Replace image at specific index
          setAdditionalImages((prev) => {
            const newImages = [...prev];
            newImages[index] = imageDataUrl;
            return newImages;
          });
        } else {
          // Add new image
          setAdditionalImages((prev) => [...prev, imageDataUrl]);
        }
      };
      reader.readAsDataURL(file);
    };
    img.onerror = () => {
      alert("Invalid image file");
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Trigger AI Smart Assist when key fields are filled
    const triggerFields = ['eventName', 'eventType', 'address', 'streetAddress', 'eventDescription'];
    if (triggerFields.includes(field) && value && String(value).trim().length >= 3) {
      debouncedSmartAssist(field, value);
    }
  };

  // AbortController for cancelling in-flight requests
  const smartAssistAbortRef = useRef<AbortController | null>(null);
  // Context hash to skip redundant fetches
  const lastContextHashRef = useRef<string>('');

  // Debounced Smart Assist — 600ms for snappy response
  const debouncedSmartAssist = useCallback((changedField: string, changedValue: string) => {
    if (smartAssistTimerRef.current) {
      clearTimeout(smartAssistTimerRef.current);
    }
    smartAssistTimerRef.current = setTimeout(() => {
      fetchSmartSuggestions(changedField, changedValue);
    }, 600);
  }, []);

  const fetchSmartSuggestions = async (changedField: string, changedValue: string) => {
    try {
      // Build context from current form data + the just-changed field
      const currentContext: Record<string, string> = {};
      const contextFields = ['eventName', 'eventDescription', 'eventType', 'address', 'streetAddress', 'city', 'state', 'country', 'locationType', 'startDate', 'endDate'];
      contextFields.forEach(f => {
        const val = (formData as any)[f];
        if (val && String(val).trim()) currentContext[f] = String(val);
      });
      currentContext[changedField] = changedValue;

      // Context hash check — skip if nothing meaningful changed
      const contextHash = JSON.stringify(currentContext);
      if (contextHash === lastContextHashRef.current) return;
      lastContextHashRef.current = contextHash;

      // Determine which fields need suggestions (truly empty ones)
      const suggestableFields = [
        { key: 'description', formKey: 'eventDescription' },
        { key: 'tags', formKey: 'tags' },
        { key: 'eventType', formKey: 'eventType' },
        { key: 'country', formKey: 'country' },
        { key: 'state', formKey: 'state' },
        { key: 'city', formKey: 'city' },
        { key: 'landmark', formKey: 'landmark' },
        { key: 'additional_details', formKey: 'additionalDetails' },
        { key: 'questions', formKey: null },
      ];

      const requestFields: string[] = [];
      suggestableFields.forEach(({ key, formKey }) => {
        if (dismissedSuggestions.has(key)) return;
        if (key === 'questions') {
          requestFields.push(key);
          return;
        }
        const currentVal = formKey ? (formData as any)[formKey] : null;
        // Only suggest for empty fields or default/placeholder tags
        const isEmpty = !currentVal || 
          (typeof currentVal === 'string' && currentVal.trim().length < 2) ||
          (Array.isArray(currentVal) && (currentVal.length === 0 || (key === 'tags' && JSON.stringify(currentVal) === JSON.stringify(["Live music", "Conference", "Dance party", "Cultural festival"]))));
        if (isEmpty) requestFields.push(key);
      });

      if (requestFields.length === 0) return;

      // Cancel any previous in-flight request
      if (smartAssistAbortRef.current) {
        smartAssistAbortRef.current.abort();
      }
      smartAssistAbortRef.current = new AbortController();

      setSmartAssistLoading(true);

      const response: any = await authenticatedRequest(
        `${API_BASE_URL}/ai/smart-assist/`,
        'POST',
        { context: currentContext, request_fields: requestFields, changed_field: changedField }
      );

      const rawResp = response?.data || response;
      if (rawResp?.suggestions) {
        const suggestions = { ...rawResp.suggestions };

        // Extract question suggestions separately
        if (suggestions.questions && Array.isArray(suggestions.questions)) {
          const mappedQuestions = suggestions.questions.map((q: any) => ({
            id: uuidv4(),
            type: q.type || 'text',
            title: q.title || '',
            required: q.required || false,
            placeholder: q.placeholder || '',
            options: q.options || [],
          }));
          setAiQuestionSuggestions(mappedQuestions);
          delete suggestions.questions;
        }

        // Merge new suggestions (don't overwrite existing accepted ones)
        setAiSuggestions((prev) => ({ ...prev, ...suggestions }));
      }
    } catch (err: any) {
      // Don't log aborted requests as errors
      if (err?.name !== 'AbortError') {
        console.error('Smart Assist error:', err);
      }
    } finally {
      setSmartAssistLoading(false);
    }
  };

  const acceptSuggestion = (fieldKey: string) => {
    const value = aiSuggestions[fieldKey];
    if (value === undefined) return;

    // Map AI field keys to form field keys
    const fieldMap: Record<string, string> = {
      description: 'eventDescription',
      tags: 'tags',
      eventType: 'eventType',
      country: 'country',
      state: 'state',
      city: 'city',
      landmark: 'landmark',
      additional_details: 'additionalDetails',
    };
    const formKey = fieldMap[fieldKey] || fieldKey;
    setFormData((prev) => ({ ...prev, [formKey]: value }));
    setAiSuggestions((prev) => {
      const next = { ...prev };
      delete next[fieldKey];
      return next;
    });
  };

  const dismissSuggestion = (fieldKey: string) => {
    setAiSuggestions((prev) => {
      const next = { ...prev };
      delete next[fieldKey];
      return next;
    });
    setDismissedSuggestions((prev) => new Set(prev).add(fieldKey));
  };

  // AI-powered event generation handler
  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) {
      setAiError("Please describe your event first.");
      return;
    }
    setAiLoading(true);
    setAiError(null);
    try {
      const response = await authenticatedRequest<any>(
        `${API_BASE_URL}/ai/create-event/`,
        "POST",
        { prompt: aiPrompt.trim() }
      );

      // The backend returns { success, message, event: {...}, ticket_suggestions: [...] }
      const rawResponse: any = response?.data || response;
      const eventData = rawResponse?.event || rawResponse;
      const ticketSuggestions = rawResponse?.ticket_suggestions || [];

      // Map AI response to formData
      setFormData((prev) => ({
        ...prev,
        eventName: eventData.title || prev.eventName,
        eventDescription: eventData.description || prev.eventDescription,
        eventType: eventData.event_type || prev.eventType,
        startDate: eventData.start_date
          ? new Date(eventData.start_date).toISOString().slice(0, 10)
          : prev.startDate,
        startTime: eventData.start_date
          ? new Date(eventData.start_date).toTimeString().slice(0, 5)
          : prev.startTime,
        endDate: eventData.end_date
          ? new Date(eventData.end_date).toISOString().slice(0, 10)
          : prev.endDate,
        endTime: eventData.end_date
          ? new Date(eventData.end_date).toTimeString().slice(0, 5)
          : prev.endTime,
        locationType:
          eventData.location === "Virtual"
            ? "virtual"
            : eventData.location === "Physical"
            ? "venue"
            : prev.locationType,
        address: eventData.address || prev.address,
        streetAddress: eventData.street_address || eventData.address || prev.streetAddress,
        city: eventData.city || prev.city,
        state: eventData.state || prev.state,
        country: eventData.country || prev.country,
        landmark: eventData.landmark || prev.landmark,
        meetingLink: eventData.meeting_link || prev.meetingLink,
        tags: eventData.tags && eventData.tags.length > 0 ? eventData.tags : prev.tags,
        additionalDetails: eventData.additional_details || prev.additionalDetails,
      }));

      // Map lineup
      if (eventData.line_up && Array.isArray(eventData.line_up) && eventData.line_up.length > 0) {
        const mappedLineup = eventData.line_up.map((item: any) => ({
          id: item.id || uuidv4(),
          name: item.name || "",
          role: item.role || "",
          description: item.description || "",
          image: item.image || item.image_url || "",
        }));
        setLineupItems(mappedLineup);
      }

      // Map itinerary / schedules
      if (eventData.itinerary && Array.isArray(eventData.itinerary) && eventData.itinerary.length > 0) {
        const mappedSchedules = eventData.itinerary.map((item: any) => ({
          id: item.id || uuidv4(),
          name: item.title || item.name || "",
          slots: [
            {
              id: uuidv4(),
              title: item.activity || item.title || "",
              startTime: item.start_time || "",
              endTime: item.end_time || "",
              hostName: item.host || "",
              description: item.description || "",
            },
          ],
        }));
        setSchedules(mappedSchedules);
      }

      // Auto-add sections so lineup/itinerary are visible in the form
      const sectionsToAdd: string[] = [];
      if (eventData.line_up && eventData.line_up.length > 0) sectionsToAdd.push("lineup");
      if (eventData.itinerary && eventData.itinerary.length > 0) sectionsToAdd.push("itinerary");
      if (sectionsToAdd.length > 0) {
        setFormData((prev) => ({
          ...prev,
          sections: [...new Set([...prev.sections, ...sectionsToAdd])],
        }));
      }

      // Directly add AI-generated tickets to the form
      if (ticketSuggestions && Array.isArray(ticketSuggestions) && ticketSuggestions.length > 0) {
        const newTickets = ticketSuggestions.map((ticket: any) => ({
          id: uuidv4(),
          name: ticket.name || "General Ticket",
          price: parseFloat(ticket.category_price || ticket.price || "0"),
          quantity:
            ticket.quantity === null || ticket.quantity === undefined
              ? null
              : Number(ticket.quantity),
          type: (ticket.type?.toLowerCase() === 'free' || parseFloat(ticket.price || "0") === 0) ? 'Free' : 'Paid',
          description: ticket.description || "",
          perks: ticket.perks || [],
        }));
        setTickets((prev) => [...prev, ...newTickets as any]);
      }

      // Directly add AI-generated questions to the form
      const questionSuggestions = rawResponse?.question_suggestions || rawResponse?.questions || rawResponse?.registration_questions || [];
      console.log('[AI Create] Raw response keys:', Object.keys(rawResponse));
      console.log('[AI Create] Question suggestions:', questionSuggestions);
      if (questionSuggestions && Array.isArray(questionSuggestions) && questionSuggestions.length > 0) {
        const newQuestions: Question[] = questionSuggestions.map((q: any) => ({
          id: uuidv4(),
          type: q.type || 'text',
          title: q.title || '',
          required: q.required || false,
          placeholder: q.placeholder || '',
          options: q.options?.map((text: string) => ({ id: uuidv4(), text })) || [],
        }));
        setQuestions((prev) => [...prev, ...newQuestions]);
      }

      setAiGenerated(true);
      setShowAiSection(false);

      // Capture the AI-created event ID so the form uses the update (PATCH) flow
      // instead of creating a duplicate event when the user clicks "Publish"
      const aiCreatedEventId = eventData.id || rawResponse?.event_id;
      if (aiCreatedEventId) {
        // Update the URL with the event ID so handleSubmit uses updateEvent (PATCH)
        // instead of createEvent (POST). Use current pathname to support
        // the component being mounted on different routes (e.g. /dashboard).
        const currentPath = window.location.pathname;
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('eventId', aiCreatedEventId);
        router.replace(`${currentPath}?${newUrl.searchParams.toString()}`, {
          scroll: false,
        });
      }

      // Auto-navigate to step 2 so user sees the tickets and questions
      setTimeout(() => setCurrentStep(2), 500);
    } catch (err: any) {
      console.error("AI event generation failed:", err);
      setAiError(
        err.message || "AI generation failed. Please try again or fill the form manually."
      );
    } finally {
      setAiLoading(false);
    }
  };

  // API Functions
  const createEvent = async (data: any) => {
    const res = await authenticatedRequest<{
      data: { id: string };
    }>(`${API_BASE_URL}/events/`, "POST", data);
    if (!res || !res.data || !res.data.id)
      throw new Error("Event creation failed or ID not returned by API.");
    return res.data;
  };

  const createEventCustomization = async (data: {
    event: string;
    banner_url: string | string[]; // Accept either string or array
    font: string;
    card_color: string;
    button_text?: string;
    is_active: boolean;
  }) => {
    try {
      // Prepare payload - only include fields that are accepted by the API
      const payload: any = {
        event: data.event,
        font: data.font,
        card_color: data.card_color,
        is_active: data.is_active,
      };

      // Backend expects banner_url as an array of URL strings, not objects
      // Handle both string and array inputs, and extract URLs from objects
      if (Array.isArray(data.banner_url)) {
        console.log("Processing banner_url array:", data.banner_url);
        // Already an array - extract URL strings from objects if needed
        const extractedUrls = data.banner_url
          .map((item: any) => {
            // If it's already a string, use it
            if (typeof item === "string") {
              return item;
            }
            // If it's an object, extract the URL
            if (typeof item === "object" && item !== null) {
              const obj = item as any;
              const url =
                obj.secure_url ||
                obj.url ||
                obj.src ||
                obj.public_id ||
                obj.data?.url ||
                "";
              console.log("Extracted URL from object:", url, "Object:", obj);
              return url;
            }
            return "";
          })
          .filter(
            (url: string) =>
              url &&
              typeof url === "string" &&
              url.trim() !== "" &&
              !url.startsWith("blob:") &&
              !url.startsWith("data:") && // Filter out data URLs
              (url.startsWith("http://") || url.startsWith("https://")) && // Only HTTP/HTTPS URLs
              isValidUrl(url)
          );
        console.log("Final extracted URLs:", extractedUrls);
        payload.banner_url = extractedUrls;
      } else if (
        data.banner_url &&
        typeof data.banner_url === "string" &&
        data.banner_url.trim() !== "" &&
        !data.banner_url.startsWith("blob:")
      ) {
        // Single string - convert to array
        if (isValidUrl(data.banner_url)) {
          payload.banner_url = [data.banner_url];
        } else {
          payload.banner_url = [];
        }
      } else if (
        data.banner_url &&
        typeof data.banner_url === "object" &&
        data.banner_url !== null
      ) {
        // Single object - extract URL and convert to array
        const obj = data.banner_url as any;
        const url = obj.secure_url || obj.url || obj.src || obj.public_id || "";
        if (url && isValidUrl(url)) {
          payload.banner_url = [url];
        } else {
          payload.banner_url = [];
        }
      } else {
        // Empty or invalid - send empty array
        payload.banner_url = [];
      }

      // Only include button_text if provided (some backends might not accept it in POST)
      if (data.button_text && data.button_text.trim() !== "") {
        payload.button_text = data.button_text;
      }

      // Final validation: ensure banner_url is an array of strings only
      if (Array.isArray(payload.banner_url)) {
        console.log(
          "Before extraction - banner_url items:",
          payload.banner_url
        );
        payload.banner_url = payload.banner_url
          .map((item: any, index: number) => {
            console.log(
              `Processing item ${index}:`,
              item,
              "Type:",
              typeof item
            );
            if (typeof item === "string") {
              console.log(`Item ${index} is already a string:`, item);
              return item;
            }
            if (typeof item === "object" && item !== null) {
              const obj = item as any;
              // Try multiple possible URL properties
              const url =
                obj.secure_url ||
                obj.url ||
                obj.src ||
                obj.public_id ||
                obj.data?.url ||
                obj.data?.secure_url ||
                (typeof obj.toString === "function" &&
                obj.toString() !== "[object Object]"
                  ? obj.toString()
                  : "") ||
                "";
              console.log(
                `Extracted URL from item ${index}:`,
                url,
                "Full object:",
                JSON.stringify(obj)
              );
              return url;
            }
            console.log(`Item ${index} is invalid, returning empty string`);
            return "";
          })
          .filter((url: string) => {
            const isValid =
              typeof url === "string" && url.trim() !== "" && isValidUrl(url);
            if (!isValid && url) {
              console.log("Filtered out invalid URL:", url);
            }
            return isValid;
          });
        console.log("After extraction - banner_url items:", payload.banner_url);
      }

      console.log("Creating event customization with payload:", payload);
      console.log(
        "banner_url type check:",
        Array.isArray(payload.banner_url),
        "Items:",
        payload.banner_url.map((item: any) => typeof item)
      );
      console.log("banner_url JSON:", JSON.stringify(payload.banner_url));
      await authenticatedRequest(
        `${API_BASE_URL}/event-customizations/`,
        "POST",
        payload
      );
    } catch (error: any) {
      console.error("Error saving event customization:", error);
      // Log the full error response for debugging
      if (error.data) {
        console.error("API Error Response:", error.data);
        // Format Django error messages if available
        if (error.data.detail) {
          throw new Error(error.data.detail);
        }
        if (typeof error.data === "object") {
          const errorMessages = Object.entries(error.data)
            .map(([field, errors]: [string, any]) => {
              const errorList = Array.isArray(errors)
                ? errors.join(", ")
                : String(errors);
              const formattedField =
                field.charAt(0).toUpperCase() + field.slice(1);
              return `${formattedField}: ${errorList}`;
            })
            .join("\n");
          if (errorMessages) {
            throw new Error(errorMessages);
          }
        }
      }
      throw new Error(error.message || "Failed to save event customization.");
    }
  };

  const createTicketType = async (data: {
    event: string;
    category_name: "Paid" | "Free" | "Invite";
    category_price: number;
    name: string;
    quantity?: number | string | null;
    valid_till?: string | null;
    enable_dynamic_pricing?: boolean;
    min_price?: number | null;
    max_price?: number | null;
  }) => {
    const payload: any = {
      event: data.event,
      category_name: data.category_name,
      category_price: data.category_price.toFixed(2), // Send as decimal string
      name: data.name,
      quantity:
        data.quantity === "Unlimited" || data.quantity === null
          ? null
          : String(data.quantity), // Send as string (max 50 chars)
    };

    // Add valid_till if provided
    if (data.valid_till) {
      payload.valid_till = data.valid_till;
    }

    // Add dynamic pricing fields if enabled
    if (data.enable_dynamic_pricing) {
      payload.enable_dynamic_pricing = true;
      if (data.min_price !== null && data.min_price !== undefined) {
        payload.min_price = data.min_price.toFixed(2); // Send as decimal string
      }
      if (data.max_price !== null && data.max_price !== undefined) {
        payload.max_price = data.max_price.toFixed(2); // Send as decimal string
      }
    }

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

  // Helper function to convert data URL to File object
  const dataURLtoFile = (dataURL: string, filename: string): File => {
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Helper function to upload a data URL and return the HTTP/HTTPS URL
  const uploadDataURL = async (
    dataURL: string,
    filename: string = "image.png"
  ): Promise<string> => {
    const file = dataURLtoFile(dataURL, filename);
    return await uploadImage(file);
  };

  // Ticket Management
  const addTicket = (
    ticketDataFromModal: Omit<Ticket, "id"> & {
      type?: "Paid" | "Free" | "Donations" | "Invite";
      startDate?: string;
      endDate?: string;
      purchaseLimit?: number;
      description?: string;
      perks?: string[];
    }
  ) => {
    const price = parseFloat(ticketDataFromModal.price.toString());
    const modalTypeValue = ticketDataFromModal.type;
    const typeStr = String(modalTypeValue || "");

    // Validation - check for valid price based on ticket type
    if (typeStr === "Paid" && (isNaN(price) || price <= 0)) {
      alert("Please enter a valid ticket price for paid tickets.");
      return;
    }
    if (typeStr === "Donations" && (isNaN(price) || price <= 0)) {
      alert("Please enter a valid donation amount.");
      return;
    }
    if (typeStr === "Free" && price !== 0) {
      alert("Free tickets must have a price of 0.");
      return;
    }
    if (!ticketDataFromModal.name || !ticketDataFromModal.name.trim()) {
      alert("Ticket name is required.");
      return;
    }
    // Map "Donations" to "Invite" for backward compatibility with Ticket type
    let ticketType: "Paid" | "Free" | "Invite" = "Paid";
    if (typeStr === "Donations" || typeStr === "By Invite") {
      ticketType = "Invite";
    } else if (typeStr === "Free") {
      ticketType = "Free";
    } else if (typeStr === "Paid") {
      ticketType = "Paid";
    }
    const newTicket: Ticket & {
      startDate?: string;
      endDate?: string;
      purchaseLimit?: number;
      description?: string;
      perks?: string[];
      type?: "Paid" | "Free" | "Invite" | "Donations";
    } = {
      ...ticketDataFromModal,
      id: uuidv4(),
      price: price,
      quantity: ticketDataFromModal.quantity,
      type: ticketType,
      // Preserve original type for display (Donations vs Invite)
      ...(typeStr === "Donations" && { type: "Donations" as any }),
      startDate: ticketDataFromModal.startDate,
      endDate: ticketDataFromModal.endDate,
      purchaseLimit: ticketDataFromModal.purchaseLimit,
      description: ticketDataFromModal.description,
      perks: ticketDataFromModal.perks,
    };
    // Add ticket to state
    setTickets((prev) => [...prev, newTicket as any]);

    // Close modal and navigate to Tickets step (step 2) to show the table
    setIsModalOpen(false);
    setCurrentStep(2);

    // Save draft will be triggered by useEffect when tickets state updates
  };

  const removeTicket = (ticketId: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== ticketId));
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = (question: Question) => {
    if (editingQuestion) {
      // Update existing question
      setQuestions(questions.map((q) => (q.id === question.id ? question : q)));
    } else {
      // Add new question
      setQuestions([...questions, question]);
    }
    setIsQuestionModalOpen(false);
    setEditingQuestion(null);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setIsQuestionModalOpen(true);
  };

  const handleRemoveQuestion = (questionId: string) => {
    setQuestions(questions.filter((q) => q.id !== questionId));
  };

  // Update event function
  const updateEvent = async (eventId: string, data: any) => {
    const res = await authenticatedRequest(
      `${API_BASE_URL}/events/${eventId}/`,
      "PATCH",
      data
    );
    return res;
  };

  // Update event customization function
  const updateEventCustomization = async (
    customizationId: string,
    data: {
      event: string;
      banner_url: string | string[]; // Accept either string or array
      font: string;
      card_color: string;
      button_text?: string;
      is_active: boolean;
    }
  ) => {
    try {
      // Prepare payload - backend expects banner_url as an array
      const payload: any = {
        event: data.event,
        font: data.font,
        card_color: data.card_color,
        is_active: data.is_active,
      };

      // Backend expects banner_url as an array, not a string
      // Handle both string and array inputs
      if (Array.isArray(data.banner_url)) {
        // Already an array - filter out empty strings and blob URLs
        payload.banner_url = data.banner_url.filter(
          (url) =>
            url &&
            url.trim() !== "" &&
            !url.startsWith("blob:") &&
            isValidUrl(url)
        );
      } else if (
        data.banner_url &&
        data.banner_url.trim() !== "" &&
        !data.banner_url.startsWith("blob:")
      ) {
        // Single string - convert to array
        if (isValidUrl(data.banner_url)) {
          payload.banner_url = [data.banner_url];
        } else {
          payload.banner_url = [];
        }
      } else {
        // Empty or invalid - send empty array
        payload.banner_url = [];
      }

      // Only include button_text if provided
      if (data.button_text && data.button_text.trim() !== "") {
        payload.button_text = data.button_text;
      }

      console.log("Updating event customization with payload:", payload);
      await authenticatedRequest(
        `${API_BASE_URL}/event-customizations/${customizationId}/`,
        "PATCH",
        payload
      );
    } catch (error: any) {
      console.error("Error updating event customization:", error);
      // Log the full error response for debugging
      if (error.data) {
        console.error("API Error Response:", error.data);
        // Format Django error messages if available
        if (error.data.detail) {
          throw new Error(error.data.detail);
        }
        if (typeof error.data === "object") {
          const errorMessages = Object.entries(error.data)
            .map(([field, errors]: [string, any]) => {
              const errorList = Array.isArray(errors)
                ? errors.join(", ")
                : String(errors);
              const formattedField =
                field.charAt(0).toUpperCase() + field.slice(1);
              return `${formattedField}: ${errorList}`;
            })
            .join("\n");
          if (errorMessages) {
            throw new Error(errorMessages);
          }
        }
      }
      throw new Error(error.message || "Failed to update event customization.");
    }
  };

  // Form Submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation(); // Prevent event bubbling
    }

    // Don't proceed if modal is open
    if (isModalOpen) {
      return;
    }

    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    // Final submission
    try {
      setIsSubmitting(true);

      // Validation
      if (!formData.eventName) {
        throw new Error("Event name is required.");
      }
      if (tickets.length === 0) {
        throw new Error("At least one ticket type is required.");
      }
      if (!formData.startDate || !formData.startTime) {
        throw new Error("Start date and time are required.");
      }
      if (!formData.endDate || !formData.endTime) {
        throw new Error("End date and time are required.");
      }
      if (!formData.timezone) {
        throw new Error("Timezone is required.");
      }
      // Validate recurring event fields
      if (formData.eventTimingType === "recurring") {
        if (!formData.repeatPattern) {
          throw new Error("Repeat pattern is required for recurring events.");
        }
        if (
          formData.repeatPattern === "weekly" &&
          formData.repeatOnDays.length === 0
        ) {
          throw new Error(
            "Please select at least one day for weekly recurring events."
          );
        }
        if (
          formData.repeatPattern === "monthly" &&
          formData.repeatOnMonthDays.length === 0
        ) {
          throw new Error(
            "Please select at least one day for monthly recurring events."
          );
        }
        if (
          formData.timeMode === "multiple" &&
          (!formData.timeSlots || formData.timeSlots.length === 0)
        ) {
          throw new Error(
            "Please add at least one time slot for multiple time mode."
          );
        }
        if (
          formData.timeMode === "single" &&
          (!formData.timeSlots ||
            formData.timeSlots.length === 0 ||
            !formData.timeSlots[0].startTime ||
            !formData.timeSlots[0].endTime)
        ) {
          throw new Error(
            "Please set start and end time for single time mode."
          );
        }
      }

      // Handle image upload - collect all banner URLs into an array (supports multiple banners)
      let bannerUrls: string[] = [];

      // Upload main event image if present (File object)
      if (eventImage) {
        const uploadedResult = await uploadImage(eventImage);
        // uploadImage returns a string URL, but check if it's an object
        let uploadedUrl: string = "";
        if (typeof uploadedResult === "string") {
          uploadedUrl = uploadedResult;
        } else if (uploadedResult && typeof uploadedResult === "object") {
          const obj = uploadedResult as any;
          uploadedUrl = obj.secure_url || obj.url || obj.src || "";
        }
        if (uploadedUrl && isValidUrl(uploadedUrl)) {
          bannerUrls.push(uploadedUrl);
        }
      } else if (
        eventImagePreview &&
        typeof eventImagePreview === "string" &&
        eventImagePreview.startsWith("data:")
      ) {
        // If eventImagePreview is a data URL, upload it
        try {
          console.log("Uploading eventImagePreview data URL...");
          const uploadedUrl = await uploadDataURL(
            eventImagePreview,
            "event-banner.png"
          );
          if (uploadedUrl && isValidUrl(uploadedUrl)) {
            bannerUrls.push(uploadedUrl);
          }
        } catch (error) {
          console.error("Error uploading eventImagePreview:", error);
        }
      } else if (
        eventImagePreview &&
        typeof eventImagePreview === "string" &&
        (eventImagePreview.startsWith("http://") ||
          eventImagePreview.startsWith("https://"))
      ) {
        // If eventImagePreview is already a valid HTTP/HTTPS URL, use it
        if (
          !eventImagePreview.startsWith("blob:") &&
          !eventImagePreview.startsWith("data:") &&
          isValidUrl(eventImagePreview)
        ) {
          bannerUrls.push(eventImagePreview);
        }
      }

      // Upload additional images that are data URLs
      if (additionalImages && Array.isArray(additionalImages)) {
        for (const img of additionalImages) {
          if (!img) continue;

          // If it's already a valid HTTP/HTTPS URL, use it directly
          if (
            typeof img === "string" &&
            (img.startsWith("http://") || img.startsWith("https://")) &&
            !img.startsWith("blob:") &&
            !img.startsWith("data:") &&
            isValidUrl(img)
          ) {
            bannerUrls.push(img);
          }
          // If it's a data URL, upload it
          else if (typeof img === "string" && img.startsWith("data:")) {
            try {
              console.log("Uploading additional image data URL...");
              const uploadedUrl = await uploadDataURL(
                img,
                `additional-image-${bannerUrls.length}.png`
              );
              if (uploadedUrl && isValidUrl(uploadedUrl)) {
                bannerUrls.push(uploadedUrl);
              }
            } catch (error) {
              console.error("Error uploading additional image:", error);
            }
          }
          // If it's an object, extract URL
          else if (typeof img === "object" && img !== null) {
            const imgObj = img as any;
            const url =
              imgObj.secure_url ||
              imgObj.url ||
              imgObj.src ||
              imgObj.public_id ||
              "";
            if (
              url &&
              typeof url === "string" &&
              url.trim() !== "" &&
              !url.startsWith("blob:") &&
              !url.startsWith("data:") &&
              (url.startsWith("http://") || url.startsWith("https://")) &&
              isValidUrl(url)
            ) {
              bannerUrls.push(url);
            }
          }
        }
      }

      // Remove duplicates and ensure all are valid URL strings
      // Final pass: ensure every item is a string, not an object
      bannerUrls = Array.from(
        new Set(
          bannerUrls
            .map((url: any) => {
              if (typeof url === "string") {
                return url;
              }
              if (typeof url === "object" && url !== null) {
                const obj = url as any;
                return (
                  obj.secure_url ||
                  obj.url ||
                  obj.src ||
                  obj.public_id ||
                  obj.data?.url ||
                  ""
                );
              }
              return "";
            })
            .filter(
              (url: string) =>
                url &&
                typeof url === "string" &&
                url.trim() !== "" &&
                !url.startsWith("blob:") &&
                !url.startsWith("data:") && // Filter out data URLs (base64)
                (url.startsWith("http://") || url.startsWith("https://")) && // Only HTTP/HTTPS URLs
                isValidUrl(url)
            )
        )
      );

      console.log("Final bannerUrls array before sending:", bannerUrls);

      // For backward compatibility, also keep finalBannerUrl as the first valid URL or empty string
      const finalBannerUrl = bannerUrls.length > 0 ? bannerUrls[0] : "";

      if (!isValidHex(cardColor)) {
        throw new Error(
          "Invalid card color format. Please use a 6-digit hex code (e.g. #RRGGBB)."
        );
      }

      // Prepare event data according to Swagger API spec
      const location =
        formData.locationType === "virtual"
          ? "Virtual"
          : formData.locationType === "venue"
          ? "Physical"
          : "Physical";

      // Format social_links as array of objects with platform and url
      const socialLinksArray: Array<{ platform: string; url: string }> = [];
      if (formData.socialLinks.instagram) {
        socialLinksArray.push({
          platform: "Instagram",
          url: formData.socialLinks.instagram,
        });
      }
      if (formData.socialLinks.youtube) {
        socialLinksArray.push({
          platform: "YouTube",
          url: formData.socialLinks.youtube,
        });
      }
      if (formData.socialLinks.tiktok) {
        socialLinksArray.push({
          platform: "TikTok",
          url: formData.socialLinks.tiktok,
        });
      }

      // Format line_up as array of objects with name, role, description
      const lineUpArray = lineupItems.map((item) => ({
        name: item.name,
        role: item.role,
        description: item.description,
        ...(item.image && { image: item.image }),
      }));

      // Format itinerary as array of objects with title, activity, start_time, end_time, host, description
      const itineraryArray = schedules.flatMap((schedule) =>
        schedule.slots.map((slot) => ({
          title: schedule.name || slot.title,
          activity: slot.title,
          start_time: slot.startTime,
          end_time: slot.endTime,
          host: slot.hostName || "",
          description: slot.description || "",
        }))
      );

      const eventApiPayload: any = {
        title: formData.eventName,
        description: formData.eventDescription,
        location: location,
        start_date: `${formData.startDate}T${formData.startTime}:00Z`,
        end_date: `${formData.endDate}T${formData.endTime}:00Z`,
        price: "0.00",
        is_active: true,
        address:
          formData.locationType === "venue"
            ? formData.streetAddress || formData.address
            : "",
        ...(formData.landmark && { landmark: formData.landmark }),
        ...(formData.eventType && { event_type: formData.eventType }),
        ...(formData.meetingLink && { meeting_link: formData.meetingLink }),
        ...(formData.tags &&
          formData.tags.length > 0 && { tags: formData.tags }),
        ...(socialLinksArray.length > 0 && { social_links: socialLinksArray }),
        ...(lineUpArray.length > 0 && { line_up: lineUpArray }),
        ...(itineraryArray.length > 0 && { itinerary: itineraryArray }),
        // Additional fields that may be supported
        ...(formData.timezone && { timezone: formData.timezone }),
        ...(formData.city && { city: formData.city }),
        ...(formData.state && { state: formData.state }),
        ...(formData.country && { country: formData.country }),
        ...(formData.additionalDetails && {
          additional_details: formData.additionalDetails,
        }),
        ...(selectedVendorIds.length > 0 && { preferred_vendors: selectedVendorIds }),
      };

      // Add event timing type (always send, default to "single")
      eventApiPayload.event_timing_type = formData.eventTimingType || "single";

      // Add recurring event data if applicable
      if (formData.eventTimingType === "recurring") {
        if (formData.repeatPattern) {
          eventApiPayload.repeat_pattern = formData.repeatPattern;
        }
        if (
          formData.repeatPattern === "weekly" &&
          formData.repeatOnDays.length > 0
        ) {
          eventApiPayload.repeat_on_days = formData.repeatOnDays;
        } else if (
          formData.repeatPattern === "monthly" &&
          formData.repeatOnMonthDays.length > 0
        ) {
          eventApiPayload.repeat_on_month_days = formData.repeatOnMonthDays;
        }
        if (formData.timeMode) {
          eventApiPayload.time_mode = formData.timeMode;
        }
        if (formData.timeSlots && formData.timeSlots.length > 0) {
          // Format time slots to match backend format: [{'id': 'string', 'startTime': 'HH:MM', 'endTime': 'HH:MM'}]
          eventApiPayload.time_slots = formData.timeSlots.map((slot) => ({
            id: slot.id || uuidv4(),
            startTime: slot.startTime,
            endTime: slot.endTime,
          }));
        }
      }

      let finalEventId = eventId;

      // Update existing event or create new one
      if (eventId) {
        // Update existing event
        await updateEvent(eventId, eventApiPayload);

        // Update customization
        try {
          const cuRes = await authenticatedRequest(
            `${API_BASE_URL}/event-customizations/?event=${eventId}`,
            "GET"
          );
          const list = Array.isArray((cuRes as any).data)
            ? (cuRes as any).data
            : Array.isArray(cuRes)
            ? cuRes
            : [];
          const existing = list.length > 0 ? list[0] : null;

          if (existing?.id) {
            // Pass bannerUrls array directly (updateEventCustomization will handle it)
            await updateEventCustomization(existing.id, {
              event: eventId,
              banner_url: bannerUrls, // Pass array of banner URLs
              font: "Arial",
              card_color: cardColor,
              button_text:
                formData.ticketButtonText &&
                formData.ticketButtonText !== "Get Ticket"
                  ? formData.ticketButtonText
                  : undefined,
              is_active: true,
            });
          } else {
            // Pass bannerUrls array directly (createEventCustomization will handle it)
            await createEventCustomization({
              event: eventId,
              banner_url: bannerUrls, // Pass array of banner URLs
              font: "Arial",
              card_color: cardColor,
              button_text:
                formData.ticketButtonText &&
                formData.ticketButtonText !== "Get Ticket"
                  ? formData.ticketButtonText
                  : undefined,
              is_active: true,
            });
          }
        } catch (error) {
          console.error("Error updating customization:", error);
        }

        alert("Event updated successfully!");
      } else {
        // Create new event
        const createdEvent = await createEvent(eventApiPayload);
        finalEventId = createdEvent.id;

        // Create customization - pass bannerUrls array directly
        await createEventCustomization({
          event: finalEventId,
          banner_url: bannerUrls, // Pass array of banner URLs
          font: "Arial",
          card_color: cardColor,
          button_text:
            formData.ticketButtonText &&
            formData.ticketButtonText !== "Get Ticket"
              ? formData.ticketButtonText
              : undefined,
          is_active: true,
        });

        // Create tickets
        for (const t of tickets) {
          // Format valid_till from endDate if available
          let validTill: string | null = null;
          if (t.endDate) {
            // If endDate is just a date, combine with endTime or use end of day
            if (t.endDate.includes("T")) {
              validTill = t.endDate;
            } else {
              // Format as ISO datetime (end of day if no time specified)
              validTill = `${t.endDate}T23:59:59Z`;
            }
          } else if (t.validTill) {
            validTill = t.validTill;
          }

          await createTicketType({
            event: finalEventId,
            category_name: t.type,
            category_price: t.type === "Free" ? 0 : Number(t.price),
            name: t.name || "General Ticket",
            quantity: t.quantity,
            valid_till: validTill,
            enable_dynamic_pricing: t.enable_dynamic_pricing,
            min_price: t.min_price,
            max_price: t.max_price,
          });
        }

        alert("Event created successfully!");
      }

      // Create countdown for the event after publishing
      if (finalEventId && formData.startDate && formData.startTime) {
        try {
          const countdownTarget = new Date(
            `${formData.startDate}T${formData.startTime}:00Z`
          );
          if (
            !isNaN(countdownTarget.getTime()) &&
            countdownTarget > new Date()
          ) {
            await authenticatedRequest(
              `${API_BASE_URL}/event-countdowns/`,
              "POST",
              {
                event: finalEventId,
                target_date: countdownTarget.toISOString(),
                is_active: true,
              }
            );
            console.log("Countdown created for event:", finalEventId);
          }
        } catch (error) {
          console.error("Error creating countdown:", error);
          // Don't block navigation if countdown creation fails
        }
      }

      localStorage.removeItem(FORM_STORAGE_KEY);
      router.push(`/dashboard?eventId=${finalEventId}`);
    } catch (err: any) {
      console.error("Error saving event:", err);
      alert(
        err.message ||
          "Failed to save event. Please check the form and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if Event Details step is completed
  // Step 1 is completed if:
  // 1. We've moved past it (currentStep > 1), OR
  // 2. Required event details are filled (eventName, description, date, time)
  const isEventDetailsCompleted =
    currentStep > 1 ||
    Boolean(
      formData.eventName &&
        formData.eventDescription &&
        formData.startDate &&
        formData.startTime
    );

  const steps = [
    { id: 1, label: "Event details", completed: isEventDetailsCompleted },
    {
      id: 2,
      label: "Tickets",
      completed: currentStep > 2 || tickets.length > 0,
    },
    { id: 3, label: "Preview & publish", completed: false },
  ];

  if (isLoading) {
    return (
      <div className={styles.createEventContainer}>
        <div className={styles.loadingContainer}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(e);
      }}
      className={styles.createEventContainer}
    >
      {/* Progress Tracker */}
      <ProgressTracker
        steps={steps}
        currentStep={currentStep}
        onPublish={
          currentStep === 3
            ? () => {
                handleSubmit();
              }
            : undefined
        }
        isSubmitting={isSubmitting}
      />

      {/* Clear All Data Button */}
      <div className={styles.clearAllWrapper}>
        <button
          type="button"
          className={styles.clearAllButton}
          onClick={clearAllData}
          title="Clear all form data and start fresh"
        >
          <IconTrash size={16} />
          Clear All Data
        </button>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {currentStep === 1 && (
          <>
            {/* AI Event Creation Section */}
            {showAiSection && (
              <div className={styles.aiSection}>
                <div className={styles.aiSectionInner}>
                  <div className={styles.aiSectionHeader}>
                    <div className={styles.aiIconWrapper}>
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={styles.aiSparkleIcon}
                      >
                        <path
                          d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                    <div>
                      <h2 className={styles.aiTitle}>Create with AI</h2>
                      <p className={styles.aiSubtitle}>
                        Describe your event and let AI fill in all the details instantly
                      </p>
                    </div>
                  </div>

                  <textarea
                    className={styles.aiTextarea}
                    placeholder='e.g., "Create a tech conference in Lagos on April 15th for 500 people with panels on AI and cybersecurity, VIP and regular tickets"'
                    value={aiPrompt}
                    onChange={(e) => {
                      setAiPrompt(e.target.value);
                      if (aiError) setAiError(null);
                    }}
                    rows={3}
                    disabled={aiLoading}
                  />

                  {aiError && (
                    <p className={styles.aiError}>{aiError}</p>
                  )}

                  <div className={styles.aiActions}>
                    <button
                      type="button"
                      className={`${styles.aiGenerateButton} ${aiLoading ? styles.aiGenerateButtonLoading : ""}`}
                      onClick={handleAiGenerate}
                      disabled={aiLoading || !aiPrompt.trim()}
                    >
                      {aiLoading ? (
                        <>
                          <span className={styles.aiSpinner} />
                          Generating...
                        </>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z" fill="currentColor" />
                          </svg>
                          Generate Event
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className={styles.aiSkipLink}
                      onClick={() => setShowAiSection(false)}
                    >
                      or fill in manually
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* AI Generated Success Badge */}
            {aiGenerated && !showAiSection && (
              <div className={styles.aiSuccessBadge}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor" />
                </svg>
                <span>AI filled your event details — review and edit below</span>
                <button
                  type="button"
                  className={styles.aiRetryLink}
                  onClick={() => {
                    setShowAiSection(true);
                    setAiGenerated(false);
                  }}
                >
                  Try again
                </button>
              </div>
            )}

            {/* Show AI trigger when section is hidden and not yet generated */}
            {!showAiSection && !aiGenerated && (
              <button
                type="button"
                className={styles.aiReopenButton}
                onClick={() => setShowAiSection(true)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z" fill="currentColor" />
                </svg>
                Create with AI
              </button>
            )}

            {/* Event Image Section */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Event Image</h2>
                <p className={styles.sectionSubtitle}>
                  Launch your event in no time—just minutes.
                </p>
              </div>

              <div className={styles.imageUploadContainer}>
                {/* Main Image Upload */}
                <div className={styles.mainImageUpload}>
                  {eventImagePreview ? (
                    <div className={styles.imagePreview}>
                      <img
                        src={eventImagePreview}
                        alt="Event preview"
                        className={styles.previewImage}
                      />
                      <button
                        type="button"
                        className={styles.changeImageButton}
                        onClick={() => {
                          // Add current image to additional images if it exists
                          if (
                            eventImagePreview &&
                            !additionalImages.includes(eventImagePreview)
                          ) {
                            setAdditionalImages((prev) => [
                              ...prev,
                              eventImagePreview,
                            ]);
                          }
                          // Clear main image to allow new upload
                          setEventImage(null);
                          setEventImagePreview(null);
                        }}
                      >
                        Add Another Image
                      </button>
                    </div>
                  ) : (
                    <label className={styles.uploadArea}>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={(e) =>
                          handleImageUpload(e.target.files?.[0] || null)
                        }
                        style={{ display: "none" }}
                      />
                      <IconUpload size={32} className={styles.uploadIcon} />
                      <span className={styles.uploadText}>upload</span>
                    </label>
                  )}
                </div>

                {/* Additional Image Placeholders */}
                <div className={styles.additionalImagesContainer}>
                  {/* Show existing images and placeholders */}
                  {Array.from({
                    length: Math.max(2, additionalImages.length + 1),
                  }).map((_, index) => (
                    <div
                      key={index}
                      className={styles.additionalImagePlaceholder}
                    >
                      {additionalImages[index] ? (
                        <div className={styles.additionalImageWrapper}>
                          <img
                            src={additionalImages[index]}
                            alt={`Additional ${index + 1}`}
                            className={styles.additionalPreview}
                          />
                          <button
                            type="button"
                            className={styles.removeImageButton}
                            onClick={() => {
                              setAdditionalImages((prev) =>
                                prev.filter((_, i) => i !== index)
                              );
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <label className={styles.smallUploadArea}>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg"
                            onChange={(e) =>
                              handleAdditionalImageUpload(
                                e.target.files?.[0] || null,
                                index
                              )
                            }
                            style={{ display: "none" }}
                          />
                          <IconUpload size={20} />
                        </label>
                      )}
                    </div>
                  ))}
                </div>

                {/* Image Guidelines */}
                <div className={styles.imageGuidelines}>
                  <p className={styles.guidelineText}>
                    • Recommended image size: 2160 x 1080px
                  </p>
                  <p className={styles.guidelineText}>
                    • Maximum file size: 10MB
                  </p>
                  <p className={styles.guidelineText}>
                    • Supported image files: JPEG, PNG
                  </p>
                </div>
              </div>
            </div>

            {/* Event Details Section */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Event details</h2>
                <p className={styles.sectionSubtitle}>
                  Launch your event in no time—just minutes.
                </p>
              </div>

              <div className={styles.formContainer}>
                <div className={styles.inputWrapper}>
                  <label className={styles.inputLabel}>Event name*</label>
                  <input
                    type="text"
                    placeholder="Enter event name"
                    value={formData.eventName}
                    onChange={(e) =>
                      handleInputChange("eventName", e.target.value)
                    }
                    required
                    className={styles.input}
                  />
                </div>

                <div className={styles.inputWrapper}>
                  <label className={styles.inputLabel}>
                    Event description*
                  </label>
                  <AutocompleteInput
                    as="textarea"
                    placeholder="Describe your event"
                    value={formData.eventDescription}
                    onChange={(val) => handleInputChange("eventDescription", val)}
                    suggestion={aiSuggestions.description || null}
                    onAcceptSuggestion={() => {
                      if (aiSuggestions.description) {
                        handleInputChange("eventDescription", aiSuggestions.description);
                        setAiSuggestions((prev) => { const n = { ...prev }; delete n.description; return n; });
                      }
                    }}
                    required
                    rows={4}
                    className={styles.textarea}
                    loading={smartAssistLoading}
                  />
                </div>

                <div className={styles.inputWrapper}>
                  <label className={styles.inputLabel}>Event type*</label>
                  <select
                    value={formData.eventType}
                    onChange={(e) =>
                      handleInputChange("eventType", e.target.value)
                    }
                    required
                    className={styles.select}
                  >
                    <option value="" disabled hidden></option>
                    {eventTypes.length > 0 ? (
                      eventTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Conference">Conference</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Seminar">Seminar</option>
                        <option value="Concert">Concert</option>
                        <option value="Festival">Festival</option>
                        <option value="Networking">Networking</option>
                        <option value="Sports">Sports</option>
                        <option value="Other">Other</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Date and Location Section */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Date and Location</h2>
                <p className={styles.sectionSubtitle}>
                  Launch your event in no time—just minutes.
                </p>
              </div>

              <div className={styles.formContainer}>
                {/* Type of Event */}
                <div className={styles.inputWrapper}>
                  <label className={styles.inputLabel}>Type of event</label>
                  <div className={styles.eventTypeCards}>
                    <div
                      className={`${styles.eventTypeCard} ${
                        formData.eventTimingType === "single"
                          ? styles.eventTypeCardSelected
                          : ""
                      }`}
                      onClick={() =>
                        handleInputChange("eventTimingType", "single")
                      }
                    >
                      <IconCalendarEvent size={24} />
                      <div className={styles.eventTypeCardContent}>
                        <h3 className={styles.eventTypeCardTitle}>
                          Single event
                        </h3>
                        <p className={styles.eventTypeCardDescription}>
                          For events that happens once
                        </p>
                      </div>
                      <div className={styles.radioButton}>
                        {formData.eventTimingType === "single" && (
                          <div className={styles.radioButtonInner} />
                        )}
                      </div>
                    </div>
                    <div
                      className={`${styles.eventTypeCard} ${
                        formData.eventTimingType === "recurring"
                          ? styles.eventTypeCardSelected
                          : ""
                      }`}
                      onClick={() =>
                        handleInputChange("eventTimingType", "recurring")
                      }
                    >
                      <IconCalendar size={24} />
                      <div className={styles.eventTypeCardContent}>
                        <h3 className={styles.eventTypeCardTitle}>
                          Recurring event
                        </h3>
                        <p className={styles.eventTypeCardDescription}>
                          For timed entry and multiple days
                        </p>
                      </div>
                      <div className={styles.radioButton}>
                        {formData.eventTimingType === "recurring" && (
                          <div className={styles.radioButtonInner} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recurring Event Details - Only show for recurring events */}
                {formData.eventTimingType === "recurring" && (
                  <RecurringEventDetails
                    startDate={formData.startDate}
                    startTime={formData.startTime}
                    endDate={formData.endDate}
                    endTime={formData.endTime}
                    repeatPattern={formData.repeatPattern}
                    repeatOnDays={formData.repeatOnDays}
                    repeatOnMonthDays={formData.repeatOnMonthDays}
                    timeMode={formData.timeMode}
                    timeSlots={formData.timeSlots}
                    onStartDateChange={(date) =>
                      handleInputChange("startDate", date)
                    }
                    onStartTimeChange={(time) =>
                      handleInputChange("startTime", time)
                    }
                    onEndDateChange={(date) =>
                      handleInputChange("endDate", date)
                    }
                    onEndTimeChange={(time) =>
                      handleInputChange("endTime", time)
                    }
                    onRepeatPatternChange={(pattern) =>
                      handleInputChange("repeatPattern", pattern)
                    }
                    onRepeatOnDaysChange={(days) =>
                      handleInputChange("repeatOnDays", days)
                    }
                    onRepeatOnMonthDaysChange={(days) =>
                      handleInputChange("repeatOnMonthDays", days)
                    }
                    onTimeModeChange={(mode) =>
                      handleInputChange("timeMode", mode)
                    }
                    onTimeSlotsChange={(slots) =>
                      handleInputChange("timeSlots", slots)
                    }
                  />
                )}

                {/* Date and Timing - Only show for single events */}
                {formData.eventTimingType === "single" && (
                  <div className={styles.inputWrapper}>
                    <label className={styles.inputLabel}>
                      Date and timing<span className={styles.required}>*</span>
                    </label>
                    <div className={styles.dateInputsContainer}>
                      <div className={styles.dateTimeInputGroup}>
                        <label className={styles.dateTimeLabel}>
                          Start date and time
                        </label>
                        <div className={styles.dateTimeInputWrapper}>
                          <IconCalendar
                            size={20}
                            className={styles.dateIcon}
                            onClick={() => {
                              const input = document.getElementById(
                                "start-datetime-input"
                              ) as HTMLInputElement;
                              if (input) {
                                if (typeof input.showPicker === "function") {
                                  input.showPicker();
                                } else {
                                  input.click();
                                }
                              }
                            }}
                          />
                          <input
                            id="start-datetime-input"
                            type="datetime-local"
                            value={
                              formData.startDate && formData.startTime
                                ? `${formData.startDate}T${formData.startTime}`
                                : ""
                            }
                            onChange={(e) => {
                              const dateTime = e.target.value;
                              if (dateTime) {
                                const [date, time] = dateTime.split("T");
                                handleInputChange("startDate", date);
                                handleInputChange("startTime", time || "");
                              } else {
                                handleInputChange("startDate", "");
                                handleInputChange("startTime", "");
                              }
                            }}
                            required
                            className={styles.dateTimeInput}
                          />
                        </div>
                      </div>
                      <span className={styles.dateSeparator}>To</span>
                      <div className={styles.dateTimeInputGroup}>
                        <label className={styles.dateTimeLabel}>
                          End date and time
                        </label>
                        <div className={styles.dateTimeInputWrapper}>
                          <IconCalendar
                            size={20}
                            className={styles.dateIcon}
                            onClick={() => {
                              const input = document.getElementById(
                                "end-datetime-input"
                              ) as HTMLInputElement;
                              if (input) {
                                if (typeof input.showPicker === "function") {
                                  input.showPicker();
                                } else {
                                  input.click();
                                }
                              }
                            }}
                          />
                          <input
                            id="end-datetime-input"
                            type="datetime-local"
                            value={
                              formData.endDate && formData.endTime
                                ? `${formData.endDate}T${formData.endTime}`
                                : ""
                            }
                            onChange={(e) => {
                              const dateTime = e.target.value;
                              if (dateTime) {
                                const [date, time] = dateTime.split("T");
                                handleInputChange("endDate", date);
                                handleInputChange("endTime", time || "");
                              } else {
                                handleInputChange("endDate", "");
                                handleInputChange("endTime", "");
                              }
                            }}
                            required
                            className={styles.dateTimeInput}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Time Zone */}
                <div className={styles.inputWrapper}>
                  <label className={styles.inputLabel}>
                    Time zone<span className={styles.required}>*</span>
                  </label>
                  <div className={styles.selectWrapper}>
                    <IconCalendar size={20} className={styles.selectIcon} />
                    <select
                      value={formData.timezone}
                      onChange={(e) =>
                        handleInputChange("timezone", e.target.value)
                      }
                      required
                      className={styles.select}
                    >
                      <option value="" disabled hidden></option>
                      {timezoneOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Location */}
                <div className={styles.inputWrapper}>
                  <label className={styles.inputLabel}>Location</label>
                  <div className={styles.locationButtons}>
                    <button
                      type="button"
                      className={`${styles.locationButton} ${
                        formData.locationType === "venue"
                          ? styles.locationButtonActive
                          : ""
                      }`}
                      onClick={() => handleInputChange("locationType", "venue")}
                    >
                      Venue
                    </button>
                    <button
                      type="button"
                      className={`${styles.locationButton} ${
                        formData.locationType === "virtual"
                          ? styles.locationButtonActive
                          : ""
                      }`}
                      onClick={() =>
                        handleInputChange("locationType", "virtual")
                      }
                    >
                      Virtual event
                    </button>
                    <button
                      type="button"
                      className={`${styles.locationButton} ${
                        formData.locationType === "tba"
                          ? styles.locationButtonActive
                          : ""
                      }`}
                      onClick={() => handleInputChange("locationType", "tba")}
                    >
                      To be announced
                    </button>
                  </div>
                </div>

                {/* Meeting Link - Only show for virtual events */}
                {formData.locationType === "virtual" && (
                  <div className={styles.inputWrapper}>
                    <label className={styles.inputLabel}>
                      Meeting Link<span className={styles.required}>*</span>
                    </label>
                    <input
                      type="url"
                      placeholder="Enter meeting link"
                      value={formData.meetingLink}
                      onChange={(e) =>
                        handleInputChange("meetingLink", e.target.value)
                      }
                      required={formData.locationType === "virtual"}
                      className={styles.input}
                    />
                  </div>
                )}

                {/* Address Fields - Only show if venue is selected */}
                {formData.locationType === "venue" && (
                  <>
                    <div className={styles.inputWrapper}>
                      <label className={styles.inputLabel}>Address</label>
                      <input
                        type="text"
                        placeholder="Enter address"
                        value={formData.address}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.inputWrapper}>
                      <label className={styles.inputLabel}>
                        Street address<span className={styles.required}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter street address"
                        value={formData.streetAddress}
                        onChange={(e) =>
                          handleInputChange("streetAddress", e.target.value)
                        }
                        required
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.addressRow}>
                      <div className={styles.inputWrapper}>
                        <label className={styles.inputLabel}>
                          Country<span className={styles.required}>*</span>
                        </label>
                        <AutocompleteInput
                          placeholder="Enter country"
                          value={formData.country}
                          onChange={(val) => handleInputChange("country", val)}
                          suggestion={aiSuggestions.country || null}
                          onAcceptSuggestion={() => {
                            if (aiSuggestions.country) {
                              handleInputChange("country", aiSuggestions.country);
                              setAiSuggestions((prev) => { const n = { ...prev }; delete n.country; return n; });
                            }
                          }}
                          required
                          className={styles.input}
                          loading={smartAssistLoading}
                        />
                      </div>
                      <div className={styles.inputWrapper}>
                        <label className={styles.inputLabel}>
                          State<span className={styles.required}>*</span>
                        </label>
                        <AutocompleteInput
                          placeholder="Enter state"
                          value={formData.state}
                          onChange={(val) => handleInputChange("state", val)}
                          suggestion={aiSuggestions.state || null}
                          onAcceptSuggestion={() => {
                            if (aiSuggestions.state) {
                              handleInputChange("state", aiSuggestions.state);
                              setAiSuggestions((prev) => { const n = { ...prev }; delete n.state; return n; });
                            }
                          }}
                          required
                          className={styles.input}
                          loading={smartAssistLoading}
                        />
                      </div>
                    </div>

                    <div className={styles.inputWrapper}>
                      <label className={styles.inputLabel}>
                        City<span className={styles.required}>*</span>
                      </label>
                      <AutocompleteInput
                        placeholder="Enter city"
                        value={formData.city}
                        onChange={(val) => handleInputChange("city", val)}
                        suggestion={aiSuggestions.city || null}
                        onAcceptSuggestion={() => {
                          if (aiSuggestions.city) {
                            handleInputChange("city", aiSuggestions.city);
                            setAiSuggestions((prev) => { const n = { ...prev }; delete n.city; return n; });
                          }
                        }}
                        required
                        className={styles.input}
                        loading={smartAssistLoading}
                      />
                    </div>

                    {/* Additional Details and Map Component */}
                    <LocationMapSection
                      address={formData.address}
                      streetAddress={formData.streetAddress}
                      landmark={formData.landmark}
                      additionalDetails={formData.additionalDetails}
                      onLandmarkChange={(value) =>
                        handleInputChange("landmark", value)
                      }
                      onAdditionalDetailsChange={(value) =>
                        handleInputChange("additionalDetails", value)
                      }
                      landmarkSuggestion={aiSuggestions.landmark || null}
                      additionalDetailsSuggestion={aiSuggestions.additional_details || null}
                      onAcceptLandmarkSuggestion={() => {
                        if (aiSuggestions.landmark) {
                          handleInputChange("landmark", aiSuggestions.landmark);
                          setAiSuggestions((prev) => { const n = { ...prev }; delete n.landmark; return n; });
                        }
                      }}
                      onAcceptAdditionalDetailsSuggestion={() => {
                        if (aiSuggestions.additional_details) {
                          handleInputChange("additionalDetails", aiSuggestions.additional_details);
                          setAiSuggestions((prev) => { const n = { ...prev }; delete n.additional_details; return n; });
                        }
                      }}
                    />
                  </>
                )}

                {/* Button Text Selector */}
                <ButtonTextSelector
                  selectedText={formData.ticketButtonText}
                  onTextChange={(text: string) =>
                    handleInputChange("ticketButtonText", text)
                  }
                />

                {/* Event Details Section (Tags, Social Links, Sections) */}
                <EventDetailsSection
                  tags={formData.tags}
                  onTagsChange={(tags) => handleInputChange("tags", tags)}
                  socialLinks={formData.socialLinks}
                  onSocialLinksChange={(links) =>
                    handleInputChange("socialLinks", links)
                  }
                  sections={formData.sections}
                  onSectionsChange={(sections) =>
                    handleInputChange("sections", sections)
                  }
                  lineupItems={lineupItems}
                  onLineupItemsChange={setLineupItems}
                  schedules={schedules}
                  onSchedulesChange={setSchedules}
                />



                {/* Save & Exit / Save & Continue Buttons */}
                <div className={styles.saveButtonsContainer}>
                  <button
                    type="button"
                    className={styles.saveExitButton}
                    onClick={() => {
                      saveDraft();
                      router.push("/dashboard");
                    }}
                  >
                    Save & Exit
                  </button>
                  <button
                    type="button"
                    className={styles.saveContinueButton}
                    onClick={() => {
                      saveDraft();
                      setCurrentStep(2);
                    }}
                    disabled={
                      !formData.eventName ||
                      !formData.eventDescription ||
                      !formData.eventType
                    }
                  >
                    Save & Continue
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {currentStep === 2 && (
          <>
            <TicketsStep
              tickets={tickets as any}
              onAddTicket={() => setIsModalOpen(true)}
              onRemoveTicket={removeTicket}
              onBack={() => setCurrentStep(1)}
              onNext={() => setCurrentStep(3)}
              onAddQuestions={handleAddQuestion}
              questions={questions}
              onEditQuestion={handleEditQuestion}
              onRemoveQuestion={handleRemoveQuestion}
              saveDraft={saveDraft}
              eventType={formData.eventType}
              eventLocation={formData.address || formData.city || formData.state}
              onVendorsSelected={setSelectedVendorIds}
            />
          </>
        )}

        {currentStep === 3 && (
          <PreviewStep
            eventName={formData.eventName}
            eventDescription={formData.eventDescription}
            eventType={formData.eventType}
            eventImagePreview={eventImagePreview}
            additionalImages={additionalImages}
            startDate={formData.startDate}
            startTime={formData.startTime}
            endDate={formData.endDate}
            endTime={formData.endTime}
            timezone={formData.timezone}
            locationType={formData.locationType}
            streetAddress={formData.streetAddress}
            address={formData.address}
            city={formData.city}
            state={formData.state}
            country={formData.country}
            meetingLink={formData.meetingLink}
            additionalDetails={formData.additionalDetails}
            socialLinks={formData.socialLinks}
            tags={formData.tags}
            tickets={tickets as any}
            lineupItems={lineupItems as any}
            schedules={schedules as any}
            ticketButtonText={formData.ticketButtonText}
            eventTimingType={formData.eventTimingType}
            repeatPattern={formData.repeatPattern}
            repeatOnDays={formData.repeatOnDays}
            repeatOnMonthDays={formData.repeatOnMonthDays}
            timeMode={formData.timeMode}
            timeSlots={formData.timeSlots}
            eventId={eventId || undefined}
            onBack={() => setCurrentStep(2)}
            onPublish={() => {
              handleSubmit();
            }}
            isSubmitting={isSubmitting}
          />
        )}
      </div>

      {/* Ticket Modal */}
      {isModalOpen && (
        <TicketModal
          isModalOpen={isModalOpen}
          closeModal={() => setIsModalOpen(false)}
          addTicket={addTicket}
          eventDetails={{
            title: formData.eventName,
            description: formData.eventDescription,
            location:
              formData.locationType === "virtual"
                ? "Virtual"
                : formData.locationType === "venue"
                ? "Physical"
                : "Physical",
          }}
        />
      )}

      {/* Question Modal */}
      <QuestionModal
        isOpen={isQuestionModalOpen}
        onClose={() => {
          setIsQuestionModalOpen(false);
          setEditingQuestion(null);
        }}
        onSave={handleSaveQuestion}
        question={editingQuestion}
      />
    </form>
  );
}
