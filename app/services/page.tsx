// "use client";

// import Image from "next/image";
// import React, {
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";
// import styles from "./styles.module.css";
// import Navbar from "@/components/navbar";

// type Service = {
//   id: string;
//   title: React.ReactNode;
//   subtitle?: string;
//   points?: React.ReactNode[];
//   color?: string;
//   media?: string;
//   video?: string;
// };

// const servicesData: Service[] = [
//   {
//     id: "video-intro",
//     title: "Welcome to Kuepass",
//     video: "/videos/kuepass.mp4", // Update this path to your actual video
//   },
//   {
//     id: "digital-ticketing",
//     title: (
//       <>
//         <span className={styles.cardTitleHighlight}>Digital</span> Ticketing
//       </>
//     ),
//     points: [
//       <>
//         <span className={styles.cardPointHighlight}>QR Code Tickets:</span>
//         {" Generate unique, scannable digital tickets for secure entry."}
//       </>,
//       <>
//         <span className={styles.cardPointHighlight}>
//           Multiple Ticket Types:
//         </span>
//         {" Support for VIP, regular, early bird, and group ticket categories."}
//       </>,
//       <>
//         <span className={styles.cardPointHighlight}>Fraud Prevention:</span>
//         {
//           " Tickets are single-use and validated in real time to block duplication."
//         }
//       </>,
//       <>
//         <span className={styles.cardPointHighlight}>Instant Delivery:</span>
//         {" Tickets are delivered instantly via email, SMS, or WhatsApp."}
//       </>,
//     ],
//     color: "#DDFCE7",
//     media: "/images/seerviceImage.png",
//   },
//   {
//     id: "check-in",
//     title: "Entry Validation & Check-in",
//     points: [
//       <>
//         <span className={styles.cardPointHighlight}>Real-time Scanning:</span>
//         {" Use mobile or desktop scanners to validate tickets instantly."}
//       </>,
//       <>
//         <span className={styles.cardPointHighlight}>Faster Entry:</span>
//         {" Reduce queues with 40% faster entry times."}
//       </>,
//       <>
//         <span className={styles.cardPointHighlight}>Analytics:</span>
//         {" Track entry flow and attendance trends in real time."}
//       </>,
//     ],
//     color: "#FFE7CC",
//     media: "/images/serviceImage1.png",
//   },
// ];

// const ServicesPage: React.FC = () => {
//   const [activeId, setActiveId] = useState<string>(servicesData[0].id);
//   const sidebar = useMemo(
//     () => servicesData.map((s) => ({ id: s.id, title: s.title })),
//     []
//   );
//   const mainColRef = useRef<HTMLDivElement | null>(null);
//   const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

//   const registerCardRef = useCallback(
//     (id: string) => (element: HTMLDivElement | null) => {
//       cardRefs.current[id] = element;
//     },
//     []
//   );

//   const handleSidebarClick = useCallback(
//     (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
//       event.preventDefault();
//       const element = cardRefs.current[id];
//       if (element) {
//         element.scrollIntoView({ behavior: "smooth", block: "start" });
//       }
//       setActiveId(id);
//     },
//     []
//   );

//   useEffect(() => {
//     const root = mainColRef.current;
//     if (!root) {
//       return;
//     }

//     const observer = new IntersectionObserver(
//       (entries) => {
//         const intersecting = entries
//           .filter((entry) => entry.isIntersecting)
//           .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

//         const fallback = entries
//           .slice()
//           .sort(
//             (a, b) =>
//               Math.abs(a.boundingClientRect.top) -
//               Math.abs(b.boundingClientRect.top)
//           );

//         const targetEntry = intersecting[0] ?? fallback[0];

//         if (!targetEntry) {
//           return;
//         }

//         const nextActiveId = targetEntry.target.id;
//         setActiveId((current) =>
//           current === nextActiveId ? current : nextActiveId
//         );
//       },
//       {
//         root,
//         rootMargin: "-30% 0px -50% 0px",
//         threshold: [0, 0.25, 0.5, 0.75, 1],
//       }
//     );

//     const observedElements = new Set<HTMLDivElement>();

//     const observeElements = () => {
//       const elements = Object.values(cardRefs.current).filter(
//         (element): element is HTMLDivElement => Boolean(element)
//       );

//       elements.forEach((element) => {
//         if (!observedElements.has(element)) {
//           observer.observe(element);
//           observedElements.add(element);
//         }
//       });
//     };

//     observeElements();
//     const rafId = requestAnimationFrame(observeElements);

//     return () => {
//       observedElements.forEach((element) => observer.unobserve(element));
//       observer.disconnect();
//       cancelAnimationFrame(rafId);
//     };
//   }, []);

//   return (
//     <div className={styles.pageWrapper}>
//       <Navbar />
//       <div className={styles.container}>
//         <div className={styles.contentRow}>
//           <div className={styles.sidebarCol}>
//             <div className={styles.sidebar}>
//               <div className={styles.sidebarHeading}>Overview</div>
//               {sidebar.map((item) => (
//                 <a
//                   key={item.id}
//                   href={`#${item.id}`}
//                   onClick={(event) => handleSidebarClick(event, item.id)}
//                   className={`${styles.sidebarLink} ${
//                     activeId === item.id ? styles.sidebarLinkActive : ""
//                   }`}
//                 >
//                   {item.title}
//                 </a>
//               ))}
//             </div>
//           </div>

//           <div className={styles.mainCol} ref={mainColRef}>
//             <div className={styles.cardsStack}>
//               {servicesData.map((service) => (
//                 <div
//                   id={service.id}
//                   key={service.id}
//                   className={`${styles.card} ${
//                     service.video ? styles.videoCard : ""
//                   }`}
//                   ref={registerCardRef(service.id)}
//                 >
//                   {!service.video && (
//                     <div className={styles.cardHeader}>
//                       <h3 className={styles.cardTitle}>{service.title}</h3>
//                     </div>
//                   )}
//                   <div className={styles.cardBody}>
//                     {service.video ? (
//                       <div
//                         className={styles.cardMedia}
//                         style={{
//                           backgroundColor: service.color || "transparent",
//                         }}
//                       >
//                         <video
//                           src={service.video}
//                           controls
//                           autoPlay
//                           loop
//                           muted
//                           className={styles.cardMediaVideo}
//                         >
//                           Your browser does not support the video tag.
//                         </video>
//                       </div>
//                     ) : (
//                       <>
//                         {service.points && (
//                           <div className={styles.cardText}>
//                             {service.points.map((point, index) => (
//                               <p
//                                 key={`${service.id}-point-${index}`}
//                                 className={styles.cardPoint}
//                               >
//                                 {point}
//                               </p>
//                             ))}
//                           </div>
//                         )}
//                         {service.media && (
//                           <div
//                             className={styles.cardMedia}
//                             style={{ backgroundColor: service.color }}
//                           >
//                             <Image
//                               src={service.media}
//                               alt={`${service.id}-media`}
//                               width={800}
//                               height={450}
//                               className={styles.cardMediaImage}
//                             />
//                           </div>
//                         )}
//                       </>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ServicesPage;

"use client";

import Image from "next/image";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./styles.module.css";
import { useIsMobile } from "@/hooks/use-mobile";
import Navbar from "@/components/navbar";

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

  useEffect(() => {
    const root = mainColRef.current;
    if (!root) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        const fallback = entries
          .slice()
          .sort(
            (a, b) =>
              Math.abs(a.boundingClientRect.top) -
              Math.abs(b.boundingClientRect.top)
          );

        const targetEntry = intersecting[0] ?? fallback[0];

        if (!targetEntry) {
          return;
        }

        const nextActiveId = targetEntry.target.id;
        setActiveId((current) =>
          current === nextActiveId ? current : nextActiveId
        );
      },
      {
        root,
        rootMargin: "-30% 0px -50% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    const observedElements = new Set<HTMLDivElement>();

    const observeElements = () => {
      const elements = Object.values(cardRefs.current).filter(
        (element): element is HTMLDivElement => Boolean(element)
      );

      elements.forEach((element) => {
        if (!observedElements.has(element)) {
          observer.observe(element);
          observedElements.add(element);
        }
      });
    };

    observeElements();
    const rafId = requestAnimationFrame(observeElements);

    return () => {
      observedElements.forEach((element) => observer.unobserve(element));
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, []);

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
