"use client";
import React from "react";
import styled from "styled-components";
import { Container } from "@mantine/core";
import Image from "next/image";

const CustomFooter: React.FC = () => {
  return (
    <FooterWrapper>
      <Container size="xl" px="md">
        <FooterGrid>
          {/* Download Kuepass Column */}
          <LogoContainer>
            <Image
              src="/images/Kuepass1.png"
              alt="Kuepass"
              width={170}
              height={50}
            />
          </LogoContainer>
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
      </Container>
    </FooterWrapper>
  );
};

// Styled Components
const FooterWrapper = styled.footer`
  background-color: #15302b;
  padding: 3rem 0;
  color: white;

  @media (max-width: 768px) {
    padding: 2rem 0;
  }

  @media (max-width: 480px) {
    padding: 1.5rem 0;
  }
`;

const FooterGrid = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 2rem;
  }

  @media (max-width: 480px) {
    gap: 1.5rem;
  }
`;

const FooterColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const ColumnTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  @media (max-width: 768px) {
    font-size: 1rem;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const DownloadOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const DownloadOption = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
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
  font-size: 1rem;
  font-weight: 400;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const SocialOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SocialOption = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
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
  font-size: 1rem;
  font-weight: 400;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const PageOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const PageLink = styled.span`
  font-size: 1rem;
  font-weight: 400;
  color: white;
  cursor: pointer;
  transition: opacity 0.2s ease;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  &:hover {
    opacity: 0.8;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

export default CustomFooter;
