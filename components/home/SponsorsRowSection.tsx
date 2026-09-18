"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Handshake } from "lucide-react";
import { Sponsor } from "@/lib/data/types";

interface SponsorsRowSectionProps {
  sponsors: Sponsor[];
}

export function SponsorsRowSection({ sponsors }: SponsorsRowSectionProps) {
  if (!sponsors || sponsors.length === 0) {
    return null;
  }

  return (
    <section
      id="sponsors-section"
      className="relative w-full py-20 sm:py-28 px-4 sm:px-8 lg:px-14 bg-transparent text-[var(--theme-text-primary)] border-t border-[var(--theme-border)] select-none"
    >
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--theme-border)] pb-6">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-[var(--theme-accent)] font-semibold mb-2">
              Partners
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--theme-text-primary)] tracking-tight uppercase font-varsity">
              Sponsors &amp; Partners
            </h2>
          </div>

          <Link
            href="/sponsors"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-colors group font-medium"
          >
            <span>View All Partners</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[var(--theme-accent)]" />
          </Link>
        </div>

        {/* Clean Static Logo Row / Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {sponsors.map((sponsor) => (
            <a
              key={sponsor.id}
              href={sponsor.websiteUrl || "#"}
              target={sponsor.websiteUrl ? "_blank" : undefined}
              rel={sponsor.websiteUrl ? "noopener noreferrer" : undefined}
              className="group p-6 sm:p-8 bg-[var(--theme-glass-bg)] backdrop-blur-sm border border-[var(--theme-glass-border)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:border-[var(--theme-accent)] transition-all flex flex-col items-center text-center justify-center min-h-[140px] rounded-xs"
            >
              {/* Monogram / Logo Mark */}
              <div className="w-12 h-12 rounded-xs border border-[var(--theme-border)] flex items-center justify-center text-sm font-bold text-[var(--theme-text-primary)] group-hover:border-[var(--theme-accent)] group-hover:text-[var(--theme-accent)] transition-all bg-[var(--theme-surface)]">
                {sponsor.name.charAt(0)}
              </div>

              {/* Sponsor Details */}
              <div className="mt-4">
                <div className="text-sm font-semibold text-[var(--theme-text-primary)]/90 group-hover:text-[var(--theme-text-primary)] transition-colors">
                  {sponsor.name}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-[var(--theme-text-muted)] mt-0.5 font-mono">
                  {sponsor.tier.replace("_", " ")}
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Sponsorship Partnership CTA */}
        <div className="p-8 sm:p-10 border border-[var(--theme-glass-border)] bg-[var(--theme-glass-bg)] backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] rounded-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-[var(--theme-accent)] uppercase tracking-wider font-semibold font-mono">
              <Handshake className="w-4 h-4" />
              <span>Partnership</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[var(--theme-text-primary)]">
              Partner with YATHARTH &apos;26
            </h3>
            <p className="text-xs text-[var(--theme-text-muted)] max-w-xl font-sans">
              Connect your brand, media network, or organization with delegates and creators from top universities nationwide.
            </p>
          </div>

          <Link
            href="/contact"
            className="btn-primary text-xs shrink-0"
          >
            <span>Partner With Us</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
