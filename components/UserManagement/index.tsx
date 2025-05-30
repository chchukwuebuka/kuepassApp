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

// const TicketDashboard: React.FC = () => {
//   const [savedFormData, setSavedFormData] = useState<EventFormData>(defaultEventFormData);
//   const [formData, setFormData] = useState<EventFormData>(defaultEventFormData);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [filter, setFilter] = useState("all");
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   useEffect(() => {
//     const storedData = localStorage.getItem("eventFormData");
//     if (storedData) {
//       const parsedData = JSON.parse(storedData);
//       setSavedFormData(parsedData);
//       setFormData(parsedData);
//     }
//   }, []);

//   const openModal = () => {
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//   };

//   const addTicket = (ticket: Omit<Ticket, "id">) => {
//     // Generate an ID for the new ticket (for example, using Date.now())
//     const newTicket = { ...ticket, id: Date.now().toString() };
//     setFormData((prev) => ({
//       ...prev,
//       tickets: [...prev.tickets, newTicket],
//     }));
//   };

//   return (
//     <div className={styles.container}>
//       <div className={styles.summary}>
//         <div className={styles.summaryRegular}>
//           <h4 className={styles.summaryText}>REGULAR</h4>
//           <p className={styles.summaryNumber}>12/50</p>
//         </div>
//         <div className={styles.summaryRegular}>
//           <h4 className={styles.summaryText}>VIP</h4>
//           <p className={styles.summaryNumber}>2/25</p>
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

//       <div className={styles.searchExport}>
//         <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
//         <ExportButton />
//       </div>

//       <TabFilter filter={filter} setFilter={setFilter} />

//       <UserTable searchQuery={searchQuery} filter={filter} />

//       {/* Modal for adding a new ticket */}
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
import { EventFormData, Ticket } from "../../store/types";
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

const defaultEventFormData: EventFormData = {
  title: "",
  description: "",
  location: "Virtual",
  address: "",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  tickets: [],
  appearance: "",
};

interface TicketDashboardProps {
  eventId: string;
}

const TicketDashboard: React.FC<TicketDashboardProps> = ({ eventId }) => {
  const [savedFormData, setSavedFormData] = useState<EventFormData>(defaultEventFormData);
  const [formData, setFormData] = useState<EventFormData>(defaultEventFormData);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [regularTickets, setRegularTickets] = useState({ sold: 0, total: 0 });
  const [vipTickets, setVipTickets] = useState({ sold: 0, total: 0 });
  const [totalAttendees, setTotalAttendees] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateAttendeeTickets = (attendees: any[], regularTicketId: string, vipTicketId: string) => {
    const attendeeTickets = JSON.parse(localStorage.getItem("attendee_tickets") || "[]");
    const existingMappings = attendeeTickets.filter(
      (at: { event_id: string }) => at.event_id === eventId
    );

    if (existingMappings.length >= attendees.length) {
      console.log("Mappings already exist for all attendees:", existingMappings);
      return attendeeTickets;
    }

    const unmappedAttendees = attendees.filter(
      (attendee: any) => !existingMappings.some(
        (at: { attendee_id: string }) => at.attendee_id === attendee.id
      )
    );

    const newMappings = [
      ...unmappedAttendees.slice(0, Math.min(20, unmappedAttendees.length)).map((attendee: any) => ({
        attendee_id: attendee.id,
        ticket_id: regularTicketId,
        event_id: eventId,
      })),
      ...unmappedAttendees.slice(20, Math.min(27, unmappedAttendees.length)).map((attendee: any) => ({
        attendee_id: attendee.id,
        ticket_id: vipTicketId,
        event_id: eventId,
      })),
    ];

    const updatedMappings = [...attendeeTickets, ...newMappings];
    localStorage.setItem("attendee_tickets", JSON.stringify(updatedMappings));
    console.log("Generated new attendee-ticket mappings:", newMappings);
    return updatedMappings;
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching data for eventId:", eventId);

      // Fetch attendees
      const attendeesResponse = await authenticatedRequest(
        `${API_BASE_URL}/attendees/?event_id=${eventId}`,
        "GET"
      );
      console.log("Attendees API response:", attendeesResponse);
      const attendees = Array.isArray(attendeesResponse)
        ? attendeesResponse
        : attendeesResponse.results || [];
      console.log("Attendees count:", attendees.length, "IDs:", attendees.map((a: any) => a.id));

      // Fetch tickets
      const ticketsResponse = await authenticatedRequest(
        `${API_BASE_URL}/tickets/?event_id=${eventId}`,
        "GET"
      );
      console.log("Tickets API response:", ticketsResponse);
      const tickets = Array.isArray(ticketsResponse)
        ? ticketsResponse
        : ticketsResponse.data || [];
      console.log("Tickets count:", tickets.length, "Tickets:", tickets);

      const regularTicket = tickets.find(
        (t: Ticket) => t.category_name.toLowerCase() === "regular" || t.category_name.toLowerCase() === "paid"
      );
      const vipTicket = tickets.find(
        (t: Ticket) => t.category_name.toLowerCase() === "vip"
      );

      if (!regularTicket || !vipTicket) {
        throw new Error("Missing required tickets (Regular/Paid or VIP).");
      }

      // Generate mappings
      const attendeeTickets = generateAttendeeTickets(
        attendees,
        regularTicket.id,
        vipTicket.id
      );

      let regularCount = 0;
      let vipCount = 0;
      const unmappedAttendees: string[] = [];

      // Count attendees
      for (const attendee of attendees) {
        const mapping = attendeeTickets.find(
          (at: { attendee_id: string; ticket_id: string; event_id: string }) =>
            at.attendee_id === attendee.id && at.event_id === eventId
        );
        if (mapping) {
          const ticket = tickets.find((t: Ticket) => t.id === mapping.ticket_id);
          if (ticket) {
            if (ticket.category_name.toLowerCase() === "regular" || ticket.category_name.toLowerCase() === "paid") {
              regularCount++;
            } else if (ticket.category_name.toLowerCase() === "vip") {
              vipCount++;
            }
          } else {
            console.warn("Ticket not found for mapping:", mapping);
            unmappedAttendees.push(attendee.id);
          }
        } else {
          console.warn("No mapping found for attendee:", attendee.id);
          unmappedAttendees.push(attendee.id);
        }
      }

      if (unmappedAttendees.length > 0) {
        console.error("Unmapped attendees:", unmappedAttendees);
        setError(`Warning: ${unmappedAttendees.length} attendees lack ticket mappings.`);
      }

      setRegularTickets({
        sold: regularCount,
        total: regularTicket ? (regularTicket.quantity === "Unlimited" ? Infinity : parseInt(regularTicket.quantity)) : 0,
      });
      setVipTickets({
        sold: vipCount,
        total: vipTicket ? (vipTicket.quantity === "Unlimited" ? Infinity : parseInt(vipTicket.quantity)) : 0,
      });
      setTotalAttendees(regularCount + vipCount);

      console.log("Regular count:", regularCount);
      console.log("VIP count:", vipCount);
      console.log("Total attendees set to:", regularCount + vipCount);

      setFormData((prev) => ({
        ...prev,
        tickets,
      }));
      localStorage.setItem("eventFormData", JSON.stringify({ ...formData, tickets }));
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
    const storedData = localStorage.getItem("eventFormData");
    if (storedData) {
      const parsedData: EventFormData = JSON.parse(storedData);
      console.log("Loaded from localStorage:", parsedData);
      setSavedFormData(parsedData);
      setFormData(parsedData);
    }

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

  const addTicket = async (ticket: Omit<Ticket, "id">) => {
    try {
      const ticketType = ticket.name?.toLowerCase().includes("vip") ? "VIP" : "Regular";
      const newTicket = {
        event: eventId,
        category_name: ticketType,
        category_price: ticket.price.toString(),
        name: ticket.name,
        quantity: ticket.quantity === "Infinity" ? "Unlimited" : ticket.quantity.toString(),
      };
      console.log("Creating ticket:", newTicket);
      const response = await authenticatedRequest(
        `${API_BASE_URL}/tickets`,
        "POST",
        newTicket
      );
      console.log("Ticket creation response:", response);

      const createdTicket: Ticket = {
        id: response.id,
        category_name: response.category_name,
        category_price: response.category_price,
        name: response.name,
        quantity: response.quantity,
        event: eventId,
      };

      setFormData((prev) => ({
        ...prev,
        tickets: [...prev.tickets, createdTicket],
      }));

      localStorage.setItem(
        "eventFormData",
        JSON.stringify({ ...formData, tickets: [...formData.tickets, createdTicket] })
      );

      if (createdTicket.category_name.toLowerCase() === "regular" || createdTicket.category_name.toLowerCase() === "paid") {
        setRegularTickets((prev) => ({
          ...prev,
          sold: prev.sold,
          total: createdTicket.quantity === "Unlimited" ? Infinity : prev.total + parseInt(createdTicket.quantity),
        }));
      } else if (createdTicket.category_name.toLowerCase() === "vip") {
        setVipTickets((prev) => ({
          ...prev,
          sold: prev.sold,
          total: createdTicket.quantity === "Unlimited" ? Infinity : prev.total + parseInt(createdTicket.quantity),
        }));
      }

      await fetchData();
    } catch (err: any) {
      console.error("Error creating ticket:", err.message, err.response?.data);
      alert(`Failed to create ticket: ${err.message}`);
      const localTicket: Ticket = {
        id: Date.now().toString(),
        category_name: ticket.name?.toLowerCase().includes("vip") ? "VIP" : "Regular",
        category_price: ticket.price.toString(),
        name: ticket.name,
        quantity: ticket.quantity === "Infinity" ? "Unlimited" : ticket.quantity.toString(),
        event: eventId,
      };
      setFormData((prev) => ({
        ...prev,
        tickets: [...prev.tickets, localTicket],
      }));
      localStorage.setItem(
        "eventFormData",
        JSON.stringify({ ...formData, tickets: [...formData.tickets, localTicket] })
      );
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
            {regularTickets.sold}/{regularTickets.total === Infinity ? "Unlimited" : regularTickets.total}
          </p>
        </div>
        <div className={styles.summaryRegular}>
          <h4 className={styles.summaryText}>VIP</h4>
          <p className={styles.summaryNumber}>
            {vipTickets.sold}/{vipTickets.total === Infinity ? "Unlimited" : vipTickets.total}
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