"use client";
import React from "react";
import { Question } from "../../../store/types";
import { Stack, Text, TextInput, Textarea, Select, Checkbox, Radio, Group, Box, Paper } from "@mantine/core";
import styles from "./styles.module.css";

interface RegistrationFormPreviewProps {
  questions: Question[];
}

const RegistrationFormPreview: React.FC<RegistrationFormPreviewProps> = ({ questions }) => {
  if (questions.length === 0) {
    return (
      <Paper p="xl" className={styles.emptyPreview}>
        <Text align="center" color="dimmed">
          No questions added yet. Your registration form will appear here.
        </Text>
      </Paper>
    );
  }

  return (
    <Paper shadow="sm" p="xl" className={styles.previewContainer}>
      <Stack spacing="xl">
        <Text className={styles.previewTitle}>Registration Form Preview</Text>
        <Text color="dimmed" size="sm" className={styles.previewSubtitle}>
          This is how your form will appear to attendees
        </Text>
        
        <Stack spacing="lg" className={styles.questionsPreview}>
          {questions.map((question) => (
            <Box key={question.id} className={styles.previewQuestion}>
              <Text className={styles.previewLabel}>
                {question.title}
                {question.required && <span className={styles.requiredStar}>*</span>}
              </Text>
              
              {renderQuestionInput(question)}
            </Box>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
};

const renderQuestionInput = (question: Question) => {
  switch (question.type) {
    case "text":
      return (
        <TextInput
          placeholder={question.placeholder || "Short answer text"}
          required={question.required}
          className={styles.previewInput}
          disabled
        />
      );
      
    case "textarea":
      return (
        <Textarea
          placeholder={question.placeholder || "Long answer text"}
          required={question.required}
          className={styles.previewTextarea}
          disabled
        />
      );
      
    case "select":
      return (
        <Select
          placeholder="Select an option"
          data={question.options?.map(opt => ({ value: opt.id, label: opt.text })) || []}
          required={question.required}
          className={styles.previewInput}
          disabled
        />
      );
      
    case "radio":
      return (
        <Radio.Group required={question.required} name={`question_${question.id}`}>
          <Stack spacing="xs" mt="xs">
            {question.options?.map(option => (
              <Radio 
                key={option.id}
                value={option.id}
                label={option.text}
                disabled
              />
            ))}
          </Stack>
        </Radio.Group>
      );
      
    case "checkbox":
      return (
        <Stack spacing="xs" mt="xs">
          {question.options?.map(option => (
            <Checkbox 
              key={option.id}
              label={option.text}
              disabled
            />
          ))}
        </Stack>
      );
      
    case "date":
      return (
        <TextInput
          type="date"
          required={question.required}
          className={styles.previewInput}
          disabled
        />
      );
      
    case "email":
      return (
        <TextInput
          type="email"
          placeholder={question.placeholder || "email@example.com"}
          required={question.required}
          className={styles.previewInput}
          disabled
        />
      );
      
    case "number":
      return (
        <TextInput
          type="number"
          placeholder={question.placeholder || "0"}
          required={question.required}
          className={styles.previewInput}
          disabled
        />
      );
      
    default:
      return null;
  }
};

export default RegistrationFormPreview;