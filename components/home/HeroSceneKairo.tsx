"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowDown } from "lucide-react";
import { Edition } from "@/lib/data/types";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { YatharthLogo } from "@/components/brand/YatharthLogo";
import { formatEditionBranding } from "@/lib/data/edition-branding";

interface HeroSceneKairoProps {
  edition: Edition;
  registrationUrl?: string;
}

export function HeroSceneKairo({ edition, registrationUrl = "/events" }: HeroSceneKairoProps) {
  const branding = formatEditionBranding(edition);
  const [scrollY, setScrollY] = useState(0);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const maxScroll = 600;
  const progress = Math.min(1, Math.max(0, scrollY / maxScroll));
  const opacity = reducedMotion ? 1 : Math.max(0, 1 - progress * 1.25);
  const translateY = reducedMotion ? 0 : progress * 50;
  const scale = reducedMotion ? 1 : Math.max(0.96, 1 - progress * 0.04);

  const isExternalReg = registrationUrl.startsWith("http");

  const dateDisplay = edition?.isDateConfirmed && edition?.startDate
    ? edition.endDate
      ? `${new Date(edition.startDate).toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
        })} – ${new Date(edition.endDate).toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`
      : new Date(edition.startDate).toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
    : "DATES TO BE ANNOUNCED";

  const themeTitle = (edition?.themeSettings?.themeTitle as string) || "Voice, Vision & Veracity";
  const collegeName = (edition?.themeSettings?.college as string) || "Maharaja Agrasen College, University of Delhi";
  const deptName = (edition?.themeSettings?.department as string) || "Department of Journalism";
  const logoUrl = (edition?.themeSettings?.logoUrl as string) || null;

  return (
    <section className="relative min-h-[92vh] sm:min-h-screen w-full flex flex-col justify-between px-4 sm:px-8 lg:px-14 pt-28 sm:pt-36 pb-12 overflow-hidden select-none bg-transparent text-[var(--theme-text-primary)]">
      {/* Subtle Atmosphere Depth Behind Hero */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(233,230,223,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(233,230,223,0.3) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
        aria-hidden="true"
      />

      {/* Top Subtle Ledger: Clean & Understated */}
      <div className="relative z-10 w-full flex items-center justify-between pt-2 pb-4">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-accent)]" />
          <span className="text-[11px] uppercase tracking-[0.2em] text-[var(--theme-text-muted)] font-medium">
            {branding.fullBranding} &bull; University of Delhi
          </span>
        </div>
        <div className="text-[11px] tracking-[0.2em] text-[var(--theme-text-muted)] uppercase text-right hidden sm:block">
          <span>{deptName}</span>
        </div>
      </div>

      {/* Center Hero Canvas: Cinematic Festival Composition */}
      <div
        className="relative z-10 my-auto py-12 sm:py-20 flex flex-col items-center text-center max-w-4xl mx-auto w-full will-change-transform"
        style={{
          opacity,
          transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
          transition: reducedMotion ? "none" : "opacity 0.1s ease-out",
        }}
      >
        {/* Supporting Fest Descriptor */}
        <div className="text-xs sm:text-sm tracking-[0.3em] text-[var(--theme-accent)] font-semibold uppercase mb-4">
          <span>{themeTitle}</span>
        </div>

        {/* 1. Replaceable Primary Festival Identity */}
        <div className="my-3 sm:my-6 transition-transform duration-300">
          <YatharthLogo
            size="hero"
            customLogoUrl={logoUrl}
            editionName={edition?.name}
            displayLabel={edition?.displayLabel}
          />
        </div>

        {/* 2. Festival Date Status: Clean Translucent Glass Badge */}
        <div className="mt-4 mb-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-xs border border-[var(--theme-glass-border)] bg-[var(--theme-glass-bg)] backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]">
            <span className="w-2 h-2 rounded-full bg-[var(--theme-accent)] animate-pulse" />
            <span className="text-xs sm:text-sm uppercase tracking-[0.2em] text-[var(--theme-text-primary)] font-medium">
              {dateDisplay}
            </span>
          </div>
        </div>

        {/* Institutional Attribution */}
        <p className="font-sans text-xs sm:text-sm text-[var(--theme-text-muted)] max-w-xl leading-relaxed tracking-wider mb-8">
          {deptName} &bull; {collegeName}
        </p>

        {/* 3. Register Now CTA & Anchor */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {isExternalReg ? (
            <a
              href={registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary group"
            >
              <span>Register Now</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </a>
          ) : (
            <Link
              href={registrationUrl}
              className="btn-primary group"
            >
              <span>Register Now</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}

          <a
            href="#events-ribbon"
            className="btn-ghost"
          >
            <span>Explore Events</span>
            <ArrowDown className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
