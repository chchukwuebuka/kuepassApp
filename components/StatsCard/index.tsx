import styles from "./styles.module.css";

interface StatsCardProps {
  title: string;
  value: string | number;
  btnValue?: string;
  onClick?: () => void; 
}

const StatsCard = ({ title, value,  btnValue, onClick }: StatsCardProps) => {
  return (
    <div className={styles.card}>
      <h3>{title}</h3>
      <p>{value}</p>
      {btnValue && (
        <button className={styles.button} onClick={onClick}>
          {btnValue}
        </button>
      )}
    </div>
  );
};

export default StatsCard;
