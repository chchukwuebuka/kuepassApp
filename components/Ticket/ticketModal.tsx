"use client";

import React, { useState } from "react";
import { IconX, IconCalendar, IconTrash, IconPlus } from "@tabler/icons-react";
import styles from "./ticketModal.module.css";
import { Ticket } from "../../store/types";

interface TicketModalProps {
  isModalOpen: boolean;
  closeModal: () => void;
  addTicket: (
    ticket: Omit<Ticket, "id" | "category_price" | "category_name"> & {
      price: number;
      type: "Paid" | "Free" | "Donations";
      quantity: number | "Unlimited";
      startDate?: string;
      endDate?: string;
      purchaseLimit?: number;
      description?: string;
      perks?: string[];
      enable_dynamic_pricing?: boolean;
      min_price?: number;
      max_price?: number;
    }
  ) => void;
  eventDetails: {
    title: string;
    description: string;
    location: string;
  };
}

const TicketModal: React.FC<TicketModalProps> = ({
  isModalOpen,
  closeModal,
  addTicket,
  eventDetails,
}) => {
  const [ticketType, setTicketType] = useState<
    "Free" | "Paid" | "Donations" | "By Invite"
  >("Donations");
  const [ticketName, setTicketName] = useState("");
  const [quantityType, setQuantityType] = useState<"Limited" | "Unlimited">(
    "Limited"
  );
  const [quantity, setQuantity] = useState<number | "Unlimited">(0);
  const [price, setPrice] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [purchaseLimit, setPurchaseLimit] = useState("");
  const [description, setDescription] = useState("");
  const [perks, setPerks] = useState<string[]>([""]);
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleAddPerk = () => {
    setPerks([...perks, ""]);
  };

  const handleRemovePerk = (index: number) => {
    if (perks.length > 1) {
      setPerks(perks.filter((_, i) => i !== index));
    } else {
      setPerks([""]);
    }
  };

  const handlePerkChange = (index: number, value: string) => {
    const newPerks = [...perks];
    newPerks[index] = value;
    setPerks(newPerks);
  };

  const validateAndSaveTicket = (shouldClose: boolean = true) => {
    setIsLoading(true);

    // Validation
    if (!ticketName.trim()) {
      alert("Ticket name is required.");
      setIsLoading(false);
      return false;
    }

    if (ticketType === "Paid" && (!price || parseFloat(price) <= 0)) {
      alert("Price is required for paid tickets.");
      setIsLoading(false);
      return false;
    }

    if (ticketType === "Donations" && (!price || parseFloat(price) <= 0)) {
      alert("Donation amount is required.");
      setIsLoading(false);
      return false;
    }

    if (ticketType === "By Invite") {
      if (!password.trim()) {
        alert("Password is required for invite tickets.");
        setIsLoading(false);
        return false;
      }
      if (password !== confirmPassword) {
        alert("Passwords do not match.");
        setIsLoading(false);
        return false;
      }
    }

    if (
      quantityType === "Limited" &&
      (quantity === "Unlimited" ||
        (typeof quantity === "number" && quantity <= 0) ||
        typeof quantity !== "number")
    ) {
      alert("Quantity is required for limited tickets.");
      setIsLoading(false);
      return false;
    }

    const ticketToAdd = {
      name: ticketName,
      // Pass the original type - addTicket will handle the mapping
      type: ticketType as "Paid" | "Free" | "Donations" | "Invite",
      price:
        ticketType === "Free" || ticketType === "By Invite"
          ? 0
          : parseFloat(price) || 0,
      quantity: quantityType === "Unlimited" ? "Unlimited" : quantity,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      purchaseLimit: purchaseLimit ? parseInt(purchaseLimit) : undefined,
      description: description || undefined,
      perks: perks.filter((p) => p.trim() !== ""),
    };

    // Call addTicket which will handle navigation and modal closing
    addTicket(ticketToAdd as any);

    // Reset form
    setTicketType("Donations");
    setTicketName("");
    setQuantityType("Limited");
    setQuantity(0);
    setPrice("");
    setStartDate("");
    setEndDate("");
    setPurchaseLimit("");
    setDescription("");
    setPerks([""]);
    setPassword("");
    setConfirmPassword("");
    setIsLoading(false);

    // Don't close modal here - let addTicket handle it
    // The addTicket function will close the modal and navigate to step 2
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event from bubbling to parent form
    validateAndSaveTicket(true);
  };

  const handleCancel = () => {
    setTicketType("Donations");
    setTicketName("");
    setQuantityType("Limited");
    setQuantity(0);
    setPrice("");
    setStartDate("");
    setEndDate("");
    setPurchaseLimit("");
    setDescription("");
    setPerks([""]);
    setPassword("");
    setConfirmPassword("");
    closeModal();
  };

  if (!isModalOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleCancel}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderContent}>
            <h2 className={styles.modalTitle}>Add a new ticket</h2>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleCancel}
          >
            <IconX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.ticketForm}>
          {/* Ticket Type */}
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>
              What type of event is it?
            </label>
            <div className={styles.segmentedButtons}>
              <button
                type="button"
                className={`${styles.segmentedButton} ${
                  ticketType === "Free" ? styles.segmentedButtonActive : ""
                }`}
                onClick={() => setTicketType("Free")}
              >
                Free
              </button>
              <button
                type="button"
                className={`${styles.segmentedButton} ${
                  ticketType === "Paid" ? styles.segmentedButtonActive : ""
                }`}
                onClick={() => setTicketType("Paid")}
              >
                Paid
              </button>
              <button
                type="button"
                className={`${styles.segmentedButton} ${
                  ticketType === "Donations" ? styles.segmentedButtonActive : ""
                }`}
                onClick={() => setTicketType("Donations")}
              >
                Donations
              </button>
              <button
                type="button"
                className={`${styles.segmentedButton} ${
                  ticketType === "By Invite" ? styles.segmentedButtonActive : ""
                }`}
                onClick={() => setTicketType("By Invite")}
              >
                By Invite
              </button>
            </div>
          </div>

          {/* Password Fields for By Invite */}
          {ticketType === "By Invite" && (
            <>
              <div className={styles.formField}>
                <label className={styles.fieldLabel}>
                  Password<span className={styles.required}>*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.textInputsByInvite}
                  required
                />
              </div>
              <div className={styles.formField}>
                <label className={styles.fieldLabel}>
                  Confirm Password<span className={styles.required}>*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={styles.textInputsByInvite}
                  required
                />
              </div>
            </>
          )}

          {/* Ticket Name */}
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>
              Ticket name<span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              value={ticketName}
              onChange={(e) => setTicketName(e.target.value)}
              className={styles.textInput}
              required
            />
          </div>

          {/* Ticket Quantity */}
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>
              Ticket quantity<span className={styles.required}>*</span>
              <label className={styles.quantityLabel}>
                Quantity<span className={styles.required}>*</span>
              </label>
            </label>
            <div className={styles.quantityRow}>
              <select
                value={quantityType}
                onChange={(e) => {
                  setQuantityType(e.target.value as "Limited" | "Unlimited");
                  if (e.target.value === "Unlimited") {
                    setQuantity("Unlimited");
                  } else if (quantity === "Unlimited") {
                    setQuantity(0);
                  }
                }}
                className={styles.quantitySelect}
              >
                <option value="Limited">Limited quantity</option>
                <option value="Unlimited">Unlimited</option>
              </select>
              {quantityType === "Limited" && (
                <div className={styles.quantityInputContainer}>
                  <input
                    type="number"
                    value={quantity === "Unlimited" ? "" : quantity}
                    onChange={(e) =>
                      setQuantity(e.target.value ? parseInt(e.target.value) : 0)
                    }
                    min="1"
                    className={styles.quantityInput}
                    required={quantityType === "Limited"}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Price */}
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>
              Price<span className={styles.required}>*</span>
            </label>
            <input
              type="number"
              value={
                ticketType === "Free" || ticketType === "By Invite" ? "" : price
              }
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              step="0.01"
              className={styles.textInput}
              placeholder={
                ticketType === "Free"
                  ? "Free"
                  : ticketType === "By Invite"
                  ? ""
                  : ""
              }
              disabled={ticketType === "Free" || ticketType === "By Invite"}
              readOnly={ticketType === "Free" || ticketType === "By Invite"}
              required={ticketType !== "Free" && ticketType !== "By Invite"}
            />
          </div>

          {/* When are tickets available for sale */}
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>
              When are tickets available for sale?
              <span className={styles.required}>*</span>
            </label>
            <div className={styles.dateRow}>
              <div className={styles.dateInputWrapper}>
                <IconCalendar
                  size={18}
                  className={styles.dateIcon}
                  onClick={() => {
                    const input = document.getElementById(
                      "ticket-start-date"
                    ) as HTMLInputElement;
                    if (input) {
                      if (typeof input.showPicker === "function") {
                        input.showPicker();
                      } else {
                        input.click();
                      }
                    }
                  }}
                />
                <input
                  id="ticket-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={styles.dateInput}
                  required
                />
                {!startDate && (
                  <span className={styles.dateLabel}>Start date</span>
                )}
              </div>
              <span className={styles.dateSeparator}>To</span>
              <div className={styles.dateInputWrapper}>
                <IconCalendar
                  size={18}
                  className={styles.dateIcon}
                  onClick={() => {
                    const input = document.getElementById(
                      "ticket-end-date"
                    ) as HTMLInputElement;
                    if (input) {
                      if (typeof input.showPicker === "function") {
                        input.showPicker();
                      } else {
                        input.click();
                      }
                    }
                  }}
                />
                <input
                  id="ticket-end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={styles.dateInput}
                  required
                />
                {!endDate && <span className={styles.dateLabel}>End date</span>}
              </div>
            </div>
          </div>

          {/* Purchase limit per Order */}
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>
              Purchase limit per Order<span className={styles.required}>*</span>
            </label>
            <input
              type="number"
              value={purchaseLimit}
              onChange={(e) => setPurchaseLimit(e.target.value)}
              min="1"
              className={styles.textInput}
              required
            />
          </div>

          {/* Ticket description */}
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>
              Ticket description<span className={styles.required}>*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className={styles.textarea}
              required
            />
          </div>

          {/* Perks of this ticket */}
          <div className={styles.formFieldsPerks}>
            <label className={styles.fieldLabel}>Perks of this ticket</label>
            <div className={styles.perksContainer}>
              {perks.map((perk, index) => (
                <div key={index} className={styles.perkItem}>
                  <input
                    type="text"
                    value={perk}
                    onChange={(e) => handlePerkChange(index, e.target.value)}
                    placeholder="E.g. Backstage access, a bottle of don julio etc"
                    className={styles.perkInput}
                  />
                  {perks.length > 1 && (
                    <button
                      type="button"
                      className={styles.removePerkButton}
                      onClick={() => handleRemovePerk(index)}
                    >
                      <IconTrash size={18} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className={styles.addPerkLink}
                onClick={handleAddPerk}
              >
                + Add another Perk
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.submitButton}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSubmit(e as any);
              }}
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketModal;
