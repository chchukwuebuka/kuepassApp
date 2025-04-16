import React, { useState, useRef } from "react";
import styles from "./styles.module.css";
import { Image } from "@mantine/core";

const colors = [
  { name: "Red", color: "#FF0000" },
  { name: "Green", color: "#00FF00" },
  { name: "Blue", color: "#0000FF" },
  { name: "Yellow", color: "#FFFF00" },
  { name: "Purple", color: "#800080" },
  { name: "Orange", color: "#FFA500" },
  { name: "Teal", color: "#008080" },
  { name: "Pink", color: "#FFC0CB" },
  { name: "Cyan", color: "#00FFFF" },
  { name: "Magenta", color: "#FF00FF" },
];

function hexToRgba(hex: string, alpha: number): string {
  hex = hex.replace("#", "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface AppearanceProps {
  title: string;
  address: string;
}

function Appearance({ title, address }: AppearanceProps) {
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [titleBgColor, setTitleBgColor] = useState<string>("#ffffff");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const result = event.target?.result;
        if (typeof result === "string") {
          setBgImage(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorSelect = (color: string) => {
    setTitleBgColor(color);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.container}>
      <h2>Building Sub-page Preview</h2>
      <div className={styles.IMGcontainer}>
        <div
          className={styles.background}
          style={{
            backgroundImage: bgImage ? `url(${bgImage})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div
            className={styles.titleContainer}
            style={{
              backgroundColor: hexToRgba(titleBgColor, 0.5),
            }}
          >
            {/* Display the user input values */}
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.location}>Location: {address}</p>
            <button className={styles.share}>Share Link</button>
          </div>
        </div>
        <div className={styles.description}>
          <div className={styles.cripDiv}>
            <h3 className={styles.cripTitle}>Crisp Tv Invite</h3>
            <p className={styles.cripDescription}>
              Hello John, you have been invited to the Crisp Tv building located
              at No, 9 Nza street, Enugu Nigeria. Kindly find the details of
              your invite below.
            </p>
          </div>
          <Image
            src="/images/QRcode.png"
            alt="Profile"
            className={styles.image}
          />
        </div>
        <div className={styles.homeCont}>
          <button className={styles.home}>Go Home</button>
        </div>
      </div>
      
      {/* Button to trigger the file upload */}
      <div style={{ marginTop: "1rem" }} className={styles.BTN1}>
        <button onClick={handleButtonClick} className={styles.BTN}>
          Set Building Image
        </button>
        {/* Hidden file input */}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          ref={fileInputRef}
          style={{ display: "none" }}
        />
      </div>
      
      <div style={{ marginTop: "1rem" }}>
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          {colors.map((c) => (
            <div
              key={c.name}
              onClick={() => handleColorSelect(c.color)}
              title={c.name}
              style={{
                width: "30px",
                height: "30px",
                backgroundColor: c.color,
                cursor: "pointer",
                border:
                  titleBgColor === c.color ? "2px solid #000" : "1px solid #ccc",
                borderRadius: "50%",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Appearance;
