"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { YatharthLogo } from "@/components/brand/YatharthLogo";
import { Edition } from "@/lib/data/types";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

interface HeroCinematicProps {
  edition: Edition;
}

/**
 * HeroCinematic
 * 
 * Environmental Hero Experience:
 * - Large visual YATHARTH identity
 * - Strong negative space with wallpaper backdrop
 * - Minimal supporting context
 * - Direct REGISTER → CTA
 * - Continuous scroll-actuated transformation (subtle scale, translation, opacity fade)
 * - Respects prefers-reduced-motion
 */
export function HeroCinematic({ edition }: HeroCinematicProps) {
  const [scrollY, setScrollY] = useState(0);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate subtle scroll transformation values for hero
  const maxScroll = 600;
  const progress = Math.min(1, Math.max(0, scrollY / maxScroll));

  const opacity = reducedMotion ? 1 : Math.max(0, 1 - progress * 1.35);
  const translateY = reducedMotion ? 0 : progress * 80;
  const scale = reducedMotion ? 1 : 1 - progress * 0.04;

  return (
    <section className="relative min-h-screen flex flex-col justify-between px-4 sm:px-8 lg:px-12 pt-28 pb-12 overflow-hidden select-none">
      {/* Top whisper label */}
      <div className="w-full flex items-center justify-between text-[11px] font-mono tracking-[0.25em] text-zinc-500 uppercase">
        <span>[ ANNUAL NATIONAL FESTIVAL ]</span>
        <span className="hidden sm:inline">MAHARAJA AGRASEN COLLEGE &bull; DU</span>
      </div>

      {/* Centerpiece: Cinematic YATHARTH Identity */}
      <div
        className="my-auto flex flex-col items-center text-center will-change-transform"
        style={{
          opacity,
          transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
          transition: reducedMotion ? "none" : "opacity 0.1s ease-out",
        }}
      >
        <div className="mb-8">
          <YatharthLogo size="hero" />
        </div>

        {/* Minimal supporting festival statement */}
        <p className="text-xs sm:text-sm font-mono uppercase tracking-[0.25em] text-zinc-400 max-w-md mb-10 leading-relaxed">
          Department of Journalism
          <span className="block text-zinc-500 text-[11px] mt-1 tracking-[0.2em]">
            Voice &bull; Vision &bull; Veracity
          </span>
        </p>

        {/* Primary minimal CTA: REGISTER → */}
        <div>
          <Link
            href="/events"
            className="inline-flex items-center gap-3 px-8 py-3.5 bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-mono uppercase tracking-[0.2em] font-bold rounded-[2px] transition-all hover:gap-4 shadow-lg"
          >
            <span>Register</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Bottom status & scroll whisper */}
      <div className="w-full flex items-end justify-between text-[11px] font-mono tracking-[0.2em] text-zinc-500 uppercase border-t border-white/[0.08] pt-4">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8F3025] animate-pulse" />
          <span>
            {edition.isDateConfirmed
              ? `${edition.startDate ? new Date(edition.startDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "October 2026"}`
              : "DATES TO BE ANNOUNCED"}
          </span>
        </div>
      </div>
    </section>
  );
}
