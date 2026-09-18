"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Edition, FestivalTeam } from "@/lib/data/types";

interface AboutFestSectionProps {
  edition?: Edition;
  teams?: FestivalTeam[];
}

export function AboutFestSection({ edition, teams = [] }: AboutFestSectionProps) {
  const themeSettings = edition?.themeSettings || {};
  const collegeName =
    (themeSettings.college as string) || "Maharaja Agrasen College, University of Delhi";
  const deptName = (themeSettings.department as string) || "Department of Journalism";
  const aboutIntro =
    (themeSettings.aboutIntro as string) ||
    "A student-led celebration of creativity, competition, and courageous storytelling.";

  const aboutParagraphs =
    Array.isArray(themeSettings.aboutParagraphs) && themeSettings.aboutParagraphs.length > 0
      ? (themeSettings.aboutParagraphs as string[])
      : [
          `Hosted by the ${deptName} at ${collegeName}. YATHARTH brings together university students, photographers, writers, and artists from across India in an atmosphere of creative energy and competition.`,
        ];

  // Exclude faculty strictly per specification
  const nonFacultyTeams = teams.filter(
    (t) => !t.name.toLowerCase().includes("faculty") && t.isPublished !== false
  );

  const coordinatorTeam = nonFacultyTeams.find(
    (t) => t.teamType === "COORDINATOR" || t.id === "team-coordinators"
  );
  const functionalTeams = nonFacultyTeams.filter(
    (t) => t.id !== coordinatorTeam?.id && t.teamType !== "COORDINATOR"
  );

  const coordinatorMembers = (coordinatorTeam?.members || []).slice(0, 3);
  // Collect top leads across functional teams
  const functionalLeads = functionalTeams.flatMap((t) => t.members || []).slice(0, 4);

  return (
    <section
      id="about-section"
      className="relative w-full py-20 sm:py-28 px-4 sm:px-8 lg:px-14 bg-transparent text-[var(--theme-text-primary)] border-t border-[var(--theme-border)] select-none"
    >
      <div className="max-w-6xl mx-auto space-y-14">
        {/* Header & Festival Introduction */}
        <div className="border-b border-[var(--theme-border)] pb-10">
          <div className="text-xs uppercase tracking-[0.25em] text-[var(--theme-accent)] font-semibold mb-3">
            About
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--theme-text-primary)] uppercase tracking-tight leading-tight max-w-4xl font-varsity">
            The Festival
          </h2>
          <p className="text-lg sm:text-xl text-[var(--theme-text-primary)]/90 font-light mt-4 max-w-3xl leading-relaxed">
            {aboutIntro}
          </p>
          <div className="space-y-3 mt-4 max-w-3xl">
            {aboutParagraphs.slice(0, 2).map((p, idx) => (
              <p
                key={idx}
                className="text-xs sm:text-sm text-[var(--theme-text-muted)] leading-relaxed font-sans"
              >
                {p}
              </p>
            ))}
          </div>
        </div>

        {/* Structured Team Information: Student Coordinators & Operational Leads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          {/* 1. COORDINATORS */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.2em] text-[var(--theme-accent)] font-semibold pb-3 border-b border-[var(--theme-border)]">
              Secretariat Coordinators
            </h3>
            {coordinatorMembers.length > 0 ? (
              <ul className="space-y-3 font-sans">
                {coordinatorMembers.map((m) => (
                  <li key={m.id} className="group">
                    <div className="text-sm font-semibold text-[var(--theme-text-primary)] group-hover:text-[var(--theme-accent)] transition-colors">
                      {m.name}
                    </div>
                    <div className="text-xs text-[var(--theme-text-muted)]">
                      {m.designation}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[var(--theme-text-muted)]">Student Coordinators</p>
            )}
          </div>

          {/* 2. OPERATIONAL LEADS */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.2em] text-[var(--theme-accent)] font-semibold pb-3 border-b border-[var(--theme-border)]">
              Departmental Team Leads
            </h3>
            {functionalLeads.length > 0 ? (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
                {functionalLeads.map((m) => (
                  <li key={m.id} className="group">
                    <div className="text-sm font-semibold text-[var(--theme-text-primary)] group-hover:text-[var(--theme-accent)] transition-colors">
                      {m.name}
                    </div>
                    <div className="text-xs text-[var(--theme-text-muted)] truncate">
                      {m.designation} &bull; {m.teamGroup || "Lead"}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[var(--theme-text-muted)]">Organizing Committee</p>
            )}
          </div>
        </div>

        {/* Footer Navigation Links */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-8 border-t border-[var(--theme-border)] text-xs uppercase tracking-wider font-medium">
          <Link
            href="/about"
            className="inline-flex items-center gap-1.5 text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-colors"
          >
            <span>Learn More About Festival</span>
            <ArrowRight className="w-3.5 h-3.5 text-[var(--theme-accent)]" />
          </Link>
          <Link
            href="/team"
            className="inline-flex items-center gap-1.5 text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-colors"
          >
            <span>Meet Full Team &rarr;</span>
            <ArrowRight className="w-3.5 h-3.5 text-[var(--theme-accent)]" />
          </Link>
        </div>
      </div>
    </section>
  );
}
