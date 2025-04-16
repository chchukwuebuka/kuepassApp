import React from "react";
import styles from "./styles.module.css";
import BuildingCard from "@/components/building/buildingCard";
import { Stack } from "@mantine/core";
import Navbar from "@/components/navbar";
import Link from "next/link";
import CustomFooter from "@/components/Footer";

const buildings = [
  {
    id: 1,
    name: "City A",
    location: "Lagos, Nigeria",
    image: "/images/cripTV.png",
    description: "Modern Skyscraper",
  },
  {
    id: 2,
    name: "Vitech",
    location: "Enugu, Nigeria",
    image: "/images/vicsoft.png",
    description: "Innovative Workspace",
  },
  {
    id: 3,
    name: "City B",
    location: "Abuja, Nigeria",
    image: "/images/ripTV.png",
    description: "Luxury Towers",
  },
  {
    id: 4,
    name: "Green V",
    location: "Lagos, Nigeria",
    image: "/images/vicsoftTV.png",
    description: "Eco-friendly Complex",
  },
];

const MyBuildings = () => {
  return (
    <div className={styles.container}>
      <Stack className={styles.navStark}>
        <Navbar />
      </Stack>
      <Link href="/" className={styles.goBack}>
        ← Go Back
      </Link>
      <div className={styles.titlePage}>
        <h2 className={styles.title}>My Buildings</h2>
        <p className={styles.subtitle}>
          View buildings that have been registered with this profile
        </p>
      </div>

      <div className={styles.grid}>
        {buildings.map((building) => (
          <Link key={building.id} href={`/building/building-dashboard?id=${building.id}`} passHref>
            <div className={styles.cardWrapper}>
              <BuildingCard {...building} />
            </div>
          </Link>
        ))}
      </div>

      <Link href="/building/create-building">
        <button className={styles.createButton}>Create New Building</button>
      </Link>
      <CustomFooter/>
    </div>
  );
};

export default MyBuildings;
