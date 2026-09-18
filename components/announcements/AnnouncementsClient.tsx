"use client";

import { useState, useMemo } from "react";
import { Search, Filter, Pin, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import { Announcement } from "@/lib/data/types";

interface AnnouncementsClientProps {
  initialAnnouncements: Announcement[];
}

export function AnnouncementsClient({ initialAnnouncements }: AnnouncementsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(
    initialAnnouncements.length > 0 ? initialAnnouncements[0].id : null
  );

  const filteredAnnouncements = useMemo(() => {
    return initialAnnouncements.filter((item) => {
      // Priority filter
      if (selectedPriority !== "ALL" && item.priority !== selectedPriority) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = item.title.toLowerCase().includes(q);
        const inSummary = item.summary.toLowerCase().includes(q);
        const inContent = item.content.toLowerCase().includes(q);
        if (!inTitle && !inSummary && !inContent) return false;
      }

      return true;
    });
  }, [initialAnnouncements, searchQuery, selectedPriority]);

  const toggleExpand = (id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  return (
    <div className="space-y-8">
      {/* Search & Filter Bar */}
      <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-5 space-y-4 rounded-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-8 relative">
            <Search className="w-4 h-4 text-[var(--theme-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search circulars, notifications, deadline alerts..."
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--theme-surface-secondary)] border border-[var(--theme-border)] text-xs text-[var(--theme-text-primary)] placeholder-[var(--theme-text-muted)] focus:outline-hidden focus:border-[var(--theme-accent)] transition-all rounded-xs"
            />
          </div>

          <div className="md:col-span-4 flex items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--theme-text-muted)] shrink-0" />
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full py-2.5 px-3 bg-[var(--theme-surface-secondary)] border border-[var(--theme-border)] text-xs font-mono uppercase tracking-wider text-[var(--theme-text-primary)] focus:outline-hidden focus:border-[var(--theme-accent)] cursor-pointer rounded-xs"
            >
              <option value="ALL">All Priority Levels</option>
              <option value="URGENT">Urgent Alerts Only</option>
              <option value="PINNED">Pinned Notices Only</option>
              <option value="NORMAL">Standard Circulars</option>
            </select>
          </div>
        </div>

        {/* Priority quick buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[var(--theme-border)]">
          <span className="text-[11px] font-mono uppercase text-[var(--theme-text-muted)] tracking-wider mr-1">
            Filter:
          </span>
          {["ALL", "URGENT", "PINNED", "NORMAL"].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setSelectedPriority(p)}
              className={`px-3 py-1 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer rounded-xs ${
                selectedPriority === p
                  ? "bg-[var(--theme-accent)] text-white font-bold"
                  : "border border-[var(--theme-border)] bg-[var(--theme-surface-secondary)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] hover:border-[var(--theme-accent)]"
              }`}
            >
              {p === "ALL" ? "All Releases" : p}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements List */}
      {filteredAnnouncements.length === 0 ? (
        <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-12 text-center space-y-3 rounded-xs">
          <p className="text-sm text-[var(--theme-text-muted)] font-mono">
            No circulars or press releases found matching your query.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedPriority("ALL");
            }}
            className="text-xs font-mono uppercase text-[var(--theme-accent)] underline cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <article
                key={item.id}
                className="border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:border-[var(--theme-accent)] transition-all rounded-xs overflow-hidden"
              >
                {/* Header bar */}
                <div
                  onClick={() => toggleExpand(item.id)}
                  className="p-6 cursor-pointer flex items-start justify-between gap-4 select-none"
                >
                  <div className="space-y-2.5 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`font-mono text-[10px] uppercase px-2 py-0.5 border rounded-xs ${
                          item.priority === "URGENT"
                            ? "border-[var(--theme-accent)] text-[var(--theme-text-primary)] bg-[var(--theme-accent)]/20 animate-pulse"
                            : item.priority === "PINNED"
                            ? "border-[var(--theme-accent)]/60 text-[var(--theme-text-primary)] bg-[var(--theme-accent)]/15"
                            : "border-[var(--theme-border)] text-[var(--theme-text-muted)] bg-[var(--theme-surface-secondary)]"
                        }`}
                      >
                        {item.priority === "PINNED" && <Pin className="w-2.5 h-2.5 inline mr-1" />}
                        {item.priority}
                      </span>
                      <span className="text-xs font-mono text-[var(--theme-text-muted)] flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-[var(--theme-accent)]" />
                        {new Date(item.publishedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-white hover:text-zinc-300 transition-colors leading-snug">
                      {item.title}
                    </h2>

                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label={isExpanded ? "Collapse announcement" : "Read full announcement"}
                    className="p-1.5 border border-white/10 bg-white/[0.02] hover:bg-white/10 text-zinc-400 hover:text-white shrink-0 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-white" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Expandable Full Content */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-3 border-t border-white/[0.06] bg-black/20 space-y-4">
                    <div className="border-l-2 border-white/30 pl-4 py-1 text-xs sm:text-sm text-zinc-300 leading-relaxed space-y-2">
                      <p>{item.content}</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-zinc-500 pt-3 border-t border-white/[0.06] font-mono">
                      <span>Issued by: Festival Information Desk, Department of Journalism</span>
                      <span>Ref: DU-MAC-Y26-{item.slug.slice(0, 8).toUpperCase()}</span>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
