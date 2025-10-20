// // components/DetailsStep/index.tsx

// import React from "react";
// import { EventFormData } from "../../store/types";
// import styles from "./styles.module.css";
// // --- NEW: Import Mantine's Menu component and more icons ---
// import { Menu, Button } from "@mantine/core";
// import { VscSparkle, VscWand, VscEdit } from "react-icons/vsc";

// // --- UPDATED: Props interface for the new AI functionality ---
// interface DetailsStepProps {
//   formData: EventFormData;
//   handleChange: (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => void;
//   handleLocationChange: (value: "Virtual" | "Physical") => void;
//   onAiAction: (mode: 'generate' | 'refine' | 'complete') => void;
//   isGenerating: boolean;
// }

// const DetailsStep: React.FC<DetailsStepProps> = ({
//   formData,
//   handleChange,
//   handleLocationChange,
//   // --- NEW: Destructure new props ---
//   onAiAction,
//   isGenerating,
// }) => {
//   // --- NEW: Helper variable to disable menu items appropriately ---
//   const hasDescription = formData.description.trim() !== '';

//   return (
//     <div>
//       <div className={styles.formSection}>
//         <h3 className={styles.sectionTitle}>Event Details</h3>

//         {/* Title */}
//         <div className={styles.formGroup}>
//           <label htmlFor="title" className={styles.label}>
//             Title <span className={styles.required}>*</span>
//           </label>
//           <input
//             type="text"
//             id="title"
//             name="title"
//             placeholder="Enter a clear, descriptive title"
//             className={styles.input1}
//             value={formData.title}
//             onChange={handleChange}
//             required
//           />
//         </div>

//         {/* --- MAJOR UPDATE: Replaced single AI button with a Mantine Menu button --- */}
//         <div className={styles.formGroup}>
//           <div className={styles.labelContainer}>
//             <label htmlFor="description" className={styles.label}>
//               Description <span className={styles.required}>*</span>
//             </label>

//             <Menu shadow="md" width={200}>
//               <Menu.Target>
//                 <Button
//                   leftSection={<VscSparkle size={14} />}
//                   variant="filled"
//                   color="#025a3a"
//                   size="xs"
//                   loading={isGenerating}
//                   disabled={!formData.title}
//                   title={!formData.title ? "Please enter an event title first" : "AI writing assistant"}
//                 >
//                   AI Assist
//                 </Button>
//               </Menu.Target>

//               <Menu.Dropdown>
//                 <Menu.Label>AI Actions</Menu.Label>
//                 <Menu.Item
//                   leftSection={<VscWand size={14} />}
//                   onClick={() => onAiAction('generate')}
//                 >
//                   Generate from Title
//                 </Menu.Item>
//                 <Menu.Item
//                   leftSection={<VscEdit size={14} />}
//                   disabled={!hasDescription || isGenerating}
//                   onClick={() => onAiAction('refine')}
//                 >
//                   Refine Existing Text
//                 </Menu.Item>
//                 <Menu.Item
//                   leftSection={<VscSparkle size={14} />}
//                   disabled={!hasDescription || isGenerating}
//                   onClick={() => onAiAction('complete')}
//                 >
//                   Complete My Thought
//                 </Menu.Item>
//               </Menu.Dropdown>
//             </Menu>

//           </div>
//           <textarea
//             id="description"
//             name="description"
//             placeholder="Describe your event, or use AI Assist to generate or refine it"
//             className={styles.textarea}
//             value={formData.description}
//             onChange={handleChange}
//             required
//             rows={6}
//           ></textarea>
//         </div>
//       </div>

//       <div className={styles.formSection}>
//         <h3 className={styles.sectionTitle}>Location & Schedule</h3>

//         {/* Location */}
//         <div className={styles.formGroup}>
//           <label className={styles.label}>
//             Location Type <span className={styles.required}>*</span>
//           </label>
//           <div className={styles.radioGroup}>
//             <label>
//               <input
//                 type="radio"
//                 name="location"
//                 value="Virtual"
//                 checked={formData.location === "Virtual"}
//                 onChange={() => handleLocationChange("Virtual")}
//                 className={styles.radioInput}
//               />
//               Virtual
//             </label>
//             <label>
//               <input
//                 type="radio"
//                 name="location"
//                 value="Physical"
//                 checked={formData.location === "Physical"}
//                 onChange={() => handleLocationChange("Physical")}
//                 className={styles.radioInput}
//               />
//               Physical
//             </label>
//           </div>
//         </div>

//         {/* Address */}
//         {formData.location === "Physical" && (
//           <div className={styles.formGroup}>
//             <label htmlFor="address" className={styles.label}>
//               Address <span className={styles.required}>*</span>
//             </label>
//             <input
//               type="text"
//               id="address"
//               name="address"
//               placeholder="Enter the full venue address"
//               className={styles.textAdress}
//               value={formData.address || ""}
//               onChange={handleChange}
//               required={formData.location === "Physical"}
//             />
//           </div>
//         )}

//         {/* Start Date and Time */}
//         <div className={styles.formRow}>
//           <div className={styles.formGroup}>
//             <label htmlFor="startDate" className={styles.label}>
//               Start Date <span className={styles.required}>*</span>
//             </label>
//             <input
//               type="date"
//               id="startDate"
//               name="startDate"
//               className={styles.inputDate}
//               value={formData.startDate}
//               onChange={handleChange}
//               required
//             />
//           </div>
//           <div className={styles.formGroup}>
//             <label htmlFor="startTime" className={styles.label}>
//               Start Time <span className={styles.required}>*</span>
//             </label>
//             <input
//               type="time"
//               id="startTime"
//               name="startTime"
//               className={styles.inputDate}
//               value={formData.startTime}
//               onChange={handleChange}
//               required
//             />
//           </div>
//         </div>

//         {/* End Date and Time */}
//         <div className={styles.formRow}>
//           <div className={styles.formGroup}>
//             <label htmlFor="endDate" className={styles.label}>
//               End Date <span className={styles.required}>*</span>
//             </label>
//             <input
//               type="date"
//               id="endDate"
//               name="endDate"
//               className={styles.inputDate}
//               value={formData.endDate}
//               onChange={handleChange}
//               required
//             />
//           </div>
//           <div className={styles.formGroup}>
//             <label htmlFor="endTime" className={styles.label}>
//               End Time <span className={styles.required}>*</span>
//             </label>
//             <input
//               type="time"
//               id="endTime"
//               name="endTime"
//               className={styles.inputDate}
//               value={formData.endTime}
//               onChange={handleChange}
//               required
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DetailsStep;

import React from "react";
import { EventFormData } from "../../store/types";
import styles from "./styles.module.css";
// --- NEW: Import Mantine's Menu component and more icons ---
import { Menu, Button } from "@mantine/core";
import { VscSparkle, VscWand, VscEdit } from "react-icons/vsc";

// --- UPDATED: Props interface for the new AI functionality ---
interface DetailsStepProps {
  formData: EventFormData;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleLocationChange: (value: "Virtual" | "Physical") => void;
  onAiAction: (mode: "generate" | "refine" | "complete") => void;
  isGenerating: boolean;
}

const DetailsStep: React.FC<DetailsStepProps> = ({
  formData,
  handleChange,
  handleLocationChange,
  // --- NEW: Destructure new props ---
  onAiAction,
  isGenerating,
}) => {
  // --- NEW: Helper variable to disable menu items appropriately ---
  const hasDescription = formData.description.trim() !== "";

  // --- NEW: State to track if user is typing ---
  const [isTyping, setIsTyping] = React.useState(false);
  const [typingTimeout, setTypingTimeout] =
    React.useState<NodeJS.Timeout | null>(null);

  // --- NEW: Function to handle typing detection ---
  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    handleChange(e);

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set typing to true
    setIsTyping(true);

    // Set timeout to stop bouncing after user stops typing
    const newTimeout = setTimeout(() => {
      setIsTyping(false);
    }, 1500); // Stop bouncing 1.5 seconds after user stops typing

    setTypingTimeout(newTimeout);
  };

  return (
    <div>
      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>Event Details</h3>

        {/* Title */}
        <div className={styles.formGroup}>
          <label htmlFor="title" className={styles.label}>
            Title <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder="Enter a clear, descriptive title"
            className={styles.input1}
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        {/* --- MAJOR UPDATE: Replaced single AI button with a Mantine Menu button --- */}
        <div className={styles.formGroup}>
          <div className={styles.labelContainer}>
            <label htmlFor="description" className={styles.label}>
              Description <span className={styles.required}>*</span>
            </label>

            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Button
                  leftSection={<VscSparkle size={14} />}
                  variant="filled"
                  color="#025a3a"
                  size="xs"
                  loading={isGenerating}
                  disabled={!formData.title}
                  title={
                    !formData.title
                      ? "Please enter an event title first"
                      : "AI writing assistant"
                  }
                  className={
                    isTyping && formData.description.trim()
                      ? styles.bouncing
                      : ""
                  }
                >
                  AI Assist
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>AI Actions</Menu.Label>
                <Menu.Item
                  leftSection={<VscWand size={14} />}
                  onClick={() => onAiAction("generate")}
                >
                  Generate from Title
                </Menu.Item>
                <Menu.Item
                  leftSection={<VscEdit size={14} />}
                  disabled={!hasDescription || isGenerating}
                  onClick={() => onAiAction("refine")}
                >
                  Refine Existing Text
                </Menu.Item>
                <Menu.Item
                  leftSection={<VscSparkle size={14} />}
                  disabled={!hasDescription || isGenerating}
                  onClick={() => onAiAction("complete")}
                >
                  Complete My Thought
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
          <textarea
            id="description"
            name="description"
            placeholder="Describe your event, or use AI Assist to generate or refine it"
            className={styles.textarea}
            value={formData.description}
            onChange={handleDescriptionChange}
            required
            rows={6}
          ></textarea>
        </div>
      </div>

      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>Location & Schedule</h3>

        {/* Location */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Location Type <span className={styles.required}>*</span>
          </label>
          <div className={styles.radioGroup}>
            <label>
              <input
                type="radio"
                name="location"
                value="Virtual"
                checked={formData.location === "Virtual"}
                onChange={() => handleLocationChange("Virtual")}
                className={styles.radioInput}
              />
              Virtual
            </label>
            <label>
              <input
                type="radio"
                name="location"
                value="Physical"
                checked={formData.location === "Physical"}
                onChange={() => handleLocationChange("Physical")}
                className={styles.radioInput}
              />
              Physical
            </label>
          </div>
        </div>

        {/* Address */}
        {formData.location === "Physical" && (
          <div className={styles.formGroup}>
            <label htmlFor="address" className={styles.label}>
              Address <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="address"
              name="address"
              placeholder="Enter the full venue address"
              className={styles.textAdress}
              value={formData.address || ""}
              onChange={handleChange}
              required={formData.location === "Physical"}
            />
          </div>
        )}

        {/* Start Date and Time */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="startDate" className={styles.label}>
              Start Date <span className={styles.required}>*</span>
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              className={styles.inputDate}
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="startTime" className={styles.label}>
              Start Time <span className={styles.required}>*</span>
            </label>
            <input
              type="time"
              id="startTime"
              name="startTime"
              className={styles.inputDate}
              value={formData.startTime}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* End Date and Time */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="endDate" className={styles.label}>
              End Date <span className={styles.required}>*</span>
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              className={styles.inputDate}
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="endTime" className={styles.label}>
              End Time <span className={styles.required}>*</span>
            </label>
            <input
              type="time"
              id="endTime"
              name="endTime"
              className={styles.inputDate}
              value={formData.endTime}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsStep;
