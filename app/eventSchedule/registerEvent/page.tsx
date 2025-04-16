
"use client";
import { useState } from "react";
import styles from "./styles.module.css";
import Modal from "@/components/Modal";

const RegisterEvent = () => {
  // Existing state variables
  const [event] = useState({
    name: "Quiz & Coding Competition",
    description: "Regular",
    price: 100.0,
  });

  const [extra] = useState({
    name: "Quiz & Code Competition",
    description: "Reserve",
    price: 50.0,
  });

  const [selectedSection, setSelectedSection] = useState<"event" | "extra" | null>(null);

  // New state for modal visibility
  const [showModal, setShowModal] = useState(false);

  const handleSelect = (section: "event" | "extra") => {
    setSelectedSection((prevSection) => (prevSection === section ? null : section));
  };

  // Fixed Fees
  const fees = 50.0;

  const calculateTotal = (): number => {
    if (selectedSection === "event") {
      return event.price + fees;
    } else if (selectedSection === "extra") {
      return extra.price + fees;
    }
    return 0;
  };

  const handlePurchase = () => {
    if (selectedSection === "event") {
      console.log("Purchasing Event:", event);
      // Show modal with event purchase success message
      setShowModal(true);
    } else if (selectedSection === "extra") {
      console.log("Purchasing Extra:", extra);
      // Show modal with extra purchase success message
      setShowModal(true);
    }

    setSelectedSection(null);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Register For Event</h1>
      <p className={styles.subtitle}>You are just one step away!</p>

      <div className={styles.formContainer}>
        {/* Form Section */}
        <div className={styles.formBox}>
          {/* Event Section */}
          <button
            className={`${styles.formBox1} ${
              selectedSection === "event" ? styles.selected : ""
            }`}
            onClick={() => handleSelect("event")}
            aria-pressed={selectedSection === "event"}
            style={{border: "none"}}
          >
            <div>
              <div className={styles.formGroup}>
                <label htmlFor="event-name">Name</label>
                <input
                  id="event-name"
                  type="text"
                  value={event.name}
                  readOnly
                  className={styles.input}
                />
              </div>
              <div className={`${styles.formGroup} ${styles.formGroup1}`}>
                <label htmlFor="event-description">Description</label>
                <input
                  id="event-description"
                  type="text"
                  value={event.description}
                  readOnly
                  className={styles.input}
                />
              </div>
            </div>
            <div className={`${styles.formGroup} ${styles.formPrice}`}>
              <label htmlFor="event-price">Price</label>
              <input
                id="event-price"
                type="text"
                value={`$${event.price.toFixed(2)}`}
                readOnly
                className={styles.inputPrice}
              />
            </div>
          </button>

          <div className={styles.separator}></div>

          {/* Extra Section */}
          <button
            className={`${styles.formBox1} ${
              selectedSection === "extra" ? styles.selected : ""
            }`}
            onClick={() => handleSelect("extra")}
            aria-pressed={selectedSection === "extra"}
            style={{border: "none"}}
          >
            <div>
              <div className={styles.formGroup}>
                <label htmlFor="extra-name">Name</label>
                <input
                  id="extra-name"
                  type="text"
                  value={extra.name}
                  readOnly
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="extra-description">Description</label>
                <input
                  id="extra-description"
                  type="text"
                  value={extra.description}
                  readOnly
                  className={styles.input}
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="extra-price">Price</label>
              <input
                id="extra-price"
                type="text"
                value={`$${extra.price.toFixed(2)}`}
                readOnly
                className={styles.inputPrice}
              />
            </div>
          </button>
        </div>

        {/* Summary Section */}
        <div className={styles.summaryBox}>
          <h2 className={styles.summaryTitle}>Summary</h2>
          <div className={styles.summaryContent}>
            {selectedSection ? (
              <>
                {selectedSection === "event" && (
                  <div className={styles.summaryItem}>
                    <span>Regular:</span>
                    <span>${event.price.toFixed(2)}</span>
                  </div>
                )}

                {selectedSection === "extra" && (
                  <div className={styles.summaryItem}>
                    <span>Extra:</span>
                    <span>${extra.price.toFixed(2)}</span>
                  </div>
                )}

                {/* Always display Fees */}
                <div className={styles.summaryItem}>
                  <span>Fees:</span>
                  <span>${fees.toFixed(2)}</span>
                </div>

                <div className={styles.summaryTotal}>
                  <span>Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </>
            ) : (
              <div className={styles.noSelection}>
                Please select an event or extra to see the summary.
              </div>
            )}
          </div>
          <div className={styles.Btn}>
            <button
              className={styles.purchaseBtn}
              disabled={selectedSection === null}
              onClick={handlePurchase}
            >
              Purchase
            </button>
          </div>
        </div>
      </div>

      {/* Modal Component */}
      <Modal
        show={showModal}
        onClose={closeModal}
        title="Payment Successful"
        message={
          selectedSection === "event"
            ? `You have successfully purchased the "${event.name}".`
            : selectedSection === "extra"
            ? `You have successfully purchased the "${extra.name}".`
            : "You have successfully purchased a ticket for OSI-ITE COKING COMPETITION. We’ll redirect you to the event site in 3...."
        }
      />
    </div>
  );
};

export default RegisterEvent;

