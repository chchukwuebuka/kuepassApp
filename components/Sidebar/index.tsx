"use client";

import styles from "./styles.module.css";
import {
  FaHome,
  FaUsers,
  FaMoneyBill,
  FaStore,
  FaCog,
  FaSignOutAlt,
  FaChartLine,
} from "react-icons/fa";
import { ReactElement } from "react";

export type PageKey =
  | "overview"
  | "customization"
  | "userManagement"
  | "finance"
  | "salesAnalytics"
  | "Generate Promotion Kit"
  | "store"
  | "support"
  | "logout";

interface SidebarProps {
  activePage: PageKey;
  onNavClick: (pageKey: PageKey) => void;
}

const menuItems: {
  key: PageKey;
  icon?: ReactElement;
  label: string;
  isBottom?: boolean;
  disabled?: boolean;
}[] = [
  { key: "overview", icon: <FaHome />, label: "Overview" },
  {
    key: "customization",
    icon: <FaUsers />,
    label: "Customization",
  },
  { key: "userManagement", icon: <FaUsers />, label: "User Management" },
  { key: "finance", icon: <FaMoneyBill />, label: "Finance", disabled: true },
  {
    key: "salesAnalytics",
    icon: <FaChartLine />,
    label: "Sales Analytics",
    disabled: true,
  },
  {
    key: "Generate Promotion Kit",
    icon: <FaStore />,
    label: "Generate Promotion Kit",
    disabled: true,
  },
  { key: "store", icon: <FaStore />, label: "Store", disabled: true },
  {
    key: "support",
    icon: <FaCog />,
    label: "Support",
    isBottom: true,
    disabled: true,
  },
  { key: "logout", icon: <FaSignOutAlt />, label: "Log Out", isBottom: true },
];

const Sidebar = ({ activePage, onNavClick }: SidebarProps) => {
  const topItems = menuItems.filter((item) => !item.isBottom);
  const bottomItems = menuItems.filter((item) => item.isBottom);

  return (
    <nav className={styles.sidebar} aria-label="Sidebar Navigation">
      <ul className={styles.menu}>
        {topItems.map((item) => (
          <li
            key={item.key}
            className={`${activePage === item.key ? styles.active : ""} ${
              item.disabled ? styles.disabled : ""
            }`}
            onClick={() => !item.disabled && onNavClick(item.key)}
          >
            <span className={styles.link}>
              {item.icon} {/* ✅ Ensure icon is rendered */}
              <span className={styles.label}>{item.label}</span>
            </span>
          </li>
        ))}
      </ul>
      <ul className={styles.bottomMenu}>
        {bottomItems.map((item) => (
          <li
            key={item.key}
            className={`${activePage === item.key ? styles.active : ""} ${
              item.label === "Log Out" ? styles.logout : ""
            } ${item.disabled ? styles.disabled : ""}`}
            onClick={() => !item.disabled && onNavClick(item.key)}
          >
            <span className={styles.link}>
              {item.icon} {/* ✅ Ensure icon is rendered */}
              <span className={styles.label}>{item.label}</span>
            </span>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;
