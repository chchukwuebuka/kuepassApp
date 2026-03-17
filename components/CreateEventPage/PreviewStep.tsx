"use client";

import React, { useState, useEffect } from "react";
import {
  IconDeviceDesktop,
  IconDeviceMobile,
  IconMapPin,
  IconCalendar,
  IconClock,
  IconTag,
  IconCurrencyDollar,
  IconBrandInstagram,
  IconBrandYoutube,
  IconBrandTiktok,
  IconX,
  IconVideo,
  IconLink,
  IconSparkles,
  IconMail,
  IconTargetArrow,
  IconChevronDown,
  IconChevronUp,
  IconCopy,
  IconCheck,
  IconRocket,
  IconLoader2,
} from "@tabler/icons-react";
import CountdownTimer from "../CountdownTimer";
import { authenticatedRequest } from "@/app/services/auth";
import styles from "./styles.module.css";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.kuepass.com/api/"
).replace(/\/$/, "");

// ─── Promotion Kit Section ─────────────────────────────────────────────────

interface PromotionKitSectionProps {
  eventName: string;
  eventDescription: string;
  eventType: string;
  locationType: string;
  address: string;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  tags: string[];
  tickets: any[];
}

function PromotionKitSection({
  eventName,
  eventDescription,
  eventType,
  locationType,
  address,
  streetAddress,
  city,
  state,
  country,
  startDate,
  startTime,
  endDate,
  endTime,
  tags,
  tickets,
}: PromotionKitSectionProps) {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(id);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setPlan(null);

    const locationStr =
      locationType === "virtual"
        ? "Virtual"
        : [streetAddress || address, city, state, country]
            .filter(Boolean)
            .join(", ") || "TBA";

    const lowestPrice =
      tickets.length > 0
        ? Math.min(...tickets.map((t: any) => t.price || 0))
        : 0;

    try {
      const response = await authenticatedRequest<any>(
        `${API_BASE_URL}/ai/generate-marketing-plan-from-details/`,
        "POST",
        {
          title: eventName,
          description: eventDescription,
          event_type: eventType,
          location: locationStr,
          address: streetAddress || address,
          start_date: startDate && startTime ? `${startDate}T${startTime}` : startDate,
          end_date: endDate && endTime ? `${endDate}T${endTime}` : endDate,
          price: lowestPrice,
          tags: tags,
          marketing_budget: 50000,
        }
      );
      setPlan(response);
      setExpandedSection("social");
    } catch (err: any) {
      console.error("Marketing plan error:", err);
      setError(err.message || "Failed to generate marketing plan.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const sectionStyle: React.CSSProperties = {
    margin: "24px 0",
    borderRadius: "16px",
    overflow: "hidden",
    border: "1px solid #e5e7eb",
    background: "#fff",
  };

  const headerStyle: React.CSSProperties = {
    padding: "20px 24px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    color: "#fff",
  };

  const accordionHeaderStyle: React.CSSProperties = {
    padding: "14px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
    borderBottom: "1px solid #f3f4f6",
    transition: "background 0.2s",
    userSelect: "none",
  };

  const accordionBodyStyle: React.CSSProperties = {
    padding: "16px 20px",
    background: "#fafafa",
  };

  const cardStyle: React.CSSProperties = {
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    background: "#fff",
    marginBottom: "12px",
  };

  const copyBtnStyle: React.CSSProperties = {
    background: "none",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    padding: "4px 8px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "12px",
    color: "#6b7280",
  };

  if (!plan && !loading && !error) {
    return (
      <div style={sectionStyle}>
        <div style={headerStyle}>
          <IconSparkles size={24} />
          <div>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>
              AI Promotion Kit
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: "13px", opacity: 0.9 }}>
              Generate a complete marketing plan based on your event details
            </p>
          </div>
        </div>
        <div style={{ padding: "24px", textAlign: "center" }}>
          <p style={{ color: "#6b7280", marginBottom: "16px", fontSize: "14px" }}>
            Get AI-generated social media captions, email campaigns, advertising
            strategies, and a marketing calendar — all tailored to your event.
          </p>
          <button
            type="button"
            onClick={handleGenerate}
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "12px 28px",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <IconRocket size={18} />
            Generate Your Free Marketing Plan
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={sectionStyle}>
        <div style={headerStyle}>
          <IconSparkles size={24} />
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>
            AI Promotion Kit
          </h3>
        </div>
        <div
          style={{
            padding: "48px 24px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <IconLoader2
            size={36}
            style={{ animation: "spin 1s linear infinite", color: "#6366f1" }}
          />
          <p style={{ color: "#6b7280", fontSize: "14px" }}>
            AI is crafting your marketing plan...
          </p>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={sectionStyle}>
        <div style={{ ...headerStyle, background: "#ef4444" }}>
          <IconSparkles size={24} />
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>
            AI Promotion Kit
          </h3>
        </div>
        <div style={{ padding: "24px", textAlign: "center" }}>
          <p style={{ color: "#ef4444", marginBottom: "16px" }}>{error}</p>
          <button
            type="button"
            onClick={handleGenerate}
            style={{
              background: "#6366f1",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "10px 24px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Render the generated plan
  return (
    <div style={sectionStyle}>
      <div style={headerStyle}>
        <IconSparkles size={24} />
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>
            AI Promotion Kit
          </h3>
          <p style={{ margin: "2px 0 0", fontSize: "12px", opacity: 0.85 }}>
            Generated for &quot;{eventName}&quot;
          </p>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          style={{
            background: "rgba(255,255,255,0.2)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: "8px",
            padding: "6px 14px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 500,
          }}
        >
          Regenerate
        </button>
      </div>

      {/* Social Media Section */}
      {plan?.socialMediaStrategy && (
        <>
          <div
            style={accordionHeaderStyle}
            onClick={() => toggleSection("social")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <IconBrandInstagram size={20} style={{ color: "#e1306c" }} />
              <span style={{ fontWeight: 600, fontSize: "14px" }}>
                Social Media Strategy
              </span>
              <span
                style={{
                  background: "#f3f0ff",
                  color: "#6366f1",
                  borderRadius: "12px",
                  padding: "2px 10px",
                  fontSize: "11px",
                  fontWeight: 500,
                }}
              >
                {plan.socialMediaStrategy.captionTemplates?.length || 0} captions
              </span>
            </div>
            {expandedSection === "social" ? (
              <IconChevronUp size={18} />
            ) : (
              <IconChevronDown size={18} />
            )}
          </div>
          {expandedSection === "social" && (
            <div style={accordionBodyStyle}>
              {plan.socialMediaStrategy.captionTemplates?.map(
                (tmpl: any, i: number) => (
                  <div key={i} style={cardStyle}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <span
                        style={{
                          background: "#f3f0ff",
                          color: "#6366f1",
                          borderRadius: "6px",
                          padding: "2px 8px",
                          fontSize: "11px",
                          fontWeight: 500,
                        }}
                      >
                        {tmpl.theme}
                      </span>
                      <button
                        type="button"
                        style={copyBtnStyle}
                        onClick={() => copyToClipboard(tmpl.caption, `social-${i}`)}
                      >
                        {copiedItem === `social-${i}` ? (
                          <IconCheck size={12} style={{ color: "#22c55e" }} />
                        ) : (
                          <IconCopy size={12} />
                        )}
                        {copiedItem === `social-${i}` ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <p
                      style={{
                        fontSize: "13px",
                        lineHeight: 1.5,
                        color: "#374151",
                        margin: 0,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {tmpl.caption}
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </>
      )}

      {/* Email Section */}
      {plan?.emailSequence && (
        <>
          <div
            style={accordionHeaderStyle}
            onClick={() => toggleSection("email")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <IconMail size={20} style={{ color: "#22c55e" }} />
              <span style={{ fontWeight: 600, fontSize: "14px" }}>
                Email Campaigns
              </span>
              <span
                style={{
                  background: "#ecfdf5",
                  color: "#16a34a",
                  borderRadius: "12px",
                  padding: "2px 10px",
                  fontSize: "11px",
                  fontWeight: 500,
                }}
              >
                {plan.emailSequence.length} emails
              </span>
            </div>
            {expandedSection === "email" ? (
              <IconChevronUp size={18} />
            ) : (
              <IconChevronDown size={18} />
            )}
          </div>
          {expandedSection === "email" && (
            <div style={accordionBodyStyle}>
              {plan.emailSequence.map((email: any, i: number) => (
                <div key={i} style={cardStyle}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "8px",
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: "14px" }}>{email.name}</strong>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#9ca3af",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          marginTop: "2px",
                        }}
                      >
                        <IconClock size={12} /> {email.send_timing}
                      </div>
                    </div>
                    <button
                      type="button"
                      style={copyBtnStyle}
                      onClick={() =>
                        copyToClipboard(
                          `Subject: ${email.subject}\n\n${email.body}`,
                          `email-${i}`
                        )
                      }
                    >
                      {copiedItem === `email-${i}` ? (
                        <IconCheck size={12} style={{ color: "#22c55e" }} />
                      ) : (
                        <IconCopy size={12} />
                      )}
                      {copiedItem === `email-${i}` ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <div
                    style={{
                      background: "#f9fafb",
                      borderRadius: "6px",
                      padding: "8px 10px",
                      marginBottom: "6px",
                    }}
                  >
                    <span style={{ fontSize: "11px", color: "#6b7280" }}>
                      Subject:
                    </span>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: 500,
                        margin: "2px 0 0",
                      }}
                    >
                      {email.subject}
                    </p>
                  </div>
                  <p
                    style={{
                      fontSize: "12px",
                      lineHeight: 1.5,
                      color: "#4b5563",
                      margin: 0,
                      whiteSpace: "pre-wrap",
                      maxHeight: "120px",
                      overflow: "auto",
                    }}
                  >
                    {email.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Advertising Section */}
      {plan?.advertisingPlan && (
        <>
          <div
            style={accordionHeaderStyle}
            onClick={() => toggleSection("ads")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <IconTargetArrow size={20} style={{ color: "#f59e0b" }} />
              <span style={{ fontWeight: 600, fontSize: "14px" }}>
                Advertising Strategy
              </span>
            </div>
            {expandedSection === "ads" ? (
              <IconChevronUp size={18} />
            ) : (
              <IconChevronDown size={18} />
            )}
          </div>
          {expandedSection === "ads" && (
            <div style={accordionBodyStyle}>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
                {plan.advertisingPlan.suggestedPlatforms?.map(
                  (p: string, i: number) => (
                    <span
                      key={i}
                      style={{
                        background: "#fff7ed",
                        color: "#ea580c",
                        borderRadius: "20px",
                        padding: "4px 14px",
                        fontSize: "12px",
                        fontWeight: 500,
                      }}
                    >
                      {p}
                    </span>
                  )
                )}
              </div>
              {plan.advertisingPlan.budgetBreakdown?.map(
                (item: any, i: number) => (
                  <div key={i} style={cardStyle}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "6px",
                      }}
                    >
                      <strong style={{ fontSize: "13px" }}>
                        {item.platform}
                      </strong>
                      <span
                        style={{
                          background: "#fff7ed",
                          color: "#ea580c",
                          borderRadius: "6px",
                          padding: "2px 8px",
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      >
                        {item.suggested_allocation_percent}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: "6px",
                        borderRadius: "3px",
                        background: "#f3f4f6",
                        marginBottom: "8px",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${item.suggested_allocation_percent}%`,
                          borderRadius: "3px",
                          background:
                            "linear-gradient(90deg, #f59e0b, #ea580c)",
                        }}
                      />
                    </div>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        margin: 0,
                      }}
                    >
                      {item.target_audience_suggestion}
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </>
      )}

      {/* Calendar Section */}
      {plan?.marketingCalendar && (
        <>
          <div
            style={accordionHeaderStyle}
            onClick={() => toggleSection("calendar")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <IconCalendar size={20} style={{ color: "#3b82f6" }} />
              <span style={{ fontWeight: 600, fontSize: "14px" }}>
                Marketing Calendar
              </span>
              <span
                style={{
                  background: "#eff6ff",
                  color: "#2563eb",
                  borderRadius: "12px",
                  padding: "2px 10px",
                  fontSize: "11px",
                  fontWeight: 500,
                }}
              >
                {plan.marketingCalendar.length} tasks
              </span>
            </div>
            {expandedSection === "calendar" ? (
              <IconChevronUp size={18} />
            ) : (
              <IconChevronDown size={18} />
            )}
          </div>
          {expandedSection === "calendar" && (
            <div style={accordionBodyStyle}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: "10px",
                }}
              >
                {plan.marketingCalendar.map((task: any, i: number) => (
                  <div key={i} style={cardStyle}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "6px",
                      }}
                    >
                      <span
                        style={{
                          background: "#eff6ff",
                          color: "#2563eb",
                          borderRadius: "6px",
                          padding: "2px 8px",
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      >
                        Day {task.day}
                      </span>
                      <span
                        style={{
                          fontSize: "10px",
                          color: "#9ca3af",
                          fontWeight: 500,
                        }}
                      >
                        {task.task_category}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#374151",
                        margin: 0,
                        lineHeight: 1.4,
                      }}
                    >
                      {task.task_description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}


// ─── Preview Step Component ────────────────────────────────────────────────


interface ExtendedTicket {
  id: string;
  name: string;
  price: number;
  quantity: number | "Unlimited" | null;
  type: "Paid" | "Free" | "Invite" | "Donations";
  startDate?: string;
  endDate?: string;
  purchaseLimit?: number;
  description?: string;
  perks?: string[];
}

interface LineUpItem {
  id: string;
  name: string;
  description: string;
  role: string;
  image?: string;
}

interface Schedule {
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
}

interface PreviewStepProps {
  eventName: string;
  eventDescription: string;
  eventType: string;
  eventImagePreview: string | null;
  additionalImages?: string[];
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  timezone: string;
  locationType: "venue" | "virtual" | "tba";
  streetAddress: string;
  address: string;
  city: string;
  state: string;
  country: string;
  meetingLink: string;
  additionalDetails: string;
  socialLinks: {
    instagram: string;
    youtube: string;
    tiktok: string;
  };
  tags: string[];
  tickets: ExtendedTicket[];
  lineupItems: LineUpItem[];
  schedules: Schedule[];
  ticketButtonText?: string;
  eventTimingType?: "single" | "recurring";
  repeatPattern?: string;
  repeatOnDays?: string[];
  repeatOnMonthDays?: string[];
  timeMode?: "single" | "multiple";
  timeSlots?: Array<{ id: string; startTime: string; endTime: string }>;
  eventId?: string;
  onBack: () => void;
  onPublish: () => void;
  isSubmitting: boolean;
}

export default function PreviewStep({
  eventName,
  eventDescription,
  eventType,
  eventImagePreview,
  additionalImages = [],
  startDate,
  startTime,
  endDate,
  endTime,
  timezone,
  locationType,
  streetAddress,
  address,
  city,
  state,
  country,
  meetingLink,
  additionalDetails,
  socialLinks,
  tags,
  tickets,
  lineupItems,
  schedules,
  ticketButtonText = "Get Ticket",
  eventTimingType = "single",
  repeatPattern = "",
  repeatOnDays = [],
  repeatOnMonthDays = [],
  timeMode = "single",
  timeSlots = [],
  eventId,
  onBack,
  onPublish,
  isSubmitting,
}: PreviewStepProps) {
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">(
    "desktop"
  );
  const [targetDate, setTargetDate] = useState<Date | undefined>(undefined);
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false);

  // Get the banner URL for background image - use additionalImages[0] if available, otherwise eventImagePreview
  const bannerUrl =
    additionalImages && additionalImages.length > 0 && additionalImages[0]
      ? additionalImages[0]
      : eventImagePreview || "/images/placeholder.jpg";

  // Debug: Check if social links exist
  const hasSocialLinks =
    (socialLinks?.instagram && socialLinks.instagram.trim()) ||
    (socialLinks?.youtube && socialLinks.youtube.trim()) ||
    (socialLinks?.tiktok && socialLinks.tiktok.trim());

  const formatTime = (time: string): string => {
    if (!time) return "";
    try {
      const [hours, minutes] = time.split(":");
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? "pm" : "am";
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes}${ampm}`;
    } catch {
      return time;
    }
  };

  const getOrdinalSuffix = (day: number): string => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  const formatDate = (
    date: string,
    time: string,
    useOrdinal: boolean = false
  ): string => {
    if (!date) return "";
    try {
      // Handle datetime-local format (YYYY-MM-DDTHH:MM)
      let dateStr = date;
      if (date.includes("T")) {
        const [datePart, timePart] = date.split("T");
        dateStr = datePart;
        if (!time && timePart) {
          time = timePart;
        }
      }

      // Combine date and time
      const dateTimeStr = time ? `${dateStr}T${time}` : `${dateStr}T00:00`;
      const dateObj = new Date(dateTimeStr);

      if (isNaN(dateObj.getTime())) {
        return date;
      }

      const month = dateObj.toLocaleString("en-US", { month: "long" });
      const day = dateObj.getDate();
      const year = dateObj.getFullYear();

      if (useOrdinal) {
        return `${month} ${day}${getOrdinalSuffix(day)}, ${year}`;
      }
      return `${month} ${day}, ${year}`;
    } catch {
      return date;
    }
  };

  const formatDateForTicket = (date: string, time: string): string => {
    if (!date) return "";
    try {
      let dateStr = date;
      if (date.includes("T")) {
        const [datePart, timePart] = date.split("T");
        dateStr = datePart;
        if (!time && timePart) {
          time = timePart;
        }
      }

      const dateTimeStr = time ? `${dateStr}T${time}` : `${dateStr}T00:00`;
      const dateObj = new Date(dateTimeStr);

      if (isNaN(dateObj.getTime())) {
        return date;
      }

      // Format as "20 Aug, 2025 12:00 PM"
      const day = dateObj.getDate();
      const month = dateObj.toLocaleString("en-US", { month: "short" });
      const year = dateObj.getFullYear();
      const formattedTime = formatTime(time);

      return `${day} ${month}, ${year} ${formattedTime}`;
    } catch {
      return date;
    }
  };

  const getLocationDisplay = (): string => {
    if (locationType === "virtual") {
      return "Virtual Event";
    } else if (locationType === "tba") {
      return "To be announced";
    } else {
      // Display only state and country
      const locationParts: string[] = [];
      if (state) locationParts.push(state);
      if (country) locationParts.push(country);
      return locationParts.length > 0
        ? locationParts.join(", ")
        : "Location TBA";
    }
  };

  const getFullAddressForMap = (): string => {
    if (locationType !== "venue") return "";

    const addressParts: string[] = [];

    // Add street address or address first
    if (streetAddress) {
      addressParts.push(streetAddress);
    } else if (address) {
      addressParts.push(address);
    }

    // Add city
    if (city) {
      addressParts.push(city);
    }

    // Add state
    if (state) {
      addressParts.push(state);
    }

    // Add country
    if (country) {
      addressParts.push(country);
    }

    return addressParts.length > 0 ? addressParts.join(", ") : "";
  };

  const getLowestTicketPrice = (): string => {
    if (tickets.length === 0) return "N/A";
    const paidTickets = tickets.filter((t) => t.type === "Paid" && t.price > 0);
    if (paidTickets.length === 0) {
      const freeTickets = tickets.filter((t) => t.type === "Free");
      if (freeTickets.length > 0) return "Free";
      return "Contact for pricing";
    }
    const prices = paidTickets.map((t) => t.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    if (minPrice === maxPrice) {
      return `₦${minPrice.toLocaleString()}`;
    }
    return `₦${minPrice.toLocaleString()}-₦${maxPrice.toLocaleString()}`;
  };

  const calculateDuration = (): string => {
    if (!startDate || !startTime || !endDate || !endTime) return "";
    try {
      let startStr = startDate;
      let endStr = endDate;
      if (startDate.includes("T")) {
        const [datePart] = startDate.split("T");
        startStr = datePart;
      }
      if (endDate.includes("T")) {
        const [datePart] = endDate.split("T");
        endStr = datePart;
      }

      const startDateTime = new Date(`${startStr}T${startTime}`);
      const endDateTime = new Date(`${endStr}T${endTime}`);

      if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        return "";
      }

      const diffMs = endDateTime.getTime() - startDateTime.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      if (diffHours > 0 && diffMinutes > 0) {
        return `${diffHours}hr ${diffMinutes}mins`;
      } else if (diffHours > 0) {
        return `${diffHours}hr`;
      } else if (diffMinutes > 0) {
        return `${diffMinutes}mins`;
      }
      return "";
    } catch {
      return "";
    }
  };

  const formatRecurringPattern = (): string => {
    if (eventTimingType !== "recurring" || !repeatPattern) return "";

    switch (repeatPattern) {
      case "daily":
        return "Daily";
      case "weekly":
        if (repeatOnDays && repeatOnDays.length > 0) {
          const dayLabels: { [key: string]: string } = {
            mo: "Monday",
            tu: "Tuesday",
            we: "Wednesday",
            th: "Thursday",
            fr: "Friday",
            sa: "Saturday",
            su: "Sunday",
          };
          const days = repeatOnDays
            .map((day) => dayLabels[day] || day)
            .join(", ");
          return `Weekly (${days})`;
        }
        return "Weekly";
      case "monthly":
        if (repeatOnMonthDays && repeatOnMonthDays.length > 0) {
          const days = repeatOnMonthDays
            .map((day) =>
              day === "last"
                ? "Last day"
                : `${day}${getOrdinalSuffix(parseInt(day))}`
            )
            .join(", ");
          return `Monthly (${days})`;
        }
        return "Monthly";
      default:
        return repeatPattern.charAt(0).toUpperCase() + repeatPattern.slice(1);
    }
  };

  // Calculate target date from startDate and startTime for display
  useEffect(() => {
    if (startDate && startTime) {
      try {
        // Handle datetime-local format
        let dateStr = startDate;
        let timeStr = startTime;
        if (startDate.includes("T")) {
          const [datePart, timePart] = startDate.split("T");
          dateStr = datePart;
          if (!timeStr && timePart) {
            timeStr = timePart;
          }
        }

        // Combine date and time, add timezone if available
        const dateTimeStr = timezone
          ? `${dateStr}T${timeStr}:00`
          : `${dateStr}T${timeStr}:00Z`;
        const target = new Date(dateTimeStr);

        if (!isNaN(target.getTime()) && target > new Date()) {
          setTargetDate(target);
          // Only start counting if event has been published (eventId exists)
          setIsCountingDown(!!eventId);
        } else {
          setTargetDate(undefined);
          setIsCountingDown(false);
        }
      } catch (error) {
        console.error("Error calculating target date:", error);
        setTargetDate(undefined);
        setIsCountingDown(false);
      }
    } else {
      setTargetDate(undefined);
      setIsCountingDown(false);
    }
  }, [startDate, startTime, timezone, eventId]);

  // Fetch existing countdown from backend only if event has been published (eventId exists)
  useEffect(() => {
    if (!eventId) {
      // Event hasn't been published yet, countdown will show but not count
      return;
    }

    const fetchCountdown = async () => {
      try {
        const response = await authenticatedRequest(
          `${API_BASE_URL}/event-countdowns/?event=${eventId}`,
          "GET"
        );
        const countdowns = Array.isArray((response as any).data)
          ? (response as any).data
          : Array.isArray(response)
          ? response
          : [];
        if (countdowns.length > 0) {
          // Take the most recent active countdown
          const activeCountdown = countdowns.find(
            (c: any) => c.is_active && new Date(c.target_date) > new Date()
          );
          if (activeCountdown) {
            const target = new Date(activeCountdown.target_date);
            setTargetDate(target);
            setIsCountingDown(true);
          }
        }
      } catch (error) {
        console.error("Error fetching countdown:", error);
      }
    };

    fetchCountdown();
  }, [eventId]);

  // Create countdown when event is published (if eventId is available)
  const sendCountdownRequest = async (eventId: string) => {
    if (
      !eventId ||
      !eventId.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      )
    ) {
      console.error("Invalid event UUID:", eventId);
      return;
    }

    let target = targetDate;
    if (!target && startDate && startTime) {
      try {
        let dateStr = startDate;
        let timeStr = startTime;
        if (startDate.includes("T")) {
          const [datePart, timePart] = startDate.split("T");
          dateStr = datePart;
          if (!timeStr && timePart) {
            timeStr = timePart;
          }
        }
        const dateTimeStr = timezone
          ? `${dateStr}T${timeStr}:00`
          : `${dateStr}T${timeStr}:00Z`;
        target = new Date(dateTimeStr);
      } catch (error) {
        console.error("Error creating target date:", error);
        return;
      }
    }

    if (!target || isNaN(target.getTime()) || target <= new Date()) {
      console.error("Invalid target date for countdown");
      return;
    }

    const countdownData = {
      event: eventId,
      target_date: target.toISOString(),
      is_active: true,
    };

    try {
      await authenticatedRequest(
        `${API_BASE_URL}/event-countdowns/`,
        "POST",
        countdownData
      );
      setTargetDate(target);
      setIsCountingDown(true);
    } catch (error) {
      console.error("Error creating countdown:", error);
    }
  };

  // Handle countdown completion
  const handleCountdownComplete = () => {
    setIsCountingDown(false);
    setTargetDate(undefined);
  };

  return (
    <div className={styles.previewStepContainer}>
      {/* Preview Header with Device Toggle */}
      <div className={styles.previewHeader}>
        <div className={styles.deviceToggle}>
          <button
            type="button"
            className={`${styles.deviceButton} ${
              previewMode === "mobile" ? styles.deviceButtonActive : ""
            }`}
            onClick={() => setPreviewMode("mobile")}
          >
            <IconDeviceMobile size={20} />
          </button>
          <button
            type="button"
            className={`${styles.deviceButton} ${
              previewMode === "desktop" ? styles.deviceButtonActive : ""
            }`}
            onClick={() => setPreviewMode("desktop")}
          >
            <IconDeviceDesktop size={20} />
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div
        className={`${styles.previewContent} ${
          previewMode === "mobile" ? styles.previewContentMobile : ""
        }`}
      >
        {/* Hero Section */}
        <div
          className={styles.previewHeroSection}
          style={{
            backgroundImage: `url(${bannerUrl})`,
          }}
        >
          {/* Static Navbar */}
          <div className={styles.previewNavbar}>
            <div className={styles.previewNavbarContainer}>
              <div className={styles.previewNavbarLogo}>
                <img
                  src="/images/Kuepass.svg"
                  alt="Kuepass"
                  className={styles.previewNavbarLogoImg}
                />
              </div>
              <nav className={styles.previewNavbarLinks}>
                <a href="#" className={styles.previewNavbarLink}>
                  How it works
                </a>
                <a href="#" className={styles.previewNavbarLink}>
                  Discover Events
                </a>
                <a href="#" className={styles.previewNavbarLink}>
                  About Us
                </a>
                <a href="#" className={styles.previewNavbarLink}>
                  Services
                </a>
              </nav>
              <div className={styles.previewNavbarActions}>
                <button
                  type="button"
                  className={styles.previewNavbarLoginButton}
                >
                  Login
                </button>
                <button
                  type="button"
                  className={styles.previewNavbarHostButton}
                >
                  Host an Event
                </button>
              </div>
            </div>
          </div>

          <div className={styles.previewHeroOverlay}>
            <div className={styles.previewHeroContent}>
              <div className={styles.previewHeroContentContainer}>
                <div className={styles.previewHeroLocation}>
                  <IconMapPin size={16} />
                  <span>{getLocationDisplay()}</span>
                </div>
                {eventType && eventType.trim() && (
                  <div className={styles.previewHeroEventType}>
                    <IconTag size={14} />
                    <span>{eventType}</span>
                  </div>
                )}
                <h1 className={styles.previewHeroTitle}>
                  {eventName || "Event Name"}
                </h1>
                <p className={styles.previewHeroDescription}>
                  {eventDescription || "Event description will appear here"}
                </p>
                <div className={styles.previewHeroActions}>
                  <button type="button" className={styles.previewTicketButton}>
                    {ticketButtonText} @ {getLowestTicketPrice()}
                  </button>
                </div>
                <div className={styles.previewHeroStats}>
                  <span>
                    View{" "}
                    {tickets.reduce((sum, t) => {
                      const qty =
                        t.quantity === "Unlimited"
                          ? 0
                          : (t.quantity as number) || 0;
                      return sum + qty;
                    }, 0)}{" "}
                    tickets sold
                  </span>
                </div>
              </div>

              <div className={styles.previewHeroContentGallery}>
                {/* Gallery Section - Display Only First Additional Image */}
                {additionalImages && additionalImages.length > 0 && (
                  <div className={styles.previewStepSection}>
                    <div className={styles.previewGalleryGrid}>
                      <div className={styles.previewGalleryItem}>
                        <img
                          src={additionalImages[0]}
                          alt="Gallery image"
                          className={styles.previewGalleryImage}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src !== "/images/placeholder.png") {
                              target.src = "/images/placeholder.png";
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.previewContentWrapper}>
          <div className={styles.previewSectionsContainer}>
            {/* About Section */}
            {eventDescription && (
              <div className={styles.previewStepSection}>
                <h2 className={styles.previewStepSectionTitle}>About</h2>
                <p className={styles.previewStepSectionText}>
                  {eventDescription}
                </p>
                {eventDescription.length > 200 && (
                  <button type="button" className={styles.readMoreLink}>
                    Read more...
                  </button>
                )}
              </div>
            )}

            {/* Tags Section */}
            {tags && tags.length > 0 && (
              <div className={styles.previewStepSection}>
                <h2 className={styles.previewStepSectionTitle}>Tags</h2>
                <div className={styles.previewTagsContainer}>
                  {tags.map((tag, index) => (
                    <span key={index} className={styles.previewTag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.previewDetailsCard}>
              <div className={styles.previewDetailsList}>
                {/* Left Column */}
                <div className={styles.previewDetailsColumn}>
                  {eventTimingType === "recurring" &&
                    formatRecurringPattern() && (
                      <div className={styles.previewDetailItem}>
                        <IconCalendar size={18} />
                        <div className={styles.previewDetailContent}>
                          <span className={styles.previewDetailLabel}>
                            Recurrence
                          </span>
                          <span className={styles.previewDetailValue}>
                            {formatRecurringPattern()}
                          </span>
                        </div>
                      </div>
                    )}
                  {startTime && endTime && calculateDuration() && (
                    <div className={styles.previewDetailItem}>
                      <IconClock size={18} />
                      <div className={styles.previewDetailContent}>
                        <span className={styles.previewDetailLabel}>
                          Duration
                        </span>
                        <span className={styles.previewDetailValue}>
                          {calculateDuration()}
                        </span>
                      </div>
                    </div>
                  )}
                  {eventType && eventType.trim() && (
                    <div className={styles.previewDetailItem}>
                      <IconTag size={18} />
                      <div className={styles.previewDetailContent}>
                        <span className={styles.previewDetailLabel}>
                          Event Type
                        </span>
                        <span className={styles.previewDetailValue}>
                          {eventType}
                        </span>
                      </div>
                    </div>
                  )}
                  {endDate && (
                    <div className={styles.previewDetailItem}>
                      <IconCalendar size={18} />
                      <div className={styles.previewDetailContent}>
                        <span className={styles.previewDetailLabel}>
                          End date
                        </span>
                        <span className={styles.previewDetailValue}>
                          {formatDate(endDate, endTime, true)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className={styles.previewDetailsColumn}>
                  {locationType === "venue" && (streetAddress || address) && (
                    <div className={styles.previewDetailItem}>
                      <IconMapPin size={18} />
                      <div className={styles.previewDetailContent}>
                        <span className={styles.previewDetailLabel}>Venue</span>
                        <span className={styles.previewDetailValue}>
                          {streetAddress || address}
                        </span>
                      </div>
                    </div>
                  )}
                  {locationType === "virtual" && meetingLink && (
                    <div className={styles.previewDetailItem}>
                      <IconLink size={18} />
                      <div className={styles.previewDetailContent}>
                        <span className={styles.previewDetailLabel}>
                          Meeting Link
                        </span>
                        <a
                          href={meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.previewDetailValue}
                          style={{
                            color: "#3b82f6",
                            textDecoration: "underline",
                            wordBreak: "break-all",
                          }}
                        >
                          {meetingLink}
                        </a>
                      </div>
                    </div>
                  )}
                  {startDate && (
                    <div className={styles.previewDetailItem}>
                      <IconCalendar size={18} />
                      <div className={styles.previewDetailContent}>
                        <span className={styles.previewDetailLabel}>
                          Start date
                        </span>
                        <span className={styles.previewDetailValue}>
                          {formatDate(startDate, startTime)}
                        </span>
                      </div>
                    </div>
                  )}
                  {tickets.length > 0 && (
                    <div className={styles.previewDetailItem}>
                      <IconCurrencyDollar size={18} />
                      <div className={styles.previewDetailContent}>
                        <span className={styles.previewDetailLabel}>Cost</span>
                        <span className={styles.previewDetailValue}>
                          {getLowestTicketPrice()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Direction Section - For Venue Events */}
            {locationType === "venue" && (streetAddress || address) && (
              <div className={styles.previewStepSection}>
                <h2 className={styles.previewStepSectionTitle}>Direction</h2>
                <div className={styles.previewMapContainer}>
                  <iframe
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(
                      getFullAddressForMap() || streetAddress || address || ""
                    )}&output=embed`}
                    width="100%"
                    height="300"
                    style={{ border: 0, borderRadius: "12px" }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            )}

            {/* Virtual Meeting Link Section - For Virtual Events */}
            {locationType === "virtual" && meetingLink && (
              <div className={styles.previewStepSection}>
                <h2 className={styles.previewStepSectionTitle}>
                  Join Virtual Event
                </h2>
                <div
                  className={styles.previewMapContainer}
                  style={{
                    backgroundColor: "#e5e7eb",
                    padding: "1.5rem",
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <IconLink size={24} style={{ color: "#3b82f6" }} />
                    <span style={{ fontWeight: 500, color: "#374151" }}>
                      Meeting Link:
                    </span>
                  </div>
                  <a
                    href={meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#3b82f6",
                      textDecoration: "underline",
                      wordBreak: "break-all",
                      fontSize: "0.95rem",
                      display: "block",
                    }}
                  >
                    {meetingLink}
                  </a>
                  <p
                    style={{
                      marginTop: "1rem",
                      fontSize: "0.875rem",
                      color: "#6b7280",
                    }}
                  >
                    Click the link above to join the virtual event at the
                    scheduled time.
                  </p>
                </div>
              </div>
            )}

            {/* Contact Us Section */}
            {hasSocialLinks && (
              <div className={styles.previewStepSection}>
                <h2 className={styles.previewStepSectionTitle}>Contact Us</h2>
                <div className={styles.previewSocialLinks}>
                  {socialLinks?.instagram && socialLinks.instagram.trim() && (
                    <a
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.previewSocialLink}
                      title="Visit our Instagram"
                    >
                      <IconBrandInstagram size={24} />
                    </a>
                  )}
                  {socialLinks?.youtube && socialLinks.youtube.trim() && (
                    <a
                      href={socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.previewSocialLink}
                      title="Visit our YouTube"
                    >
                      <IconBrandYoutube size={24} />
                    </a>
                  )}
                  {socialLinks?.tiktok && socialLinks.tiktok.trim() && (
                    <a
                      href={socialLinks.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.previewSocialLink}
                      title="Visit our TikTok"
                    >
                      <IconBrandTiktok size={24} />
                    </a>
                  )}
                </div>
              </div>
            )}

            {schedules.length > 0 && (
              <div className={styles.previewStepSection}>
                {schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className={styles.previewScheduleSection}
                  >
                    <h2 className={styles.previewStepSectionTitle}>
                      {schedule.name}
                    </h2>
                    <div className={styles.previewScheduleList}>
                      {schedule.slots.map((slot) => (
                        <div
                          key={slot.id}
                          className={styles.previewScheduleItem}
                        >
                          <div className={styles.previewScheduleTime}>
                            {formatTime(slot.startTime)} -{" "}
                            {formatTime(slot.endTime)}
                          </div>
                          <div className={styles.previewScheduleContent}>
                            <h3 className={styles.previewScheduleTitle}>
                              {slot.title}
                            </h3>
                            {slot.hostName && (
                              <button
                                type="button"
                                className={styles.previewScheduleHostButton}
                              >
                                {slot.hostName}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Line Up Section */}
            {lineupItems.length > 0 && (
              <div className={styles.previewStepSection}>
                <h2 className={styles.previewStepSectionTitle}>Line Up</h2>
                <div className={styles.previewLineupList}>
                  {lineupItems.map((item) => (
                    <div key={item.id} className={styles.previewLineupItem}>
                      <div className={styles.previewLineupImage}>
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className={styles.previewLineupImageImg}
                          />
                        ) : (
                          <div className={styles.previewLineupPlaceholder} />
                        )}
                      </div>
                      <div className={styles.previewLineupContent}>
                        <span className={styles.previewLineupRole}>
                          {item.role}
                        </span>
                        <h3 className={styles.previewLineupName}>
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className={styles.previewLineupDescription}>
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recurring Event Details Section */}
            {eventTimingType === "recurring" && (
              <div className={styles.previewStepSection}>
                <h2 className={styles.previewStepSectionTitle}>
                  Recurring Schedule
                </h2>
                <div className={styles.previewRecurringDetails}>
                  {formatRecurringPattern() && (
                    <div className={styles.previewRecurringItem}>
                      <span className={styles.previewRecurringLabel}>
                        Pattern:
                      </span>
                      <span className={styles.previewRecurringValue}>
                        {formatRecurringPattern()}
                      </span>
                    </div>
                  )}
                  {startDate && (
                    <div className={styles.previewRecurringItem}>
                      <span className={styles.previewRecurringLabel}>
                        Starts:
                      </span>
                      <span className={styles.previewRecurringValue}>
                        {formatDate(startDate, startTime)}
                      </span>
                    </div>
                  )}
                  {endDate && (
                    <div className={styles.previewRecurringItem}>
                      <span className={styles.previewRecurringLabel}>
                        Ends:
                      </span>
                      <span className={styles.previewRecurringValue}>
                        {formatDate(endDate, endTime, true)}
                      </span>
                    </div>
                  )}
                  {timeMode === "multiple" &&
                    timeSlots &&
                    timeSlots.length > 0 && (
                      <div className={styles.previewRecurringTimeSlots}>
                        <span className={styles.previewRecurringLabel}>
                          Time Slots:
                        </span>
                        <div className={styles.previewTimeSlotsList}>
                          {timeSlots.map((slot) => (
                            <div
                              key={slot.id}
                              className={styles.previewTimeSlot}
                            >
                              <span className={styles.previewTimeSlotTime}>
                                {formatTime(slot.startTime)} -{" "}
                                {formatTime(slot.endTime)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  {timeMode === "single" && startTime && endTime && (
                    <div className={styles.previewRecurringItem}>
                      <span className={styles.previewRecurringLabel}>
                        Time:
                      </span>
                      <span className={styles.previewRecurringValue}>
                        {formatTime(startTime)} - {formatTime(endTime)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Get Ticket Card */}
          <div className={styles.previewTicketCard}>
            <div className={styles.previewTicketCardDate}>
              {startDate && startTime
                ? `${formatDateForTicket(startDate, startTime)} ${
                    timezone || "WAT"
                  }`
                : "Date TBA"}
            </div>
            <div className={styles.previewTicketCardPrice}>
              {getLowestTicketPrice()}
            </div>
            <button type="button" className={styles.previewTicketCardButton}>
              {ticketButtonText}
            </button>
            {/* Countdown Timer - Display always, but only start counting after publish */}
            {targetDate && targetDate > new Date() && (
              <div className={styles.previewCountdownContainer}>
                {eventId && isCountingDown ? (
                  <CountdownTimer
                    targetDate={targetDate}
                    onComplete={handleCountdownComplete}
                    size="small"
                  />
                ) : (
                  <div className={styles.previewCountdownPlaceholder}>
                    <p className={styles.previewCountdownPlaceholderText}>
                      Countdown will start after publishing
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Section */}

      {/* Event Details Card */}

      {/* Generate Promotion Kit Section */}
      <PromotionKitSection
        eventName={eventName}
        eventDescription={eventDescription}
        eventType={eventType}
        locationType={locationType}
        address={address}
        streetAddress={streetAddress}
        city={city}
        state={state}
        country={country}
        startDate={startDate}
        startTime={startTime}
        endDate={endDate}
        endTime={endTime}
        tags={tags}
        tickets={tickets}
      />

      {/* Navigation Buttons */}
      <div className={styles.previewActions}>
        <button
          type="button"
          className={styles.backButton}
          onClick={onBack}
          disabled={isSubmitting}
        >
          Back
        </button>
        <button
          type="button"
          className={styles.publishButtonBottom}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onPublish();
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Publishing..." : "Publish Event"}
        </button>
      </div>
    </div>
  );
}
