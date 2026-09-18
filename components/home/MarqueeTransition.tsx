"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

interface MarqueeTransitionProps {
  registrationUrl?: string;
}

export function MarqueeTransition({ registrationUrl = "/events" }: MarqueeTransitionProps) {
  const reducedMotion = usePrefersReducedMotion();
  const isExternal = registrationUrl.startsWith("http");

  // Single block of repeated items
  const itemsCount = 6;
  const renderItem = (key: number | string) => (
    <span
      key={key}
      className="inline-flex items-center gap-6 sm:gap-10 shrink-0 pr-6 sm:pr-10 text-3xl sm:text-5xl lg:text-6xl font-black font-varsity tracking-wider uppercase transition-colors"
    >
      <span>REGISTER NOW</span>
      <span className="opacity-40">&bull;</span>
    </span>
  );

  // Duplicating the identical track ensures 100% mathematical seamlessness with translate3d(-50%, 0, 0)
  const InnerContent = (
    <div className="flex w-max animate-marquee-cta py-1 items-center">
      <div className="flex items-center">
        {Array.from({ length: itemsCount }).map((_, i) => renderItem(`track1-${i}`))}
      </div>
      <div className="flex items-center">
        {Array.from({ length: itemsCount }).map((_, i) => renderItem(`track2-${i}`))}
      </div>
    </div>
  );

  const StaticContent = (
    <div className="w-full flex items-center justify-between px-6 py-4">
      <span className="text-2xl sm:text-4xl font-black font-varsity uppercase">
        REGISTER NOW FOR YATHARTH &apos;26
      </span>
      <span className="inline-flex items-center gap-2 text-xs font-bold font-mono uppercase tracking-wider">
        <span>Enter Registration</span>
        <ArrowRight className="w-4 h-4" />
      </span>
    </div>
  );

  const containerClasses =
    "group block relative w-full border-y border-[var(--theme-cta)] bg-[var(--theme-cta)] hover:bg-[var(--theme-cta-hover)] text-[var(--theme-cta-text)] backdrop-blur-md py-6 sm:py-8 overflow-hidden select-none transition-colors duration-300 cursor-pointer shadow-[0_4px_30px_rgba(0,0,0,0.25)]";

  if (isExternal) {
    return (
      <aside aria-label="Register Now Marquee">
        <a
          href={registrationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={containerClasses}
          title="Open Registration Destination"
        >
          {reducedMotion ? StaticContent : InnerContent}
        </a>
      </aside>
    );
  }

  return (
    <aside aria-label="Register Now Marquee">
      <Link href={registrationUrl} className={containerClasses} title="Register for Events">
        {reducedMotion ? StaticContent : InnerContent}
      </Link>
    </aside>
  );
}
