"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import { ScheduleEntry } from "@/lib/data/types";

interface SchedulePreviewSectionProps {
  entries: ScheduleEntry[];
}

export function SchedulePreviewSection({ entries }: SchedulePreviewSectionProps) {
  // Extract distinct day numbers present in the data
  const days = useMemo(() => {
    if (!entries || entries.length === 0) return [1, 2];
    const uniqueDays = Array.from(new Set(entries.map((e) => e.dayNumber))).sort((a, b) => a - b);
    return uniqueDays.length > 0 ? uniqueDays : [1, 2];
  }, [entries]);

  const [activeDay, setActiveDay] = useState<number>(days[0] || 1);

  const displayedEntries = useMemo(() => {
    if (!entries) return [];
    return entries.filter((e) => e.dayNumber === activeDay);
  }, [entries, activeDay]);

  return (
    <section
      id="schedule-section"
      className="relative w-full py-20 sm:py-28 px-4 sm:px-8 lg:px-14 bg-transparent text-[var(--theme-text-primary)] border-t border-[var(--theme-border)] select-none"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--theme-border)] pb-6 mb-10">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-[var(--theme-accent)] font-semibold mb-2">
              Schedule
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--theme-text-primary)] tracking-tight uppercase font-varsity">
              Festival Programme
            </h2>
          </div>

          <Link
            href="/schedule"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-colors group font-medium"
          >
            <span>Full Schedule</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[var(--theme-accent)]" />
          </Link>
        </div>

        {/* Day Selector Tabs */}
        <div className="flex items-center gap-3 mb-10">
          {days.map((day) => {
            const isActive = day === activeDay;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setActiveDay(day)}
                className={`px-6 py-2.5 text-xs uppercase tracking-[0.2em] transition-all cursor-pointer rounded-xs border font-medium ${
                  isActive
                    ? "bg-[var(--theme-accent)] text-white border-[var(--theme-accent)] shadow-md"
                    : "bg-[var(--theme-glass-bg)] backdrop-blur-md text-[var(--theme-text-muted)] border-[var(--theme-glass-border)] hover:border-[var(--theme-accent)] hover:text-[var(--theme-text-primary)]"
                }`}
              >
                Day {String(day).padStart(2, "0")}
              </button>
            );
          })}
        </div>

        {/* Spacious Programme Rows Floating Over Wallpaper */}
        <div className="w-full border-t border-[var(--theme-border)] divide-y divide-[var(--theme-border)]">
          {displayedEntries.length === 0 ? (
            <div className="py-16 text-center text-xs text-[var(--theme-text-muted)] uppercase tracking-wider">
              No sessions scheduled for Day {String(activeDay).padStart(2, "0")} yet.
            </div>
          ) : (
            displayedEntries.map((item) => {
              const eventTitle = item.title || (item.event ? item.event.title : "Special Session");
              const eventDesc = item.description || (item.event ? item.event.shortDescription : "");
              const venueName = item.venue ? item.venue.name : "Academic Complex";

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 py-6 sm:py-7 px-4 -mx-4 hover:bg-[var(--theme-surface)]/50 transition-colors items-center group"
                >
                  {/* Time Column */}
                  <div className="md:col-span-3 flex items-center gap-2.5 text-sm sm:text-base font-semibold text-[var(--theme-text-primary)]">
                    <Clock className="w-4 h-4 text-[var(--theme-accent)] shrink-0" />
                    <span>
                      {item.startTime} &ndash; {item.endTime}
                    </span>
                  </div>

                  {/* Event Title & Summary */}
                  <div className="md:col-span-6 space-y-1.5">
                    {item.event ? (
                      <Link
                        href={`/events/${item.event.slug}`}
                        className="font-bold text-base sm:text-lg text-[var(--theme-text-primary)] group-hover:text-[var(--theme-accent)] transition-colors inline-block"
                      >
                        {eventTitle}
                      </Link>
                    ) : (
                      <div className="font-bold text-base sm:text-lg text-[var(--theme-text-primary)] transition-colors">
                        {eventTitle}
                      </div>
                    )}
                    {eventDesc && (
                      <p className="text-xs text-[var(--theme-text-muted)] line-clamp-1 font-sans">
                        {eventDesc}
                      </p>
                    )}
                  </div>

                  {/* Venue Column */}
                  <div className="md:col-span-3 flex items-center md:justify-end gap-2 text-xs text-[var(--theme-text-muted)]">
                    <MapPin className="w-3.5 h-3.5 text-[var(--theme-accent)] shrink-0" />
                    <span className="truncate">{venueName}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Link */}
        <div className="mt-6 flex justify-end">
          <Link
            href="/schedule"
            className="font-mono text-xs uppercase tracking-wider text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-colors inline-flex items-center gap-1.5"
          >
            <span>View detailed Day 1 &amp; Day 2 itinerary</span>
            <ArrowRight className="w-3 h-3 text-[var(--theme-accent)]" />
          </Link>
        </div>
      </div>
    </section>
  );
}
