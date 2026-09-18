import { prisma } from "@/lib/prisma";
import { DEMO_SCHEDULE } from "./demo-data";
import { ScheduleEntry, Event } from "./types";

export async function getScheduleEntries(dayNumber?: number): Promise<ScheduleEntry[]> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    let entries = [...DEMO_SCHEDULE];
    if (dayNumber) {
      entries = entries.filter((s) => s.dayNumber === dayNumber);
    }
    return entries;
  }

  const entries = await prisma.scheduleEntry.findMany({
    where: {
      isPublished: true,
      ...(dayNumber ? { dayNumber } : {}),
    },
    include: {
      event: true,
      venue: true,
    },
    orderBy: [
      { dayNumber: "asc" },
      { startTime: "asc" },
      { displayOrder: "asc" },
    ],
  });

  return entries.map((s) => ({
    id: s.id,
    editionId: s.editionId,
    eventId: s.eventId,
    venueId: s.venueId,
    title: s.title || (s.event ? s.event.title : null),
    description: s.description || (s.event ? s.event.shortDescription : null),
    calendarDate: s.calendarDate ? s.calendarDate.toISOString() : null,
    dayNumber: s.dayNumber,
    startTime: s.startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    endTime: s.endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    status: s.status as ScheduleEntry["status"],
    displayOrder: s.displayOrder,
    isPublished: s.isPublished,
    event: s.event
      ? {
          id: s.event.id,
          editionId: s.event.editionId,
          slug: s.event.slug,
          title: s.event.title,
          category: s.event.category,
          shortDescription: s.event.shortDescription,
          fullDescription: s.event.fullDescription,
          rules: s.event.rules,
          prizes: s.event.prizes,
          eligibility: s.event.eligibility,
          participationType: s.event.participationType as "INDIVIDUAL" | "TEAM",
          teamSizeLimit: s.event.teamSizeLimit,
          registrationStatus: s.event.registrationStatus as Event["registrationStatus"],
          registrationUrl: s.event.registrationUrl,
          venueId: s.event.venueId,
          displayOrder: s.event.displayOrder,
          posterUrl: s.event.posterUrl,
          published: s.event.published,
        }
      : null,
    venue: s.venue
      ? {
          id: s.venue.id,
          name: s.venue.name,
          building: s.venue.building,
          floor: s.venue.floor,
          roomNumber: s.venue.roomNumber,
          capacity: s.venue.capacity,
          mapUrl: s.venue.mapUrl,
          directions: s.venue.directions,
        }
      : null,
  }));
}

export async function getAllScheduleEntriesAdmin(): Promise<ScheduleEntry[]> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    return [...DEMO_SCHEDULE].sort((a, b) => {
      if (a.dayNumber !== b.dayNumber) return a.dayNumber - b.dayNumber;
      return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
    });
  }

  const entries = await prisma.scheduleEntry.findMany({
    include: {
      event: true,
      venue: true,
    },
    orderBy: [
      { dayNumber: "asc" },
      { startTime: "asc" },
      { displayOrder: "asc" },
    ],
  });

  return entries.map((s) => ({
    id: s.id,
    editionId: s.editionId,
    eventId: s.eventId,
    venueId: s.venueId,
    title: s.title || (s.event ? s.event.title : null),
    description: s.description || (s.event ? s.event.shortDescription : null),
    calendarDate: s.calendarDate ? s.calendarDate.toISOString() : null,
    dayNumber: s.dayNumber,
    startTime: s.startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    endTime: s.endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    status: s.status as ScheduleEntry["status"],
    displayOrder: s.displayOrder,
    isPublished: s.isPublished,
    event: s.event
      ? {
          id: s.event.id,
          editionId: s.event.editionId,
          slug: s.event.slug,
          title: s.event.title,
          category: s.event.category,
          shortDescription: s.event.shortDescription,
          fullDescription: s.event.fullDescription,
          rules: s.event.rules,
          prizes: s.event.prizes,
          eligibility: s.event.eligibility,
          participationType: s.event.participationType as "INDIVIDUAL" | "TEAM",
          teamSizeLimit: s.event.teamSizeLimit,
          registrationStatus: s.event.registrationStatus as Event["registrationStatus"],
          registrationUrl: s.event.registrationUrl,
          venueId: s.event.venueId,
          displayOrder: s.event.displayOrder,
          posterUrl: s.event.posterUrl,
          published: s.event.published,
        }
      : null,
    venue: s.venue
      ? {
          id: s.venue.id,
          name: s.venue.name,
          building: s.venue.building,
          floor: s.venue.floor,
          roomNumber: s.venue.roomNumber,
          capacity: s.venue.capacity,
          mapUrl: s.venue.mapUrl,
          directions: s.venue.directions,
        }
      : null,
  }));
}

export async function createScheduleEntry(data: {
  title?: string | null;
  description?: string | null;
  eventId?: string | null;
  venueId?: string | null;
  dayNumber: number;
  calendarDate?: string | null;
  startTime: string;
  endTime: string;
  status?: "UPCOMING" | "LIVE" | "COMPLETED";
  displayOrder?: number;
  isPublished?: boolean;
}): Promise<ScheduleEntry> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    const { DEMO_EVENTS, DEMO_VENUES } = await import("./demo-data");
    const matchedEvent = data.eventId ? DEMO_EVENTS.find((e) => e.id === data.eventId) : undefined;
    const matchedVenue = data.venueId ? DEMO_VENUES.find((v) => v.id === data.venueId) : undefined;

    const newEntry: ScheduleEntry = {
      id: `sch-${Date.now()}`,
      editionId: "edition-yatharth-26",
      eventId: data.eventId || null,
      venueId: data.venueId || null,
      title: data.title || (matchedEvent ? matchedEvent.title : "Scheduled Session"),
      description: data.description || (matchedEvent ? matchedEvent.shortDescription : ""),
      calendarDate: data.calendarDate || (data.dayNumber === 1 ? "2026-10-24" : "2026-10-25"),
      dayNumber: Number(data.dayNumber) || 1,
      startTime: data.startTime || "10:00 AM",
      endTime: data.endTime || "11:30 AM",
      status: data.status || "UPCOMING",
      displayOrder: data.displayOrder ?? DEMO_SCHEDULE.length + 1,
      isPublished: data.isPublished !== undefined ? data.isPublished : true,
      event: matchedEvent || null,
      venue: matchedVenue || null,
    };

    DEMO_SCHEDULE.push(newEntry);
    return newEntry;
  }

  const activeEdition = await prisma.edition.findFirst({ where: { status: "ACTIVE" } });
  if (!activeEdition) throw new Error("Active edition not found");

  const baseDate = data.calendarDate ? new Date(data.calendarDate) : new Date("2026-10-24");
  const startDateTime = new Date(baseDate);
  const endDateTime = new Date(baseDate);

  const created = await prisma.scheduleEntry.create({
    data: {
      editionId: activeEdition.id,
      eventId: data.eventId || null,
      venueId: data.venueId || null,
      title: data.title || null,
      description: data.description || null,
      calendarDate: baseDate,
      dayNumber: Number(data.dayNumber) || 1,
      startTime: startDateTime,
      endTime: endDateTime,
      status: data.status || "UPCOMING",
      displayOrder: data.displayOrder || 0,
      isPublished: data.isPublished !== undefined ? data.isPublished : true,
    },
    include: {
      event: true,
      venue: true,
    },
  });

  return {
    id: created.id,
    editionId: created.editionId,
    eventId: created.eventId,
    venueId: created.venueId,
    title: created.title || (created.event ? created.event.title : null),
    description: created.description || (created.event ? created.event.shortDescription : null),
    calendarDate: created.calendarDate ? created.calendarDate.toISOString() : null,
    dayNumber: created.dayNumber,
    startTime: data.startTime || "10:00 AM",
    endTime: data.endTime || "11:30 AM",
    status: created.status as ScheduleEntry["status"],
    displayOrder: created.displayOrder,
    isPublished: created.isPublished,
    event: created.event as unknown as Event,
    venue: created.venue as unknown as ScheduleEntry["venue"],
  };
}

export async function updateScheduleEntry(
  id: string,
  data: Partial<{
    title?: string | null;
    description?: string | null;
    eventId?: string | null;
    venueId?: string | null;
    dayNumber?: number;
    calendarDate?: string | null;
    startTime?: string;
    endTime?: string;
    status?: "UPCOMING" | "LIVE" | "COMPLETED";
    displayOrder?: number;
    isPublished?: boolean;
  }>
): Promise<ScheduleEntry> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    const { DEMO_EVENTS, DEMO_VENUES } = await import("./demo-data");
    const entryIndex = DEMO_SCHEDULE.findIndex((s) => s.id === id);
    if (entryIndex === -1) throw new Error(`Schedule entry ${id} not found`);

    const current = DEMO_SCHEDULE[entryIndex];
    const eventId = data.eventId !== undefined ? data.eventId : current.eventId;
    const venueId = data.venueId !== undefined ? data.venueId : current.venueId;
    const matchedEvent = eventId ? DEMO_EVENTS.find((e) => e.id === eventId) : null;
    const matchedVenue = venueId ? DEMO_VENUES.find((v) => v.id === venueId) : null;

    const updated: ScheduleEntry = {
      ...current,
      ...data,
      eventId,
      venueId,
      title: data.title !== undefined ? data.title : current.title,
      description: data.description !== undefined ? data.description : current.description,
      dayNumber: data.dayNumber !== undefined ? Number(data.dayNumber) : current.dayNumber,
      event: matchedEvent,
      venue: matchedVenue,
    };

    DEMO_SCHEDULE[entryIndex] = updated;
    return updated;
  }

  const updated = await prisma.scheduleEntry.update({
    where: { id },
    data: {
      ...(data.eventId !== undefined ? { eventId: data.eventId } : {}),
      ...(data.venueId !== undefined ? { venueId: data.venueId } : {}),
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.dayNumber !== undefined ? { dayNumber: Number(data.dayNumber) } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.displayOrder !== undefined ? { displayOrder: data.displayOrder } : {}),
      ...(data.isPublished !== undefined ? { isPublished: data.isPublished } : {}),
    },
    include: {
      event: true,
      venue: true,
    },
  });

  return {
    id: updated.id,
    editionId: updated.editionId,
    eventId: updated.eventId,
    venueId: updated.venueId,
    title: updated.title || (updated.event ? updated.event.title : null),
    description: updated.description || (updated.event ? updated.event.shortDescription : null),
    calendarDate: updated.calendarDate ? updated.calendarDate.toISOString() : null,
    dayNumber: updated.dayNumber,
    startTime: data.startTime || updated.startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    endTime: data.endTime || updated.endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    status: updated.status as ScheduleEntry["status"],
    displayOrder: updated.displayOrder,
    isPublished: updated.isPublished,
    event: updated.event as unknown as Event,
    venue: updated.venue as unknown as ScheduleEntry["venue"],
  };
}

export async function deleteScheduleEntry(id: string): Promise<boolean> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    const idx = DEMO_SCHEDULE.findIndex((s) => s.id === id);
    if (idx !== -1) {
      DEMO_SCHEDULE.splice(idx, 1);
      return true;
    }
    return false;
  }

  await prisma.scheduleEntry.delete({ where: { id } });
  return true;
}

export async function getAllVenues(): Promise<import("./types").Venue[]> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    const { DEMO_VENUES } = await import("./demo-data");
    return DEMO_VENUES;
  }

  return await prisma.venue.findMany({
    orderBy: { name: "asc" },
  });
}