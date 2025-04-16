import React from "react";
import styles from "./styles.module.css";

interface UserTableProps {
  searchQuery?: string;
  filter?: string;
}

const users = Array(10).fill({
  name: "Robbin Nelson",
  ticketId: "09036278658",
  email: "robbinnelson@gmail.com",
});

const UserTable: React.FC<UserTableProps> = ({
  searchQuery = "",
  filter = "all",
}) => {
  const filteredUsers = users.filter((user) => {
    if (searchQuery && !user.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filter !== "all" && !user.ticketId.includes(filter)) {
      return false;
    }
    return true;
  });

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableUser}>
        <h3>Registered Users</h3>
        <button className={styles.tableBTN}>View All</button>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Name</th>
            <th className={styles.th}>Ticket ID</th>
            <th className={styles.th}>Email Address</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user, index) => (
            <tr key={index} className={styles.trName}>
              <td className={styles.td}>{user.name}</td>
              <td className={styles.td}>{user.ticketId}</td>
              <td className={styles.td}>{user.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
