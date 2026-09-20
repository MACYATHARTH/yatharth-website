import { prisma } from "@/lib/prisma";
import { DEMO_EVENTS } from "./demo-data";
import { Event, EventCoordinator, CoordinatorRole } from "./types";

export async function getEvents(filters?: {
  category?: string;
  search?: string;
}): Promise<Event[]> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    let events = [...DEMO_EVENTS];
    if (filters?.category && filters.category !== "ALL") {
      events = events.filter((e) => e.category.toLowerCase() === filters.category!.toLowerCase());
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      events = events.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          e.shortDescription.toLowerCase().includes(q)
      );
    }
    return events.map((e) => ({
      ...e,
      registrationEnabled: e.registrationEnabled !== undefined ? e.registrationEnabled : e.registrationStatus !== "NOT_AVAILABLE",
    }));
  }

  // Database mode: Error surfaces directly without silent masking
  const dbEvents = await prisma.event.findMany({
    where: {
      published: true,
      ...(filters?.category && filters.category !== "ALL"
        ? { category: { equals: filters.category, mode: "insensitive" } }
        : {}),
      ...(filters?.search
        ? {
            OR: [
              { title: { contains: filters.search, mode: "insensitive" } },
              { category: { contains: filters.search, mode: "insensitive" } },
              { shortDescription: { contains: filters.search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      venue: true,
      coordinators: {
        include: {
          person: true,
        },
        orderBy: { displayOrder: "asc" },
      },
    },
    orderBy: [{ displayOrder: "asc" }, { title: "asc" }],
  });

  return dbEvents.map((e) => {
    const coordinators: EventCoordinator[] = e.coordinators.map((c) => ({
      id: c.id,
      eventId: c.eventId,
      personId: c.personId,
      role: c.role as CoordinatorRole,
      contactOverride: c.contactOverride,
      displayOrder: c.displayOrder,
      person: c.person
        ? {
            id: c.person.id,
            name: c.person.name,
            email: c.person.email,
            phone: c.person.phone,
            avatarUrl: c.person.avatarUrl,
            bio: c.person.bio,
            socialLinks: c.person.socialLinks as Record<string, string> | null,
          }
        : undefined,
    }));

    return {
      id: e.id,
      editionId: e.editionId,
      slug: e.slug,
      title: e.title,
      category: e.category,
      shortDescription: e.shortDescription,
      fullDescription: e.fullDescription,
      rules: e.rules,
      prizes: e.prizes,
      eligibility: e.eligibility,
      participationType: e.participationType as Event["participationType"],
      teamSizeLimit: e.teamSizeLimit,
      registrationStatus: e.registrationStatus as Event["registrationStatus"],
      registrationUrl: e.registrationUrl,
      registrationEnabled: e.registrationStatus !== "NOT_AVAILABLE",
      venueId: e.venueId,
      displayOrder: e.displayOrder,
      posterUrl: e.posterUrl,
      published: e.published,
      venue: e.venue
        ? {
            id: e.venue.id,
            name: e.venue.name,
            building: e.venue.building,
            floor: e.venue.floor,
            roomNumber: e.venue.roomNumber,
            capacity: e.venue.capacity,
            mapUrl: e.venue.mapUrl,
            directions: e.venue.directions,
          }
        : null,
      coordinators,
      heads: coordinators, // Backwards compatibility
    };
  });
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    const found = DEMO_EVENTS.find((e) => e.slug === slug);
    if (!found) return null;
    return {
      ...found,
      registrationEnabled: found.registrationEnabled !== undefined ? found.registrationEnabled : found.registrationStatus !== "NOT_AVAILABLE",
    };
  }

  const e = await prisma.event.findUnique({
    where: { slug },
    include: {
      venue: true,
      coordinators: {
        include: {
          person: true,
        },
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  if (!e) return null;

  const coordinators: EventCoordinator[] = e.coordinators.map((c) => ({
    id: c.id,
    eventId: c.eventId,
    personId: c.personId,
    role: c.role as CoordinatorRole,
    contactOverride: c.contactOverride,
    displayOrder: c.displayOrder,
    person: c.person
      ? {
          id: c.person.id,
          name: c.person.name,
          email: c.person.email,
          phone: c.person.phone,
          avatarUrl: c.person.avatarUrl,
          bio: c.person.bio,
          socialLinks: c.person.socialLinks as Record<string, string> | null,
        }
      : undefined,
  }));

  return {
    id: e.id,
    editionId: e.editionId,
    slug: e.slug,
    title: e.title,
    category: e.category,
    shortDescription: e.shortDescription,
    fullDescription: e.fullDescription,
    rules: e.rules,
    prizes: e.prizes,
    eligibility: e.eligibility,
    participationType: e.participationType as Event["participationType"],
    teamSizeLimit: e.teamSizeLimit,
    registrationStatus: e.registrationStatus as Event["registrationStatus"],
    registrationUrl: e.registrationUrl,
    registrationEnabled: e.registrationStatus !== "NOT_AVAILABLE",
    venueId: e.venueId,
    displayOrder: e.displayOrder,
    posterUrl: e.posterUrl,
    published: e.published,
    venue: e.venue
      ? {
          id: e.venue.id,
          name: e.venue.name,
          building: e.venue.building,
          floor: e.venue.floor,
          roomNumber: e.venue.roomNumber,
          capacity: e.venue.capacity,
          mapUrl: e.venue.mapUrl,
          directions: e.venue.directions,
        }
      : null,
    coordinators,
    heads: coordinators, // Backwards compatibility
  };
}

export async function getEventById(id: string): Promise<Event | null> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    const found = DEMO_EVENTS.find((e) => e.id === id);
    if (!found) return null;
    return {
      ...found,
      registrationEnabled:
        found.registrationEnabled !== undefined
          ? found.registrationEnabled
          : found.registrationStatus !== "NOT_AVAILABLE",
    };
  }

  const e = await prisma.event.findUnique({
    where: { id },
    include: {
      venue: true,
      coordinators: {
        include: {
          person: true,
        },
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  if (!e) return null;

  const coordinators: EventCoordinator[] = e.coordinators.map((c) => ({
    id: c.id,
    eventId: c.eventId,
    personId: c.personId,
    role: c.role as CoordinatorRole,
    contactOverride: c.contactOverride,
    displayOrder: c.displayOrder,
    person: c.person
      ? {
          id: c.person.id,
          name: c.person.name,
          email: c.person.email,
          phone: c.person.phone,
          avatarUrl: c.person.avatarUrl,
          bio: c.person.bio,
          socialLinks: c.person.socialLinks as Record<string, string> | null,
        }
      : undefined,
  }));

  return {
    id: e.id,
    editionId: e.editionId,
    slug: e.slug,
    title: e.title,
    category: e.category,
    shortDescription: e.shortDescription,
    fullDescription: e.fullDescription,
    rules: e.rules,
    prizes: e.prizes,
    eligibility: e.eligibility,
    participationType: e.participationType as Event["participationType"],
    teamSizeLimit: e.teamSizeLimit,
    registrationStatus: e.registrationStatus as Event["registrationStatus"],
    registrationUrl: e.registrationUrl,
    registrationEnabled: e.registrationStatus !== "NOT_AVAILABLE",
    venueId: e.venueId,
    displayOrder: e.displayOrder,
    posterUrl: e.posterUrl,
    published: e.published,
    venue: e.venue
      ? {
          id: e.venue.id,
          name: e.venue.name,
          building: e.venue.building,
          floor: e.venue.floor,
          roomNumber: e.venue.roomNumber,
          capacity: e.venue.capacity,
          mapUrl: e.venue.mapUrl,
          directions: e.venue.directions,
        }
      : null,
    coordinators,
    heads: coordinators, // Backwards compatibility
  };
}

export async function updateEventRegistration(
  id: string,
  data: {
    registrationUrl?: string | null;
    registrationStatus: Event["registrationStatus"];
    registrationEnabled?: boolean;
  }
): Promise<Event> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  const isEnabled =
    data.registrationEnabled !== undefined
      ? data.registrationEnabled
      : data.registrationStatus !== "NOT_AVAILABLE";

  const effectiveStatus = !isEnabled ? "NOT_AVAILABLE" : data.registrationStatus;

  if (isDemo) {
    const event = DEMO_EVENTS.find((e) => e.id === id);
    if (!event) {
      throw new Error("This event no longer exists. Refresh the Events list.");
    }
    event.registrationUrl = data.registrationUrl ?? null;
    event.registrationStatus = effectiveStatus as Event["registrationStatus"];
    event.registrationEnabled = isEnabled;
    return event;
  }

  const existing = await prisma.event.findUnique({
    where: { id },
  });
  if (!existing) {
    throw new Error("This event no longer exists. Refresh the Events list.");
  }

  const updated = await prisma.event.update({
    where: { id },
    data: {
      registrationUrl: data.registrationUrl ?? null,
      registrationStatus: effectiveStatus as import("@/generated/prisma").RegistrationStatus,
    },
    include: {
      venue: true,
      coordinators: {
        include: { person: true },
      },
    },
  });

  return {
    id: updated.id,
    editionId: updated.editionId,
    slug: updated.slug,
    title: updated.title,
    category: updated.category,
    shortDescription: updated.shortDescription,
    fullDescription: updated.fullDescription,
    rules: updated.rules,
    prizes: updated.prizes,
    eligibility: updated.eligibility,
    participationType: updated.participationType as Event["participationType"],
    teamSizeLimit: updated.teamSizeLimit,
    registrationStatus: updated.registrationStatus as Event["registrationStatus"],
    registrationUrl: updated.registrationUrl,
    registrationEnabled: isEnabled,
    venueId: updated.venueId,
    displayOrder: updated.displayOrder,
    posterUrl: updated.posterUrl,
    published: updated.published,
    venue: updated.venue,
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function getAllEventsAdmin(): Promise<Event[]> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    return DEMO_EVENTS.map((e) => ({
      ...e,
      registrationEnabled:
        e.registrationEnabled !== undefined
          ? e.registrationEnabled
          : e.registrationStatus !== "NOT_AVAILABLE",
    }));
  }

  const dbEvents = await prisma.event.findMany({
    include: {
      venue: true,
      coordinators: {
        include: { person: true },
        orderBy: { displayOrder: "asc" },
      },
    },
    orderBy: [{ displayOrder: "asc" }, { title: "asc" }],
  });

  return dbEvents.map((e) => {
    const coordinators: EventCoordinator[] = e.coordinators.map((c) => ({
      id: c.id,
      eventId: c.eventId,
      personId: c.personId,
      role: c.role as CoordinatorRole,
      contactOverride: c.contactOverride,
      displayOrder: c.displayOrder,
      person: c.person
        ? {
            id: c.person.id,
            name: c.person.name,
            email: c.person.email,
            phone: c.person.phone,
            avatarUrl: c.person.avatarUrl,
            bio: c.person.bio,
            socialLinks: c.person.socialLinks as Record<string, string> | null,
          }
        : undefined,
    }));

    return {
      id: e.id,
      editionId: e.editionId,
      slug: e.slug,
      title: e.title,
      category: e.category,
      shortDescription: e.shortDescription,
      fullDescription: e.fullDescription,
      rules: e.rules,
      prizes: e.prizes,
      eligibility: e.eligibility,
      participationType: e.participationType as Event["participationType"],
      teamSizeLimit: e.teamSizeLimit,
      registrationStatus: e.registrationStatus as Event["registrationStatus"],
      registrationUrl: e.registrationUrl,
      registrationEnabled: e.registrationStatus !== "NOT_AVAILABLE",
      venueId: e.venueId,
      displayOrder: e.displayOrder,
      posterUrl: e.posterUrl,
      published: e.published,
      venue: e.venue
        ? {
            id: e.venue.id,
            name: e.venue.name,
            building: e.venue.building,
            floor: e.venue.floor,
            roomNumber: e.venue.roomNumber,
            capacity: e.venue.capacity,
            mapUrl: e.venue.mapUrl,
            directions: e.venue.directions,
          }
        : null,
      coordinators,
      heads: coordinators,
    };
  });
}

export async function createEvent(data: {
  title: string;
  slug?: string;
  category: string;
  shortDescription?: string;
  fullDescription?: string;
  rules?: string[];
  prizes?: string[];
  participationType?: "INDIVIDUAL" | "TEAM";
  teamSizeLimit?: number | null;
  registrationStatus?: Event["registrationStatus"];
  registrationUrl?: string | null;
  registrationEnabled?: boolean;
  posterUrl?: string | null;
  published?: boolean;
  displayOrder?: number;
}): Promise<Event> {
  const isDemo = process.env.DATA_SOURCE === "demo";
  const slug = data.slug?.trim() || slugify(data.title) || `event-${Date.now()}`;
  const isEnabled = data.registrationEnabled !== undefined ? data.registrationEnabled : true;
  const status = isEnabled ? (data.registrationStatus || "OPEN") : "NOT_AVAILABLE";

  if (isDemo) {
    const newEvent: Event = {
      id: `evt-${Date.now()}`,
      editionId: "edition-yatharth-26",
      slug,
      title: data.title,
      category: data.category,
      shortDescription: data.shortDescription || "",
      fullDescription: data.fullDescription || data.shortDescription || "",
      rules: data.rules || ["Adhere to general festival guidelines."],
      prizes: data.prizes || ["Trophies & Citations"],
      eligibility: "Open to all verified college students.",
      participationType: data.participationType || "INDIVIDUAL",
      teamSizeLimit: data.teamSizeLimit ?? null,
      registrationStatus: status as Event["registrationStatus"],
      registrationUrl: data.registrationUrl ?? null,
      registrationEnabled: isEnabled,
      venueId: null,
      displayOrder: data.displayOrder ?? DEMO_EVENTS.length + 1,
      posterUrl: data.posterUrl ?? null,
      published: data.published ?? true,
      venue: null,
      coordinators: [],
      heads: [],
    };
    DEMO_EVENTS.push(newEvent);
    return newEvent;
  }

  const activeEdition = await prisma.edition.findFirst({ where: { status: "ACTIVE" } });
  if (!activeEdition) throw new Error("Active edition not found");

  const created = await prisma.event.create({
    data: {
      editionId: activeEdition.id,
      slug,
      title: data.title,
      category: data.category,
      shortDescription: data.shortDescription || "",
      fullDescription: data.fullDescription || data.shortDescription || "",
      rules: data.rules || ["Adhere to general festival guidelines."],
      prizes: data.prizes || ["Trophies & Citations"],
      participationType: data.participationType || "INDIVIDUAL",
      teamSizeLimit: data.teamSizeLimit ?? null,
      registrationStatus: status as import("@/generated/prisma").RegistrationStatus,
      registrationUrl: data.registrationUrl ?? null,
      posterUrl: data.posterUrl ?? null,
      published: data.published ?? true,
      displayOrder: data.displayOrder ?? 0,
    },
    include: { venue: true, coordinators: { include: { person: true } } },
  });

  return {
    ...created,
    registrationStatus: created.registrationStatus as Event["registrationStatus"],
    participationType: created.participationType as Event["participationType"],
    registrationEnabled: isEnabled,
    coordinators: [],
    heads: [],
  };
}

export async function updateEvent(
  id: string,
  data: Partial<Event>
): Promise<Event> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    const found = DEMO_EVENTS.find((e) => e.id === id);
    if (!found) throw new Error("This event no longer exists. Refresh the Events list.");
    Object.assign(found, data);
    return found;
  }

  const existing = await prisma.event.findUnique({
    where: { id },
  });
  if (!existing) {
    throw new Error("This event no longer exists. Refresh the Events list.");
  }

  const updated = await prisma.event.update({
    where: { id },
    data: {
      ...(data.title ? { title: data.title } : {}),
      ...(data.slug ? { slug: data.slug } : {}),
      ...(data.category ? { category: data.category } : {}),
      ...(data.shortDescription !== undefined ? { shortDescription: data.shortDescription } : {}),
      ...(data.fullDescription !== undefined ? { fullDescription: data.fullDescription } : {}),
      ...(data.rules !== undefined ? { rules: data.rules } : {}),
      ...(data.prizes !== undefined ? { prizes: data.prizes } : {}),
      ...(data.eligibility !== undefined ? { eligibility: data.eligibility } : {}),
      ...(data.participationType ? { participationType: data.participationType } : {}),
      ...(data.teamSizeLimit !== undefined ? { teamSizeLimit: data.teamSizeLimit } : {}),
      ...(data.posterUrl !== undefined ? { posterUrl: data.posterUrl } : {}),
      ...(data.published !== undefined ? { published: data.published } : {}),
      ...(data.displayOrder !== undefined ? { displayOrder: data.displayOrder } : {}),
      ...(data.registrationUrl !== undefined ? { registrationUrl: data.registrationUrl } : {}),
      ...(data.registrationStatus !== undefined
        ? { registrationStatus: data.registrationStatus as import("@/generated/prisma").RegistrationStatus }
        : {}),
    },
    include: {
      venue: true,
      coordinators: {
        include: { person: true },
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  const coordinators: EventCoordinator[] = updated.coordinators.map((c) => ({
    id: c.id,
    eventId: c.eventId,
    personId: c.personId,
    role: c.role as CoordinatorRole,
    contactOverride: c.contactOverride,
    displayOrder: c.displayOrder,
    person: c.person
      ? {
          id: c.person.id,
          name: c.person.name,
          email: c.person.email,
          phone: c.person.phone,
          avatarUrl: c.person.avatarUrl,
          bio: c.person.bio,
          socialLinks: c.person.socialLinks as Record<string, string> | null,
        }
      : undefined,
  }));

  return {
    ...updated,
    registrationStatus: updated.registrationStatus as Event["registrationStatus"],
    participationType: updated.participationType as Event["participationType"],
    registrationEnabled: updated.registrationStatus !== "NOT_AVAILABLE",
    coordinators,
    heads: coordinators,
  };
}

export async function deleteEvent(id: string): Promise<boolean> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    const idx = DEMO_EVENTS.findIndex((e) => e.id === id);
    if (idx !== -1) {
      DEMO_EVENTS.splice(idx, 1);
      return true;
    }
    throw new Error("This event no longer exists. Refresh the Events list.");
  }

  const existing = await prisma.event.findUnique({
    where: { id },
  });
  if (!existing) {
    throw new Error("This event no longer exists. Refresh the Events list.");
  }

  await prisma.event.delete({
    where: { id },
  });
  return true;
}

export async function addEventCoordinator(
  eventId: string,
  data: {
    name: string;
    role?: CoordinatorRole;
    contactOverride?: string | null;
    email?: string | null;
    phone?: string | null;
  }
): Promise<EventCoordinator> {
  const isDemo = process.env.DATA_SOURCE === "demo";
  const role = data.role || "COORDINATOR";

  if (isDemo) {
    const event = DEMO_EVENTS.find((e) => e.id === eventId);
    if (!event) throw new Error("This event no longer exists. Refresh the Events list.");

    const newCoord: EventCoordinator = {
      id: `coord-${Date.now()}`,
      eventId: event.id,
      personId: `person-${Date.now()}`,
      role,
      contactOverride: data.contactOverride || (data.phone ? `${data.name}: ${data.phone}` : null),
      displayOrder: (event.coordinators?.length || 0) + 1,
      person: {
        id: `person-${Date.now()}`,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
      },
    };

    if (!event.coordinators) event.coordinators = [];
    event.coordinators.push(newCoord);
    event.heads = event.coordinators;
    return newCoord;
  }

  const existingEvent = await prisma.event.findUnique({
    where: { id: eventId },
  });
  if (!existingEvent) {
    throw new Error("This event no longer exists. Refresh the Events list.");
  }

  let person = await prisma.person.findFirst({ where: { name: data.name } });
  if (!person) {
    person = await prisma.person.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
      },
    });
  }

  const coord = await prisma.eventCoordinator.create({
    data: {
      eventId,
      personId: person.id,
      role: role as import("@/generated/prisma").CoordinatorRole,
      contactOverride: data.contactOverride,
    },
    include: { person: true },
  });

  return {
    id: coord.id,
    eventId: coord.eventId,
    personId: coord.personId,
    role: coord.role as CoordinatorRole,
    contactOverride: coord.contactOverride,
    displayOrder: coord.displayOrder,
    person: {
      id: coord.person.id,
      name: coord.person.name,
      email: coord.person.email,
      phone: coord.person.phone,
      avatarUrl: coord.person.avatarUrl,
      bio: coord.person.bio,
      socialLinks: coord.person.socialLinks as Record<string, string> | null,
    },
  };
}

export async function removeEventCoordinator(coordinatorId: string): Promise<boolean> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    for (const event of DEMO_EVENTS) {
      if (event.coordinators) {
        const idx = event.coordinators.findIndex((c) => c.id === coordinatorId);
        if (idx !== -1) {
          event.coordinators.splice(idx, 1);
          event.heads = event.coordinators;
          return true;
        }
      }
    }
    throw new Error("This coordinator no longer exists. Refresh the Events list.");
  }

  const existing = await prisma.eventCoordinator.findUnique({
    where: { id: coordinatorId },
  });
  if (!existing) {
    throw new Error("This coordinator no longer exists. Refresh the Events list.");
  }

  await prisma.eventCoordinator.delete({ where: { id: coordinatorId } });
  return true;
}