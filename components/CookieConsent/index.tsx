"use client";

import React, { useState, useEffect, useCallback } from "react";
import styles from "./styles.module.css";

type CookieCategory = "essential" | "functional" | "analytics";

interface CookiePreferences {
  essential: boolean; // Always true — cannot be disabled
  functional: boolean;
  analytics: boolean;
}

const COOKIE_CONSENT_KEY = "kuepass_cookie_consent";
const COOKIE_PREFS_KEY = "kuepass_cookie_preferences";

const defaultPreferences: CookiePreferences = {
  essential: true,
  functional: false,
  analytics: false,
};

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] =
    useState<CookiePreferences>(defaultPreferences);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay so it doesn't flash on page load
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = useCallback(() => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsAnimatingOut(false);
    }, 400);
  }, []);

  const saveConsent = useCallback(
    (prefs: CookiePreferences) => {
      localStorage.setItem(COOKIE_CONSENT_KEY, "true");
      localStorage.setItem(COOKIE_PREFS_KEY, JSON.stringify(prefs));
      handleDismiss();
    },
    [handleDismiss]
  );

  const handleAcceptAll = useCallback(() => {
    saveConsent({ essential: true, functional: true, analytics: true });
  }, [saveConsent]);

  const handleRejectNonEssential = useCallback(() => {
    saveConsent({ essential: true, functional: false, analytics: false });
  }, [saveConsent]);

  const handleSavePreferences = useCallback(() => {
    saveConsent(preferences);
  }, [saveConsent, preferences]);

  const toggleCategory = useCallback((category: CookieCategory) => {
    if (category === "essential") return; // Cannot disable essential cookies
    setPreferences((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`${styles.overlay} ${isAnimatingOut ? styles.overlayOut : ""}`}
    >
      <div
        className={`${styles.banner} ${isAnimatingOut ? styles.bannerOut : ""}`}
      >
        {/* Shield Icon */}
        <div className={styles.iconRow}>
          <div className={styles.shieldIcon}>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <span className={styles.iconLabel}>Privacy & Cookies</span>
        </div>

        {/* Main Content */}
        <h3 className={styles.title}>We value your privacy</h3>
        <p className={styles.description}>
          Kuepass uses cookies to keep your session secure, personalize your
          experience, and improve our platform. You can customize your
          preferences below.
        </p>

        {/* Category Toggles (expanded view) */}
        {showPreferences && (
          <div className={styles.categoriesWrapper}>
            {/* Essential */}
            <div className={styles.categoryRow}>
              <div className={styles.categoryInfo}>
                <span className={styles.categoryName}>Essential</span>
                <span className={styles.categoryDesc}>
                  Session management, CSRF protection &amp; security. Required
                  for the platform to function.
                </span>
              </div>
              <button
                className={`${styles.toggle} ${styles.toggleOn} ${styles.toggleDisabled}`}
                disabled
                aria-label="Essential cookies — always on"
              >
                <span className={styles.toggleKnob} />
              </button>
            </div>

            {/* Functional */}
            <div className={styles.categoryRow}>
              <div className={styles.categoryInfo}>
                <span className={styles.categoryName}>Functional</span>
                <span className={styles.categoryDesc}>
                  Remembers your preferences, language, and display settings
                  across sessions.
                </span>
              </div>
              <button
                className={`${styles.toggle} ${
                  preferences.functional ? styles.toggleOn : ""
                }`}
                onClick={() => toggleCategory("functional")}
                aria-label={`Functional cookies — ${
                  preferences.functional ? "on" : "off"
                }`}
              >
                <span className={styles.toggleKnob} />
              </button>
            </div>

            {/* Analytics */}
            <div className={styles.categoryRow}>
              <div className={styles.categoryInfo}>
                <span className={styles.categoryName}>Analytics</span>
                <span className={styles.categoryDesc}>
                  Helps us understand event traffic patterns and improve
                  check-in performance.
                </span>
              </div>
              <button
                className={`${styles.toggle} ${
                  preferences.analytics ? styles.toggleOn : ""
                }`}
                onClick={() => toggleCategory("analytics")}
                aria-label={`Analytics cookies — ${
                  preferences.analytics ? "on" : "off"
                }`}
              >
                <span className={styles.toggleKnob} />
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className={styles.actions}>
          {!showPreferences ? (
            <>
              <button
                className={styles.btnAccept}
                onClick={handleAcceptAll}
                id="cookie-accept-all"
              >
                Accept All
              </button>
              <button
                className={styles.btnReject}
                onClick={handleRejectNonEssential}
                id="cookie-reject-non-essential"
              >
                Reject Non-Essential
              </button>
              <button
                className={styles.btnCustomize}
                onClick={() => setShowPreferences(true)}
                id="cookie-customize"
              >
                Customize
              </button>
            </>
          ) : (
            <>
              <button
                className={styles.btnAccept}
                onClick={handleSavePreferences}
                id="cookie-save-preferences"
              >
                Save Preferences
              </button>
              <button
                className={styles.btnReject}
                onClick={() => setShowPreferences(false)}
                id="cookie-back"
              >
                Back
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
