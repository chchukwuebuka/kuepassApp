"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import styles from "./TextReveal.module.css";

gsap.registerPlugin(ScrollTrigger, SplitText);

interface TextRevealProps {
  children: React.ReactNode; 
  colorInitial?: string;
  colorAccent?: string;
  colorFinal?: string;
}

export default function AnimatedCopy({
  children,
  colorInitial = "#9ca3af", // light gray default
  colorAccent = "#F5B645",  // Kuepass brand yellow
  colorFinal = "#181717",   // dark text
}: TextRevealProps) {
  const containerRef = useRef<HTMLElement>(null);
  const splitRefs = useRef<{ wordSplit: SplitText; charSplit: SplitText }[]>([]);
  const lastScrollProgress = useRef(0);
  const colorTransitionTimers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const completedChars = useRef(new Set<number>());

  useGSAP(
    () => {
      if (!containerRef.current) return;

      splitRefs.current = [];
      lastScrollProgress.current = 0;
      colorTransitionTimers.current.clear();
      completedChars.current.clear();

      let elements: HTMLElement[] = [];
      if (containerRef.current.hasAttribute("data-copy-wrapper")) {
        elements = Array.from(containerRef.current.children) as HTMLElement[];
      } else {
        elements = [containerRef.current];
      }

      elements.forEach((element) => {
        const wordSplit = new SplitText(element, {
          type: "words",
          wordsClass: styles.word,
        });

        const charSplit = new SplitText(wordSplit.words, {
          type: "chars",
          charsClass: styles.char,
        });

        splitRefs.current.push({ wordSplit, charSplit });
      });

      const allChars = splitRefs.current.flatMap(
        ({ charSplit }) => charSplit.chars
      ) as HTMLElement[];

      gsap.set(allChars, { color: colorInitial });

      const scheduleFinalTransition = (char: HTMLElement, index: number) => {
        if (colorTransitionTimers.current.has(index)) {
          clearTimeout(colorTransitionTimers.current.get(index)!);
        }

        const timer = setTimeout(() => {
          if (!completedChars.current.has(index)) {
            gsap.to(char, {
              duration: 0.1,
              ease: "none",
              color: colorFinal,
              onComplete: () => {
                completedChars.current.add(index);
              },
            });
          }
          colorTransitionTimers.current.delete(index);
        }, 100);

        colorTransitionTimers.current.set(index, timer);
      };

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top 85%",
        end: "bottom center",
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          const totalChars = allChars.length;
          const isScrollingDown = progress >= lastScrollProgress.current;
          const currentCharIndex = Math.floor(progress * totalChars);

          allChars.forEach((char, index) => {
            if (!isScrollingDown && index >= currentCharIndex) {
              if (colorTransitionTimers.current.has(index)) {
                clearTimeout(colorTransitionTimers.current.get(index)!);
                colorTransitionTimers.current.delete(index);
              }
              completedChars.current.delete(index);
              gsap.set(char, { color: colorInitial });
              return;
            }

            if (completedChars.current.has(index)) {
              return;
            }

            if (index <= currentCharIndex) {
              gsap.set(char, { color: colorAccent });
              if (!colorTransitionTimers.current.has(index)) {
                scheduleFinalTransition(char, index);
              }
            } else {
              gsap.set(char, { color: colorInitial });
            }
          });

          lastScrollProgress.current = progress;
        },
      });

      return () => {
        colorTransitionTimers.current.forEach((timer) => clearTimeout(timer));
        colorTransitionTimers.current.clear();
        completedChars.current.clear();

        splitRefs.current.forEach(({ wordSplit, charSplit }) => {
          if (charSplit) charSplit.revert();
          if (wordSplit) wordSplit.revert();
        });
      };
    },
    {
      scope: containerRef,
      dependencies: [colorInitial, colorAccent, colorFinal],
    }
  );

  if (React.Children.count(children) === 1 && React.isValidElement(children)) {
    // @ts-ignore
    return React.cloneElement(children, { ref: containerRef });
  }

  return (
    <div ref={containerRef as React.RefObject<HTMLDivElement>} data-copy-wrapper="true">
      {children}
    </div>
  );
}
