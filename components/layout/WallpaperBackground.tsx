"use client";

import React, { useState } from "react";

interface WallpaperBackgroundProps {
  wallpaperUrl?: string | null;
  overlayOpacity?: number | null;
}

/**
 * WallpaperBackground
 * 
 * Layered Architecture:
 * 1. WALLPAPER (/assets/wallpaper/yatharth-wallpaper.jpg or wallpaperUrl prop)
 * 2. DARKNESS / OVERLAY (controlled by overlayOpacity prop or --wallpaper-overlay-opacity, default 0.58)
 * 3. CINEMATIC VIGNETTE (subtle radial edge framing)
 * 
 * Falls back to festival dark ground (#08080A) if wallpaper is not found.
 * To activate the background, drop yatharth-wallpaper.jpg into /public/assets/wallpaper/.
 */
export function WallpaperBackground({ wallpaperUrl, overlayOpacity }: WallpaperBackgroundProps) {
  const [wallpaperLoaded, setWallpaperLoaded] = useState(false);
  const [wallpaperError, setWallpaperError] = useState(false);

  const imageSrc = wallpaperUrl || "/assets/wallpaper/yatharth-wallpaper.jpg";

  const handleImageError = () => {
    setWallpaperError(true);
    if (process.env.NODE_ENV === "development") {
      console.info(
        "[YATHARTH Wallpaper] Expected asset at /public/assets/wallpaper/yatharth-wallpaper.jpg is pending. Rendering cinematic dark canvas. Drop yatharth-wallpaper.jpg into /public/assets/wallpaper/ to activate."
      );
    }
  };

  const activeOpacity = typeof overlayOpacity === "number"
    ? overlayOpacity
    : "var(--theme-overlay-opacity, var(--wallpaper-overlay-opacity, 0.58))";

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[var(--theme-background)]"
    >
      {/* 1. Wallpaper Image — real background layer */}
      {!wallpaperError && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageSrc}
          alt=""
          onLoad={() => setWallpaperLoaded(true)}
          onError={handleImageError}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            wallpaperLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {/* 2. Atmosphere / Overlay — ensures text readability while respecting active theme */}
      <div
        className="absolute inset-0 bg-[var(--theme-overlay-bg,var(--theme-background))]"
        style={{
          opacity: activeOpacity,
        }}
      />

      {/* 3. Subtle Vignette & Top/Bottom Atmospheric Contrast */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,var(--theme-overlay-bg,rgba(11,10,9,0.70))_100%)] opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--theme-overlay-bg)]/30 via-transparent to-[var(--theme-overlay-bg)]/60 pointer-events-none" />
    </div>
  );
}
