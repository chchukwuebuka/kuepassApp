import React from "react";
import styles from "./NavigationButtons.module.css";

interface NavigationButtonsProps {
  currentStep: number;
  handleBack: () => void;
  isLastStep: boolean;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  currentStep,
  handleBack,
  isLastStep,
}) => {
  return (
    <div className={styles.buttonGroup}>
      {currentStep > 1 && (
        <button
          type="button"
          onClick={handleBack}
          className={styles.backButton}
        >
          Back
        </button>
      )}
      <button type="submit" className={styles.submitButton}>
        {isLastStep ? "Submit" : "Next"}
      </button>
    </div>
  );
};

export default NavigationButtons;
