"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Announcement } from "@/lib/data/types";

interface DispatchWireProps {
  announcements: Announcement[];
}

export function DispatchWire({ announcements }: DispatchWireProps) {
  const displayItems = announcements.slice(0, 5);

  return (
    <section
      id="announcements-section"
      className="relative w-full py-20 sm:py-28 px-4 sm:px-8 lg:px-14 bg-transparent text-[var(--theme-text-primary)] border-t border-[var(--theme-border)] select-none"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--theme-border)] pb-6 mb-10">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-[var(--theme-accent)] font-semibold mb-2">
              Updates
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--theme-text-primary)] tracking-tight uppercase font-varsity">
              Announcements
            </h2>
          </div>

          <Link
            href="/announcements"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-colors group font-medium"
          >
            <span>All Announcements</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[var(--theme-accent)]" />
          </Link>
        </div>

        {/* Clean Updates List */}
        <div className="border-t border-[var(--theme-border)] divide-y divide-[var(--theme-border)]">
          {displayItems.map((item, idx) => {
            const isUrgent = item.priority === "URGENT";

            return (
              <Link
                key={item.id}
                href="/announcements"
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6 px-4 -mx-4 hover:bg-[var(--theme-surface)]/50 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-4 sm:gap-6">
                  {/* Clean Number Index */}
                  <span className="text-xs sm:text-sm font-bold text-[var(--theme-accent)] tracking-wider shrink-0 mt-0.5 sm:mt-0 font-mono">
                    {String(idx + 1).padStart(2, "0")}
                  </span>

                  {/* Title & Summary */}
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base sm:text-lg font-bold text-[var(--theme-text-primary)] group-hover:text-[var(--theme-accent)] transition-colors">
                        {item.title}
                      </h3>
                      {isUrgent && (
                        <span className="text-[10px] uppercase tracking-widest text-[var(--theme-accent)] border border-[var(--theme-accent)]/40 px-2 py-0.5 font-semibold rounded-xs bg-[var(--theme-accent)]/10 font-mono">
                          Important
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--theme-text-muted)] line-clamp-1 mt-1 font-sans font-normal max-w-2xl">
                      {item.summary}
                    </p>
                  </div>
                </div>

                {/* Right: Date Stamp & Arrow */}
                <div className="flex items-center gap-4 shrink-0 sm:text-right pl-8 sm:pl-0">
                  <span className="text-xs text-[var(--theme-text-muted)] tracking-wider font-mono">
                    {new Date(item.publishedAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="w-8 h-8 rounded-xs border border-[var(--theme-border)] flex items-center justify-center text-[var(--theme-text-muted)] group-hover:text-[var(--theme-text-primary)] group-hover:border-[var(--theme-accent)] transition-all">
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
