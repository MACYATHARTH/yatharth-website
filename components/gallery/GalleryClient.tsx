"use client";

import { useState, useEffect, useCallback } from "react";
import { Camera, X, ChevronLeft, ChevronRight, Eye, User } from "lucide-react";
import { GalleryItem, GalleryCategory } from "@/lib/data/types";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface GalleryClientProps {
  initialItems: GalleryItem[];
}

const CATEGORIES: ("ALL" | GalleryCategory)[] = [
  "ALL",
  "Organizing Team",
  "Behind the Scenes",
];

export function GalleryClient({ initialItems }: GalleryClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<"ALL" | GalleryCategory>("ALL");
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  const filteredItems = initialItems.filter((item) => {
    if (selectedCategory === "ALL") return true;
    return item.category === selectedCategory;
  });

  const activeItem = activeLightboxIndex !== null ? filteredItems[activeLightboxIndex] : null;

  const handleClose = useCallback(() => {
    setActiveLightboxIndex(null);
  }, []);

  const handlePrev = useCallback(() => {
    if (activeLightboxIndex === null) return;
    setActiveLightboxIndex((prev) => (prev! > 0 ? prev! - 1 : filteredItems.length - 1));
  }, [activeLightboxIndex, filteredItems.length]);

  const handleNext = useCallback(() => {
    if (activeLightboxIndex === null) return;
    setActiveLightboxIndex((prev) => (prev! < filteredItems.length - 1 ? prev! + 1 : 0));
  }, [activeLightboxIndex, filteredItems.length]);

  // Accessible keyboard navigation for lightbox
  useEffect(() => {
    if (activeLightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeLightboxIndex, handleClose, handlePrev, handleNext]);

  return (
    <div className="space-y-10">
      {/* Category Filter Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
          [ ARCHIVE COLLECTIONS ]
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategory(cat);
                setActiveLightboxIndex(null);
              }}
              className={`text-xs font-mono uppercase tracking-[0.15em] px-3.5 py-1.5 rounded-sm transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[var(--theme-accent)] text-white font-bold"
                  : "bg-[var(--theme-surface-secondary)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] border border-[var(--theme-border)]"
              }`}
            >
              [{cat === "ALL" ? "ALL FRAMES" : cat}]
            </button>
          ))}
        </div>
      </div>

      {/* Asymmetric Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-start">
        {filteredItems.map((item, index) => {
          // Asymmetric column spans for visual storytelling
          const spanClass =
            index % 5 === 0
              ? "lg:col-span-8 aspect-16/10"
              : index % 5 === 1
              ? "lg:col-span-4 aspect-3/4"
              : index % 5 === 2
              ? "lg:col-span-4 aspect-4/3"
              : index % 5 === 3
              ? "lg:col-span-4 aspect-square"
              : "lg:col-span-4 aspect-4/3";

          return (
            <ScrollReveal
              key={item.id}
              delay={(index % 4) * 60}
              className={`w-full ${index % 5 === 0 ? "lg:col-span-8" : "lg:col-span-4"}`}
            >
              <div
                onClick={() => setActiveLightboxIndex(index)}
                className={`w-full bg-[var(--theme-surface)] border border-[var(--theme-border)] hover:border-[var(--theme-accent)] rounded-sm overflow-hidden transition-all cursor-pointer group flex flex-col justify-between relative ${spanClass}`}
              >
                {/* Photo frame */}
                <div className="absolute inset-0 bg-[var(--theme-surface-secondary)] flex flex-col items-center justify-center p-6 text-center">
                  <Camera className="w-8 h-8 text-[var(--theme-text-muted)] group-hover:text-[var(--theme-accent)] transition-colors mb-2" />
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[var(--theme-text-muted)]">
                    {item.category}
                  </span>
                </div>

                {/* Top category tag */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="text-[9px] font-mono uppercase font-bold text-[var(--theme-text-primary)] bg-black/70 px-2 py-0.5 border border-white/10 rounded-xs">
                    {item.category}
                  </span>
                </div>

                {/* Inspect hover reveal */}
                <div className="absolute inset-0 z-10 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-black bg-white px-3.5 py-1.5 rounded-sm font-bold">
                    <Eye className="w-3.5 h-3.5" /> Inspect Frame
                  </span>
                </div>

                {/* Caption & Metadata at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-10 space-y-1">
                  <h3 className="font-bold text-sm text-white group-hover:text-zinc-200 transition-colors leading-snug line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-300 line-clamp-1 font-mono">
                    {item.caption}
                  </p>
                  <div className="pt-1 text-[10px] text-zinc-500 font-mono flex items-center justify-between">
                    <span>Credit: {item.photographer || "Media Cell"}</span>
                    <span>{item.year || 2025}</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          );
        })}
      </div>

      {/* Accessible Interactive Lightbox */}
      {activeItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.title}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-sm overflow-hidden shadow-2xl text-[var(--theme-text-primary)] space-y-0"
          >
            {/* Top Lightbox Bar */}
            <div className="p-4 sm:p-5 border-b border-[var(--theme-border)] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-[var(--theme-accent)]">
                  [{activeItem.category}]
                </span>
                <h2 className="text-base sm:text-lg font-bold text-[var(--theme-text-primary)] mt-1">
                  {activeItem.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={handleClose}
                aria-label="Close Lightbox"
                className="p-1.5 rounded-sm bg-[var(--theme-surface-secondary)] hover:bg-[var(--theme-accent)] hover:text-white text-[var(--theme-text-muted)] border border-[var(--theme-border)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Photo Canvas */}
            <div className="relative aspect-16/9 bg-[var(--theme-surface-secondary)] flex items-center justify-center p-6 text-center border-b border-[var(--theme-border)]">
              <div className="space-y-2">
                <Camera className="w-12 h-12 text-[var(--theme-text-muted)] mx-auto" />
                <div className="text-sm font-bold text-[var(--theme-text-primary)]">
                  {activeItem.title}
                </div>
                <div className="text-[11px] text-[var(--theme-text-muted)] font-mono">
                  [Archived Documentary Frame &bull; {activeItem.year || 2025}]
                </div>
              </div>

              {/* Navigation buttons inside lightbox */}
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous photograph"
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-sm bg-[var(--theme-surface)]/90 hover:bg-[var(--theme-accent)] hover:text-white text-[var(--theme-text-primary)] transition-colors cursor-pointer border border-[var(--theme-border)]"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next photograph"
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-sm bg-[var(--theme-surface)]/90 hover:bg-[var(--theme-accent)] hover:text-white text-[var(--theme-text-primary)] transition-colors cursor-pointer border border-[var(--theme-border)]"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Lightbox Footer & Caption */}
            <div className="p-4 sm:p-6 space-y-2 bg-[var(--theme-surface)]">
              <p className="text-xs sm:text-sm text-[var(--theme-text-secondary)] leading-relaxed font-mono">
                {activeItem.caption}
              </p>
              <div className="flex flex-wrap items-center justify-between text-xs text-zinc-400 font-mono pt-3 border-t border-white/10">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Photo Credit: {activeItem.photographer || "Department Media Cell"}</span>
                </span>
                <span>
                  Frame {activeLightboxIndex! + 1} of {filteredItems.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

