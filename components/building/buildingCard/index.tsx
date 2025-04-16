import React from "react";
import styles from "./styles.module.css";
import { Image } from "@mantine/core";
import { Link } from "lucide-react";

interface BuildingProps {
  name: string;
  location: string;
  image: string;
  description: string;
}

const BuildingCard: React.FC<BuildingProps> = ({ name, location, image, description }) => {
  return (
    <div className={styles.card}>
      <Image src={image} alt={name} className={styles.image} />
      <div className={styles.overlay}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.location}>Location: {location}</p>
        <p className={styles.description}>{description}</p>
      </div>
    </div>
  );
};

export default BuildingCard;
