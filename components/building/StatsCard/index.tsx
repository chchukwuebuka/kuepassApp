import styles from './styles.module.css';

const StatsCard = () => {
  return (
    <div className={styles.card}>
      <h4 className={styles.cardTitle}>Total Members</h4>
      <h1 className={styles.cardAmount}>5,000</h1>
      <div className={styles.viewButton}>
      <button className={styles.viewBtn}>View Members</button>
      </div>
    </div>
  );
};

export default StatsCard;
