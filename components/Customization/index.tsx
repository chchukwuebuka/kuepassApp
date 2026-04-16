"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import DetailsStep from "../DetailsStep";
import AppearanceStep from "../AppearanceStep";
import EventDetailsSection from "../CreateEventPage/EventDetailsSection";
import ButtonTextSelector from "../CreateEventPage/ButtonTextSelector";
import QuestionModal from "../CreateEventPage/QuestionModal";
import EventServiceModal, { EventService } from "../CreateEventPage/EventServiceModal";
import VendorRecommendations from "../CreateEventPage/VendorRecommendations";
import styles from "./styles.module.css";
import createStyles from "../CreateEventPage/styles.module.css";
import type { EventFormData, Question } from "../../store/types";
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
import { Edit, Eye, AlertCircle, Check, Settings, MessageSquarePlus } from "lucide-react";
import { useAppDispatch } from "../../store/store";
import { updateEvent } from "../../store/eventSlice";
import { IconPlus, IconTrash } from "@tabler/icons-react";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://api.kuepass.com/api/"
).replace(/\/$/, "");
const DEFAULT_BANNER_URL = "https://via.placeholder.com/150";

interface CustomizationData {
  id: string;
  event: string;
  banner_url: string | string[];
  font: string;
  card_color: string;
  is_active: boolean;
}

const Customization: React.FC = () => {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  const dispatch = useAppDispatch();

  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<EventService | null>(null);
  const [services, setServices] = useState<EventService[]>([]);
  
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
  const [activeTab, setActiveTab] = useState<string | null>("preview");
  const [showCountdown, setShowCountdown] = useState(true);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) setActiveTab(tabParam);
  }, [searchParams]);

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
        appearance: (() => {
          const raw = existing?.banner_url || event.banner_url;
          if (Array.isArray(raw) && raw.length > 0) return raw[0];
          if (typeof raw === "string" && raw) return raw;
          return DEFAULT_BANNER_URL;
        })(),
        cardColor,
        questions: event.questions || [],
        eventURL:
          event.event_url || `${window.location.origin}/events/${eventId}`,
        price: event.price?.toString() || "0.00",
        tags: event.tags || [],
        socialLinks: event.social_links
            ? {
                instagram: event.social_links.find((l: any) => l.platform === "instagram")?.url,
                youtube: event.social_links.find((l: any) => l.platform === "youtube")?.url,
                tiktok: event.social_links.find((l: any) => l.platform === "tiktok")?.url,
              }
            : {},
        sections: (() => {
          const s = event.sections || [];
          if (event.itinerary && event.itinerary.length > 0 && !s.includes('itinerary')) {
            return [...s, 'itinerary'];
          }
          return s;
        })(),
        lineupItems: event.line_up || [],
        schedules: (() => {
          const rawItinerary = event.itinerary || [];
          if (!Array.isArray(rawItinerary) || rawItinerary.length === 0) return [];
          // Check if it's already in grouped format (has 'slots' key)
          if (rawItinerary[0]?.slots) return rawItinerary;
          // Convert flat itinerary to grouped schedules
          const groupMap: Record<string, any[]> = {};
          rawItinerary.forEach((item: any) => {
            const dayName = item.title || "Main Schedule";
            if (!groupMap[dayName]) groupMap[dayName] = [];
            groupMap[dayName].push({
              id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
              title: item.activity || item.title || '',
              startTime: item.start_time || '',
              endTime: item.end_time || '',
              hostName: item.host || '',
              description: item.description || '',
            });
          });
          return Object.keys(groupMap).map(name => ({
            id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
            name,
            slots: groupMap[name],
          }));
        })(),
        ticketButtonText: existing?.button_text || "Get Ticket",
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
      const socialLinksArray: { platform: string; url: string }[] = [];
      if (formData.socialLinks?.instagram) socialLinksArray.push({ platform: "instagram", url: formData.socialLinks.instagram });
      if (formData.socialLinks?.youtube) socialLinksArray.push({ platform: "youtube", url: formData.socialLinks.youtube });
      if (formData.socialLinks?.tiktok) socialLinksArray.push({ platform: "tiktok", url: formData.socialLinks.tiktok });

      const lineUpArray = (formData.lineupItems || []).map((item: any) => ({
        name: item.name,
        role: item.role,
        description: item.description,
        ...(item.image && { image: item.image }),
      }));

      const itineraryArray = (formData.schedules || []).flatMap((schedule: any) =>
        schedule.slots.map((slot: any) => ({
          title: schedule.name || slot.title,
          activity: slot.title,
          start_time: slot.startTime,
          end_time: slot.endTime,
          host: slot.hostName || "",
          description: slot.description || "",
        }))
      );

      const eventPayload: any = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        address: formData.address,
        start_date: `${formData.startDate}T${formData.startTime}:00Z`,
        end_date: `${formData.endDate}T${formData.endTime}:00Z`,
        price: parseFloat(formData.price),
        card_color: formData.cardColor,
        ...(formData.tags && formData.tags.length > 0 && { tags: formData.tags }),
        ...(socialLinksArray.length > 0 && { social_links: socialLinksArray }),
        ...(lineUpArray.length > 0 && { line_up: lineUpArray }),
        ...(itineraryArray.length > 0 && { itinerary: itineraryArray }),
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
        banner_url: Array.isArray(banner)
          ? banner.filter((u: string) => u && typeof u === "string")
          : banner ? [banner] : [],
        font: "Arial",
        card_color: formData.cardColor,
        button_text: formData.ticketButtonText !== 'Get Ticket' ? formData.ticketButtonText : undefined,
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
      <Stack mb="xl">
        <div className={styles.AppFlex} style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Title order={2}>Customization</Title>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button
              variant="outline"
              onClick={handleDiscard}
              disabled={isLoading || !hasUnsaved}
            >
              Discard Changes
            </Button>
            <Button
              onClick={handleSubmit}
              loading={isLoading}
              color="green"
              disabled={!hasUnsaved}
            >
              Save Changes
            </Button>
          </div>
        </div>
        {error && (
          <Alert icon={<AlertCircle />} title="Error" color="red" variant="filled">
            {error}
          </Alert>
        )}
        {saveSuccess && (
          <Alert icon={<Check />} title="Success" color="green" variant="filled">
            Saved!
          </Alert>
        )}
      </Stack>

      {isLoading ? (
        <div className={styles.loadingContainer}>
          <Loader />
          <Text>Loading...</Text>
        </div>
      ) : (
        <Tabs
          value={activeTab}
          onTabChange={setActiveTab}
          className={styles.modalTabs}
          keepMounted={false}
        >
          <div className={styles.customTabList}>
            <button 
              type="button"
              className={`${styles.customTab} ${activeTab === 'details' ? styles.customTabActive : ''}`}
              onClick={() => setActiveTab('details')}
            >
              <Edit className={styles.customTabIcon} /> Core Settings
            </button>
            <button 
              type="button"
              className={`${styles.customTab} ${activeTab === 'preview' ? styles.customTabActive : ''}`}
              onClick={() => setActiveTab('preview')}
            >
              <Eye className={styles.customTabIcon} /> Appearance
            </button>
            <button 
              type="button"
              className={`${styles.customTab} ${activeTab === 'addons' ? styles.customTabActive : ''}`}
              onClick={() => setActiveTab('addons')}
            >
              <MessageSquarePlus className={styles.customTabIcon} /> Ticketing & Forms
            </button>
            <button 
              type="button"
              className={`${styles.customTab} ${activeTab === 'advanced' ? styles.customTabActive : ''}`}
              onClick={() => setActiveTab('advanced')}
            >
              <Settings className={styles.customTabIcon} /> Marketing
            </button>
          </div>

                <Tabs.Panel value="details" pt="md">
                  <DetailsStep
                    formData={formData}
                    handleChange={handleChange}
                    handleLocationChange={handleLocationChange}
                    onAiAction={() => {}} // Placeholder for AI functionality
                    isGenerating={false} // Placeholder for AI generation state
                  />
                </Tabs.Panel>

                <Tabs.Panel value="preview" pt="md">
                  <div className={createStyles.section}>
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
                </Tabs.Panel>

                <Tabs.Panel value="addons" pt="md">
                  <div className={createStyles.section}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '18px', color: '#111827' }}>Custom Questions</h3>
                        <p style={{ margin: '5px 0 0', color: '#6b7280', fontSize: '14px' }}>Add questions for attendees to answer during registration.</p>
                      </div>
                      <Button
                        onClick={() => setIsQuestionModalOpen(true)}
                        leftSection={<IconPlus size={16} />}
                        style={{ backgroundColor: '#025a3a' }}
                      >
                        Add Question
                      </Button>
                    </div>

                    {formData.questions?.length === 0 ? (
                      <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px dashed #e5e7eb' }}>
                        <MessageSquarePlus size={32} color="#9ca3af" style={{ margin: '0 auto 12px' }} />
                        <Text color="dimmed">No custom questions created yet.</Text>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {formData.questions?.map((q: any) => (
                          <div key={q.id || q.title} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
                            <div>
                              <div style={{ fontWeight: 600, color: '#111827' }}>{q.title}</div>
                              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                                {q.type === 'text' ? 'Short Answer' : q.type === 'checkbox' ? 'Multiple Choice' : q.type}
                                {q.required && <span style={{ color: '#ef4444', marginLeft: '8px' }}>• Required</span>}
                              </div>
                            </div>
                            <Button
                              variant="subtle"
                              color="red"
                              onClick={() => {
                                const newQs = formData.questions?.filter((existing) => existing !== q);
                                handleUpdateFormData({ questions: newQs });
                              }}
                            >
                              <IconTrash size={18} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ padding: '20px 0', borderBottom: '1px solid #e5e7eb', margin: '20px 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '18px', color: '#111827' }}>Event Services (Add-ons)</h3>
                        <p style={{ margin: '5px 0 0', color: '#6b7280', fontSize: '14px' }}>Add services attendees can buy (e.g. VIP tables, parking).</p>
                      </div>
                      <Button
                        onClick={() => {
                          setEditingService(null);
                          setIsServiceModalOpen(true);
                        }}
                        leftSection={<IconPlus size={16} />}
                        style={{ backgroundColor: '#025a3a' }}
                      >
                        Add Service
                      </Button>
                    </div>

                    {services.length === 0 ? (
                      <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px dashed #e5e7eb', marginBottom: '30px' }}>
                        <Text color="dimmed">No premium services created yet.</Text>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
                        {services.map((srv) => (
                          <div key={srv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
                            <div>
                              <div style={{ fontWeight: 600, color: '#111827' }}>{srv.name}</div>
                              {srv.description && <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{srv.description}</div>}
                            </div>
                            <Button
                              variant="subtle"
                              color="red"
                              onClick={() => setServices(services.filter((s) => s.id !== srv.id))}
                            >
                              <IconTrash size={18} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ padding: '20px 0', borderBottom: '1px solid #e5e7eb', margin: '20px 0' }} />

                    <VendorRecommendations
                      eventType={formData.tags?.[0] || "General"}
                      eventLocation={formData.location || "Virtual"}
                      onVendorsSelected={() => {}}
                    />
                  </div>
                </Tabs.Panel>

                <Tabs.Panel value="advanced" pt="md">
                  <div className={createStyles.section}>
                    <ButtonTextSelector
                      selectedText={formData.ticketButtonText || "Get Ticket"}
                      onTextChange={(text: string) => handleUpdateFormData({ ticketButtonText: text })}
                    />
                    <div style={{ height: '30px' }} />
                    <EventDetailsSection
                      tags={formData.tags || []}
                      onTagsChange={(tags) => handleUpdateFormData({ tags })}
                      socialLinks={formData.socialLinks || {}}
                      onSocialLinksChange={(links) => handleUpdateFormData({ socialLinks: links })}
                      sections={formData.sections || []}
                      onSectionsChange={(sections) => handleUpdateFormData({ sections })}
                      lineupItems={formData.lineupItems || []}
                      onLineupItemsChange={(items) => handleUpdateFormData({ lineupItems: items })}
                      schedules={formData.schedules || []}
                      onSchedulesChange={(schedules) => handleUpdateFormData({ schedules })}
                    />
                  </div>
                </Tabs.Panel>
              </Tabs>
      )}

      {isQuestionModalOpen && (
        <QuestionModal
          isOpen={isQuestionModalOpen}
          onClose={() => setIsQuestionModalOpen(false)}
          onSave={(question) => {
            const newQuestions = [...(formData.questions || []), question];
            handleUpdateFormData({ questions: newQuestions });
          }}
        />
      )}

      {isServiceModalOpen && (
        <EventServiceModal
          isOpen={isServiceModalOpen}
          onClose={() => setIsServiceModalOpen(false)}
          onSave={(service) => {
            if (editingService) {
              setServices(services.map((s) => (s.id === service.id ? service : s)));
            } else {
              setServices([...services, service]);
            }
          }}
          service={editingService}
        />
      )}
    </div>
  );
};

export default Customization;
