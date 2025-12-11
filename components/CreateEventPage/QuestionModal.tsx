"use client";

import React, { useState, useEffect } from "react";
import { IconX, IconPlus } from "@tabler/icons-react";
import { Question, QuestionType } from "@/store/types";
import { v4 as uuidv4 } from "uuid";
import styles from "./QuestionModal.module.css";

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: Question) => void;
  question?: Question | null;
}

const QuestionModal: React.FC<QuestionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  question,
}) => {
  const [questionTitle, setQuestionTitle] = useState("");
  const [questionType, setQuestionType] = useState<QuestionType>("text");
  const [isRequired, setIsRequired] = useState(false);
  const [options, setOptions] = useState<string[]>(["", "", ""]);

  useEffect(() => {
    if (question) {
      setQuestionTitle(question.title);
      setQuestionType(question.type);
      setIsRequired(question.required);
      if (question.options && question.options.length > 0) {
        setOptions(
          question.options.map((opt) => opt.text).concat(["", "", ""])
        );
      } else {
        setOptions(["", "", ""]);
      }
    } else {
      // Reset form for new question
      setQuestionTitle("");
      setQuestionType("text");
      setIsRequired(false);
      setOptions(["", "", ""]);
    }
  }, [question, isOpen]);

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 1) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleSave = () => {
    if (!questionTitle.trim()) {
      alert("Question title is required.");
      return;
    }

    // Validate options for multiple choice questions
    if (["select", "radio", "checkbox"].includes(questionType)) {
      const validOptions = options.filter((opt) => opt.trim() !== "");
      if (validOptions.length < 2) {
        alert("Multiple choice questions need at least 2 options.");
        return;
      }
    }

    const questionToSave: Question = {
      id: question?.id || uuidv4(),
      type: questionType,
      title: questionTitle,
      required: isRequired,
      options: ["select", "radio", "checkbox"].includes(questionType)
        ? options
            .filter((opt) => opt.trim() !== "")
            .map((opt) => ({ id: uuidv4(), text: opt }))
        : undefined,
      placeholder: ["text", "textarea", "email", "number"].includes(
        questionType
      )
        ? ""
        : undefined,
    };

    onSave(questionToSave);
    onClose();
  };

  if (!isOpen) return null;

  const showOptions = ["select", "radio", "checkbox"].includes(questionType);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {question ? "Edit Question" : "Add Question"}
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
          >
            <IconX size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Make this question required checkbox */}
          <div className={styles.checkboxContainer}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={isRequired}
                onChange={(e) => setIsRequired(e.target.checked)}
                className={styles.checkbox}
              />
              <span>Make this question required</span>
            </label>
          </div>

          {/* Question Title and Question Type Row */}
          <div className={styles.formRow}>
            <div className={styles.formField}>
              <label className={styles.fieldLabel}>
                Question Title<span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                value={questionTitle}
                onChange={(e) => setQuestionTitle(e.target.value)}
                className={styles.textInput}
                placeholder="This is what attendees will see as the question"
                required
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.fieldLabel}>
                Question Type<span className={styles.required}>*</span>
              </label>
              <select
                value={questionType}
                onChange={(e) =>
                  setQuestionType(e.target.value as QuestionType)
                }
                className={styles.selectInput}
              >
                <option value="text">Short Answer</option>
                <option value="textarea">Paragraph</option>
                <option value="select">Dropdown</option>
                <option value="radio">Multiple Choice</option>
                <option value="checkbox">Checkboxes</option>
                <option value="date">Date</option>
                <option value="email">Email</option>
                <option value="number">Number</option>
              </select>
            </div>
          </div>

          {/* Options Section */}
          {showOptions && (
            <div className={styles.optionsSection}>
              {options.map((option, index) => (
                <div key={index} className={styles.optionField}>
                  <label className={styles.fieldLabel}>
                    Option {index + 1}
                  </label>
                  <div className={styles.optionInputWrapper}>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                      className={styles.textInput}
                      placeholder={`Option ${index + 1}`}
                    />
                    {options.length > 1 && (
                      <button
                        type="button"
                        className={styles.removeOptionButton}
                        onClick={() => handleRemoveOption(index)}
                      >
                        <IconX size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                className={styles.addOptionButton}
                onClick={handleAddOption}
              >
                <IconPlus size={16} />
                Add Options
              </button>
            </div>
          )}

          {/* Save Button */}
          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.saveButton}
              onClick={handleSave}
            >
              <IconPlus size={18} />
              Save question
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionModal;
