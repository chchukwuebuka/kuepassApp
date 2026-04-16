"use client";

import React from "react";
import Image from "next/image";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { Ticket, Question } from "@/store/types";
import styles from "./styles.module.css";
import { useRouter } from "next/navigation";
import VendorRecommendations from "./VendorRecommendations";
import { EventService } from "./EventServiceModal";

interface ExtendedTicket {
  id: string;
  name: string;
  price: number;
  quantity: number | "Unlimited" | null;
  type: "Paid" | "Free" | "Invite" | "Donations";
  startDate?: string;
  endDate?: string;
  validTill?: string; // Backend field: valid_till
  ticketSold?: number; // Backend field: ticket_sold (readOnly)
  status?: string; // Backend field: status (enum)
  purchaseLimit?: number;
  description?: string;
  perks?: string[];
}

interface TicketsStepProps {
  tickets: ExtendedTicket[];
  onAddTicket: () => void;
  onRemoveTicket: (ticketId: string) => void;
  onBack: () => void;
  onNext: () => void;
  onAddQuestions?: () => void;
  questions?: Question[];
  onEditQuestion?: (question: Question) => void;
  onRemoveQuestion?: (questionId: string) => void;
  services?: EventService[];
  onAddServiceClick?: () => void;
  onEditServiceClick?: (service: EventService) => void;
  onRemoveService?: (id: string) => void;
  saveDraft: () => void;
  eventType?: string;
  eventLocation?: string;
  guestCount?: string;
  onVendorsSelected?: (vendorIds: (number | string)[]) => void;
  isSubmitting?: boolean;
}

export default function TicketsStep({
  tickets,
  onAddTicket,
  onRemoveTicket,
  onBack,
  onNext,
  onAddQuestions,
  questions = [],
  onEditQuestion,
  onRemoveQuestion,
  saveDraft,
  eventType,
  eventLocation,
  guestCount,
  onVendorsSelected,
  services = [],
  onAddServiceClick,
  onEditServiceClick,
  onRemoveService,
  isSubmitting = false,
}: TicketsStepProps) {
  const router = useRouter();

  const formatTicketId = (id: string): string => {
    // Extract numeric part or use first 5 characters
    const numericMatch = id.match(/\d+/);
    if (numericMatch) {
      return numericMatch[0].padStart(5, "0").slice(-5);
    }
    return id.slice(0, 5).padStart(5, "0");
  };

  const formatPrice = (ticket: ExtendedTicket): string => {
    if (ticket.type === "Free") return "Free";
    if (ticket.type === "Donations" || ticket.type === "Invite")
      return "Donation";
    return `₦${Number(ticket.price).toLocaleString()}`;
  };

  const formatValidTill = (ticket: ExtendedTicket): string => {
    // Prioritize valid_till from backend, fallback to endDate
    const dateToFormat = ticket.validTill || ticket.endDate;
    if (dateToFormat) {
      try {
        const date = new Date(dateToFormat);
        // Format as MM/DD/YY (e.g., "10/10/24")
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const year = String(date.getFullYear()).slice(-2);
        return `${month}/${day}/${year}`;
      } catch (error) {
        // Fallback to ordinal format if date parsing fails
        const date = new Date(dateToFormat);
        const day = date.getDate();
        const month = date
          .toLocaleString("en-US", { month: "short" })
          .toLowerCase();
        return `${day}${getOrdinalSuffix(day)} ${month}`;
      }
    }
    return "event date";
  };

  const getOrdinalSuffix = (day: number): string => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  const getTicketStatus = (
    ticket: ExtendedTicket
  ): { text: string; className: string } => {
    // Use status from backend if available, otherwise calculate from ticket_sold
    if (ticket.status) {
      // Map backend status enum to display text
      const statusMap: { [key: string]: { text: string; className: string } } =
        {
          available: { text: "Available", className: styles.statusAvailable },
          sold_out: {
            text: "Sold out",
            className: styles.statusSoldOut,
          },
          expired: {
            text: "Expired",
            className: styles.statusSoldOut,
          },
          inactive: {
            text: "Inactive",
            className: styles.statusSoldOut,
          },
        };
      const normalizedStatus = ticket.status.toLowerCase().replace(/\s+/g, "_");
      return (
        statusMap[normalizedStatus] || {
          text: ticket.status,
          className: styles.statusAvailable,
        }
      );
    }

    // Fallback: calculate status based on ticket_sold and quantity
    const sold = ticket.ticketSold || 0;
    const total =
      ticket.quantity === "Unlimited" ? Infinity : (ticket.quantity as number);

    if (total !== Infinity && sold >= total) {
      return { text: "Sold out", className: styles.statusSoldOut };
    }
    return { text: "Available", className: styles.statusAvailable };
  };

  return (
    <>
      {/* Tickets Section */}
      <div className={styles.section}>
        <div className={styles.ticketsSectionHeader}>
          <div>
            <h2 className={styles.ticketsSectionTitle}>Tickets</h2>
            <p className={styles.ticketsSectionSubtitle}>
              Launch your event in no time—just minutes.
            </p>
          </div>
          <button
            type="button"
            className={styles.addTicketHeaderButton}
            onClick={onAddTicket}
          >
            <IconPlus size={20} />
            Add Ticket
          </button>
        </div>

        <div className={styles.ticketsStepContainer}>
          {tickets.length === 0 ? (
            <div className={styles.ticketsEmptyState}>
              <div className={styles.ticketsIllustration}>
                <Image
                  src="/images/aboutLady.png"
                  alt="Event tickets illustration"
                  width={200}
                  height={200}
                  className={styles.ticketsIllustrationImage}
                />
              </div>
              <p className={styles.ticketsEmptyText}>
                Ready to get started? Create your first ticket now in just one
                minute.
              </p>
              <button
                type="button"
                className={styles.addTicketButton}
                onClick={onAddTicket}
              >
                <IconPlus size={20} />
                Add a ticket to this event
              </button>
            </div>
          ) : (
            <div className={styles.ticketsTableContainer}>
              <table className={styles.ticketsTable}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>TICKET NAME</th>
                    <th>TICKET SOLD</th>
                    <th>TICKET PRICE</th>
                    <th>VALID TILL</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => {
                    const status = getTicketStatus(ticket);
                    const sold = ticket.ticketSold || 0; // Use ticket_sold from backend
                    const total =
                      ticket.quantity === "Unlimited"
                        ? "Unlimited"
                        : ticket.quantity;
                    return (
                      <tr key={ticket.id}>
                        <td>{formatTicketId(ticket.id)}</td>
                        <td className={styles.ticketNameCell}>{ticket.name}</td>
                        <td>
                          {total === "Unlimited"
                            ? `${sold}/Unlimited`
                            : `${sold}/${total}`}
                        </td>
                        <td>{formatPrice(ticket)}</td>
                        <td>{formatValidTill(ticket)}</td>
                        <td>
                          <span className={status.className}>
                            {status.text}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className={styles.removeTicketButton}
                            onClick={() => onRemoveTicket(ticket.id)}
                            title={`Remove ${ticket.name}`}
                          >
                            <IconTrash size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>



      {/* Navigation Buttons */}
      <div className={styles.ticketsStepSaveButtonsContainer}>
        <button
          type="button"
          className={styles.ticketsStepBackButton}
          onClick={() => {
            saveDraft();
            onBack();
          }}
        >
          Back
        </button>
        <button
          type="button"
          className={styles.ticketsStepSaveExitButton}
          onClick={() => {
            saveDraft();
            router.push("/dashboard?mode=createEvent");
          }}
        >
          Save & exit
        </button>
        <button
          type="button"
          className={styles.ticketsStepPreviewPublishButton}
          onClick={() => {
            if (!isSubmitting) {
              saveDraft();
              onNext();
            }
          }}
          disabled={tickets.length === 0 || isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create Event"}
        </button>
      </div>
    </>
  );
}
