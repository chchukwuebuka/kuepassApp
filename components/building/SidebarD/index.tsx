import { ReactElement } from 'react';
import { FaCog, FaHome, FaMoneyBill, FaSignOutAlt, FaUsers } from 'react-icons/fa';
import styles from './styles.module.css';

export type PageKey =
  | "overview"
  | "customization"
  | "invite"
  | "members"
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
}[] = [
  { key: "overview", icon: <FaHome />, label: "Overview" },
  { key: "customization", icon: <FaUsers />, label: "Customization" },
  { key: "invite", icon: <FaUsers />, label: "Invite" },
  { key: "members", icon: <FaMoneyBill />, label: "Members" },
  { key: "support", icon: <FaCog />, label: "Support", isBottom: true },
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
            className={activePage === item.key ? styles.active : ""}
            onClick={() => onNavClick(item.key)}
            tabIndex={0} // Makes it focusable via keyboard
          >
            <span className={styles.link}>
              {item.icon}
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
            }`}
            onClick={() => onNavClick(item.key)}
            tabIndex={0}
          >
            <span className={styles.link}>
              {item.icon}
              <span className={styles.label}>{item.label}</span>
            </span>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;
