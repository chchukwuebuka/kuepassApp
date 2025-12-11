"use client";

import React, { useState } from "react";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import styles from "./styles.module.css";

interface ButtonTextSelectorProps {
  selectedText: string;
  onTextChange: (text: string) => void;
}

const BUTTON_TEXT_OPTIONS = [
  "Get Ticket",
  "Get Access",
  "Buy Ticket",
  "Claim Ticket",
  "Reserve Ticket",
  "Book Ticket",
  "Get Pass",
  "Claim Pass",
  "Access Event",
  "Continue to Ticket",
  "Proceed to Ticket",
  "View Ticket Options",
  "Ticket Details",
  "Get Started",
  "Secure Your Spot",
  "Join the Event",
  "Unlock Access",
  "Save My Seat",
  "Enter Event",
];

export default function ButtonTextSelector({
  selectedText,
  onTextChange,
}: ButtonTextSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (text: string) => {
    onTextChange(text);
    setIsOpen(false);
  };

  return (
    <div className={styles.buttonTextSelectorContainer}>
      <label className={styles.inputLabel}>
        Button Text<span className={styles.required}>*</span>
      </label>
      <p className={styles.buttonTextSelectorDescription}>
        Choose the text that will appear on the ticket button in your event
        preview.
      </p>
      <div className={styles.buttonTextSelectorWrapper}>
        <button
          type="button"
          className={styles.buttonTextSelectorButton}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{selectedText || "Get Ticket"}</span>
          {isOpen ? <IconChevronUp size={20} /> : <IconChevronDown size={20} />}
        </button>
        {isOpen && (
          <div className={styles.buttonTextSelectorDropdown}>
            {BUTTON_TEXT_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={`${styles.buttonTextSelectorOption} ${
                  selectedText === option
                    ? styles.buttonTextSelectorOptionSelected
                    : ""
                }`}
                onClick={() => handleSelect(option)}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
