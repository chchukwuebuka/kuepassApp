// import React from "react";
// import styles from "./styles.module.css";

// interface StepIndicatorProps {
//   currentStep: number;
//   totalSteps?: number;
// }

// const StepIndicator: React.FC<StepIndicatorProps> = ({
//   currentStep,
//   totalSteps = 4, // Default to 4 steps
// }) => {
//   // Define step names
//   const stepNames: string[] = [
//     "Event Details",
//     "Ticket Modal",
//     "Custom Questions", // New step
//     "Appearance",
//   ];

//   return (
//     <div className={styles.stepIndicatorContainer}>
//       {stepNames.slice(0, totalSteps).map((step, index) => (
//         <div
//           key={index}
//           className={`${styles.step} ${
//             index + 1 === currentStep
//               ? styles.currentStep
//               : index + 1 < currentStep
//               ? styles.completedStep
//               : ""
//           }`}
//         >
//           <div className={styles.stepNumber}>Step {index + 1}</div>
//           <div className={styles.stepName}>{step}</div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default StepIndicator;


"use client";
import React, { useMemo } from "react";
import styles from "./styles.module.css";
import { FaCheckCircle } from "react-icons/fa";

/**
 * Props for the StepIndicator component
 */
interface StepIndicatorProps {
  /** Current active step (1-based index) */
  currentStep: number;
  /** Total number of steps in the process */
  totalSteps?: number;
}

/**
 * A component that displays a visual indicator of the current step in a multi-step process.
 * It shows numbered steps with labels and highlights the current and completed steps.
 */
const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps = 4, // Default to 4 steps
}) => {
  // Define step names with more descriptive titles
  const stepNames: string[] = useMemo(() => [
    "Event Details",
    "Ticket Options",
    "Registration Form",
    "Event Appearance",
  ], []);

  return (
    <div className={styles.stepIndicatorContainer} role="navigation" aria-label="Step Progress">
      {stepNames.slice(0, totalSteps).map((step, index) => {
        const stepNumber = index + 1;
        const isCurrentStep = stepNumber === currentStep;
        const isCompletedStep = stepNumber < currentStep;
        
        return (
          <div
            key={index}
            className={`${styles.step} ${
              isCurrentStep
                ? styles.currentStep
                : isCompletedStep
                ? styles.completedStep
                : styles.pendingStep
            }`}
            aria-current={isCurrentStep ? "step" : undefined}
          >
            <div className={styles.stepCircle}>
              {isCompletedStep ? (
                <FaCheckCircle className={styles.checkIcon} aria-hidden="true" />
              ) : (
                <span className={styles.stepNumber}>{stepNumber}</span>
              )}
            </div>
            <div className={styles.stepName}>{step}</div>
            
            {/* Connector between steps */}
            {stepNumber < totalSteps && (
              <div 
                className={`${styles.connector} ${
                  isCompletedStep ? styles.completedConnector : ''
                }`} 
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;