"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Calendar } from "lucide-react";
import { Edition } from "@/lib/data/types";
import { YatharthLogo } from "@/components/brand/YatharthLogo";

interface HeroCountdownProps {
  edition: Edition;
}

/**
 * HeroCountdown
 * 
 * Hierarchy (exact, per hand-drawn reference):
 *   YATHARTH LOGO
 *        ↓
 *   EVENT COUNTDOWN
 *        ↓
 *   REGISTER NOW
 * 
 * CRITICAL: EVENT COUNTDOWN and FESTIVAL DATE STATUS are DIFFERENT.
 * - Countdown UI is always present above Register Now
 * - When startDate exists, shows live countdown
 * - When startDate is null, shows placeholder dashes (-- : -- : -- : --)
 * - "DATES TO BE ANNOUNCED" is a SEPARATE label when !isDateConfirmed
 */
export function HeroCountdown({ edition }: HeroCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  const countdownTarget =
    edition.countdownTarget ||
    (edition.themeSettings?.eventCountdownTarget as string) ||
    edition.startDate;

  // Countdown timer — runs when countdown target date exists
  useEffect(() => {
    if (!countdownTarget) return;

    const targetDate = new Date(countdownTarget).getTime();
    if (isNaN(targetDate)) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [countdownTarget]);

  const countdownUnits = [
    { val: timeLeft?.days, label: "DAYS" },
    { val: timeLeft?.hours, label: "HRS" },
    { val: timeLeft?.minutes, label: "MIN" },
    { val: timeLeft?.seconds, label: "SEC" },
  ];

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center">
      {/* 1. YATHARTH LOGO — primary visual identity, generous negative space */}
      <div className="mb-12 sm:mb-16">
        <YatharthLogo size="hero" />
      </div>

      {/* 2. EVENT COUNTDOWN — always present above Register Now */}
      <div className="mb-8 sm:mb-10 w-full max-w-md">
        {/* Countdown digits */}
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          {countdownUnits.map((unit, i) => (
            <div key={unit.label} className="flex items-center gap-2 sm:gap-3">
              <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)]/80 backdrop-blur-md px-3 sm:px-5 py-3 sm:py-4 text-center min-w-[60px] sm:min-w-[76px]">
                <div className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[var(--theme-text-primary)] font-mono tabular-nums leading-none tracking-tight">
                  {unit.val !== undefined && unit.val !== null
                    ? String(unit.val).padStart(2, "0")
                    : "--"}
                </div>
                <div className="text-[9px] sm:text-[10px] uppercase text-[var(--theme-text-muted)] mt-2 tracking-[0.2em] font-mono font-medium">
                  {unit.label}
                </div>
              </div>
              {/* Colon separator (not after last) */}
              {i < countdownUnits.length - 1 && (
                <span className="text-lg sm:text-2xl md:text-3xl font-light text-[var(--theme-text-muted)]/60 font-mono select-none px-0.5">
                  :
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Festival date status — separate from countdown */}
        {!edition.isDateConfirmed && (
          <div className="mt-5 flex items-center justify-center">
            <span className="border border-[var(--theme-border)] bg-[var(--theme-surface)]/50 inline-flex items-center gap-2 px-3 py-1 text-[10px] sm:text-[11px] font-mono tracking-[0.2em] text-[var(--theme-text-muted)] uppercase">
              <Calendar className="w-3 h-3 text-[var(--theme-text-muted)]" />
              <span>Dates to be announced</span>
            </span>
          </div>
        )}
      </div>

      {/* 3. REGISTER NOW — primary CTA */}
      <Link
        href="/events"
        className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 text-xs font-mono uppercase tracking-wider group focus:outline-hidden"
      >
        <span>Register Now</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </Link>

      {/* Location whisper — bottom of hero */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-600">
          <MapPin className="w-3 h-3" />
          <span>Maharaja Agrasen College &bull; Vasundhara Enclave, Delhi</span>
        </div>
      </div>
    </section>
  );
}
