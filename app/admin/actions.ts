"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { assertAdminAuthorized } from "@/lib/auth/admin-guard";
import { verifyPassword } from "@/lib/auth/password";
import { createAdminSession, clearAdminSession } from "@/lib/auth/session";
import {
  getActiveEdition,
  createEdition,
  updateEdition,
  activateEdition,
  archiveEdition,
  updateActiveEditionThemeSettings,
  updateActiveEditionDates,
} from "@/lib/data/edition.service";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  updateEventRegistration,
  addEventCoordinator,
  removeEventCoordinator,
} from "@/lib/data/event.service";
import {
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} from "@/lib/data/gallery.service";
import {
  createScheduleEntry,
  updateScheduleEntry,
  deleteScheduleEntry,
} from "@/lib/data/schedule.service";
import {
  updateLinktree,
  createFestivalLink,
  updateFestivalLink,
  deleteFestivalLink,
} from "@/lib/data/link.service";
import {
  createFestivalTeam,
  updateFestivalTeam,
  deleteFestivalTeam,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from "@/lib/data/team.service";
import {
  createFacultyMember,
  updateFacultyMember,
  deleteFacultyMember,
} from "@/lib/data/faculty.service";
import {
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  reorderAnnouncements,
} from "@/lib/data/announcement.service";
import {
  Event,
  CoordinatorRole,
  GalleryCategory,
  ThemePresetName,
  ThemeTokens,
  TeamType,
  FestivalLink,
  FestivalTeam,
  ContactPageSettings,
  FacultyMember,
  FacultyRole,
  Announcement,
  PriorityLevel,
  Edition,
  EditionFormData,
} from "@/lib/data/types";
import {
  uploadToSupabaseStorage,
  deleteFromSupabaseStorage,
  extractStoragePathFromUrl,
} from "@/lib/storage/supabase-storage";
import path from "path";

// ══════════════════════════════════════════════════════════════════
// 1. APPEARANCE & THEME ACTIONS
// ══════════════════════════════════════════════════════════════════

/**
 * Update comprehensive theme appearance (Wallpaper, Logo, Typography, Theme & Colours)
 */
export async function updateThemeAppearanceAction(data: {
  wallpaperUrl?: string | null;
  overlayOpacity?: number | null;
  logoUrl?: string | null;
  fontSans?: string;
  fontDisplay?: string;
  themePreset?: ThemePresetName;
  themeTokens?: Partial<ThemeTokens>;
}) {
  try {
    await assertAdminAuthorized();

    let previousWallpaperUrl: string | null = null;
    if (data.wallpaperUrl !== undefined) {
      try {
        const currentEdition = await getActiveEdition();
        previousWallpaperUrl = (currentEdition?.themeSettings?.wallpaperUrl as string) || null;
      } catch {
        // Continue if reading current edition fails
      }
    }

    const updates: Record<string, unknown> = {};

    if (data.wallpaperUrl !== undefined) {
      updates.wallpaperUrl = data.wallpaperUrl ? data.wallpaperUrl.trim() : null;
    }

    if (typeof data.overlayOpacity === "number" && !isNaN(data.overlayOpacity)) {
      updates.wallpaperOverlayOpacity = Math.max(0, Math.min(1, data.overlayOpacity));
    }

    if (data.logoUrl !== undefined) {
      updates.logoUrl = data.logoUrl ? data.logoUrl.trim() : null;
    }

    if (data.fontSans) {
      updates.fontSans = data.fontSans;
    }

    if (data.fontDisplay) {
      updates.fontDisplay = data.fontDisplay;
    }

    if (data.themePreset) {
      updates.themePreset = data.themePreset;
    }

    if (data.themeTokens) {
      updates.themeTokens = data.themeTokens;
    }

    const updated = await updateActiveEditionThemeSettings(updates);

    // If wallpaperUrl was changed/reset, safely clean up previous custom wallpaper if it belongs to our Supabase bucket
    if (
      previousWallpaperUrl &&
      updates.wallpaperUrl !== undefined &&
      previousWallpaperUrl !== updates.wallpaperUrl
    ) {
      const oldPath = extractStoragePathFromUrl(previousWallpaperUrl);
      if (oldPath) {
        deleteFromSupabaseStorage({ filePath: oldPath }).catch((delErr) => {
          console.error("[Supabase Storage] Cleanup of replaced wallpaper failed:", delErr);
        });
      }
    }

    revalidatePath("/", "layout");

    return {
      success: true,
      themeSettings: updated.themeSettings,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update theme appearance";
    return { success: false, error: message };
  }
}

/**
 * Upload Asset via Supabase Storage
 * Supports: wallpaper, logo, posters, gallery, faculty
 * Saves persistently to Supabase Storage and returns public CDN URL
 */
export async function uploadAssetAction(
  formData: FormData,
  folder: "wallpaper" | "logo" | "posters" | "gallery" | "faculty" = "wallpaper"
) {
  try {
    await assertAdminAuthorized();

    const file = formData.get("file") as File | null;
    if (!file) {
      return { success: false, error: "No image file provided." };
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      return {
        success: false,
        error: "Invalid file type. Please upload a JPEG, PNG, WEBP, AVIF, or SVG image.",
      };
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return { success: false, error: "File size exceeds 10MB limit." };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name) || ".jpg";
    const safeExt = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".svg"].includes(ext.toLowerCase())
      ? ext.toLowerCase()
      : ".jpg";

    if (folder === "wallpaper") {
      // 1. Read current active edition to capture previous wallpaper URL
      let previousWallpaperUrl: string | null = null;
      try {
        const currentEdition = await getActiveEdition();
        previousWallpaperUrl = (currentEdition?.themeSettings?.wallpaperUrl as string) || null;
      } catch {
        // Continue if reading current edition fails
      }

      // 2. Upload new wallpaper to Supabase Storage
      const filename = `wallpaper-${Date.now()}${safeExt}`;
      const uploadRes = await uploadToSupabaseStorage({
        folder: "wallpapers",
        filename,
        fileBuffer: buffer,
        contentType: file.type || "image/jpeg",
      });

      if (!uploadRes.success || !uploadRes.url) {
        return {
          success: false,
          error: uploadRes.error || "Failed to upload wallpaper to Supabase Storage.",
        };
      }

      const newWallpaperUrl = uploadRes.url;

      // 3. Update database with new wallpaper URL
      await updateActiveEditionThemeSettings({ wallpaperUrl: newWallpaperUrl });

      // 4. Only AFTER database update succeeds, delete previous wallpaper if it is a Supabase Storage object in our bucket
      if (previousWallpaperUrl && previousWallpaperUrl !== newWallpaperUrl) {
        const oldPath = extractStoragePathFromUrl(previousWallpaperUrl);
        if (oldPath) {
          deleteFromSupabaseStorage({ filePath: oldPath }).catch((delErr) => {
            console.error("[Supabase Storage] Cleanup of previous wallpaper failed:", delErr);
          });
        }
      }

      revalidatePath("/", "layout");

      return {
        success: true,
        url: newWallpaperUrl,
      };
    }

    // ─── Other Asset Folders: logo, posters, gallery, faculty ───
    const storageFolder = folder === "logo" ? "logos" : folder;
    const filename = `${folder}-${Date.now()}${safeExt}`;

    const uploadRes = await uploadToSupabaseStorage({
      folder: storageFolder,
      filename,
      fileBuffer: buffer,
      contentType: file.type || "image/jpeg",
    });

    if (!uploadRes.success || !uploadRes.url) {
      return {
        success: false,
        error: uploadRes.error || `Failed to upload ${folder} to Supabase Storage.`,
      };
    }

    const publicUrl = uploadRes.url;

    if (folder === "logo") {
      await updateActiveEditionThemeSettings({ logoUrl: publicUrl });
    }

    revalidatePath("/", "layout");

    return {
      success: true,
      url: publicUrl,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to upload asset";
    return { success: false, error: message };
  }
}

// ══════════════════════════════════════════════════════════════════
// 2. EVENTS CRUD & MANAGEMENT ACTIONS
// ══════════════════════════════════════════════════════════════════

export async function createEventAction(data: {
  title: string;
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
}) {
  try {
    await assertAdminAuthorized();

    if (!data.title?.trim()) {
      return { success: false, error: "Event title is required." };
    }

    const cleanUrl = data.registrationUrl?.trim() || null;
    const isEnabled =
      data.registrationEnabled !== undefined
        ? Boolean(data.registrationEnabled)
        : data.registrationStatus !== "NOT_AVAILABLE";

    if (isEnabled && data.registrationStatus === "OPEN" && cleanUrl) {
      const isGoogleForm =
        /^https:\/\/(forms\.gle\/[a-zA-Z0-9_\-]+|docs\.google\.com\/forms\/d\/[e\/a-zA-Z0-9_\-]+)/i.test(
          cleanUrl
        );
      if (!isGoogleForm) {
        return {
          success: false,
          error: "Registration URL must be a valid Google Form (https://forms.gle/... or https://docs.google.com/forms/...)",
        };
      }
    }

    const created = await createEvent({
      ...data,
      registrationUrl: cleanUrl,
      registrationEnabled: isEnabled,
    });

    revalidatePath("/events");
    revalidatePath("/");
    revalidatePath("/admin");

    return { success: true, event: created };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create event";
    return { success: false, error: message };
  }
}

export async function updateEventAction(
  id: string,
  data: Partial<Event>
) {
  try {
    await assertAdminAuthorized();

    if (data.registrationUrl) {
      const cleanUrl = data.registrationUrl.trim();
      const isGoogleForm =
        /^https:\/\/(forms\.gle\/[a-zA-Z0-9_\-]+|docs\.google\.com\/forms\/d\/[e\/a-zA-Z0-9_\-]+)/i.test(
          cleanUrl
        );
      if (!isGoogleForm) {
        return {
          success: false,
          error: "Registration URL must be a valid Google Form (https://forms.gle/... or https://docs.google.com/forms/...)",
        };
      }
    }

    const updated = await updateEvent(id, data);

    revalidatePath("/events");
    revalidatePath(`/events/${updated.slug}`);
    revalidatePath("/");
    revalidatePath("/admin");

    return { success: true, event: updated };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update event";
    return { success: false, error: message };
  }
}

export async function deleteEventAction(id: string) {
  try {
    await assertAdminAuthorized();

    const deleted = await deleteEvent(id);
    if (!deleted) {
      return { success: false, error: "Event could not be found or deleted." };
    }

    revalidatePath("/events");
    revalidatePath("/");
    revalidatePath("/admin");

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete event";
    return { success: false, error: message };
  }
}

export async function addEventCoordinatorAction(
  eventId: string,
  data: {
    name: string;
    role?: CoordinatorRole;
    contactOverride?: string | null;
    email?: string | null;
    phone?: string | null;
  }
) {
  try {
    await assertAdminAuthorized();

    if (!data.name?.trim()) {
      return { success: false, error: "Coordinator name is required." };
    }

    const coordinator = await addEventCoordinator(eventId, data);

    revalidatePath("/events");
    revalidatePath("/admin");

    return { success: true, coordinator };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to add coordinator";
    return { success: false, error: message };
  }
}

export async function removeEventCoordinatorAction(coordinatorId: string) {
  try {
    await assertAdminAuthorized();

    const removed = await removeEventCoordinator(coordinatorId);
    if (!removed) {
      return { success: false, error: "Coordinator could not be removed." };
    }

    revalidatePath("/events");
    revalidatePath("/admin");

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to remove coordinator";
    return { success: false, error: message };
  }
}

/**
 * Update Event Registration Details
 * Enforces Google Forms URL destination requirement server-side
 */
export async function updateEventRegistrationAction(data: {
  id: string;
  registrationUrl?: string | null;
  registrationStatus: Event["registrationStatus"];
  registrationEnabled?: boolean;
}) {
  try {
    await assertAdminAuthorized();

    const validStatuses: Event["registrationStatus"][] = [
      "OPEN",
      "CLOSED",
      "COMING_SOON",
      "NOT_AVAILABLE",
    ];

    if (!validStatuses.includes(data.registrationStatus)) {
      return {
        success: false,
        error: `Invalid registration status: ${data.registrationStatus}`,
      };
    }

    const isEnabled =
      data.registrationEnabled !== undefined
        ? Boolean(data.registrationEnabled)
        : data.registrationStatus !== "NOT_AVAILABLE";

    const cleanUrl = data.registrationUrl ? data.registrationUrl.trim() : null;

    if (isEnabled && data.registrationStatus === "OPEN") {
      if (!cleanUrl) {
        return {
          success: false,
          error: "A registration URL is required when registration is open and enabled.",
        };
      }

      const isGoogleForm =
        /^https:\/\/(forms\.gle\/[a-zA-Z0-9_\-]+|docs\.google\.com\/forms\/d\/[e\/a-zA-Z0-9_\-]+)/i.test(
          cleanUrl
        );

      if (!isGoogleForm) {
        return {
          success: false,
          error:
            "Registration URL must be a valid Google Form destination (e.g. https://forms.gle/... or https://docs.google.com/forms/...)",
        };
      }
    }

    const updated = await updateEventRegistration(data.id, {
      registrationUrl: cleanUrl,
      registrationStatus: data.registrationStatus,
      registrationEnabled: isEnabled,
    });

    revalidatePath("/events");
    revalidatePath(`/events/${updated.slug}`);
    revalidatePath("/admin");

    return {
      success: true,
      event: {
        id: updated.id,
        slug: updated.slug,
        title: updated.title,
        registrationUrl: updated.registrationUrl,
        registrationStatus: updated.registrationStatus,
        registrationEnabled: updated.registrationEnabled,
      },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update event registration";
    return { success: false, error: message };
  }
}

// ══════════════════════════════════════════════════════════════════
// 3. GALLERY CRUD & MANAGEMENT ACTIONS
// ══════════════════════════════════════════════════════════════════

export async function createGalleryItemAction(data: {
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
}) {
  try {
    await assertAdminAuthorized();

    if (!data.title?.trim() || !data.mediaUrl?.trim()) {
      return { success: false, error: "Title and Image URL are required for gallery items." };
    }

    const created = await createGalleryItem(data);

    revalidatePath("/gallery");
    revalidatePath("/");
    revalidatePath("/admin");

    return { success: true, item: created };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create gallery item";
    return { success: false, error: message };
  }
}

export async function updateGalleryItemAction(
  id: string,
  data: {
    title?: string;
    category?: GalleryCategory;
    caption?: string;
    mediaUrl?: string;
    altText?: string | null;
    aspectRatio?: "landscape" | "portrait" | "square";
    photographer?: string | null;
    year?: number | null;
    displayOrder?: number;
    isPublished?: boolean;
  }
) {
  try {
    await assertAdminAuthorized();

    const updated = await updateGalleryItem(id, data);

    revalidatePath("/gallery");
    revalidatePath("/");
    revalidatePath("/admin");

    return { success: true, item: updated };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update gallery item";
    return { success: false, error: message };
  }
}

export async function deleteGalleryItemAction(id: string) {
  try {
    await assertAdminAuthorized();

    const deleted = await deleteGalleryItem(id);
    if (!deleted) {
      return { success: false, error: "Gallery item not found or could not be deleted." };
    }

    revalidatePath("/gallery");
    revalidatePath("/");
    revalidatePath("/admin");

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete gallery item";
    return { success: false, error: message };
  }
}

// ══════════════════════════════════════════════════════════════════
// 4. FESTIVAL LINKS (LINKTREE)
// ══════════════════════════════════════════════════════════════════

export async function updateLinktreeAction(data: {
  url: string;
  enabled: boolean;
}) {
  try {
    await assertAdminAuthorized();

    const isEnabled = Boolean(data.enabled);
    const cleanUrl = data.url ? data.url.trim() : "";

    if (isEnabled && cleanUrl) {
      try {
        const parsed = new URL(cleanUrl);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          return {
            success: false,
            error: "Linktree URL must start with http:// or https://",
          };
        }
      } catch {
        return {
          success: false,
          error: "Invalid URL structure provided for Linktree link.",
        };
      }
    }

    const savedLink = await updateLinktree({
      url: cleanUrl,
      enabled: isEnabled,
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin");

    return {
      success: true,
      link: {
        id: savedLink.id,
        url: savedLink.url,
        isPublished: savedLink.isPublished,
      },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update Linktree settings";
    return { success: false, error: message };
  }
}

// ══════════════════════════════════════════════════════════════════
// 5. FESTIVAL CONTENT MANAGEMENT ACTIONS
// ══════════════════════════════════════════════════════════════════

export async function updateFestivalContentAction(data: {
  themeTitle?: string;
  tagline?: string;
  heroSupportingCopy?: string;
  college?: string;
  department?: string;
  aboutIntro?: string;
  aboutParagraphs?: string[];
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
}) {
  try {
    await assertAdminAuthorized();

    const updates: Record<string, unknown> = {};
    if (data.themeTitle !== undefined) updates.themeTitle = data.themeTitle.trim();
    if (data.tagline !== undefined) updates.tagline = data.tagline.trim();
    if (data.heroSupportingCopy !== undefined) updates.heroSupportingCopy = data.heroSupportingCopy.trim();
    if (data.college !== undefined) updates.college = data.college.trim();
    if (data.department !== undefined) updates.department = data.department.trim();
    if (data.aboutIntro !== undefined) updates.aboutIntro = data.aboutIntro.trim();
    if (data.aboutParagraphs !== undefined) {
      updates.aboutParagraphs = data.aboutParagraphs
        .map((p) => p.trim())
        .filter((p) => p.length > 0);
    }
    if (data.contactEmail !== undefined) updates.contactEmail = data.contactEmail.trim();
    if (data.contactPhone !== undefined) updates.contactPhone = data.contactPhone.trim();
    if (data.contactAddress !== undefined) updates.contactAddress = data.contactAddress.trim();

    const updated = await updateActiveEditionThemeSettings(updates);

    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/contact");
    revalidatePath("/admin");

    return { success: true, themeSettings: updated.themeSettings };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update festival content";
    return { success: false, error: message };
  }
}

export async function updateFestivalDatesAction(data: {
  startDate?: string | null;
  endDate?: string | null;
  isDateConfirmed: boolean;
}) {
  try {
    await assertAdminAuthorized();

    const updated = await updateActiveEditionDates({
      startDate: data.startDate?.trim() ? data.startDate.trim() : null,
      endDate: data.endDate?.trim() ? data.endDate.trim() : null,
      isDateConfirmed: Boolean(data.isDateConfirmed),
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/schedule");

    return {
      success: true,
      edition: updated,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update festival dates";
    return { success: false, error: message };
  }
}

// ══════════════════════════════════════════════════════════════════
// 6. SOCIAL MEDIA HANDLES (FESTIVAL LINKS) ACTIONS
// ══════════════════════════════════════════════════════════════════

export async function createFestivalLinkAction(data: {
  platform: string;
  url: string;
  label: string;
  category?: string;
  displayOrder?: number;
  isPublished?: boolean;
}) {
  try {
    await assertAdminAuthorized();

    if (!data.platform?.trim() || !data.url?.trim() || !data.label?.trim()) {
      return { success: false, error: "Platform, URL, and Handle/Label are required." };
    }

    const created = await createFestivalLink(data);

    revalidatePath("/");
    revalidatePath("/admin");

    return { success: true, link: created };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create social handle";
    return { success: false, error: message };
  }
}

export async function updateFestivalLinkAction(
  id: string,
  data: Partial<FestivalLink>
) {
  try {
    await assertAdminAuthorized();

    const updated = await updateFestivalLink(id, data);

    revalidatePath("/");
    revalidatePath("/admin");

    return { success: true, link: updated };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update social handle";
    return { success: false, error: message };
  }
}

export async function deleteFestivalLinkAction(id: string) {
  try {
    await assertAdminAuthorized();

    const deleted = await deleteFestivalLink(id);
    if (!deleted) {
      return { success: false, error: "Social handle not found or could not be deleted." };
    }

    revalidatePath("/");
    revalidatePath("/admin");

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete social handle";
    return { success: false, error: message };
  }
}

// ══════════════════════════════════════════════════════════════════
// 7. ORGANISING TEAM & MEMBERS ACTIONS
// ══════════════════════════════════════════════════════════════════

export async function createFestivalTeamAction(data: {
  name: string;
  teamType?: TeamType;
  displayOrder?: number;
  isPublished?: boolean;
}) {
  try {
    await assertAdminAuthorized();

    if (!data.name?.trim()) {
      return { success: false, error: "Team name is required." };
    }

    const created = await createFestivalTeam(data);

    revalidatePath("/team");
    revalidatePath("/about");
    revalidatePath("/admin");

    return { success: true, team: created };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create team";
    return { success: false, error: message };
  }
}

export async function updateFestivalTeamAction(
  id: string,
  data: Partial<FestivalTeam>
) {
  try {
    await assertAdminAuthorized();

    const updated = await updateFestivalTeam(id, data);

    revalidatePath("/team");
    revalidatePath("/about");
    revalidatePath("/admin");

    return { success: true, team: updated };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update team";
    return { success: false, error: message };
  }
}

export async function deleteFestivalTeamAction(id: string) {
  try {
    await assertAdminAuthorized();

    const deleted = await deleteFestivalTeam(id);
    if (!deleted) {
      return { success: false, error: "Team not found or could not be deleted." };
    }

    revalidatePath("/team");
    revalidatePath("/about");
    revalidatePath("/admin");

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete team";
    return { success: false, error: message };
  }
}

export async function createTeamMemberAction(data: {
  teamId: string;
  name: string;
  designation: string;
  email?: string | null;
  phone?: string | null;
  bio?: string | null;
  displayOrder?: number;
  isPublished?: boolean;
}) {
  try {
    await assertAdminAuthorized();

    if (!data.name?.trim() || !data.designation?.trim()) {
      return { success: false, error: "Name and designation are required." };
    }

    const created = await createTeamMember(data);

    revalidatePath("/team");
    revalidatePath("/about");
    revalidatePath("/admin");

    return { success: true, member: created };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to add team member";
    return { success: false, error: message };
  }
}

export async function updateTeamMemberAction(
  id: string,
  data: {
    name?: string;
    designation?: string;
    email?: string | null;
    phone?: string | null;
    bio?: string | null;
    displayOrder?: number;
    isPublished?: boolean;
    teamId?: string;
  }
) {
  try {
    await assertAdminAuthorized();

    const updated = await updateTeamMember(id, data);

    revalidatePath("/team");
    revalidatePath("/about");
    revalidatePath("/admin");

    return { success: true, member: updated };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update team member";
    return { success: false, error: message };
  }
}

export async function deleteTeamMemberAction(id: string) {
  try {
    await assertAdminAuthorized();

    const deleted = await deleteTeamMember(id);
    if (!deleted) {
      return { success: false, error: "Team member not found or could not be deleted." };
    }

    revalidatePath("/team");
    revalidatePath("/about");
    revalidatePath("/admin");

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete team member";
    return { success: false, error: message };
  }
}

// ══════════════════════════════════════════════════════════════════
// 7. SCHEDULE MANAGEMENT ACTIONS
// ══════════════════════════════════════════════════════════════════

export async function createScheduleEntryAction(data: {
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
}) {
  try {
    await assertAdminAuthorized();

    if (!data.startTime?.trim() || !data.endTime?.trim()) {
      return { success: false, error: "Start time and end time are required." };
    }

    const created = await createScheduleEntry(data);

    revalidatePath("/schedule");
    revalidatePath("/");
    revalidatePath("/admin");

    return { success: true, entry: created };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create schedule entry";
    return { success: false, error: message };
  }
}

export async function updateScheduleEntryAction(
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
) {
  try {
    await assertAdminAuthorized();

    const updated = await updateScheduleEntry(id, data);

    revalidatePath("/schedule");
    revalidatePath("/");
    revalidatePath("/admin");

    return { success: true, entry: updated };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update schedule entry";
    return { success: false, error: message };
  }
}

export async function deleteScheduleEntryAction(id: string) {
  try {
    await assertAdminAuthorized();

    const deleted = await deleteScheduleEntry(id);
    if (!deleted) {
      return { success: false, error: "Schedule entry not found or could not be deleted." };
    }

    revalidatePath("/schedule");
    revalidatePath("/");
    revalidatePath("/admin");

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete schedule entry";
    return { success: false, error: message };
  }
}

// ══════════════════════════════════════════════════════════════════
// 8. CONTACT PAGE SETTINGS ACTION
// ══════════════════════════════════════════════════════════════════

export async function updateContactSettingsAction(data: ContactPageSettings) {
  try {
    await assertAdminAuthorized();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validate official email if present
    if (data.officialEmail && data.officialEmail.trim() && !emailRegex.test(data.officialEmail.trim())) {
      return { success: false, error: "Official email format is invalid." };
    }

    // Validate contacts list if present
    if (Array.isArray(data.contacts)) {
      for (const [idx, contact] of data.contacts.entries()) {
        if (!contact.name || !contact.name.trim()) {
          return { success: false, error: `Contact #${idx + 1} is missing a name.` };
        }
        if (!contact.role || !contact.role.trim()) {
          return { success: false, error: `Contact "${contact.name}" is missing a role/title.` };
        }
        if (contact.email && contact.email.trim() && !emailRegex.test(contact.email.trim())) {
          return { success: false, error: `Invalid email address format for contact "${contact.name}".` };
        }
      }
    }

    await updateActiveEditionThemeSettings({
      contactSettings: data,
    });

    revalidatePath("/contact");
    revalidatePath("/admin");

    return { success: true, settings: data };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update contact settings";
    return { success: false, error: message };
  }
}

// ══════════════════════════════════════════════════════════════════
// 9. FACULTY MANAGEMENT ACTIONS
// ══════════════════════════════════════════════════════════════════

export async function createFacultyMemberAction(data: {
  name: string;
  designation: string;
  role?: FacultyRole;
  photoUrl?: string | null;
  displayOrder?: number;
  isPublished?: boolean;
  email?: string | null;
  department?: string | null;
  institution?: string | null;
  bio?: string | null;
}) {
  try {
    await assertAdminAuthorized();

    if (!data.name || !data.name.trim()) {
      return { success: false, error: "Faculty member name is required." };
    }
    if (!data.designation || !data.designation.trim()) {
      return { success: false, error: "Faculty member designation is required." };
    }

    const member = await createFacultyMember({
      name: data.name.trim(),
      designation: data.designation.trim(),
      role: data.role || "FACULTY",
      photoUrl: data.photoUrl ? data.photoUrl.trim() : null,
      displayOrder: typeof data.displayOrder === "number" ? data.displayOrder : 0,
      isPublished: data.isPublished !== undefined ? data.isPublished : true,
      email: data.email ? data.email.trim() : null,
      department: data.department ? data.department.trim() : null,
      institution: data.institution ? data.institution.trim() : null,
      bio: data.bio ? data.bio.trim() : null,
    });

    revalidatePath("/faculty");
    revalidatePath("/admin");

    return { success: true, member };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create faculty member";
    return { success: false, error: message };
  }
}

export async function updateFacultyMemberAction(
  id: string,
  data: Partial<FacultyMember>
) {
  try {
    await assertAdminAuthorized();

    if (!id) {
      return { success: false, error: "Faculty member ID is required." };
    }

    const updates: Partial<FacultyMember> = {};
    if (data.name !== undefined) updates.name = data.name.trim();
    if (data.designation !== undefined) updates.designation = data.designation.trim();
    if (data.photoUrl !== undefined) updates.photoUrl = data.photoUrl ? data.photoUrl.trim() : null;
    if (data.role !== undefined) updates.role = data.role;
    if (data.displayOrder !== undefined) updates.displayOrder = data.displayOrder;
    if (data.isPublished !== undefined) updates.isPublished = data.isPublished;
    if (data.email !== undefined) updates.email = data.email ? data.email.trim() : null;
    if (data.department !== undefined) updates.department = data.department ? data.department.trim() : null;
    if (data.institution !== undefined) updates.institution = data.institution ? data.institution.trim() : null;
    if (data.bio !== undefined) updates.bio = data.bio ? data.bio.trim() : null;

    const member = await updateFacultyMember(id, updates);

    revalidatePath("/faculty");
    revalidatePath("/admin");

    return { success: true, member };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update faculty member";
    return { success: false, error: message };
  }
}

export async function deleteFacultyMemberAction(id: string) {
  try {
    await assertAdminAuthorized();

    if (!id) {
      return { success: false, error: "Faculty member ID is required." };
    }

    const deleted = await deleteFacultyMember(id);
    if (!deleted) {
      return { success: false, error: "Faculty member not found or could not be deleted." };
    }

    revalidatePath("/faculty");
    revalidatePath("/admin");

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete faculty member";
    return { success: false, error: message };
  }
}

// ══════════════════════════════════════════════════════════════════
// 9. ANNOUNCEMENT ACTIONS
// ══════════════════════════════════════════════════════════════════

function safeRevalidate(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Gracefully handle execution outside Next.js request context (e.g. test scripts)
  }
}

export async function createAnnouncementAction(data: {
  title: string;
  summary: string;
  content: string;
  priority?: PriorityLevel;
  publishedAt?: string;
  expiresAt?: string | null;
  displayOrder?: number;
  isPublished?: boolean;
}) {
  try {
    await assertAdminAuthorized();

    if (!data.title?.trim()) {
      return { success: false, error: "Announcement title is required." };
    }
    if (!data.summary?.trim()) {
      return { success: false, error: "Announcement summary is required." };
    }
    if (!data.content?.trim()) {
      return { success: false, error: "Announcement content is required." };
    }

    const item = await createAnnouncement({
      title: data.title.trim(),
      summary: data.summary.trim(),
      content: data.content.trim(),
      priority: data.priority || "NORMAL",
      publishedAt: data.publishedAt,
      expiresAt: data.expiresAt || null,
      displayOrder: data.displayOrder ?? 0,
      isPublished: data.isPublished !== undefined ? data.isPublished : true,
    });

    safeRevalidate("/announcements");
    safeRevalidate("/admin");

    return { success: true, item };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create announcement";
    return { success: false, error: message };
  }
}

export async function updateAnnouncementAction(
  id: string,
  data: Partial<Announcement>
) {
  try {
    await assertAdminAuthorized();

    if (!id) {
      return { success: false, error: "Announcement ID is required." };
    }

    const updates: Partial<Announcement> = {};
    if (data.title !== undefined) updates.title = data.title.trim();
    if (data.summary !== undefined) updates.summary = data.summary.trim();
    if (data.content !== undefined) updates.content = data.content.trim();
    if (data.priority !== undefined) updates.priority = data.priority;
    if (data.publishedAt !== undefined) updates.publishedAt = data.publishedAt;
    if (data.expiresAt !== undefined) updates.expiresAt = data.expiresAt;
    if (data.displayOrder !== undefined) updates.displayOrder = data.displayOrder;
    if (data.isPublished !== undefined) updates.isPublished = data.isPublished;

    const item = await updateAnnouncement(id, updates);

    safeRevalidate("/announcements");
    safeRevalidate("/admin");

    return { success: true, item };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update announcement";
    return { success: false, error: message };
  }
}

export async function toggleAnnouncementPublishAction(
  id: string,
  isPublished: boolean
) {
  try {
    await assertAdminAuthorized();

    if (!id) {
      return { success: false, error: "Announcement ID is required." };
    }

    const item = await updateAnnouncement(id, { isPublished });

    safeRevalidate("/announcements");
    safeRevalidate("/admin");

    return { success: true, item };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to toggle announcement publish status";
    return { success: false, error: message };
  }
}

export async function deleteAnnouncementAction(id: string) {
  try {
    await assertAdminAuthorized();

    if (!id) {
      return { success: false, error: "Announcement ID is required." };
    }

    const deleted = await deleteAnnouncement(id);
    if (!deleted) {
      return { success: false, error: "Announcement not found or could not be deleted." };
    }

    safeRevalidate("/announcements");
    safeRevalidate("/admin");

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete announcement";
    return { success: false, error: message };
  }
}

export async function reorderAnnouncementsAction(
  updates: { id: string; displayOrder: number }[]
) {
  try {
    await assertAdminAuthorized();

    if (!updates || updates.length === 0) {
      return { success: false, error: "No updates provided." };
    }

    await reorderAnnouncements(updates);

    safeRevalidate("/announcements");
    safeRevalidate("/admin");

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to reorder announcements";
    return { success: false, error: message };
  }
}

// ══════════════════════════════════════════════════════════════════
// 10. AUTHENTICATION ACTIONS
// ══════════════════════════════════════════════════════════════════

/**
 * Authenticates administrator credentials and establishes an HTTP-only signed session cookie.
 */
export async function adminLoginAction(data: {
  username?: string;
  password?: string;
}): Promise<{ success: boolean; error?: string }> {
  // Artificial delay to mitigate high-speed brute-force attacks
  await new Promise((resolve) => setTimeout(resolve, 500));

  const inputUsername = data.username?.trim() || "";
  const inputPassword = data.password || "";

  if (!inputUsername || !inputPassword) {
    return { success: false, error: "Invalid username or password." };
  }

  const expectedUsername = process.env.ADMIN_USERNAME?.trim();
  const expectedHash = process.env.ADMIN_PASSWORD_HASH?.trim();

  // Fail safely if credentials are not configured in environment
  if (!expectedUsername || !expectedHash) {
    console.error(
      "Admin authentication failed: ADMIN_USERNAME or ADMIN_PASSWORD_HASH is not set in environment."
    );
    return {
      success: false,
      error: "Authentication service unavailable. Please contact the administrator.",
    };
  }

  // Constant-time comparison of username length and bytes
  const inputUserBuf = Buffer.from(inputUsername);
  const expectedUserBuf = Buffer.from(expectedUsername);
  const isUsernameMatch =
    inputUserBuf.length === expectedUserBuf.length &&
    crypto.timingSafeEqual(inputUserBuf, expectedUserBuf);

  // Verify password hash using scrypt + constant-time comparison
  const isPasswordMatch = await verifyPassword(inputPassword, expectedHash);

  if (!isUsernameMatch || !isPasswordMatch) {
    // Return generic error without revealing whether username or password was incorrect
    return { success: false, error: "Invalid username or password." };
  }

  // Issue signed session cookie
  await createAdminSession(expectedUsername);

  return { success: true };
}

/**
 * Destroys the admin session cookie and redirects to /admin/login.
 */
export async function adminLogoutAction(): Promise<void> {
  await clearAdminSession();
  redirect("/admin/login");
}

// ══════════════════════════════════════════════════════════════════
// 12. EDITION MANAGEMENT ACTIONS
// ══════════════════════════════════════════════════════════════════

/**
 * Creates a new annual Edition record.
 */
export async function createEditionAction(
  data: EditionFormData
): Promise<{ success: boolean; edition?: Edition; error?: string }> {
  try {
    await assertAdminAuthorized();
    if (!data.name || !data.name.trim()) {
      return { success: false, error: "Edition name is required." };
    }
    const edition = await createEdition(data);
    revalidatePath("/", "layout");
    revalidatePath("/admin");
    return { success: true, edition };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create edition.";
    return { success: false, error: message };
  }
}

/**
 * Updates an existing Edition record.
 */
export async function updateEditionAction(
  id: string,
  data: Partial<EditionFormData>
): Promise<{ success: boolean; edition?: Edition; error?: string }> {
  try {
    await assertAdminAuthorized();
    const edition = await updateEdition(id, data);
    revalidatePath("/", "layout");
    revalidatePath("/admin");
    return { success: true, edition };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update edition.";
    return { success: false, error: message };
  }
}

/**
 * Activates an edition as the active public edition, setting previous active to archived.
 */
export async function activateEditionAction(
  id: string
): Promise<{ success: boolean; edition?: Edition; error?: string }> {
  try {
    await assertAdminAuthorized();
    const edition = await activateEdition(id);
    revalidatePath("/", "layout");
    revalidatePath("/admin");
    return { success: true, edition };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to activate edition.";
    return { success: false, error: message };
  }
}

/**
 * Archives an edition.
 */
export async function archiveEditionAction(
  id: string
): Promise<{ success: boolean; edition?: Edition; error?: string }> {
  try {
    await assertAdminAuthorized();
    const edition = await archiveEdition(id);
    revalidatePath("/", "layout");
    revalidatePath("/admin");
    return { success: true, edition };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to archive edition.";
    return { success: false, error: message };
  }
}

