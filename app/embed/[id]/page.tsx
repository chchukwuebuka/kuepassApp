"use client";

export const dynamicParams = true;
export function generateStaticParams() {
  return [];
}

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import styles from "./styles.module.css";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.kuepass.com/api/"
).replace(/\/$/, "");

interface TicketData {
  id: string;
  event: string;
  name?: string;
  category_name?: string;
  category_price?: string | number;
  quantity?: number | string | null;
  description?: string | null;
  ticket_type?: string;
  perks?: string[];
  ticket_sold?: number;
}

interface EventData {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  location: string;
  address?: string;
  customization?: {
    banner_url?: string | string[];
    card_color?: string;
    button_text?: string;
  };
}

export default function EmbedPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [event, setEvent] = useState<EventData | null>(null);
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTickets, setSelectedTickets] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        // Fetch event
        const eventRes = await fetch(`${API_BASE_URL}/events/${id}/`);
        if (!eventRes.ok) throw new Error("Event not found");
        const eventJson = await eventRes.json();
        const eventData = eventJson?.data || eventJson;
        setEvent(eventData);

        // Fetch tickets
        const ticketRes = await fetch(`${API_BASE_URL}/tickets/?event=${id}`);
        if (ticketRes.ok) {
          const ticketJson = await ticketRes.json();
          const list = Array.isArray(ticketJson)
            ? ticketJson
            : ticketJson?.data || ticketJson?.results || [];
          const filtered = list.filter((t: TicketData) => t.event === id);
          setTickets(filtered);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const updateQty = (ticketId: string, delta: number) => {
    setSelectedTickets((prev) => {
      const current = prev[ticketId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[ticketId];
        return copy;
      }
      return { ...prev, [ticketId]: next };
    });
  };

  const totalAmount = tickets.reduce((sum, t) => {
    const qty = selectedTickets[t.id] || 0;
    const price = t.category_price
      ? parseFloat(t.category_price.toString())
      : 0;
    return sum + price * qty;
  }, 0);

  const totalQty = Object.values(selectedTickets).reduce((s, q) => s + q, 0);

  const handleGetTickets = () => {
    // Navigate to the registration page on the main Kuepass site
    const baseUrl =
      typeof window !== "undefined" ? window.location.origin : "";
    const ticketParams = Object.entries(selectedTickets)
      .map(([tid, qty]) => `ticket_${tid}=${qty}`)
      .join("&");
    window.open(
      `${baseUrl}/eventSchedule/eventDetails/${id}?${ticketParams}`,
      "_blank"
    );
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className={styles.embedContainer}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading tickets...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className={styles.embedContainer}>
        <div className={styles.errorState}>
          <p>{error || "Event not found"}</p>
        </div>
      </div>
    );
  }

  const bannerUrl = event.customization?.banner_url
    ? Array.isArray(event.customization.banner_url)
      ? event.customization.banner_url[0]
      : event.customization.banner_url
    : null;

  const buttonText = event.customization?.button_text || "Get Tickets";
  const cardColor = event.customization?.card_color || "#025a3a";

  return (
    <div className={styles.embedContainer}>
      {/* Banner */}
      {bannerUrl && (
        <div className={styles.banner}>
          <img src={bannerUrl} alt={event.title} />
        </div>
      )}

      {/* Event Info */}
      <div className={styles.eventInfo}>
        <h2 className={styles.eventTitle}>{event.title}</h2>
        <div className={styles.eventMeta}>
          <span className={styles.metaItem}>
            📅 {formatDate(event.start_date)}
          </span>
          <span className={styles.metaItem}>
            🕐 {formatTime(event.start_date)}
          </span>
          <span className={styles.metaItem}>
            📍 {event.address || event.location || "TBA"}
          </span>
        </div>
      </div>

      {/* Tickets */}
      <div className={styles.ticketList}>
        {tickets.length === 0 ? (
          <p className={styles.noTickets}>No tickets available at this time.</p>
        ) : (
          tickets.map((ticket) => {
            const price = ticket.category_price
              ? parseFloat(ticket.category_price.toString())
              : 0;
            const isFree = price <= 0;
            const qty = selectedTickets[ticket.id] || 0;
            const soldOut =
              ticket.quantity &&
              ticket.quantity !== "Unlimited" &&
              ticket.ticket_sold !== undefined &&
              ticket.ticket_sold >= parseInt(ticket.quantity.toString());

            return (
              <div
                key={ticket.id}
                className={`${styles.ticketCard} ${qty > 0 ? styles.ticketCardSelected : ""}`}
                style={
                  qty > 0
                    ? { borderColor: cardColor }
                    : undefined
                }
              >
                <div className={styles.ticketInfo}>
                  <div className={styles.ticketHeader}>
                    <h3 className={styles.ticketName}>
                      {ticket.category_name || ticket.name || "Ticket"}
                    </h3>
                    <span
                      className={styles.ticketPrice}
                      style={{ color: cardColor }}
                    >
                      {isFree ? "Free" : `₦${price.toLocaleString()}`}
                    </span>
                  </div>
                  {ticket.description && (
                    <p className={styles.ticketDescription}>
                      {ticket.description}
                    </p>
                  )}
                  {ticket.perks && ticket.perks.length > 0 && (
                    <div className={styles.perksList}>
                      {ticket.perks.slice(0, 3).map((perk, i) => (
                        <span key={i} className={styles.perkBadge}>
                          ✓ {perk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quantity controls */}
                <div className={styles.qtyControls}>
                  {soldOut ? (
                    <span className={styles.soldOut}>Sold Out</span>
                  ) : (
                    <>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => updateQty(ticket.id, -1)}
                        disabled={qty === 0}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className={styles.qtyCount}>{qty}</span>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => updateQty(ticket.id, 1)}
                        style={{ background: cardColor, color: "#fff" }}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Checkout footer */}
      {totalQty > 0 && (
        <div className={styles.checkoutBar}>
          <div className={styles.checkoutInfo}>
            <span className={styles.checkoutQty}>
              {totalQty} ticket{totalQty > 1 ? "s" : ""}
            </span>
            <span className={styles.checkoutTotal}>
              {totalAmount > 0 ? `₦${totalAmount.toLocaleString()}` : "Free"}
            </span>
          </div>
          <button
            className={styles.checkoutBtn}
            style={{ background: cardColor }}
            onClick={handleGetTickets}
          >
            {buttonText}
          </button>
        </div>
      )}

      {/* Powered by */}
      <div className={styles.poweredBy}>
        <a
          href={`${typeof window !== "undefined" ? window.location.origin : ""}/eventSchedule/eventDetails/${id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by <strong>Kuepass</strong>
        </a>
      </div>
    </div>
  );
}
