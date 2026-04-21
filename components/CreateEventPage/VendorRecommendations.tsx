"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaMapMarkerAlt,
  FaStar,
  FaRegStar,
  FaPhone,
  FaRobot,
  FaChevronDown,
  FaChevronUp,
  FaExternalLinkAlt,
  FaCheck,
} from "react-icons/fa";
import styles from "./styles.module.css";
import { authenticatedRequest } from "@/app/services/auth";
import { useRouter } from "next/navigation";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.kuepass.com/api/"
).replace(/\/$/, "");

interface VendorServiceData {
  id?: string;
  service_type: string;
  price_min: number;
  price_max: number;
}

interface VendorData {
  id: number | string;
  business_name: string;
  bio?: string;
  location_text: string;
  phone_number?: string;
  average_rating: number;
  is_verified: boolean;
  services: VendorServiceData[];
}

interface VendorRecommendationsProps {
  eventType: string;
  eventLocation?: string;
  guestCount?: string;
  onVendorsSelected?: (vendorIds: (number | string)[]) => void;
}

function renderStars(rating: number) {
  const stars = [];
  const rounded = Math.round(rating);
  for (let i = 1; i <= 5; i++) {
    stars.push(
      i <= rounded ? (
        <FaStar key={i} className={styles.vrStarFilled} />
      ) : (
        <FaRegStar key={i} className={styles.vrStarEmpty} />
      )
    );
  }
  return stars;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function VendorRecommendations({
  eventType,
  eventLocation,
  guestCount,
  onVendorsSelected,
}: VendorRecommendationsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState("");
  const [recommendedServices, setRecommendedServices] = useState<string[]>([]);
  const [vendorsByCategory, setVendorsByCategory] = useState<
    Record<string, VendorData[]>
  >({});
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [selectedVendorIds, setSelectedVendorIds] = useState<Set<number | string>>(
    new Set()
  );
  const [hasFetched, setHasFetched] = useState(false);
  const [lastEventType, setLastEventType] = useState("");

  const fetchRecommendations = useCallback(async () => {
    if (!eventType) return;

    setLoading(true);
    setError(null);
    try {
      const response = await authenticatedRequest<any>(
        `${API_BASE_URL}/ai/recommend-vendors/`,
        "POST",
        {
          event_type: eventType,
          location: eventLocation || "",
          guest_count: guestCount || "",
        }
      );

      setRecommendedServices(response.recommended_services || []);
      setSummary(response.summary || "");
      setVendorsByCategory(response.vendors_by_category || {});
      setHasFetched(true);
      setLastEventType(eventType);

      // Auto-expand first category
      if (response.recommended_services?.length > 0) {
        setExpandedCategories(new Set([response.recommended_services[0]]));
      }
    } catch (err: any) {
      console.error("Failed to fetch vendor recommendations:", err);
      setError(err.message || "Could not load recommendations.");
    } finally {
      setLoading(false);
    }
  }, [eventType, eventLocation, guestCount]);

  // Auto-fetch when event type changes
  useEffect(() => {
    if (eventType && eventType !== lastEventType) {
      fetchRecommendations();
    }
  }, [eventType, lastEventType, fetchRecommendations]);

  // Notify parent when selections change
  useEffect(() => {
    if (onVendorsSelected) {
      onVendorsSelected(Array.from(selectedVendorIds));
    }
  }, [selectedVendorIds, onVendorsSelected]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const toggleVendorSelection = (vendorId: number | string) => {
    setSelectedVendorIds((prev) => {
      const next = new Set(prev);
      if (next.has(vendorId)) next.delete(vendorId);
      else next.add(vendorId);
      return next;
    });
  };

  // Don't render if no event type selected
  if (!eventType) return null;

  return (
    <div className={styles.vrContainer}>
      {/* Header */}
      <div className={styles.vrHeader}>
        <div className={styles.vrHeaderIcon}>
          <FaRobot />
        </div>
        <div>
          <h3 className={styles.vrTitle}>
            AI-Suggested Vendors for Your {eventType}
          </h3>
          <p className={styles.vrSubtitle}>
            Select the vendors you&apos;d like to work with — they&apos;ll be saved with your event
          </p>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className={styles.vrLoading}>
          <div className={styles.vrTypingIndicator}>
            <span />
            <span />
            <span />
          </div>
          <p>AI is analyzing your event needs...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className={styles.vrError}>
          <p>{error}</p>
          <button className={styles.vrRetryBtn} onClick={fetchRecommendations}>
            Try Again
          </button>
        </div>
      )}

      {/* Results */}
      {hasFetched && !loading && !error && (
        <>
          {/* AI Summary */}
          {summary && (
            <div className={styles.vrSummary}>
              <p>{summary}</p>
            </div>
          )}

          {/* Selected count */}
          {selectedVendorIds.size > 0 && (
            <div className={styles.vrSelectedCount}>
              <FaCheck /> {selectedVendorIds.size} vendor{selectedVendorIds.size > 1 ? "s" : ""} selected — will be saved when you publish
            </div>
          )}

          {/* Service Categories */}
          <div className={styles.vrCategories}>
            {recommendedServices.map((service) => {
              const vendors = vendorsByCategory[service] || [];
              const isExpanded = expandedCategories.has(service);

              return (
                <div key={service} className={styles.vrCategoryCard}>
                  <button
                    type="button"
                    className={styles.vrCategoryHeader}
                    onClick={() => toggleCategory(service)}
                  >
                    <div className={styles.vrCategoryInfo}>
                      <span className={styles.vrCategoryName}>{service}</span>
                      <span className={styles.vrCategoryCount}>
                        {vendors.length > 0
                          ? `${vendors.length} vendor${vendors.length > 1 ? "s" : ""} found`
                          : "No vendors yet"}
                      </span>
                    </div>
                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                  </button>

                  {isExpanded && (
                    <div className={styles.vrCategoryBody}>
                      {vendors.length === 0 ? (
                        <p className={styles.vrNoVendors}>
                          No {service.toLowerCase()} vendors available in your
                          area yet. Check back later or browse the Vendor Hub.
                        </p>
                      ) : (
                        <div className={styles.vrVendorList}>
                          {vendors.map((vendor) => {
                            const isSelected = selectedVendorIds.has(vendor.id);
                            return (
                              <div
                                key={vendor.id}
                                className={`${styles.vrVendorCard} ${isSelected ? styles.vrVendorCardSelected : ""}`}
                                onClick={() => toggleVendorSelection(vendor.id)}
                                role="button"
                                tabIndex={0}
                              >
                                {/* Selection checkbox */}
                                <div className={`${styles.vrCheckbox} ${isSelected ? styles.vrCheckboxChecked : ""}`}>
                                  {isSelected && <FaCheck />}
                                </div>
                                <div className={styles.vrVendorAvatar}>
                                  {getInitials(vendor.business_name)}
                                </div>
                                <div className={styles.vrVendorInfo}>
                                  <p className={styles.vrVendorName}>
                                    {vendor.business_name}
                                    {vendor.is_verified && (
                                      <FaCheckCircle
                                        className={styles.vrVerifiedBadge}
                                      />
                                    )}
                                  </p>
                                  <p className={styles.vrVendorLocation}>
                                    <FaMapMarkerAlt /> {vendor.location_text}
                                  </p>
                                  <div className={styles.vrVendorRating}>
                                    {renderStars(vendor.average_rating)}
                                    <span>{vendor.average_rating.toFixed(1)}</span>
                                  </div>
                                </div>
                                {vendor.phone_number && (
                                  <a
                                    href={`tel:${vendor.phone_number}`}
                                    className={styles.vrCallBtn}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <FaPhone /> Call
                                  </a>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Browse Vendor Hub link */}
          <div className={styles.vrFooter}>
            <p className={styles.vrFooterText}>
              Want to explore more options?
            </p>
            <button
              type="button"
              className={styles.vrBrowseBtn}
              onClick={() => {
                router.push("/dashboard?page=vendorMarketplace");
              }}
            >
              <FaExternalLinkAlt /> Browse Vendor Hub
            </button>
          </div>
        </>
      )}
    </div>
  );
}
