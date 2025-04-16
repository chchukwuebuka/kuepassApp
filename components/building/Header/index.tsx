import { Image } from "@mantine/core";
import styles from "./styles.module.css";

const Header = () => {
  return (
    <div>
      <div className={styles.header}>
        <Image
          src="/images/osiite.png"
          className={styles.banner}
          alt="Banner"
        />
        <div className={styles.info}>
          <h3  className={styles.infoTitle}>Crisp TV</h3>
          <p className={styles.infoTitle}>Location: Nza Street, Enugu, Nigeria</p>
          <button className={styles.shareBtn}>🔗 Share Link</button>
        </div>
      </div>
    </div>
  );
};

export default Header;
