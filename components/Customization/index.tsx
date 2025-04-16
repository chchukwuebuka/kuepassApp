// "use client";
// import React, { useState } from "react";
// import DetailsStep from "../DetailsStep";
// import AppearanceStep from "../AppearanceStep";
// import styles from "./styles.module.css";
// import { EventFormData } from "../../store/types";

// const defaultEventFormData: EventFormData = {
//   title: "",
//   description: "",
//   location: "Virtual",
//   address: "",
//   startDate: "",
//   startTime: "",
//   endDate: "",
//   endTime: "",
//   tickets: [],
//   appearance: "",
// };

// const ModalWithDetailsStep: React.FC = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [formData, setFormData] = useState<EventFormData>(defaultEventFormData);

//   const toggleModal = () => {
//     setIsModalOpen((prev) => !prev);
//   };

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const { id, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [id]: value,
//     }));
//   };

//   const handleLocationChange = (value: "Virtual" | "Physical") => {
//     setFormData((prev) => ({
//       ...prev,
//       location: value,
//       address: value === "Virtual" ? "" : prev.address,
//     }));
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     console.log("Saved Event Data:", formData);
//     toggleModal();
//   };

//   return (
//     <div>
//       <div className={styles.AppFlex}>
//         <button className={styles.AppFlexBTN} onClick={toggleModal}>
//           Edit Event Details
//         </button>
//       </div>

//       {/* Modal for editing event details */}
//       {isModalOpen && (
//         <div className={styles.modalOverlay}>
//           <div className={styles.modalContent}>
//             <button className={styles.closeButton} onClick={toggleModal}>
//               ×
//             </button>
//             <form onSubmit={handleSubmit}>
//               <DetailsStep
//                 formData={formData}
//                 handleChange={handleChange}
//                 handleLocationChange={handleLocationChange}
//               />
//               <div className={styles.saveBTN}>
//                 <button className={styles.saveButton} type="submit">
//                   Save Changes
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* AppearanceStep Preview */}
//       <div className={styles.Appearance}>
//         <AppearanceStep formData={formData} updateFormData={setFormData} />
//       </div>
//       <div  className={styles.TextBTN}>
//         <div className={styles.changeFlex}>
//           <p className={styles.changeText}>You have unsaved changes.</p>
//           <button className={styles.changeBTN}>Discard Changes</button>
//           <button className={styles.changeBTN}>Save Changes</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ModalWithDetailsStep;

