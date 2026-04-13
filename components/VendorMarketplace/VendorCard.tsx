"use client";

import React from "react";
import { FaMapMarkerAlt, FaStar, FaRegStar, FaCheckCircle } from "react-icons/fa";
import styles from "./styles.module.css";

export interface VendorServiceData {
  id?: string;
  service_type: string;
  price_min: number;
  price_max: number;
}

export interface VendorData {
  id: number | string;
  business_name: string;
  bio?: string;
  location_text: string;
  phone_number?: string;
  website?: string;
  average_rating: number;
  is_verified: boolean;
  services: VendorServiceData[];
  user?: any;
}

interface VendorCardProps {
  vendor: VendorData;
  onViewDetails: (vendor: VendorData) => void;
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

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatPrice(min: number, max: number): string {
  const fmt = (n: number) =>
    n >= 1000 ? `₦${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `₦${n.toLocaleString()}`;
  if (min === max) return fmt(min);
  return `${fmt(min)} – ${fmt(max)}`;
}

const VendorCard: React.FC<VendorCardProps> = ({ vendor, onViewDetails }) => {
  // Derive lowest-highest price across all services
  const allMin = vendor.services.length
    ? Math.min(...vendor.services.map((s) => s.price_min))
    : 0;
  const allMax = vendor.services.length
    ? Math.max(...vendor.services.map((s) => s.price_max))
    : 0;

  return (
    <div className={styles.vendorCard} onClick={() => onViewDetails(vendor)}>
      {/* Top row: avatar + info */}
      <div className={styles.cardTop}>
        <div className={styles.avatarWrapper}>{getInitials(vendor.business_name)}</div>
        <div className={styles.cardInfo}>
          <p className={styles.businessName}>
            {vendor.business_name}
            {vendor.is_verified && <FaCheckCircle className={styles.verifiedBadge} />}
          </p>
          <p className={styles.location}>
            <FaMapMarkerAlt /> {vendor.location_text}
          </p>
          <div className={styles.ratingRow}>
            <div className={styles.stars}>{renderStars(vendor.average_rating)}</div>
            <span className={styles.ratingValue}>{vendor.average_rating.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Service chips */}
      <div className={styles.serviceChips}>
        {vendor.services.map((s, i) => (
          <span key={i} className={styles.serviceChip}>
            {s.service_type}
          </span>
        ))}
      </div>

      {/* Price range */}
      {vendor.services.length > 0 && (
        <div className={styles.priceRange}>
          Starting from <span className={styles.priceValue}>{formatPrice(allMin, allMax)}</span>
        </div>
      )}

      {/* Actions */}
      <div className={styles.cardActions}>
        <button
          className={styles.btnPrimary}
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(vendor);
          }}
        >
          View Details
        </button>
        {vendor.phone_number && (
          <button
            className={styles.btnSecondary}
            onClick={(e) => {
              e.stopPropagation();
              window.open(`tel:${vendor.phone_number}`, "_self");
            }}
          >
            Call
          </button>
        )}
      </div>
    </div>
  );
};

export default VendorCard;
