import { prisma } from "@/lib/prisma";
import { DEMO_ANNOUNCEMENTS } from "./demo-data";
import { Announcement, PriorityLevel } from "./types";

interface PrismaAnnouncementRow {
  id: string;
  editionId: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  priority: string;
  publishedAt: Date | string;
  expiresAt?: Date | string | null;
  eventId?: string | null;
  isPublished: boolean;
  displayOrder: number;
}

function formatAnnouncement(a: PrismaAnnouncementRow): Announcement {
  return {
    id: a.id,
    editionId: a.editionId,
    slug: a.slug,
    title: a.title,
    summary: a.summary,
    content: a.content,
    priority: a.priority as Announcement["priority"],
    publishedAt:
      typeof a.publishedAt === "string" ? a.publishedAt : a.publishedAt.toISOString(),
    expiresAt: a.expiresAt
      ? typeof a.expiresAt === "string"
        ? a.expiresAt
        : a.expiresAt.toISOString()
      : null,
    eventId: a.eventId || null,
    isPublished: a.isPublished,
    displayOrder: a.displayOrder,
  };
}

function sortAnnouncements(list: Announcement[]): Announcement[] {
  return [...list].sort((a, b) => {
    const orderDiff = (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
    if (orderDiff !== 0) return orderDiff;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}

/**
 * Public announcements fetcher: only returns published circulars
 */
export async function getAnnouncements(limit?: number): Promise<Announcement[]> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    const published = DEMO_ANNOUNCEMENTS.filter((a) => a.isPublished !== false);
    const sorted = sortAnnouncements(published);
    return limit ? sorted.slice(0, limit) : sorted;
  }

  try {
    const list = await prisma.announcement.findMany({
      where: {
        isPublished: true,
      },
      orderBy: [{ displayOrder: "asc" }, { publishedAt: "desc" }],
      take: limit,
    });

    return list.map(formatAnnouncement);
  } catch {
    // Database fallback to demo data
    const published = DEMO_ANNOUNCEMENTS.filter((a) => a.isPublished !== false);
    const sorted = sortAnnouncements(published);
    return limit ? sorted.slice(0, limit) : sorted;
  }
}

/**
 * Ticker announcements for urgent/pinned notices
 */
export async function getTickerAnnouncements(): Promise<Announcement[]> {
  const list = await getAnnouncements();
  return list.filter((a) => a.priority === "URGENT" || a.priority === "PINNED");
}

/**
 * Admin fetcher: returns ALL announcements (published and drafts)
 */
export async function getAllAnnouncementsAdmin(): Promise<Announcement[]> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    return sortAnnouncements(DEMO_ANNOUNCEMENTS);
  }

  try {
    const list = await prisma.announcement.findMany({
      orderBy: [{ displayOrder: "asc" }, { publishedAt: "desc" }],
    });

    return list.map(formatAnnouncement);
  } catch {
    return sortAnnouncements(DEMO_ANNOUNCEMENTS);
  }
}

/**
 * Create a new announcement
 */
export async function createAnnouncement(data: {
  title: string;
  summary: string;
  content: string;
  priority?: PriorityLevel;
  publishedAt?: string;
  expiresAt?: string | null;
  displayOrder?: number;
  isPublished?: boolean;
}): Promise<Announcement> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  const slug =
    data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
      .slice(0, 60) +
    "-" +
    Date.now().toString(36);

  const publishedAtDate = data.publishedAt ? new Date(data.publishedAt) : new Date();

  if (isDemo) {
    const newAnnouncement: Announcement = {
      id: `ann-${Date.now()}`,
      editionId: "edition-yatharth-26",
      slug,
      title: data.title,
      summary: data.summary,
      content: data.content,
      priority: data.priority || "NORMAL",
      publishedAt: publishedAtDate.toISOString(),
      expiresAt: data.expiresAt || null,
      eventId: null,
      isPublished: data.isPublished !== undefined ? data.isPublished : true,
      displayOrder: data.displayOrder ?? DEMO_ANNOUNCEMENTS.length + 1,
    };
    DEMO_ANNOUNCEMENTS.push(newAnnouncement);
    return newAnnouncement;
  }

  const activeEdition = await prisma.edition.findFirst({
    where: { status: "ACTIVE" },
  });
  const editionId = activeEdition?.id || "edition-yatharth-26";

  const created = await prisma.announcement.create({
    data: {
      editionId,
      slug,
      title: data.title,
      summary: data.summary,
      content: data.content,
      priority: (data.priority || "NORMAL") as import("@/generated/prisma").PriorityLevel,
      publishedAt: publishedAtDate,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      displayOrder: data.displayOrder ?? 0,
      isPublished: data.isPublished !== undefined ? data.isPublished : true,
    },
  });

  return formatAnnouncement(created);
}

/**
 * Update existing announcement
 */
export async function updateAnnouncement(
  id: string,
  data: Partial<Announcement>
): Promise<Announcement> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    const found = DEMO_ANNOUNCEMENTS.find((a) => a.id === id);
    if (!found) throw new Error(`Announcement not found: ${id}`);
    if (data.title !== undefined) found.title = data.title;
    if (data.summary !== undefined) found.summary = data.summary;
    if (data.content !== undefined) found.content = data.content;
    if (data.priority !== undefined) found.priority = data.priority;
    if (data.publishedAt !== undefined) found.publishedAt = data.publishedAt;
    if (data.expiresAt !== undefined) found.expiresAt = data.expiresAt;
    if (data.displayOrder !== undefined) found.displayOrder = data.displayOrder;
    if (data.isPublished !== undefined) found.isPublished = data.isPublished;
    return { ...found };
  }

  const updated = await prisma.announcement.update({
    where: { id },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.summary !== undefined ? { summary: data.summary } : {}),
      ...(data.content !== undefined ? { content: data.content } : {}),
      ...(data.priority !== undefined
        ? { priority: data.priority as import("@/generated/prisma").PriorityLevel }
        : {}),
      ...(data.publishedAt !== undefined
        ? { publishedAt: new Date(data.publishedAt) }
        : {}),
      ...(data.expiresAt !== undefined
        ? { expiresAt: data.expiresAt ? new Date(data.expiresAt) : null }
        : {}),
      ...(data.displayOrder !== undefined ? { displayOrder: data.displayOrder } : {}),
      ...(data.isPublished !== undefined ? { isPublished: data.isPublished } : {}),
    },
  });

  return formatAnnouncement(updated);
}

/**
 * Delete announcement by ID
 */
export async function deleteAnnouncement(id: string): Promise<boolean> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    const idx = DEMO_ANNOUNCEMENTS.findIndex((a) => a.id === id);
    if (idx !== -1) {
      DEMO_ANNOUNCEMENTS.splice(idx, 1);
      return true;
    }
    return false;
  }

  await prisma.announcement.delete({ where: { id } });
  return true;
}

/**
 * Reorder announcements in batch
 */
export async function reorderAnnouncements(
  updates: { id: string; displayOrder: number }[]
): Promise<boolean> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    updates.forEach((u) => {
      const item = DEMO_ANNOUNCEMENTS.find((a) => a.id === u.id);
      if (item) item.displayOrder = u.displayOrder;
    });
    return true;
  }

  await prisma.$transaction(
    updates.map((u) =>
      prisma.announcement.update({
        where: { id: u.id },
        data: { displayOrder: u.displayOrder },
      })
    )
  );
  return true;
}