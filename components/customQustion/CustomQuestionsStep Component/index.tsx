"use client";
import React, { useState, useEffect } from "react";
import {
  Stack,
  Button,
  Text,
  Select,
  TextInput,
  Textarea,
  Box,
  Group,
  ActionIcon,
  Paper,
  Alert,
  Badge,
  Checkbox,
} from "@mantine/core";
import { FaTrash, FaGripLines, FaPlus, FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import { Question, QuestionType } from "../../../store/types";
import styles from "./styles.module.css";
import { v4 as uuidv4 } from "uuid";
import RegistrationFormPreview from "../RegistrationPreviewComponent";

interface CustomQuestionsStepProps {
  questions: Question[];
  setQuestions: (questions: Question[]) => void;
}

export const CustomQuestionsStep: React.FC<CustomQuestionsStepProps> = ({
  questions,
  setQuestions,
}) => {
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [validationMessages, setValidationMessages] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  // Check for completion status whenever questions change
  useEffect(() => {
    // If previously marked complete, validate to see if it's still complete
    if (isComplete) {
      const isValid = validateForm(false); // Don't validate active question
      if (!isValid) {
        setIsComplete(false);
      }
    }
  }, [questions]);

  // Handle adding a new question
  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: uuidv4(),
      type: "text",
      title: "",
      required: false,
      options: [],
      placeholder: "",
    };

    setQuestions([...questions, newQuestion]);
    setActiveQuestion(newQuestion);
    setIsComplete(false);
  };

  // Handle removing a question
  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
    if (activeQuestion?.id === id) {
      setActiveQuestion(null);
    }
  };

  // Handle updating question details
  const handleUpdateQuestion = (
    id: string,
    field: keyof Question,
    value: any
  ) => {
    const updatedQuestions = questions.map((q) =>
      q.id === id ? { ...q, [field]: value } : q
    );
    setQuestions(updatedQuestions);

    if (activeQuestion?.id === id) {
      setActiveQuestion({ ...activeQuestion, [field]: value });
    }
  };

  // Handle adding an option to multiple choice questions
  const handleAddOption = (questionId: string) => {
    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId) {
        return {
          ...q,
          options: [...(q.options || []), { id: uuidv4(), text: "" }],
        };
      }
      return q;
    });

    setQuestions(updatedQuestions);

    if (activeQuestion?.id === questionId) {
      setActiveQuestion({
        ...activeQuestion,
        options: [
          ...(activeQuestion.options || []),
          { id: uuidv4(), text: "" },
        ],
      });
    }
  };

  // Handle updating an option
  const handleUpdateOption = (
    questionId: string,
    optionId: string,
    value: string
  ) => {
    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId && q.options) {
        return {
          ...q,
          options: q.options.map((opt: { id: string; text: string }) =>
            opt.id === optionId ? { ...opt, text: value } : opt
          ),
        };
      }
      return q;
    });

    setQuestions(updatedQuestions);

    if (activeQuestion?.id === questionId && activeQuestion.options) {
      setActiveQuestion({
        ...activeQuestion,
        options: activeQuestion.options.map(
          (opt: { id: string; text: string }) =>
            opt.id === optionId ? { ...opt, text: value } : opt
        ),
      });
    }
  };

  // Handle removing an option
  const handleRemoveOption = (questionId: string, optionId: string) => {
    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId && q.options) {
        return {
          ...q,
          options: q.options.filter(
            (opt: { id: string; text: string }) => opt.id !== optionId
          ),
        };
      }
      return q;
    });

    setQuestions(updatedQuestions);

    if (activeQuestion?.id === questionId && activeQuestion.options) {
      setActiveQuestion({
        ...activeQuestion,
        options: activeQuestion.options.filter(
          (opt: { id: string; text: string }) => opt.id !== optionId
        ),
      });
    }
  };

  // Reorder questions
  const handleReorderQuestion = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= questions.length) return;

    const reorderedQuestions = [...questions];
    const [movedItem] = reorderedQuestions.splice(fromIndex, 1);
    reorderedQuestions.splice(toIndex, 0, movedItem);

    setQuestions(reorderedQuestions);
  };

  // Validate the form and update completion status
  const validateForm = (checkActiveQuestion = true) => {
    // If we're ignoring the active question for validation (to allow navigation)
    const questionsToValidate = checkActiveQuestion 
      ? questions 
      : questions.filter(q => !activeQuestion || q.id !== activeQuestion.id);
    
    const messages: string[] = [];
    
    // Check if there are any questions
    if (questionsToValidate.length === 0 && questions.length === 0) {
      messages.push("Add at least one question to your registration form");
    }
    
    // Only validate completed questions, not the one currently being edited
    if (questionsToValidate.length > 0) {
      // Check if all questions have titles
      const untitledQuestions = questionsToValidate.filter(q => !q.title.trim());
      if (untitledQuestions.length > 0) {
        messages.push(`${untitledQuestions.length} question(s) are missing titles`);
      }
      
      // Check if multiple choice questions have options
      const missingOptions = questionsToValidate.filter(q => 
        (q.type === 'select' || q.type === 'radio' || q.type === 'checkbox') && 
        (!q.options || q.options.length < 2)
      );
      if (missingOptions.length > 0) {
        messages.push(`${missingOptions.length} multiple choice question(s) need at least 2 options`);
      }
      
      // Check for empty options in multiple choice questions
      const emptyOptions = questionsToValidate.filter(q => 
        q.options && q.options.some(opt => !opt.text.trim())
      );
      if (emptyOptions.length > 0) {
        messages.push(`${emptyOptions.length} question(s) have empty options`);
      }
    }
    
    setValidationMessages(messages);
    return messages.length === 0;
  };
  
  // Mark the form as complete to proceed
  const handleMarkComplete = () => {
    // First, check if there are any completed questions (besides the active one)
    const completedQuestions = questions.filter(q => !activeQuestion || q.id !== activeQuestion.id);
    
    // If we have at least one completed question, validate those
    if (completedQuestions.length > 0) {
      const isValid = validateForm(false); // Only validate completed questions
      if (isValid) {
        // If active question is incomplete, confirm with user
        if (activeQuestion && !isQuestionComplete(activeQuestion)) {
          if (window.confirm('You have an incomplete question. Would you like to discard it and proceed?')) {
            // Remove the incomplete question
            setQuestions(completedQuestions);
            setActiveQuestion(null);
            setIsComplete(true);
          }
        } else {
          setIsComplete(true);
        }
      }
    } else if (questions.length > 0) {
      // If we only have the active question
      if (isQuestionComplete(questions[0])) {
        setIsComplete(true);
      } else {
        setValidationMessages(["Complete your current question or discard it to proceed"]);
      }
    } else {
      setValidationMessages(["Add at least one question to your registration form"]);
    }
  };

  // Check if a single question is complete
  const isQuestionComplete = (question: Question): boolean => {
    if (!question.title.trim()) return false;
    
    if ((question.type === 'select' || question.type === 'radio' || question.type === 'checkbox')) {
      if (!question.options || question.options.length < 2) return false;
      if (question.options.some(opt => !opt.text.trim())) return false;
    }
    
    return true;
  };
  
  // Specifically for handling navigation - discard active incomplete question if needed
  const handleCancelActiveQuestion = () => {
    if (activeQuestion) {
      // Check if the question is already saved (exists in questions array)
      const isExistingQuestion = questions.some(q => q.id === activeQuestion.id);
      
      if (isExistingQuestion) {
        // If it's incomplete, ask if user wants to remove it
        if (!isQuestionComplete(activeQuestion)) {
          if (window.confirm('This question is incomplete. Would you like to remove it?')) {
            setQuestions(questions.filter(q => q.id !== activeQuestion.id));
          }
        }
      } else {
        // If it's a new question that hasn't been added yet, just clear it
        // (This shouldn't happen in current implementation, but added for safety)
        setActiveQuestion(null);
      }
    }
    
    setActiveQuestion(null);
    validateForm(false);
  };

  // Toggle preview
  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <Stack className={styles.customQuestionsContainer}>
      {/* Form completion status */}
      <Group className={styles.statusBar} position="apart">
        <Text size="lg" className={styles.formQuestionsText}>
          Registration Form Questions
        </Text>
        <Group spacing={10}>
          <Button 
            leftIcon={showPreview ? <FaEyeSlash /> : <FaEye />}
            variant="subtle"
            onClick={togglePreview}
            className={styles.previewToggle}
          >
            {showPreview ? "Hide Preview" : "Show Preview"}
          </Button>
          
          {isComplete ? (
            <Badge 
              color="green" 
              size="lg"
            >
              <Group spacing={5}>
                <FaCheckCircle size={14} />
                <span>Ready to Proceed</span>
              </Group>
            </Badge>
          ) : (
            <Group spacing={8}>
              {activeQuestion && (
                <Button 
                  variant="subtle" 
                  color="gray" 
                  onClick={handleCancelActiveQuestion}
                >
                  Cancel Editing
                </Button>
              )}
              <Button 
                color="green" 
                onClick={handleMarkComplete}
                disabled={questions.length === 0}
              >
                Mark as Complete
              </Button>
            </Group>
          )}
        </Group>
      </Group>
      
      {/* Validation alerts */}
      {validationMessages.length > 0 && !isComplete && (
        <Alert 
          icon={<FaExclamationCircle />} 
          title="Please fix the following issues:" 
          color="red"
          withCloseButton
          onClose={() => setValidationMessages([])}
          className={styles.validationAlert}
        >
          <ul className={styles.validationList}>
            {validationMessages.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        </Alert>
      )}
      
      {/* Info message */}
      {questions.length === 0 && (
        <Alert 
          icon={<FaInfoCircle />} 
          title="Create your registration form" 
          color="blue"
          className={styles.infoAlert}
        >
          Add questions that attendees will answer when they register for your event.
          You can create various question types like text fields, multiple choice, checkboxes, and more.
        </Alert>
      )}

      {/* Form Preview (conditionally rendered) */}
      {showPreview && (
        <RegistrationFormPreview questions={questions.filter(q => 
          // Only show questions that are complete in the preview
          isQuestionComplete(q)
        )} />
      )}

      <Group align="flex-start" spacing="lg" className={styles.editorGroup}>
        <Box className={styles.questionsSidebar}>
          <Text
            size="lg"
            mb="md"
            className={styles.formQuestionsText}
          >
            Form Questions
          </Text>

          {questions.length === 0 ? (
            <Text
              color="dimmed"
              size="sm"
              mb="lg"
              className={styles.noQuestionsText}
            >
              No questions added yet. Click the button below to add your first
              question.
            </Text>
          ) : (
            <Stack className={styles.questionStack} mb="lg">
              {questions.map((question, index) => (
                <Paper
                  key={question.id}
                  p="xs"
                  className={`${styles.questionCard} ${
                    activeQuestion?.id === question.id
                      ? styles.activeQuestionCard
                      : ""
                  } ${isQuestionComplete(question) ? "" : styles.incompleteQuestionCard}`}
                  onClick={() => setActiveQuestion(question)}
                >
                  <Group position="apart">
                    <Group>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        className={styles.dragHandle}
                        title="Drag to reorder"
                      >
                        <FaGripLines />
                      </ActionIcon>
                      <Text lineClamp={1} size="sm">
                        {question.title || `Question ${index + 1}`}
                      </Text>
                    </Group>
                    <Group spacing={8}>
                      {question.required && (
                        <Badge size="xs" color="red" variant="filled">Required</Badge>
                      )}
                      {!isQuestionComplete(question) && (
                        <Badge size="xs" color="orange" variant="filled">Incomplete</Badge>
                      )}
                      <ActionIcon
                        size="sm"
                        color="red"
                        variant="subtle"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveQuestion(question.id);
                        }}
                        title="Remove question"
                      >
                        <FaTrash />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Paper>
              ))}
            </Stack>
          )}

          <Button
            leftIcon={<FaPlus />}
            onClick={handleAddQuestion}
            fullWidth
            variant="outline"
            color="teal"
            className={styles.addQuestionButton}
          >
            Add Question
          </Button>
        </Box>

        <Box className={styles.questionEditor}>
          {activeQuestion ? (
            <Stack spacing="md">
              <TextInput
                label="Question Title"
                value={activeQuestion.title}
                onChange={(e) =>
                  handleUpdateQuestion(activeQuestion.id, "title", e.target.value)
                }
                placeholder="Enter your question here"
                required
                description="This is what attendees will see as the question"
              />

              <Select
                label="Question Type"
                value={activeQuestion.type}
                onChange={(value) =>
                  handleUpdateQuestion(
                    activeQuestion.id,
                    "type",
                    value as QuestionType
                  )
                }
                data={[
                  { value: "text", label: "Short Answer" },
                  { value: "textarea", label: "Paragraph" },
                  { value: "select", label: "Dropdown" },
                  { value: "radio", label: "Multiple Choice" },
                  { value: "checkbox", label: "Checkboxes" },
                  { value: "date", label: "Date" },
                  { value: "email", label: "Email" },
                  { value: "number", label: "Number" },
                ]}
                description="Select the type of answer you want to collect"
              />

              {(activeQuestion.type === "text" ||
                activeQuestion.type === "textarea" ||
                activeQuestion.type === "email" ||
                activeQuestion.type === "number") && (
                <TextInput
                  label="Placeholder Text"
                  value={activeQuestion.placeholder || ""}
                  onChange={(e) =>
                    handleUpdateQuestion(
                      activeQuestion.id,
                      "placeholder",
                      e.target.value
                    )
                  }
                  placeholder="Enter placeholder text"
                  description="This text will show in the empty field as a hint"
                />
              )}

              {(activeQuestion.type === "select" ||
                activeQuestion.type === "radio" ||
                activeQuestion.type === "checkbox") && (
                <>
                  <Text size="sm" className={styles.optionsText}>
                    Options
                  </Text>
                  <Stack className={styles.optionsStack} spacing={8}>
                    {activeQuestion.options &&
                      activeQuestion.options.map((option) => (
                        <Group
                          key={option.id}
                          position="apart"
                          className={styles.optionGroup}
                        >
                          <TextInput
                            value={option.text}
                            onChange={(e) =>
                              handleUpdateOption(
                                activeQuestion.id,
                                option.id,
                                e.target.value
                              )
                            }
                            placeholder="Option text"
                            className={styles.flexGrow}
                          />
                          <ActionIcon
                            color="red"
                            variant="subtle"
                            onClick={() =>
                              handleRemoveOption(activeQuestion.id, option.id)
                            }
                            title="Remove option"
                          >
                            <FaTrash />
                          </ActionIcon>
                        </Group>
                      ))}
                    <Button
                      leftIcon={<FaPlus />}
                      variant="subtle"
                      onClick={() => handleAddOption(activeQuestion.id)}
                      compact
                    >
                      Add Option
                    </Button>
                  </Stack>
                </>
              )}

              <Checkbox
                label={activeQuestion.required ? "This question is required" : "Make this question required"}
                checked={activeQuestion.required}
                onChange={(e) => handleUpdateQuestion(
                  activeQuestion.id, 
                  'required', 
                  e.currentTarget.checked
                )}
                mt="md"
              />
              
              <Group mt="lg" position="apart">
                <Button 
                  variant="outline" 
                  color="gray" 
                  onClick={handleCancelActiveQuestion}
                >
                  Cancel
                </Button>
                <Button 
                  color="teal" 
                  onClick={() => {
                    if (isQuestionComplete(activeQuestion)) {
                      setActiveQuestion(null);
                    } else {
                      alert("Please complete this question first");
                    }
                  }}
                >
                  Done Editing
                </Button>
              </Group>
            </Stack>
          ) : (
            <Box className={styles.emptyEditor}>
              <Text
                color="dimmed"
                className={styles.emptyEditorText}
              >
                Select a question to edit or add a new question
              </Text>
            </Box>
          )}
        </Box>
      </Group>
      
      {/* Bottom notification about completion */}
      <Alert 
        color={isComplete ? "green" : "blue"} 
        variant="light"
        className={styles.bottomAlert}
      >
        {isComplete 
          ? "You've completed this section! Click 'Next' to proceed."
          : "Click 'Mark as Complete' when you're done creating questions to proceed to the next step."}
      </Alert>
    </Stack>
  );
};
