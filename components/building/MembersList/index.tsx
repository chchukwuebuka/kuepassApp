import styles from "./styles.module.css";

const members = Array(10).fill({
  name: "Robbin Nelson",
  email: "robbinnelson@gmail.com",
  status: "Active",
});

const MemberList = () => {
  return (
    <div className={styles.listContainer}>
      <div className={styles.viewBTN}>
          <button className={styles.BTN}>View All</button>
      </div>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th className={styles.th}>Name</th>
            <th className={styles.th}>Status</th>
            <th className={styles.th}>Email Address</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member, index) => (
            <tr key={index} className={styles.trName}>
              <td>{member.name}</td>
              <td className={styles.active}>{member.status}</td>
              <td>{member.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MemberList;
