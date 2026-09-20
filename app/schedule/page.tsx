import { Metadata } from "next";
import { getScheduleEntries } from "@/lib/data/schedule.service";
import { ScheduleTimelineClient } from "@/components/schedule/ScheduleTimelineClient";
import { BackToHome } from "@/components/layout/BackToHome";
import { Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Festival Schedule & Event Agenda Timeline",
  description:
    "Explore the complete multi-day schedule for YATHARTH: Inaugural keynote, broadcast lab challenges, photojournalism rounds, media quiz, and valedictory awards.",
};

export default async function SchedulePage() {
  const entries = await getScheduleEntries();

  return (
    <div className="pt-28 sm:pt-36 pb-20 min-h-screen text-[var(--theme-text-primary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <BackToHome currentPage="Schedule" />
        {/* Header Billboard */}
        <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)]/60 backdrop-blur-md p-8 sm:p-12 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--theme-surface-secondary)] border border-[var(--theme-border)] text-[11px] font-mono uppercase tracking-wider text-[var(--theme-text-muted)]">
            <Clock className="w-3.5 h-3.5 text-[var(--theme-accent)]" />
            <span>Festival Timeline</span>
          </div>
          <div className="space-y-2">
            <span className="font-mono text-xs tracking-widest text-[var(--theme-accent)] uppercase block">
              Programme Schedule
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--theme-text-primary)] tracking-tight font-varsity uppercase">
              Festival Agenda &amp; Timeline
            </h1>
          </div>
          <p className="text-sm sm:text-base text-[var(--theme-text-muted)] max-w-3xl leading-relaxed">
            A structured multi-day sequence of academic keynotes, competitions, workshops, and grand valedictory awards. All delegates are advised to report before slot times at designated venue desks.
          </p>
        </div>

        {/* Schedule Timeline Client */}
        <ScheduleTimelineClient entries={entries} />
      </div>
    </div>
  );
}
