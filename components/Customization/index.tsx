"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import DetailsStep from "../DetailsStep";
import AppearanceStep from "../AppearanceStep";
import styles from "./styles.module.css";
import type { EventFormData } from "../../store/types";
import { authenticatedRequest } from "../../app/services/auth";
import {
  Stack,
  Text,
  Button,
  Modal,
  Title,
  Alert,
  Tabs,
  Loader,
} from "@mantine/core";
import { Edit, Eye, AlertCircle, Check } from "lucide-react";
import { useAppDispatch } from "../../store/store";
import { updateEvent } from "../../store/eventSlice";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://keupass-48c2ae65f897.herokuapp.com/api";
const DEFAULT_BANNER_URL = "https://via.placeholder.com/150";

interface CustomizationData {
  id: string;
  event: string;
  banner_url: string;
  font: string;
  card_color: string;
  is_active: boolean;
}

const Customization: React.FC = () => {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  const dispatch = useAppDispatch();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    location: "Virtual",
    address: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    tickets: [],
    appearance: DEFAULT_BANNER_URL,
    cardColor: "#025a3a",
    questions: [],
    eventURL: "",
    price: "0.00",
  });
  const [initialFormData, setInitialFormData] = useState<EventFormData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customizationId, setCustomizationId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>("details");
  const [showCountdown, setShowCountdown] = useState(true);

  // Validate hex color
  const isValidHex = (color: string): boolean => {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
  };

  // Fetch event and customization data
  const fetchCustomization = async () => {
    if (!eventId) {
      console.error("No eventId provided");
      setError("No event selected.");
      return;
    }

    console.log("Fetching customization for eventId:", eventId);
    setIsLoading(true);

    try {
      // Fetch customization first
      const cuRes = await authenticatedRequest(
        `${API_BASE_URL}/event-customizations/?event=${eventId}`,
        "GET",
        { headers: { "Cache-Control": "no-cache" } }
      );
      console.log("Raw customization response:", cuRes);
      const list = Array.isArray(cuRes.data)
        ? cuRes.data
        : Array.isArray(cuRes)
        ? cuRes
        : [];
      const existing = list.length > 0 ? list[0] : null;
      console.log("Existing customization:", existing);

      // Fetch event
      const evRes = await authenticatedRequest(
        `${API_BASE_URL}/events/${eventId}/`,
        "GET",
        { headers: { "Cache-Control": "no-cache" } }
      );
      console.log("Raw event response:", evRes);
      const event = evRes.data || evRes;

      setCustomizationId(existing?.id ?? null);

      // Prioritize customization's card_color
      const customCardColor = existing?.card_color;
      const eventCardColor = event.customization?.card_color;
      const backendCardColor = customCardColor || eventCardColor || "#025a3a";
      const cardColor = isValidHex(backendCardColor)
        ? backendCardColor
        : "#025a3a";
      console.log(
        "Custom card_color:",
        customCardColor,
        "Event card_color:",
        eventCardColor,
        "Selected cardColor:",
        cardColor
      );

      // Build formData
      const start = event.start_date ? new Date(event.start_date) : new Date();
      const end = event.end_date ? new Date(event.end_date) : new Date();
      const fd: EventFormData = {
        title: event.title || "",
        description: event.description || "",
        location: event.location || "Virtual",
        address: event.address || "",
        startDate: start.toISOString().slice(0, 10) || "",
        startTime: start.toTimeString().slice(0, 5) || "",
        endDate: end.toISOString().slice(0, 10) || "",
        endTime: end.toTimeString().slice(0, 5) || "",
        tickets: event.tickets || [],
        appearance:
          existing?.banner_url || event.banner_url || DEFAULT_BANNER_URL,
        cardColor,
        questions: event.questions || [],
        eventURL:
          event.event_url || `${window.location.origin}/events/${eventId}`,
        price: event.price?.toString() || "0.00",
      };

      console.log("Setting formData:", fd);
      setFormData(fd);
      setInitialFormData(fd);
    } catch (err: any) {
      console.error("Fetch error:", err.message, err);
      setError(err.message || "Failed to load event data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!eventId) {
      console.error("No eventId in useEffect");
      setError("No event selected.");
      return;
    }
    console.log("useEffect triggered for eventId:", eventId);
    fetchCustomization();
  }, [eventId]);

  // Log formData changes
  useEffect(() => {
    console.log("Current formData:", formData);
  }, [formData]);

  // Handlers
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    console.log(`handleChange: ${id} = ${value}`);
    setFormData((p) => ({ ...p, [id]: value }));
  };

  const handleLocationChange = (loc: "Virtual" | "Physical") => {
    console.log("handleLocationChange:", loc);
    setFormData((p) => ({
      ...p,
      location: loc,
      address: loc === "Virtual" ? "" : p.address,
    }));
  };

  const handleFileSelect = (f: File | null) => {
    console.log("Selected file:", f);
    setSelectedFile(f);
  };

  // Save changes
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!eventId) throw new Error("Missing event ID.");

      // Upload file if present
      let banner = formData.appearance;
      if (selectedFile) {
        const m = new FormData();
        m.append("image", selectedFile);
        const up = await authenticatedRequest(
          `${API_BASE_URL}/upload-image/`,
          "POST",
          m
        );
        console.log("Image upload response:", up);
        banner = up.data?.url || up.url || banner;
        if (!banner) throw new Error("Image upload failed");
      }

      // Patch event
      const eventPayload = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        address: formData.address,
        start_date: `${formData.startDate}T${formData.startTime}:00Z`,
        end_date: `${formData.endDate}T${formData.endTime}:00Z`,
        price: parseFloat(formData.price),
        card_color: formData.cardColor,
      };
      console.log("Event PATCH payload:", eventPayload);
      const eventResponse = await authenticatedRequest(
        `${API_BASE_URL}/events/${eventId}/`,
        "PATCH",
        eventPayload
      );
      console.log("Event PATCH response:", eventResponse);

      // Upsert customization
      const customizationPayload = {
        event: eventId,
        banner_url: banner,
        font: "Arial",
        card_color: formData.cardColor,
        is_active: true,
      };
      console.log("Customization payload:", customizationPayload);

      let customizationResponse;
      if (customizationId) {
        customizationResponse = await authenticatedRequest(
          `${API_BASE_URL}/event-customizations/${customizationId}/`,
          "PATCH",
          customizationPayload
        );
        console.log("Customization PATCH response:", customizationResponse);
      } else {
        customizationResponse = await authenticatedRequest(
          `${API_BASE_URL}/event-customizations/`,
          "POST",
          customizationPayload
        );
        console.log("Customization POST response:", customizationResponse);
        setCustomizationId(
          customizationResponse.data?.id || customizationResponse.id
        );
      }

      // Update Redux
      dispatch(
        updateEvent({
          id: eventId,
          updates: { ...formData, appearance: banner },
        })
      );

      // Re-fetch to sync
      await fetchCustomization();

      setSaveSuccess(true);
      setSelectedFile(null);
      setTimeout(() => {
        setIsModalOpen(false);
        setSaveSuccess(false);
      }, 2000);
    } catch (err: any) {
      console.error("Submit error:", err.message, err);
      setError(err.message || "Save failed");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleModal = () => {
    console.log("Toggling modal, current state:", isModalOpen);
    setIsModalOpen((p) => !p);
    setActiveTab("details");
    setSaveSuccess(false);
    setError(null);
  };

  const handleDiscard = () => {
    console.log("Discarding changes");
    if (initialFormData) {
      setFormData(initialFormData);
      setSelectedFile(null);
      toggleModal();
    }
  };

  const hasUnsaved =
    initialFormData &&
    (JSON.stringify(formData) !== JSON.stringify(initialFormData) ||
      !!selectedFile);

  const handleUpdateFormData = (update: Partial<EventFormData>) => {
    console.log("updateFormData called with:", update);
    setFormData((prev) => {
      const newFormData = { ...prev, ...update };
      console.log("New formData after update:", newFormData);
      return newFormData;
    });
  };

  return (
    <div className={styles.formContainer}>
      <Stack>
        <div className={styles.AppFlex}>
          <Button onClick={toggleModal} className={styles.AppFlexBTN}>
            Edit Event
          </Button>
          {hasUnsaved && (
            <Button
              onClick={handleSubmit}
              loading={isLoading}
              color="green"
              className={styles.AppFlexBTN}
            >
              Save Changes
            </Button>
          )}
        </div>
      </Stack>

      <Modal
        opened={isModalOpen}
        onClose={toggleModal}
        title={
          <div className={styles.modalTitle}>
            <Edit size={20} />
            <Title order={3}>Edit Event</Title>
          </div>
        }
        size="lg"
        closeOnEscape={!isLoading}
        closeOnClickOutside={!isLoading}
      >
        <Stack>
          {error ? (
            <Alert
              icon={<AlertCircle />}
              title="Error"
              color="red"
              variant="filled"
            >
              {error}
            </Alert>
          ) : saveSuccess ? (
            <Alert
              icon={<Check />}
              title="Success"
              color="green"
              variant="filled"
            >
              Saved!
            </Alert>
          ) : null}
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <Loader />
              <Text>Loading...</Text>
            </div>
          ) : (
            <>
              <Tabs
                value={activeTab}
                onTabChange={setActiveTab}
                className={styles.modalTabs}
              >
                <Tabs.List>
                  <Tabs.Tab value="details" icon={<Edit />}>
                    Details
                  </Tabs.Tab>
                  <Tabs.Tab value="preview" icon={<Eye />}>
                    Preview
                  </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="details" pt="md">
                  <DetailsStep
                    formData={formData}
                    handleChange={handleChange}
                    handleLocationChange={handleLocationChange}
                  />
                </Tabs.Panel>

                <Tabs.Panel value="preview" pt="md">
                  <div className={styles.appearanceWrapper}>
                    <AppearanceStep
                      formData={formData}
                      updateFormData={handleUpdateFormData}
                      onFileSelect={handleFileSelect}
                      previewOnly
                      showCountdown={showCountdown}
                    />
                  </div>
                  <Button mt="md" onClick={() => setShowCountdown((x) => !x)}>
                    {showCountdown ? "Hide" : "Show"} Countdown
                  </Button>
                </Tabs.Panel>
              </Tabs>

              <div className={styles.modalActions}>
                {hasUnsaved && (
                  <Button
                    onClick={handleSubmit}
                    loading={isLoading}
                    color="green"
                    fullWidth
                    className={styles.modalButton}
                  >
                    Save Changes
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleDiscard}
                  disabled={isLoading}
                  fullWidth
                  className={styles.modalButton}
                >
                  Discard
                </Button>
              </div>
            </>
          )}
        </Stack>
      </Modal>

      <div className={styles.Appearance}>
        <Text size="lg" mb="md">
          Preview
        </Text>
        <div className={styles.appearanceWrapper}>
          <AppearanceStep
            formData={formData}
            updateFormData={handleUpdateFormData}
            onFileSelect={handleFileSelect}
            showCountdown={showCountdown}
          />
        </div>
        <Button mt="md" onClick={() => setShowCountdown((x) => !x)}>
          {showCountdown ? "Hide" : "Show"} Countdown
        </Button>
      </div>
    </div>
  );
};

export default Customization;
