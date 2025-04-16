import React from "react";
import styles from "./successModal.module.css";
import { Image } from "@mantine/core";

interface SuccessModalProps {
  onClose: () => void;
  onEdit: () => void;
  name: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ onClose, onEdit, name }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <Image
          src="/images/success.png"
          alt="modalLogo"
          className={styles.modalIMG}
        />
        <h2 className={styles.modalText}>Member Saved</h2>
        <p className={styles.modalText1}>
          You have successfully created an invite for <strong>{name}</strong> under the Crisp TV Building.
        </p>
        <div className={styles.btn}>
          <button className={styles.closeButton1} onClick={onEdit}>
            Edit Invite
          </button>
          <button className={styles.closeButton} onClick={onClose}>
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
