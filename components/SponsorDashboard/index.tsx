"use client";

import { useState, useEffect, useCallback } from "react";
import { Modal, TextInput, Select, Textarea } from "@mantine/core";
import {
  FaTrophy, FaPlus, FaTrash, FaExternalLinkAlt,
  FaChartBar, FaEye,
} from "react-icons/fa";
import styles from "@/styles/dashboard-features.module.css";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.kuepass.com/api/"
).replace(/\/$/, "");

const getAuthToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("kuepass_auth_token") : null;

interface SponsorDashboardProps {
  eventId: string;
}

export default function SponsorDashboard({ eventId }: SponsorDashboardProps) {
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"list" | "analytics">("list");

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "", tier: "gold", logo_url: "", website_url: "", description: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchSponsors = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/events/${eventId}/sponsors/`);
      if (res.ok) {
        const data = await res.json();
        setSponsors(Array.isArray(data) ? data : data.results || []);
      }
    } catch {} finally { setLoading(false); }
  }, [eventId]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/events/${eventId}/sponsors/analytics/`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data.sponsors || []);
      }
    } catch {}
  }, [eventId]);

  useEffect(() => { fetchSponsors(); fetchAnalytics(); }, [fetchSponsors, fetchAnalytics]);

  const handleAdd = async () => {
    setSaving(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/events/${eventId}/sponsors/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, event: eventId }),
      });
      if (res.ok) {
        setAddModalOpen(false);
        setFormData({ name: "", tier: "gold", logo_url: "", website_url: "", description: "" });
        fetchSponsors();
      } else { alert("Failed to add sponsor"); }
    } catch { alert("Error adding sponsor"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this sponsor?")) return;
    const token = getAuthToken();
    await fetch(`${API_BASE_URL}/sponsors/${id}/`, {
      method: "DELETE", headers: { Authorization: `Bearer ${token}` },
    });
    fetchSponsors();
  };

  const tierClass = (tier: string) => {
    const map: Record<string, string> = {
      title: styles.tierTitle, platinum: styles.tierPlatinum,
      gold: styles.tierGold, silver: styles.tierSilver, bronze: styles.tierBronze,
    };
    return map[tier] || styles.badgeBlue;
  };

  const totalImpressions = analytics.reduce((s, a) => s + (a.impressions || 0), 0);
  const totalClicks = analytics.reduce((s, a) => s + (a.clicks || 0), 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : "0";

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>
            <span className={styles.pageTitleIcon}><FaTrophy /></span>
            Sponsors & Partners
          </h1>
          <p className={styles.pageSubtitle}>Manage event sponsors and track their performance</p>
        </div>
        <button className={styles.primaryBtn} onClick={() => setAddModalOpen(true)}>
          <FaPlus /> Add Sponsor
        </button>
      </div>

      <div className={styles.tabNav}>
        <button className={`${styles.tabBtn} ${activeTab === "list" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("list")}><FaTrophy /> Sponsors</button>
        <button className={`${styles.tabBtn} ${activeTab === "analytics" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("analytics")}><FaChartBar /> Analytics</button>
      </div>

      {activeTab === "list" && (
        <>
          {loading ? (
            <div className={styles.loadingContainer}><div className={styles.spinner} /></div>
          ) : sponsors.length === 0 ? (
            <div className={styles.card}>
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}><FaTrophy /></div>
                <p className={styles.emptyStateText}>No sponsors yet</p>
                <p className={styles.emptyStateHint}>Add your first sponsor or partner to showcase them.</p>
              </div>
            </div>
          ) : (
            <div className={styles.itemList}>
              {sponsors.map((s) => (
                <div key={s.id} className={styles.itemCard}>
                  {s.logo_url ? (
                    <img src={s.logo_url} alt="" className={styles.sponsorLogo} />
                  ) : (
                    <div className={styles.sponsorLogoPlaceholder}>
                      {s.name?.charAt(0)?.toUpperCase() || "S"}
                    </div>
                  )}
                  <div className={styles.itemCardContent}>
                    <p className={styles.itemCardTitle}>
                      {s.name}
                      <span className={`${styles.badge} ${tierClass(s.tier)}`}>{s.tier}</span>
                    </p>
                    {s.description && <p className={styles.itemCardDescription}>{s.description}</p>}
                  </div>
                  <div className={styles.actionGroup}>
                    {s.website_url && (
                      <a href={s.website_url} target="_blank" rel="noopener noreferrer"
                        className={styles.actionBtn}><FaExternalLinkAlt /></a>
                    )}
                    <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                      onClick={() => handleDelete(s.id)}><FaTrash /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "analytics" && (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{sponsors.length}</div>
              <div className={styles.statLabel}>Total Sponsors</div>
            </div>
            <div className={styles.statCard}>
              <div className={`${styles.statValue} ${styles.statBlue}`}>{totalImpressions.toLocaleString()}</div>
              <div className={styles.statLabel}>Total Impressions</div>
            </div>
            <div className={styles.statCard}>
              <div className={`${styles.statValue} ${styles.statGreen}`}>{totalClicks.toLocaleString()}</div>
              <div className={styles.statLabel}>Total Clicks</div>
            </div>
            <div className={styles.statCard}>
              <div className={`${styles.statValue} ${styles.statPurple}`}>{avgCtr}%</div>
              <div className={styles.statLabel}>Avg CTR</div>
            </div>
          </div>

          {analytics.length === 0 ? (
            <div className={styles.card}>
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}><FaChartBar /></div>
                <p className={styles.emptyStateText}>No analytics data yet</p>
              </div>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead><tr><th>Sponsor</th><th>Tier</th><th>Impressions</th><th>Clicks</th><th>CTR</th></tr></thead>
                <tbody>
                  {analytics.map((a) => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 500 }}>{a.name}</td>
                      <td><span className={`${styles.badge} ${tierClass(a.tier)}`}>{a.tier}</span></td>
                      <td>{(a.impressions || 0).toLocaleString()}</td>
                      <td>{(a.clicks || 0).toLocaleString()}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontWeight: 600, fontSize: "0.82rem" }}>{a.ctr || 0}%</span>
                          <div className={styles.analyticsBar} style={{ width: 60 }}>
                            <div className={styles.analyticsBarFill} style={{ width: `${Math.min(a.ctr || 0, 100)}%` }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <Modal opened={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add Sponsor" centered>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <TextInput label="Sponsor Name" required value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.currentTarget.value })} />
          <Select label="Tier" data={[
            { value: "title", label: "Title Sponsor" },
            { value: "platinum", label: "Platinum" },
            { value: "gold", label: "Gold" },
            { value: "silver", label: "Silver" },
            { value: "bronze", label: "Bronze" },
          ]} value={formData.tier} onChange={(v) => setFormData({ ...formData, tier: v || "gold" })} />
          <TextInput label="Logo URL" placeholder="https://..." value={formData.logo_url}
            onChange={(e) => setFormData({ ...formData, logo_url: e.currentTarget.value })} />
          <TextInput label="Website URL" placeholder="https://sponsor.com" value={formData.website_url}
            onChange={(e) => setFormData({ ...formData, website_url: e.currentTarget.value })} />
          <Textarea label="Description" value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.currentTarget.value })} />
          <button className={styles.primaryBtn} onClick={handleAdd} disabled={saving}>
            {saving ? "Adding..." : "Add Sponsor"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
