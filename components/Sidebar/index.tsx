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
  FaRegEdit
} from "react-icons/fa";
import { ReactElement } from "react";

export type PageKey =
  | "overview"
  | "createEvent"
  | "customization"
  | "userManagement"
  | "finance"
  | "salesAnalytics"
  | "Generate Promotion Kit"
  | "vendorMarketplace"
  | "vendorDashboard"
  | "refunds"
  | "eventTools"
  | "sponsors"
  | "sessions"
  | "surveys"
  | "seating"
  | "store"
  | "support"
  | "bulkPreRegister";

interface SidebarProps {
  activePage: PageKey;
  onNavClick: (pageKey: PageKey) => void;
  isVendor?: boolean;
  hasEvent?: boolean;
}

type MenuCategory = "General" | "Event Management" | "Audience" | "Finance & Sales" | "Marketing" | "Bottom";

const menuItems: {
  key: PageKey;
  icon?: ReactElement;
  label: string;
  category: MenuCategory;
  isBottom?: boolean;
  disabled?: boolean;
  vendorOnly?: boolean;
  requiresEvent?: boolean;
}[] = [
  // General
  { key: "createEvent", icon: <FaHome />, label: "Create Event", category: "General" },
  { key: "vendorMarketplace", icon: <FaHandshake />, label: "Vendor Hub", category: "General" },
  { key: "vendorDashboard", icon: <FaStore />, label: "Vendor Portal", vendorOnly: true, category: "General" },
  
  // Event Management
  { key: "overview", icon: <FaChartLine />, label: "Overview", requiresEvent: true, category: "Event Management" },
  { key: "customization", icon: <FaRegEdit />, label: "Customization", requiresEvent: true, category: "Event Management" },
  { key: "eventTools", icon: <FaToolbox />, label: "Event Tools", requiresEvent: true, category: "Event Management" },
  { key: "sessions", icon: <FaCalendarAlt />, label: "Sessions", requiresEvent: true, category: "Event Management" },
  { key: "seating", icon: <FaChair />, label: "Seating", requiresEvent: true, category: "Event Management" },
  
  // Audience
  { key: "userManagement", icon: <FaUsers />, label: "Attendees", requiresEvent: true, category: "Audience" },
  { key: "bulkPreRegister", icon: <FaUserFriends />, label: "Batch Import", requiresEvent: true, category: "Audience" },
  { key: "surveys", icon: <FaClipboardList />, label: "Surveys", requiresEvent: true, category: "Audience" },
  
  // Finance & Sales
  { key: "salesAnalytics", icon: <FaChartLine />, label: "Sales & Analytics", requiresEvent: true, category: "Finance & Sales" },
  { key: "finance", icon: <FaMoneyBill />, label: "Finance", disabled: true, category: "Finance & Sales" },
  { key: "refunds", icon: <FaUndo />, label: "Refunds", requiresEvent: true, category: "Finance & Sales" },
  { key: "sponsors", icon: <FaTrophy />, label: "Sponsors", requiresEvent: true, category: "Finance & Sales" },
  { key: "store", icon: <FaStore />, label: "Store", disabled: true, category: "Finance & Sales" },
  
  // Marketing
  { key: "Generate Promotion Kit", icon: <FaStore />, label: "Promotion Kit", requiresEvent: true, category: "Marketing" },
  
  // Bottom
  { key: "support", icon: <FaCog />, label: "Support", isBottom: true, disabled: true, category: "Bottom" },
];

const Sidebar = ({ activePage, onNavClick, isVendor = false, hasEvent = false }: SidebarProps) => {
  const getItemDisabled = (item: (typeof menuItems)[0]) => {
    return item.disabled ? true : false;
  };

  const visibleItems = menuItems.filter((item) => {
    if (item.vendorOnly && !isVendor) return false;
    if (item.requiresEvent && !hasEvent) return false;
    return true;
  });

  const categories = ["General", "Event Management", "Audience", "Finance & Sales", "Marketing"] as const;
  const bottomItems = visibleItems.filter((item) => item.isBottom);

  return (
    <nav className={styles.sidebar} aria-label="Sidebar Navigation">
      <div className={styles.topMenuContainer}>
        {categories.map((category) => {
          const itemsInCategory = visibleItems.filter((item) => !item.isBottom && item.category === category);
          
          if (itemsInCategory.length === 0) return null;

          return (
            <div key={category} className={styles.categorySection}>
              <div className={styles.categoryHeader}>{category}</div>
              <ul className={styles.menu}>
                {itemsInCategory.map((item) => {
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
                        <span className={styles.iconWrapper}>{item.icon}</span>
                        <span className={styles.label}>{item.label}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

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
                <span className={styles.iconWrapper}>{item.icon}</span>
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
