"use client";

import { useState, useEffect, useCallback } from "react";
import { Modal, TextInput, Textarea, Select, Divider } from "@mantine/core";
import {
  FaClipboardList, FaPlus, FaTrash, FaSave, FaEye, FaToggleOn, FaToggleOff,
} from "react-icons/fa";
import styles from "@/styles/dashboard-features.module.css";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.kuepass.com/api/"
).replace(/\/$/, "");

const getAuthToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("kuepass_auth_token") : null;

interface SurveyDashboardProps { eventId: string; }
interface Survey {
  id: string; title: string; description: string; is_active: boolean;
  response_count: number; created_at: string;
}

export default function SurveyDashboard({ eventId }: SurveyDashboardProps) {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [questions, setQuestions] = useState<{
    question_text: string; question_type: string; options: string; required: boolean;
  }[]>([{ question_text: "", question_type: "text", options: "", required: false }]);
  const [saving, setSaving] = useState(false);

  const [resultsModalOpen, setResultsModalOpen] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [responsesLoading, setResponsesLoading] = useState(false);

  const fetchSurveys = useCallback(async () => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/events/${eventId}/surveys/`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setSurveys(Array.isArray(data) ? data : data.results || []);
      }
    } catch {} finally { setLoading(false); }
  }, [eventId]);

  useEffect(() => { fetchSurveys(); }, [fetchSurveys]);

  const handleCreate = async () => {
    if (!formTitle.trim()) { alert("Survey title is required"); return; }
    setSaving(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/events/${eventId}/surveys/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          event: eventId, title: formTitle, description: formDescription,
          questions: questions.filter(q => q.question_text.trim()).map((q, i) => ({
            question_text: q.question_text, question_type: q.question_type,
            options: q.options ? q.options.split(",").map(o => o.trim()) : [],
            required: q.required, order: i + 1,
          })),
        }),
      });
      if (res.ok) {
        setCreateModalOpen(false); setFormTitle(""); setFormDescription("");
        setQuestions([{ question_text: "", question_type: "text", options: "", required: false }]);
        fetchSurveys();
      } else alert("Failed to create survey");
    } catch { alert("Error creating survey"); } finally { setSaving(false); }
  };

  const viewResults = async (survey: Survey) => {
    setSelectedSurvey(survey); setResultsModalOpen(true); setResponsesLoading(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/surveys/${survey.id}/responses/`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        setResponses(Array.isArray(data) ? data : data.results || []);
      }
    } catch {} finally { setResponsesLoading(false); }
  };

  const handleToggleActive = async (survey: Survey) => {
    try {
      const token = getAuthToken();
      await fetch(`${API_BASE_URL}/surveys/${survey.id}/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !survey.is_active }),
      });
      fetchSurveys();
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this survey?")) return;
    try {
      const token = getAuthToken();
      await fetch(`${API_BASE_URL}/surveys/${id}/`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      fetchSurveys();
    } catch {}
  };

  const totalResponses = surveys.reduce((s, sv) => s + (sv.response_count || 0), 0);
  const activeSurveys = surveys.filter(s => s.is_active).length;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>
            <span className={styles.pageTitleIcon}><FaClipboardList /></span>
            Surveys & Feedback
          </h1>
          <p className={styles.pageSubtitle}>Collect valuable feedback from your attendees</p>
        </div>
        <button className={styles.primaryBtn} onClick={() => setCreateModalOpen(true)}>
          <FaPlus /> Create Survey
        </button>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{surveys.length}</div>
          <div className={styles.statLabel}>Total Surveys</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statValue} ${styles.statGreen}`}>{activeSurveys}</div>
          <div className={styles.statLabel}>Active</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statValue} ${styles.statBlue}`}>{totalResponses}</div>
          <div className={styles.statLabel}>Total Responses</div>
        </div>
      </div>

      {/* Survey list */}
      {loading ? (
        <div className={styles.loadingContainer}><div className={styles.spinner} /></div>
      ) : surveys.length === 0 ? (
        <div className={styles.card}>
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}><FaClipboardList /></div>
            <p className={styles.emptyStateText}>No surveys yet</p>
            <p className={styles.emptyStateHint}>Create one to start collecting attendee feedback.</p>
          </div>
        </div>
      ) : (
        <div className={styles.itemList}>
          {surveys.map(survey => (
            <div key={survey.id} className={styles.itemCard}>
              <div className={styles.itemCardContent}>
                <p className={styles.itemCardTitle}>
                  {survey.title}
                  <span className={`${styles.badge} ${survey.is_active ? styles.badgeGreen : styles.badgeGray}`}>
                    {survey.is_active ? "Active" : "Inactive"}
                  </span>
                </p>
                {survey.description && <p className={styles.itemCardDescription}>{survey.description}</p>}
                <div className={styles.itemCardMeta}>
                  <span className={styles.metaItem}>📊 {survey.response_count || 0} responses</span>
                  <span className={styles.metaItem}>📅 Created {new Date(survey.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className={styles.actionGroup}>
                <button className={`${styles.smallBtn} ${styles.smallBtnPrimary}`} onClick={() => viewResults(survey)}>
                  <FaEye /> Results
                </button>
                <button className={styles.actionBtn} onClick={() => handleToggleActive(survey)}>
                  {survey.is_active ? <FaToggleOn color="#16a34a" /> : <FaToggleOff />}
                </button>
                <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={() => handleDelete(survey.id)}>
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal opened={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create Survey" centered size="lg">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <TextInput label="Survey Title" required value={formTitle}
            onChange={(e) => setFormTitle(e.currentTarget.value)} placeholder="Post-Event Feedback" />
          <Textarea label="Description" value={formDescription}
            onChange={(e) => setFormDescription(e.currentTarget.value)} placeholder="Help us improve future events" />
          <Divider label="Questions" />
          {questions.map((q, i) => (
            <div key={i} style={{ background: "#f9fafb", borderRadius: 10, padding: 14, border: "1px solid #e5e7eb" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6b7280" }}>Question {i + 1}</span>
                {questions.length > 1 && (
                  <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} style={{ width: 24, height: 24 }}
                    onClick={() => setQuestions(questions.filter((_, j) => j !== i))}><FaTrash size={10} /></button>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <TextInput placeholder="Question text" size="sm" value={q.question_text}
                  onChange={(e) => { const u = [...questions]; u[i] = { ...u[i], question_text: e.currentTarget.value }; setQuestions(u); }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <Select size="xs" data={[
                    { value: "text", label: "Short Text" }, { value: "textarea", label: "Long Text" },
                    { value: "rating", label: "Rating (1-5)" }, { value: "select", label: "Multiple Choice" },
                    { value: "checkbox", label: "Checkboxes" },
                  ]} value={q.question_type}
                    onChange={(v) => { const u = [...questions]; u[i] = { ...u[i], question_type: v || "text" }; setQuestions(u); }} />
                  <Select size="xs" data={[{ value: "true", label: "Required" }, { value: "false", label: "Optional" }]}
                    value={q.required ? "true" : "false"}
                    onChange={(v) => { const u = [...questions]; u[i] = { ...u[i], required: v === "true" }; setQuestions(u); }} />
                </div>
                {(q.question_type === "select" || q.question_type === "checkbox") && (
                  <TextInput size="xs" placeholder="Options (comma-separated)" value={q.options}
                    onChange={(e) => { const u = [...questions]; u[i] = { ...u[i], options: e.currentTarget.value }; setQuestions(u); }} />
                )}
              </div>
            </div>
          ))}
          <button className={styles.smallBtn} onClick={() => setQuestions([...questions, { question_text: "", question_type: "text", options: "", required: false }])}>
            <FaPlus /> Add Question
          </button>
          <button className={styles.primaryBtn} onClick={handleCreate} disabled={saving}>
            <FaSave /> {saving ? "Creating..." : "Create Survey"}
          </button>
        </div>
      </Modal>

      {/* Results Modal */}
      <Modal opened={resultsModalOpen} onClose={() => setResultsModalOpen(false)}
        title={`Results: ${selectedSurvey?.title || ""}`} centered size="lg">
        {responsesLoading ? (
          <div className={styles.loadingContainer}><div className={styles.spinner} /></div>
        ) : responses.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}><FaEye /></div>
            <p className={styles.emptyStateText}>No responses yet</p>
          </div>
        ) : (
          <div className={styles.itemList}>
            <p style={{ fontSize: "0.82rem", color: "#6b7280" }}>{responses.length} total responses</p>
            {responses.map((r, i) => (
              <div key={r.id || i} className={styles.itemCard}>
                <div className={styles.itemCardContent}>
                  <p className={styles.itemCardTitle} style={{ fontSize: "0.82rem" }}>
                    {r.respondent_name || r.respondent_email || `Response #${i + 1}`}
                  </p>
                  <div className={styles.itemCardMeta}>
                    <span className={styles.metaItem}>
                      🕐 {r.submitted_at ? new Date(r.submitted_at).toLocaleString() : ""}
                    </span>
                  </div>
                  {r.answers?.map((a: any, j: number) => (
                    <div key={j} style={{ display: "flex", gap: 8, marginTop: 6, fontSize: "0.8rem" }}>
                      <span style={{ color: "#9ca3af", minWidth: 120 }}>{a.question_text || `Q${j + 1}`}:</span>
                      <span style={{ color: "#374151" }}>{a.answer || a.rating || a.selected_options?.join(", ") || "—"}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
