"use client";

import { useState, useEffect, useCallback } from "react";
import { Modal, TextInput, Textarea } from "@mantine/core";
import {
  FaCalendarAlt, FaPlus, FaTrash, FaEdit, FaSave, FaUsers,
} from "react-icons/fa";
import styles from "@/styles/dashboard-features.module.css";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.kuepass.com/api/"
).replace(/\/$/, "");

const getAuthToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("kuepass_auth_token") : null;

interface SessionManagerProps { eventId: string; }

interface Session {
  id: string; title: string; track_name: string; speaker_name: string;
  start_time: string; end_time: string; location: string;
  capacity: number | null; attendee_count?: number; description?: string;
}

function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360}, 65%, 50%)`;
}

export default function SessionManager({ eventId }: SessionManagerProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [tracks, setTracks] = useState<string[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [formData, setFormData] = useState({
    title: "", track_name: "", speaker_name: "", start_time: "", end_time: "",
    location: "", capacity: "", description: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/events/${eventId}/sessions/`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.results || [];
        setSessions(list);
        setTracks([...new Set(list.map((s: Session) => s.track_name).filter(Boolean))] as string[]);
      }
    } catch {} finally { setLoading(false); }
  }, [eventId]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const filtered = selectedTrack ? sessions.filter(s => s.track_name === selectedTrack) : sessions;
  const sorted = [...filtered].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  const openAddModal = () => {
    setEditingSession(null);
    setFormData({ title: "", track_name: "", speaker_name: "", start_time: "", end_time: "", location: "", capacity: "", description: "" });
    setModalOpen(true);
  };

  const openEditModal = (s: Session) => {
    setEditingSession(s);
    setFormData({
      title: s.title, track_name: s.track_name || "", speaker_name: s.speaker_name || "",
      start_time: s.start_time?.slice(0, 16) || "", end_time: s.end_time?.slice(0, 16) || "",
      location: s.location || "", capacity: s.capacity?.toString() || "", description: s.description || "",
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) { alert("Session title is required"); return; }
    setSaving(true);
    try {
      const token = getAuthToken();
      const url = editingSession ? `${API_BASE_URL}/sessions/${editingSession.id}/` : `${API_BASE_URL}/events/${eventId}/sessions/`;
      const res = await fetch(url, {
        method: editingSession ? "PATCH" : "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          event: eventId, title: formData.title, track_name: formData.track_name,
          speaker_name: formData.speaker_name, start_time: formData.start_time || undefined,
          end_time: formData.end_time || undefined, location: formData.location,
          capacity: formData.capacity ? parseInt(formData.capacity) : null, description: formData.description,
        }),
      });
      if (res.ok) { setModalOpen(false); fetchSessions(); }
      else alert("Failed to save session");
    } catch { alert("Error saving session"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this session?")) return;
    try {
      const token = getAuthToken();
      await fetch(`${API_BASE_URL}/sessions/${id}/`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      fetchSessions();
    } catch {}
  };

  const fmtTime = (dt: string) => dt ? new Date(dt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—";
  const fmtDate = (dt: string) => dt ? new Date(dt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>
            <span className={styles.pageTitleIcon}><FaCalendarAlt /></span>
            Sessions & Tracks
          </h1>
          <p className={styles.pageSubtitle}>Organize your event schedule into sessions and tracks</p>
        </div>
        <button className={styles.primaryBtn} onClick={openAddModal}><FaPlus /> Add Session</button>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{sessions.length}</div>
          <div className={styles.statLabel}>Total Sessions</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statValue} ${styles.statBlue}`}>{tracks.length}</div>
          <div className={styles.statLabel}>Tracks</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statValue} ${styles.statPurple}`}>
            {sessions.filter(s => s.speaker_name).length}
          </div>
          <div className={styles.statLabel}>With Speakers</div>
        </div>
      </div>

      {/* Track filter */}
      {tracks.length > 0 && (
        <div className={styles.filterPills}>
          <button className={`${styles.filterPill} ${selectedTrack === null ? styles.filterPillActive : ""}`}
            onClick={() => setSelectedTrack(null)}>All ({sessions.length})</button>
          {tracks.map(t => (
            <button key={t} className={`${styles.filterPill} ${selectedTrack === t ? styles.filterPillActive : ""}`}
              onClick={() => setSelectedTrack(t)}>
              {t} ({sessions.filter(s => s.track_name === t).length})
            </button>
          ))}
        </div>
      )}

      {/* Sessions list */}
      {loading ? (
        <div className={styles.loadingContainer}><div className={styles.spinner} /></div>
      ) : sorted.length === 0 ? (
        <div className={styles.card}>
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}><FaCalendarAlt /></div>
            <p className={styles.emptyStateText}>
              {selectedTrack ? `No sessions in "${selectedTrack}" track` : "No sessions yet"}
            </p>
            <p className={styles.emptyStateHint}>Create your first session to build the event schedule.</p>
          </div>
        </div>
      ) : (
        <div className={styles.itemList}>
          {sorted.map(session => (
            <div key={session.id} className={`${styles.itemCard} ${styles.itemCardAccent}`}
              style={{ borderLeftColor: session.track_name ? stringToColor(session.track_name) : "#025a3a" }}>
              <div className={styles.itemCardContent}>
                <p className={styles.itemCardTitle}>
                  {session.title}
                  {session.track_name && (
                    <span className={`${styles.badge} ${styles.badgeBlue}`}>{session.track_name}</span>
                  )}
                </p>
                <div className={styles.itemCardMeta}>
                  {session.start_time && (
                    <span className={styles.metaItem}>🕐 {fmtDate(session.start_time)} {fmtTime(session.start_time)} – {fmtTime(session.end_time)}</span>
                  )}
                  {session.speaker_name && <span className={styles.metaItem}>🎤 {session.speaker_name}</span>}
                  {session.location && <span className={styles.metaItem}>📍 {session.location}</span>}
                  {session.capacity && (
                    <span className={styles.metaItem}><FaUsers size={10} /> {session.attendee_count || 0}/{session.capacity}</span>
                  )}
                </div>
                {session.description && <p className={styles.itemCardDescription}>{session.description}</p>}
              </div>
              <div className={styles.actionGroup}>
                <button className={styles.actionBtn} onClick={() => openEditModal(session)}><FaEdit /></button>
                <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={() => handleDelete(session.id)}><FaTrash /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title={editingSession ? "Edit Session" : "Add Session"} centered size="lg">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <TextInput label="Session Title" required value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.currentTarget.value })} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <TextInput label="Track Name" placeholder="e.g. AI Track" value={formData.track_name}
              onChange={(e) => setFormData({ ...formData, track_name: e.currentTarget.value })} />
            <TextInput label="Speaker" placeholder="John Doe" value={formData.speaker_name}
              onChange={(e) => setFormData({ ...formData, speaker_name: e.currentTarget.value })} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <TextInput label="Start Time" type="datetime-local" value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.currentTarget.value })} />
            <TextInput label="End Time" type="datetime-local" value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.currentTarget.value })} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <TextInput label="Location / Room" placeholder="Room A" value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.currentTarget.value })} />
            <TextInput label="Capacity" type="number" placeholder="50" value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.currentTarget.value })} />
          </div>
          <Textarea label="Description" value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.currentTarget.value })} rows={3} />
          <button className={styles.primaryBtn} onClick={handleSave} disabled={saving}>
            <FaSave /> {saving ? "Saving..." : editingSession ? "Update Session" : "Create Session"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
