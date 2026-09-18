import { prisma } from "@/lib/prisma";
import { DEMO_FESTIVAL_LINKS } from "./demo-data";
import { FestivalLink } from "./types";

export async function getFestivalLinks(): Promise<FestivalLink[]> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    return DEMO_FESTIVAL_LINKS.filter((l) => l.isPublished);
  }

  const links = await prisma.festivalLink.findMany({
    where: {
      isPublished: true,
    },
    orderBy: { displayOrder: "asc" },
  });

  return links.map((l) => ({
    id: l.id,
    editionId: l.editionId,
    platform: l.platform,
    url: l.url,
    label: l.label,
    category: l.category,
    displayOrder: l.displayOrder,
    isPublished: l.isPublished,
  }));
}

export async function getLinktreeLink(): Promise<FestivalLink | null> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    const link = DEMO_FESTIVAL_LINKS.find(
      (l) => l.platform === "LINKTREE" && l.isPublished && l.url && l.url.trim() !== ""
    );
    return link || null;
  }

  const activeEdition = await prisma.edition.findFirst({
    where: { status: "ACTIVE" },
  });

  if (!activeEdition) return null;

  const link = await prisma.festivalLink.findFirst({
    where: {
      editionId: activeEdition.id,
      platform: "LINKTREE",
      isPublished: true,
    },
  });

  if (!link || !link.url || link.url.trim() === "") return null;

  return {
    id: link.id,
    editionId: link.editionId,
    platform: link.platform,
    url: link.url,
    label: link.label,
    category: link.category,
    displayOrder: link.displayOrder,
    isPublished: link.isPublished,
  };
}

export async function getLinktreeAdmin(): Promise<{ url: string; enabled: boolean }> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    const link = DEMO_FESTIVAL_LINKS.find((l) => l.platform === "LINKTREE");
    return {
      url: link ? link.url : "",
      enabled: link ? link.isPublished : false,
    };
  }

  const activeEdition = await prisma.edition.findFirst({
    where: { status: "ACTIVE" },
  });

  if (!activeEdition) {
    return { url: "", enabled: false };
  }

  const link = await prisma.festivalLink.findFirst({
    where: {
      editionId: activeEdition.id,
      platform: "LINKTREE",
    },
  });

  return {
    url: link ? link.url : "",
    enabled: link ? link.isPublished : false,
  };
}

export async function updateLinktree(data: {
  url: string;
  enabled: boolean;
}): Promise<FestivalLink> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    let link = DEMO_FESTIVAL_LINKS.find((l) => l.platform === "LINKTREE");
    if (!link) {
      link = {
        id: "link-linktree",
        editionId: "edition-yatharth-26",
        platform: "LINKTREE",
        url: data.url,
        label: "Official Linktree",
        category: "SOCIAL",
        displayOrder: 0,
        isPublished: data.enabled,
      };
      DEMO_FESTIVAL_LINKS.unshift(link);
    } else {
      link.url = data.url;
      link.isPublished = data.enabled;
    }
    return link;
  }

  const activeEdition = await prisma.edition.findFirst({
    where: { status: "ACTIVE" },
  });

  if (!activeEdition) {
    throw new Error("Active edition not found in database.");
  }

  const existing = await prisma.festivalLink.findFirst({
    where: {
      editionId: activeEdition.id,
      platform: "LINKTREE",
    },
  });

  let saved;
  if (existing) {
    saved = await prisma.festivalLink.update({
      where: { id: existing.id },
      data: {
        url: data.url,
        isPublished: data.enabled,
      },
    });
  } else {
    saved = await prisma.festivalLink.create({
      data: {
        editionId: activeEdition.id,
        platform: "LINKTREE",
        url: data.url,
        label: "Official Linktree",
        category: "SOCIAL",
        displayOrder: 0,
        isPublished: data.enabled,
      },
    });
  }

  return {
    id: saved.id,
    editionId: saved.editionId,
    platform: saved.platform,
    url: saved.url,
    label: saved.label,
    category: saved.category,
    displayOrder: saved.displayOrder,
    isPublished: saved.isPublished,
  };
}

export async function getAllFestivalLinksAdmin(): Promise<FestivalLink[]> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    return [...DEMO_FESTIVAL_LINKS].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  const links = await prisma.festivalLink.findMany({
    orderBy: { displayOrder: "asc" },
  });

  return links.map((l) => ({
    id: l.id,
    editionId: l.editionId,
    platform: l.platform,
    url: l.url,
    label: l.label,
    category: l.category,
    displayOrder: l.displayOrder,
    isPublished: l.isPublished,
  }));
}

export async function createFestivalLink(data: {
  platform: string;
  url: string;
  label: string;
  category?: string;
  displayOrder?: number;
  isPublished?: boolean;
}): Promise<FestivalLink> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    const newLink: FestivalLink = {
      id: `link-${Date.now()}`,
      editionId: "edition-yatharth-26",
      platform: data.platform.toUpperCase(),
      url: data.url,
      label: data.label,
      category: data.category || "SOCIAL",
      displayOrder: data.displayOrder ?? DEMO_FESTIVAL_LINKS.length + 1,
      isPublished: data.isPublished !== undefined ? data.isPublished : true,
    };
    DEMO_FESTIVAL_LINKS.push(newLink);
    return newLink;
  }

  const activeEdition = await prisma.edition.findFirst({
    where: { status: "ACTIVE" },
  });

  if (!activeEdition) throw new Error("Active edition not found");

  const created = await prisma.festivalLink.create({
    data: {
      editionId: activeEdition.id,
      platform: data.platform.toUpperCase(),
      url: data.url,
      label: data.label,
      category: data.category || "SOCIAL",
      displayOrder: data.displayOrder ?? 0,
      isPublished: data.isPublished !== undefined ? data.isPublished : true,
    },
  });

  return {
    id: created.id,
    editionId: created.editionId,
    platform: created.platform,
    url: created.url,
    label: created.label,
    category: created.category,
    displayOrder: created.displayOrder,
    isPublished: created.isPublished,
  };
}

export async function updateFestivalLink(
  id: string,
  data: Partial<FestivalLink>
): Promise<FestivalLink> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    const found = DEMO_FESTIVAL_LINKS.find((l) => l.id === id);
    if (!found) throw new Error(`Festival link not found: ${id}`);
    if (data.platform) found.platform = data.platform.toUpperCase();
    if (data.url !== undefined) found.url = data.url;
    if (data.label !== undefined) found.label = data.label;
    if (data.category !== undefined) found.category = data.category;
    if (data.displayOrder !== undefined) found.displayOrder = data.displayOrder;
    if (data.isPublished !== undefined) found.isPublished = data.isPublished;
    return found;
  }

  const updated = await prisma.festivalLink.update({
    where: { id },
    data: {
      ...(data.platform ? { platform: data.platform.toUpperCase() } : {}),
      ...(data.url !== undefined ? { url: data.url } : {}),
      ...(data.label !== undefined ? { label: data.label } : {}),
      ...(data.category !== undefined ? { category: data.category } : {}),
      ...(data.displayOrder !== undefined ? { displayOrder: data.displayOrder } : {}),
      ...(data.isPublished !== undefined ? { isPublished: data.isPublished } : {}),
    },
  });

  return {
    id: updated.id,
    editionId: updated.editionId,
    platform: updated.platform,
    url: updated.url,
    label: updated.label,
    category: updated.category,
    displayOrder: updated.displayOrder,
    isPublished: updated.isPublished,
  };
}

export async function deleteFestivalLink(id: string): Promise<boolean> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    const idx = DEMO_FESTIVAL_LINKS.findIndex((l) => l.id === id);
    if (idx !== -1) {
      DEMO_FESTIVAL_LINKS.splice(idx, 1);
      return true;
    }
    return false;
  }

  await prisma.festivalLink.delete({ where: { id } });
  return true;
}
