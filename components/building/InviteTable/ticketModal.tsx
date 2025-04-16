import React, { useState } from "react";
import styles from "./ticketModal.module.css";
import { Modal, TextInput, Textarea, Button } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import SuccessModal from "./successModal";

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TicketModal: React.FC<TicketModalProps> = ({ isOpen, onClose }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedName, setSavedName] = useState("");

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      description: "",
      startDate: null as Date | null,
    },
    validate: {
      name: (value) => (value.trim() === "" ? "Name is required" : null),
      email: (value) =>
        /^\S+@\S+\.\S+$/.test(value) ? null : "Please enter a valid email",
      phone: (value) =>
        value.trim() === "" ? "Phone number is required" : null,
      description: (value) =>
        value.trim() === "" ? "Description is required" : null,
      startDate: (value) => (!value ? "Start Date is required" : null),
    },
  });

  
  const handleSubmit = (values: typeof form.values) => {
    console.log("Form values:", values);
    setSavedName(values.name); 
    setShowSuccess(true);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    onClose(); 
  };

  const handleEdit = () => {
    setShowSuccess(false);
  };

  return (
    <>
      <Modal
        opened={isOpen}
        onClose={onClose}
        centered
        withCloseButton={false}
        overlayProps={{ opacity: 0.3, blur: 3 }}
        classNames={{ body: styles.modalBody }}
      >
        <div className={styles.modalContainer}>
          <button className={styles.closeButton} onClick={onClose}>
            ✖
          </button>

          {/* Attach the form onSubmit handler */}
          <form
            className={styles.formContainer}
            onSubmit={form.onSubmit(handleSubmit)}
          >
            <TextInput
              label="Member’s Name"
              placeholder="Enter name"
              required
              {...form.getInputProps("name")}
            />
            <TextInput
              label="Member’s Email Address"
              placeholder="Enter email"
              required
              {...form.getInputProps("email")}
            />
            <TextInput
              label="Member’s Phone Number"
              placeholder="Enter phone number"
              required
              {...form.getInputProps("phone")}
            />
            <Textarea
              label="Description/ Purpose"
              placeholder="Enter purpose"
              required
              {...form.getInputProps("description")}
            />
            <DateInput
              label="Start Date"
              placeholder="Select date"
              required
              {...form.getInputProps("startDate")}
            />

            <Button fullWidth type="submit" className={styles.saveButton}>
              Save Invite
            </Button>
          </form>
        </div>
      </Modal>

      {/* Conditionally render the SuccessModal as an overlay, passing the saved name */}
      {showSuccess && (
        <SuccessModal
          onClose={handleSuccessClose}
          onEdit={handleEdit}
          name={savedName}
        />
      )}
    </>
  );
};

export default TicketModal;
