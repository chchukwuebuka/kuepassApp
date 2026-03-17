"use client";

import React, { useRef, useEffect } from "react";
import styles from "./styles.module.css";

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestion?: string | null;
  onAcceptSuggestion?: () => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  as?: "input" | "textarea";
  rows?: number;
  type?: string;
  label?: string;
  loading?: boolean;
}

export default function AutocompleteInput({
  value,
  onChange,
  suggestion,
  onAcceptSuggestion,
  placeholder,
  required,
  className,
  as = "input",
  rows,
  type = "text",
  loading,
}: AutocompleteInputProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // The ghost text is the suggestion minus any matching prefix with the user's value
  const ghostText =
    suggestion && suggestion.trim() && !value.trim()
      ? suggestion
      : suggestion &&
        suggestion.trim() &&
        value.trim() &&
        suggestion.toLowerCase().startsWith(value.toLowerCase())
      ? suggestion.slice(value.length)
      : null;

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.key === "Tab" && ghostText && onAcceptSuggestion) {
      e.preventDefault();
      onAcceptSuggestion();
    }
  };

  // Sync scroll position between input and ghost overlay
  const ghostRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = inputRef.current;
    const ghost = ghostRef.current;
    if (!el || !ghost) return;
    const syncScroll = () => {
      ghost.scrollTop = el.scrollTop;
      ghost.scrollLeft = el.scrollLeft;
    };
    el.addEventListener("scroll", syncScroll);
    return () => el.removeEventListener("scroll", syncScroll);
  }, []);

  const sharedProps = {
    ref: inputRef as any,
    value,
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => onChange(e.target.value),
    onKeyDown: handleKeyDown,
    placeholder: ghostText ? undefined : placeholder,
    required,
    className: `${styles.autocompleteField} ${className || ""}`,
  };

  return (
    <div className={`${styles.autocompleteWrapper} ${loading ? styles.autocompleteLoading : ''}`}>
      {/* Ghost text layer */}
      {ghostText && (
        <div
          ref={ghostRef}
          className={`${styles.autocompleteGhost} ${
            as === "textarea" ? styles.autocompleteGhostTextarea : ""
          }`}
          aria-hidden="true"
        >
          <span className={styles.autocompleteGhostTyped}>{value}</span>
          <span className={styles.autocompleteGhostSuggestion}>
            {ghostText}
          </span>
        </div>
      )}
      {/* Actual input */}
      {as === "textarea" ? (
        <textarea {...sharedProps} rows={rows} />
      ) : (
        <input {...sharedProps} type={type} />
      )}
      {/* Tab hint */}
      {ghostText && (
        <span className={styles.autocompleteHint}>Tab ↹ to accept</span>
      )}
    </div>
  );
}
