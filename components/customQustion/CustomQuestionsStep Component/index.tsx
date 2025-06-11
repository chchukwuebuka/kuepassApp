// "use client";
// import React, { useState, useEffect } from "react";
// import {
//   Stack,
//   Button,
//   Text,
//   Select,
//   TextInput,
//   Textarea,
//   Box,
//   Group,
//   ActionIcon,
//   Paper,
//   Alert,
//   Badge,
//   Checkbox,
// } from "@mantine/core";
// import {
//   FaTrash,
//   FaGripLines,
//   FaPlus,
//   FaCheckCircle,
//   FaExclamationCircle,
//   FaInfoCircle,
//   FaEye,
//   FaEyeSlash,
// } from "react-icons/fa";
// import { Question, QuestionType } from "../../../store/types";
// import styles from "./styles.module.css";
// import { v4 as uuidv4 } from "uuid";
// import RegistrationFormPreview from "../RegistrationPreviewComponent";

// interface CustomQuestionsStepProps {
//   questions: Question[];
//   setQuestions: (questions: Question[]) => void;
// }

// export const CustomQuestionsStep: React.FC<CustomQuestionsStepProps> = ({
//   questions,
//   setQuestions,
// }) => {
//   // --- REFACTORED STATE 1: Store only the ID of the active question ---
//   const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

//   const [isComplete, setIsComplete] = useState<boolean>(false);
//   const [validationMessages, setValidationMessages] = useState<string[]>([]);
//   const [showPreview, setShowPreview] = useState<boolean>(false);

//   // --- REFACTORED STATE 2: The active question object is now derived from the main array ---
//   // This ensures it's always up-to-date and acts as the single source of truth.
//   const activeQuestion =
//     questions.find((q) => q.id === activeQuestionId) || null;

//   // Check if a single question is complete
//   const isQuestionComplete = (question: Question): boolean => {
//     if (!question.title.trim()) return false;

//     if (["select", "radio", "checkbox"].includes(question.type)) {
//       if (!question.options || question.options.length < 2) return false;
//       if (question.options.some((opt) => !opt.text.trim())) return false;
//     }

//     return true;
//   };

//   // Check for completion status whenever questions change
//   useEffect(() => {
//     if (isComplete) {
//       const isValid = validateForm(false);
//       if (!isValid) {
//         setIsComplete(false);
//       }
//     }
//   }, [questions, activeQuestionId]); // Depend on activeQuestionId as well

//   // --- REFACTORED LOGIC: Improved handleAddQuestion ---
//   const handleAddQuestion = () => {
//     // First, check if there's a currently active question that is incomplete.
//     if (activeQuestion && !isQuestionComplete(activeQuestion)) {
//       alert(
//         "Please complete the current question or cancel editing before adding a new one."
//       );
//       setValidationMessages(["The currently selected question is incomplete."]);
//       return; // Stop the user from creating a new question while another is unfinished
//     }

//     // If everything is fine, proceed to add the new question.
//     setValidationMessages([]);
//     const newQuestion: Question = {
//       id: uuidv4(),
//       type: "text",
//       title: "",
//       required: false,
//       options: [],
//       placeholder: "",
//     };

//     setQuestions([...questions, newQuestion]);
//     setActiveQuestionId(newQuestion.id); // Set the new question as active
//     setIsComplete(false);
//   };

//   // Handle removing a question
//   const handleRemoveQuestion = (id: string) => {
//     setQuestions(questions.filter((q) => q.id !== id));
//     if (activeQuestionId === id) {
//       setActiveQuestionId(null);
//     }
//   };

//   // --- REFACTORED HANDLERS: These now only update the main 'questions' array ---
//   const handleUpdateQuestion = (
//     id: string,
//     field: keyof Question,
//     value: any
//   ) => {
//     const updatedQuestions = questions.map((q) =>
//       q.id === id ? { ...q, [field]: value } : q
//     );
//     setQuestions(updatedQuestions);
//   };

//   const handleAddOption = (questionId: string) => {
//     const updatedQuestions = questions.map((q) => {
//       if (q.id === questionId) {
//         return {
//           ...q,
//           options: [...(q.options || []), { id: uuidv4(), text: "" }],
//         };
//       }
//       return q;
//     });
//     setQuestions(updatedQuestions);
//   };

//   const handleUpdateOption = (
//     questionId: string,
//     optionId: string,
//     value: string
//   ) => {
//     const updatedQuestions = questions.map((q) => {
//       if (q.id === questionId && q.options) {
//         return {
//           ...q,
//           options: q.options.map((opt) =>
//             opt.id === optionId ? { ...opt, text: value } : opt
//           ),
//         };
//       }
//       return q;
//     });
//     setQuestions(updatedQuestions);
//   };

//   const handleRemoveOption = (questionId: string, optionId: string) => {
//     const updatedQuestions = questions.map((q) => {
//       if (q.id === questionId && q.options) {
//         return {
//           ...q,
//           options: q.options.filter((opt) => opt.id !== optionId),
//         };
//       }
//       return q;
//     });
//     setQuestions(updatedQuestions);
//   };

//   // (Your original functions below will now work more reliably)

//   const handleReorderQuestion = (fromIndex: number, toIndex: number) => {
//     if (toIndex < 0 || toIndex >= questions.length) return;
//     const reorderedQuestions = [...questions];
//     const [movedItem] = reorderedQuestions.splice(fromIndex, 1);
//     reorderedQuestions.splice(toIndex, 0, movedItem);
//     setQuestions(reorderedQuestions);
//   };

//   const validateForm = (checkActiveQuestion = true) => {
//     const questionsToValidate = checkActiveQuestion
//       ? questions
//       : questions.filter((q) => q.id !== activeQuestionId);

//     const messages: string[] = [];

//     if (questionsToValidate.length === 0 && questions.length === 0) {
//       messages.push("Add at least one question to your registration form");
//     }

//     if (questionsToValidate.length > 0) {
//       const untitledQuestions = questionsToValidate.filter(
//         (q) => !q.title.trim()
//       );
//       if (untitledQuestions.length > 0) {
//         messages.push(
//           `${untitledQuestions.length} question(s) are missing titles`
//         );
//       }

//       const missingOptions = questionsToValidate.filter(
//         (q) =>
//           (q.type === "select" ||
//             q.type === "radio" ||
//             q.type === "checkbox") &&
//           (!q.options || q.options.length < 2)
//       );
//       if (missingOptions.length > 0) {
//         messages.push(
//           `${missingOptions.length} multiple choice question(s) need at least 2 options`
//         );
//       }

//       const emptyOptions = questionsToValidate.filter(
//         (q) => q.options && q.options.some((opt) => !opt.text.trim())
//       );
//       if (emptyOptions.length > 0) {
//         messages.push(`${emptyOptions.length} question(s) have empty options`);
//       }
//     }

//     setValidationMessages(messages);
//     return messages.length === 0;
//   };

//   const handleMarkComplete = () => {
//     if (activeQuestion && !isQuestionComplete(activeQuestion)) {
//       if (
//         window.confirm(
//           "You have an incomplete question. Would you like to discard it and proceed?"
//         )
//       ) {
//         const completedQuestions = questions.filter(
//           (q) => q.id !== activeQuestionId
//         );
//         setQuestions(completedQuestions);
//         setActiveQuestionId(null);
//         setIsComplete(true);
//         setValidationMessages([]);
//       }
//       return;
//     }

//     // Validate all questions since none are actively being edited
//     setActiveQuestionId(null);
//     const isValid = validateForm(true); // check all questions
//     if (isValid) {
//       setIsComplete(true);
//     }
//   };

//   const handleCancelActiveQuestion = () => {
//     setActiveQuestionId(null);
//     validateForm(false);
//   };

//   const togglePreview = () => {
//     setShowPreview(!showPreview);
//   };

//   return (
//     <Stack className={styles.customQuestionsContainer}>
//       {validationMessages.length > 0 && !isComplete && (
//         <Alert
//           icon={<FaExclamationCircle />}
//           title="Please fix the following issues:"
//           color="red"
//           withCloseButton
//           onClose={() => setValidationMessages([])}
//           className={styles.validationAlert}
//         >
//           <ul className={styles.validationList}>
//             {validationMessages.map((message, index) => (
//               <li key={index}>{message}</li>
//             ))}
//           </ul>
//         </Alert>
//       )}

//       {questions.length === 0 && (
//         <Alert
//           icon={<FaInfoCircle />}
//           title="Create your registration form"
//           color="blue"
//           className={styles.infoAlert}
//         >
//           Add questions that attendees will answer when they register for your
//           event. You can create various question types like text fields,
//           multiple choice, checkboxes, and more.
//         </Alert>
//       )}

//       <Group align="flex-start" spacing="lg" className={styles.editorGroup}>
//         <Box className={styles.questionsSidebar}>
//           <Text size="lg" mb="md" className={styles.formQuestionsText}>
//             Form Questions
//           </Text>
//           {questions.length === 0 ? (
//             <Text
//               color="dimmed"
//               size="sm"
//               mb="lg"
//               className={styles.noQuestionsText}
//             >
//               No questions added yet. Click the button below to add your first
//               question.
//             </Text>
//           ) : (
//             <Stack className={styles.questionStack} mb="lg">
//               {questions.map((question, index) => (
//                 <Paper
//                   key={question.id}
//                   p="xs"
//                   className={`${styles.questionCard} ${
//                     activeQuestionId === question.id
//                       ? styles.activeQuestionCard
//                       : ""
//                   } ${
//                     isQuestionComplete(question)
//                       ? ""
//                       : styles.incompleteQuestionCard
//                   }`}
//                   onClick={() => {
//                     if (activeQuestion && !isQuestionComplete(activeQuestion)) {
//                       alert(
//                         "Please complete your current question before selecting another."
//                       );
//                       return;
//                     }
//                     setActiveQuestionId(question.id);
//                   }}
//                 >
//                   <Group position="apart">
//                     <Group>
//                       <ActionIcon
//                         size="sm"
//                         variant="subtle"
//                         className={styles.dragHandle}
//                         title="Drag to reorder"
//                       >
//                         <FaGripLines />
//                       </ActionIcon>
//                       <Text lineClamp={1} size="sm">
//                         {question.title || `Question ${index + 1}`}
//                       </Text>
//                     </Group>
//                     <Group spacing={8}>
//                       {question.required && (
//                         <Badge size="xs" color="red" variant="filled">
//                           Required
//                         </Badge>
//                       )}
//                       {!isQuestionComplete(question) && (
//                         <Badge size="xs" color="orange" variant="filled">
//                           Incomplete
//                         </Badge>
//                       )}
//                       <ActionIcon
//                         size="sm"
//                         color="red"
//                         variant="subtle"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleRemoveQuestion(question.id);
//                         }}
//                         title="Remove question"
//                       >
//                         <FaTrash />
//                       </ActionIcon>
//                     </Group>
//                   </Group>
//                 </Paper>
//               ))}
//             </Stack>
//           )}

//           <Button
//             leftIcon={<FaPlus />}
//             onClick={handleAddQuestion}
//             fullWidth
//             variant="outline"
//             color="teal"
//             className={styles.addQuestionButton}
//           >
//             Add Question
//           </Button>
//         </Box>

//         <Box className={styles.questionEditor}>
//           {activeQuestion ? (
//             <Stack spacing="md">
//               <TextInput
//                 label="Question Title"
//                 value={activeQuestion.title}
//                 onChange={(e) =>
//                   handleUpdateQuestion(
//                     activeQuestion.id,
//                     "title",
//                     e.target.value
//                   )
//                 }
//                 placeholder="Enter your question here"
//                 required
//                 description="This is what attendees will see as the question"
//               />

//               <Select
//                 label="Question Type"
//                 value={activeQuestion.type}
//                 onChange={(value) =>
//                   handleUpdateQuestion(
//                     activeQuestion.id,
//                     "type",
//                     value as QuestionType
//                   )
//                 }
//                 data={[
//                   { value: "text", label: "Short Answer" },
//                   { value: "textarea", label: "Paragraph" },
//                   { value: "select", label: "Dropdown" },
//                   { value: "radio", label: "Multiple Choice" },
//                   { value: "checkbox", label: "Checkboxes" },
//                   { value: "date", label: "Date" },
//                   { value: "email", label: "Email" },
//                   { value: "number", label: "Number" },
//                 ]}
//                 description="Select the type of answer you want to collect"
//               />

//               {(activeQuestion.type === "text" ||
//                 activeQuestion.type === "textarea" ||
//                 activeQuestion.type === "email" ||
//                 activeQuestion.type === "number") && (
//                 <TextInput
//                   label="Placeholder Text"
//                   value={activeQuestion.placeholder || ""}
//                   onChange={(e) =>
//                     handleUpdateQuestion(
//                       activeQuestion.id,
//                       "placeholder",
//                       e.target.value
//                     )
//                   }
//                   placeholder="Enter placeholder text"
//                   description="This text will show in the empty field as a hint"
//                 />
//               )}

//               {(activeQuestion.type === "select" ||
//                 activeQuestion.type === "radio" ||
//                 activeQuestion.type === "checkbox") && (
//                 <>
//                   <Text size="sm" className={styles.optionsText}>
//                     Options
//                   </Text>
//                   <Stack className={styles.optionsStack} spacing={8}>
//                     {activeQuestion.options &&
//                       activeQuestion.options.map((option) => (
//                         <Group
//                           key={option.id}
//                           position="apart"
//                           className={styles.optionGroup}
//                         >
//                           <TextInput
//                             value={option.text}
//                             onChange={(e) =>
//                               handleUpdateOption(
//                                 activeQuestion.id,
//                                 option.id,
//                                 e.target.value
//                               )
//                             }
//                             placeholder="Option text"
//                             className={styles.flexGrow}
//                           />
//                           <ActionIcon
//                             color="red"
//                             variant="subtle"
//                             onClick={() =>
//                               handleRemoveOption(activeQuestion.id, option.id)
//                             }
//                             title="Remove option"
//                           >
//                             <FaTrash />
//                           </ActionIcon>
//                         </Group>
//                       ))}
//                     <Button
//                       leftIcon={<FaPlus />}
//                       variant="subtle"
//                       onClick={() => handleAddOption(activeQuestion.id)}
//                       compact
//                     >
//                       Add Option
//                     </Button>
//                   </Stack>
//                 </>
//               )}

//               <Checkbox
//                 label={
//                   activeQuestion.required
//                     ? "This question is required"
//                     : "Make this question required"
//                 }
//                 checked={activeQuestion.required}
//                 onChange={(e) =>
//                   handleUpdateQuestion(
//                     activeQuestion.id,
//                     "required",
//                     e.currentTarget.checked
//                   )
//                 }
//                 mt="md"
//               />

//               <Group mt="lg" position="apart">
//                 <Button
//                   variant="outline"
//                   color="gray"
//                   onClick={handleCancelActiveQuestion}
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   color="teal"
//                   onClick={() => {
//                     if (isQuestionComplete(activeQuestion)) {
//                       setActiveQuestionId(null);
//                     } else {
//                       alert("Please complete this question first");
//                     }
//                   }}
//                 >
//                   Done Editing
//                 </Button>
//               </Group>
//             </Stack>
//           ) : (
//             <Box className={styles.emptyEditor}>
//               <Text color="dimmed" className={styles.emptyEditorText}>
//                 Select a question to edit or add a new question
//               </Text>
//             </Box>
//           )}
//         </Box>
//       </Group>

//       {showPreview && (
//         <RegistrationFormPreview
//           questions={questions.filter((q) => isQuestionComplete(q))}
//         />
//       )}

//       <Group className={styles.statusBar} position="apart">
//         <Text size="lg" className={styles.formQuestionsText}>
//           Registration Form Questions
//         </Text>
//         <Group spacing={10}>
//           <Button
//             leftIcon={showPreview ? <FaEyeSlash /> : <FaEye />}
//             variant="subtle"
//             onClick={togglePreview}
//             className={styles.previewToggle}
//           >
//             {showPreview ? "Hide Preview" : "Show Preview"}
//           </Button>

//           {isComplete ? (
//             <Badge color="green" size="lg">
//               <Group spacing={5}>
//                 <FaCheckCircle size={14} />
//                 <span>Ready to Proceed</span>
//               </Group>
//             </Badge>
//           ) : (
//             <Group spacing={8}>
//               {activeQuestion && (
//                 <Button
//                   variant="subtle"
//                   color="gray"
//                   onClick={handleCancelActiveQuestion}
//                 >
//                   Cancel Editing
//                 </Button>
//               )}
//               <Button
//                 color="green"
//                 onClick={handleMarkComplete}
//                 disabled={questions.length === 0}
//               >
//                 Mark as Complete
//               </Button>
//             </Group>
//           )}
//         </Group>
//       </Group>

//       <Alert
//         color={isComplete ? "green" : "blue"}
//         variant="light"
//         className={styles.bottomAlert}
//       >
//         {isComplete
//           ? "You've completed this section! Click 'Next' to proceed."
//           : "Click 'Mark as Complete' when you're done creating questions to proceed to the next step."}
//       </Alert>
//     </Stack>
//   );
// };

// components/customQustion/CustomQuestionsStep Component.tsx
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
import {
  FaTrash,
  FaGripLines,
  FaPlus,
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { Question, QuestionType } from "../../../store/types";
import styles from "./styles.module.css";
import { v4 as uuidv4 } from "uuid";
import RegistrationFormPreview from "../RegistrationPreviewComponent";

// --- UPDATED: Props interface now includes a callback for completion status ---
interface CustomQuestionsStepProps {
  questions: Question[];
  setQuestions: (questions: Question[]) => void;
  onCompletionChange: (isComplete: boolean) => void;
}

export const CustomQuestionsStep: React.FC<CustomQuestionsStepProps> = ({
  questions,
  setQuestions,
  onCompletionChange, // --- NEW PROP
}) => {
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [validationMessages, setValidationMessages] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  const activeQuestion =
    questions.find((q) => q.id === activeQuestionId) || null;

  const isQuestionComplete = (question: Question): boolean => {
    if (!question.title.trim()) return false;
    if (["select", "radio", "checkbox"].includes(question.type)) {
      if (!question.options || question.options.length < 2) return false;
      if (question.options.some((opt) => !opt.text.trim())) return false;
    }
    return true;
  };

  // --- UPDATED: useEffect now notifies the parent when completion status changes ---
  useEffect(() => {
    if (isComplete) {
      const isValid = validateForm(false);
      if (!isValid) {
        setIsComplete(false);
        onCompletionChange(false); // Notify parent that step is no longer complete
      }
    }
  }, [questions, activeQuestionId]);

  const handleAddQuestion = () => {
    if (activeQuestion && !isQuestionComplete(activeQuestion)) {
      alert(
        "Please complete the current question or cancel editing before adding a new one."
      );
      setValidationMessages(["The currently selected question is incomplete."]);
      return;
    }

    setValidationMessages([]);
    const newQuestion: Question = {
      id: uuidv4(),
      type: "text",
      title: "",
      required: false,
      options: [],
      placeholder: "",
    };

    setQuestions([...questions, newQuestion]);
    setActiveQuestionId(newQuestion.id);
    setIsComplete(false);
    onCompletionChange(false); // Notify parent
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
    if (activeQuestionId === id) {
      setActiveQuestionId(null);
    }
  };

  const handleUpdateQuestion = (
    id: string,
    field: keyof Question,
    value: any
  ) => {
    const updatedQuestions = questions.map((q) =>
      q.id === id ? { ...q, [field]: value } : q
    );
    setQuestions(updatedQuestions);
  };

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
  };

  const handleUpdateOption = (
    questionId: string,
    optionId: string,
    value: string
  ) => {
    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId && q.options) {
        return {
          ...q,
          options: q.options.map((opt) =>
            opt.id === optionId ? { ...opt, text: value } : opt
          ),
        };
      }
      return q;
    });
    setQuestions(updatedQuestions);
  };

  const handleRemoveOption = (questionId: string, optionId: string) => {
    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId && q.options) {
        return {
          ...q,
          options: q.options.filter((opt) => opt.id !== optionId),
        };
      }
      return q;
    });
    setQuestions(updatedQuestions);
  };

  const handleReorderQuestion = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= questions.length) return;
    const reorderedQuestions = [...questions];
    const [movedItem] = reorderedQuestions.splice(fromIndex, 1);
    reorderedQuestions.splice(toIndex, 0, movedItem);
    setQuestions(reorderedQuestions);
  };

  const validateForm = (checkActiveQuestion = true) => {
    const questionsToValidate = checkActiveQuestion
      ? questions
      : questions.filter((q) => q.id !== activeQuestionId);

    const messages: string[] = [];

    if (questionsToValidate.length === 0 && questions.length === 0) {
      messages.push("Add at least one question to your registration form");
    }

    if (questionsToValidate.length > 0) {
      const untitledQuestions = questionsToValidate.filter(
        (q) => !q.title.trim()
      );
      if (untitledQuestions.length > 0) {
        messages.push(
          `${untitledQuestions.length} question(s) are missing titles`
        );
      }

      const missingOptions = questionsToValidate.filter(
        (q) =>
          (q.type === "select" ||
            q.type === "radio" ||
            q.type === "checkbox") &&
          (!q.options || q.options.length < 2)
      );
      if (missingOptions.length > 0) {
        messages.push(
          `${missingOptions.length} multiple choice question(s) need at least 2 options`
        );
      }

      const emptyOptions = questionsToValidate.filter(
        (q) => q.options && q.options.some((opt) => !opt.text.trim())
      );
      if (emptyOptions.length > 0) {
        messages.push(`${emptyOptions.length} question(s) have empty options`);
      }
    }

    setValidationMessages(messages);
    return messages.length === 0;
  };

  // --- UPDATED: handleMarkComplete now notifies the parent form ---
  const handleMarkComplete = () => {
    if (activeQuestion && !isQuestionComplete(activeQuestion)) {
      if (
        window.confirm(
          "You have an incomplete question. Would you like to discard it and proceed?"
        )
      ) {
        const completedQuestions = questions.filter(
          (q) => q.id !== activeQuestionId
        );
        setQuestions(completedQuestions);
        setActiveQuestionId(null);
        setIsComplete(true);
        onCompletionChange(true); // Notify parent
        setValidationMessages([]);
      }
      return;
    }

    setActiveQuestionId(null);
    const isValid = validateForm(true);
    if (isValid) {
      setIsComplete(true);
      onCompletionChange(true); // Notify parent
    } else {
        setIsComplete(false); // Ensure it's marked as incomplete if validation fails
        onCompletionChange(false);
    }
  };

  const handleCancelActiveQuestion = () => {
    setActiveQuestionId(null);
    validateForm(false);
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <Stack className={styles.customQuestionsContainer}>
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

      {questions.length === 0 && (
        <Alert
          icon={<FaInfoCircle />}
          title="Create your registration form"
          color="blue"
          className={styles.infoAlert}
        >
          Add questions that attendees will answer when they register for your
          event. You can create various question types like text fields,
          multiple choice, checkboxes, and more.
        </Alert>
      )}

      <Group align="flex-start" spacing="lg" className={styles.editorGroup}>
        <Box className={styles.questionsSidebar}>
          <Text size="lg" mb="md" className={styles.formQuestionsText}>
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
                    activeQuestionId === question.id
                      ? styles.activeQuestionCard
                      : ""
                  } ${
                    isQuestionComplete(question)
                      ? ""
                      : styles.incompleteQuestionCard
                  }`}
                  onClick={() => {
                    if (activeQuestion && !isQuestionComplete(activeQuestion)) {
                      alert(
                        "Please complete your current question before selecting another."
                      );
                      return;
                    }
                    setActiveQuestionId(question.id);
                  }}
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
                        <Badge size="xs" color="red" variant="filled">
                          Required
                        </Badge>
                      )}
                      {!isQuestionComplete(question) && (
                        <Badge size="xs" color="orange" variant="filled">
                          Incomplete
                        </Badge>
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
                  handleUpdateQuestion(
                    activeQuestion.id,
                    "title",
                    e.target.value
                  )
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
                label={
                  activeQuestion.required
                    ? "This question is required"
                    : "Make this question required"
                }
                checked={activeQuestion.required}
                onChange={(e) =>
                  handleUpdateQuestion(
                    activeQuestion.id,
                    "required",
                    e.currentTarget.checked
                  )
                }
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
                      setActiveQuestionId(null);
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
              <Text color="dimmed" className={styles.emptyEditorText}>
                Select a question to edit or add a new question
              </Text>
            </Box>
          )}
        </Box>
      </Group>

      {showPreview && (
        <RegistrationFormPreview
          questions={questions.filter((q) => isQuestionComplete(q))}
        />
      )}

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
            <Badge color="green" size="lg">
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