"use client";

import React from "react";
import { FestivalLink } from "@/lib/data/types";
import {
  InstagramIcon,
  YoutubeIcon,
  LinkedinIcon,
} from "@/components/icons/SocialIcons";

interface SocialMediaSectionProps {
  links?: FestivalLink[];
}

function XIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function GlobeIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" x2="22" y1="12" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function PlatformIcon({
  platform,
  className = "w-5 h-5",
}: {
  platform: string;
  className?: string;
}) {
  const p = platform.toUpperCase();
  if (p.includes("INSTAGRAM")) return <InstagramIcon className={className} />;
  if (p.includes("YOUTUBE")) return <YoutubeIcon className={className} />;
  if (p.includes("LINKEDIN")) return <LinkedinIcon className={className} />;
  if (p.includes("TWITTER") || p === "X" || p.includes("X (TWITTER)")) {
    return <XIcon className={className} />;
  }
  return <GlobeIcon className={className} />;
}

function formatPlatformName(platform: string): string {
  const p = platform.toUpperCase();
  if (p.includes("INSTAGRAM")) return "Instagram";
  if (p.includes("YOUTUBE")) return "YouTube";
  if (p.includes("LINKEDIN")) return "LinkedIn";
  if (p.includes("TWITTER") || p === "X" || p.includes("X (TWITTER)")) return "X";
  return platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase();
}

function formatHandle(label: string): string {
  const trimmed = label.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("@") || trimmed.includes(" ")) {
    return trimmed;
  }
  return `@${trimmed}`;
}

export function SocialMediaSection({ links = [] }: SocialMediaSectionProps) {
  // Source of truth: only published social media links from admin-managed FestivalLink data
  const socialLinks = links
    .filter((l) => {
      if (!l.isPublished) return false;
      const p = l.platform.toUpperCase();
      if (p === "LINKTREE") return false;
      return (
        l.category === "SOCIAL" ||
        p.includes("INSTAGRAM") ||
        p.includes("YOUTUBE") ||
        p.includes("LINKEDIN") ||
        p.includes("TWITTER") ||
        p === "X" ||
        p.includes("FACEBOOK") ||
        p.includes("SPOTIFY")
      );
    })
    .sort((a, b) => a.displayOrder - b.displayOrder);

  // Gracefully handle empty state: no fake/hard-coded fallback accounts
  if (socialLinks.length === 0) {
    return null;
  }

  return (
    <section
      id="social-media"
      className="relative w-full py-16 sm:py-24 px-4 sm:px-8 lg:px-14 bg-transparent text-[var(--theme-text-primary)] border-t border-[var(--theme-border)] select-none"
      aria-label="Social Media"
    >
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* Section Heading */}
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[var(--theme-text-primary)] tracking-tight uppercase font-varsity">
            Social Media
          </h2>
        </div>

        {/* Clean, minimal stacked list */}
        <div className="border-y border-[var(--theme-border)] divide-y divide-[var(--theme-border)]">
          {socialLinks.map((link) => {
            const platformName = formatPlatformName(link.platform);
            const handle = formatHandle(link.label);

            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between py-4 sm:py-5 px-3 -mx-3 hover:bg-[var(--theme-surface)]/40 transition-colors"
                aria-label={`${platformName}: ${handle}`}
              >
                <div className="flex items-center gap-3.5 sm:gap-4">
                  <span className="text-[var(--theme-text-muted)] group-hover:text-[var(--theme-accent)] transition-colors flex items-center justify-center shrink-0">
                    <PlatformIcon platform={link.platform} className="w-5 h-5" />
                  </span>
                  <span className="text-base sm:text-lg font-medium text-[var(--theme-text-primary)] group-hover:text-[var(--theme-accent)] transition-colors font-sans">
                    {platformName}
                  </span>
                </div>

                <span className="text-sm sm:text-base text-[var(--theme-text-muted)] group-hover:text-[var(--theme-text-primary)] transition-colors font-sans">
                  {handle}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
