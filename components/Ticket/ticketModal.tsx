"use client";
import React, { useState } from "react";
import {
  Modal,
  Button,
  TextInput,
  NumberInput,
  Radio, // RadioGroup is not directly used, but Radio is
  Flex,
  Stack,
  Text,
  Group,
  RadioGroup, // Explicitly import RadioGroup if needed, or ensure Flex+Group gives desired layout
} from "@mantine/core";
import styles from "./ticketModal.module.css";
import { Ticket } from "../../store/types"; // Assuming correct path to your types

interface TicketModalProps {
  isModalOpen: boolean;
  closeModal: () => void;
  addTicket: (
    ticket: Omit<Ticket, "id" | "category_price" | "category_name"> & {
      price: number;
      type: "Paid" | "Free" | "Invite";
      quantity: number | "Unlimited";
      inviteEmail?: string;
    }
  ) => void; // Adjust addTicket prop type
}

const TicketModal: React.FC<TicketModalProps> = ({
  isModalOpen,
  closeModal,
  addTicket,
}) => {
  const initialTicketState: Omit<
    Ticket,
    "id" | "category_price" | "category_name"
  > & {
    price: number;
    type: "Paid" | "Free" | "Invite";
    quantity: number | "Unlimited";
    inviteEmail?: string;
  } = {
    name: "",
    price: 0, // Price will be a number
    quantity: 0, // Quantity will be a number initially, or string "Unlimited"
    type: "Paid",
    inviteEmail: "",
  };
  const [newTicket, setNewTicket] = useState(initialTicketState);
  const [isUnlimited, setIsUnlimited] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleTicketChange = (
    field: keyof typeof initialTicketState,
    value: string | number | undefined // Allow undefined for NumberInput clear
  ) => {
    setNewTicket((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTicketTypeChange = (value: string) => {
    if (value === "Paid" || value === "Free" || value === "Invite") {
      const ticketType = value as "Paid" | "Free" | "Invite";
      setNewTicket((prev) => ({
        ...prev,
        type: ticketType,
        price: ticketType === "Free" ? 0 : prev.price,
        quantity:
          ticketType === "Invite"
            ? 1
            : isUnlimited
            ? "Unlimited"
            : prev.quantity, // Invite typically for 1, can be adjusted
        inviteEmail:
          ticketType === "Invite" ? prev.inviteEmail || "" : undefined,
      }));
      if (ticketType === "Invite") {
        setIsUnlimited(false); // Invites usually have a fixed quantity (often 1)
      }
    } else {
      console.warn(`Unexpected ticket type: ${value}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate inputs
    if (!newTicket.name.trim()) {
      alert("Ticket name is required.");
      setIsLoading(false);
      return;
    }
    if (
      newTicket.type === "Paid" &&
      (newTicket.price === undefined || newTicket.price <= 0)
    ) {
      alert("Price must be greater than ₦0.00 for paid tickets.");
      setIsLoading(false);
      return;
    }
    if (newTicket.type === "Free" && newTicket.price !== 0) {
      alert("Price must be ₦0.00 for free tickets.");
      // Optionally auto-correct: setNewTicket(prev => ({...prev, price: 0}));
      setIsLoading(false);
      return;
    }
    if (
      newTicket.type === "Invite" &&
      (!newTicket.inviteEmail || !newTicket.inviteEmail.trim())
    ) {
      alert("Please enter an invite email for 'By Invite' tickets.");
      setIsLoading(false);
      return;
    }
    if (
      newTicket.type !== "Invite" &&
      !isUnlimited &&
      (newTicket.quantity === undefined || Number(newTicket.quantity) <= 0)
    ) {
      alert("Please enter a valid quantity or select Unlimited.");
      setIsLoading(false);
      return;
    }

    // Prepare ticket data to be sent to parent
    const ticketToAdd = {
      ...newTicket,
      quantity: isUnlimited ? "Unlimited" : Number(newTicket.quantity),
    };

    // Simulate API call or any async operation if needed inside modal, though addTicket is usually synchronous
    // await new Promise(resolve => setTimeout(resolve, 500));

    addTicket(ticketToAdd); // This calls the function from the parent component

    // Reset form state
    setNewTicket(initialTicketState);
    setIsUnlimited(false);
    setIsLoading(false);
    closeModal();
  };

  const priceParser = (value: string | undefined): string => {
    if (value === undefined) return "";
    return value.replace(/₦\s?|(,*)/g, "");
  };

  const priceFormatter = (value: string | undefined): string => {
    if (value === undefined || value === "") return "₦"; // Handle empty or undefined
    const num = parseFloat(value);
    return !Number.isNaN(num)
      ? `₦${num.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "₦";
  };

  const toggleUnlimited = () => {
    const currentlyUnlimited = !isUnlimited; // Value it will become
    setIsUnlimited(currentlyUnlimited);
    if (currentlyUnlimited) {
      handleTicketChange("quantity", "Unlimited" as any); // Type assertion as quantity expects number here based on state
    } else {
      handleTicketChange("quantity", 0); // Reset to 0 or a default when unchecking
    }
  };

  const handleCancel = () => {
    setNewTicket(initialTicketState);
    setIsUnlimited(false);
    closeModal();
  };

  return (
    <Modal
      opened={isModalOpen}
      onClose={isLoading ? () => {} : closeModal} // Prevent closing while loading
      title={
        <Text fw={700} size="xl">
          Create New Ticket
        </Text>
      }
      centered
      size="lg"
      className={styles.modalContent}
      overlayProps={{ blur: 3, backgroundOpacity: 0.2 }}
      closeOnClickOutside={!isLoading}
      closeOnEscape={!isLoading}
    >
      <form onSubmit={handleSubmit} className={isLoading ? styles.loading : ""}>
        <Stack spacing="lg">
          <div className={styles.formSection}>
            <Text className={styles.sectionTitle}>Basic Information</Text>
            <TextInput
              label="Ticket Name"
              placeholder="e.g., General Admission, VIP Pass"
              value={newTicket.name}
              onChange={(e) =>
                handleTicketChange("name", e.currentTarget.value)
              }
              required
              maxLength={255}
              className={styles.textInput}
            />
            <Radio.Group // Changed from RadioGroup to Radio.Group for Mantine v7
              name="ticketType"
              label="Ticket Type"
              value={newTicket.type}
              onChange={(value) => handleTicketTypeChange(value)}
              required
              className={styles.radioGroup}
            >
              <Group mt="xs" className={styles.radioFlex}>
                <Radio value="Paid" label="Paid" />
                <Radio value="Free" label="Free" />
                <Radio value="Invite" label="By Invite" />
              </Group>
            </Radio.Group>
          </div>

          {newTicket.type === "Paid" && (
            <div className={styles.formSection}>
              <Text className={styles.sectionTitle}>Pricing</Text>
              <NumberInput
                label="Price"
                placeholder="Enter ticket price"
                value={newTicket.price}
                onChange={(value) =>
                  handleTicketChange(
                    "price",
                    typeof value === "number" ? value : 0
                  )
                }
                required
                min={0.01} // Smallest positive value for paid tickets
                step={0.01}
                precision={2}
                parser={priceParser}
                formatter={priceFormatter}
                className={styles.numberInput}
              />
              {newTicket.price > 0 && (
                <div className={styles.priceDisplay}>
                  Total: {priceFormatter(newTicket.price.toString())}
                </div>
              )}
            </div>
          )}

          {newTicket.type !== "Invite" && (
            <div className={styles.formSection}>
              <Text className={styles.sectionTitle}>Availability</Text>
              <Flex align="flex-end" gap="md" className={styles.unlimited}>
                {" "}
                {/* Use Flex for alignment */}
                <NumberInput
                  style={{ flexGrow: 1 }} // Allow NumberInput to take available space
                  label="Quantity"
                  placeholder="Enter number of tickets"
                  value={
                    isUnlimited ? undefined : (newTicket.quantity as number)
                  } // Cast for NumberInput when not unlimited
                  onChange={(value) =>
                    handleTicketChange(
                      "quantity",
                      typeof value === "number" ? value : 0
                    )
                  }
                  required={!isUnlimited}
                  min={1} // Minimum 1 if not unlimited
                  disabled={isUnlimited}
                  className={styles.numberInput}
                />
                <Button
                  type="button"
                  onClick={toggleUnlimited}
                  variant={isUnlimited ? "filled" : "outline"}
                  className={styles.unlimitedButton} // Keep your existing style
                >
                  {isUnlimited ? "Set Limit" : "Unlimited"}
                </Button>
              </Flex>
            </div>
          )}

          {newTicket.type === "Invite" && (
            <div className={styles.formSection}>
              <Text className={styles.sectionTitle}>Invitation Details</Text>
              <TextInput
                label="Invite Email"
                placeholder="Enter email address for invitation"
                value={newTicket.inviteEmail || ""}
                onChange={(e) =>
                  handleTicketChange("inviteEmail", e.currentTarget.value)
                }
                required
                type="email"
                className={styles.textInput}
              />
            </div>
          )}

          <Group justify="flex-end" mt="xl" className={styles.submitBtn}>
            <Button
              type="button"
              variant="default"
              onClick={handleCancel}
              className={styles.cancelButton}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              Create Ticket
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default TicketModal;
