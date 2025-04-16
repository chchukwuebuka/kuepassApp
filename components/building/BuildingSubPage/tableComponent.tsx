import styles from "./tableCompnent.module.css";

interface TableProps {
  name: string;
  date: string;
  time: string;
  invitee: string;
}

const TableComponent: React.FC<TableProps> = ({ name, date, time, invitee }) => {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Name</th>
            <th className={styles.th}>Date</th>
            <th className={styles.th}>Time</th>
            <th className={styles.th}>Invitee</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className={styles.td}>{name}</td>
            <td className={styles.td}>{date}</td>
            <td className={styles.td}>{time}</td>
            <td className={styles.td}>{invitee}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default TableComponent;
