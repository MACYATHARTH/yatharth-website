import { Metadata } from "next";
import { getAnnouncements } from "@/lib/data/announcement.service";
import { AnnouncementsClient } from "@/components/announcements/AnnouncementsClient";
import { BackToHome } from "@/components/layout/BackToHome";
import { Bell } from "lucide-react";

export const metadata: Metadata = {
  title: "Announcements, Circulars & Official Press Releases",
  description:
    "Official notices, schedule updates, competition rule clarifications, and media press releases for YATHARTH.",
};

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncements();

  return (
    <div className="pt-28 sm:pt-36 pb-20 min-h-screen text-[var(--theme-text-primary)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <BackToHome currentPage="Announcements" />
        {/* Header Billboard */}
        <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)]/60 backdrop-blur-md p-8 sm:p-12 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--theme-surface-secondary)] border border-[var(--theme-border)] text-[11px] font-mono uppercase tracking-wider text-[var(--theme-text-muted)]">
            <Bell className="w-3.5 h-3.5 text-[var(--theme-accent)]" />
            <span>Festival Updates</span>
          </div>
          <div className="space-y-2">
            <span className="font-mono text-xs tracking-widest text-[var(--theme-accent)] uppercase block">
              Official Notices
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--theme-text-primary)] tracking-tight font-varsity uppercase">
              Announcements &amp; Circulars
            </h1>
          </div>
          <p className="text-sm sm:text-base text-[var(--theme-text-muted)] max-w-3xl leading-relaxed">
            Timely notifications, registration bulletins, rulebook updates, and official communications published by the festival coordination committee.
          </p>
        </div>

        {/* Announcements Client */}
        <AnnouncementsClient initialAnnouncements={announcements} />
      </div>
    </div>
  );
}
