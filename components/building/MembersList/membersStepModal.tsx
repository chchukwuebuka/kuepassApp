import React from "react";
import styles from "./styles.module.css";

interface ModalProps {
  show: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ show, onClose, title, children }: ModalProps) {
  if (!show) return null;
  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <div className={styles.modalBTN}>
          <button className={styles.BTN} onClick={onClose}>x</button>
        </div>
        <h2 className={styles.modalTitle}>{title}</h2>
        {children}
      </div>
    </div>
  );
}
