"use client";

import React, { useState, useEffect } from "react";
import { IconX, IconPlus } from "@tabler/icons-react";
import { v4 as uuidv4 } from "uuid";
import styles from "./QuestionModal.module.css";

export interface EventService {
  id: string;
  name: string;
  description?: string;
  linkedTicketId?: string;
}

interface EventServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: EventService) => void;
  service?: EventService | null;
  tickets?: Array<{ id: string; name: string }>;
}

const EventServiceModal: React.FC<EventServiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  service,
  tickets = [],
}) => {
  const [serviceName, setServiceName] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [linkedTicketId, setLinkedTicketId] = useState("all");

  useEffect(() => {
    if (service) {
      setServiceName(service.name);
      setServiceDescription(service.description || "");
      setLinkedTicketId(service.linkedTicketId || "all");
    } else {
      setServiceName("");
      setServiceDescription("");
      setLinkedTicketId("all");
    }
  }, [service, isOpen]);

  const handleSave = () => {
    if (!serviceName.trim()) {
      alert("Service name is required.");
      return;
    }

    const serviceToSave: EventService = {
      id: service?.id || uuidv4(),
      name: serviceName.trim(),
      description: serviceDescription.trim() || undefined,
      linkedTicketId: linkedTicketId === "all" ? undefined : linkedTicketId,
    };

    onSave(serviceToSave);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {service ? "Edit Service" : "Add Service"}
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
          >
            <IconX size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Service Name */}
          <div className={styles.formRow}>
            <div className={styles.formField} style={{ width: "100%" }}>
              <label className={styles.fieldLabel}>
                Service Name<span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className={styles.textInput}
                placeholder="e.g. VIP Goodie Bag, T-Shirt, Lunch Pack"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className={styles.formRow}>
            <div className={styles.formField} style={{ width: "100%" }}>
              <label className={styles.fieldLabel}>
                Description (Optional)
              </label>
              <input
                type="text"
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                className={styles.textInput}
                placeholder="Brief details about this service..."
              />
            </div>
          </div>

          {/* Ticket Linking */}
          <div className={styles.formRow}>
            <div className={styles.formField} style={{ width: "100%" }}>
              <label className={styles.fieldLabel}>
                Link to Ticket Type
              </label>
              <select
                value={linkedTicketId}
                onChange={(e) => setLinkedTicketId(e.target.value)}
                className={styles.selectInput}
              >
                <option value="all">General (All Tickets)</option>
                {tickets.map((ticket) => (
                  <option key={ticket.id} value={ticket.id}>
                    {ticket.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Save Button */}
          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.saveButton}
              onClick={handleSave}
            >
              <IconPlus size={18} />
              Save Service
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventServiceModal;
