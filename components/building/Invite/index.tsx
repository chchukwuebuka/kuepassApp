"use client";

import { useState } from "react";
import styles from "./styles.module.css";
import { Image, Text } from "@mantine/core";
import SearchBar from "@/components/SearchBar";
import ExportButton from "@/components/ExportButton";
import InviteModal from "./inviteModal";
import SuccessModal from "./successModal";

interface Invite {
  name: string;
  status: "One-time" | "Indefinite" | "Active" | "Expired";
  email: string;
}

const sampleInvites: Invite[] = [
  {
    name: "Robbin Nelson",
    status: "One-time",
    email: "robbinnelson@gmail.com",
  },
  {
    name: "Robbin Nelson",
    status: "Indefinite",
    email: "robbinnelson@gmail.com",
  },
  {
    name: "Robbin Nelson",
    status: "Indefinite",
    email: "robbinnelson@gmail.com",
  },
  { name: "Robbin Nelson", status: "Active", email: "robbinnelson@gmail.com" },
  {
    name: "Robbin Nelson",
    status: "Indefinite",
    email: "robbinnelson@gmail.com",
  },
  { name: "Robbin Nelson", status: "Active", email: "robbinnelson@gmail.com" },
  { name: "Robbin Nelson", status: "Active", email: "robbinnelson@gmail.com" },
  { name: "Robbin Nelson", status: "Active", email: "robbinnelson@gmail.com" },
  { name: "Robbin Nelson", status: "Active", email: "robbinnelson@gmail.com" },
  { name: "Robbin Nelson", status: "Expired", email: "robbinnelson@gmail.com" },
  { name: "Robbin Nelson", status: "Expired", email: "robbinnelson@gmail.com" },
  { name: "Robbin Nelson", status: "Expired", email: "robbinnelson@gmail.com" },
  { name: "Robbin Nelson", status: "Active", email: "robbinnelson@gmail.com" },
];

const ITEMS_PER_PAGE = 10;

export default function InviteTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    "All" | "Active" | "Indefinite"
  >("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const filteredInvites = sampleInvites.filter((invite) => {
    return (
      invite.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invite.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredByStatus =
    selectedFilter === "All"
      ? filteredInvites
      : filteredInvites.filter((invite) => invite.status === selectedFilter);

  const totalPages = Math.ceil(filteredByStatus.length / ITEMS_PER_PAGE);
  const paginatedInvites = filteredByStatus.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className={styles.container}>
      {/* Top Section */}
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

      {/* Filter Section */}
      <div className={styles.filters}>
        <button
          className={`${styles.filterButton} ${
            selectedFilter === "All" ? styles.activeFilter : ""
          }`}
          onClick={() => setSelectedFilter("All")}
        >
          All {sampleInvites.length}
        </button>
        <button
          className={`${styles.filterButton} ${
            selectedFilter === "Active" ? styles.activeFilter : ""
          }`}
          onClick={() => setSelectedFilter("Active")}
        >
          Active {sampleInvites.filter((i) => i.status === "Active").length}
        </button>
        <button
          className={`${styles.filterButton} ${
            selectedFilter === "Indefinite" ? styles.activeFilter : ""
          }`}
          onClick={() => setSelectedFilter("Indefinite")}
        >
          Indefinite{" "}
          {sampleInvites.filter((i) => i.status === "Indefinite").length}
        </button>
      </div>

      {/* Invite Table */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Email Address</th>
          </tr>
        </thead>
        <tbody>
          {paginatedInvites.map((invite, index) => (
            <tr key={index}>
              <td>{invite.name}</td>
              <td
                className={`
                  ${invite.status === "Active" ? styles.activeStatus : ""}
                  ${invite.status === "Expired" ? styles.expiredStatus : ""}
                  ${
                    invite.status === "Indefinite"
                      ? styles.indefiniteStatus
                      : ""
                  }
                `}
              >
                {invite.status}
              </td>
              <td>{invite.email}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className={styles.pagination}>
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className={styles.paginaBTN}
        >
          ← Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={styles.paginaBTN}
        >
          Next →
        </button>
      </div>
        {/* Invite Modal */}
      {isModalOpen && (
        <InviteModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => setIsSuccessModalOpen(true)}
        />
      )}


      {isSuccessModalOpen && (
        <SuccessModal
          onClose={() => setIsSuccessModalOpen(false)} 
          onEdit={() => {
            setIsSuccessModalOpen(false);
            setIsModalOpen(true);
          }}
        />
      )}
    </div>
  );
}





