
// "use client";

// import { useState, useEffect } from "react";
// import styles from "./styles.module.css";
// import { Ticket } from "../../store/types";
// import SearchBar from "../SearchBar";
// import ExportButton from "../ExportButton";
// import TabFilter from "../TabFilter";
// import UserTable from "../UserTable";
// import Image from "next/image";
// import { Text } from "@mantine/core";
// import TicketModal from "../Ticket/ticketModal"; // adjust path as needed
// import { authenticatedRequest } from "../../app/services/auth";

// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_BASE_URL ||
//   "https://keupass-48c2ae65f897.herokuapp.com/api";

// interface TicketDashboardProps {
//   eventId: string;
// }

// const TicketDashboard: React.FC<TicketDashboardProps> = ({ eventId }) => {
//   // State for summary (sold/total) of Regular & VIP
//   const [regularTickets, setRegularTickets] = useState({ sold: 0, total: 0 });
//   const [vipTickets, setVipTickets] = useState({ sold: 0, total: 0 });

//   // State for “how many people registered for this event”
//   const [totalAttendees, setTotalAttendees] = useState(0);

//   // Modal open/close
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // UI states
//   const [searchQuery, setSearchQuery] = useState("");
//   const [filter, setFilter] = useState("all");
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const generateAttendeeTickets = (
//     attendees: any[],
//     regularTicketId: string,
//     vipTicketId: string
//   ) => {
//     const attendeeTickets = JSON.parse(
//       localStorage.getItem("attendee_tickets") || "[]"
//     );
//     const existingMappings = attendeeTickets.filter(
//       (at: { event_id: string }) => at.event_id === eventId
//     );

//     // If all attendees already mapped, do nothing
//     if (existingMappings.length >= attendees.length) {
//       console.log(
//         "Mappings already exist for all attendees:",
//         existingMappings
//       );
//       return attendeeTickets;
//     }

//     // Find which attendees still need a mapping
//     const unmappedAttendees = attendees.filter(
//       (attendee: any) =>
//         !existingMappings.some(
//           (at: { attendee_id: string }) => at.attendee_id === attendee.id
//         )
//     );

//     // Assign first 20 to Regular, next 7 to VIP
//     const newMappings = [
//       ...unmappedAttendees
//         .slice(0, Math.min(20, unmappedAttendees.length))
//         .map((attendee: any) => ({
//           attendee_id: attendee.id,
//           ticket_id: regularTicketId,
//           event_id: eventId,
//         })),
//       ...unmappedAttendees
//         .slice(20, Math.min(27, unmappedAttendees.length))
//         .map((attendee: any) => ({
//           attendee_id: attendee.id,
//           ticket_id: vipTicketId,
//           event_id: eventId,
//         })),
//     ];

//     const updatedMappings = [...attendeeTickets, ...newMappings];
//     localStorage.setItem(
//       "attendee_tickets",
//       JSON.stringify(updatedMappings)
//     );
//     console.log("Generated new attendee-ticket mappings:", newMappings);
//     return updatedMappings;
//   };

//   const fetchData = async () => {
//     try {
//       setIsLoading(true);
//       setError(null);

//       //
//       // 1) Fetch all attendees for this event
//       //
//       const attendeesResponse = await authenticatedRequest(
//         `${API_BASE_URL}/attendees/?event=${eventId}`,
//         "GET"
//       );
//       console.log("Attendees API response:", attendeesResponse);

//       // Normalize to an array
//       let allAttendees: any[] = [];
//       if (Array.isArray(attendeesResponse)) {
//         allAttendees = attendeesResponse;
//       } else if (Array.isArray(attendeesResponse.data)) {
//         allAttendees = attendeesResponse.data;
//       } else if (Array.isArray(attendeesResponse.results)) {
//         allAttendees = attendeesResponse.results;
//       } else {
//         console.warn(
//           "Unable to find attendees array. Defaulting to empty.",
//           attendeesResponse
//         );
//         allAttendees = [];
//       }

//       // Keep only those with `event === eventId`
//       const attendeesForThisEvent = allAttendees.filter(
//         (att: any) => att.event === eventId
//       );
//       console.log(
//         "Filtered attendees for this event:",
//         attendeesForThisEvent.length,
//         "IDs:",
//         attendeesForThisEvent.map((a) => a.id)
//       );

//       // Immediately set totalAttendees count
//       setTotalAttendees(attendeesForThisEvent.length);

//       //
//       // 2) Fetch tickets for this event
//       //
//       const ticketsResponse = await authenticatedRequest(
//         `${API_BASE_URL}/tickets/?event=${eventId}`,
//         "GET"
//       );
//       console.log("Tickets API response:", ticketsResponse);

//       // Normalize to an array of Ticket
//       let tickets: Ticket[] = [];
//       if (Array.isArray(ticketsResponse)) {
//         tickets = ticketsResponse;
//       } else if (Array.isArray(ticketsResponse.data)) {
//         tickets = ticketsResponse.data;
//       } else if (Array.isArray(ticketsResponse.results)) {
//         tickets = ticketsResponse.results;
//       } else {
//         console.warn(
//           "Unable to find tickets array. Defaulting to empty.",
//           ticketsResponse
//         );
//         tickets = [];
//       }
//       console.log("Tickets count:", tickets.length, "Tickets:", tickets);

//       //
//       // 3) Identify which one is VIP vs. Regular by ticket.name
//       //    e.g. "ViicDev VIP" → VIP; anything else → Regular
//       //
//       const vipTicket = tickets.find((t) =>
//         t.name.toLowerCase().includes("vip")
//       );
//       const regularTicket = tickets.find(
//         (t) => !t.name.toLowerCase().includes("vip")
//       );

//       if (!regularTicket || !vipTicket) {
//         throw new Error("Missing required tickets (Regular or VIP).");
//       }

//       //
//       // 4) Generate (or retrieve) attendee↔ticket mappings
//       //
//       const attendeeTickets = generateAttendeeTickets(
//         attendeesForThisEvent,
//         regularTicket.id,
//         vipTicket.id
//       );

//       let regularCount = 0;
//       let vipCount = 0;
//       const unmappedAttendees: string[] = [];

//       for (const attendee of attendeesForThisEvent) {
//         const mapping = attendeeTickets.find(
//           (at: {
//             attendee_id: string;
//             ticket_id: string;
//             event_id: string;
//           }) =>
//             at.attendee_id === attendee.id && at.event_id === eventId
//         );

//         if (mapping) {
//           const ticketObj = tickets.find((t) => t.id === mapping.ticket_id);
//           if (ticketObj) {
//             if (ticketObj.name.toLowerCase().includes("vip")) {
//               vipCount++;
//             } else {
//               regularCount++;
//             }
//           } else {
//             unmappedAttendees.push(attendee.id);
//             console.warn("Ticket not found for mapping:", mapping);
//           }
//         } else {
//           unmappedAttendees.push(attendee.id);
//           console.warn("No mapping found for attendee:", attendee.id);
//         }
//       }

//       if (unmappedAttendees.length > 0) {
//         setError(
//           `Warning: ${unmappedAttendees.length} attendees lack ticket mappings.`
//         );
//         console.error("Unmapped attendees:", unmappedAttendees);
//       }

//       // 6) Update “sold” / “total” for Regular & VIP
//       setRegularTickets({
//         sold: regularCount,
//         total:
//           regularTicket.quantity === "Unlimited"
//             ? Infinity
//             : parseInt(regularTicket.quantity),
//       });
//       setVipTickets({
//         sold: vipCount,
//         total:
//           vipTicket.quantity === "Unlimited"
//             ? Infinity
//             : parseInt(vipTicket.quantity),
//       });

//       console.log("Regular sold:", regularCount);
//       console.log("VIP sold:", vipCount);
//     } catch (err: any) {
//       console.error("Error fetching data:", err.message, err.response?.data);
//       setError("Failed to load attendee or ticket data.");
//       setRegularTickets({ sold: 0, total: 0 });
//       setVipTickets({ sold: 0, total: 0 });
//       setTotalAttendees(0);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (eventId) {
//       fetchData();
//     } else {
//       setError("No event ID provided.");
//       setIsLoading(false);
//     }
//   }, [eventId]);

//   const openModal = () => {
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//   };

//   /**
//    * Called by TicketModal on form submission.
//    * Expects: { name, price, type, quantity, inviteEmail? }
//    */
//   const addTicket = async (ticketData: {
//     name: string;
//     price: number;
//     type: "Paid" | "Free" | "Invite";
//     quantity: number | "Unlimited";
//     inviteEmail?: string;
//   }) => {
//     try {
//       // Build payload for POST /tickets
//       const payload = {
//         event: eventId,
//         name: ticketData.name,
//         category_name: ticketData.type, // "Paid" | "Free" | "Invite"
//         category_price: ticketData.price.toString(), // price as string
//         quantity:
//           ticketData.quantity === "Unlimited"
//             ? "Unlimited"
//             : ticketData.quantity.toString(),
//         // If you need inviteEmail in your backend, include it here:
//         ...(ticketData.type === "Invite" && {
//           invite_email: ticketData.inviteEmail,
//         }),
//       };
//       console.log("Creating ticket with payload:", payload);

//       const response = await authenticatedRequest(
//         `${API_BASE_URL}/tickets`,
//         "POST",
//         payload
//       );
//       console.log("Ticket creation response:", response);

//       // After creation, re-fetch everything so summary updates immediately
//       await fetchData();
//     } catch (err: any) {
//       console.error("Error creating ticket:", err.message, err.response?.data);
//       alert(`Failed to create ticket: ${err.message}`);
//     }
//   };

//   if (isLoading) {
//     return <div className={styles.container}>Loading attendee data...</div>;
//   }

//   return (
//     <div className={styles.container}>
//       {error && (
//         <Text color="red" mb="md">
//           {error}
//         </Text>
//       )}

//       <div className={styles.summary}>
//         <div className={styles.summaryRegular}>
//           <h4 className={styles.summaryText}>REGULAR</h4>
//           <p className={styles.summaryNumber}>
//             {regularTickets.sold}/
//             {regularTickets.total === Infinity
//               ? "Unlimited"
//               : regularTickets.total}
//           </p>
//         </div>

//         <div className={styles.summaryRegular}>
//           <h4 className={styles.summaryText}>VIP</h4>
//           <p className={styles.summaryNumber}>
//             {vipTickets.sold}/
//             {vipTickets.total === Infinity
//               ? "Unlimited"
//               : vipTickets.total}
//           </p>
//         </div>

//         <div className={styles.inputIMGcard}>
//           <button
//             type="button"
//             onClick={openModal}
//             aria-label="Add Ticket"
//             className={styles.addButton}
//           >
//             <Image
//               src="/images/addsquare.png"
//               alt="Add Ticket"
//               width={26}
//               height={26}
//               className={styles.inputIMG}
//             />
//           </button>
//           <Text className={styles.inputText}>CREATE A NEW TICKET</Text>
//         </div>
//       </div>

//       <Text mb="md">Total Attendees: {totalAttendees}</Text>

//       <div className={styles.searchExport}>
//         <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
//         <ExportButton eventId={eventId} />
//       </div>

//       <TabFilter filter={filter} setFilter={setFilter} />
//       <UserTable searchQuery={searchQuery} filter={filter} eventId={eventId} />

//       <TicketModal
//         isModalOpen={isModalOpen}
//         closeModal={closeModal}
//         addTicket={addTicket}
//       />
//     </div>
//   );
// };

// export default TicketDashboard;




"use client";

import { useState, useEffect } from "react";
import styles from "./styles.module.css";
import { Ticket } from "../../store/types";
import SearchBar from "../SearchBar";
import ExportButton from "../ExportButton";
import TabFilter from "../TabFilter";
import UserTable from "../UserTable";
import Image from "next/image";
import { Text } from "@mantine/core";
import TicketModal from "../Ticket/ticketModal";
import { authenticatedRequest } from "../../app/services/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://keupass-48c2ae65f897.herokuapp.com/api";

interface TicketDashboardProps {
  eventId: string;
}

// --- UPDATED Ticket type to include the new field from the API ---
interface ApiTicket extends Ticket {
    sold_count: number;
}

const TicketDashboard: React.FC<TicketDashboardProps> = ({ eventId }) => {
  const [regularTickets, setRegularTickets] = useState({ sold: 0, total: 0 });
  const [vipTickets, setVipTickets] = useState({ sold: 0, total: 0 });
  const [totalAttendees, setTotalAttendees] = useState(0);
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
      const attendeesResponse = await authenticatedRequest<any[]>(
        `${API_BASE_URL}/attendees/?event_id=${eventId}`,
        "GET"
      );
      setTotalAttendees(attendeesResponse.length || 0);

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

      // 3. Find the tickets and set the state directly from API data
      const vipTicket = tickets.find((t) => t.name.toLowerCase().includes("vip"));
      const regularTicket = tickets.find((t) => !t.name.toLowerCase().includes("vip"));
      
      if (regularTicket) {
        setRegularTickets({
          sold: regularTicket.sold_count, // Use the count directly from the API
          total: regularTicket.quantity === "Unlimited" ? Infinity : parseInt(regularTicket.quantity as string),
        });
      } else {
        console.warn("Regular ticket type not found for this event.");
      }
      
      if (vipTicket) {
        setVipTickets({
          sold: vipTicket.sold_count, // Use the count directly from the API
          total: vipTicket.quantity === "Unlimited" ? Infinity : parseInt(vipTicket.quantity as string),
        });
      } else {
        console.warn("VIP ticket type not found for this event.");
      }

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
        ...(ticketData.type === "Invite" && { invite_email: ticketData.inviteEmail }),
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
      {error && <Text color="red" mb="md">{error}</Text>}

      <div className={styles.summary}>
        <div className={styles.summaryRegular}>
          <h4 className={styles.summaryText}>REGULAR</h4>
          <p className={styles.summaryNumber}>
            {regularTickets.sold}/
            {regularTickets.total === Infinity ? "Unlimited" : regularTickets.total}
          </p>
        </div>

        <div className={styles.summaryRegular}>
          <h4 className={styles.summaryText}>VIP</h4>
          <p className={styles.summaryNumber}>
            {vipTickets.sold}/
            {vipTickets.total === Infinity ? "Unlimited" : vipTickets.total}
          </p>
        </div>

        <div className={styles.inputIMGcard}>
          <button type="button" onClick={openModal} aria-label="Add Ticket" className={styles.addButton}>
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

      <TabFilter filter={filter} setFilter={setFilter} />
      <UserTable searchQuery={searchQuery} filter={filter} eventId={eventId} />

      <TicketModal
        isModalOpen={isModalOpen}
        closeModal={closeModal}
        addTicket={addTicket}
      />
    </div>
  );
};

export default TicketDashboard;