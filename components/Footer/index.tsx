"use client";
import React from "react";
import styled from "styled-components";
import { Container } from "@mantine/core";
import Image from "next/image";

const CustomFooter: React.FC = () => {
  return (
    <FooterWrapper>
      <Container size="xl" px="md">
        <FooterTop>
          <LogoContainer>
            <Image
              src="/images/Kuepass1.png"
              alt="Kuepass"
              width={160}
              height={45}
            />
            <BrandDescription>
              Elevate your event experience with seamless ticketing, smart entry, and comprehensive analytics all in one intelligent platform.
            </BrandDescription>
          </LogoContainer>

          <FooterGrid>
            {/* Download Kuepass Column */}
            <FooterColumn>
              <ColumnTitle>Download App</ColumnTitle>
              <HeaderLine />
              <DownloadOptions>
                <DownloadOption>
                  <IconCircle>
                    <Image src="/images/apple.png" alt="Apple" width={18} height={18} />
                  </IconCircle>
                  <DownloadInfo>
                    <DownloadSub>Download on the</DownloadSub>
                    <DownloadText>App Store</DownloadText>
                  </DownloadInfo>
                </DownloadOption>
                
                <DownloadOption>
                  <IconCircle>
                    <Image src="/images/andriod.png" alt="Android" width={18} height={18} />
                  </IconCircle>
                  <DownloadInfo>
                    <DownloadSub>GET IT ON</DownloadSub>
                    <DownloadText>Google Play</DownloadText>
                  </DownloadInfo>
                </DownloadOption>
              </DownloadOptions>
            </FooterColumn>

            {/* Social Media Column */}
            <FooterColumn>
              <ColumnTitle>Connect</ColumnTitle>
              <HeaderLine />
              <SocialOptions>
                <SocialOption>
                  <SocialIconWrapper>
                    <Image src="/images/insta.png" alt="Instagram" width={20} height={20} />
                  </SocialIconWrapper>
                  <SocialText>Instagram</SocialText>
                </SocialOption>
                <SocialOption>
                  <SocialIconWrapper>
                    <Image src="/images/tiktok.png" alt="TikTok" width={20} height={20} />
                  </SocialIconWrapper>
                  <SocialText>TikTok</SocialText>
                </SocialOption>
                <SocialOption>
                  <SocialIconWrapper>
                    <Image src="/images/lindin.png" alt="LinkedIn" width={20} height={20} />
                  </SocialIconWrapper>
                  <SocialText>LinkedIn</SocialText>
                </SocialOption>
                <SocialOption>
                  <SocialIconWrapper>
                    <Image src="/images/youtube.png" alt="YouTube" width={20} height={20} />
                  </SocialIconWrapper>
                  <SocialText>YouTube</SocialText>
                </SocialOption>
              </SocialOptions>
            </FooterColumn>

            {/* Useful Pages Column */}
            <FooterColumn>
              <ColumnTitle>Company</ColumnTitle>
              <HeaderLine />
              <PageOptions>
                <PageLink>About Us</PageLink>
                <PageLink>Services</PageLink>
                <PageLink>Contact Us</PageLink>
                <PageLink>FAQs</PageLink>
                <PageLink>Privacy Policy</PageLink>
                <PageLink>Terms and Conditions</PageLink>
              </PageOptions>
            </FooterColumn>
          </FooterGrid>
        </FooterTop>

        <FooterBottom>
          <CopyrightText>© {new Date().getFullYear()} Kuepass. All rights reserved.</CopyrightText>
          <BottomLinks>
            <span>Security</span>
            <span>Cookies</span>
          </BottomLinks>
        </FooterBottom>
      </Container>
    </FooterWrapper>
  );
};

// Styled Components
const FooterWrapper = styled.footer`
  background: #044834; 
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding: 5rem 0 2rem;
  color: #fafafa;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  position: relative;
  overflow: hidden;

  /* Subtle glow in the background */
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 30%;
    width: 40%; height: 2px;
    background: linear-gradient(90deg, transparent, #10b981, transparent);
    opacity: 0.5;
  }

  @media (max-width: 768px) {
    padding: 3.5rem 0 1.5rem;
  }
`;

const FooterTop = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 4rem;

  @media (max-width: 992px) {
    flex-direction: column;
    gap: 3rem;
  }
`;

const LogoContainer = styled.div`
  flex: 1;
  max-width: 320px;

  @media (max-width: 992px) {
    max-width: 100%;
  }
`;

const BrandDescription = styled.p`
  margin-top: 1.5rem;
  font-size: 0.95rem;
  line-height: 1.6;
  color: #a1a1aa;
  font-weight: 400;
`;

const FooterGrid = styled.div`
  flex: 2;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 2.5rem 2rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
`;

const FooterColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const ColumnTitle = styled.h3`
  font-size: 1.05rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
  letter-spacing: 0.5px;
`;

const HeaderLine = styled.div`
  width: 24px;
  height: 2px;
  background: #10b981;
  margin-bottom: 1.5rem;
  border-radius: 2px;
`;

// Download App Styles
const DownloadOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const DownloadOption = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.6rem 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }
`;

const IconCircle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
`;

const DownloadInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const DownloadSub = styled.span`
  font-size: 0.65rem;
  color: #a1a1aa;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1;
  margin-bottom: 0.1rem;
`;

const DownloadText = styled.span`
  font-size: 0.95rem;
  font-weight: 500;
  color: #f4f4f5;
  line-height: 1;
`;

// Social Media Styles
const SocialOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SocialOption = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
  
  &:hover span {
    color: #10b981;
    transform: translateX(4px);
  }
  
  &:hover div {
    background: rgba(16, 185, 129, 0.1);
    border-color: rgba(16, 185, 129, 0.3);
  }
`;

const SocialIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #034733;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
`;

const SocialText = styled.span`
  font-size: 0.95rem;
  font-weight: 500;
  color: #d4d4d8;
  transition: all 0.3s ease;
`;

// Useful Pages Styles
const PageOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
`;

const PageLink = styled.span`
  font-size: 0.95rem;
  font-weight: 400;
  color: #a1a1aa;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  width: fit-content;

  &::after {
    content: '';
    position: absolute;
    bottom: -2px; left: 0;
    width: 0; height: 1px;
    background: #10b981;
    transition: width 0.3s ease;
  }

  &:hover {
    color: #f4f4f5;
    
    &::after {
      width: 100%;
    }
  }
`;

// Footer Bottom Styles
const FooterBottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
    margin-top: 3rem;
  }
`;

const CopyrightText = styled.p`
  font-size: 0.85rem;
  color: #71717a;
  margin: 0;
`;

const BottomLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  
  span {
    font-size: 0.85rem;
    color: #71717a;
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: #d4d4d8;
    }
  }
`;

export default CustomFooter;
