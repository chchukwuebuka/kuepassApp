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
  FaHandshake,
  FaUndo,
  FaToolbox,
  FaTrophy,
  FaCalendarAlt,
  FaClipboardList,
  FaChair,
  FaUserFriends,
} from "react-icons/fa";
import { ReactElement } from "react";

export type PageKey =
  | "overview"
  | "customization"
  | "userManagement"
  | "finance"
  | "salesAnalytics"
  | "Generate Promotion Kit"
  | "vendorMarketplace"
  | "refunds"
  | "eventTools"
  | "sponsors"
  | "sessions"
  | "surveys"
  | "seating"
  | "store"
  | "support"
  | "createEvent"
  | "logout"
  | "bulkPreRegister";

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
  { key: "overview", icon: <FaHome />, label: "Dashboard" },
  {
    key: "customization",
    icon: <FaUsers />,
    label: "Customization",
  },
  { key: "userManagement", icon: <FaUsers />, label: "User Management" },
  { key: "bulkPreRegister", icon: <FaUserFriends />, label: "Bulk Pre-Register" },
  { key: "finance", icon: <FaMoneyBill />, label: "Finance", disabled: true },
  {
    key: "salesAnalytics",
    icon: <FaChartLine />,
    label: "Sales Analytics",
  },
  {
    key: "Generate Promotion Kit",
    icon: <FaStore />,
    label: "Generate Promotion Kit",
  },
  {
    key: "vendorMarketplace",
    icon: <FaHandshake />,
    label: "Vendor Hub",
  },
  { key: "refunds", icon: <FaUndo />, label: "Refunds" },
  { key: "eventTools", icon: <FaToolbox />, label: "Event Tools" },
  { key: "sponsors", icon: <FaTrophy />, label: "Sponsors" },
  { key: "sessions", icon: <FaCalendarAlt />, label: "Sessions" },
  { key: "surveys", icon: <FaClipboardList />, label: "Surveys" },
  { key: "seating", icon: <FaChair />, label: "Seating" },
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

  // Disable "overview" (Dashboard) when creating an event
  const getItemDisabled = (item: (typeof menuItems)[0]) => {
    if (item.disabled) return true;
    // if (item.key === "overview" && activePage === "createEvent") return true;
    return false;
  };

  return (
    <nav className={styles.sidebar} aria-label="Sidebar Navigation">
      <ul className={styles.menu}>
        {topItems.map((item) => {
          const isDisabled = getItemDisabled(item);
          return (
            <li
              key={item.key}
              className={`${activePage === item.key ? styles.active : ""} ${
                isDisabled ? styles.disabled : ""
              }`}
              onClick={() => !isDisabled && onNavClick(item.key)}
            >
              <span className={styles.link}>
                {item.icon} {/* ✅ Ensure icon is rendered */}
                <span className={styles.label}>{item.label}</span>
              </span>
            </li>
          );
        })}
      </ul>
      <ul className={styles.bottomMenu}>
        {bottomItems.map((item) => {
          const isDisabled = getItemDisabled(item);
          return (
            <li
              key={item.key}
              className={`${activePage === item.key ? styles.active : ""} ${
                item.label === "Log Out" ? styles.logout : ""
              } ${isDisabled ? styles.disabled : ""}`}
              onClick={() => !isDisabled && onNavClick(item.key)}
            >
              <span className={styles.link}>
                {item.icon} {/* ✅ Ensure icon is rendered */}
                <span className={styles.label}>{item.label}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Sidebar;
