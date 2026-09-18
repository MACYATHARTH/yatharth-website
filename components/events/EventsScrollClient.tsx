"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ExternalLink,
  Award,
  MapPin,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Layers,
} from "lucide-react";
import { Event } from "@/lib/data/types";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

interface EventsScrollClientProps {
  initialEvents: Event[];
}

export function EventsScrollClient({ initialEvents }: EventsScrollClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [activeIndex, setActiveIndex] = useState(0);
  const reducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Dynamic list of categories from events
  const categories = useMemo(() => {
    const cats = new Set(initialEvents.map((e) => e.category));
    return ["ALL", ...Array.from(cats)];
  }, [initialEvents]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return initialEvents.filter((event) => {
      if (selectedCategory !== "ALL" && event.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = event.title.toLowerCase().includes(q);
        const matchDesc = event.shortDescription.toLowerCase().includes(q);
        const matchCat = event.category.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCat) return false;
      }
      return true;
    });
  }, [initialEvents, selectedCategory, searchQuery]);

  // Derive safeActiveIndex without needing an effect
  const safeActiveIndex = Math.min(activeIndex, Math.max(0, filteredEvents.length - 1));

  // Handle Desktop scroll-actuated horizontal movement
  const handleScroll = useCallback(() => {
    if (reducedMotion || !containerRef.current || filteredEvents.length <= 1) return;
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Determine how far through the container the user has scrolled
    const totalScrollable = container.offsetHeight - windowHeight;
    if (totalScrollable <= 0) return;

    const currentScroll = -rect.top;
    const progress = Math.min(1, Math.max(0, currentScroll / totalScrollable));

    const nextIndex = Math.min(
      filteredEvents.length - 1,
      Math.floor(progress * filteredEvents.length)
    );

    setActiveIndex(nextIndex);
  }, [reducedMotion, filteredEvents.length]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Active event object
  const activeEvent = filteredEvents[safeActiveIndex] || filteredEvents[0];

  // Manual step navigation
  const goToNext = () => {
    setActiveIndex((prev) => Math.min(filteredEvents.length - 1, prev + 1));
  };
  const goToPrev = () => {
    setActiveIndex((prev) => Math.max(0, prev - 1));
  };

  if (filteredEvents.length === 0) {
    return (
      <div className="py-20 text-center space-y-4 border border-[var(--theme-border)] p-12 bg-[var(--theme-surface)]/80 backdrop-blur-md">
        <p className="text-lg font-mono text-[var(--theme-text-primary)]">
          No competitions match &ldquo;{searchQuery}&rdquo;.
        </p>
        <button
          type="button"
          onClick={() => {
            setSearchQuery("");
            setSelectedCategory("ALL");
          }}
          className="btn-ghost"
        >
          Reset Filters
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* ─── CONTROLS BAR: Search & Category Filter ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[var(--theme-border)] pb-6">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategory(cat);
                setActiveIndex(0);
              }}
              className={`text-xs font-mono uppercase tracking-[0.15em] px-3.5 py-1.5 rounded-sm transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[var(--theme-text-primary)] text-[var(--theme-background)] font-bold"
                  : "bg-[var(--theme-surface-secondary)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] border border-[var(--theme-border)]"
              }`}
            >
              [{cat === "ALL" ? "ALL COMPETITIONS" : cat}]
            </button>
          ))}
        </div>

        {/* Search & Counter */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[var(--theme-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActiveIndex(0);
              }}
              placeholder="Search events..."
              className="pl-9 pr-4 py-1.5 bg-[var(--theme-surface-secondary)]/40 border border-[var(--theme-border)] rounded-sm text-xs text-[var(--theme-text-primary)] placeholder-[var(--theme-text-muted)]/50 focus:outline-hidden focus:border-[var(--theme-text-primary)] font-mono w-48 sm:w-60"
            />
          </div>
          <span className="text-xs font-mono text-[var(--theme-text-muted)]">
            {filteredEvents.length} TOTAL
          </span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          DESKTOP POSTER-FIRST SCROLL-ACTUATED EXPERIENCE (Hidden on mobile)
          ══════════════════════════════════════════════════════════════ */}
      <div
        ref={containerRef}
        className="hidden lg:block relative"
        style={{
          // Allocate scrollable height so vertical scroll drives the progression
          minHeight: `${Math.max(120, filteredEvents.length * 40)}vh`,
        }}
      >
        <div className="sticky top-20 h-[80vh] flex flex-col justify-between py-4">
          {/* Top metadata strip */}
          <div className="flex items-center justify-between text-xs font-mono text-[var(--theme-text-muted)] border-b border-[var(--theme-border)] pb-3">
            <div className="flex items-center gap-3">
              <span className="text-[var(--theme-text-primary)] font-bold">
                [ {String(activeIndex + 1).padStart(2, "0")} / {String(filteredEvents.length).padStart(2, "0")} ]
              </span>
              <span>&bull;</span>
              <span className="uppercase text-[var(--theme-text-muted)]">{activeEvent.category}</span>
            </div>

            {/* Stepper buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToPrev}
                disabled={safeActiveIndex === 0}
                aria-label="Previous Event"
                className="w-8 h-8 rounded-sm bg-[var(--theme-surface-secondary)] border border-[var(--theme-border)] hover:border-[var(--theme-text-primary)]/40 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={goToNext}
                disabled={safeActiveIndex === filteredEvents.length - 1}
                aria-label="Next Event"
                className="w-8 h-8 rounded-sm bg-[var(--theme-surface-secondary)] border border-[var(--theme-border)] hover:border-[var(--theme-text-primary)]/40 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main stage: Active Event Details (Left) + Horizontal Poster Carousel (Right) */}
          <div className="grid grid-cols-12 gap-8 items-center flex-1 my-6 overflow-hidden">
            {/* Left: Active Event Progressive Information */}
            <div className="col-span-5 space-y-5 pr-4 flex flex-col justify-center">
              <div>
                <span
                  className={`inline-block text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-[2px] tracking-widest border mb-3 ${
                    activeEvent.registrationStatus === "OPEN"
                      ? "text-[var(--theme-text-primary)] border-[var(--theme-cta)]/50 bg-[var(--theme-cta)]/20"
                      : "text-[var(--theme-text-muted)] border-[var(--theme-border)] bg-[var(--theme-surface-secondary)]"
                  }`}
                >
                  REGISTRATION {activeEvent.registrationStatus.replace("_", " ")}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[var(--theme-text-primary)] leading-tight tracking-tight">
                  {activeEvent.title}
                </h2>
              </div>

              <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed line-clamp-3">
                {activeEvent.shortDescription}
              </p>

              {/* Specification Grid */}
              <div className="space-y-2 text-xs font-mono border-t border-white/[0.08] pt-4 text-zinc-300">
                {activeEvent.prizes && activeEvent.prizes.length > 0 && (
                  <div className="flex items-center gap-2.5">
                    <Award className="w-4 h-4 text-[#8F3025] shrink-0" />
                    <span className="truncate">{activeEvent.prizes[0]}</span>
                  </div>
                )}
                {activeEvent.venue && (
                  <div className="flex items-center gap-2.5 text-zinc-400">
                    <MapPin className="w-4 h-4 text-zinc-500 shrink-0" />
                    <span>{activeEvent.venue.name}</span>
                  </div>
                )}
                {activeEvent.coordinators && activeEvent.coordinators.length > 0 && (
                  <div className="flex items-center gap-2.5 text-zinc-500 text-[11px]">
                    <Users className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      Desk:{" "}
                      {activeEvent.coordinators
                        .map(
                          (c) =>
                            c.person?.name ||
                            c.teamMember?.name ||
                            c.contactOverride?.split(":")[0] ||
                            "Coordinator"
                        )
                        .join(", ")}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/[0.08]">
                <Link
                  href={`/events/${activeEvent.slug}`}
                  className="btn-primary text-xs"
                >
                  <span>Rules &amp; Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                {activeEvent.registrationStatus === "OPEN" && activeEvent.registrationUrl && (
                  <a
                    href={activeEvent.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost text-xs"
                  >
                    <span>Register</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Right: Horizontal Event Posters Rail */}
            <div className="col-span-7 relative h-full flex items-center overflow-hidden">
              <div
                ref={trackRef}
                className="flex items-center gap-6 transition-transform duration-500 ease-out will-change-transform"
                style={{
                  transform: `translateX(-${safeActiveIndex * 320}px)`,
                }}
              >
                {filteredEvents.map((event, idx) => {
                  const isActive = idx === safeActiveIndex;
                  return (
                    <div
                      key={event.id}
                      onClick={() => setActiveIndex(idx)}
                      className={`w-[290px] shrink-0 cursor-pointer transition-all duration-500 select-none ${
                        isActive
                          ? "scale-100 opacity-100 ring-1 ring-white/30"
                          : "scale-95 opacity-40 hover:opacity-75"
                      }`}
                    >
                      {/* Portrait Poster (3:4 ratio) */}
                      <div className="aspect-[3/4] rounded-sm bg-[var(--theme-surface)] border border-[var(--theme-border)] overflow-hidden relative shadow-2xl flex flex-col justify-between p-6">
                        {/* Top tag */}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-[var(--theme-text-muted)] uppercase">
                            #{String(idx + 1).padStart(2, "0")}
                          </span>
                          <span className="text-[9px] font-mono text-[var(--theme-text-muted)] uppercase tracking-widest">
                            {event.participationType}
                          </span>
                        </div>

                        {/* Central artistic mark / poster placeholder */}
                        <div className="my-auto flex flex-col items-center text-center">
                          <div
                            className={`w-14 h-14 rounded-sm border flex items-center justify-center mb-3 transition-colors ${
                              isActive
                                ? "bg-[var(--theme-text-primary)] text-[var(--theme-background)] border-[var(--theme-text-primary)]"
                                : "bg-[var(--theme-surface-secondary)] text-[var(--theme-text-muted)] border-[var(--theme-border)]"
                            }`}
                          >
                            <Layers className="w-6 h-6" />
                          </div>
                          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
                            {event.category}
                          </span>
                        </div>

                        {/* Bottom title preview */}
                        <div>
                          <h3 className="text-base font-bold text-[var(--theme-text-primary)] leading-snug line-clamp-2">
                            {event.title}
                          </h3>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom metadata */}
          <div className="text-[11px] font-mono text-[var(--theme-text-muted)] flex items-center justify-end border-t border-[var(--theme-border)] pt-3">
            <span>PORTRAIT FORMAT &bull; {filteredEvents.length} COMPETITIONS</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MOBILE / TABLET VIEW: Vertical Portrait Poster Stack
          ══════════════════════════════════════════════════════════════ */}
      <div className="block lg:hidden space-y-10">
        {filteredEvents.map((event, idx) => (
          <div
            key={event.id}
            className="border border-[var(--theme-border)] bg-[var(--theme-surface)]/80 backdrop-blur-md rounded-sm overflow-hidden"
          >
            {/* Portrait Poster */}
            <div className="aspect-[3/4] bg-[var(--theme-surface-secondary)]/30 relative flex flex-col justify-between p-6 border-b border-[var(--theme-border)]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[var(--theme-text-muted)] uppercase tracking-widest">
                  [ {String(idx + 1).padStart(2, "0")} / {String(filteredEvents.length).padStart(2, "0")} ]
                </span>
                <span
                  className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded-[2px] border ${
                    event.registrationStatus === "OPEN"
                      ? "text-[var(--theme-text-primary)] border-[var(--theme-cta)]/50 bg-[var(--theme-cta)]/20"
                      : "text-[var(--theme-text-muted)] border-[var(--theme-border)] bg-[var(--theme-surface-secondary)]"
                  }`}
                >
                  {event.registrationStatus.replace("_", " ")}
                </span>
              </div>

              <div className="my-auto flex flex-col items-center text-center py-8">
                <div className="w-14 h-14 rounded-sm bg-[var(--theme-surface-secondary)] border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-text-primary)] mb-3">
                  <Layers className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
                  {event.category}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-[var(--theme-text-primary)] leading-tight">
                  {event.title}
                </h3>
              </div>
            </div>

            {/* Event Summary & Details */}
            <div className="p-5 space-y-4">
              <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed">
                {event.shortDescription}
              </p>

              <div className="space-y-2 text-xs font-mono text-[var(--theme-text-muted)] pt-3 border-t border-[var(--theme-border)]">
                {event.prizes && event.prizes.length > 0 && (
                  <div className="flex items-center gap-2 text-[var(--theme-text-primary)]">
                    <Award className="w-4 h-4 text-[var(--theme-cta)] shrink-0" />
                    <span>{event.prizes[0]}</span>
                  </div>
                )}
                {event.venue && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[var(--theme-text-muted)] shrink-0" />
                    <span>{event.venue.name}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[var(--theme-border)] flex items-center justify-between gap-3">
                <Link
                  href={`/events/${event.slug}`}
                  className="btn-primary text-xs flex-1 justify-center"
                >
                  <span>Rules &amp; Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                {event.registrationStatus === "OPEN" && event.registrationUrl && (
                  <a
                    href={event.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost text-xs"
                  >
                    <span>Register</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
