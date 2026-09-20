import { Metadata } from "next";
import { getEvents } from "@/lib/data/event.service";
import { EventsScrollClient } from "@/components/events/EventsScrollClient";
import { BackToHome } from "@/components/layout/BackToHome";

export const metadata: Metadata = {
  title: "Events Directory & Competition Rulebooks",
  description:
    "Explore all competitive journalism, broadcast media, photography, and quizzing events for YATHARTH. Download official rules and register college delegations.",
};

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className="pt-28 pb-20 min-h-screen text-[var(--theme-text-primary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="border-b border-[var(--theme-border)] pb-10 space-y-4">
          <BackToHome currentPage="Events" />
          <div className="text-[11px] font-mono tracking-[0.25em] text-[var(--theme-accent)] uppercase font-bold">
            Competitions Directory
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-[var(--theme-text-primary)] tracking-tight font-varsity uppercase">
            Festival Competitions
          </h1>
          <p className="text-xs sm:text-sm font-mono text-[var(--theme-text-muted)] max-w-2xl leading-relaxed">
            Poster-first arena of national inter-college challenges across print, broadcast, lens, and quiz desks. Verified rules, prize pools, and registration links.
          </p>
        </div>

        {/* Poster-First Scroll Client */}
        <EventsScrollClient initialEvents={events} />
      </div>
    </div>
  );
}
