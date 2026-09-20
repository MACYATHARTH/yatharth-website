"use client";

import React, { useState } from "react";
import Image from "next/image";

interface YatharthLogoProps {
  className?: string;
  size?: "hero" | "nav" | "compact";
  /** Path to an official logo asset, e.g. "/yatharth-logo.png" */
  customLogoUrl?: string | null;
  /** Primary name of the festival, defaults to "YATHARTH" */
  editionName?: string;
  /** Display label for the edition, e.g. "’26–27". If empty or null, hallmark is omitted */
  displayLabel?: string | null;
}

/**
 * YatharthLogo — Primary Festival Identity
 *
 * If an official logo asset exists (customLogoUrl or /yatharth-logo.svg in public),
 * it will be rendered as-is. Otherwise renders a clean typographic mark.
 *
 * This is NOT a CSS recreation of an official logo.
 * It is a placeholder typographic identity that should be replaced
 * with the real YATHARTH logo asset when available.
 */
export function YatharthLogo({
  className = "",
  size = "hero",
  customLogoUrl,
  editionName = "YATHARTH",
  displayLabel = "’26–27",
}: YatharthLogoProps) {
  const [assetError, setAssetError] = useState(false);

  const fullBranding = displayLabel ? `${editionName} ${displayLabel}` : editionName;

  // Attempt to render an official asset if provided
  if (customLogoUrl && !assetError) {
    return (
      <div
        className={`relative select-none flex flex-col items-center justify-center ${className}`}
        role="img"
        aria-label={`${fullBranding} Festival Logo`}
      >
        <Image
          src={customLogoUrl}
          alt={`${fullBranding} Festival Logo`}
          width={size === "hero" ? 640 : size === "compact" ? 280 : 200}
          height={size === "hero" ? 180 : size === "compact" ? 80 : 56}
          priority
          onError={() => setAssetError(true)}
          className={`w-auto object-contain drop-shadow-[0_16px_48px_rgba(0,0,0,0.7)] ${
            size === "hero"
              ? "max-h-24 sm:max-h-36 md:max-h-44 max-w-full"
              : size === "compact"
              ? "max-h-12 max-w-[220px]"
              : "max-h-9 sm:max-h-10 max-w-[180px]"
          }`}
        />
        {size === "hero" && displayLabel && (
          <div className="flex items-center gap-3 mt-4 w-full max-w-[240px]">
            <div className="h-px flex-1 bg-[var(--theme-accent)]/50" />
            <span className="font-mono text-sm sm:text-base tracking-[0.3em] text-[var(--theme-accent)] font-bold uppercase whitespace-nowrap">
              {displayLabel}
            </span>
            <div className="h-px flex-1 bg-[var(--theme-accent)]/50" />
          </div>
        )}
        {size !== "hero" && displayLabel && (
          <span className="font-mono text-xs tracking-wider text-[var(--theme-accent)] font-bold uppercase mt-1">
            {displayLabel}
          </span>
        )}
      </div>
    );
  }

  // Clean typographic identity (placeholder until official asset is supplied)
  const isHero = size === "hero";

  if (!isHero) {
    return (
      <div
        role="img"
        aria-label={fullBranding}
        className={`select-none ${className}`}
      >
        <span className="font-varsity tracking-wide text-[var(--theme-text-primary)] text-base">
          {editionName}
        </span>
        {displayLabel && (
          <span className="font-mono text-[var(--theme-text-muted)] text-xs ml-1">
            {displayLabel}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={`${fullBranding} Festival Identity`}
      className={`relative select-none inline-flex flex-col items-center ${className}`}
    >
      {/* Primary Wordmark */}
      <h1 className="font-varsity text-[clamp(3.5rem,11vw,8.5rem)] tracking-wide text-[var(--theme-text-primary)] leading-none">
        {editionName}
      </h1>

      {/* Edition hallmark — subtle, integrated with muted rust trim */}
      {displayLabel && (
        <div className="flex items-center gap-3 mt-3 w-full max-w-[200px]">
          <div className="h-px flex-1 bg-[var(--theme-accent)]/50" />
          <span className="font-mono text-sm tracking-[0.3em] text-[var(--theme-accent)] font-bold uppercase">
            {displayLabel}
          </span>
          <div className="h-px flex-1 bg-[var(--theme-accent)]/50" />
        </div>
      )}
    </div>
  );
}
