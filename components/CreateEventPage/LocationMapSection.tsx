"use client";

import React from "react";
import { IconCalendar } from "@tabler/icons-react";
import styles from "./styles.module.css";
import AutocompleteInput from "./AutocompleteInput";

interface LocationMapSectionProps {
  address?: string;
  streetAddress?: string;
  landmark?: string;
  additionalDetails: string;
  onLandmarkChange?: (value: string) => void;
  onAdditionalDetailsChange: (value: string) => void;
  landmarkSuggestion?: string | null;
  additionalDetailsSuggestion?: string | null;
  onAcceptLandmarkSuggestion?: () => void;
  onAcceptAdditionalDetailsSuggestion?: () => void;
}

export default function LocationMapSection({
  address,
  streetAddress,
  landmark,
  additionalDetails,
  onLandmarkChange,
  onAdditionalDetailsChange,
  landmarkSuggestion,
  additionalDetailsSuggestion,
  onAcceptLandmarkSuggestion,
  onAcceptAdditionalDetailsSuggestion,
}: LocationMapSectionProps) {
  return (
    <>
      {/* Landmark Field */}
      {onLandmarkChange && (
        <div className={styles.inputWrapper}>
          <label className={styles.inputLabel}>
            Landmark
          </label>
          <AutocompleteInput
            placeholder="Enter landmark (e.g., near the main gate, opposite the mall)"
            value={landmark || ""}
            onChange={(val) => onLandmarkChange(val)}
            suggestion={landmarkSuggestion || null}
            onAcceptSuggestion={onAcceptLandmarkSuggestion}
            className={styles.input}
          />
        </div>
      )}

      {/* Additional Details */}
      <div className={styles.inputWrapper}>
        <label className={styles.inputLabel}>
          Additional details
        </label>
        <AutocompleteInput
          placeholder="Enter additional details"
          value={additionalDetails}
          onChange={(val) => onAdditionalDetailsChange(val)}
          suggestion={additionalDetailsSuggestion || null}
          onAcceptSuggestion={onAcceptAdditionalDetailsSuggestion}
          className={styles.input}
        />
      </div>

      {/* Map Component */}
      {(streetAddress || address) && (
        <div className={styles.mapContainer}>
          <div className={styles.mapWrapper}>
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(
                streetAddress || address
              )}&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0, borderRadius: "8px" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className={styles.mapIframe}
            />
          </div>
        </div>
      )}
    </>
  );
}
