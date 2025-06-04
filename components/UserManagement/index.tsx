

// "use client";

// import { useState, useEffect } from "react";
// import styles from "./styles.module.css";
// import { EventFormData, Ticket } from "../../store/types";
// import SearchBar from "../SearchBar";
// import ExportButton from "../ExportButton";
// import TabFilter from "../TabFilter";
// import UserTable from "../UserTable";
// import Image from "next/image";
// import { Text } from "@mantine/core";
// import TicketModal from "../Ticket/ticketModal";
// import { authenticatedRequest } from "../../app/services/auth";

// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_BASE_URL ||
//   "https://keupass-48c2ae65f897.herokuapp.com/api";

// const defaultEventFormData: EventFormData = {
//   title: "",
//   description: "",
//   location: "Virtual",
//   address: "",
//   startDate: "",
//   startTime: "",
//   endDate: "",
//   endTime: "",
//   tickets: [],
//   appearance: "",
// };

// interface TicketDashboardProps {
//   eventId: string;
// }

// const TicketDashboard: React.FC<TicketDashboardProps> = ({ eventId }) => {
//   const [savedFormData, setSavedFormData] = useState<EventFormData>(defaultEventFormData);
//   const [formData, setFormData] = useState<EventFormData>(defaultEventFormData);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [filter, setFilter] = useState("all");
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [regularTickets, setRegularTickets] = useState({ sold: 0, total: 0 });
//   const [vipTickets, setVipTickets] = useState({ sold: 0, total: 0 });
//   const [totalAttendees, setTotalAttendees] = useState(0);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const generateAttendeeTickets = (attendees: any[], regularTicketId: string, vipTicketId: string) => {
//     const attendeeTickets = JSON.parse(localStorage.getItem("attendee_tickets") || "[]");
//     const existingMappings = attendeeTickets.filter(
//       (at: { event_id: string }) => at.event_id === eventId
//     );

//     if (existingMappings.length >= attendees.length) {
//       console.log("Mappings already exist for all attendees:", existingMappings);
//       return attendeeTickets;
//     }

//     const unmappedAttendees = attendees.filter(
//       (attendee: any) => !existingMappings.some(
//         (at: { attendee_id: string }) => at.attendee_id === attendee.id
//       )
//     );

//     const newMappings = [
//       ...unmappedAttendees.slice(0, Math.min(20, unmappedAttendees.length)).map((attendee: any) => ({
//         attendee_id: attendee.id,
//         ticket_id: regularTicketId,
//         event_id: eventId,
//       })),
//       ...unmappedAttendees.slice(20, Math.min(27, unmappedAttendees.length)).map((attendee: any) => ({
//         attendee_id: attendee.id,
//         ticket_id: vipTicketId,
//         event_id: eventId,
//       })),
//     ];

//     const updatedMappings = [...attendeeTickets, ...newMappings];
//     localStorage.setItem("attendee_tickets", JSON.stringify(updatedMappings));
//     console.log("Generated new attendee-ticket mappings:", newMappings);
//     return updatedMappings;
//   };

//   const fetchData = async () => {
//     try {
//       setIsLoading(true);
//       console.log("Fetching data for eventId:", eventId);

//       // Fetch attendees
//       const attendeesResponse = await authenticatedRequest(
//         `${API_BASE_URL}/attendees/?event_id=${eventId}`,
//         "GET"
//       );
//       console.log("Attendees API response:", attendeesResponse);
//       const attendees = Array.isArray(attendeesResponse)
//         ? attendeesResponse
//         : attendeesResponse.results || [];
//       console.log("Attendees count:", attendees.length, "IDs:", attendees.map((a: any) => a.id));

//       // Fetch tickets
//       const ticketsResponse = await authenticatedRequest(
//         `${API_BASE_URL}/tickets/?event_id=${eventId}`,
//         "GET"
//       );
//       console.log("Tickets API response:", ticketsResponse);
//       const tickets = Array.isArray(ticketsResponse)
//         ? ticketsResponse
//         : ticketsResponse.data || [];
//       console.log("Tickets count:", tickets.length, "Tickets:", tickets);

//       const regularTicket = tickets.find(
//         (t: Ticket) => t.category_name.toLowerCase() === "regular" || t.category_name.toLowerCase() === "paid"
//       );
//       const vipTicket = tickets.find(
//         (t: Ticket) => t.category_name.toLowerCase() === "vip"
//       );

//       if (!regularTicket || !vipTicket) {
//         throw new Error("Missing required tickets (Regular/Paid or VIP).");
//       }

//       // Generate mappings
//       const attendeeTickets = generateAttendeeTickets(
//         attendees,
//         regularTicket.id,
//         vipTicket.id
//       );

//       let regularCount = 0;
//       let vipCount = 0;
//       const unmappedAttendees: string[] = [];

//       // Count attendees
//       for (const attendee of attendees) {
//         const mapping = attendeeTickets.find(
//           (at: { attendee_id: string; ticket_id: string; event_id: string }) =>
//             at.attendee_id === attendee.id && at.event_id === eventId
//         );
//         if (mapping) {
//           const ticket = tickets.find((t: Ticket) => t.id === mapping.ticket_id);
//           if (ticket) {
//             if (ticket.category_name.toLowerCase() === "regular" || ticket.category_name.toLowerCase() === "paid") {
//               regularCount++;
//             } else if (ticket.category_name.toLowerCase() === "vip") {
//               vipCount++;
//             }
//           } else {
//             console.warn("Ticket not found for mapping:", mapping);
//             unmappedAttendees.push(attendee.id);
//           }
//         } else {
//           console.warn("No mapping found for attendee:", attendee.id);
//           unmappedAttendees.push(attendee.id);
//         }
//       }

//       if (unmappedAttendees.length > 0) {
//         console.error("Unmapped attendees:", unmappedAttendees);
//         setError(`Warning: ${unmappedAttendees.length} attendees lack ticket mappings.`);
//       }

//       setRegularTickets({
//         sold: regularCount,
//         total: regularTicket ? (regularTicket.quantity === "Unlimited" ? Infinity : parseInt(regularTicket.quantity)) : 0,
//       });
//       setVipTickets({
//         sold: vipCount,
//         total: vipTicket ? (vipTicket.quantity === "Unlimited" ? Infinity : parseInt(vipTicket.quantity)) : 0,
//       });
//       setTotalAttendees(regularCount + vipCount);

//       console.log("Regular count:", regularCount);
//       console.log("VIP count:", vipCount);
//       console.log("Total attendees set to:", regularCount + vipCount);

//       setFormData((prev) => ({
//         ...prev,
//         tickets,
//       }));
//       localStorage.setItem("eventFormData", JSON.stringify({ ...formData, tickets }));
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
//     const storedData = localStorage.getItem("eventFormData");
//     if (storedData) {
//       const parsedData: EventFormData = JSON.parse(storedData);
//       console.log("Loaded from localStorage:", parsedData);
//       setSavedFormData(parsedData);
//       setFormData(parsedData);
//     }

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

//   const addTicket = async (ticket: Omit<Ticket, "id">) => {
//     try {
//       const ticketType = ticket.name?.toLowerCase().includes("vip") ? "VIP" : "Regular";
//       const newTicket = {
//         event: eventId,
//         category_name: ticketType,
//         category_price: ticket.price.toString(),
//         name: ticket.name,
//         quantity: ticket.quantity === "Infinity" ? "Unlimited" : ticket.quantity.toString(),
//       };
//       console.log("Creating ticket:", newTicket);
//       const response = await authenticatedRequest(
//         `${API_BASE_URL}/tickets`,
//         "POST",
//         newTicket
//       );
//       console.log("Ticket creation response:", response);

//       const createdTicket: Ticket = {
//         id: response.id,
//         category_name: response.category_name,
//         category_price: response.category_price,
//         name: response.name,
//         quantity: response.quantity,
//         event: eventId,
//       };

//       setFormData((prev) => ({
//         ...prev,
//         tickets: [...prev.tickets, createdTicket],
//       }));

//       localStorage.setItem(
//         "eventFormData",
//         JSON.stringify({ ...formData, tickets: [...formData.tickets, createdTicket] })
//       );

//       if (createdTicket.category_name.toLowerCase() === "regular" || createdTicket.category_name.toLowerCase() === "paid") {
//         setRegularTickets((prev) => ({
//           ...prev,
//           sold: prev.sold,
//           total: createdTicket.quantity === "Unlimited" ? Infinity : prev.total + parseInt(createdTicket.quantity),
//         }));
//       } else if (createdTicket.category_name.toLowerCase() === "vip") {
//         setVipTickets((prev) => ({
//           ...prev,
//           sold: prev.sold,
//           total: createdTicket.quantity === "Unlimited" ? Infinity : prev.total + parseInt(createdTicket.quantity),
//         }));
//       }

//       await fetchData();
//     } catch (err: any) {
//       console.error("Error creating ticket:", err.message, err.response?.data);
//       alert(`Failed to create ticket: ${err.message}`);
//       const localTicket: Ticket = {
//         id: Date.now().toString(),
//         category_name: ticket.name?.toLowerCase().includes("vip") ? "VIP" : "Regular",
//         category_price: ticket.price.toString(),
//         name: ticket.name,
//         quantity: ticket.quantity === "Infinity" ? "Unlimited" : ticket.quantity.toString(),
//         event: eventId,
//       };
//       setFormData((prev) => ({
//         ...prev,
//         tickets: [...prev.tickets, localTicket],
//       }));
//       localStorage.setItem(
//         "eventFormData",
//         JSON.stringify({ ...formData, tickets: [...formData.tickets, localTicket] })
//       );
//     }
//   };

//   if (isLoading) {
//     return <div className={styles.container}>Loading attendee data...</div>;
//   }

//   return (
//     <div className={styles.container}>
//       {error && <Text color="red" mb="md">{error}</Text>}
//       <div className={styles.summary}>
//         <div className={styles.summaryRegular}>
//           <h4 className={styles.summaryText}>REGULAR</h4>
//           <p className={styles.summaryNumber}>
//             {regularTickets.sold}/{regularTickets.total === Infinity ? "Unlimited" : regularTickets.total}
//           </p>
//         </div>
//         <div className={styles.summaryRegular}>
//           <h4 className={styles.summaryText}>VIP</h4>
//           <p className={styles.summaryNumber}>
//             {vipTickets.sold}/{vipTickets.total === Infinity ? "Unlimited" : vipTickets.total}
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
import TicketModal from "../Ticket/ticketModal"; // adjust path as needed
import { authenticatedRequest } from "../../app/services/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://keupass-48c2ae65f897.herokuapp.com/api";

interface TicketDashboardProps {
  eventId: string;
}

const TicketDashboard: React.FC<TicketDashboardProps> = ({ eventId }) => {
  // State for summary (sold/total) of Regular & VIP
  const [regularTickets, setRegularTickets] = useState({ sold: 0, total: 0 });
  const [vipTickets, setVipTickets] = useState({ sold: 0, total: 0 });

  // State for “how many people registered for this event”
  const [totalAttendees, setTotalAttendees] = useState(0);

  // Modal open/close
  const [isModalOpen, setIsModalOpen] = useState(false);

  // UI states
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * In localStorage, we keep mappings:
   *   { attendee_id, ticket_id, event_id }
   * If some attendees are unmapped, we assign them to Regular (first 20)
   * or VIP (next 7).
   */
  const generateAttendeeTickets = (
    attendees: any[],
    regularTicketId: string,
    vipTicketId: string
  ) => {
    const attendeeTickets = JSON.parse(
      localStorage.getItem("attendee_tickets") || "[]"
    );
    const existingMappings = attendeeTickets.filter(
      (at: { event_id: string }) => at.event_id === eventId
    );

    // If all attendees already mapped, do nothing
    if (existingMappings.length >= attendees.length) {
      console.log(
        "Mappings already exist for all attendees:",
        existingMappings
      );
      return attendeeTickets;
    }

    // Find which attendees still need a mapping
    const unmappedAttendees = attendees.filter(
      (attendee: any) =>
        !existingMappings.some(
          (at: { attendee_id: string }) => at.attendee_id === attendee.id
        )
    );

    // Assign first 20 to Regular, next 7 to VIP
    const newMappings = [
      ...unmappedAttendees
        .slice(0, Math.min(20, unmappedAttendees.length))
        .map((attendee: any) => ({
          attendee_id: attendee.id,
          ticket_id: regularTicketId,
          event_id: eventId,
        })),
      ...unmappedAttendees
        .slice(20, Math.min(27, unmappedAttendees.length))
        .map((attendee: any) => ({
          attendee_id: attendee.id,
          ticket_id: vipTicketId,
          event_id: eventId,
        })),
    ];

    const updatedMappings = [...attendeeTickets, ...newMappings];
    localStorage.setItem(
      "attendee_tickets",
      JSON.stringify(updatedMappings)
    );
    console.log("Generated new attendee-ticket mappings:", newMappings);
    return updatedMappings;
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      //
      // 1) Fetch all attendees for this event
      //
      const attendeesResponse = await authenticatedRequest(
        `${API_BASE_URL}/attendees/?event=${eventId}`,
        "GET"
      );
      console.log("Attendees API response:", attendeesResponse);

      // Normalize to an array
      let allAttendees: any[] = [];
      if (Array.isArray(attendeesResponse)) {
        allAttendees = attendeesResponse;
      } else if (Array.isArray(attendeesResponse.data)) {
        allAttendees = attendeesResponse.data;
      } else if (Array.isArray(attendeesResponse.results)) {
        allAttendees = attendeesResponse.results;
      } else {
        console.warn(
          "Unable to find attendees array. Defaulting to empty.",
          attendeesResponse
        );
        allAttendees = [];
      }

      // Keep only those with `event === eventId`
      const attendeesForThisEvent = allAttendees.filter(
        (att: any) => att.event === eventId
      );
      console.log(
        "Filtered attendees for this event:",
        attendeesForThisEvent.length,
        "IDs:",
        attendeesForThisEvent.map((a) => a.id)
      );

      // Immediately set totalAttendees count
      setTotalAttendees(attendeesForThisEvent.length);

      //
      // 2) Fetch tickets for this event
      //
      const ticketsResponse = await authenticatedRequest(
        `${API_BASE_URL}/tickets/?event=${eventId}`,
        "GET"
      );
      console.log("Tickets API response:", ticketsResponse);

      // Normalize to an array of Ticket
      let tickets: Ticket[] = [];
      if (Array.isArray(ticketsResponse)) {
        tickets = ticketsResponse;
      } else if (Array.isArray(ticketsResponse.data)) {
        tickets = ticketsResponse.data;
      } else if (Array.isArray(ticketsResponse.results)) {
        tickets = ticketsResponse.results;
      } else {
        console.warn(
          "Unable to find tickets array. Defaulting to empty.",
          ticketsResponse
        );
        tickets = [];
      }
      console.log("Tickets count:", tickets.length, "Tickets:", tickets);

      //
      // 3) Identify which one is VIP vs. Regular by ticket.name
      //    e.g. "ViicDev VIP" → VIP; anything else → Regular
      //
      const vipTicket = tickets.find((t) =>
        t.name.toLowerCase().includes("vip")
      );
      const regularTicket = tickets.find(
        (t) => !t.name.toLowerCase().includes("vip")
      );

      if (!regularTicket || !vipTicket) {
        throw new Error("Missing required tickets (Regular or VIP).");
      }

      //
      // 4) Generate (or retrieve) attendee↔ticket mappings
      //
      const attendeeTickets = generateAttendeeTickets(
        attendeesForThisEvent,
        regularTicket.id,
        vipTicket.id
      );

      //
      // 5) Count how many of these attendees have a Regular vs. VIP
      //
      let regularCount = 0;
      let vipCount = 0;
      const unmappedAttendees: string[] = [];

      for (const attendee of attendeesForThisEvent) {
        const mapping = attendeeTickets.find(
          (at: {
            attendee_id: string;
            ticket_id: string;
            event_id: string;
          }) =>
            at.attendee_id === attendee.id && at.event_id === eventId
        );

        if (mapping) {
          const ticketObj = tickets.find((t) => t.id === mapping.ticket_id);
          if (ticketObj) {
            if (ticketObj.name.toLowerCase().includes("vip")) {
              vipCount++;
            } else {
              regularCount++;
            }
          } else {
            unmappedAttendees.push(attendee.id);
            console.warn("Ticket not found for mapping:", mapping);
          }
        } else {
          unmappedAttendees.push(attendee.id);
          console.warn("No mapping found for attendee:", attendee.id);
        }
      }

      if (unmappedAttendees.length > 0) {
        setError(
          `Warning: ${unmappedAttendees.length} attendees lack ticket mappings.`
        );
        console.error("Unmapped attendees:", unmappedAttendees);
      }

      // 6) Update “sold” / “total” for Regular & VIP
      setRegularTickets({
        sold: regularCount,
        total:
          regularTicket.quantity === "Unlimited"
            ? Infinity
            : parseInt(regularTicket.quantity),
      });
      setVipTickets({
        sold: vipCount,
        total:
          vipTicket.quantity === "Unlimited"
            ? Infinity
            : parseInt(vipTicket.quantity),
      });

      console.log("Regular sold:", regularCount);
      console.log("VIP sold:", vipCount);
    } catch (err: any) {
      console.error("Error fetching data:", err.message, err.response?.data);
      setError("Failed to load attendee or ticket data.");
      setRegularTickets({ sold: 0, total: 0 });
      setVipTickets({ sold: 0, total: 0 });
      setTotalAttendees(0);
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

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  /**
   * Called by TicketModal on form submission.
   * Expects: { name, price, type, quantity, inviteEmail? }
   */
  const addTicket = async (ticketData: {
    name: string;
    price: number;
    type: "Paid" | "Free" | "Invite";
    quantity: number | "Unlimited";
    inviteEmail?: string;
  }) => {
    try {
      // Build payload for POST /tickets
      const payload = {
        event: eventId,
        name: ticketData.name,
        category_name: ticketData.type, // "Paid" | "Free" | "Invite"
        category_price: ticketData.price.toString(), // price as string
        quantity:
          ticketData.quantity === "Unlimited"
            ? "Unlimited"
            : ticketData.quantity.toString(),
        // If you need inviteEmail in your backend, include it here:
        ...(ticketData.type === "Invite" && {
          invite_email: ticketData.inviteEmail,
        }),
      };
      console.log("Creating ticket with payload:", payload);

      const response = await authenticatedRequest(
        `${API_BASE_URL}/tickets`,
        "POST",
        payload
      );
      console.log("Ticket creation response:", response);

      // After creation, re-fetch everything so summary updates immediately
      await fetchData();
    } catch (err: any) {
      console.error("Error creating ticket:", err.message, err.response?.data);
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
        <div className={styles.summaryRegular}>
          <h4 className={styles.summaryText}>REGULAR</h4>
          <p className={styles.summaryNumber}>
            {regularTickets.sold}/
            {regularTickets.total === Infinity
              ? "Unlimited"
              : regularTickets.total}
          </p>
        </div>

        <div className={styles.summaryRegular}>
          <h4 className={styles.summaryText}>VIP</h4>
          <p className={styles.summaryNumber}>
            {vipTickets.sold}/
            {vipTickets.total === Infinity
              ? "Unlimited"
              : vipTickets.total}
          </p>
        </div>

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
