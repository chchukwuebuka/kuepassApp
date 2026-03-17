"use client";

import React, { useState, useEffect } from "react";
import { authenticatedRequest } from "@/app/services/auth";
import styles from "./styles.module.css";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.kuepass.com/api/"
).replace(/\/$/, "");

interface TicketAnalytics {
  id: string;
  name: string;
  type: string;
  price: number;
  capacity: number | null;
  sold: number;
  remaining: number | null;
  sell_through_percent: number;
  revenue: number;
  status: string;
}

interface AIInsights {
  overall_health: "good" | "warning" | "critical";
  overall_summary: string;
  ticket_recommendations: {
    ticket_name: string;
    action: "increase" | "decrease" | "maintain";
    suggested_price: number;
    reason: string;
  }[];
  marketing_tips: string[];
}

interface AnalyticsData {
  event_title: string;
  summary: {
    total_sold: number;
    total_capacity: number | null;
    total_revenue: number;
    overall_sell_through: number;
  };
  tickets: TicketAnalytics[];
  ai_insights: AIInsights;
}

interface SalesAnalyticsPageProps {
  eventId: string;
}

const SalesAnalyticsPage: React.FC<SalesAnalyticsPageProps> = ({ eventId }) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      setError("No event found. Please create an event first.");
      return;
    }

    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await authenticatedRequest<AnalyticsData>(
          `${API_BASE_URL}/events/${eventId}/ticket-analytics/`
        );
        setData(response);
      } catch (err: any) {
        console.error("Analytics fetch error:", err);
        setError(err.message || "Could not load analytics.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [eventId]);

  if (loading) {
    return (
      <div style={{ padding: "48px", textAlign: "center" }}>
        <div style={{
          width: "40px", height: "40px", border: "3px solid #e5e7eb",
          borderTopColor: "#6366f1", borderRadius: "50%",
          animation: "spin 1s linear infinite", margin: "0 auto 16px"
        }} />
        <p style={{ color: "#6b7280", fontSize: "14px" }}>
          Analyzing ticket sales data...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: "24px", margin: "24px", borderRadius: "12px",
        background: "#fef2f2", border: "1px solid #fecaca"
      }}>
        <p style={{ color: "#dc2626", fontWeight: 600, marginBottom: "4px" }}>
          Unable to load analytics
        </p>
        <p style={{ color: "#991b1b", fontSize: "13px", margin: 0 }}>{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const { summary, tickets, ai_insights } = data;

  const healthColors = {
    good: { bg: "#ecfdf5", border: "#86efac", text: "#166534", icon: "✅" },
    warning: { bg: "#fffbeb", border: "#fde68a", text: "#92400e", icon: "⚠️" },
    critical: { bg: "#fef2f2", border: "#fecaca", text: "#991b1b", icon: "🚨" },
  };
  const health = healthColors[ai_insights?.overall_health || "good"];

  const actionColors = {
    increase: { bg: "#ecfdf5", text: "#166534", icon: "📈" },
    decrease: { bg: "#fef2f2", text: "#991b1b", icon: "📉" },
    maintain: { bg: "#eff6ff", text: "#1e40af", icon: "✅" },
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1100px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{
          fontSize: "24px", fontWeight: 700, margin: "0 0 4px",
          color: "#111827"
        }}>
          Sales Analytics
        </h2>
        <p style={{ color: "#6b7280", margin: 0, fontSize: "14px" }}>
          Real-time ticket performance and AI-powered pricing insights
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px", marginBottom: "24px"
      }}>
        <SummaryCard
          label="Total Tickets Sold"
          value={summary.total_sold.toLocaleString()}
          sub={summary.total_capacity
            ? `of ${summary.total_capacity.toLocaleString()} capacity`
            : "unlimited capacity"}
          color="#6366f1"
        />
        <SummaryCard
          label="Total Revenue"
          value={`₦${summary.total_revenue.toLocaleString()}`}
          sub={`from ${tickets.length} ticket types`}
          color="#22c55e"
        />
        <SummaryCard
          label="Sell-Through Rate"
          value={`${summary.overall_sell_through}%`}
          sub={summary.overall_sell_through >= 75 ? "Strong performance" :
               summary.overall_sell_through >= 40 ? "Moderate performance" :
               "Needs improvement"}
          color={summary.overall_sell_through >= 75 ? "#22c55e" :
                 summary.overall_sell_through >= 40 ? "#f59e0b" : "#ef4444"}
        />
        <SummaryCard
          label="Remaining"
          value={summary.total_capacity
            ? (summary.total_capacity - summary.total_sold).toLocaleString()
            : "∞"}
          sub="tickets available"
          color="#8b5cf6"
        />
      </div>

      {/* AI Health Banner */}
      {ai_insights && (
        <div style={{
          padding: "16px 20px", borderRadius: "12px",
          background: health.bg, border: `1px solid ${health.border}`,
          marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px"
        }}>
          <span style={{ fontSize: "24px" }}>{health.icon}</span>
          <div>
            <strong style={{ color: health.text, fontSize: "14px" }}>
              AI Assessment
            </strong>
            <p style={{ color: health.text, margin: "2px 0 0", fontSize: "13px" }}>
              {ai_insights.overall_summary}
            </p>
          </div>
        </div>
      )}

      {/* Per-Ticket Analytics */}
      <h3 style={{
        fontSize: "16px", fontWeight: 600, marginBottom: "12px",
        color: "#374151"
      }}>
        Ticket Performance
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
        {tickets.map((ticket) => {
          const recommendation = ai_insights?.ticket_recommendations?.find(
            (r) => r.ticket_name?.toLowerCase() === ticket.name?.toLowerCase()
          );
          const actionStyle = recommendation
            ? actionColors[recommendation.action] || actionColors.maintain
            : null;

          return (
            <div key={ticket.id} style={{
              border: "1px solid #e5e7eb", borderRadius: "12px",
              background: "#fff", overflow: "hidden"
            }}>
              {/* Ticket Header */}
              <div style={{
                padding: "16px 20px",
                display: "flex", justifyContent: "space-between",
                alignItems: "center", flexWrap: "wrap", gap: "12px"
              }}>
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    marginBottom: "4px"
                  }}>
                    <strong style={{ fontSize: "15px", color: "#111827" }}>
                      {ticket.name}
                    </strong>
                    <span style={{
                      background: ticket.type === "paid" ? "#eff6ff" :
                                  ticket.type === "free" ? "#ecfdf5" : "#f3f0ff",
                      color: ticket.type === "paid" ? "#2563eb" :
                             ticket.type === "free" ? "#16a34a" : "#7c3aed",
                      padding: "2px 8px", borderRadius: "6px",
                      fontSize: "11px", fontWeight: 600, textTransform: "capitalize"
                    }}>
                      {ticket.type}
                    </span>
                  </div>
                  <span style={{ color: "#6b7280", fontSize: "13px" }}>
                    ₦{ticket.price.toLocaleString()} per ticket
                  </span>
                </div>

                {/* Stats */}
                <div style={{
                  display: "flex", gap: "24px", flexWrap: "wrap"
                }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{
                      fontSize: "20px", fontWeight: 700,
                      color: "#111827"
                    }}>
                      {ticket.sold}
                    </div>
                    <div style={{ fontSize: "11px", color: "#9ca3af" }}>Sold</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{
                      fontSize: "20px", fontWeight: 700,
                      color: ticket.remaining !== null && ticket.remaining <= 5
                        ? "#ef4444" : "#111827"
                    }}>
                      {ticket.remaining !== null ? ticket.remaining : "∞"}
                    </div>
                    <div style={{ fontSize: "11px", color: "#9ca3af" }}>Remaining</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{
                      fontSize: "20px", fontWeight: 700,
                      color: "#22c55e"
                    }}>
                      ₦{ticket.revenue.toLocaleString()}
                    </div>
                    <div style={{ fontSize: "11px", color: "#9ca3af" }}>Revenue</div>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ padding: "0 20px 12px" }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  fontSize: "11px", color: "#9ca3af", marginBottom: "4px"
                }}>
                  <span>{ticket.sell_through_percent}% sold</span>
                  <span>
                    {ticket.capacity ? `${ticket.capacity} total` : "Unlimited"}
                  </span>
                </div>
                <div style={{
                  height: "8px", borderRadius: "4px", background: "#f3f4f6"
                }}>
                  <div style={{
                    height: "100%",
                    width: `${Math.min(ticket.sell_through_percent, 100)}%`,
                    borderRadius: "4px",
                    background: ticket.sell_through_percent >= 80
                      ? "linear-gradient(90deg, #22c55e, #16a34a)"
                      : ticket.sell_through_percent >= 40
                      ? "linear-gradient(90deg, #f59e0b, #d97706)"
                      : "linear-gradient(90deg, #6366f1, #8b5cf6)",
                    transition: "width 0.5s ease"
                  }} />
                </div>
              </div>

              {/* AI Recommendation */}
              {recommendation && (
                <div style={{
                  padding: "10px 20px", borderTop: "1px solid #f3f4f6",
                  background: actionStyle?.bg || "#f9fafb",
                  display: "flex", alignItems: "center", gap: "10px",
                  flexWrap: "wrap"
                }}>
                  <span style={{ fontSize: "16px" }}>
                    {actionStyle?.icon}
                  </span>
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <span style={{
                      fontSize: "12px", fontWeight: 600,
                      color: actionStyle?.text || "#374151",
                      textTransform: "capitalize"
                    }}>
                      {recommendation.action} price
                    </span>
                    <span style={{
                      fontSize: "12px", color: "#6b7280",
                      marginLeft: "8px"
                    }}>
                      → ₦{recommendation.suggested_price?.toLocaleString()}
                    </span>
                  </div>
                  <p style={{
                    fontSize: "12px", color: "#6b7280",
                    margin: 0, flex: "2 1 300px"
                  }}>
                    {recommendation.reason}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Marketing Tips */}
      {ai_insights?.marketing_tips && ai_insights.marketing_tips.length > 0 && (
        <div style={{
          borderRadius: "12px", border: "1px solid #e5e7eb",
          background: "#fff", overflow: "hidden"
        }}>
          <div style={{
            padding: "14px 20px",
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            color: "#fff", display: "flex", alignItems: "center", gap: "8px"
          }}>
            <span style={{ fontSize: "18px" }}>💡</span>
            <strong style={{ fontSize: "14px" }}>AI Marketing Tips</strong>
          </div>
          <div style={{ padding: "16px 20px" }}>
            {ai_insights.marketing_tips.map((tip, i) => (
              <div key={i} style={{
                padding: "10px 0",
                borderBottom: i < ai_insights.marketing_tips.length - 1 ? "1px solid #f3f4f6" : "none",
                display: "flex", gap: "10px", alignItems: "flex-start"
              }}>
                <span style={{
                  background: "#f3f0ff", color: "#6366f1",
                  borderRadius: "50%", width: "22px", height: "22px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "11px", fontWeight: 700, flexShrink: 0
                }}>
                  {i + 1}
                </span>
                <p style={{
                  fontSize: "13px", color: "#374151",
                  margin: 0, lineHeight: 1.5
                }}>
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Summary Card Component
function SummaryCard({
  label, value, sub, color
}: {
  label: string; value: string; sub: string; color: string;
}) {
  return (
    <div style={{
      padding: "20px", borderRadius: "12px",
      border: "1px solid #e5e7eb", background: "#fff"
    }}>
      <p style={{
        fontSize: "12px", color: "#9ca3af",
        margin: "0 0 6px", fontWeight: 500, textTransform: "uppercase",
        letterSpacing: "0.5px"
      }}>
        {label}
      </p>
      <p style={{
        fontSize: "28px", fontWeight: 700, margin: "0 0 4px",
        color: color
      }}>
        {value}
      </p>
      <p style={{
        fontSize: "12px", color: "#9ca3af", margin: 0
      }}>
        {sub}
      </p>
    </div>
  );
}

export default SalesAnalyticsPage;
