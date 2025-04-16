import React, { useState, useEffect } from "react";
import styles from "./styles.module.css";
import SearchBar from "@/components/SearchBar";
import ExportButton from "@/components/ExportButton";
import { Image, Text } from "@mantine/core";
import TicketModal from "./ticketModal";


interface Invite {
  name: string;
  phone: string;
  email: string;
}

const sampleInvites: Invite[] = Array(12).fill({
  name: "Robbin Nelson",
  phone: "09036278736",
  email: "robbinnelson@gmail.com",
});

const ITEMS_PER_PAGE = 10;

const InviteTables: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredInvites = sampleInvites.filter((invite) => {
    const query = searchQuery.toLowerCase();
    return (
      invite.name.toLowerCase().includes(query) ||
      invite.phone.includes(query) ||
      invite.email.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredInvites.length / ITEMS_PER_PAGE);
  const paginatedInvites = filteredInvites.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className={styles.container}>
      {/* Modal Component */}
      <TicketModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className={styles.createBtn}>
        <div className={styles.inputIMGcard}>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
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

      <div className={styles.header}>
        <button className={styles.filterButton}>
          All {filteredInvites.length}
        </button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone No</th>
            <th>Email Address</th>
          </tr>
        </thead>
        <tbody>
          {paginatedInvites.map((invite, index) => (
            <tr key={index}>
              <td className={styles.nameCell}>
                <span className={styles.statusDot}></span>
                {invite.name}
              </td>
              <td>{invite.phone}</td>
              <td>{invite.email}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.pagination}>
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={styles.paginationButton}
        >
          {"<"} Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className={styles.paginationButton}
        >
          Next {">"}
        </button>
      </div>
    </div>
  );
};

export default InviteTables;
