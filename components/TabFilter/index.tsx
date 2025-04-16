import React from "react";
import styles from "./styles.module.css";

interface TabFilterProps {
  filter: string;
  setFilter: (filter: string) => void;
}

const TabFilter: React.FC<TabFilterProps> = ({ filter, setFilter }) => {
  return (
    <div className={styles.tabs}>
      <button
        className={`${styles.tabButton} ${filter === "all" ? styles.activeTab : ""}`}
        onClick={() => setFilter("all")}
      >
        All 142
      </button>
      <button
        className={`${styles.tabButton} ${filter === "validated" ? styles.activeTab : ""}`}
        onClick={() => setFilter("validated")}
      >
        Validated 42
      </button>
    </div>
  );
};

export default TabFilter;
