"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ContentRowProps {
  title: string;
  badge?: string;
  subtitle?: string;
  children: React.ReactNode;
}

/**
 * ContentRow
 * Reusable horizontal content discovery tray.
 * Provides touch-friendly snap-scrolling, left/right keyboard & button controls,
 * and zero horizontal body overflow.
 */
export function ContentRow({ title, badge, subtitle, children }: ContentRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="space-y-4 relative group/row">
      {/* Row Header with Title, Badge, and Controls */}
      {(title || badge || subtitle) ? (
        <div className="flex items-end justify-between px-1">
          <div>
            {badge && (
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                  {badge}
                </span>
              </div>
            )}
            {title && (
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">{subtitle}</p>
            )}
          </div>

          {/* Desktop Left/Right Navigation Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label={`Scroll ${title || "content"} left`}
              className="w-8 h-8 rounded-sm bg-[var(--theme-surface-secondary)] border border-[var(--theme-border)] hover:border-[var(--theme-text-primary)]/40 flex items-center justify-center text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label={`Scroll ${title || "content"} right`}
              className="w-8 h-8 rounded-sm bg-[var(--theme-surface-secondary)] border border-[var(--theme-border)] hover:border-[var(--theme-text-primary)]/40 flex items-center justify-center text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* If no title/badge, provide subtle navigation controls above the scroll track */
        <div className="hidden sm:flex items-center justify-end gap-2 px-1 mb-1">
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="w-8 h-8 rounded-sm bg-[var(--theme-surface-secondary)] border border-[var(--theme-border)] hover:border-[var(--theme-text-primary)]/40 flex items-center justify-center text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="w-8 h-8 rounded-sm bg-[var(--theme-surface-secondary)] border border-[var(--theme-border)] hover:border-[var(--theme-text-primary)]/40 flex items-center justify-center text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Horizontal Scroll Track */}
      <div
        ref={rowRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory py-2 px-1 -mx-1"
        tabIndex={0}
        aria-label={`${title} carousel`}
      >
        {children}
      </div>
    </section>
  );
}
