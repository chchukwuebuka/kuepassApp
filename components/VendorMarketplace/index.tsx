"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";
import styles from "./styles.module.css";
import VendorCard from "./VendorCard";
import VendorDetailModal from "./VendorDetailModal";
import type { VendorData } from "./VendorCard";
import { authenticatedRequest } from "@/app/services/auth";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.kuepass.com/api/"
).replace(/\/$/, "");

const SERVICE_CATEGORIES = [
  "All",
  "Catering",
  "DJ",
  "Photography",
  "Venue",
  "Security",
  "MC",
  "Decor",
  "Cake",
  "Makeup",
  "Hotel",
  "Logistics",
  "Conference",
  "Media",
  "Event Planning",
];

const VendorMarketplace: React.FC = () => {
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedVendor, setSelectedVendor] = useState<VendorData | null>(null);

  // Fetch vendors from API
  const fetchVendors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authenticatedRequest<any>(
        `${API_BASE_URL}/vendors/`,
        "GET"
      );
      // Handle various response shapes
      let vendorList: VendorData[] = [];
      if (Array.isArray(response)) {
        vendorList = response;
      } else if (Array.isArray(response?.data)) {
        vendorList = response.data;
      } else if (Array.isArray(response?.results)) {
        vendorList = response.results;
      }
      setVendors(vendorList);
    } catch (err: any) {
      console.error("Failed to fetch vendors:", err);
      setError(err.message || "Could not load vendors.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // Filter vendors
  const filteredVendors = useMemo(() => {
    let result = vendors;

    // Category filter
    if (activeCategory !== "All") {
      result = result.filter((v) =>
        v.services?.some(
          (s) => s.service_type.toLowerCase() === activeCategory.toLowerCase()
        )
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.business_name.toLowerCase().includes(q) ||
          v.location_text.toLowerCase().includes(q) ||
          v.services?.some((s) => s.service_type.toLowerCase().includes(q))
      );
    }

    return result;
  }, [vendors, activeCategory, searchQuery]);

  return (
    <div className={styles.marketplace}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.title}>
              <span className={styles.titleAccent}>Vendor</span> Hub
            </h1>
            <p className={styles.subtitle}>
              Discover and connect with trusted vendors for your events
            </p>
          </div>
          <div className={styles.searchWrapper}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search vendors by name, location, or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className={styles.filterTabs}>
          {SERVICE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`${styles.filterTab} ${
                activeCategory === cat ? styles.filterTabActive : ""
              }`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results info */}
      {!loading && !error && (
        <div className={styles.resultsInfo}>
          <span className={styles.resultsCount}>
            Showing{" "}
            <span className={styles.resultsCountBold}>
              {filteredVendors.length}
            </span>{" "}
            vendor{filteredVendors.length !== 1 ? "s" : ""}
            {activeCategory !== "All" && ` in ${activeCategory}`}
          </span>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className={styles.loadingGrid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonLine} />
              <div className={styles.skeletonLine} />
              <div className={styles.skeletonLine} />
              <div className={styles.skeletonLine} />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⚠️</div>
          <h3 className={styles.emptyTitle}>Something went wrong</h3>
          <p className={styles.emptyText}>{error}</p>
          <button
            className={styles.btnPrimary}
            style={{ marginTop: 16, padding: "12px 28px" }}
            onClick={fetchVendors}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filteredVendors.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🔍</div>
          <h3 className={styles.emptyTitle}>No vendors found</h3>
          <p className={styles.emptyText}>
            {searchQuery
              ? "Try adjusting your search or filters."
              : "No vendors are available in this category yet."}
          </p>
        </div>
      )}

      {/* Vendor grid */}
      {!loading && !error && filteredVendors.length > 0 && (
        <div className={styles.vendorGrid}>
          {filteredVendors.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              onViewDetails={setSelectedVendor}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedVendor && (
        <VendorDetailModal
          vendor={selectedVendor}
          onClose={() => setSelectedVendor(null)}
        />
      )}
    </div>
  );
};

export default VendorMarketplace;
