"use client";
import React from "react";
import styled from "styled-components";
import { Container } from "@mantine/core";
import Image from "next/image";

const CustomFooter: React.FC = () => {
  return (
    <FooterWrapper>
      <Container size="xl" px="md">
        <LogoContainer>
          <Image
            src="/images/Kuepass1.png"
            alt="Kuepass"
            width={170}
            height={50}
          />
        </LogoContainer>

        <FooterGrid>
          {/* Download Kuepass Column */}
          <FooterColumn>
            <ColumnTitle>DOWNLOAD KUEPASS</ColumnTitle>
            <DownloadOptions>
              <DownloadOption>
                <DownloadIcon>
                  <Image
                    src="/images/apple.png"
                    alt="Apple"
                    width={20}
                    height={20}
                  />
                </DownloadIcon>
                <DownloadText>Apple iOS</DownloadText>
              </DownloadOption>
              <DownloadOption>
                <DownloadIcon>
                  <Image
                    src="/images/andriod.png"
                    alt="Android"
                    width={20}
                    height={20}
                  />
                </DownloadIcon>
                <DownloadText>Google Android</DownloadText>
              </DownloadOption>
            </DownloadOptions>
          </FooterColumn>

          {/* Social Media Column */}
          <FooterColumn>
            <ColumnTitle>SOCIAL MEDIA</ColumnTitle>
            <SocialOptions>
              <SocialOption>
                <SocialIcon>
                  <Image
                    src="/images/insta.png"
                    alt="Instagram"
                    width={20}
                    height={20}
                  />
                </SocialIcon>
                <SocialText>Instagram</SocialText>
              </SocialOption>
              <SocialOption>
                <SocialIcon>
                  <Image
                    src="/images/tiktok.png"
                    alt="TikTok"
                    width={20}
                    height={20}
                  />
                </SocialIcon>
                <SocialText>Tiktok</SocialText>
              </SocialOption>
              <SocialOption>
                <SocialIcon>
                  <Image
                    src="/images/lindin.png"
                    alt="LinkedIn"
                    width={20}
                    height={20}
                  />
                </SocialIcon>
                <SocialText>Linkedin</SocialText>
              </SocialOption>
              <SocialOption>
                <SocialIcon>
                  <Image
                    src="/images/youtube.png"
                    alt="YouTube"
                    width={20}
                    height={20}
                  />
                </SocialIcon>
                <SocialText>Youtube</SocialText>
              </SocialOption>
            </SocialOptions>
          </FooterColumn>

          {/* Useful Pages Column */}
          <FooterColumn>
            <ColumnTitle>USEFUL PAGES</ColumnTitle>
            <PageOptions>
              <PageLink>Terms and Conditions</PageLink>
              <PageLink>Privacy Policy</PageLink>
              <PageLink>Contact Us</PageLink>
              <PageLink>About Us</PageLink>
              <PageLink>Services</PageLink>
              <PageLink>FAQs</PageLink>
            </PageOptions>
          </FooterColumn>
        </FooterGrid>

        <FooterBottom>
          <CopyrightText>© {new Date().getFullYear()} Kuepass. All rights reserved.</CopyrightText>
        </FooterBottom>
      </Container>
    </FooterWrapper>
  );
};

// Styled Components
const FooterWrapper = styled.footer`
  background-color: #15302b;
  padding: 3rem 0 2rem;
  color: white;

  @media (max-width: 768px) {
    padding: 2.5rem 0 1.5rem;
  }
`;

const LogoContainer = styled.div`
  margin-bottom: 2.5rem;

  @media (max-width: 768px) {
    margin-bottom: 2rem;
    text-align: center;
    display: flex;
    justify-content: center;
  }
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: 2rem 1.5rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem 1rem;
  }
`;

const FooterColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ColumnTitle = styled.h3`
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  margin-bottom: 0.25rem;

  @media (max-width: 480px) {
    font-size: 0.7rem;
    letter-spacing: 1px;
  }
`;

const DownloadOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const DownloadOption = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.7;
  }
`;

const DownloadIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
`;

const DownloadText = styled.span`
  font-size: 0.95rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.85);
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

const SocialOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SocialOption = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.7;
  }
`;

const SocialIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
`;

const SocialText = styled.span`
  font-size: 0.95rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.85);
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

const PageOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const PageLink = styled.span`
  font-size: 0.95rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  transition: opacity 0.2s ease;
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  &:hover {
    opacity: 0.7;
    text-decoration: underline;
  }

  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

const FooterBottom = styled.div`
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;

  @media (max-width: 768px) {
    margin-top: 2rem;
    padding-top: 1.25rem;
  }
`;

const CopyrightText = styled.p`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

export default CustomFooter;
