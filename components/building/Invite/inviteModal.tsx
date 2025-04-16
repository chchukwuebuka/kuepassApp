
import React from "react";
import styles from "./modal.module.css";

interface ModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const InviteModal: React.FC<ModalProps> = ({ onClose, onSuccess }) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    onClose();
    onSuccess();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        <h2 className={styles.modalText}>Create a New Ticket</h2>
        <form onSubmit={handleSubmit}>
          <label className={styles.label}>Name *</label>
          <input
            type="name"
            placeholder="Enter name"
            required
            className={styles.input}
          />

          <label className={styles.label}>Email Address *</label>
          <input
            type="email"
            placeholder="Enter email"
            required
            className={styles.input}
          />

          <label className={styles.label}>Description / Purpose *</label>
          <textarea
            placeholder="Enter details"
            required
            className={styles.input}
          ></textarea>

          <label className={styles.label}>Status *</label>
          <div className={styles.radioGroup}>
            <input type="radio" id="one-time" name="status" value="One-time" />
            <label htmlFor="one-time">One-time</label>
            <input
              type="radio"
              id="reoccurring"
              name="status"
              value="Reoccurring"
            />
            <label htmlFor="reoccurring">Reoccurring</label>
          </div>

          <div className={styles.dateGroup}>
            <div className={styles.labeDiv}>
              <label className={styles.label}>Start Date *</label>
              <input type="date" required className={styles.input1} />
            </div>

            <div className={styles.labeDiv}>
              <label className={styles.label}>Start Time *</label>
              <input type="time" required className={styles.input1} />
            </div>
          </div>

          <div className={styles.dateGroup1}>
            <div className={styles.labeDiv}>
              <label className={styles.label}>End Date *</label>
              <input type="date" required className={styles.input1} />
            </div>

            <div className={styles.labeDiv}>
              <label className={styles.label}>End Time *</label>
              <input type="time" required className={styles.input1} />
            </div>
          </div>

          <div className={styles.saveButton1}>
            <button type="submit" className={styles.saveButton}>
              Save Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteModal;
