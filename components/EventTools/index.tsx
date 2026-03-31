"use client";

import { useState, useEffect, useCallback } from "react";
import { Modal, TextInput, CopyButton } from "@mantine/core";
import {
  FaClone, FaCode, FaShieldAlt, FaHistory, FaPlus,
  FaCopy, FaTrash, FaSave, FaToolbox,
} from "react-icons/fa";
import styles from "@/styles/dashboard-features.module.css";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.kuepass.com/api/"
).replace(/\/$/, "");

const getAuthToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("kuepass_auth_token") : null;

interface EventToolsProps {
  eventId: string;
}

export default function EventToolsDashboard({ eventId }: EventToolsProps) {
  const [activeTab, setActiveTab] = useState<"clone" | "embed" | "access" | "audit">("clone");

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>
            <span className={styles.pageTitleIcon}><FaToolbox /></span>
            Event Tools
          </h1>
          <p className={styles.pageSubtitle}>Clone events, embed widgets, manage access tokens, and view activity</p>
        </div>
      </div>

      <div className={styles.tabNav}>
        {([
          { key: "clone", icon: <FaClone />, label: "Clone & Templates" },
          { key: "embed", icon: <FaCode />, label: "Embed Widget" },
          { key: "access", icon: <FaShieldAlt />, label: "Access Tokens" },
          { key: "audit", icon: <FaHistory />, label: "Activity Log" },
        ] as const).map((tab) => (
          <button key={tab.key}
            className={`${styles.tabBtn} ${activeTab === tab.key ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab(tab.key)}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "clone" && <CloneSection eventId={eventId} />}
      {activeTab === "embed" && <EmbedSection eventId={eventId} />}
      {activeTab === "access" && <AccessTokenSection eventId={eventId} />}
      {activeTab === "audit" && <AuditLogSection eventId={eventId} />}
    </div>
  );
}

function CloneSection({ eventId }: { eventId: string }) {
  const [cloneLoading, setCloneLoading] = useState(false);
  const [saveTemplateLoading, setSaveTemplateLoading] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const token = getAuthToken();
        const res = await fetch(`${API_BASE_URL}/templates/`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          setTemplates(Array.isArray(data) ? data : data.results || []);
        }
      } catch {} finally { setTemplatesLoading(false); }
    };
    fetch_();
  }, []);

  const handleClone = async () => {
    setCloneLoading(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/events/clone/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId }),
      });
      const data = await res.json();
      if (res.ok) alert(`Event cloned! New event ID: ${data.new_event_id || "created"}`);
      else alert(data.error || "Clone failed");
    } catch { alert("Clone failed"); } finally { setCloneLoading(false); }
  };

  const handleSaveTemplate = async () => {
    setSaveTemplateLoading(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/events/${eventId}/save-template/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (res.ok) alert("Saved as template!");
      else alert("Failed to save template");
    } catch { alert("Error saving template"); } finally { setSaveTemplateLoading(false); }
  };

  return (
    <div className={styles.card}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        <button className={styles.primaryBtn} onClick={handleClone} disabled={cloneLoading}>
          <FaClone /> {cloneLoading ? "Cloning..." : "Clone This Event"}
        </button>
        <button className={styles.smallBtn} onClick={handleSaveTemplate} disabled={saveTemplateLoading}>
          <FaSave /> {saveTemplateLoading ? "Saving..." : "Save as Template"}
        </button>
      </div>
      <p style={{ fontSize: "0.82rem", color: "#9ca3af", margin: "0 0 20px" }}>
        Clone creates an exact copy. Templates can be reused for future events.
      </p>

      {templatesLoading ? (
        <div className={styles.loadingContainer}><div className={styles.spinner} /></div>
      ) : templates.length > 0 && (
        <>
          <h3 className={styles.cardTitle} style={{ marginBottom: 12 }}>Your Templates</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead><tr><th>Name</th><th>Category</th><th>Created</th></tr></thead>
              <tbody>
                {templates.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 500 }}>{t.name}</td>
                    <td><span className={`${styles.badge} ${styles.badgeBlue}`}>{t.category || "Custom"}</span></td>
                    <td style={{ color: "#9ca3af", fontSize: "0.8rem" }}>
                      {t.created_at ? new Date(t.created_at).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function EmbedSection({ eventId }: { eventId: string }) {
  const [snippet, setSnippet] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/events/${eventId}/embed/snippet/`);
        if (res.ok) {
          const data = await res.json();
          setSnippet(data.snippet || "");
        }
      } catch {} finally { setLoading(false); }
    };
    fetch_();
  }, [eventId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>Embeddable Ticket Widget</h3>
      <p style={{ fontSize: "0.82rem", color: "#9ca3af", margin: "4px 0 16px" }}>
        Copy this code and paste it into your website to sell tickets directly from your site.
      </p>
      {loading ? (
        <div className={styles.loadingContainer}><div className={styles.spinner} /></div>
      ) : (
        <>
          <div style={{
            background: "#1a1a2e", borderRadius: 10, padding: 16,
            fontFamily: "monospace", fontSize: "0.78rem", color: "#a5b4fc",
            whiteSpace: "pre-wrap", wordBreak: "break-all", lineHeight: 1.6,
            marginBottom: 12,
          }}>
            {snippet || "No embed code available"}
          </div>
          {snippet && (
            <button className={styles.primaryBtn} onClick={handleCopy} style={{ alignSelf: "flex-start" }}>
              <FaCopy /> {copied ? "Copied!" : "Copy Embed Code"}
            </button>
          )}
        </>
      )}
    </div>
  );
}

function AccessTokenSection({ eventId }: { eventId: string }) {
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [tokenLabel, setTokenLabel] = useState("");

  const fetchTokens = useCallback(async () => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/events/${eventId}/access-tokens/`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setTokens(Array.isArray(data) ? data : data.results || []);
      }
    } catch {} finally { setLoading(false); }
  }, [eventId]);

  useEffect(() => { fetchTokens(); }, [fetchTokens]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/events/${eventId}/access-tokens/generate/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ label: tokenLabel || "Invite Link", token_type: "registration" }),
      });
      if (res.ok) { setTokenLabel(""); fetchTokens(); }
      else {
        const errorData = await res.json();
        alert(`Token Generation Failed:\n${errorData.error || JSON.stringify(errorData)}`);
      }
    } catch (err: any) { alert(err.message || "Failed to reach server"); } finally { setGenerating(false); }
  };

  const handleRevoke = async (tokenId: string) => {
    const token = getAuthToken();
    await fetch(`${API_BASE_URL}/access-tokens/${tokenId}/revoke/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
    fetchTokens();
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>Access Tokens & Invite Links</h3>
      <div style={{ display: "flex", gap: 8, margin: "12px 0 20px", flexWrap: "wrap" }}>
        <TextInput placeholder="Label (e.g. VIP Invite)" value={tokenLabel}
          onChange={(e) => setTokenLabel(e.currentTarget.value)} style={{ flex: 1, minWidth: 200 }} />
        <button className={styles.primaryBtn} onClick={handleGenerate} disabled={generating}>
          <FaPlus /> {generating ? "Generating..." : "Generate"}
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}><div className={styles.spinner} /></div>
      ) : tokens.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}><FaShieldAlt /></div>
          <p className={styles.emptyStateText}>No access tokens yet</p>
          <p className={styles.emptyStateHint}>Generate one to create invite links.</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead><tr><th>Label</th><th>Token</th><th>Uses</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {tokens.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 500 }}>{t.label || "—"}</td>
                  <td>
                    <code style={{ fontSize: "0.75rem", background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }} title={t.token}>
                      {t.token?.slice(0, 12)}...
                    </code>
                  </td>
                  <td>{t.current_uses || 0}{t.max_uses ? `/${t.max_uses}` : ""}</td>
                  <td>
                    <span className={`${styles.badge} ${t.is_active !== false ? styles.badgeGreen : styles.badgeRed}`}>
                      {t.is_active !== false ? "Active" : "Revoked"}
                    </span>
                  </td>
                  <td>
                    {t.is_active !== false && (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <CopyButton value={t.full_url || `${window.location.origin}/register?access_token=${t.token}`} timeout={2000}>
                          {({ copied, copy }) => (
                            <button
                              className={`${styles.actionBtn} ${copied ? styles.actionBtnSuccess : styles.actionBtnPrimary}`}
                              onClick={copy}
                              title="Copy Invite Link"
                            >
                              <FaCopy /> {copied ? "Copied" : "Copy Link"}
                            </button>
                          )}
                        </CopyButton>
                        <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                          onClick={() => handleRevoke(t.id)} title="Revoke Token"><FaTrash /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AuditLogSection({ eventId }: { eventId: string }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const token = getAuthToken();
        const res = await fetch(`${API_BASE_URL}/events/${eventId}/audit-log/`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          setLogs(Array.isArray(data) ? data : data.results || []);
        }
      } catch {} finally { setLoading(false); }
    };
    fetch_();
  }, [eventId]);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>Activity Log</h3>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}><div className={styles.spinner} /></div>
      ) : logs.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}><FaHistory /></div>
          <p className={styles.emptyStateText}>No activity recorded yet</p>
          <p className={styles.emptyStateHint}>Actions like cloning, ticket changes, and settings updates will appear here.</p>
        </div>
      ) : (
        <div className={styles.itemList}>
          {logs.map((log, i) => (
            <div key={log.id || i} className={styles.itemCard} style={{ borderLeft: "3px solid #025a3a" }}>
              <div className={styles.itemCardContent}>
                <p className={styles.itemCardTitle}>{log.action_display || log.action}</p>
                <div className={styles.itemCardMeta}>
                  <span className={styles.metaItem}>
                    👤 {log.actor_name || log.actor_email || "System"}
                  </span>
                  {log.target_type && (
                    <span className={styles.metaItem}>→ {log.target_type}</span>
                  )}
                  <span className={styles.metaItem}>
                    🕐 {log.timestamp ? new Date(log.timestamp).toLocaleString() : "—"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
