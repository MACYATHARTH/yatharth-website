"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Camera } from "lucide-react";
import { GalleryItem } from "@/lib/data/types";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

interface GalleryMarqueeRibbonProps {
  items: GalleryItem[];
}

export function GalleryMarqueeRibbon({ items }: GalleryMarqueeRibbonProps) {
  const reducedMotion = usePrefersReducedMotion();

  if (!items || items.length === 0) {
    return null;
  }

  // Duplicate sequence internally for seamless autonomous loop
  const repeatedItems =
    items.length < 5
      ? [...items, ...items, ...items, ...items]
      : [...items, ...items];

  return (
    <section
      id="gallery-ribbon"
      className="relative w-full py-20 sm:py-28 overflow-hidden select-none bg-transparent text-[var(--theme-text-primary)] border-t border-[var(--theme-border)]"
      aria-label="Festival Gallery Ribbon"
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-14 mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-[var(--theme-accent)] font-semibold mb-2">
            Gallery
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--theme-text-primary)] tracking-tight uppercase font-varsity">
            Festival Memories
          </h2>
        </div>

        <Link
          href="/gallery"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-colors group font-medium"
        >
          <span>View Gallery</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[var(--theme-accent)]" />
        </Link>
      </div>

      {/* Autonomous Continuous Horizontal Filmstrip Ribbon */}
      <div className="w-full overflow-hidden">
        {reducedMotion ? (
          /* Accessible static / scrollable strip when reduced motion is requested */
          <div className="flex items-center gap-6 px-4 sm:px-8 overflow-x-auto scrollbar-none pb-4">
            {items.map((item, idx) => (
              <GalleryFrame key={`static-gal-${item.id}-${idx}`} item={item} />
            ))}
          </div>
        ) : (
          /* Autonomous continuous CSS infinite loop (independent of page scroll) */
          <div className="flex w-max animate-marquee-gallery py-2">
            {repeatedItems.map((item, idx) => (
              <div key={`ribbon-gal-${item.id}-${idx}`} className="shrink-0 px-3">
                <GalleryFrame item={item} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function GalleryFrame({ item }: { item: GalleryItem }) {
  const [imageError, setImageError] = useState(false);
  const src = item.imageUrl || item.mediaUrl;

  return (
    <Link
      href="/gallery"
      className="group block relative w-[290px] sm:w-[380px] h-[220px] sm:h-[260px] bg-[var(--theme-surface)] backdrop-blur-sm border border-[var(--theme-border)] hover:border-[var(--theme-accent)] transition-all duration-300 overflow-hidden rounded-xs"
    >
      {src && !imageError ? (
        <Image
          src={src}
          alt={item.title || "YATHARTH Gallery Photo"}
          fill
          sizes="(max-width: 640px) 290px, 380px"
          onError={() => setImageError(true)}
          className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-85 group-hover:opacity-100"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-[var(--theme-surface-secondary)]/50">
          <Camera className="w-8 h-8 text-[var(--theme-accent)] mb-2" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--theme-text-muted)]">
            {item.category}
          </span>
        </div>
      )}

      {/* Subtle Scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-background)]/90 via-transparent to-transparent pointer-events-none" />

      {/* Frame Caption */}
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 z-10 flex flex-col justify-end">
        <div className="flex items-center justify-between text-[10px] tracking-widest uppercase text-[var(--theme-accent)] font-semibold mb-1 font-mono">
          <span>{item.category}</span>
          <span className="text-[var(--theme-text-muted)] font-normal">{item.year || 2025}</span>
        </div>
        <h3 className="text-sm font-bold text-[var(--theme-text-primary)] group-hover:text-[var(--theme-accent)] transition-colors truncate">
          {item.title}
        </h3>
      </div>
    </Link>
  );
}
