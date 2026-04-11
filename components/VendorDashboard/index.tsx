"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  FaPlus, FaTrash, FaCheckCircle, FaClock, FaStore, 
  FaStar, FaCloudUploadAlt, FaTimes, 
  FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaGlobe 
} from "react-icons/fa";
import styles from "./styles.module.css";
import { authenticatedRequest, getAuthToken } from "@/app/services/auth";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.kuepass.com/api/"
).replace(/\/$/, "");

// Service type choices matching backend
const SERVICE_TYPES = [
  "Catering", "DJ", "Photography", "Venue", "Security",
  "MC", "Decor", "Cake", "Makeup", "Hotel",
  "Logistics", "Conference", "Media", "Event Planning",
];

type TabKey = "overview" | "services" | "packages" | "settings";

interface VendorProfile {
  id?: number;
  business_name: string;
  bio: string;
  location_text: string;
  phone_number: string;
  cover_image_url: string;
  logo_url: string;
  website: string;
  email: string;
  average_rating: number;
  is_verified: boolean;
  services: VendorServiceItem[];
  packages: VendorPackageItem[];
}

interface VendorServiceItem {
  id: number;
  service_type: string;
  price_min: number;
  price_max: number;
  availability: any;
}

interface VendorPackageItem {
  id: string;
  name: string;
  description: string;
  price: number;
  service: number | null;
  is_active: boolean;
}

interface DashboardStats {
  business_name: string;
  is_verified: boolean;
  average_rating: number;
  total_services: number;
  total_packages: number;
  member_since: string;
}

// ——— Reusable Image Uploader ———
interface ImageUploaderProps {
  label: string;
  currentUrl: string;
  onUploaded: (url: string) => void;
  onRemove: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ label, currentUrl, onUploaded, onRemove }) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/upload-image/`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: formData,
      });

      const result = await res.json();
      if (result.success && result.data?.url) {
        onUploaded(result.data.url);
      } else {
        alert(result.message || "Upload failed.");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      alert("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // Reset input so same file can be re-selected
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) uploadFile(file);
  };

  return (
    <div className={styles.imageUploadGroup}>
      <label>{label}</label>
      <div
        className={`${styles.uploadZone} ${dragOver ? styles.uploadZoneDragOver : ""} ${currentUrl ? styles.uploadZoneHasImage : ""}`}
        onClick={() => !currentUrl && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {uploading && (
          <div className={styles.uploadingOverlay}>
            <div className={styles.spinner} />
            <span className={styles.uploadingText}>Uploading...</span>
          </div>
        )}

        {currentUrl ? (
          <div className={styles.previewWrapper}>
            <img src={currentUrl} alt={label} className={styles.previewImg} />
            <button
              type="button"
              className={styles.removeImgBtn}
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              title="Remove image"
            >
              <FaTimes />
            </button>
          </div>
        ) : (
          <>
            <FaCloudUploadAlt className={styles.uploadIcon} />
            <p className={styles.uploadText}>Click or drag image here</p>
            <p className={styles.uploadHint}>JPG, PNG up to 5MB</p>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className={styles.hiddenInput}
          onChange={handleFileSelect}
        />
      </div>
    </div>
  );
};


// ——— Main VendorDashboard ———
const VendorDashboard: React.FC = () => {
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  // Onboarding form
  const [onboardForm, setOnboardForm] = useState({
    business_name: "",
    bio: "",
    location_text: "",
    phone_number: "",
    email: "",
    website: "",
    cover_image_url: "",
    logo_url: "",
  });
  const [onboardLoading, setOnboardLoading] = useState(false);
  const [onboardError, setOnboardError] = useState("");

  // Service form
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    service_type: "Catering",
    price_min: "",
    price_max: "",
  });

  const [showPackageForm, setShowPackageForm] = useState(false);
  const [packageForm, setPackageForm] = useState({
    name: "",
    description: "",
    image_url: "",
    price: "",
    service: "",
  });

  // Settings form
  const [settingsForm, setSettingsForm] = useState({
    business_name: "",
    bio: "",
    location_text: "",
    phone_number: "",
    email: "",
    website: "",
    cover_image_url: "",
    logo_url: "",
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState("");

  // ——— Load vendor profile ———
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await authenticatedRequest<VendorProfile>(
        `${API_BASE_URL}/vendor/profile/`,
        "GET"
      );
      setProfile(data);
      setNeedsOnboarding(false);

      // Populate settings form
      setSettingsForm({
        business_name: data.business_name || "",
        bio: data.bio || "",
        location_text: data.location_text || "",
        phone_number: data.phone_number || "",
        email: data.email || "",
        website: data.website || "",
        cover_image_url: data.cover_image_url || "",
        logo_url: data.logo_url || "",
      });
    } catch (err: any) {
      if (err?.status === 404) {
        setNeedsOnboarding(true);
      } else {
        console.error("Failed to fetch vendor profile:", err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await authenticatedRequest<DashboardStats>(
        `${API_BASE_URL}/vendor/dashboard-stats/`,
        "GET"
      );
      setStats(data);
    } catch {
      // Stats are secondary, don't block UI
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (!needsOnboarding && profile) {
      fetchStats();
    }
  }, [needsOnboarding, profile, fetchStats]);

  // ——— Onboarding submit ———
  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setOnboardLoading(true);
    setOnboardError("");

    try {
      await authenticatedRequest(
        `${API_BASE_URL}/vendor/profile/`,
        "POST",
        onboardForm as any
      );
      await fetchProfile();
    } catch (err: any) {
      setOnboardError(err?.message || "Failed to create vendor profile.");
    } finally {
      setOnboardLoading(false);
    }
  };

  // ——— Service CRUD ———
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authenticatedRequest(
        `${API_BASE_URL}/vendor/services/`,
        "POST",
        {
          service_type: serviceForm.service_type,
          price_min: parseInt(serviceForm.price_min) || 0,
          price_max: parseInt(serviceForm.price_max) || 0,
        } as any
      );
      setShowServiceForm(false);
      setServiceForm({ service_type: "Catering", price_min: "", price_max: "" });
      fetchProfile();
      fetchStats();
    } catch (err: any) {
      alert(err?.message || "Failed to add service.");
    }
  };

  const handleDeleteService = async (id: number) => {
    if (!confirm("Remove this service?")) return;
    try {
      await authenticatedRequest(`${API_BASE_URL}/vendor/services/${id}/`, "DELETE");
      fetchProfile();
      fetchStats();
    } catch (err: any) {
      alert(err?.message || "Failed to delete service.");
    }
  };

  // ——— Package CRUD ———
  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authenticatedRequest(
        `${API_BASE_URL}/vendor/packages/`,
        "POST",
        {
          name: packageForm.name,
          description: packageForm.description,
          image_url: packageForm.image_url,
          price: parseFloat(packageForm.price) || 0,
          service: packageForm.service ? parseInt(packageForm.service) : null,
        } as any
      );
      setShowPackageForm(false);
      setPackageForm({ name: "", description: "", image_url: "", price: "", service: "" });
      fetchProfile();
      fetchStats();
    } catch (err: any) {
      alert(err?.message || "Failed to add package.");
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm("Remove this package?")) return;
    try {
      await authenticatedRequest(`${API_BASE_URL}/vendor/packages/${id}/`, "DELETE");
      fetchProfile();
      fetchStats();
    } catch (err: any) {
      alert(err?.message || "Failed to delete package.");
    }
  };

  // ——— Settings update ———
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsMsg("");
    try {
      await authenticatedRequest(
        `${API_BASE_URL}/vendor/profile/`,
        "PATCH",
        settingsForm as any
      );
      setSettingsMsg("Profile updated successfully!");
      fetchProfile();
    } catch (err: any) {
      setSettingsMsg(err?.message || "Failed to update profile.");
    } finally {
      setSettingsSaving(false);
    }
  };

  // ——— Loading state ———
  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner} />
      </div>
    );
  }

  // ——— Onboarding flow ———
  if (needsOnboarding) {
    return (
      <div className={styles.container}>
        <div className={styles.onboardingWrapper}>
          <div className={styles.onboardingCard}>
            <h2>🏪 Become a Vendor</h2>
            <p>Set up your vendor profile so event organizers can discover and hire you.</p>

            {onboardError && <div className={styles.errorMsg}>{onboardError}</div>}

            <form onSubmit={handleOnboard}>
              <div className={styles.formGroup}>
                <label>Business Name *</label>
                <input
                  type="text"
                  value={onboardForm.business_name}
                  onChange={(e) => setOnboardForm(f => ({ ...f, business_name: e.target.value }))}
                  placeholder="e.g., Stellar Catering Lagos"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Location *</label>
                <input
                  type="text"
                  value={onboardForm.location_text}
                  onChange={(e) => setOnboardForm(f => ({ ...f, location_text: e.target.value }))}
                  placeholder="e.g., Lagos, Nigeria"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Bio / Description</label>
                <textarea
                  value={onboardForm.bio}
                  onChange={(e) => setOnboardForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder="Tell event organizers about your business, experience, and what makes you stand out..."
                />
              </div>

              {/* Image Uploads */}
              <div className={styles.imageUploadRow}>
                <ImageUploader
                  label="Business Logo"
                  currentUrl={onboardForm.logo_url}
                  onUploaded={(url) => setOnboardForm(f => ({ ...f, logo_url: url }))}
                  onRemove={() => setOnboardForm(f => ({ ...f, logo_url: "" }))}
                />
                <ImageUploader
                  label="Cover / Banner Image"
                  currentUrl={onboardForm.cover_image_url}
                  onUploaded={(url) => setOnboardForm(f => ({ ...f, cover_image_url: url }))}
                  onRemove={() => setOnboardForm(f => ({ ...f, cover_image_url: "" }))}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={onboardForm.phone_number}
                    onChange={(e) => setOnboardForm(f => ({ ...f, phone_number: e.target.value }))}
                    placeholder="+2348012345678"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Business Email</label>
                  <input
                    type="email"
                    value={onboardForm.email}
                    onChange={(e) => setOnboardForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="contact@yourbusiness.com"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Website (optional)</label>
                <input
                  type="url"
                  value={onboardForm.website}
                  onChange={(e) => setOnboardForm(f => ({ ...f, website: e.target.value }))}
                  placeholder="https://yourbusiness.com"
                />
              </div>

              <button type="submit" className={styles.btnPrimary} disabled={onboardLoading}>
                <FaStore /> {onboardLoading ? "Creating..." : "Create Vendor Profile"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ——— Dashboard ———
  if (!profile) return null;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>
            <span className={styles.headerAccent}>Vendor</span> Portal
          </h1>
          <p>Manage your services, packages, and profile</p>
        </div>
        <div
          className={`${styles.verificationBadge} ${
            profile.is_verified ? styles.badgeVerified : styles.badgePending
          }`}
        >
          {profile.is_verified ? (
            <>
              <FaCheckCircle /> Verified
            </>
          ) : (
            <>
              <FaClock /> Pending Verification
            </>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Services</div>
          <div className={styles.statValue}>{stats?.total_services ?? profile.services.length}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Packages</div>
          <div className={styles.statValue}>{stats?.total_packages ?? profile.packages.length}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Rating</div>
          <div className={styles.statValue}>
            <FaStar style={{ color: "#f5bc45", fontSize: "0.9em", marginRight: 4 }} />
            {(profile.average_rating || 0).toFixed(1)}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Member Since</div>
          <div className={styles.statValue} style={{ fontSize: "1.1rem" }}>
            {stats?.member_since
              ? new Date(stats.member_since).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })
              : "—"}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {([
          { key: "overview" as TabKey, label: "Overview" },
          { key: "services" as TabKey, label: "Services" },
          { key: "packages" as TabKey, label: "Packages" },
          { key: "settings" as TabKey, label: "Settings" },
        ]).map((t) => (
          <button
            key={t.key}
            className={`${styles.tab} ${activeTab === t.key ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ====== OVERVIEW TAB ====== */}
      {activeTab === "overview" && (
        <div className={styles.sectionPanel}>
          <h3 style={{ margin: "0 0 12px 0", color: "#15302B", fontSize: "1.6rem", fontWeight: "800", letterSpacing: "-0.01em" }}>
            {profile.business_name}
          </h3>
          <p style={{ color: "#64748b", margin: "0 0 16px 0", fontSize: "1.05rem", lineHeight: "1.6" }}>
            {profile.bio || "No bio provided yet."}
          </p>
          <div className={styles.overviewDetails}>
            {profile.location_text && <span><FaMapMarkerAlt color="#94a3b8" /> {profile.location_text}</span>}
            {profile.phone_number && <span><FaPhoneAlt color="#94a3b8" /> {profile.phone_number}</span>}
            {profile.email && <span><FaEnvelope color="#94a3b8" /> {profile.email}</span>}
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noreferrer">
                <FaGlobe /> Website
              </a>
            )}
          </div>

          {!profile.is_verified && (
            <div className={styles.errorMsg} style={{ marginTop: 24, background: "rgba(245, 188, 69, 0.12)", color: "#b8860b", border: "1px solid rgba(245, 188, 69, 0.3)" }}>
              ⏳ Your profile is pending admin verification. Once verified, you'll appear in the AI Event Planner recommendations.
            </div>
          )}
        </div>
      )}

      {/* ====== SERVICES TAB ====== */}
      {activeTab === "services" && (
        <div className={styles.sectionPanel}>
          <div className={styles.sectionHeader}>
            <h3>Your Services</h3>
            <button className={styles.btnAdd} onClick={() => setShowServiceForm(!showServiceForm)}>
              <FaPlus /> Add Service
            </button>
          </div>

          {showServiceForm && (
            <form className={styles.inlineForm} onSubmit={handleAddService}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Service Type</label>
                  <select
                    value={serviceForm.service_type}
                    onChange={(e) => setServiceForm(f => ({ ...f, service_type: e.target.value }))}
                  >
                    {SERVICE_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Min Price (₦)</label>
                  <input
                    type="number"
                    value={serviceForm.price_min}
                    onChange={(e) => setServiceForm(f => ({ ...f, price_min: e.target.value }))}
                    placeholder="50000"
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Max Price (₦)</label>
                <input
                  type="number"
                  value={serviceForm.price_max}
                  onChange={(e) => setServiceForm(f => ({ ...f, price_max: e.target.value }))}
                  placeholder="500000"
                />
              </div>
              <div className={styles.inlineFormActions}>
                <button type="submit" className={styles.btnSave}>Save Service</button>
                <button type="button" className={styles.btnCancel} onClick={() => setShowServiceForm(false)}>Cancel</button>
              </div>
            </form>
          )}

          <div className={styles.itemList}>
            {profile.services.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🛠️</div>
                <h4>No services yet</h4>
                <p>Add your first service to let organizers know what you offer.</p>
              </div>
            ) : (
              profile.services.map((svc) => (
                <div key={svc.id} className={styles.itemCard}>
                  <div className={styles.itemInfo}>
                    <h4>{svc.service_type}</h4>
                    <p>Price range: ₦{Number(svc.price_min).toLocaleString()} — ₦{Number(svc.price_max).toLocaleString()}</p>
                  </div>
                  <div className={styles.itemMeta}>
                    <div className={styles.itemActions}>
                      <button
                        className={`${styles.btnIcon} ${styles.btnIconDanger}`}
                        onClick={() => handleDeleteService(svc.id)}
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ====== PACKAGES TAB ====== */}
      {activeTab === "packages" && (
        <div className={styles.sectionPanel}>
          <div className={styles.sectionHeader}>
            <h3>Your Packages</h3>
            <button className={styles.btnAdd} onClick={() => setShowPackageForm(!showPackageForm)}>
              <FaPlus /> Add Package
            </button>
          </div>

          {showPackageForm && (
            <form className={styles.inlineForm} onSubmit={handleAddPackage}>
              <div className={styles.formGroup}>
                <label>Package Name *</label>
                <input
                  type="text"
                  value={packageForm.name}
                  onChange={(e) => setPackageForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g., VIP Buffet (Per 50 Guests)"
                  required
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Price (₦) *</label>
                  <input
                    type="number"
                    value={packageForm.price}
                    onChange={(e) => setPackageForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="150000"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Link to Service (optional)</label>
                  <select
                    value={packageForm.service}
                    onChange={(e) => setPackageForm(f => ({ ...f, service: e.target.value }))}
                  >
                    <option value="">— None —</option>
                    {profile.services.map((svc) => (
                      <option key={svc.id} value={svc.id}>{svc.service_type}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={packageForm.description}
                  onChange={(e) => setPackageForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe what's included in this package..."
                />
              </div>
              <div className={styles.formGroup} style={{ marginBottom: 20 }}>
                <ImageUploader
                  label="Package Image (Optional)"
                  currentUrl={packageForm.image_url}
                  onUploaded={(url) => setPackageForm(f => ({ ...f, image_url: url }))}
                  onRemove={() => setPackageForm(f => ({ ...f, image_url: "" }))}
                />
              </div>
              <div className={styles.inlineFormActions}>
                <button type="submit" className={styles.btnSave}>Save Package</button>
                <button type="button" className={styles.btnCancel} onClick={() => setShowPackageForm(false)}>Cancel</button>
              </div>
            </form>
          )}

          <div className={styles.itemList}>
            {profile.packages.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📦</div>
                <h4>No packages yet</h4>
                <p>Create packages so organizers can select specific offerings during event planning.</p>
              </div>
            ) : (
              profile.packages.map((pkg: any) => (
                <div key={pkg.id} className={styles.itemCard} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  {pkg.image_url && (
                    <div style={{ flexShrink: 0, width: 80, height: 80, borderRadius: 8, overflow: 'hidden' }}>
                      <img src={pkg.image_url} alt={pkg.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div className={styles.itemInfo} style={{ flexGrow: 1 }}>
                    <h4>{pkg.name}</h4>
                    <p>{pkg.description || "No description"}</p>
                  </div>
                  <div className={styles.itemMeta}>
                    <span className={styles.itemPrice}>₦{Number(pkg.price).toLocaleString()}</span>
                    <div className={styles.itemActions}>
                      <button
                        className={`${styles.btnIcon} ${styles.btnIconDanger}`}
                        onClick={() => handleDeletePackage(pkg.id)}
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ====== SETTINGS TAB ====== */}
      {activeTab === "settings" && (
        <div className={styles.sectionPanel}>
          <h3 style={{ margin: "0 0 20px 0", color: "#15302B" }}>Edit Profile</h3>

          {settingsMsg && (
            <div className={settingsMsg.includes("success") ? styles.successMsg : styles.errorMsg}>
              {settingsMsg}
            </div>
          )}

          <form className={styles.profileForm} onSubmit={handleUpdateProfile}>
            <div className={styles.formGroup}>
              <label>Business Name</label>
              <input
                type="text"
                value={settingsForm.business_name}
                onChange={(e) => setSettingsForm(f => ({ ...f, business_name: e.target.value }))}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Bio / Description</label>
              <textarea
                value={settingsForm.bio}
                onChange={(e) => setSettingsForm(f => ({ ...f, bio: e.target.value }))}
              />
            </div>

            {/* Image Uploads in Settings */}
            <div className={styles.imageUploadRow}>
              <ImageUploader
                label="Business Logo"
                currentUrl={settingsForm.logo_url}
                onUploaded={(url) => setSettingsForm(f => ({ ...f, logo_url: url }))}
                onRemove={() => setSettingsForm(f => ({ ...f, logo_url: "" }))}
              />
              <ImageUploader
                label="Cover / Banner Image"
                currentUrl={settingsForm.cover_image_url}
                onUploaded={(url) => setSettingsForm(f => ({ ...f, cover_image_url: url }))}
                onRemove={() => setSettingsForm(f => ({ ...f, cover_image_url: "" }))}
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Location</label>
                <input
                  type="text"
                  value={settingsForm.location_text}
                  onChange={(e) => setSettingsForm(f => ({ ...f, location_text: e.target.value }))}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={settingsForm.phone_number}
                  onChange={(e) => setSettingsForm(f => ({ ...f, phone_number: e.target.value }))}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Business Email</label>
                <input
                  type="email"
                  value={settingsForm.email}
                  onChange={(e) => setSettingsForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Website</label>
                <input
                  type="url"
                  value={settingsForm.website}
                  onChange={(e) => setSettingsForm(f => ({ ...f, website: e.target.value }))}
                />
              </div>
            </div>

            <button type="submit" className={styles.btnPrimary} disabled={settingsSaving}>
              {settingsSaving ? "Saving..." : "Update Profile"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
