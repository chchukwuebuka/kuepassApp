"use client";

import Image from "next/image";
import type React from "react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import styles from "./styles.module.css";
import { useIsMobile } from "@/hooks/use-mobile";
import Navbar from "@/components/navbar";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Service = {
  id: string;
  title: React.ReactNode;
  subtitle?: string;
  points?: React.ReactNode[];
  color?: string;
  media?: string;
  video?: string;
};

const servicesData: Service[] = [
  {
    id: "video-intro",
    title: "Welcome to Kuepass",
    video: "/videos/kuepass1.mp4",
  },
  {
    id: "digital-ticketing",
    title: (
      <>
        <span className={styles.cardTitleHighlight}>Digital</span> Ticketing
      </>
    ),
    points: [
      <>
        <span key="qr-code-tickets" className={styles.cardPointHighlight}>
          QR Code Tickets:
        </span>{" "}
        Generate unique, scannable digital tickets for secure entry.
      </>,
      <>
        <span key="multiple-ticket-types" className={styles.cardPointHighlight}>
          Multiple Ticket Types:
        </span>{" "}
        Support for VIP, regular, early bird, and group ticket categories.
      </>,
      <>
        <span key="fraud-prevention" className={styles.cardPointHighlight}>
          Fraud Prevention:
        </span>{" "}
        Tickets are single-use and validated in real time to block duplication.
      </>,
      <>
        <span key="instant-delivery" className={styles.cardPointHighlight}>
          Instant Delivery:
        </span>{" "}
        Tickets are delivered instantly via email, SMS, or WhatsApp.
      </>,
    ],
    color: "#F5F5F5",
    media: "/images/seerviceImage.png",
  },
  {
    id: "check-in",
    title: "Entry Validation & Check-in",
    points: [
      <>
        <span key="real-time-scanning" className={styles.cardPointHighlight}>
          Real-time Scanning:
        </span>{" "}
        Use mobile or desktop scanners to validate tickets instantly.
      </>,
      <>
        <span key="faster-entry" className={styles.cardPointHighlight}>
          Faster Entry:
        </span>{" "}
        Reduce queues with 40% faster entry times.
      </>,
      <>
        <span key="analytics" className={styles.cardPointHighlight}>
          Analytics:
        </span>{" "}
        Track entry flow and attendance trends in real time.
      </>,
    ],
    color: "#F5F5F5",
    media: "/images/serviceImage1.png",
  },
];

const ServicesPage: React.FC = () => {
  const isMobile = useIsMobile();
  const [activeId, setActiveId] = useState<string>(servicesData[0].id);
  const sidebar = useMemo(
    () => servicesData.map((s) => ({ id: s.id, title: s.title })),
    []
  );
  const mainColRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const registerCardRef = useCallback(
    (id: string) => (element: HTMLDivElement | null) => {
      cardRefs.current[id] = element;
    },
    []
  );

  const handleSidebarClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      event.preventDefault();
      const element = cardRefs.current[id];
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      setActiveId(id);
    },
    []
  );

  // GSAP ScrollTrigger for sidebar sync
  useEffect(() => {
    const scroller = mainColRef.current;
    if (!scroller || isMobile) return;

    // Wait a tick for refs to populate
    const timer = setTimeout(() => {
      const triggers: ScrollTrigger[] = [];

      servicesData.forEach((service) => {
        const cardEl = cardRefs.current[service.id];
        if (!cardEl) return;

        const st = ScrollTrigger.create({
          trigger: cardEl,
          scroller: scroller,
          start: "top center",
          end: "bottom center",
          onToggle: (self) => {
            if (self.isActive) {
              setActiveId(service.id);
            }
          },
        });

        triggers.push(st);
      });

      // Also add card entrance animations
      servicesData.forEach((service) => {
        const cardEl = cardRefs.current[service.id];
        if (!cardEl) return;

        gsap.fromTo(
          cardEl,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: cardEl,
              scroller: scroller,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      return () => {
        triggers.forEach((t) => t.kill());
      };
    }, 100);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [isMobile]);

  return (
    <div className={styles.pageWrapper}>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.contentRow}>
          {!isMobile && (
            <div className={styles.sidebarCol}>
              <div className={styles.sidebar}>
                <div className={styles.sidebarHeading}>Overview</div>
                {sidebar.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(event) => handleSidebarClick(event, item.id)}
                    className={`${styles.sidebarLink} ${
                      activeId === item.id ? styles.sidebarLinkActive : ""
                    }`}
                  >
                    {item.title}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className={styles.mainCol} ref={mainColRef}>
            <div className={styles.cardsStack}>
              {servicesData.map((service) => (
                <div
                  id={service.id}
                  key={service.id}
                  className={`${styles.card} ${
                    service.video ? styles.videoCard : ""
                  }`}
                  ref={registerCardRef(service.id)}
                >
                  {!service.video && (
                    <div className={styles.cardHeader}>
                      <h3 className={styles.cardTitle}>{service.title}</h3>
                    </div>
                  )}
                  <div className={styles.cardBody}>
                    {service.video ? (
                      <div
                        className={styles.cardMedia}
                        style={{
                          backgroundColor: service.color || "transparent",
                        }}
                      >
                        <video
                          src={service.video}
                          controls
                          autoPlay
                          loop
                          muted
                          className={styles.cardMediaVideo}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    ) : (
                      <>
                        {service.points && (
                          <div className={styles.cardText}>
                            {service.points.map((point, index) => (
                              <p
                                key={`${service.id}-point-${index}`}
                                className={styles.cardPoint}
                              >
                                {point}
                              </p>
                            ))}
                          </div>
                        )}
                        {service.media && (
                          <div
                            className={styles.cardMedia}
                            style={{ backgroundColor: service.color }}
                          >
                            <Image
                              src={service.media || "/placeholder.svg"}
                              alt={`${service.id}-media`}
                              width={800}
                              height={450}
                              className={styles.cardMediaImage}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
