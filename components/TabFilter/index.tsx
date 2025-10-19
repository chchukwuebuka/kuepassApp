import React from "react";
import styles from "./styles.module.css";

interface TabFilterProps {
  filter: string;
  setFilter: (filter: string) => void;
  totalAttendees: number;
  validatedAttendees: number;
}

const TabFilter: React.FC<TabFilterProps> = ({
  filter,
  setFilter,
  totalAttendees,
  validatedAttendees,
}) => {
  return (
    <div className={styles.tabs}>
      <button
        className={`${styles.tabButton} ${
          filter === "all" ? styles.activeTab : ""
        }`}
        onClick={() => setFilter("all")}
      >
        All {totalAttendees}
      </button>
      <button
        className={`${styles.tabButton} ${
          filter === "validated" ? styles.activeTab : ""
        }`}
        onClick={() => setFilter("validated")}
      >
        Validated {validatedAttendees}
      </button>
    </div>
  );
};

export default TabFilter;
