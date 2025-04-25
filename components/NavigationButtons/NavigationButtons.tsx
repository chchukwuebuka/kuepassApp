

import React from "react";
import styles from "./NavigationButtons.module.css";

interface NavigationButtonsProps {
  currentStep: number;
  handleBack: () => void;
  isLastStep: boolean;
  isLoading?: boolean;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  currentStep,
  handleBack,
  isLastStep,
  isLoading,
}) => {
  return (
    <div className={styles.buttonGroup}>
      {currentStep > 1 && (
        <button
          type="button"
          onClick={handleBack}
          className={styles.backButton}
          disabled={isLoading}
        >
          Back
        </button>
      )}
      <button
        type="submit"
        className={styles.submitButton}
        disabled={isLoading}
      >
        {isLastStep ? (isLoading ? "Submitting..." : "Submit") : "Next"}
      </button>
    </div>
  );
};

export default NavigationButtons;
