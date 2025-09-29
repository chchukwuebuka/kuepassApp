
"use client"

import type React from "react"
import { useState } from "react"
import { Image } from "@mantine/core"
import styled from "styled-components"
import { useIsMobile } from "@/hooks/use-mobile"

const EventTypes: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const isMobile = useIsMobile()

  const eventCards = [
    {
      id: 1,
      number: "[1]",
      title: "Community & Cause-Based Events",
      description:
        "We bring your vision to life through community events, from cultural festivals to charity fundraisers.",
      image: "/images/base.png",
      alt: "Community event with face paint",
    },
    {
      id: 2,
      number: "[2]",
      title: "Corporate & Professional Events",
      description: "We run smooth and successful business events, from conferences and trade shows to team retreats.",
      image: "/images/base1.png",
      alt: "Corporate event with colorful outfits",
    },
    {
      id: 3,
      number: "[3]",
      title: "Private & Social Celebrations",
      description: "We artfully manage elegant moments: weddings, birthdays, anniversaries, and parties.",
      image: "/images/base2.png",
      alt: "Private celebration with party hat",
    },
    {
      id: 4,
      number: "[4]",
      title: "Music & Entertainment Events",
      description:
        "From concerts and music festivals to comedy shows and theater performances, we handle all entertainment events.",
      image: "/images/base.png",
      alt: "Music concert event",
    },
    {
      id: 5,
      number: "[5]",
      title: "Sports & Athletic Events",
      description:
        "We manage sporting events, tournaments, marathons, and athletic competitions with precision and expertise.",
      image: "/images/base1.png",
      alt: "Sports event",
    },
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => {
      const maxSlide = isMobile ? eventCards.length - 1 : eventCards.length - 3
      return prev < maxSlide ? prev + 1 : prev
    })
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev))
  }

  const getTransform = () => {
    if (isMobile) {
      return `translateX(-${currentSlide * 100}%)`
    }
    return `translateX(-${currentSlide * 33.333}%)`
  }

  const getProgressWidth = () => {
    if (isMobile) {
      return `${((currentSlide + 1) / eventCards.length) * 100}%`
    }
    return `${((currentSlide + 1) / (eventCards.length - 2)) * 100}%`
  }

  return (
    <EventTypesContainer>
      <ContentWrapper>
        <HeaderSection>
          <MainHeading>
            Powering Every Kind of <HighlightedEvent>Event</HighlightedEvent>
          </MainHeading>
          <Subtitle>
            Kuepass powers events of any size with seamless ticketing, secure access control, and real-time management
          </Subtitle>
        </HeaderSection>

        <CardsSection>
          <CarouselContainer>
            <CarouselWrapper
              style={{
                transform: getTransform(),
              }}
              $isMobile={isMobile}
            >
              {eventCards.map((card) => (
                <EventCard key={card.id} $isMobile={isMobile}>
                  <CardContent>
                    <CardNumber>{card.number}</CardNumber>
                    <CardTitle>{card.title}</CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </CardContent>
                  <CardImage>
                    <Image
                      src={card.image || "/placeholder.svg"}
                      alt={card.alt}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </CardImage>
                </EventCard>
              ))}
            </CarouselWrapper>
          </CarouselContainer>
        </CardsSection>

        <NavigationSection>
          <ProgressIndicator>
            <ProgressBar>
              <ProgressFill
                style={{
                  width: getProgressWidth(),
                }}
              />
            </ProgressBar>
          </ProgressIndicator>
          <NavigationControls>
            <NavArrow onClick={prevSlide} disabled={currentSlide === 0}>
              ←
            </NavArrow>
            <NavArrow
              onClick={nextSlide}
              disabled={currentSlide === (isMobile ? eventCards.length - 1 : eventCards.length - 3)}
            >
              →
            </NavArrow>
          </NavigationControls>
        </NavigationSection>
      </ContentWrapper>
    </EventTypesContainer>
  )
}

export default EventTypes

// Styled Components
const EventTypesContainer = styled.div`
  background-color: #ffffff;
  min-height: 100vh;
  padding: 80px 0;

  @media (max-width: 768px) {
    padding: 40px 0;
  }
`

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 80px;

  @media (max-width: 768px) {
    margin-bottom: 40px;
  }
`

const MainHeading = styled.h1`
  font-size: 48px;
  font-weight: 600;
  line-height: 1.2;
  color: #000000;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    font-size: 32px;
    margin-bottom: 16px;
  }
`

const HighlightedEvent = styled.span`
  background-color: #4fff40;
  color: #000000;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  display: inline-block;

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 28px;
  }
`

const Subtitle = styled.p`
  font-size: 18px;
  font-weight: 400;
  line-height: 1.6;
  color: #666666;
  max-width: 600px;
  margin: 0 auto;

  @media (max-width: 768px) {
    font-size: 16px;
    max-width: 100%;
  }
`

const CardsSection = styled.div`
  margin-bottom: 60px;

  @media (max-width: 768px) {
    margin-bottom: 40px;
  }
`

const CarouselContainer = styled.div`
  overflow: hidden;
  position: relative;
  width: 100%;
`

const CarouselWrapper = styled.div<{ $isMobile: boolean }>`
  display: flex;
  transition: transform 0.5s ease-in-out;
  gap: 24px;
  width: 100%;

  @media (max-width: 768px) {
    gap: 0;
  }
`

const EventCard = styled.div<{ $isMobile: boolean }>`
  background-color: transparent;
  flex: ${(props) => (props.$isMobile ? "0 0 100%" : "0 0 calc(33.333% - 16px)")};
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  @media (max-width: 768px) {
    padding: 0 12px;
  }
`

const CardContent = styled.div`
  margin-bottom: 20px;
`

const CardNumber = styled.div`
  font-size: 18px;
  font-weight: 500;
  color: #606060;
  margin-bottom: 8px;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`

const CardTitle = styled.h3`
  font-size: 24px;
  font-weight: 600;
  color: #000000;
  margin: 0 0 12px 0;
  line-height: 1.3;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`

const CardDescription = styled.p`
  font-size: 16px;
  font-weight: 400;
  line-height: 1.6;
  color: #6f6f6f;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`

const CardImage = styled.div`
  width: 100%;
  height: 320px;
  position: relative;
  overflow: hidden;
  border-radius: 12px;

  @media (max-width: 768px) {
    height: 240px;
  }
`

const NavigationSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 24px;

  @media (max-width: 768px) {
    justify-content: center;
    gap: 16px;
  }
`

const ProgressIndicator = styled.div`
  display: flex;
  align-items: center;
  flex: 0 0 auto;
`

const ProgressBar = styled.div`
  width: 200px;
  height: 4px;
  background-color: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 150px;
  }
`

const ProgressFill = styled.div`
  height: 100%;
  background-color: #025a3a;
  border-radius: 2px;
  transition: width 0.3s ease;
`

const NavigationControls = styled.div`
  display: flex;
  gap: 12px;
`

const NavArrow = styled.button`
  background-color: transparent;
  border: 2px solid #000000;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  color: #000000;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background-color: #000000;
    color: #ffffff;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
`
