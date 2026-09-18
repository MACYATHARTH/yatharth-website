"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, Building, ChevronRight, Calendar } from "lucide-react";
import { ScheduleEntry } from "@/lib/data/types";

interface ScheduleTimelineClientProps {
  entries: ScheduleEntry[];
}

export function ScheduleTimelineClient({ entries }: ScheduleTimelineClientProps) {
  const [selectedDay, setSelectedDay] = useState<number | "ALL">("ALL");

  const filteredEntries = entries.filter((item) => {
    if (selectedDay === "ALL") return true;
    return item.dayNumber === selectedDay;
  });

  return (
    <div className="space-y-8">
      {/* Day Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border border-[var(--theme-border)] bg-[var(--theme-surface)] p-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[var(--theme-accent)]" />
          <span className="text-xs font-mono uppercase tracking-wider text-[var(--theme-text-muted)]">
            Agenda Filter:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedDay("ALL")}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer rounded-xs ${
              selectedDay === "ALL"
                ? "bg-[var(--theme-accent)] text-white font-bold"
                : "border border-[var(--theme-border)] bg-[var(--theme-surface-secondary)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] hover:border-[var(--theme-accent)]"
            }`}
          >
            All Days
          </button>
          <button
            type="button"
            onClick={() => setSelectedDay(1)}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer rounded-xs ${
              selectedDay === 1
                ? "bg-[var(--theme-accent)] text-white font-bold"
                : "border border-[var(--theme-border)] bg-[var(--theme-surface-secondary)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] hover:border-[var(--theme-accent)]"
            }`}
          >
            Day 1 (Inauguration &amp; Prelims)
          </button>
          <button
            type="button"
            onClick={() => setSelectedDay(2)}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer rounded-xs ${
              selectedDay === 2
                ? "bg-[var(--theme-accent)] text-white font-bold"
                : "border border-[var(--theme-border)] bg-[var(--theme-surface-secondary)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] hover:border-[var(--theme-accent)]"
            }`}
          >
            Day 2 (Broadcast &amp; Valedictory)
          </button>
        </div>
      </div>

      {/* Timeline List */}
      <div className="space-y-4">
        {filteredEntries.map((item, index) => {
          const statusText = item.status === "LIVE" ? "IN PROGRESS" : item.status;
          return (
            <div
              key={item.id || index}
              className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-6 hover:border-[var(--theme-accent)] transition-all grid grid-cols-1 lg:grid-cols-12 gap-6 items-center rounded-xs"
            >
              {/* Day & Time Column */}
              <div className="lg:col-span-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-[var(--theme-text-muted)] border border-[var(--theme-border)] bg-[var(--theme-surface-secondary)] px-2 py-0.5 uppercase">
                    Day {item.dayNumber}
                  </span>
                  <span
                    className={`font-mono text-[10px] uppercase px-2 py-0.5 ${
                      item.status === "LIVE"
                        ? "border border-[var(--theme-accent)] text-[var(--theme-text-primary)] bg-[var(--theme-accent)]/20 animate-pulse"
                        : item.status === "COMPLETED"
                        ? "border border-[var(--theme-border)] text-[var(--theme-text-muted)]"
                        : "border border-[var(--theme-border)] text-[var(--theme-text-primary)] bg-[var(--theme-surface-secondary)]"
                    }`}
                  >
                    {statusText}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-mono font-bold text-[var(--theme-text-primary)]">
                  <Clock className="w-3.5 h-3.5 text-[var(--theme-accent)] shrink-0" />
                  <span>
                    {item.startTime} &ndash; {item.endTime}
                  </span>
                </div>
              </div>

              {/* Event / Session Column */}
              <div className="lg:col-span-6 space-y-1.5">
                {item.event ? (
                  <div>
                    <h3 className="font-bold text-base text-[var(--theme-text-primary)] hover:text-[var(--theme-accent)] transition-colors">
                      <Link href={`/events/${item.event.slug}`}>
                        {item.title || item.event.title}
                      </Link>
                    </h3>
                    <p className="text-xs text-[var(--theme-text-muted)] line-clamp-2 mt-1 leading-relaxed">
                      {item.description || item.event.shortDescription}
                    </p>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-bold text-base text-[var(--theme-text-primary)]">
                      {item.title ||
                        (item.dayNumber === 1
                          ? "Inaugural Ceremony & National Keynote Address"
                          : "Grand Valedictory & Annual Journalism Citations Handover")}
                    </h3>
                    <p className="text-xs text-[var(--theme-text-muted)] mt-1 leading-relaxed">
                      {item.description ||
                        (item.dayNumber === 1
                          ? "Welcome address by Patron, ceremonial lamp lighting, and keynote panel on press independence."
                          : "Announcement of competition winners, distribution of the YATHARTH Rolling Trophy, and closing remarks.")}
                    </p>
                  </div>
                )}
              </div>

              {/* Venue & Action Column */}
              <div className="lg:col-span-3 flex flex-col items-start lg:items-end justify-center gap-2">
                {item.venue && (
                  <div className="flex items-center gap-1.5 text-xs text-[var(--theme-text-muted)] font-mono">
                    <Building className="w-3.5 h-3.5 text-[var(--theme-accent)] shrink-0" />
                    <span>{item.venue.name}</span>
                  </div>
                )}
                {item.event && (
                  <Link
                    href={`/events/${item.event.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-mono text-[var(--theme-text-muted)] hover:text-[var(--theme-accent)] uppercase tracking-wider transition-colors"
                  >
                    <span>Event Details</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
