import React, { useEffect, useRef } from "react";
import styles from "./styles.module.css";
import { Image } from "@mantine/core";

interface ModalProps {
  show: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

const Modal: React.FC<ModalProps> = ({ show, onClose, title, message }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape" && show) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [show, onClose]);

  useEffect(() => {
    if (show) {
      closeButtonRef.current?.focus();
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
      >

         <Image
         src="/images/success.png" 
         alt="modalLogo"
         className={styles.modalIMG}
         />  

        <h2 className={styles.modalTitle}>{title}</h2>
        <p className={styles.modalMessage}>{message}</p>
        <button
          className={styles.modalCloseButton}
          onClick={onClose}
          ref={closeButtonRef}
        >
          View Site
        </button>
      </div>
    </div>
  );
};

export default Modal;


