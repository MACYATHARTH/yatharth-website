"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
import { Event } from "@/lib/data/types";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

interface HorizontalEventsRailProps {
  events: Event[];
}

export function HorizontalEventsRail({ events }: HorizontalEventsRailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024 && !reducedMotion);
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, [reducedMotion]);

  useEffect(() => {
    if (!isDesktop) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!containerRef.current || !trackRef.current) {
            ticking = false;
            return;
          }

          const rect = containerRef.current.getBoundingClientRect();
          const totalDist = containerRef.current.offsetHeight - window.innerHeight;

          if (totalDist > 0) {
            const current = -rect.top;
            // Strictly clamp progress between 0 and 1 (strictly finite)
            const p = Math.max(0, Math.min(1, current / totalDist));
            setProgress(p);

            const maxTranslate = Math.max(
              0,
              trackRef.current.scrollWidth - window.innerWidth + 120
            );
            trackRef.current.style.transform = `translate3d(-${p * maxTranslate}px, 0, 0)`;

            const currentEvent = Math.min(
              events.length - 1,
              Math.floor(p * events.length)
            );
            setActiveIndex(currentEvent);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDesktop, events.length]);

  return (
    <div
      id="events-rail"
      ref={containerRef}
      className={
        isDesktop
          ? "relative min-h-[280vh] bg-[#0B0A09] text-[#E9E6DF]"
          : "relative py-24 px-4 sm:px-8 bg-[#0B0A09] text-[#E9E6DF] border-t border-[#FAF6EE]/10"
      }
    >
      <div
        className={
          isDesktop
            ? "sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between py-10 px-6 sm:px-10 lg:px-14 select-none"
            : "space-y-12 max-w-4xl mx-auto"
        }
      >
        {/* Header Ribbon — Clean typography, no clutter */}
        <div className="w-full flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[#FAF6EE]/10 pb-5">
          <div>
            <div className="font-mono text-xs text-[#8B1E2D] font-bold uppercase tracking-[0.25em] mb-1">
              [ 02 / COMPETITIVE ARENA ]
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#FAF6EE] tracking-tight uppercase">
              Featured Showcases
            </h2>
          </div>

          <div className="flex items-center gap-6 font-mono text-xs text-[#A3B1C6] tracking-wider uppercase">
            <div>
              <span>ENTRY:</span>{" "}
              <span className="text-[#FAF6EE] font-bold">
                {String(activeIndex + 1).padStart(2, "0")}
              </span>
              <span className="text-[#8B1E2D]"> / </span>
              <span>{String(events.length).padStart(2, "0")}</span>
            </div>

            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 text-[#FAF6EE] hover:text-[#FAF6EE]/80 transition-colors group"
            >
              <span>All Events</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Free-Standing Visual Poster Sequence (Strictly Finite) */}
        <div
          className={
            isDesktop
              ? "w-full overflow-hidden my-auto py-2"
              : "w-full space-y-10"
          }
        >
          <div
            ref={trackRef}
            className={
              isDesktop
                ? "flex items-center gap-12 pl-2 will-change-transform"
                : "flex flex-col gap-10"
            }
          >
            {events.map((event, idx) => {
              const isCurrent = idx === activeIndex;

              return (
                <div
                  key={event.id}
                  className={
                    isDesktop
                      ? "w-[360px] lg:w-[420px] shrink-0"
                      : "w-full"
                  }
                >
                  {/* Free-standing Visual Object with Minimal Framing */}
                  <Link
                    href={`/events/${event.slug}`}
                    className={`group block relative bg-[#0E1838] border transition-all duration-300 ${
                      isCurrent && isDesktop
                        ? "border-[#FAF6EE]/40 shadow-2xl scale-[1.01]"
                        : "border-[#FAF6EE]/10 hover:border-[#8B1E2D]"
                    }`}
                  >
                    {/* Free-standing Portrait Frame (Aspect 3:4) */}
                    <div className="aspect-[3/4] p-7 sm:p-8 flex flex-col justify-between relative overflow-hidden">
                      {/* Watermark Index */}
                      <div
                        aria-hidden="true"
                        className="absolute -right-3 -bottom-5 text-8xl font-black font-mono text-[#FAF6EE]/[0.03] select-none pointer-events-none"
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </div>

                      {/* Top Metadata: Category without loud badges */}
                      <div className="relative z-10 flex items-center justify-between">
                        <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#8B1E2D] font-bold">
                          [ {event.category} ]
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-[#A3B1C6]">
                          {event.registrationStatus === "OPEN" ? "● OPEN" : "CLOSED"}
                        </span>
                      </div>

                      {/* Center Content: Dominant Title & Narrative */}
                      <div className="relative z-10 my-auto py-6">
                        <h3 className="text-2xl sm:text-3xl font-black text-[#FAF6EE] group-hover:text-white transition-colors uppercase tracking-tight leading-snug">
                          {event.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#A3B1C6] mt-4 line-clamp-3 leading-relaxed font-sans font-normal">
                          {event.shortDescription}
                        </p>
                      </div>

                      {/* Bottom Footer: Authoritative Prize / Action */}
                      <div className="relative z-10 pt-4 border-t border-[#FAF6EE]/10 flex items-center justify-between">
                        {event.prizes && event.prizes.length > 0 ? (
                          <div className="flex items-center gap-1.5 font-mono text-xs text-[#FAF6EE]/80">
                            <Trophy className="w-3.5 h-3.5 text-[#8B1E2D] shrink-0" />
                            <span className="truncate max-w-[200px]">
                              {event.prizes[0].split(":")[1]?.trim() || event.prizes[0]}
                            </span>
                          </div>
                        ) : (
                          <span className="font-mono text-xs text-[#A3B1C6]">
                            Department Citation
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-[#FAF6EE] group-hover:text-[#8B1E2D] transition-colors">
                          <span>Enter</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Progress Bar — Burgundy indicator for finite track */}
        {isDesktop && (
          <div className="w-full flex flex-col gap-2 pt-4 border-t border-[#FAF6EE]/10">
            <div className="w-full flex items-center justify-between font-mono text-[11px] tracking-[0.2em] text-[#A3B1C6] uppercase">
              <span>ARENA TRACK</span>
              <span>
                {activeIndex + 1 === events.length && progress > 0.95
                  ? "END OF ARENA"
                  : `${Math.round(progress * 100)}% COMPLETE`}
              </span>
            </div>
            {/* Fine hairline track with burgundy active progress */}
            <div className="w-full h-0.5 bg-[#FAF6EE]/10 overflow-hidden">
              <div
                className="h-full bg-[#8B1E2D] transition-all duration-75"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
