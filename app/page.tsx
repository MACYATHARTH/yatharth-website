import { getActiveEdition, formatEditionBranding } from "@/lib/data/edition.service";
import { getEvents } from "@/lib/data/event.service";
import { getScheduleEntries } from "@/lib/data/schedule.service";
import { getAnnouncements } from "@/lib/data/announcement.service";
import { getGalleryItems } from "@/lib/data/gallery.service";
import { getFestivalTeams } from "@/lib/data/team.service";
import { getFestivalLinks } from "@/lib/data/link.service";

import { HeroSceneKairo } from "@/components/home/HeroSceneKairo";
import { MarqueeTransition } from "@/components/home/MarqueeTransition";
import { EventsVisualRibbon } from "@/components/home/EventsVisualRibbon";
import { SchedulePreviewSection } from "@/components/home/SchedulePreviewSection";
import { DispatchWire } from "@/components/home/DispatchWire";
import { GalleryMarqueeRibbon } from "@/components/home/GalleryMarqueeRibbon";
import { AboutFestSection } from "@/components/home/AboutFestSection";
import { SocialMediaSection } from "@/components/home/SocialMediaSection";

export default async function HomePage() {
  const [
    edition,
    events,
    scheduleEntries,
    announcements,
    galleryPhotos,
    teams,
    links,
  ] = await Promise.all([
    getActiveEdition(),
    getEvents(),
    getScheduleEntries(),
    getAnnouncements(6),
    getGalleryItems("ALL"),
    getFestivalTeams(),
    getFestivalLinks(),
  ]);

  const branding = formatEditionBranding(edition);

  // Determine dynamic registration destination from config / links
  const regLink = links.find(
    (l) =>
      l.category === "REGISTRATION" ||
      l.platform === "GOOGLE_FORM" ||
      l.platform === "LINKTREE" ||
      l.label.toLowerCase().includes("register")
  );
  const themeRegUrl = (edition?.themeSettings?.registrationUrl as string) || null;
  const registrationUrl = themeRegUrl || regLink?.url || "/events";

  return (
    <div className="flex flex-col min-h-screen bg-transparent text-[var(--theme-text-primary)] selection:bg-[var(--theme-accent)] selection:text-white">
      {/* ─── 01 / HERO — Replaceable Fest Logo, Dates to be Announced, Register CTA ─── */}
      <HeroSceneKairo edition={edition} registrationUrl={registrationUrl} />

      {/* ─── 02 / EVENTS — Autonomous Infinite Horizontal Visual Ribbon ─── */}
      <EventsVisualRibbon events={events} />

      {/* ─── 03 / REGISTER NOW MARQUEE — Prominently placed immediately after event posters ─── */}
      <MarqueeTransition registrationUrl={registrationUrl} editionTitle={branding.fullBranding} />

      {/* ─── 04 / SCHEDULE — Day Tabs, Tabular View (Time | Event | Venue) ─── */}
      <SchedulePreviewSection entries={scheduleEntries} />

      {/* ─── 05 / ANNOUNCEMENTS — Clean Numbered List with Directional Action ─── */}
      <DispatchWire announcements={announcements} />

      {/* ─── 06 / GALLERY — Autonomous Infinite Filmstrip / Visual Memory Ribbon ─── */}
      <GalleryMarqueeRibbon items={galleryPhotos} />

      {/* ─── 07 / ABOUT YATHARTH — Festival Statement, Coordinators, Organizers ─── */}
      <AboutFestSection edition={edition} teams={teams} />

      {/* ─── 08 / SOCIAL MEDIA — Official Verified Channels ─── */}
      <SocialMediaSection links={links} />
    </div>
  );
}
