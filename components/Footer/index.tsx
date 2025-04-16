import React from "react";
import styles from "./styles.module.css";
import Image from "next/image";

const CustomFooter: React.FC = () => {
  return (
    <footer className={styles.stack}>
      <h2 className={styles.textxlbold}>Ready to get started?</h2>
      <div className={styles.curve}>
        <div className={`${styles.stackEvent} ${styles.spacingLg}`}>
          <div className={styles.footerFlex}>
            <div className={styles.buttonStack}>
              <button className={styles.buttonmd}>Create Events</button>
            </div>

            <div className={styles.imageContainer}>
              <Image
                src="/images/iStock.png"
                alt="Group of happy people"
                className={styles.circularImage}
                width={200}
                height={200}
              />
            </div>
          </div>

          <section className={styles.footerInfo}>
            <Image
              src="/images/Kuepass1.png"
              alt="Kuepass"
              className={styles.kuepass}
              width={170}
              height={50}
            />

            <p className={styles.Text}>
              &copy; 2023 Quickpass. All Rights Reserved.
            </p>

            <div className={styles.groupFlex}>
              <div className={styles.groupXs}>
                <a
                  href="https://facebook.com/yourpage"
                  className={styles.socialButton}
                  aria-label="Facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src="/images/faceb.svg"
                    alt="Facebook"
                    width={20}
                    height={20}
                  />
                </a>
                <a
                  href="https://linkedin.com/yourpage"
                  className={styles.socialButton}
                  aria-label="LinkedIn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src="/images/linkdin.svg"
                    alt="LinkedIn"
                    width={20}
                    height={20}
                  />
                </a>
                <a
                  href="https://twitter.com/yourpage"
                  className={styles.socialButton}
                  aria-label="Twitter"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src="/images/Twitter.svg"
                    alt="Twitter"
                    width={20}
                    height={20}
                  />
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </footer>
  );
};

export default CustomFooter;
