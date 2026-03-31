"use client";

import { useState } from "react";
import { TextInput } from "@mantine/core";
import { FaTag, FaCheck, FaTimes } from "react-icons/fa";
import styles from "@/styles/dashboard-features.module.css";

interface PromoCodeResult {
  valid: boolean; code: string; discount_type: "percentage" | "fixed";
  discount_value: number; sample_discount: number | null; error?: string;
}

interface PromoCodeInputProps {
  eventId: string; ticketTypeId?: string; email?: string;
  orderAmount?: number; onPromoApplied: (result: PromoCodeResult | null) => void;
  apiBaseUrl: string;
}

export default function PromoCodeInput({
  eventId, ticketTypeId, email, orderAmount, onPromoApplied, apiBaseUrl,
}: PromoCodeInputProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PromoCodeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleValidate = async () => {
    if (!code.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const response = await fetch(`${apiBaseUrl}/promo-codes/validate/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), event_id: eventId, ticket_type_id: ticketTypeId, email, order_amount: orderAmount }),
      });
      const data = await response.json();
      if (response.ok && data.valid) { setResult(data); onPromoApplied(data); }
      else { setError(data.error || "Invalid promo code"); onPromoApplied(null); }
    } catch { setError("Failed to validate promo code"); onPromoApplied(null); }
    finally { setLoading(false); }
  };

  const handleRemove = () => { setCode(""); setResult(null); setError(null); onPromoApplied(null); };

  if (result) {
    return (
      <div className={styles.card} style={{ padding: 16, background: "#f0fdf4", borderColor: "#bbf7d0", borderLeft: "4px solid #16a34a" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ color: "#16a34a", fontSize: "1.2rem" }}><FaCheck /></div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: "#16a34a", fontSize: "0.95rem" }}>{result.code}</p>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#15803d" }}>
                {result.discount_type === "percentage" ? `${result.discount_value}% off` : `₦${result.discount_value.toLocaleString()} off`}
                {result.sample_discount != null && orderAmount ? ` — saves ₦${result.sample_discount.toLocaleString()}` : ""}
              </p>
            </div>
          </div>
          <button className={styles.actionBtn} onClick={handleRemove} style={{ color: "#ef4444" }} title="Remove Promo"><FaTimes /></button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <TextInput placeholder="Enter promo code" value={code} onChange={e => setCode(e.currentTarget.value.toUpperCase())}
          style={{ flex: 1 }} onKeyDown={e => e.key === "Enter" && handleValidate()} leftSection={<FaTag size={12} color="#9ca3af" />}
          error={!!error} />
        <button className={styles.primaryBtn} onClick={handleValidate} disabled={!code.trim() || loading} style={{ background: "linear-gradient(135deg, #1f2937, #111827)" }}>
          {loading ? "..." : "Apply"}
        </button>
      </div>
      {error && <p style={{ fontSize: "0.8rem", color: "#dc2626", margin: 0 }}>{error}</p>}
    </div>
  );
}
export type { PromoCodeResult };
