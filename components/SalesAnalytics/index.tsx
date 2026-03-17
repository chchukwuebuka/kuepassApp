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
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>Analyzing ticket sales data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorCard}>
        <p className={styles.errorTitle}>Unable to load analytics</p>
        <p className={styles.errorText}>{error}</p>
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
    <div className={styles.analyticsContainer}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>Sales Analytics</h2>
        <p className={styles.subtitle}>
          Real-time ticket performance and AI-powered pricing insights
        </p>
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryGrid}>
        <SummaryCard
          label="Total Tickets Sold"
          value={summary.total_sold.toLocaleString()}
          sub={summary.total_capacity
            ? `of ${summary.total_capacity.toLocaleString()} capacity`
            : "unlimited capacity"}
          highlightColor="#6366f1"
        />
        <SummaryCard
          label="Total Revenue"
          value={`₦${summary.total_revenue.toLocaleString()}`}
          sub={`from ${tickets.length} ticket types`}
          highlightColor="#22c55e"
        />
        <SummaryCard
          label="Sell-Through Rate"
          value={`${summary.overall_sell_through}%`}
          sub={summary.overall_sell_through >= 75 ? "Strong performance" :
               summary.overall_sell_through >= 40 ? "Moderate performance" :
               "Needs improvement"}
          highlightColor={summary.overall_sell_through >= 75 ? "#22c55e" :
                 summary.overall_sell_through >= 40 ? "#f59e0b" : "#ef4444"}
        />
        <SummaryCard
          label="Remaining"
          value={summary.total_capacity
            ? (summary.total_capacity - summary.total_sold).toLocaleString()
            : "∞"}
          sub="tickets available"
          highlightColor="#8b5cf6"
        />
      </div>

      {/* AI Health Banner */}
      {ai_insights && (
        <div 
          className={styles.aiAssessmentBox}
          style={{ background: health.bg, border: `1px solid ${health.border}` }}
        >
          <span className={styles.aiAssessmentIcon}>{health.icon}</span>
          <div className={styles.aiAssessmentContent}>
            <h3 className={styles.aiAssessmentTitle} style={{ color: health.text }}>
              AI Assessment
            </h3>
            <p className={styles.aiAssessmentText} style={{ color: health.text }}>
              {ai_insights.overall_summary}
            </p>
          </div>
        </div>
      )}

      {/* Per-Ticket Analytics */}
      <h3 className={styles.sectionTitle}>Ticket Performance</h3>
      <div className={styles.ticketList}>
        {tickets.map((ticket) => {
          const recommendation = ai_insights?.ticket_recommendations?.find(
            (r) => r.ticket_name?.toLowerCase() === ticket.name?.toLowerCase()
          );
          const actionStyle = recommendation
            ? actionColors[recommendation.action] || actionColors.maintain
            : null;

          return (
            <div key={ticket.id} className={styles.ticketCard}>
              {/* Ticket Header */}
              <div className={styles.ticketHeader}>
                <div className={styles.ticketInfo}>
                  <div className={styles.ticketNameRow}>
                    <h4 className={styles.ticketName}>{ticket.name}</h4>
                    <span 
                      className={styles.ticketTypeBadge}
                      style={{
                        background: ticket.type === "paid" ? "#eff6ff" : ticket.type === "free" ? "#ecfdf5" : "#f5f3ff",
                        color: ticket.type === "paid" ? "#2563eb" : ticket.type === "free" ? "#16a34a" : "#7c3aed"
                      }}
                    >
                      {ticket.type}
                    </span>
                  </div>
                  <span className={styles.ticketPrice}>
                    ₦{ticket.price.toLocaleString()} per ticket
                  </span>
                </div>

                {/* Stats */}
                <div className={styles.ticketStatsGrid}>
                  <div className={styles.ticketStat}>
                    <div className={styles.ticketStatValue}>{ticket.sold}</div>
                    <div className={styles.ticketStatLabel}>Sold</div>
                  </div>
                  <div className={styles.ticketStat}>
                    <div 
                      className={styles.ticketStatValue}
                      style={{ color: ticket.remaining !== null && ticket.remaining <= 5 ? "#ef4444" : "#111827" }}
                    >
                      {ticket.remaining !== null ? ticket.remaining : "∞"}
                    </div>
                    <div className={styles.ticketStatLabel}>Remaining</div>
                  </div>
                  <div className={styles.ticketStat}>
                    <div className={styles.ticketStatValue} style={{ color: "#025a3a" }}>
                      ₦{ticket.revenue.toLocaleString()}
                    </div>
                    <div className={styles.ticketStatLabel}>Revenue</div>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className={styles.progressContainer}>
                <div className={styles.progressLabelRow}>
                  <span>{ticket.sell_through_percent}% sold</span>
                  <span>{ticket.capacity ? `${ticket.capacity} total` : "Unlimited"}</span>
                </div>
                <div className={styles.progressBarTrack}>
                  <div 
                    className={styles.progressBarFill}
                    style={{
                      width: `${Math.min(ticket.sell_through_percent, 100)}%`,
                      background: ticket.sell_through_percent >= 80 ? "linear-gradient(90deg, #22c55e, #16a34a)" :
                                  ticket.sell_through_percent >= 40 ? "linear-gradient(90deg, #f59e0b, #d97706)" :
                                  "linear-gradient(90deg, #6366f1, #8b5cf6)"
                    }}
                  />
                </div>
              </div>

              {/* AI Recommendation */}
              {recommendation && (
                <div 
                  className={styles.ticketAlert}
                  style={{ background: actionStyle?.bg || "#f9fafb" }}
                >
                  <span className={styles.ticketAlertIcon}>{actionStyle?.icon}</span>
                  <div className={styles.ticketAlertMeta}>
                    <span 
                      className={styles.ticketAlertAction}
                      style={{ color: actionStyle?.text || "#374151" }}
                    >
                      {recommendation.action} price
                    </span>
                    <span className={styles.ticketAlertPrice}>
                      → ₦{recommendation.suggested_price?.toLocaleString()}
                    </span>
                  </div>
                  <p className={styles.ticketAlertReason}>{recommendation.reason}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Marketing Tips */}
      {ai_insights?.marketing_tips && ai_insights.marketing_tips.length > 0 && (
        <div className={styles.marketingBox}>
          <div className={styles.marketingHeader}>
            <span className={styles.marketingHeaderIcon}>💡</span>
            <h3 className={styles.marketingHeaderTitle}>AI Marketing Tips</h3>
          </div>
          <div className={styles.marketingList}>
            {ai_insights.marketing_tips.map((tip, i) => (
              <div key={i} className={styles.marketingItem}>
                <div className={styles.marketingItemNum}>{i + 1}</div>
                <p className={styles.marketingItemText}>{tip}</p>
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
  label, value, sub, highlightColor
}: {
  label: string; value: string; sub: string; highlightColor: string;
}) {
  return (
    <div className={styles.summaryCard}>
      <div 
        className={styles.summaryCardHighlight} 
        style={{ background: `linear-gradient(90deg, ${highlightColor}, transparent)` }}
      />
      <h3 className={styles.summaryLabel}>{label}</h3>
      <p className={styles.summaryValue}>{value}</p>
      <p className={styles.summarySub}>{sub}</p>
    </div>
  );
}

export default SalesAnalyticsPage;
