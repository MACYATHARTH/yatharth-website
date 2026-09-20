import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { getActiveEdition, getAllEditionsAdmin } from "@/lib/data/edition.service";
import { getAllEventsAdmin } from "@/lib/data/event.service";
import { getAllGalleryItemsAdmin } from "@/lib/data/gallery.service";
import { getAllScheduleEntriesAdmin, getAllVenues } from "@/lib/data/schedule.service";
import { getLinktreeAdmin, getAllFestivalLinksAdmin } from "@/lib/data/link.service";
import { getAllFestivalTeamsAdmin } from "@/lib/data/team.service";
import { getAllFacultyMembersAdmin } from "@/lib/data/faculty.service";
import { getAllAnnouncementsAdmin } from "@/lib/data/announcement.service";
import { resolveThemeTokens } from "@/lib/data/theme.config";
import { ThemePresetName, ContactPageSettings } from "@/lib/data/types";
import { AdminClient } from "./AdminClient";

export const metadata: Metadata = {
  title: "Master Admin Console | YATHARTH",
  description: "Festival management portal for appearance, branding, content, events, team, gallery, and official links.",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  const [
    edition,
    events,
    galleryItems,
    linktree,
    links,
    teams,
    scheduleEntries,
    venues,
    faculty,
    announcements,
    allEditions,
  ] = await Promise.all([
    getActiveEdition().catch(() => null),
    getAllEventsAdmin().catch(() => []),
    getAllGalleryItemsAdmin().catch(() => []),
    getLinktreeAdmin().catch(() => ({ url: "", enabled: false })),
    getAllFestivalLinksAdmin().catch(() => []),
    getAllFestivalTeamsAdmin().catch(() => []),
    getAllScheduleEntriesAdmin().catch(() => []),
    getAllVenues().catch(() => []),
    getAllFacultyMembersAdmin().catch(() => []),
    getAllAnnouncementsAdmin().catch(() => []),
    getAllEditionsAdmin().catch(() => []),
  ]);

  const themeSettings = edition?.themeSettings || {};
  const wallpaperUrl =
    (themeSettings.wallpaperUrl as string) || "/assets/wallpaper/yatharth-wallpaper.jpg";

  const overlayOpacity =
    typeof themeSettings.wallpaperOverlayOpacity === "number"
      ? (themeSettings.wallpaperOverlayOpacity as number)
      : 0.58;

  const logoUrl = (themeSettings.logoUrl as string) || null;
  const fontSans = (themeSettings.fontSans as string) || "geist";
  const fontDisplay = (themeSettings.fontDisplay as string) || "graduate";
  const themePreset = (themeSettings.themePreset as ThemePresetName) || "dark-festival";
  const themeTokens = resolveThemeTokens(themeSettings);

  const initialContent = {
    themeTitle: (themeSettings.themeTitle as string) || "Voice, Vision & Veracity",
    tagline: (themeSettings.tagline as string) || "The Annual National Media & Journalism Festival",
    heroSupportingCopy: (themeSettings.heroSupportingCopy as string) || "Annual Festival • University of Delhi",
    college: (themeSettings.college as string) || "Maharaja Agrasen College, University of Delhi",
    department: (themeSettings.department as string) || "Department of Journalism",
    aboutIntro:
      (themeSettings.aboutIntro as string) ||
      "A student-led celebration of creativity, competition, and courageous storytelling.",
    aboutParagraphs:
      Array.isArray(themeSettings.aboutParagraphs) && themeSettings.aboutParagraphs.length > 0
        ? (themeSettings.aboutParagraphs as string[])
        : [
            "Hosted by the Department of Journalism at Maharaja Agrasen College, University of Delhi, YATHARTH is the annual national media festival uniting passionate collegiate journalists, photographers, designers, and storytellers from across India.",
            "Rooted in the pursuit of truth, creative craft, and ethical practice, the festival offers a rigorous platform for students to test their abilities across print investigative journalism, live reporting, photojournalism, and broadcasting.",
            "Beyond competitions, YATHARTH is an open forum of ideas — bringing industry leaders, media mentors, and university delegates together for critical dialogues, workshops, and commemorative stage presentations.",
          ],
    contactEmail: (themeSettings.contactEmail as string) || "yatharth@mac.du.ac.in",
    contactPhone: (themeSettings.contactPhone as string) || "+91 98112 34567",
    contactAddress:
      (themeSettings.contactAddress as string) ||
      "Maharaja Agrasen College, Vasundhara Enclave, Delhi 110096",
  };

  // User has been verified by getAdminSession() at top of page
  const isAuthorizedAdmin = true;

  return (
    <AdminClient
      initialAppearance={{
        wallpaperUrl,
        overlayOpacity,
        logoUrl,
        fontSans,
        fontDisplay,
        themePreset,
        themeTokens,
      }}
      initialContent={initialContent}
      initialDates={{
        startDate: edition?.startDate || null,
        endDate: edition?.endDate || null,
        isDateConfirmed: edition?.isDateConfirmed ?? false,
      }}
      initialEvents={events}
      initialGallery={galleryItems}
      initialLinktree={linktree}
      initialLinks={links}
      initialTeams={teams}
      initialSchedule={scheduleEntries}
      initialVenues={venues}
      initialFaculty={faculty}
      initialAnnouncements={announcements}
      initialContactSettings={themeSettings.contactSettings as ContactPageSettings | undefined}
      initialEditions={allEditions}
      activeEdition={edition}
      isDevelopment={isAuthorizedAdmin}
    />
  );
}
