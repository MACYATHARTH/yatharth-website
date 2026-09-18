import { prisma } from "@/lib/prisma";
import { DEMO_GALLERY } from "./demo-data";
import { GalleryItem, GalleryCategory } from "./types";

export async function getGalleryItems(category?: GalleryCategory | "ALL"): Promise<GalleryItem[]> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    if (!category || category === "ALL") {
      return DEMO_GALLERY;
    }
    return DEMO_GALLERY.filter((item) => item.category === category);
  }

  const items = await prisma.galleryItem.findMany({
    where: {
      isPublished: true,
      ...(category && category !== "ALL" ? { category } : {}),
    },
    orderBy: { displayOrder: "asc" },
  });

  return items.map((g) => ({
    id: g.id,
    editionId: g.editionId,
    title: g.title,
    category: g.category as GalleryCategory,
    caption: g.caption,
    mediaUrl: g.mediaUrl,
    imageUrl: g.mediaUrl, // Backward compatibility
    altText: g.altText,
    aspectRatio: (g.aspectRatio as "landscape" | "portrait" | "square") || "landscape",
    photographer: g.photographer,
    year: g.year,
    displayOrder: g.displayOrder,
    isPublished: g.isPublished,
  }));
}

export async function getAllGalleryItemsAdmin(): Promise<GalleryItem[]> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    return DEMO_GALLERY;
  }

  const items = await prisma.galleryItem.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });

  return items.map((g) => ({
    id: g.id,
    editionId: g.editionId,
    title: g.title,
    category: g.category as GalleryCategory,
    caption: g.caption,
    mediaUrl: g.mediaUrl,
    imageUrl: g.mediaUrl,
    altText: g.altText,
    aspectRatio: (g.aspectRatio as "landscape" | "portrait" | "square") || "landscape",
    photographer: g.photographer,
    year: g.year,
    displayOrder: g.displayOrder,
    isPublished: g.isPublished,
  }));
}

export async function createGalleryItem(data: {
  title: string;
  category?: GalleryCategory;
  caption?: string;
  mediaUrl: string;
  altText?: string | null;
  aspectRatio?: "landscape" | "portrait" | "square";
  photographer?: string | null;
  year?: number | null;
  displayOrder?: number;
  isPublished?: boolean;
}): Promise<GalleryItem> {
  const isDemo = process.env.DATA_SOURCE === "demo";
  const category: GalleryCategory = data.category || "Organizing Team";
  const caption = data.caption || data.title;
  const isPublished = data.isPublished !== undefined ? data.isPublished : true;

  if (isDemo) {
    const newItem: GalleryItem = {
      id: `gal-${Date.now()}`,
      editionId: "edition-yatharth-26",
      title: data.title,
      category,
      caption,
      mediaUrl: data.mediaUrl,
      imageUrl: data.mediaUrl,
      altText: data.altText ?? null,
      aspectRatio: data.aspectRatio || "landscape",
      photographer: data.photographer ?? null,
      year: data.year ?? 2026,
      displayOrder: data.displayOrder ?? DEMO_GALLERY.length + 1,
      isPublished,
    };
    DEMO_GALLERY.push(newItem);
    return newItem;
  }

  const activeEdition = await prisma.edition.findFirst({ where: { status: "ACTIVE" } });
  if (!activeEdition) throw new Error("Active edition not found");

  const created = await prisma.galleryItem.create({
    data: {
      editionId: activeEdition.id,
      title: data.title,
      category,
      caption,
      mediaUrl: data.mediaUrl,
      altText: data.altText,
      aspectRatio: data.aspectRatio || "landscape",
      photographer: data.photographer,
      year: data.year ?? 2026,
      displayOrder: data.displayOrder ?? 0,
      isPublished,
    },
  });

  return {
    id: created.id,
    editionId: created.editionId,
    title: created.title,
    category: created.category as GalleryCategory,
    caption: created.caption,
    mediaUrl: created.mediaUrl,
    imageUrl: created.mediaUrl,
    altText: created.altText,
    aspectRatio: (created.aspectRatio as "landscape" | "portrait" | "square") || "landscape",
    photographer: created.photographer,
    year: created.year,
    displayOrder: created.displayOrder,
    isPublished: created.isPublished,
  };
}

export async function updateGalleryItem(
  id: string,
  data: Partial<GalleryItem>
): Promise<GalleryItem> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    const found = DEMO_GALLERY.find((g) => g.id === id);
    if (!found) throw new Error(`Gallery item not found: ${id}`);
    Object.assign(found, data);
    if (data.mediaUrl) found.imageUrl = data.mediaUrl;
    return found;
  }

  const updated = await prisma.galleryItem.update({
    where: { id },
    data: {
      ...(data.title ? { title: data.title } : {}),
      ...(data.category ? { category: data.category } : {}),
      ...(data.caption !== undefined ? { caption: data.caption } : {}),
      ...(data.mediaUrl ? { mediaUrl: data.mediaUrl } : {}),
      ...(data.altText !== undefined ? { altText: data.altText } : {}),
      ...(data.aspectRatio ? { aspectRatio: data.aspectRatio } : {}),
      ...(data.photographer !== undefined ? { photographer: data.photographer } : {}),
      ...(data.year !== undefined ? { year: data.year } : {}),
      ...(data.displayOrder !== undefined ? { displayOrder: data.displayOrder } : {}),
      ...(data.isPublished !== undefined ? { isPublished: data.isPublished } : {}),
    },
  });

  return {
    id: updated.id,
    editionId: updated.editionId,
    title: updated.title,
    category: updated.category as GalleryCategory,
    caption: updated.caption,
    mediaUrl: updated.mediaUrl,
    imageUrl: updated.mediaUrl,
    altText: updated.altText,
    aspectRatio: (updated.aspectRatio as "landscape" | "portrait" | "square") || "landscape",
    photographer: updated.photographer,
    year: updated.year,
    displayOrder: updated.displayOrder,
    isPublished: updated.isPublished,
  };
}

export async function deleteGalleryItem(id: string): Promise<boolean> {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (isDemo) {
    const idx = DEMO_GALLERY.findIndex((g) => g.id === id);
    if (idx !== -1) {
      DEMO_GALLERY.splice(idx, 1);
      return true;
    }
    return false;
  }

  await prisma.galleryItem.delete({ where: { id } });
  return true;
}
