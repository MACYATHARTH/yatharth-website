"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Filter, Award, Users, MapPin, ChevronRight, ExternalLink } from "lucide-react";
import { Event } from "@/lib/data/types";

interface EventsDirectoryClientProps {
  initialEvents: Event[];
}

const CATEGORIES = [
  "ALL",
  "Print Journalism",
  "Photojournalism",
  "Broadcast Media",
  "Media Quiz",
];

export function EventsDirectoryClient({ initialEvents }: EventsDirectoryClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const filteredEvents = useMemo(() => {
    return initialEvents.filter((event) => {
      // Category filter
      if (
        selectedCategory !== "ALL" &&
        event.category.toLowerCase() !== selectedCategory.toLowerCase()
      ) {
        return false;
      }

      // Status filter
      if (selectedStatus !== "ALL" && event.registrationStatus !== selectedStatus) {
        return false;
      }

      // Search filter (title, category, shortDescription, fullDescription, rules)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = event.title.toLowerCase().includes(q);
        const matchesCat = event.category.toLowerCase().includes(q);
        const matchesDesc = event.shortDescription.toLowerCase().includes(q);
        const matchesFull = event.fullDescription.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCat && !matchesDesc && !matchesFull) {
          return false;
        }
      }

      return true;
    });
  }, [initialEvents, searchQuery, selectedCategory, selectedStatus]);

  return (
    <div className="space-y-8">
      {/* Controls Bar: Search & Category Filter Pills */}
      <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)]/80 backdrop-blur-md p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Search Input */}
          <div className="md:col-span-8 relative">
            <Search className="w-4 h-4 text-[var(--theme-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search competitions by title, keywords, rules, or category..."
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--theme-surface-secondary)]/40 border border-[var(--theme-border)] text-xs text-[var(--theme-text-primary)] placeholder-[var(--theme-text-muted)]/50 focus:outline-hidden focus:border-[var(--theme-text-primary)] transition-all"
            />
          </div>

          {/* Status Dropdown */}
          <div className="md:col-span-4 flex items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--theme-text-muted)] shrink-0" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-2.5 px-3 bg-[var(--theme-surface-secondary)] border border-[var(--theme-border)] text-xs font-mono uppercase tracking-wider text-[var(--theme-text-primary)] focus:outline-hidden focus:border-[var(--theme-text-primary)] cursor-pointer"
            >
              <option value="ALL" className="bg-[var(--theme-surface)] text-[var(--theme-text-primary)]">All Statuses (Open / Upcoming / Closed)</option>
              <option value="OPEN" className="bg-[var(--theme-surface)] text-[var(--theme-text-primary)]">Registrations OPEN</option>
              <option value="COMING_SOON" className="bg-[var(--theme-surface)] text-[var(--theme-text-primary)]">Opening Soon</option>
              <option value="CLOSED" className="bg-[var(--theme-surface)] text-[var(--theme-text-primary)]">Registrations Closed</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[var(--theme-border)]">
          <span className="text-[11px] font-mono uppercase text-[var(--theme-text-muted)] tracking-wider mr-1">
            Category:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[var(--theme-text-primary)] text-[var(--theme-background)] font-bold"
                  : "border border-[var(--theme-border)] bg-[var(--theme-surface)]/40 text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] hover:border-[var(--theme-text-primary)]/30"
              }`}
            >
              {cat === "ALL" ? "All Categories" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count Bar */}
      <div className="flex items-center justify-between text-xs text-zinc-400 font-mono px-1">
        <span>
          Showing {filteredEvents.length} of {initialEvents.length} Competitions
        </span>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-[var(--theme-cta)] underline hover:opacity-80 cursor-pointer"
          >
            Clear Search Filter
          </button>
        )}
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)]/80 backdrop-blur-md p-12 text-center space-y-3">
          <p className="text-sm font-mono text-[var(--theme-text-primary)]">
            No competitions found matching your criteria.
          </p>
          <p className="text-xs text-[var(--theme-text-muted)]">
            Try adjusting your search keywords or switching category filters to view other events.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("ALL");
              setSelectedStatus("ALL");
            }}
            className="inline-flex items-center px-4 py-2 border border-[var(--theme-border)] text-[var(--theme-text-primary)] text-xs font-mono uppercase tracking-wider hover:bg-[var(--theme-surface-secondary)] transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="border border-[var(--theme-border)] bg-[var(--theme-surface)]/80 backdrop-blur-md hover:border-[var(--theme-text-primary)]/30 transition-all flex flex-col justify-between group"
            >
              <div className="p-6 space-y-4">
                {/* Header meta badges */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase text-[var(--theme-text-primary)] bg-[var(--theme-surface-secondary)]/40 px-2 py-0.5 border border-[var(--theme-border)]">
                    {event.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[var(--theme-text-muted)] border border-[var(--theme-border)] px-2 py-0.5 uppercase">
                      {event.participationType}
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 border ${
                        event.registrationStatus === "OPEN"
                          ? "border-[var(--theme-cta)]/50 text-[var(--theme-text-primary)] bg-[var(--theme-cta)]/15"
                          : event.registrationStatus === "COMING_SOON"
                          ? "border-[var(--theme-border)] text-[var(--theme-text-primary)] bg-[var(--theme-surface-secondary)]/30"
                          : "border-[var(--theme-border)] text-[var(--theme-text-muted)]"
                      }`}
                    >
                      {event.registrationStatus.replace("_", " ")}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-[var(--theme-text-primary)] group-hover:text-[var(--theme-text-muted)] transition-colors leading-snug">
                  <Link href={`/events/${event.slug}`}>{event.title}</Link>
                </h3>

                {/* Description */}
                <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed line-clamp-3">
                  {event.shortDescription}
                </p>

                {/* Key metadata snippets */}
                <div className="pt-3 border-t border-[var(--theme-border)] space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-[var(--theme-text-primary)] font-mono">
                    <Award className="w-3.5 h-3.5 shrink-0 text-[var(--theme-text-muted)]" />
                    <span>{event.prizes[0] || "Cash Prizes & Citations"}</span>
                  </div>

                  {event.venue && (
                    <div className="flex items-center gap-2 text-[var(--theme-text-muted)] font-mono">
                      <MapPin className="w-3.5 h-3.5 text-[var(--theme-text-muted)] shrink-0" />
                      <span>
                        {event.venue.name} ({event.venue.roomNumber || event.venue.building})
                      </span>
                    </div>
                  )}

                  {/* Event Heads preview if present */}
                  {event.heads && event.heads.length > 0 && (
                    <div className="flex items-center gap-2 text-[var(--theme-text-muted)] text-[11px] font-mono">
                      <Users className="w-3.5 h-3.5 text-[var(--theme-text-muted)]/70 shrink-0" />
                      <span className="truncate">
                        Heads:{" "}
                        {event.heads
                            .map(
                              (h) =>
                                h.contactOverride?.split(":")[0] ||
                                h.teamMember?.name ||
                                "Student Lead"
                            )
                            .join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons footer */}
              <div className="p-4 bg-[var(--theme-surface-secondary)]/20 border-t border-[var(--theme-border)] flex items-center justify-between gap-3">
                <Link
                  href={`/events/${event.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-mono text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] uppercase tracking-wider transition-all"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>

                {event.registrationEnabled !== false && event.registrationStatus !== "NOT_AVAILABLE" ? (
                  event.registrationStatus === "OPEN" && event.registrationUrl ? (
                    <a
                      href={event.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[var(--theme-cta)] text-[var(--theme-cta-text)] hover:opacity-90 text-xs font-mono uppercase font-bold tracking-wider transition-all"
                    >
                      <span>Register →</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : event.registrationStatus === "CLOSED" ? (
                    <span className="text-[10px] font-mono text-[var(--theme-text-muted)] uppercase px-2 py-0.5 border border-[var(--theme-border)] bg-[var(--theme-surface-secondary)]/30">
                      Registration Closed
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-[var(--theme-text-muted)]">
                      Forms Opening Soon
                    </span>
                  )
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
