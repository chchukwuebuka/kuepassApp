"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@mantine/core";
import { FaUser, FaComments, FaCheckCircle, FaStar, FaBuilding, FaMapMarkerAlt, FaCalendarCheck } from "react-icons/fa";
import styles from "@/styles/dashboard-features.module.css";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.kuepass.com/api/").replace(/\/$/, "");
const getAuthToken = () => typeof window !== "undefined" ? localStorage.getItem("kuepass_auth_token") : null;

export function EventSessionsViewer({ eventId }: { eventId: string }) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/events/${eventId}/sessions/`).then(r => r.json()).then(d => setSessions(Array.isArray(d) ? d : d.results || []));
  }, [eventId]);

  if (!sessions.length) return null;
  const tracks = [...new Set(sessions.map(s => s.track_name).filter(Boolean))] as string[];
  const sorted = [...(selectedTrack ? sessions.filter(s => s.track_name === selectedTrack) : sessions)].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  return (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "0 0 16px", color: "#1a1a2e" }}>Agenda & Sessions</h3>
      {tracks.length > 1 && (
        <div className={styles.filterPills} style={{ marginBottom: 16 }}>
          <button className={`${styles.filterPill} ${!selectedTrack ? styles.filterPillActive : ""}`} onClick={() => setSelectedTrack(null)}>All</button>
          {tracks.map(t => <button key={t} className={`${styles.filterPill} ${selectedTrack === t ? styles.filterPillActive : ""}`} onClick={() => setSelectedTrack(t)}>{t}</button>)}
        </div>
      )}
      <div className={styles.itemList}>
        {sorted.map(s => (
          <div key={s.id} className={styles.itemCard} style={{ borderLeft: `4px solid ${s.track_name ? "#3b82f6" : "#025a3a"}` }}>
            <div className={styles.itemCardContent}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <p className={styles.itemCardTitle}>{s.title}</p>
                {s.track_name && <span className={`${styles.badge} ${styles.badgeBlue}`}>{s.track_name}</span>}
              </div>
              <div className={styles.itemCardMeta}>
                {s.start_time && <span className={styles.metaItem}><FaCalendarCheck color="#9ca3af" /> {new Date(s.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                {s.speaker_name && <span className={styles.metaItem}><FaUser color="#9ca3af" /> {s.speaker_name}</span>}
                {s.location && <span className={styles.metaItem}><FaMapMarkerAlt color="#9ca3af" /> {s.location}</span>}
              </div>
              {s.description && <p className={styles.itemCardDescription}>{s.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EventSurveyForm({ eventId }: { eventId: string }) {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/events/${eventId}/surveys/`).then(r => r.json()).then(d => setSurveys((Array.isArray(d) ? d : d.results || []).filter((s:any) => s.is_active)));
  }, [eventId]);

  if (!surveys.length) return null;

  const submit = async () => {
    const t = getAuthToken();
    const h: any = { "Content-Type": "application/json" }; if (t) h["Authorization"] = `Bearer ${t}`;
    await fetch(`${API_BASE_URL}/surveys/${active.id}/responses/`, { method: "POST", headers: h, body: JSON.stringify({ answers: Object.entries(answers).map(([qId, ans]) => ({ question_id: qId, answer: ans })) }) });
    setSubmitted(true);
  };

  return (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "0 0 16px", color: "#1a1a2e" }}>Feedback</h3>
      {submitted ? (
        <div className={styles.card} style={{ background: "#f0fdf4", borderColor: "#bbf7d0", color: "#16a34a", display: "flex", alignItems: "center", gap: 8 }}><FaCheckCircle /> Thank you!</div>
      ) : active ? (
        <div className={styles.card}>
          <h4 style={{ margin: "0 0 16px" }}>{active.title}</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {active.questions?.map((q: any) => (
              <div key={q.id}>
                <p style={{ margin: "0 0 8px", fontSize: "0.9rem", fontWeight: 600 }}>{q.question_text}{q.required && " *"}</p>
                {q.question_type === "rating" ? (
                  <div style={{ display: "flex", gap: 8 }}>{[1,2,3,4,5].map(n => <button key={n} className={styles.smallBtn} style={answers[q.id] === String(n) ? { background: "#fbbf24", borderColor: "#f59e0b", color: "#fff" } : {}} onClick={() => setAnswers({...answers, [q.id]: String(n)})}>{n} <FaStar size={10} /></button>)}</div>
                ) : q.question_type === "select" ? (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{q.options?.map((opt:string) => <button key={opt} className={styles.filterPill} style={answers[q.id] === opt ? { background: "#1a1a2e", color: "#fff" } : {}} onClick={() => setAnswers({...answers, [q.id]: opt})}>{opt}</button>)}</div>
                ) : <Textarea value={answers[q.id] || ""} onChange={e => setAnswers({...answers, [q.id]: e.currentTarget.value})} rows={q.question_type === "textarea" ? 3 : 1} />}
              </div>
            ))}
            <button className={styles.primaryBtn} onClick={submit}>Submit Feedback</button>
          </div>
        </div>
      ) : (
        <div className={styles.itemList}>
          {surveys.map(s => (
            <div key={s.id} className={styles.itemCard} style={{ cursor: "pointer" }} onClick={() => setActive(s)}>
              <div className={styles.itemCardContent}><p className={styles.itemCardTitle}>{s.title}</p><p className={styles.itemCardDescription}>{s.description}</p></div>
              <button className={styles.smallBtn}>Start →</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function EventSponsorsDisplay({ eventId }: { eventId: string }) {
  const [sponsors, setSponsors] = useState<any[]>([]);
  useEffect(() => { fetch(`${API_BASE_URL}/events/${eventId}/sponsors/`).then(r => r.json()).then(d => setSponsors(Array.isArray(d) ? d : d.results || [])); }, [eventId]);

  if (!sponsors.length) return null;
  const tVals: Record<string, number> = { title: 0, platinum: 1, gold: 2, silver: 3, bronze: 4 };
  const sorted = [...sponsors].sort((a, b) => (tVals[a.tier] ?? 5) - (tVals[b.tier] ?? 5));
  
  const getStyle = (t: string) => {
    switch(t) {
      case 'title': return { bg: styles.tierTitle, label: "Title Sponsor" };
      case 'platinum': return { bg: styles.tierPlatinum, label: "Platinum" };
      case 'gold': return { bg: styles.tierGold, label: "Gold" };
      case 'silver': return { bg: styles.tierSilver, label: "Silver" };
      default: return { bg: styles.tierBronze, label: "Bronze" };
    }
  };

  return (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "0 0 16px", color: "#1a1a2e" }}>Sponsors</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 16 }}>
        {sorted.map(s => {
          const st = getStyle(s.tier);
          return (
            <a key={s.id} href={s.website_url || "#"} target="_blank" rel="noreferrer" className={styles.card} style={{ textDecoration: "none", textAlign: "center", padding: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              {s.logo_url ? <img src={s.logo_url} alt="" style={{ height: 40, objectFit: "contain" }} /> : <FaBuilding size={30} color="#9ca3af" />}
              <div>
                <p style={{ margin: "0 0 4px", fontWeight: 600, color: "#1a1a2e", fontSize: "0.9rem" }}>{s.name}</p>
                <span className={`${styles.badge} ${st.bg}`}>{st.label}</span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

export function EventSeatPicker({ eventId }: { eventId: string }) {
  const [maps, setMaps] = useState<any[]>([]); const [selMap, setSelMap] = useState<any>(null);
  const [seats, setSeats] = useState<any[]>([]); const [selSeat, setSelSeat] = useState<string | null>(null);

  useEffect(() => { fetch(`${API_BASE_URL}/events/${eventId}/seat-map/`).then(r => r.json()).then(d => { const m = d.id ? [d] : []; setMaps(m); if (m.length) setSelMap(m[0]); }); }, [eventId]);
  useEffect(() => { if (selMap) fetch(`${API_BASE_URL}/events/${eventId}/seats/`).then(r => r.json()).then(d => setSeats(d.seats || [])); }, [selMap, eventId]);

  if (!maps.length) return null;
  const rows = seats.reduce<Record<string, any[]>>((a, s) => { (a[s.row || "?"] = a[s.row || "?"] || []).push(s); return a; }, {});

  return (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "0 0 16px", color: "#1a1a2e" }}>Choose Your Seat</h3>
      {maps.length > 1 && <div className={styles.filterPills} style={{ marginBottom: 16 }}>{maps.map((m:any) => <button key={m.id} className={`${styles.filterPill} ${selMap?.id === m.id ? styles.filterPillActive : ""}`} onClick={() => setSelMap(m)}>{m.name}</button>)}</div>}
      
      <div className={styles.legend}>
        <div className={styles.legendItem}><div className={styles.legendDot} style={{ background: "#22c55e" }}/> Available</div>
        <div className={styles.legendItem}><div className={styles.legendDot} style={{ background: "#3b82f6" }}/> Taken</div>
        <div className={styles.legendItem}><div className={styles.legendDot} style={{ background: "#f59e0b" }}/> Selected</div>
      </div>

      <div className={styles.card} style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#f8fafc" }}>
        <div className={styles.seatGrid} style={{ padding: 0 }}>
          {Object.entries(rows).sort().map(([r, sArr]) => (
            <div key={r} className={styles.seatRow}>
              <span className={styles.seatRowLabel}>{r}</span>
              {sArr.sort((a,b) => a.number - b.number).map(s => (
                <button key={s.id} className={`${styles.seat} ${s.id === selSeat ? styles.seatAvailable : s.status === "available" ? styles.seatAvailable : styles.seatBlocked}`} style={s.id === selSeat ? { background: "#f59e0b", transform: "scale(1.1)" } : s.status === "reserved" ? { background: "#3b82f6" } : {}} onClick={() => s.status === "available" && setSelSeat(s.id === selSeat ? null : s.id)} disabled={s.status !== "available"}>{s.number}</button>
              ))}
            </div>
          ))}
          <div className={styles.stageLabel}>STAGE</div>
        </div>
      </div>
      {selSeat && <div className={styles.card} style={{ marginTop: 16, background: "#fffbeb", borderColor: "#fde68a" }}><p style={{ margin: 0, fontWeight: 600, color: "#d97706" }}>✅ Seat Selected: {seats.find(s => s.id === selSeat)?.row}{seats.find(s => s.id === selSeat)?.number}</p></div>}
    </div>
  );
}
