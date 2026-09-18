"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Event } from "@/lib/data/types";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

interface EventsVisualRibbonProps {
  events: Event[];
}

export function EventsVisualRibbon({ events }: EventsVisualRibbonProps) {
  const reducedMotion = usePrefersReducedMotion();

  if (!events || events.length === 0) {
    return null;
  }

  // Ensure base sequence has at least 12 items (>=4100px) so one half covers any screen width
  // This completely eliminates the right-side gap before the loop resets
  let baseEvents = [...events];
  while (baseEvents.length < 12) {
    baseEvents = [...baseEvents, ...events];
  }
  // Two identical halves for a 100% seamless mathematical infinite loop
  const repeatedEvents = [...baseEvents, ...baseEvents];

  return (
    <section
      id="events-ribbon"
      className="relative w-full py-20 sm:py-28 overflow-hidden select-none bg-transparent text-[var(--theme-text-primary)] border-t border-[var(--theme-border)]"
      aria-label="Festival Events Ribbon"
    >
      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-14 mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-[var(--theme-accent)] font-semibold mb-2">
            Events
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--theme-text-primary)] tracking-tight uppercase font-varsity">
            Competitions
          </h2>
        </div>

        <div className="flex items-center gap-6 text-xs text-[var(--theme-text-muted)] uppercase tracking-wider">
          <span>{events.length} Events</span>
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-[var(--theme-text-primary)] hover:text-[var(--theme-accent)] transition-colors group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Autonomous Horizontal Marquee Ribbon */}
      <div className="w-full overflow-hidden">
        {reducedMotion ? (
          /* Accessible static / scrollable strip when reduced motion is requested */
          <div className="flex items-center gap-6 px-4 sm:px-8 overflow-x-auto scrollbar-none pb-4">
            {events.map((event, idx) => (
              <EventCard key={`static-${event.id}-${idx}`} event={event} />
            ))}
          </div>
        ) : (
          /* Autonomous continuous CSS infinite loop (independent of page scroll) */
          <div className="flex w-max animate-marquee-events py-2">
            {repeatedEvents.map((event, idx) => (
              <div key={`ribbon-${event.id}-${idx}`} className="shrink-0 px-3">
                <EventCard event={event} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function EventCard({ event }: { event: Event }) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className="group block w-[260px] sm:w-[320px] aspect-[3/4] relative overflow-hidden rounded-xs border border-[var(--theme-border)] shadow-xl hover:border-[var(--theme-accent)] transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl bg-[var(--theme-surface)]"
      title={event.title}
      aria-label={`View competition details for ${event.title}`}
    >
      {event.posterUrl ? (
        <Image
          src={event.posterUrl}
          alt={event.title}
          fill
          sizes="(max-width: 640px) 260px, 320px"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[var(--theme-surface)] to-[var(--theme-surface-secondary)]">
          <span className="font-mono text-xs text-[var(--theme-accent)] uppercase tracking-widest mb-2 font-bold">
            {event.category}
          </span>
          <span className="font-varsity text-xl text-[var(--theme-text-primary)] uppercase tracking-wider">
            {event.title}
          </span>
        </div>
      )}
    </Link>
  );
}
