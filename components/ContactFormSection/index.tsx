// "use client";

// import React, { useState } from "react";
// import styled from "styled-components";
// import { Container } from "@mantine/core";

// const ContactFormSection: React.FC = () => {
//   const [formData, setFormData] = useState({
//     fullName: "",
//     email: "",
//     subject: "",
//     message: "",
//   });

//   const handleInputChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     // Handle form submission here
//     console.log("Form submitted:", formData);
//   };

//   return (
//     <SectionWrapper>
//       <Container size="lg" px="md">
//         <TwoColumnLayout>
//           {/* Left Column - Contact Information */}
//           <LeftColumn>
//             <MainHeading>
//               We are always ready to help you and answer your questions
//             </MainHeading>

//             <Description>
//               Need assistance with ticketing, hosting, or planning? Reach out
//               and our support team will respond quickly.
//             </Description>

//             <ContactDetails>
//               <ContactItem>
//                 <ContactLabel>Call Center</ContactLabel>
//                 <ContactValue>+23483294782293</ContactValue>
//               </ContactItem>

//               <ContactItem>
//                 <ContactLabel>Email</ContactLabel>
//                 <ContactValue>www.kuepass@gmail.com</ContactValue>
//               </ContactItem>

//               <SocialSection>
//                 <SocialLabel>Social Links</SocialLabel>
//                 <SocialIcons>
//                   <SocialIcon>
//                     <InstagramIcon />
//                   </SocialIcon>
//                   <SocialIcon>
//                     <LinkedInIcon />
//                   </SocialIcon>
//                   <SocialIcon>
//                     <TwitterIcon />
//                   </SocialIcon>
//                   <SocialIcon>
//                     <YouTubeIcon />
//                   </SocialIcon>
//                 </SocialIcons>
//               </SocialSection>
//             </ContactDetails>
//           </LeftColumn>

//           {/* Right Column - Contact Form */}
//           <RightColumn>
//             <FormHeading>Get In Touch</FormHeading>
//             <FormSubtitle>Let's Make Your Event Easier</FormSubtitle>

//             <ContactForm onSubmit={handleSubmit}>
//               <FormField>
//                 <FormInput
//                   type="text"
//                   name="fullName"
//                   placeholder="Full Name"
//                   value={formData.fullName}
//                   onChange={handleInputChange}
//                 />
//               </FormField>

//               <FormField>
//                 <FormInput
//                   type="email"
//                   name="email"
//                   placeholder="Email"
//                   value={formData.email}
//                   onChange={handleInputChange}
//                 />
//               </FormField>

//               <FormField>
//                 <FormInput
//                   type="text"
//                   name="subject"
//                   placeholder="Subject"
//                   value={formData.subject}
//                   onChange={handleInputChange}
//                 />
//               </FormField>

//               <FormField>
//                 <FormTextarea
//                   name="message"
//                   placeholder="Message"
//                   value={formData.message}
//                   onChange={handleInputChange}
//                   rows={4}
//                 />
//               </FormField>

//               <SubmitButton type="submit">Send a mesaage</SubmitButton>
//             </ContactForm>
//           </RightColumn>
//         </TwoColumnLayout>
//       </Container>
//     </SectionWrapper>
//   );
// };

// // Styled Components
// const SectionWrapper = styled.section`
//   background-color: white;
//   padding: 4rem 0;
//   font-family: "DM Sans", sans-serif;

//   @media (max-width: 768px) {
//     padding: 3rem 0;
//   }

//   @media (max-width: 480px) {
//     padding: 2rem 0;
//   }
// `;

// const TwoColumnLayout = styled.div`
//   display: grid;
//   grid-template-columns: 1fr 1fr;
//   gap: 4rem;
//   align-items: start;

//   @media (max-width: 768px) {
//     grid-template-columns: 1fr;
//     gap: 3rem;
//   }
// `;

// const LeftColumn = styled.div`
//   display: flex;
//   flex-direction: column;
//   gap: 2rem;
// `;

// const MainHeading = styled.h2`
//   font-size: 2rem;
//   font-weight: 500;
//   color: #000000;
//   margin: 0;
//   line-height: 1.2;

//   @media (max-width: 768px) {
//     font-size: 2rem;
//   }

//   @media (max-width: 480px) {
//     font-size: 1.75rem;
//   }
// `;

// const Description = styled.p`
//   font-size: 24px;
//   font-weight: 400;
//   color: #666666;
//   margin: 0;
//   line-height: 1.6;

//   @media (max-width: 768px) {
//     font-size: 1rem;
//   }

//   @media (max-width: 480px) {
//     font-size: 0.95rem;
//   }
// `;

// const ContactDetails = styled.div`
//   display: flex;
//   flex-direction: column;
//   gap: 1.5rem;
// `;

// const ContactItem = styled.div`
//   display: flex;
//   flex-direction: column;
//   gap: 0.5rem;
// `;

// const ContactLabel = styled.span`
//   font-size: 1rem;
//   font-weight: 600;
//   color: #151515;
// `;

// const ContactValue = styled.span`
//   font-size: 1rem;
//   font-weight: 500;
//   color: #151515;
// `;

// const SocialSection = styled.div`
//   display: flex;
//   flex-direction: column;
//   gap: 1rem;
// `;

// const SocialLabel = styled.span`
//   font-size: 1rem;
//   font-weight: 700;
//   color: #000000;
// `;

// const SocialIcons = styled.div`
//   display: flex;
//   gap: 1rem;
// `;

// const SocialIcon = styled.div`
//   width: 40px;
//   height: 40px;
//   background-color: white;
//   border-radius: 8px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
// `;

// const InstagramIcon = styled.div`
//   width: 20px;
//   height: 20px;
//   background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23000000'%3E%3Cpath d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z'/%3E%3C/svg%3E")
//     no-repeat center;
//   background-size: contain;
// `;

// const LinkedInIcon = styled.div`
//   width: 20px;
//   height: 20px;
//   background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23000000'%3E%3Cpath d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'/%3E%3C/svg%3E")
//     no-repeat center;
//   background-size: contain;
// `;

// const TwitterIcon = styled.div`
//   width: 20px;
//   height: 20px;
//   background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23000000'%3E%3Cpath d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'/%3E%3C/svg%3E")
//     no-repeat center;
//   background-size: contain;
// `;

// const YouTubeIcon = styled.div`
//   width: 20px;
//   height: 20px;
//   background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23000000'%3E%3Cpath d='M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z'/%3E%3C/svg%3E")
//     no-repeat center;
//   background-size: contain;
// `;

// const RightColumn = styled.div`
//   background-color: #F2F2F2;
//   padding: 3rem;
//   border-radius: 16px;

//   @media (max-width: 768px) {
//     padding: 2rem;
//   }

//   @media (max-width: 480px) {
//     padding: 1.5rem;
//   }
// `;

// const FormHeading = styled.h3`
//   font-size: 20px;
//   font-weight: 400;
//   color: #151515;
//   margin: 0 0 0.5rem 0;

//   @media (max-width: 768px) {
//     font-size: 1.75rem;
//   }

//   @media (max-width: 480px) {
//     font-size: 1.5rem;
//   }
// `;

// const FormSubtitle = styled.p`
//   font-size: 1rem;
//   font-weight: 400;
//   color: #000000;
//   margin: 0 0 2rem 0;

//   @media (max-width: 480px) {
//     font-size: 0.95rem;
//   }
// `;

// const ContactForm = styled.form`
//   display: flex;
//   flex-direction: column;
//   gap: 1.5rem;
// `;

// const FormField = styled.div`
//   display: flex;
//   flex-direction: column;
// `;

// const FormInput = styled.input`
//   padding: 0.75rem 0;
//   border: none;
//   border-bottom: 1px solid #808080;
//   background-color: transparent;
//   font-size: 1rem;
//   font-family: "DM Sans", sans-serif;
//   color: #8D8D8D;
//   outline: none;
//   transition: border-color 0.2s ease;

//   &::placeholder {
//     color: #999999;
//   }

//   &:focus {
//     border-bottom-color: #f5b645;
//   }
// `;

// const FormTextarea = styled.textarea`
//   padding: 0.75rem 0;
//   border: none;
//   border-bottom: 1px solid #808080;
//   background-color: transparent;
//   font-size: 1rem;
//   font-family: "DM Sans", sans-serif;
//   color: #333333;
//   outline: none;
//   resize: vertical;
//   min-height: 100px;
//   transition: border-color 0.2s ease;

//   &::placeholder {
//     color: #999999;
//   }

//   &:focus {
//     border-bottom-color: #f5b645;
//   }
// `;

// const SubmitButton = styled.button`
//   background-color: #f5b645;
//   color: #151515;
//   border: none;
//   border-radius: 70px;
//   padding: 1rem 2rem;
//   font-size: 16px;
//   font-weight: 600;
//   font-family: "DM Sans", sans-serif;
//   cursor: pointer;
//   transition: all 0.2s ease;
//   align-self: flex-start;
//   margin-top: 20px;

//   &:hover {
//     background-color: #e6a539;
//     transform: translateY(-1px);
//   }

//   @media (max-width: 480px) {
//     width: 100%;
//     align-self: stretch;
//   }
// `;

// export default ContactFormSection;


"use client";

import React, { useState, useRef } from "react";
import styled from "styled-components";
import { Container } from "@mantine/core";
import emailjs from "@emailjs/browser";

const ContactFormSection: React.FC = () => {
  const form = useRef<HTMLFormElement>(null);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.current) return;

    setIsSending(true);

    emailjs
      .sendForm(
        "service_k2arv7d",   // Paste your Service ID here
        "template_u919qds",  // Paste your Template ID here
        form.current,
        "Ms78aIjLPt-qs_shl"    // Paste your Public Key here
      )
      .then(
        (result) => {
          console.log("SUCCESS!", result.text);
          alert("Message sent successfully!");
          form.current?.reset();
        },
        (error) => {
          console.log("FAILED...", error.text);
          alert("Failed to send message. Please try again.");
        }
      )
      .finally(() => {
        setIsSending(false);
      });
  };

  return (
    <SectionWrapper>
      <Container size="lg" px="md">
        <TwoColumnLayout>
          {/* Left Column - Contact Information */}
          <LeftColumn>
            <MainHeading>
              We are always ready to help you and answer your questions
            </MainHeading>
            <Description>
              Need assistance with ticketing, hosting, or planning? Reach out
              and our support team will respond quickly.
            </Description>
            <ContactDetails>
              <ContactItem>
                <ContactLabel>Call Center</ContactLabel>
                <ContactValue>+23483294782293</ContactValue>
              </ContactItem>
              <ContactItem>
                <ContactLabel>Email</ContactLabel>
                <ContactValue>www.kuepass@gmail.com</ContactValue>
              </ContactItem>
              <SocialSection>
                <SocialLabel>Social Links</SocialLabel>
                <SocialIcons>
                  <SocialIcon><InstagramIcon /></SocialIcon>
                  <SocialIcon><LinkedInIcon /></SocialIcon>
                  <SocialIcon><TwitterIcon /></SocialIcon>
                  <SocialIcon><YouTubeIcon /></SocialIcon>
                </SocialIcons>
              </SocialSection>
            </ContactDetails>
          </LeftColumn>

          {/* Right Column - Contact Form */}
          <RightColumn>
            <FormHeading>Get In Touch</FormHeading>
            <FormSubtitle>Let&apos;s Make Your Event Easier</FormSubtitle>
            <ContactForm ref={form} onSubmit={handleSubmit}>
              <FormField>
                <FormInput
                  type="text"
                  name="name" // Changed from 'fullName' to match template `{{name}}`
                  placeholder="Full Name"
                  required
                />
              </FormField>
              <FormField>
                <FormInput
                  type="email"
                  name="email"
                  placeholder="Email"
                  required
                />
              </FormField>
              <FormField>
                <FormInput
                  type="text"
                  name="subject"
                  placeholder="Subject"
                  required
                />
              </FormField>
              <FormField>
                <FormTextarea
                  name="message"
                  placeholder="Message"
                  rows={4}
                  required
                />
              </FormField>
              <SubmitButton type="submit" disabled={isSending}>
                {isSending ? "Sending..." : "Send a message"}
              </SubmitButton>
            </ContactForm>
          </RightColumn>
        </TwoColumnLayout>
      </Container>
    </SectionWrapper>
  );
};

// Styled Components
const SectionWrapper = styled.section`
  background-color: white;
  padding: 4rem 0;
  font-family: "DM Sans", sans-serif;
  @media (max-width: 768px) { padding: 3rem 0; }
  @media (max-width: 480px) { padding: 2rem 0; }
`;

const TwoColumnLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: start;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const MainHeading = styled.h2`
  font-size: 2rem;
  font-weight: 500;
  color: #000000;
  margin: 0;
  line-height: 1.2;
  @media (max-width: 768px) { font-size: 2rem; }
  @media (max-width: 480px) { font-size: 1.75rem; }
`;

const Description = styled.p`
  font-size: 24px;
  font-weight: 400;
  color: #666666;
  margin: 0;
  line-height: 1.6;
  @media (max-width: 768px) { font-size: 1rem; }
  @media (max-width: 480px) { font-size: 0.95rem; }
`;

const ContactDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ContactItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ContactLabel = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: #151515;
`;

const ContactValue = styled.span`
  font-size: 1rem;
  font-weight: 500;
  color: #151515;
`;

const SocialSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SocialLabel = styled.span`
  font-size: 1rem;
  font-weight: 700;
  color: #000000;
`;

const SocialIcons = styled.div`
  display: flex;
  gap: 1rem;
`;

const SocialIcon = styled.div`
  width: 40px;
  height: 40px;
  background-color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const InstagramIcon = styled.div`
  width: 20px;
  height: 20px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23000000'%3E%3Cpath d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z'/%3E%3C/svg%3E") no-repeat center;
  background-size: contain;
`;

const LinkedInIcon = styled.div`
  width: 20px;
  height: 20px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23000000'%3E%3Cpath d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'/%3E%3C/svg%3E") no-repeat center;
  background-size: contain;
`;

const TwitterIcon = styled.div`
  width: 20px;
  height: 20px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23000000'%3E%3Cpath d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'/%3E%3C/svg%3E") no-repeat center;
  background-size: contain;
`;

const YouTubeIcon = styled.div`
  width: 20px;
  height: 20px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23000000'%3E%3Cpath d='M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z'/%3E%3C/svg%3E") no-repeat center;
  background-size: contain;
`;

const RightColumn = styled.div`
  background-color: #F2F2F2;
  padding: 3rem;
  border-radius: 16px;
  @media (max-width: 768px) { padding: 2rem; }
  @media (max-width: 480px) { padding: 1.5rem; }
`;

const FormHeading = styled.h3`
  font-size: 20px;
  font-weight: 400;
  color: #151515;
  margin: 0 0 0.5rem 0;
  @media (max-width: 768px) { font-size: 1.75rem; }
  @media (max-width: 480px) { font-size: 1.5rem; }
`;

const FormSubtitle = styled.p`
  font-size: 1rem;
  font-weight: 400;
  color: #000000;
  margin: 0 0 2rem 0;
  @media (max-width: 480px) { font-size: 0.95rem; }
`;

const ContactForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
`;

const FormInput = styled.input`
  padding: 0.75rem 0;
  border: none;
  border-bottom: 1px solid #808080;
  background-color: transparent;
  font-size: 1rem;
  font-family: "DM Sans", sans-serif;
  color: #8D8D8D;
  outline: none;
  transition: border-color 0.2s ease;
  &::placeholder { color: #999999; }
  &:focus { border-bottom-color: #f5b645; }
`;

const FormTextarea = styled.textarea`
  padding: 0.75rem 0;
  border: none;
  border-bottom: 1px solid #808080;
  background-color: transparent;
  font-size: 1rem;
  font-family: "DM Sans", sans-serif;
  color: #333333;
  outline: none;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.2s ease;
  &::placeholder { color: #999999; }
  &:focus { border-bottom-color: #f5b645; }
`;

const SubmitButton = styled.button`
  background-color: #f5b645;
  color: #151515;
  border: none;
  border-radius: 70px;
  padding: 1rem 2rem;
  font-size: 16px;
  font-weight: 600;
  font-family: "DM Sans", sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-start;
  margin-top: 20px;

  &:hover {
    background-color: #e6a539;
    transform: translateY(-1px);
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  @media (max-width: 480px) {
    width: 100%;
    align-self: stretch;
  }
`;

export default ContactFormSection;