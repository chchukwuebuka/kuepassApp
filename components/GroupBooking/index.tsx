"use client";

import { useState } from "react";
import { TextInput, Divider } from "@mantine/core";
import { FaUsers, FaPlus, FaTrash, FaReceipt } from "react-icons/fa";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import styles from "@/styles/dashboard-features.module.css";

interface GroupMember {
  name: string;
  email: string;
  phone_number: string;
}

interface GroupBookingFormProps {
  eventId: string;
  ticketTypeId: string;
  ticketName: string;
  ticketPrice: number;
  apiBaseUrl: string;
  onBookingComplete?: (booking: any) => void;
}

export default function GroupBookingForm({
  eventId, ticketTypeId, ticketName, ticketPrice, apiBaseUrl, onBookingComplete,
}: GroupBookingFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [leaderName, setLeaderName] = useState("");
  const [leaderEmail, setLeaderEmail] = useState("");
  const [leaderPhone, setLeaderPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [members, setMembers] = useState<GroupMember[]>([{ name: "", email: "", phone_number: "" }]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const groupSize = members.length + 1; // leader + members
  const totalAmount = ticketPrice * groupSize;

  let discountPct = 0;
  if (groupSize >= 20) discountPct = 20;
  else if (groupSize >= 10) discountPct = 15;
  else if (groupSize >= 5) discountPct = 10;

  const discountAmount = totalAmount * (discountPct / 100);
  const finalAmount = totalAmount - discountAmount;

  const handleSubmit = async () => {
    if (!leaderName.trim() || !leaderEmail.trim()) { setError("Leader details required"); return; }
    for (let i = 0; i < members.length; i++) {
      if (!members[i].name.trim() || !members[i].email.trim()) {
        setError(`Fill in name & email for member ${i + 1}`); return;
      }
    }
    setLoading(true); setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/group-bookings/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: eventId, ticket_type_id: ticketTypeId,
          group_leader_name: leaderName.trim(), group_leader_email: leaderEmail.trim(),
          group_leader_phone: leaderPhone, company_name: companyName,
          members: members.map(m => ({ name: m.name.trim(), email: m.email.trim(), phone_number: m.phone_number })),
        }),
      });
      const data = await response.json();
      if (response.ok) { setResult(data); onBookingComplete?.(data); }
      else setError(data.error || "Failed");
    } catch { setError("Network error"); } finally { setLoading(false); }
  };

  if (result) {
    const booking = result.booking || result;
    return (
      <div className={styles.card} style={{ borderLeft: "4px solid #16a34a", background: "#f0fdf4" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}>
          <div className={styles.emptyStateIcon} style={{ background: "#dcfce7", color: "#16a34a" }}>
            <FaReceipt />
          </div>
          <h3 className={styles.cardTitle}>Group Booking Created!</h3>
          <span className={`${styles.badge} ${styles.badgeGreen}`}>Invoice: {booking.invoice_number || "Pending"}</span>
          <p style={{ fontSize: "0.85rem", color: "#6b7280", margin: 0 }}>
            {booking.group_size || groupSize} tickets • {discountPct > 0 ? `${discountPct}% discount` : "No discount"} • ₦{(booking.final_amount || finalAmount).toLocaleString()}
          </p>
        </div>
      </div>
    );
  }

  if (!showForm) {
    return (
      <button className={styles.primaryBtn} style={{ width: "100%", justifyContent: "center", background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}
        onClick={() => setShowForm(true)}>
        <FaUsers /> Book for a Group (5+ gets discount)
      </button>
    );
  }

  return (
    <div className={styles.card} style={{ background: "#f8fafc" }}>
      <div className={styles.cardHeader} style={{ marginBottom: 16 }}>
        <h3 className={styles.cardTitle} style={{ display: "flex", alignItems: "center", gap: 8, color: "#6d28d9" }}>
          <FaUsers /> Group Booking — {ticketName}
        </h3>
      </div>

      <div>
        <h4 style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 700, margin: "0 0 12px", letterSpacing: 1 }}>GROUP LEADER</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <TextInput placeholder="Full name" value={leaderName} onChange={e => setLeaderName(e.currentTarget.value)} required />
          <TextInput placeholder="Email" type="email" value={leaderEmail} onChange={e => setLeaderEmail(e.currentTarget.value)} required />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <PhoneInput international defaultCountry="NG" value={leaderPhone} onChange={val => setLeaderPhone(val || "")}
              style={{ background: "#fff", border: "1px solid #ced4da", borderRadius: 4, padding: "0 12px" }} />
            <TextInput placeholder="Company (optional)" value={companyName} onChange={e => setCompanyName(e.currentTarget.value)} />
          </div>
        </div>
      </div>

      <Divider my="lg" />

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h4 style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 700, margin: 0, letterSpacing: 1 }}>
            MEMBERS ({members.length})
          </h4>
          <button className={styles.smallBtn} style={{ color: "#6d28d9", borderColor: "#6d28d9" }} onClick={() => setMembers([...members, { name: "", email: "", phone_number: "" }])}>
            <FaPlus /> Add Member
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {members.map((m, i) => (
            <div key={i} style={{ display: "flex", gap: 8, background: "#fff", padding: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}>
              <TextInput placeholder="Name" value={m.name} onChange={e => { const updated = [...members]; updated[i].name = e.currentTarget.value; setMembers(updated); }} style={{ flex: 1 }} />
              <TextInput placeholder="Email" type="email" value={m.email} onChange={e => { const updated = [...members]; updated[i].email = e.currentTarget.value; setMembers(updated); }} style={{ flex: 1 }} />
              {members.length > 1 && (
                <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={() => setMembers(members.filter((_, idx) => idx !== i))}>
                  <FaTrash />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <Divider my="lg" />

      <div style={{ background: "#f3e8ff", padding: 16, borderRadius: 8, border: "1px solid #e9d5ff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#4c1d95", marginBottom: 8 }}>
          <span>{groupSize} × {ticketName}</span>
          <span>₦{totalAmount.toLocaleString()}</span>
        </div>
        {discountPct > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#16a34a", marginBottom: 8 }}>
            <span>Group discount ({discountPct}%)</span>
            <span>− ₦{discountAmount.toLocaleString()}</span>
          </div>
        )}
        <Divider color="#e9d5ff" my="sm" />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem", fontWeight: 700, color: "#4c1d95" }}>
          <span>Total</span>
          <span>₦{finalAmount.toLocaleString()}</span>
        </div>
      </div>

      {discountPct === 0 && groupSize < 5 && (
        <p style={{ fontSize: "0.8rem", color: "#6b7280", textAlign: "center", margin: "12px 0 0" }}>
          💡 Add {5 - groupSize} more to unlock a 10% discount!
        </p>
      )}

      {error && <p style={{ fontSize: "0.85rem", color: "#dc2626", marginTop: 12 }}>{error}</p>}

      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        <button className={styles.primaryBtn} onClick={handleSubmit} disabled={loading} style={{ flex: 1, justifyContent: "center", background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}>
          {loading ? "Processing..." : "Create Group Booking"}
        </button>
        <button className={styles.smallBtn} onClick={() => setShowForm(false)}>Cancel</button>
      </div>
    </div>
  );
}
