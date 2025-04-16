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

const TicketDashboard: React.FC = () => {
  const [savedFormData, setSavedFormData] = useState<EventFormData>(defaultEventFormData);
  const [formData, setFormData] = useState<EventFormData>(defaultEventFormData);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const storedData = localStorage.getItem("eventFormData");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setSavedFormData(parsedData);
      setFormData(parsedData);
    }
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const addTicket = (ticket: Omit<Ticket, "id">) => {
    // Generate an ID for the new ticket (for example, using Date.now())
    const newTicket = { ...ticket, id: Date.now().toString() };
    setFormData((prev) => ({
      ...prev,
      tickets: [...prev.tickets, newTicket],
    }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.summary}>
        <div className={styles.summaryRegular}>
          <h4 className={styles.summaryText}>REGULAR</h4>
          <p className={styles.summaryNumber}>12/50</p>
        </div>
        <div className={styles.summaryRegular}>
          <h4 className={styles.summaryText}>VIP</h4>
          <p className={styles.summaryNumber}>2/25</p>
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

      <div className={styles.searchExport}>
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <ExportButton />
      </div>

      <TabFilter filter={filter} setFilter={setFilter} />

      <UserTable searchQuery={searchQuery} filter={filter} />

      {/* Modal for adding a new ticket */}
      <TicketModal
        isModalOpen={isModalOpen}
        closeModal={closeModal}
        addTicket={addTicket}
      />
    </div>
  );
};

export default TicketDashboard;
