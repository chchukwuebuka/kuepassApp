"use client";

import { useState, useEffect } from "react";
import styles from "./styles.module.css";
import { Ticket } from "../../store/types";
import SearchBar from "../SearchBar";
import ExportButton from "../ExportButton";
import TabFilter from "../TabFilter";
import UserTable from "../UserTable";
import AttendeeDetailsTable from "../AttendeeDetailsTable";
import Image from "next/image";
import { Text } from "@mantine/core";
import TicketModal from "../Ticket/ticketModal";
import { authenticatedRequest } from "../../app/services/auth";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://api.kuepass.com/api/"
).replace(/\/$/, "");

interface TicketDashboardProps {
  eventId: string;
}

// --- UPDATED Ticket type to include the new field from the API ---
interface ApiTicket extends Ticket {
  sold_count: number;
}

const TicketDashboard: React.FC<TicketDashboardProps> = ({ eventId }) => {
  const [tickets, setTickets] = useState<ApiTicket[]>([]);
  const [totalAttendees, setTotalAttendees] = useState(0);
  const [validatedAttendees, setValidatedAttendees] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- REMOVED: The entire 'generateAttendeeTickets' function is no longer needed. ---

  // --- REFACTORED: The fetchData function is now much simpler ---
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Fetch all attendees for this event to get the total count
      // We use the corrected event_id parameter from our previous fix.
      const attendeesResponse = await authenticatedRequest<any>(
        `${API_BASE_URL}/attendees/?event_id=${eventId}`,
        "GET"
      );

      // Handle paginated response from backend
      let attendeesList: any[] = [];
      if (Array.isArray(attendeesResponse)) {
        attendeesList = attendeesResponse;
      } else if (attendeesResponse?.results && Array.isArray(attendeesResponse.results)) {
        attendeesList = attendeesResponse.results; // Handle paginated response
      } else if (attendeesResponse?.data && Array.isArray(attendeesResponse.data)) {
        attendeesList = attendeesResponse.data;
      }

      const totalCount = attendeesList.length || 0;
      const validatedCount = attendeesList.filter(
        (attendee) => attendee.is_validated === true
      ).length;

      setTotalAttendees(totalCount);
      setValidatedAttendees(validatedCount);

      console.log(
        `Total attendees: ${totalCount}, Validated attendees: ${validatedCount}`
      );

      // 2. Fetch tickets for this event (which now include sold_count)
      const ticketsResponse = await authenticatedRequest<ApiTicket[]>(
        `${API_BASE_URL}/tickets/?event=${eventId}`,
        "GET"
      );

      let tickets: ApiTicket[] = [];
      if (Array.isArray(ticketsResponse)) {
        tickets = ticketsResponse;
      } else if (Array.isArray((ticketsResponse as any).data)) {
        tickets = (ticketsResponse as any).data;
      } else if (Array.isArray((ticketsResponse as any).results)) {
        tickets = (ticketsResponse as any).results;
      }

      console.log("Tickets API response with sold_count:", tickets);

      // 3. Store all tickets for dynamic display
      setTickets(tickets);
    } catch (err: any) {
      console.error("Error fetching data:", err.message);
      setError("Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchData();
    } else {
      setError("No event ID provided.");
      setIsLoading(false);
    }
  }, [eventId]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Helper function to determine if a ticket is free
  const isTicketFree = (ticket: ApiTicket): boolean => {
    const price = parseFloat(ticket.category_price);
    return price === 0 || isNaN(price);
  };

  // Helper function to format ticket price
  const formatTicketPrice = (ticket: ApiTicket): string => {
    if (isTicketFree(ticket)) {
      return "Free";
    }
    return `₦${parseFloat(ticket.category_price).toFixed(2)}`;
  };

  const addTicket = async (ticketData: {
    name: string;
    price: number;
    type: "Paid" | "Free" | "Invite";
    quantity: number | "Unlimited";
    inviteEmail?: string;
  }) => {
    try {
      const payload = {
        event: eventId,
        name: ticketData.name,
        category_name: ticketData.type,
        category_price: ticketData.price.toString(),
        quantity: ticketData.quantity.toString(),
        ...(ticketData.type === "Invite" && {
          invite_email: ticketData.inviteEmail,
        }),
      };
      console.log("Creating ticket with payload:", payload);
      await authenticatedRequest(`${API_BASE_URL}/tickets/`, "POST", payload);

      // After creation, re-fetch everything so summary updates immediately
      await fetchData();
      closeModal(); // Close modal on success
    } catch (err: any) {
      console.error("Error creating ticket:", err.message);
      alert(`Failed to create ticket: ${err.message}`);
    }
  };

  if (isLoading) {
    return <div className={styles.container}>Loading attendee data...</div>;
  }

  return (
    <div className={styles.container}>
      {error && (
        <Text color="red" mb="md">
          {error}
        </Text>
      )}

      <div className={styles.summary}>
        {tickets.map((ticket) => {
          const totalQuantity = (() => {
            if (
              ticket.quantity === "Unlimited" ||
              ticket.quantity === null ||
              ticket.quantity === undefined
            ) {
              return Infinity;
            }
            const parsed = parseInt(ticket.quantity as string);
            return isNaN(parsed) ? Infinity : parsed;
          })();

          return (
            <div key={ticket.id} className={styles.summaryRegular}>
              <h4 className={styles.summaryText}>
                {ticket.name} - {formatTicketPrice(ticket)}
              </h4>
              {/* <p className={styles.summaryNumber}>
                {ticket.sold_count}/
                {totalQuantity === Infinity ? "Unlimited" : totalQuantity}
              </p> */}
            </div>
          );
        })}

        <div className={styles.inputIMGcard}>
          <button
            type="button"
            onClick={openModal}
            aria-label="Add Ticket"
            className={styles.addButton}
          >
            <Image
              src="/images/addsquare.png"
              alt="Add Ticket"
              width={26}
              height={26}
              className={styles.inputIMG}
            />
          </button>
          <Text className={styles.inputText}>CREATE A NEW TICKET</Text>
        </div>
      </div>

      <Text mb="md">Total Attendees: {totalAttendees}</Text>

      <div className={styles.searchExport}>
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <ExportButton eventId={eventId} />
      </div>

      <TabFilter
        filter={filter}
        setFilter={setFilter}
        totalAttendees={totalAttendees}
        validatedAttendees={validatedAttendees}
      />

      {filter === "details" ? (
        <AttendeeDetailsTable searchQuery={searchQuery} eventId={eventId} />
      ) : (
        <UserTable searchQuery={searchQuery} filter={filter as any} eventId={eventId} />
      )}

      <TicketModal
        isModalOpen={isModalOpen}
        closeModal={closeModal}
        addTicket={addTicket}
      />
    </div>
  );
};

export default TicketDashboard;
