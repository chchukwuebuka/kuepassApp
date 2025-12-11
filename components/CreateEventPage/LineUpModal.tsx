"use client";

import React, { useState, useEffect, useRef } from "react";
import { IconX, IconUpload, IconChartLine } from "@tabler/icons-react";
import styles from "./LineUpModal.module.css";

export interface LineUpItem {
  id: string;
  name: string;
  description: string;
  role: string;
  image?: string;
  imageFile?: File;
}

interface LineUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: LineUpItem) => void;
  editingItem?: LineUpItem | null;
}

const LineUpModal: React.FC<LineUpModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [role, setRole] = useState<string>("");
  const [availableRoles, setAvailableRoles] = useState<string[]>([
    "Keynote speaker",
    "Panelist",
    "Artist",
  ]);
  const [roleInput, setRoleInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setDescription(editingItem.description);
      setRole(editingItem.role);
      setImagePreview(editingItem.image || null);
      setImageFile(editingItem.imageFile || null);
    } else {
      // Reset form for new item
      setName("");
      setDescription("");
      setRole(availableRoles[0] || "");
      setImagePreview(null);
      setImageFile(null);
    }
  }, [editingItem, isOpen, availableRoles]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (2MB = 2 * 1024 * 1024 bytes)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be less than 2MB");
      return;
    }

    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png)/i)) {
      alert("Only JPEG and PNG images are supported");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddRole = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && roleInput.trim()) {
      e.preventDefault();
      const newRole = roleInput.trim();
      if (!availableRoles.includes(newRole)) {
        setAvailableRoles([...availableRoles, newRole]);
        setRole(newRole); // Auto-select the newly added role
      }
      setRoleInput("");
    }
  };

  const handleRemoveRole = (roleToRemove: string) => {
    if (availableRoles.length <= 1) {
      alert("You must have at least one role available.");
      return;
    }
    const updatedRoles = availableRoles.filter((r) => r !== roleToRemove);
    setAvailableRoles(updatedRoles);
    // If the removed role was selected, select the first available role
    if (role === roleToRemove) {
      setRole(updatedRoles[0] || "");
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert("Name is required.");
      return;
    }
    if (!description.trim()) {
      alert("Description is required.");
      return;
    }
    if (!role.trim()) {
      alert("Please select or add a role.");
      return;
    }

    const item: LineUpItem = {
      id: editingItem?.id || `lineup-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      role: role.trim(),
      image: imagePreview || undefined,
      imageFile: imageFile || undefined,
    };

    onSave(item);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.closeButton} onClick={onClose}>
          <IconX size={20} />
        </button>

        <div className={styles.modalBody}>
          <div className={styles.modalLayout}>
            {/* Left Side - Image Upload */}
            <div className={styles.imageSection}>
              <div className={styles.imageUploadArea}>
                {imagePreview ? (
                  <div className={styles.imagePreview}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className={styles.previewImage}
                    />
                    <button
                      type="button"
                      className={styles.changeImageButton}
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                    >
                      Change Image
                    </button>
                  </div>
                ) : (
                  <label className={styles.uploadLabel}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleImageUpload}
                      style={{ display: "none" }}
                    />
                    <IconUpload size={32} className={styles.uploadIcon} />
                  </label>
                )}
              </div>
              <p className={styles.imageHint}>
                Upload an image with a size less than 2mb
              </p>
            </div>

            {/* Right Side - Form Fields */}
            <div className={styles.formSection}>
              {/* Name Field */}
              <div className={styles.formField}>
                <label className={styles.fieldLabel}>Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.textInput}
                  placeholder="Enter name"
                />
              </div>

              {/* Description Field */}
              <div className={styles.formField}>
                <label className={styles.fieldLabel}>
                  Description<span className={styles.required}>*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={styles.textarea}
                  placeholder="Enter description"
                  rows={2}
                  required
                />
              </div>

              {/* Role Selection */}
              <div className={styles.formField}>
                <label className={styles.roleLabel}>Role</label>
                <div className={styles.roleContainer}>
                  <div className={styles.roleButtons}>
                    {availableRoles.map((availableRole) => (
                      <div key={availableRole} className={styles.roleTag}>
                        <button
                          type="button"
                          className={`${styles.roleButton} ${
                            role === availableRole
                              ? styles.roleButtonActive
                              : ""
                          }`}
                          onClick={() => setRole(availableRole)}
                        >
                          <IconChartLine size={16} />
                          {availableRole}
                        </button>
                        {availableRoles.length > 1 && (
                          <button
                            type="button"
                            className={styles.removeRoleButton}
                            onClick={() => handleRemoveRole(availableRole)}
                            title={`Remove ${availableRole}`}
                          >
                            <IconX size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className={styles.addRoleInput}>
                    <input
                      type="text"
                      value={roleInput}
                      onChange={(e) => setRoleInput(e.target.value)}
                      onKeyDown={handleAddRole}
                      className={styles.roleTextInput}
                      placeholder="Add new role (press Enter)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.saveButton}
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineUpModal;
