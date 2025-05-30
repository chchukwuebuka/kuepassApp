// "use client";
// import React, { useState, useEffect, useCallback } from "react";
// import Link from "next/link";
// import styled, { keyframes } from "styled-components";
// import { Button, Flex, Group, Image, Stack, Text } from "@mantine/core";
// import NextImage from "next/image";

// const HeroSection: React.FC = () => {
//   // State to toggle between "Create" and "Discover"
//   const [isCreate, setIsCreate] = useState(true);
//   const [isAnimating, setIsAnimating] = useState(false);

//   // Use useCallback to prevent unnecessary re-renders
//   const toggleWord = useCallback(() => {
//     setIsAnimating(true);
//     setTimeout(() => {
//       setIsCreate((prev) => !prev);
//       setIsAnimating(false);
//     }, 500); // Half of the animation time for smooth transition
//   }, []);

//   useEffect(() => {
//     const interval = setInterval(toggleWord, 3000); // Increased to 3 seconds for better readability
//     return () => clearInterval(interval);
//   }, [toggleWord]);

//   return (
//     <HeroContainer>
//       <ContentWrapper>
//         <TextSection>
//           <HeroText>
//             <AnimatedWord isCreate={isCreate} isAnimating={isAnimating}>
//               {isCreate ? "Create" : "Discover"}
//             </AnimatedWord>{" "}
//             Your <br className="desktop-break" />
//             Events With Ease
//           </HeroText>

//           <SubText>
//             Welcome to your one-stop destination for everything event-related.
//             Search for events and create your own all in one intuitive
//             application.
//           </SubText>

//           <ButtonGroup>
//             <Link href="/eventSchedule/exploreEvent" passHref>
//               <PrimaryButton>Explore Events</PrimaryButton>
//             </Link>
//             <Link href="/eventSchedule/createEventForm" passHref>
//               <SecondaryButton>Create Event</SecondaryButton>
//             </Link>
//           </ButtonGroup>

//           <StatsContainer>
//             <StatBox>
//               <StatLabel>Hosted</StatLabel>
//               <StatNumber>200+</StatNumber>
//               <StatLabel>Events</StatLabel>
//             </StatBox>
//             <StatDivider />
//             <StatBox>
//               <StatLabel>Trusted By</StatLabel>
//               <StatNumber>50+</StatNumber>
//               <StatLabel>Brands</StatLabel>
//             </StatBox>
//           </StatsContainer>
//         </TextSection>

//         <ImageSection>
//           <MainImageWrapper>
//             <Image
//               src="/images/club.jpg"
//               alt="Featured event"
//               style={{
//                 objectFit: "cover",
//                 borderRadius: "20px",
//                 width: "100%",
//                 height: "100%",
//               }}
//             />
//           </MainImageWrapper>
//           <SecondaryImageWrapper>
//             <Image
//               src="/images/happyImage.png"
//               alt="People enjoying an event"
//               style={{
//                 objectFit: "cover",
//                 borderRadius: "20px 20px 0 0",
//                 width: "100%",
//                 height: "100%",
//               }}
//             />
//           </SecondaryImageWrapper>
//         </ImageSection>
//       </ContentWrapper>
//     </HeroContainer>
//   );
// };

// export default HeroSection;

// // Keyframes
// const fadeInUp = keyframes`
//   from {
//     opacity: 0;
//     transform: translateY(20px);
//   }
//   to {
//     opacity: 1;
//     transform: translateY(0);
//   }
// `;

// const slideInFromTop = keyframes`
//   0% {
//     transform: translateY(-100%);
//     opacity: 0;
//   }
//   100% {
//     transform: translateY(0);
//     opacity: 1;
//   }
// `;

// // Styled Components with improved design
// const HeroContainer = styled.section`
//   padding: 2rem 1rem;
//   width: 100%;
//   overflow: hidden;
//   max-width: 1440px;
//   margin: 0 auto;

//   @media (min-width: 768px) {
//     padding: 3rem 2rem;
//   }

//   @media (min-width: 1024px) {
//     padding: 4rem 2rem;
//   }
// `;

// const ContentWrapper = styled(Flex)`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   justify-content: center;
//   gap: 2rem;
//   width: 100%;

//   @media (min-width: 1024px) {
//     flex-direction: row;
//     align-items: center;
//     justify-content: space-between;
//     text-align: left;
//   }
// `;

// const TextSection = styled.div`
//   width: 100%;
//   animation: ${fadeInUp} 0.8s ease-out;
//   text-align: center;

//   @media (min-width: 1024px) {
//     flex: 1;
//     text-align: left;
//   }
// `;

// const HeroText = styled(Text)`
//   font-size: 2rem;
//   font-weight: 800;
//   color: #1a1a2e;
//   line-height: 1.2;
//   margin-bottom: 1.5rem;

//   .desktop-break {
//     display: none;
//   }

//   @media (min-width: 640px) {
//     font-size: 2.5rem;
//   }

//   @media (min-width: 768px) {
//     font-size: 3rem;
//   }

//   @media (min-width: 1024px) {
//     font-size: 3.5rem;
//     line-height: 1.1;

//     .desktop-break {
//       display: inline;
//     }
//   }
// `;

// const HighlightedSpan = styled.span`
//   color: #7465ce;
//   position: relative;

//   &::after {
//     content: "";
//     position: absolute;
//     bottom: 4px;
//     left: 0;
//     width: 100%;
//     height: 6px;
//     background-color: rgba(116, 101, 206, 0.2);
//     z-index: -1;

//     @media (min-width: 768px) {
//       bottom: 6px;
//       height: 8px;
//     }
//   }
// `;

// const SubText = styled(Text)`
//   font-size: 1rem;
//   font-weight: 400;
//   color: #4a4a68;
//   margin-bottom: 2rem;
//   line-height: 1.6;
//   max-width: 100%;

//   @media (min-width: 640px) {
//     font-size: 1.125rem;
//     margin-bottom: 2.25rem;
//   }

//   @media (min-width: 1024px) {
//     font-size: 1.25rem;
//     max-width: 36rem;
//     margin-bottom: 2.5rem;
//   }
// `;

// const ButtonGroup = styled(Group)`
//   margin-bottom: 2rem;
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   gap: 1rem;

//   @media (min-width: 640px) {
//     flex-direction: row;
//     justify-content: center;
//   }

//   @media (min-width: 1024px) {
//     margin-bottom: 3rem;
//     justify-content: flex-start;
//   }
// `;

// const PrimaryButton = styled(Button)`
//   height: 3rem;
//   background-color: #025a3a;
//   color: white;
//   width: 100%;
//   max-width: 12rem;
//   padding: 0 1.5rem;
//   border-radius: 46px;
//   font-size: 0.875rem;
//   font-weight: 600;
//   transition: all 0.3s ease;
//   text-transform: uppercase;
//   letter-spacing: 0.5px;
//   box-shadow: 0 4px 14px rgba(2, 90, 58, 0.2);

//   @media (min-width: 640px) {
//     height: 3.25rem;
//     font-size: 1rem;
//   }

//   &:hover {
//     background-color: #013e28;
//     transform: translateY(-2px);
//     box-shadow: 0 6px 20px rgba(2, 90, 58, 0.25);
//   }

//   &:active {
//     transform: translateY(0);
//   }
// `;

// const SecondaryButton = styled(Button)`
//   height: 3rem;
//   background-color: transparent;
//   color: #025a3a;
//   width: 100%;
//   max-width: 12rem;
//   padding: 0 1.5rem;
//   border-radius: 46px;
//   border: 2px solid #025a3a;
//   font-size: 0.875rem;
//   font-weight: 600;
//   transition: all 0.3s ease;
//   text-transform: uppercase;
//   letter-spacing: 0.5px;

//   @media (min-width: 640px) {
//     height: 3.25rem;
//     font-size: 1rem;
//   }

//   &:hover {
//     background-color: transparent;
//     transform: translateY(-2px);
//     color: #025a3a;
//   }

//   &:active {
//     transform: translateY(0);
//   }
// `;

// const StatsContainer = styled(Flex)`
//   display: flex;
//   flex-direction: column;
//   gap: 2rem;
//   align-items: center;

//   @media (min-width: 480px) {
//     flex-direction: row;
//     justify-content: center;
//     gap: 3rem;
//   }

//   @media (min-width: 1024px) {
//     justify-content: flex-start;
//   }
// `;

// const StatBox = styled(Stack)`
//   text-align: center;
//   transition: transform 0.3s ease;

//   &:hover {
//     transform: translateY(-5px);
//   }
// `;

// const StatLabel = styled(Text)`
//   font-size: 0.875rem;
//   font-weight: 500;
//   color: #4a4a68;
//   text-transform: uppercase;
//   letter-spacing: 1px;

//   @media (min-width: 640px) {
//     font-size: 1rem;
//   }
// `;

// const StatNumber = styled(Text)`
//   font-size: 2.5rem;
//   font-weight: 800;
//   color: #7465ce;
//   line-height: 1;
//   margin: 0.5rem 0;

//   @media (min-width: 640px) {
//     font-size: 3rem;
//   }
// `;

// const StatDivider = styled.div`
//   height: 2px;
//   width: 100px;
//   background-color: rgba(74, 74, 104, 0.2);

//   @media (min-width: 480px) {
//     height: 60px;
//     width: 2px;
//   }
// `;

// const ImageSection = styled.div`
//   position: relative;
//   width: 100%;
//   height: 350px;
//   margin-top: 1rem;

//   @media (min-width: 640px) {
//     height: 400px;
//   }

//   @media (min-width: 1024px) {
//     flex: 1;
//     height: 500px;
//     margin-top: 0;
//   }
// `;

// const MainImageWrapper = styled.div`
//   position: absolute;
//   width: 100%;
//   max-width: 400px;
//   height: 220px;
//   border-radius: 150px 0 0 150px;
//   right: -28px;
//   z-index: 1;
//   overflow: hidden;
//   transition: transform 0.5s ease;

//   &:hover {
//     transform: scale(1.02);
//   }

//   @media (min-width: 480px) {
//     max-width: 350px;
//     height: 280px;
//   }

//   @media (min-width: 640px) {
//     max-width: 400px;
//     height: 320px;
//   }

//   @media (min-width: 1024px) {
//     max-width: 32rem;
//     height: 25rem;
//   }
// `;

// const SecondaryImageWrapper = styled.div`
//   position: absolute;
//   bottom: 0px;
//   left: 0;
//   width: 160px;
//   height: 180px;
//   border-radius: 20px 20px 0 0;
//   z-index: 2;
//   transition: transform 0.5s ease;
//   overflow: hidden;

//   &:hover {
//     transform: scale(1.05) rotate(2deg);
//   }

//   @media (min-width: 480px) {
//     width: 200px;
//     height: 220px;
//   }

//   @media (min-width: 640px) {
//     width: 220px;
//     height: 240px;
//   }

//   @media (min-width: 768px) {
//     width: 240px;
//     height: 260px;
//   }

//   @media (min-width: 1024px) {
//     width: 300px;
//     height: 340px;
//     left: auto;
//     right: 320px;
//   }
// `;

// interface AnimatedWordProps {
//   isCreate: boolean;
//   isAnimating: boolean;
// }

// const AnimatedWord = styled.span<AnimatedWordProps>`
//   display: inline-block;
//   animation: ${slideInFromTop} 1s ease-out;
//   color: ${({ isCreate }) => (isCreate ? "#FFD700" : "#025a3a")};
//   opacity: ${({ isAnimating }) => (isAnimating ? 0.5 : 1)};
//   transition: color 0.3s ease, opacity 0.3s ease;
//   font-weight: 900;
//   position: relative;

//   &::after {
//     content: "";
//     position: absolute;
//     bottom: 4px;
//     left: 0;
//     width: 100%;
//     height: 6px;
//     background-color: ${({ isCreate }) =>
//       isCreate ? "rgba(255, 215, 0, 0.3)" : "rgba(2, 90, 58, 0.2)"};
//     z-index: -1;
//     transition: background-color 0.3s ease;

//     @media (min-width: 768px) {
//       bottom: 8px;
//       height: 8px;
//     }
//   }
// `;

/* 
"use client";

import React, { useState } from "react";
import {
   IconSearch,
   IconChevronDown,
   IconHome,
   IconInfoCircle,
   IconCalendarEvent,
 } from "@tabler/icons-react";
 import {
   Avatar,
   Group,
   Image,
   Menu,
   Button,
   TextInput,
   Burger,
   Drawer,
   Stack,
   Text,
   Box,
   UnstyledButton,
   Divider,
 } from "@mantine/core";
 import { useDisclosure } from "@mantine/hooks";
 import styles from "./styles.module.css";
 
 const Navbar: React.FC = () => {
   const dispatch = useAppDispatch();
   const router = useRouter();
   const [opened, { open, close }] = useDisclosure(false);
   const [searchFocused, setSearchFocused] = useState(false);
 
   // Access authentication state from Redux store
   const isLogged = useSelector((state: RootState) => state.user.isLogged);
   const userInfo = useSelector((state: RootState) => state.user.userInfo);
 
   const handleLogin = () => {
     router.push("/auth/signin");
   };
 
   const handleSignup = () => {
     router.push("/auth/signnup");
   };
 
   const handleLogout = async () => {
     dispatch(logout());
     await persistor.purge();
     router.push("/");
   };
 
   const handleGoHome = () => {
     router.push("/");
   };
 
   const navLinks = [
     { href: "/", label: "Home", icon: <IconHome size={18} stroke={1.5} /> },
     {
       href: "/about",
       label: "About",
       icon: <IconInfoCircle size={18} stroke={1.5} />,
     },
     {
       href: "/events",
       label: "Search Event",
       icon: <IconCalendarEvent size={18} stroke={1.5} />,
     },
   ];
 
   return (
    <>
       <header className={styles.navFlexEnhanced}>
         <div className={styles.navContainer}>
           
           <Link href="/">
             <Image
               src="/images/Kuepass.svg"
               alt="Kuepass"
               className={styles.kuepass}
             />
           </Link>
 
         
           <div className={styles.searchContainer}>
             <TextInput
               placeholder="Search events..."
               leftSection={<IconSearch size={18} stroke={1.5} />}
               classNames={{
                 root: searchFocused
                   ? styles.searchRootFocused
                   : styles.searchRoot,
                 input: styles.searchInput,
                 section: styles.searchIcon,
               }}
               onFocus={() => setSearchFocused(true)}
               onBlur={() => setSearchFocused(false)}
             />
           </div>
 
          
           <nav className={styles.navLinkEnhanced}>
             {navLinks.map((link) => (
               <Link key={link.label} href={link.href} className={styles.link}>
                 {link.label}
               </Link>
             ))}
           </nav>
 
           
           <div className={styles.groupBTN}>
             {!isLogged ? (
               <>
                 <Button
                   variant="outline"
                   className={styles.navBTNEnhanced}
                   onClick={handleLogin}
                 >
                   Sign In
                 </Button>
                 <Button
                   className={styles.navBTN1Enhanced}
                   onClick={handleSignup}
                 >
                   Sign Up
                 </Button>
               </>
             ) : (
               <Group>
                 <Menu position="bottom-end" shadow="md" width={200}>
                   <Menu.Target>
                     <UnstyledButton className={styles.avatarButtonEnhanced}>
                       <Group>
                         <Avatar
                           src={userInfo?.profilePicture || "/images/avatar.png"}
                           radius="xl"
                         />
                         <Text size="sm" fw={500}>
                           {userInfo?.name}
                         </Text>
                         <IconChevronDown size={16} stroke={1.5} />
                       </Group>
                     </UnstyledButton>
                   </Menu.Target>
                   <Menu.Dropdown>
                     <Menu.Item component={Link} href="/profile/profile">
                       Profile
                     </Menu.Item>
                     <Menu.Divider />
                     <Menu.Item onClick={handleLogout} color="red">
                       Logout
                     </Menu.Item>
                   </Menu.Dropdown>
                 </Menu>
                 <Button
                   className={styles.navBTN11Enhanced}
                   onClick={handleGoHome}
                 >
                   Go Home
                 </Button>
               </Group>
             )}
 
             
             <Burger
               opened={opened}
               onClick={open}
               className={styles.mobileMenuButton}
               size="sm"
             />
           </div>
         </div>
       </header>
 
       
       <Drawer
         opened={opened}
         onClose={close}
         position="right"
         size="75%"
         title={<Image src="/images/Kuepass.svg" alt="Kuepass" w={120} />}
       >
         <Stack gap="md">
         
           <TextInput
             placeholder="Search events..."
             leftSection={<IconSearch size={18} stroke={1.5} />}
             size="md"
           />
 
           <Divider my="sm" />
 
           
           <Stack gap="xs">
             {navLinks.map((link) => (
               <UnstyledButton
                 key={link.label}
                 component={Link}
                 href={link.href}
                 className={styles.mobileNavLink}
                 onClick={close}
               >
                 <Group>
                   {link.icon}
                   <Text>{link.label}</Text>
                 </Group>
               </UnstyledButton>
             ))}
           </Stack>
 
           <Divider my="sm" />
 
          
           {!isLogged ? (
             <Stack gap="sm">
               <Button
                 variant="outline"
                 fullWidth
                 onClick={() => {
                   handleLogin();
                   close();
                 }}
                 className={styles.mobileNavBTN}
               >
                 Sign In
               </Button>
               <Button
                 fullWidth
                 onClick={() => {
                   handleSignup();
                   close();
                 }}
                 className={styles.mobileNavBTN1}
               >
                 Sign Up
               </Button>
             </Stack>
           ) : (
             <Stack gap="md">
               <Box p="md" bg="gray.0" style={{ borderRadius: 8 }}>
                 <Group>
                   <Avatar
                     src={userInfo?.profilePicture || "/images/avatar.png"}
                     radius="xl"
                     size="md"
                   />
                   <div>
                     <Text fw={500}>{userInfo?.name}</Text>
                     <Text size="xs" c="dimmed">
                       {userInfo?.email}
                     </Text>
                   </div>
                 </Group>
               </Box>
 
               <UnstyledButton
                 component={Link}
                 href="/profile/profile"
                 className={styles.mobileNavLink}
                 onClick={close}
               >
                 Profile
               </UnstyledButton>
 
               <UnstyledButton
                 className={styles.mobileLogoutButton}
                 onClick={() => {
                   handleLogout();
                   close();
                 }}
               >
                 Logout
               </UnstyledButton>
 
               <Button
                 fullWidth
                 onClick={() => {
                   handleGoHome();
                   close();
                 }}
                 className={styles.mobileNavBTN1}
               >
                 Go Home
                 </Button>
             </Stack>
           )}
         </Stack>
       </Drawer>
     </>
   );
 }; */



 "use client"

import { useState, useEffect, useRef } from "react"
import { Button, Flex, Group, Image, Text, Container } from "@mantine/core"
import Link from "next/link"
import styled from "styled-components"
import { motion, AnimatePresence } from "framer-motion"

function HeroSection() {
  // State to toggle between words
  const [activeIndex, setActiveIndex] = useState(0)
  const words = ["Create", "Discover", "Manage", "Enjoy"]

  // Ref for the scroll indicator
  const scrollRef = useRef(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % words.length)
    }, 2500) // toggles every 2.5 seconds

    return () => clearInterval(interval)
  }, [])

  // Scroll indicator animation
  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        scrollRef.current.style.opacity = window.scrollY > 100 ? "0" : "1"
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <HeroContainer>
      <BackgroundGradient />
      <ShapeDivider />

      <ContentContainer>
        <HeroContent>
          <LeftContent>
            <HeadingContainer>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <GradientWord>{words[activeIndex]}</GradientWord>
                </motion.div>
              </AnimatePresence>{" "}
              Your <br />
              <HighlightSpan>Events</HighlightSpan> With Ease
            </HeadingContainer>

            <SubtitleText>
              Welcome to your one stop to everything and anything event. Search for event and create your event on one
              application.
            </SubtitleText>

            <ButtonGroup>
              <Link href="/eventSchedule/exploreEvent">
                <PrimaryButton>Explore Events</PrimaryButton>
              </Link>
              <Link href="/eventSchedule/createEventForm">
                <SecondaryButton>Create Event</SecondaryButton>
              </Link>
            </ButtonGroup>

            <StatsContainer>
              <StatBox>
                <StatValue>200+</StatValue>
                <StatLabel>Events Hosted</StatLabel>
                <StatIndicator />
              </StatBox>

              <StatDivider />

              <StatBox>
                <StatValue>50+</StatValue>
                <StatLabel>Trusted Brands</StatLabel>
                <StatIndicator />
              </StatBox>
            </StatsContainer>
          </LeftContent>

          <RightContent>
            <ImageContainer>
              <MainImageWrapper>
                <MainImage src="/images/chrisbrown.png" alt="Event" radius="md" />
                <ImageOverlay />
              </MainImageWrapper>

              <SecondaryImageWrapper>
                <SecondaryImage src="/images/happyImage.png" alt="Happy people" radius="md" />
                <ImageOverlay secondary />
              </SecondaryImageWrapper>

              <FloatingCard>
                <FloatingCardContent>
                  <FloatingCardIcon>🎉</FloatingCardIcon>
                  <FloatingCardText>Next Event: coming soon!!</FloatingCardText>
                </FloatingCardContent>
              </FloatingCard>
            </ImageContainer>
          </RightContent>
        </HeroContent>
      </ContentContainer>

      <ScrollIndicator ref={scrollRef}>
        <ScrollText>Scroll Down</ScrollText>
        <ScrollArrow>↓</ScrollArrow>
      </ScrollIndicator>
    </HeroContainer>
  )
}

export default HeroSection

// Styled Components
const HeroContainer = styled.div`
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  padding: 80px 0;
  
  @media (max-width: 992px) {
    padding: 60px 0;
  }
`

const BackgroundGradient = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,255,244,0.9) 100%);
  z-index: -2;
`

const ShapeDivider = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='pattern' width='40' height='40' viewBox='0 0 40 40' patternUnits='userSpaceOnUse' patternTransform='rotate(45)'%3E%3Crect width='100%25' height='100%25' fill='rgba(5, 99, 72, 0.03)'/%3E%3Ccircle cx='20' cy='20' r='1' fill='rgba(5, 99, 72, 0.05)'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23pattern)'/%3E%3C/svg%3E");
  opacity: 0.5;
  z-index: -1;
`

const ContentContainer = styled(Container)`
  max-width: 1400px;
  height: 100%;
  margin: 0 auto;
  padding: 0 20px;
`

const HeroContent = styled(Flex)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  gap: 40px;
  
  @media (max-width: 992px) {
    flex-direction: column;
    text-align: center;
  }
`

const LeftContent = styled.div`
  flex: 1;
  max-width: 600px;
  
  @media (max-width: 992px) {
    max-width: 100%;
    order: 2;
  }
`

const RightContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
  position: relative;
  
  @media (max-width: 992px) {
    width: 100%;
    justify-content: center;
    order: 1;
    margin-bottom: 40px;
  }
`

const HeadingContainer = styled.h1`
  font-size: 60px;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 24px;
  color: #14142B;
  
  @media (max-width: 1200px) {
    font-size: 48px;
  }
  
  @media (max-width: 768px) {
    font-size: 36px;
  }
`

const GradientWord = styled.span`
  background: linear-gradient(90deg, #025A3A 0%, #7465CE 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  display: inline-block;
`

const HighlightSpan = styled.span`
  position: relative;
  color: #FF3D00;
  display: inline-block;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 8px;
    left: 0;
    width: 100%;
    height: 8px;
    background-color: rgba(255, 61, 0, 0.2);
    z-index: -1;
    border-radius: 4px;
  }
`

const SubtitleText = styled(Text)`
  font-size: 18px;
  line-height: 1.6;
  color: #4E4B66;
  margin-bottom: 32px;
  max-width: 550px;
  
  @media (max-width: 992px) {
    margin-left: auto;
    margin-right: auto;
  }
`

const ButtonGroup = styled(Group)`
  margin-bottom: 48px;
  
  @media (max-width: 992px) {
    justify-content: center;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
`

const PrimaryButton = styled(Button)`
  height: 3rem;
  background: linear-gradient(90deg, #025A3A 0%, #056348 100%);
  color: white;
  width: auto;
  min-width: 180px;
  padding: 0 36px;
  border-radius: 46px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(2, 90, 58, 0.15);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 25px rgba(2, 90, 58, 0.2);
    background: linear-gradient(90deg, #025A3A 0%, #037556 100%);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 5px 15px rgba(2, 90, 58, 0.15);
  }
`

const SecondaryButton = styled(Button)`
  height: 3rem;
  background: transparent;
  color: #025A3A;
  width: auto;
  min-width: 180px;
  padding: 0 36px;
  border-radius: 46px;
  border: 2px solid #025A3A;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(2, 90, 58, 0.02);
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(2, 90, 58, 0.1);
    color: #025A3A;
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: none;
  }
`

const StatsContainer = styled(Flex)`
  display: flex;
  align-items: center;
  
  @media (max-width: 992px) {
    justify-content: center;
  }
`

const StatBox = styled.div`
  position: relative;
  padding: 0 20px;
`

const StatValue = styled.div`
  font-size: 48px;
  font-weight: 800;
  color: #7465CE;
  line-height: 1;
  margin-bottom: 8px;
  
  @media (max-width: 768px) {
    font-size: 36px;
  }
`

const StatLabel = styled.div`
  font-size: 16px;
  color: #4E4B66;
  font-weight: 500;
`

const StatIndicator = styled.div`
  position: absolute;
  bottom: -8px;
  left: 20px;
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, #7465CE 0%, #025A3A 100%);
  border-radius: 2px;
`

const StatDivider = styled.div`
  width: 1px;
  height: 60px;
  background-color: rgba(78, 75, 102, 0.2);
  margin: 0 30px;
`

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 500px;
  
  @media (max-width: 1200px) {
    height: 450px;
  }
  
  @media (max-width: 992px) {
    height: 400px;
    width: 90%;
    max-width: 500px;
  }
`

const MainImageWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 80%;
  height: 80%;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  transition: transform 0.5s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`

const MainImage = styled(Image)`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const SecondaryImageWrapper = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50%;
  height: 60%;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  z-index: 2;
  transition: transform 0.5s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`

const SecondaryImage = styled(Image)`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const ImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${(props) =>
    props.secondary
      ? "linear-gradient(135deg, rgba(116, 101, 206, 0.2) 0%, rgba(2, 90, 58, 0.2) 100%)"
      : "linear-gradient(135deg, rgba(2, 90, 58, 0.2) 0%, rgba(116, 101, 206, 0.2) 100%)"};
  z-index: 1;
`

const FloatingCard = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  z-index: 3;
  animation: float 3s ease-in-out infinite;
  
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
`

const FloatingCardContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const FloatingCardIcon = styled.div`
  font-size: 24px;
`

const FloatingCardText = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #14142B;
`

const ScrollIndicator = styled.div`
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 1;
  transition: opacity 0.3s ease;
`

const ScrollText = styled.div`
  font-size: 14px;
  color: #4E4B66;
  margin-bottom: 8px;
`

const ScrollArrow = styled.div`
  font-size: 20px;
  color: #025A3A;
  animation: bounce 2s infinite;
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-10px); }
    60% { transform: translateY(-5px); }
  }
`
