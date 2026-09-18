import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  Prisma,
  EditionStatus,
  RegistrationStatus,
  PriorityLevel,
  SponsorTier,
  TeamType,
  CoordinatorRole,
  FacultyRole,
} from "../generated/prisma";
import {
  DEMO_EDITION,
  DEMO_VENUES,
  DEMO_PEOPLE,
  DEMO_TEAMS,
  DEMO_TEAM,
  DEMO_EVENTS,
  DEMO_COORDINATORS,
  DEMO_SCHEDULE,
  DEMO_ANNOUNCEMENTS,
  DEMO_SPONSORS,
  DEMO_GALLERY,
  DEMO_FESTIVAL_LINKS,
  DEMO_FACULTY,
} from "../lib/data/demo-data";

function parseScheduleTime(calendarDate: string, timeStr: string): Date {
  const parts = timeStr.trim().split(/\s+/);
  if (parts.length !== 2) {
    throw new Error(`Invalid time format "${timeStr}". Expected format "HH:MM AM/PM"`);
  }
  const [time, period] = parts;
  const [hStr, mStr] = time.split(":");
  let hours = Number(hStr);
  const minutes = Number(mStr);
  if (isNaN(hours) || isNaN(minutes)) {
    throw new Error(`Invalid time components in "${timeStr}"`);
  }
  const upperPeriod = period.toUpperCase();
  if (upperPeriod === "PM" && hours < 12) hours += 12;
  if (upperPeriod === "AM" && hours === 12) hours = 0;
  const pad = (n: number) => String(n).padStart(2, "0");
  return new Date(`${calendarDate}T${pad(hours)}:${pad(minutes)}:00+05:30`);
}

export async function seed() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Missing DATABASE_URL or DIRECT_URL in environment.");
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  console.log("Beginning YATHARTH '26 production seed...");

  try {
    // 1. Edition
    console.log("Seeding Edition...");
    const themeSettingsJson = (DEMO_EDITION.themeSettings ?? {}) as Prisma.InputJsonValue;
    await prisma.edition.upsert({
      where: { id: DEMO_EDITION.id },
      create: {
        id: DEMO_EDITION.id,
        code: DEMO_EDITION.code,
        name: DEMO_EDITION.name,
        year: DEMO_EDITION.year,
        status: DEMO_EDITION.status as EditionStatus,
        startDate: DEMO_EDITION.startDate ? new Date(DEMO_EDITION.startDate) : null,
        endDate: DEMO_EDITION.endDate ? new Date(DEMO_EDITION.endDate) : null,
        countdownTarget: DEMO_EDITION.countdownTarget ? new Date(DEMO_EDITION.countdownTarget) : null,
        isDateConfirmed: DEMO_EDITION.isDateConfirmed,
        themeSettings: themeSettingsJson,
      },
      update: {
        code: DEMO_EDITION.code,
        name: DEMO_EDITION.name,
        year: DEMO_EDITION.year,
        status: DEMO_EDITION.status as EditionStatus,
        startDate: DEMO_EDITION.startDate ? new Date(DEMO_EDITION.startDate) : null,
        endDate: DEMO_EDITION.endDate ? new Date(DEMO_EDITION.endDate) : null,
        countdownTarget: DEMO_EDITION.countdownTarget ? new Date(DEMO_EDITION.countdownTarget) : null,
        isDateConfirmed: DEMO_EDITION.isDateConfirmed,
        themeSettings: themeSettingsJson,
      },
    });

    // 2. Venues
    console.log(`Seeding ${DEMO_VENUES.length} Venues...`);
    for (const v of DEMO_VENUES) {
      await prisma.venue.upsert({
        where: { id: v.id },
        create: {
          id: v.id,
          name: v.name,
          building: v.building,
          floor: v.floor ?? null,
          roomNumber: v.roomNumber ?? null,
          capacity: v.capacity ?? null,
          mapUrl: v.mapUrl ?? null,
          directions: v.directions ?? null,
        },
        update: {
          name: v.name,
          building: v.building,
          floor: v.floor ?? null,
          roomNumber: v.roomNumber ?? null,
          capacity: v.capacity ?? null,
          mapUrl: v.mapUrl ?? null,
          directions: v.directions ?? null,
        },
      });
    }

    // 3. People
    console.log(`Seeding ${DEMO_PEOPLE.length} People...`);
    for (const p of DEMO_PEOPLE) {
      const socialLinksJson = p.socialLinks ? (p.socialLinks as Prisma.InputJsonValue) : Prisma.JsonNull;
      await prisma.person.upsert({
        where: { id: p.id },
        create: {
          id: p.id,
          name: p.name,
          email: p.email ?? null,
          phone: p.phone ?? null,
          avatarUrl: p.avatarUrl ?? null,
          bio: p.bio ?? null,
          socialLinks: socialLinksJson,
        },
        update: {
          name: p.name,
          email: p.email ?? null,
          phone: p.phone ?? null,
          avatarUrl: p.avatarUrl ?? null,
          bio: p.bio ?? null,
          socialLinks: socialLinksJson,
        },
      });
    }

    // 4. Festival Teams
    console.log(`Seeding ${DEMO_TEAMS.length} Teams...`);
    for (const t of DEMO_TEAMS) {
      await prisma.festivalTeam.upsert({
        where: { id: t.id },
        create: {
          id: t.id,
          editionId: t.editionId,
          name: t.name,
          teamType: t.teamType as TeamType,
          displayOrder: t.displayOrder,
          isPublished: t.isPublished,
        },
        update: {
          editionId: t.editionId,
          name: t.name,
          teamType: t.teamType as TeamType,
          displayOrder: t.displayOrder,
          isPublished: t.isPublished,
        },
      });
    }

    // 5. Team Members
    console.log(`Seeding ${DEMO_TEAM.length} Team Members...`);
    for (const m of DEMO_TEAM) {
      await prisma.teamMember.upsert({
        where: { id: m.id },
        create: {
          id: m.id,
          editionId: m.editionId,
          personId: m.personId,
          teamId: m.teamId,
          designation: m.designation,
          displayOrder: m.displayOrder,
          isPublished: m.isPublished,
        },
        update: {
          editionId: m.editionId,
          personId: m.personId,
          teamId: m.teamId,
          designation: m.designation,
          displayOrder: m.displayOrder,
          isPublished: m.isPublished,
        },
      });
    }

    // 6. Events
    console.log(`Seeding ${DEMO_EVENTS.length} Events...`);
    for (const e of DEMO_EVENTS) {
      await prisma.event.upsert({
        where: { id: e.id },
        create: {
          id: e.id,
          editionId: e.editionId,
          slug: e.slug,
          title: e.title,
          category: e.category,
          shortDescription: e.shortDescription,
          fullDescription: e.fullDescription,
          rules: e.rules,
          prizes: e.prizes,
          eligibility: e.eligibility ?? null,
          participationType: e.participationType,
          teamSizeLimit: e.teamSizeLimit ?? null,
          registrationStatus: e.registrationStatus as RegistrationStatus,
          registrationUrl: e.registrationUrl ?? null,
          venueId: e.venueId ?? null,
          displayOrder: e.displayOrder,
          posterUrl: e.posterUrl ?? null,
          published: e.published,
        },
        update: {
          editionId: e.editionId,
          slug: e.slug,
          title: e.title,
          category: e.category,
          shortDescription: e.shortDescription,
          fullDescription: e.fullDescription,
          rules: e.rules,
          prizes: e.prizes,
          eligibility: e.eligibility ?? null,
          participationType: e.participationType,
          teamSizeLimit: e.teamSizeLimit ?? null,
          registrationStatus: e.registrationStatus as RegistrationStatus,
          registrationUrl: e.registrationUrl ?? null,
          venueId: e.venueId ?? null,
          displayOrder: e.displayOrder,
          posterUrl: e.posterUrl ?? null,
          published: e.published,
        },
      });
    }

    // 7. Event Coordinators
    console.log(`Seeding ${DEMO_COORDINATORS.length} Event Coordinators...`);
    for (const c of DEMO_COORDINATORS) {
      await prisma.eventCoordinator.upsert({
        where: { id: c.id },
        create: {
          id: c.id,
          eventId: c.eventId,
          personId: c.personId,
          role: c.role as CoordinatorRole,
          contactOverride: c.contactOverride ?? null,
          displayOrder: c.displayOrder,
        },
        update: {
          eventId: c.eventId,
          personId: c.personId,
          role: c.role as CoordinatorRole,
          contactOverride: c.contactOverride ?? null,
          displayOrder: c.displayOrder,
        },
      });
    }

    // 8. Schedule Entries
    console.log(`Seeding ${DEMO_SCHEDULE.length} Schedule Entries...`);
    for (const s of DEMO_SCHEDULE) {
      if (!s.calendarDate) {
        throw new Error(`Schedule entry "${s.id}" is missing required calendarDate`);
      }
      if (!s.startTime) {
        throw new Error(`Schedule entry "${s.id}" is missing required startTime`);
      }
      if (!s.endTime) {
        throw new Error(`Schedule entry "${s.id}" is missing required endTime`);
      }
      const startDate = parseScheduleTime(s.calendarDate, s.startTime);
      const endDate = parseScheduleTime(s.calendarDate, s.endTime);
      await prisma.scheduleEntry.upsert({
        where: { id: s.id },
        create: {
          id: s.id,
          editionId: s.editionId,
          eventId: s.eventId ?? null,
          venueId: s.venueId ?? null,
          title: s.title ?? null,
          description: s.description ?? null,
          calendarDate: new Date(s.calendarDate),
          dayNumber: s.dayNumber,
          startTime: startDate,
          endTime: endDate,
          status: s.status,
          displayOrder: s.displayOrder,
          isPublished: s.isPublished,
        },
        update: {
          editionId: s.editionId,
          eventId: s.eventId ?? null,
          venueId: s.venueId ?? null,
          title: s.title ?? null,
          description: s.description ?? null,
          calendarDate: new Date(s.calendarDate),
          dayNumber: s.dayNumber,
          startTime: startDate,
          endTime: endDate,
          status: s.status,
          displayOrder: s.displayOrder,
          isPublished: s.isPublished,
        },
      });
    }

    // 9. Announcements
    console.log(`Seeding ${DEMO_ANNOUNCEMENTS.length} Announcements...`);
    for (const a of DEMO_ANNOUNCEMENTS) {
      await prisma.announcement.upsert({
        where: { id: a.id },
        create: {
          id: a.id,
          editionId: a.editionId,
          slug: a.slug,
          title: a.title,
          summary: a.summary,
          content: a.content,
          priority: a.priority as PriorityLevel,
          publishedAt: new Date(a.publishedAt),
          expiresAt: a.expiresAt ? new Date(a.expiresAt) : null,
          eventId: a.eventId ?? null,
          isPublished: a.isPublished,
          displayOrder: a.displayOrder,
        },
        update: {
          editionId: a.editionId,
          slug: a.slug,
          title: a.title,
          summary: a.summary,
          content: a.content,
          priority: a.priority as PriorityLevel,
          publishedAt: new Date(a.publishedAt),
          expiresAt: a.expiresAt ? new Date(a.expiresAt) : null,
          eventId: a.eventId ?? null,
          isPublished: a.isPublished,
          displayOrder: a.displayOrder,
        },
      });
    }

    // 10. Sponsors
    console.log(`Seeding ${DEMO_SPONSORS.length} Sponsors...`);
    for (const sp of DEMO_SPONSORS) {
      await prisma.sponsor.upsert({
        where: { id: sp.id },
        create: {
          id: sp.id,
          editionId: sp.editionId,
          name: sp.name,
          tier: sp.tier as SponsorTier,
          logoUrl: sp.logoUrl,
          websiteUrl: sp.websiteUrl ?? null,
          order: sp.order,
          isPublished: sp.isPublished,
        },
        update: {
          editionId: sp.editionId,
          name: sp.name,
          tier: sp.tier as SponsorTier,
          logoUrl: sp.logoUrl,
          websiteUrl: sp.websiteUrl ?? null,
          order: sp.order,
          isPublished: sp.isPublished,
        },
      });
    }

    // 11. Gallery Items
    console.log(`Seeding ${DEMO_GALLERY.length} Gallery Items...`);
    for (const g of DEMO_GALLERY) {
      const editionId = g.editionId || DEMO_EDITION.id;
      await prisma.galleryItem.upsert({
        where: { id: g.id },
        create: {
          id: g.id,
          editionId,
          title: g.title,
          category: g.category,
          caption: g.caption,
          altText: g.altText ?? null,
          mediaUrl: g.mediaUrl,
          aspectRatio: g.aspectRatio,
          photographer: g.photographer ?? null,
          year: g.year ?? null,
          displayOrder: g.displayOrder,
          isPublished: g.isPublished,
        },
        update: {
          editionId,
          title: g.title,
          category: g.category,
          caption: g.caption,
          altText: g.altText ?? null,
          mediaUrl: g.mediaUrl,
          aspectRatio: g.aspectRatio,
          photographer: g.photographer ?? null,
          year: g.year ?? null,
          displayOrder: g.displayOrder,
          isPublished: g.isPublished,
        },
      });
    }

    // 12. Festival Links
    console.log(`Seeding ${DEMO_FESTIVAL_LINKS.length} Festival Links...`);
    for (const l of DEMO_FESTIVAL_LINKS) {
      await prisma.festivalLink.upsert({
        where: { id: l.id },
        create: {
          id: l.id,
          editionId: l.editionId,
          platform: l.platform,
          url: l.url,
          label: l.label,
          category: l.category,
          displayOrder: l.displayOrder,
          isPublished: l.isPublished,
        },
        update: {
          editionId: l.editionId,
          platform: l.platform,
          url: l.url,
          label: l.label,
          category: l.category,
          displayOrder: l.displayOrder,
          isPublished: l.isPublished,
        },
      });
    }

    // 13. Faculty Members
    console.log(`Seeding ${DEMO_FACULTY.length} Faculty Members...`);
    for (const f of DEMO_FACULTY) {
      const editionId = f.editionId || DEMO_EDITION.id;
      await prisma.facultyMember.upsert({
        where: { id: f.id },
        create: {
          id: f.id,
          editionId,
          name: f.name,
          designation: f.designation,
          photoUrl: f.photoUrl ?? null,
          role: f.role as FacultyRole,
          displayOrder: f.displayOrder,
          isPublished: f.isPublished,
          email: f.email ?? null,
          department: f.department ?? null,
          institution: f.institution ?? null,
          bio: f.bio ?? null,
        },
        update: {
          editionId,
          name: f.name,
          designation: f.designation,
          photoUrl: f.photoUrl ?? null,
          role: f.role as FacultyRole,
          displayOrder: f.displayOrder,
          isPublished: f.isPublished,
          email: f.email ?? null,
          department: f.department ?? null,
          institution: f.institution ?? null,
          bio: f.bio ?? null,
        },
      });
    }

    console.log("YATHARTH '26 production seed prepared successfully!");
  } finally {
    await prisma.$disconnect();
  }
}

// Only execute if run directly
if (process.argv[1]?.includes("seed.ts")) {
  seed()
    .then(() => {
      console.log("Seed finished.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seed failed:", err);
      process.exit(1);
    });
}