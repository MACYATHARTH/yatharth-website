"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Edition } from "@/lib/data/types";

interface EditorialSplitSectionProps {
  edition?: Edition;
  eventCount?: number;
}

export function EditorialSplitSection({
  edition,
  eventCount = 6,
}: EditorialSplitSectionProps) {
  const themeTitle = (edition?.themeSettings?.themeTitle as string) || "Voice, Vision & Veracity";
  const collegeName = (edition?.themeSettings?.college as string) || "Maharaja Agrasen College, University of Delhi";
  const deptName = (edition?.themeSettings?.department as string) || "Department of Journalism";

  return (
    <section className="relative w-full bg-[#0B0A09] text-[#E9E6DF] py-24 sm:py-32 px-6 sm:px-12 lg:px-16 overflow-hidden select-none border-t border-[#8F3025]/20">
      <div className="max-w-7xl mx-auto">
        {/* Top Monospace Tag */}
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-[#8B1E2D] font-bold mb-10">
          <span>[ 03 / INSTITUTIONAL ETHOS ]</span>
          <span className="h-px w-12 bg-[#8B1E2D]/40" />
        </div>

        {/* 2-Column Split: Ethos Manifesto + Authoritative Edition Scope */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          {/* Left: Varsity Headline & Ethos */}
          <div className="lg:col-span-7">
            <h2 className="font-varsity text-3xl sm:text-5xl lg:text-6xl text-[#E9E6DF] tracking-wide uppercase leading-tight mb-8">
              The Conscience of Journalism.
            </h2>

            <p className="font-sans text-base sm:text-lg text-[#E9E6DF]/85 leading-relaxed font-normal mb-6">
              Organized annually by the {deptName} at {collegeName}. YATHARTH is a student-run
              national collegiate festival dedicated to fearless reporting, visual ethics,
              and uncompromising factual inquiry.
            </p>

            <div className="pt-6 border-t border-[#E9E6DF]/10 flex items-center gap-6">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.15em] text-[#E9E6DF] hover:text-[#8B1E2D] transition-colors font-bold group"
              >
                <span>Read Institutional Legacy</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#8B1E2D]" />
              </Link>
            </div>
          </div>

          {/* Right: Authoritative Dynamic Scope */}
          <div className="lg:col-span-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-[#8B1E2D]/30 pt-8 lg:pt-0 lg:pl-12">
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#8B1E2D] font-bold mb-4">
                [ FESTIVAL ARENA &bull; 2026 ]
              </div>

              <div className="space-y-8">
                {/* Real Dynamic Competition Count */}
                <div className="border-b border-[#E9E6DF]/10 pb-6">
                  <div className="font-varsity text-5xl sm:text-6xl text-[#E9E6DF] tracking-tight">
                    {String(eventCount).padStart(2, "0")}
                  </div>
                  <div className="text-xs font-mono uppercase tracking-widest text-[#E9E6DF]/70 mt-2 font-bold">
                    Competitive Categories
                  </div>
                  <p className="text-xs text-[#E9E6DF]/60 mt-1">
                    Print journalism, spot photography, television news anchoring, and current affairs conclave.
                  </p>
                </div>

                {/* Real Institutional Pillars */}
                <div className="border-b border-[#E9E6DF]/10 pb-6">
                  <div className="text-xs font-mono uppercase tracking-widest text-[#8B1E2D] font-bold mb-1">
                    MOTTO &bull; FOCUS
                  </div>
                  <div className="text-sm font-bold text-[#E9E6DF] uppercase tracking-wider">
                    {themeTitle}
                  </div>
                  <p className="text-xs text-[#E9E6DF]/60 mt-1">
                    Fostering investigative curiosity, documentary lens practice, and ethical newsroom standards.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <Link
                href="/schedule"
                className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.15em] text-[#E9E6DF] hover:text-[#8B1E2D] transition-colors font-bold group"
              >
                <span>View Programme Itinerary</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#8B1E2D]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
