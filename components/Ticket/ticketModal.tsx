


import React, { useState } from "react";
import {
  Modal,
  Button,
  TextInput,
  NumberInput,
  RadioGroup,
  Radio,
  Flex,
  Stack,
} from "@mantine/core";
import styles from "./ticketModal.module.css";
import { Ticket } from "../../store/types";

interface TicketModalProps {
  isModalOpen: boolean;
  closeModal: () => void;
  addTicket: (ticket: Omit<Ticket, "id">) => void;
}

const TicketModal: React.FC<TicketModalProps> = ({
  isModalOpen,
  closeModal,
  addTicket,
}) => {
  const [newTicket, setNewTicket] = useState<Omit<Ticket, "id">>({
    name: "",
    price: 0,
    quantity: 0,
    type: "Paid",
  });
  const [isUnlimited, setIsUnlimited] = useState<boolean>(false);

  const handleTicketChange = (
    field: keyof Omit<Ticket, "id">,
    value: string | number
  ) => {
    setNewTicket((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTicketTypeChange = (value: string) => {
    if (value === "Paid" || value === "Free" || value === "Invite") {
      setNewTicket((prev) => ({
        ...prev,
        type: value,
        price: value === "Free" ? 0 : prev.price,
        quantity: value === "Invite" ? 0 : prev.quantity,
        inviteEmail: value === "Invite" ? "" : prev.inviteEmail,
      }));
      if (value === "Invite") {
        setIsUnlimited(false);
      }
    } else {
      console.warn(`Unexpected ticket type: ${value}`);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Validate inputs
    if (!newTicket.name) {
      alert("Ticket name is required.");
      return;
    }
    if (newTicket.type === "Paid" && (newTicket.price <= 0 || newTicket.price > 1000)) {
      alert("Price must be between $0.01 and $1000.00 for paid tickets.");
      return;
    }
    if (newTicket.type === "Invite" && !newTicket.inviteEmail) {
      alert("Please enter an invite email.");
      return;
    }
    if (newTicket.type !== "Invite" && !isUnlimited && newTicket.quantity <= 0) {
      alert("Please enter a valid quantity or select Unlimited.");
      return;
    }
    addTicket(newTicket);
    setNewTicket({ name: "", price: 0, quantity: 0, type: "Paid" });
    setIsUnlimited(false);
    closeModal();
  };

  const priceParser = (value: string): string => {
    return value.replace(/\$\s?|(,*)/g, "");
  };

  const priceFormatter = (value: string): string => {
    return !Number.isNaN(parseFloat(value))
      ? `$ ${value.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
      : "$ ";
  };

  const toggleUnlimited = () => {
    if (isUnlimited) {
      handleTicketChange("quantity", 0);
    } else {
      handleTicketChange("quantity", "Unlimited");
    }
    setIsUnlimited(!isUnlimited);
  };

  return (
    <Modal
      opened={isModalOpen}
      onClose={closeModal}
      aria-labelledby="create-ticket-modal"
      title="Create a New Ticket"
      centered
    >
      <form onSubmit={handleSubmit}>
        <Stack spacing="md">
          {/* Ticket Name */}
          <TextInput
            label="Ticket Name"
            placeholder="e.g., General Admission"
            value={newTicket.name}
            onChange={(e) => handleTicketChange("name", e.target.value)}
            required
            maxLength={255}
            minLength={1}
            className={styles.textInput}
          />

          {/* Ticket Type Selection */}
          <RadioGroup
            label="Ticket Type"
            value={newTicket.type}
            onChange={handleTicketTypeChange}
            required
            className={styles.radioGroup}
          >
            <Flex justify="space-between">
              <Flex gap="xs">
                <Radio value="Paid" label="Paid" />
                <Radio value="Free" label="Free" />
              </Flex>
              <Radio value="Invite" label="By Invite" />
            </Flex>
          </RadioGroup>

          {/* Price Input */}
          {newTicket.type === "Paid" && (
            <NumberInput
              label="Price"
              placeholder="e.g., 100.00"
              value={newTicket.price}
              onChange={(value: number | undefined) =>
                handleTicketChange("price", value || 0)
              }
              required
              min={0.01}
              max={1000}
              step={0.01}
              precision={2}
              parser={priceParser}
              formatter={priceFormatter}
              className={styles.numberInput}
            />
          )}

          {/* Quantity Input */}
          {newTicket.type !== "Invite" && (
            <Flex className={styles.unlimited}>
              <div className={styles.btn}>
                <NumberInput
                  label="Quantity"
                  placeholder="e.g., 100"
                  value={isUnlimited ? undefined : newTicket.quantity}
                  onChange={(value: number | undefined) =>
                    handleTicketChange("quantity", value || 0)
                  }
                  required={!isUnlimited}
                  min={1}
                  disabled={isUnlimited}
                  className={styles.numberInput}
                />
              </div>
              <Button
                type="button"
                onClick={toggleUnlimited}
                variant={isUnlimited ? "filled" : "outline"}
                color={isUnlimited ? "red" : "blue"}
                className={styles.unlimitedButton}
              >
                {isUnlimited ? "Set Quantity" : "Unlimited"}
              </Button>
            </Flex>
          )}

          {/* Invite Email Input */}
          {newTicket.type === "Invite" && (
            <TextInput
              label="Invite Email"
              placeholder="e.g., user@example.com"
              value={newTicket.inviteEmail || ""}
              onChange={(e) =>
                handleTicketChange("inviteEmail", e.target.value)
              }
              required
              className={styles.textInput}
            />
          )}

          {/* Submit Button */}
          <div className={styles.submitBtn}>
            <Button type="submit" className={styles.submitButton}>
              Add Ticket
            </Button>
          </div>
        </Stack>
      </form>
    </Modal>
  );
};

export default TicketModal;