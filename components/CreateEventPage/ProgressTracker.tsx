"use client";

import React from "react";
import { IconCheck, IconEye } from "@tabler/icons-react";
import Link from "next/link";
import styles from "./styles.module.css";

interface Step {
  id: number;
  label: string;
  completed: boolean;
}

interface ProgressTrackerProps {
  steps: Step[];
  currentStep: number;
  onPublish?: () => void;
  isSubmitting?: boolean;
}

export default function ProgressTracker({
  steps,
  currentStep,
  onPublish,
  isSubmitting,
}: ProgressTrackerProps) {
  return (
    <div className={styles.progressTracker}>
      <div className={styles.progressHeader}>
        {/* <Link href="#" className={styles.viewEventLink}>
          <IconEye size={18} />
          <span>View your event</span>
        </Link> */}

        <div className={styles.stepsContainer}>
          {steps.map((step, index) => {
            const isCompleted = step.completed || step.id < currentStep;

            return (
              <React.Fragment key={step.id}>
                <div
                  className={`${styles.step} ${
                    step.id === currentStep ? styles.activeStep : ""
                  } ${isCompleted ? styles.completedStep : ""}`}
                >
                  {isCompleted ? (
                    <IconCheck size={18} className={styles.checkIcon} />
                  ) : (
                    <div className={styles.stepCircle}>
                      <IconCheck
                        size={18}
                        className={styles.incompleteCheckIcon}
                      />
                    </div>
                  )}
                  <span className={styles.stepLabel}>{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`${styles.stepConnector} ${
                      isCompleted ? styles.connectorActive : ""
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {currentStep === 3 && onPublish && (
          <button
            type="button"
            className={styles.progressPublishButton}
            onClick={onPublish}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Publishing..." : "Publish"}
          </button>
        )}

        {/* <div className={styles.userProfile}>
          <span>More</span>
        </div> */}
      </div>
    </div>
  );
}
