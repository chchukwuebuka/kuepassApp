"use client";

import React, { useEffect } from "react";
import {
  FaCheckCircle,
  FaMapMarkerAlt,
  FaStar,
  FaRegStar,
  FaPhone,
  FaTimes,
} from "react-icons/fa";
import styles from "./styles.module.css";
import type { VendorData } from "./VendorCard";

interface VendorDetailModalProps {
  vendor: VendorData;
  onClose: () => void;
}

function renderStars(rating: number) {
  const stars = [];
  const rounded = Math.round(rating);
  for (let i = 1; i <= 5; i++) {
    stars.push(
      i <= rounded ? (
        <FaStar key={i} className={styles.starFilled} />
      ) : (
        <FaRegStar key={i} className={styles.starEmpty} />
      )
    );
  }
  return stars;
}

const VendorDetailModal: React.FC<VendorDetailModalProps> = ({ vendor, onClose }) => {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div>
            <p className={styles.businessName} style={{ fontSize: "1.25rem" }}>
              {vendor.business_name}
              {vendor.is_verified && <FaCheckCircle className={styles.verifiedBadge} />}
            </p>
            <p className={styles.location}>
              <FaMapMarkerAlt /> {vendor.location_text}
            </p>
            <div className={styles.ratingRow} style={{ marginTop: 6 }}>
              <div className={styles.stars}>{renderStars(vendor.average_rating)}</div>
              <span className={styles.ratingValue}>{vendor.average_rating.toFixed(1)}</span>
            </div>
          </div>
          <button className={styles.modalCloseBtn} onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          {/* Bio */}
          {vendor.bio && (
            <div className={styles.modalSection}>
              <h4 className={styles.modalSectionTitle}>About</h4>
              <p className={styles.modalBio}>{vendor.bio}</p>
            </div>
          )}

          {/* Services */}
          {vendor.services.length > 0 && (
            <div className={styles.modalSection}>
              <h4 className={styles.modalSectionTitle}>Services & Pricing</h4>
              <div className={styles.modalServiceList}>
                {vendor.services.map((s, i) => (
                  <div key={i} className={styles.modalServiceItem}>
                    <span className={styles.modalServiceType}>{s.service_type}</span>
                    <span className={styles.modalServicePrice}>
                      ₦{s.price_min.toLocaleString()} – ₦{s.price_max.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact */}
          <div className={styles.modalSection}>
            <h4 className={styles.modalSectionTitle}>Contact</h4>
            {vendor.phone_number ? (
              <div className={styles.modalContactRow}>
                <FaPhone className={styles.modalContactIcon} />
                <a href={`tel:${vendor.phone_number}`} style={{ color: "inherit", textDecoration: "none" }}>
                  {vendor.phone_number}
                </a>
              </div>
            ) : (
              <p style={{ fontSize: "0.88rem", color: "#6b7280" }}>No contact information available.</p>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className={styles.modalActions}>
          {vendor.phone_number && (
            <button
              className={styles.btnPrimary}
              style={{ flex: 1 }}
              onClick={() => window.open(`tel:${vendor.phone_number}`, "_self")}
            >
              Call Vendor
            </button>
          )}
          <button
            className={styles.btnSecondary}
            style={{ flex: vendor.phone_number ? 0 : 1 }}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorDetailModal;
