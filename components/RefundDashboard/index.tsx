"use client";

import { useState, useEffect, useCallback } from "react";
import { Modal, Select, Textarea, TextInput } from "@mantine/core";
import {
  FaUndo, FaCheck, FaTimes, FaClock, FaMoneyBillWave,
} from "react-icons/fa";
import styles from "@/styles/dashboard-features.module.css";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.kuepass.com/api/"
).replace(/\/$/, "");

const getAuthToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("kuepass_auth_token") : null;

interface RefundDashboardProps {
  eventId: string;
}

export default function RefundDashboard({ eventId }: RefundDashboardProps) {
  const [activeTab, setActiveTab] = useState<"requests" | "policy">("requests");
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Policy form
  const [policyType, setPolicyType] = useState("full");
  const [cutoffHours, setCutoffHours] = useState("24");
  const [policyDescription, setPolicyDescription] = useState("");
  const [policySaving, setPolicySaving] = useState(false);

  // Process modal
  const [processModalOpen, setProcessModalOpen] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<any>(null);
  const [processAction, setProcessAction] = useState<"approved" | "rejected">("approved");
  const [processNote, setProcessNote] = useState("");

  const fetchRefunds = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/events/${eventId}/refunds/`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setRefunds(Array.isArray(data) ? data : data.results || data.data || []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => { fetchRefunds(); }, [fetchRefunds]);

  const handleSavePolicy = async () => {
    setPolicySaving(true);
    try {
      const token = getAuthToken();
      await fetch(`${API_BASE_URL}/events/${eventId}/refund-policy/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: eventId, refund_type: policyType,
          cutoff_hours: parseInt(cutoffHours), description: policyDescription,
        }),
      });
      alert("Refund policy saved!");
    } catch { alert("Failed to save policy"); } finally { setPolicySaving(false); }
  };

  const handleProcess = async () => {
    if (!selectedRefund) return;
    try {
      const token = getAuthToken();
      await fetch(`${API_BASE_URL}/refunds/${selectedRefund.id}/process/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action: processAction, admin_note: processNote }),
      });
      setProcessModalOpen(false);
      setSelectedRefund(null);
      setProcessNote("");
      fetchRefunds();
    } catch { alert("Failed to process refund"); }
  };

  const statusBadge = (s: string) => {
    if (s === "approved") return styles.badgeGreen;
    if (s === "rejected") return styles.badgeRed;
    return styles.badgeYellow;
  };

  const stats = {
    total: refunds.length,
    pending: refunds.filter(r => r.status === "pending").length,
    approved: refunds.filter(r => r.status === "approved").length,
    rejected: refunds.filter(r => r.status === "rejected").length,
  };

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>
            <span className={styles.pageTitleIcon}><FaUndo /></span>
            Refund Management
          </h1>
          <p className={styles.pageSubtitle}>Review and process attendee refund requests</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabNav}>
        <button className={`${styles.tabBtn} ${activeTab === "requests" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("requests")}>
          <FaMoneyBillWave /> Requests
        </button>
        <button className={`${styles.tabBtn} ${activeTab === "policy" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("policy")}>
          <FaClock /> Policy Settings
        </button>
      </div>

      {activeTab === "requests" && (
        <>
          {/* Stats */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.total}</div>
              <div className={styles.statLabel}>Total Requests</div>
            </div>
            <div className={styles.statCard}>
              <div className={`${styles.statValue} ${styles.statOrange}`}>{stats.pending}</div>
              <div className={styles.statLabel}>Pending</div>
            </div>
            <div className={styles.statCard}>
              <div className={`${styles.statValue} ${styles.statGreen}`}>{stats.approved}</div>
              <div className={styles.statLabel}>Approved</div>
            </div>
            <div className={styles.statCard}>
              <div className={`${styles.statValue} ${styles.statRed}`}>{stats.rejected}</div>
              <div className={styles.statLabel}>Rejected</div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className={styles.loadingContainer}><div className={styles.spinner} /></div>
          ) : refunds.length === 0 ? (
            <div className={styles.card}>
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}><FaUndo /></div>
                <p className={styles.emptyStateText}>No refund requests yet</p>
                <p className={styles.emptyStateHint}>When attendees request refunds, they&apos;ll appear here.</p>
              </div>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Attendee</th>
                    <th>Amount</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {refunds.map((r) => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 500 }}>{r.attendee_name || r.attendee_email || "—"}</td>
                      <td style={{ fontWeight: 600 }}>₦{parseFloat(r.amount || 0).toLocaleString()}</td>
                      <td>{r.reason || "—"}</td>
                      <td><span className={`${styles.badge} ${statusBadge(r.status)}`}>{r.status}</span></td>
                      <td style={{ color: "#9ca3af", fontSize: "0.8rem" }}>
                        {r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td>
                        {r.status === "pending" && (
                          <div className={styles.actionGroup}>
                            <button className={`${styles.actionBtn} ${styles.actionBtnSuccess}`}
                              onClick={() => { setSelectedRefund(r); setProcessAction("approved"); setProcessModalOpen(true); }}>
                              <FaCheck />
                            </button>
                            <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                              onClick={() => { setSelectedRefund(r); setProcessAction("rejected"); setProcessModalOpen(true); }}>
                              <FaTimes />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {activeTab === "policy" && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Refund Policy Settings</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
            <Select label="Refund Type" data={[
              { value: "full", label: "Full Refund" },
              { value: "partial", label: "Partial Refund" },
              { value: "no_refund", label: "No Refunds" },
            ]} value={policyType} onChange={(v) => setPolicyType(v || "full")} />
            <TextInput label="Cutoff (hours before event)" type="number" value={cutoffHours}
              onChange={(e) => setCutoffHours(e.currentTarget.value)}
              description="Refund requests after this window will be rejected" />
            <Textarea label="Policy Description" placeholder="Describe your refund policy..."
              value={policyDescription} onChange={(e) => setPolicyDescription(e.currentTarget.value)} rows={3} />
            <button className={styles.primaryBtn} onClick={handleSavePolicy}
              disabled={policySaving} style={{ alignSelf: "flex-start" }}>
              {policySaving ? "Saving..." : "Save Policy"}
            </button>
          </div>
        </div>
      )}

      <Modal opened={processModalOpen} onClose={() => setProcessModalOpen(false)}
        title={`${processAction === "approved" ? "Approve" : "Reject"} Refund`} centered>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ fontSize: "0.85rem", color: "#6b7280", margin: 0 }}>
            {processAction === "approved"
              ? "Confirm refund approval. The attendee will be notified."
              : "Provide a reason for rejecting this refund request."}
          </p>
          <Textarea label="Note (optional)" value={processNote}
            onChange={(e) => setProcessNote(e.currentTarget.value)} />
          <button className={styles.primaryBtn} onClick={handleProcess}
            style={processAction === "rejected" ? { background: "linear-gradient(135deg, #dc2626, #ef4444)" } : {}}>
            {processAction === "approved" ? "Approve Refund" : "Reject Refund"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
