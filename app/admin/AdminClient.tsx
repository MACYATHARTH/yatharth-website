"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import {
  Image as ImageIcon,
  Sliders,
  Calendar,
  Link2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Eye,
  Plus,
  Trash2,
  Edit3,
  X,
  Type,
  Palette,
  Users,
  Film,
  Sparkles,
  FileText,
  Clock,
  MapPin,
  Upload,
  Award,
  Bell,
  LogOut,
} from "lucide-react";
import {
  updateThemeAppearanceAction,
  uploadAssetAction,
  createEventAction,
  updateEventAction,
  deleteEventAction,
  addEventCoordinatorAction,
  removeEventCoordinatorAction,
  updateEventRegistrationAction,
  createGalleryItemAction,
  updateGalleryItemAction,
  deleteGalleryItemAction,
  adminLogoutAction,
} from "./actions";
import {
  Event,
  GalleryItem,
  GalleryCategory,
  ThemePresetName,
  ThemeTokens,
  CoordinatorRole,
  FestivalLink,
  FestivalTeam,
  ScheduleEntry,
  Venue,
  ContactPageSettings,
  FacultyMember,
  Announcement,
} from "@/lib/data/types";
import { THEME_PRESETS } from "@/lib/data/theme.config";
import { AdminContentTab } from "@/components/admin/AdminContentTab";
import { AdminTeamTab } from "@/components/admin/AdminTeamTab";
import { AdminFacultyTab } from "@/components/admin/AdminFacultyTab";
import { AdminLinksTab } from "@/components/admin/AdminLinksTab";
import { AdminScheduleTab } from "@/components/admin/AdminScheduleTab";
import { AdminContactTab } from "@/components/admin/AdminContactTab";
import { AdminAnnouncementsTab } from "@/components/admin/AdminAnnouncementsTab";

interface AdminClientProps {
  initialAppearance: {
    wallpaperUrl: string;
    overlayOpacity: number;
    logoUrl: string | null;
    fontSans: string;
    fontDisplay: string;
    themePreset: ThemePresetName;
    themeTokens: ThemeTokens;
  };
  initialContent: {
    themeTitle: string;
    tagline: string;
    heroSupportingCopy: string;
    college: string;
    department: string;
    aboutIntro: string;
    aboutParagraphs: string[];
    contactEmail: string;
    contactPhone: string;
    contactAddress: string;
  };
  initialDates?: {
    startDate: string | null;
    endDate: string | null;
    isDateConfirmed: boolean;
  };
  initialEvents: Event[];
  initialGallery: GalleryItem[];
  initialLinktree: {
    url: string;
    enabled: boolean;
  };
  initialLinks: FestivalLink[];
  initialTeams: FestivalTeam[];
  initialSchedule: ScheduleEntry[];
  initialVenues: Venue[];
  initialFaculty: FacultyMember[];
  initialAnnouncements?: Announcement[];
  initialContactSettings?: ContactPageSettings;
  isDevelopment: boolean;
}

type TabType =
  | "appearance"
  | "content"
  | "events"
  | "schedule"
  | "team"
  | "faculty"
  | "gallery"
  | "links"
  | "contact"
  | "announcements";

const PRESET_OPTIONS: { id: Exclude<ThemePresetName, "custom">; name: string; desc: string }[] = [
  {
    id: "dark-festival",
    name: "Dark Festival",
    desc: "Default deep obsidian atmosphere with crimson accent.",
  },
  {
    id: "light-festival",
    name: "Light Festival",
    desc: "Clean porcelain background with dark typography and crimson highlight.",
  },
  {
    id: "warm-parchment",
    name: "Warm Parchment",
    desc: "Deep warm umber surface with amber gold highlights.",
  },
  {
    id: "cool-obsidian",
    name: "Cool Obsidian",
    desc: "Midnight navy base with vibrant electric blue festival accents.",
  },
];

const GALLERY_CATEGORIES: GalleryCategory[] = [
  "Organizing Team",
  "Behind the Scenes",
];

export function AdminClient({
  initialAppearance,
  initialContent,
  initialDates,
  initialEvents,
  initialGallery,
  initialLinktree,
  initialLinks,
  initialTeams,
  initialSchedule,
  initialVenues,
  initialFaculty,
  initialAnnouncements = [],
  initialContactSettings,
  isDevelopment,
}: AdminClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("appearance");
  const [facultyList, setFacultyList] = useState<FacultyMember[]>(initialFaculty || []);
  const [announcementsList, setAnnouncementsList] = useState<Announcement[]>(
    initialAnnouncements || []
  );

  const [isLoggingOut, startLogoutTransition] = useTransition();
  const handleLogout = () => {
    if (confirm("Are you sure you want to log out of the admin console?")) {
      startLogoutTransition(async () => {
        await adminLogoutAction();
      });
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 1. APPEARANCE STATE
  // ─────────────────────────────────────────────────────────────
  const [wallpaperUrl, setWallpaperUrl] = useState(initialAppearance.wallpaperUrl);
  const [overlayOpacity, setOverlayOpacity] = useState(initialAppearance.overlayOpacity);
  const [logoUrl, setLogoUrl] = useState<string | null>(initialAppearance.logoUrl);
  const [fontSans, setFontSans] = useState(initialAppearance.fontSans);
  const [fontDisplay, setFontDisplay] = useState(initialAppearance.fontDisplay);
  const [selectedPreset, setSelectedPreset] = useState<ThemePresetName>(
    initialAppearance.themePreset
  );
  const [tokens, setTokens] = useState<ThemeTokens>(initialAppearance.themeTokens);

  const [wallpaperFile, setWallpaperFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [appearanceMessage, setAppearanceMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isAppearancePending, startAppearanceTransition] = useTransition();

  // Handle Preset selection
  const handleSelectPreset = (presetKey: Exclude<ThemePresetName, "custom">) => {
    setSelectedPreset(presetKey);
    const presetTokens = THEME_PRESETS[presetKey];
    if (presetTokens) {
      setTokens({ ...presetTokens });
      setOverlayOpacity(presetTokens.overlayOpacity);
    }
  };

  // Handle Appearance Save
  const handleSaveAppearance = () => {
    setAppearanceMessage(null);

    startAppearanceTransition(async () => {
      let finalWallpaperUrl = wallpaperUrl.trim();
      let finalLogoUrl = logoUrl ? logoUrl.trim() : null;

      // Handle file uploads
      if (wallpaperFile) {
        const formData = new FormData();
        formData.append("file", wallpaperFile);
        const uploadRes = await uploadAssetAction(formData, "wallpaper");
        if (!uploadRes.success) {
          setAppearanceMessage({
            type: "error",
            text: uploadRes.error || "Wallpaper upload failed.",
          });
          return;
        }
        if (uploadRes.url) {
          finalWallpaperUrl = uploadRes.url;
          setWallpaperUrl(uploadRes.url);
          setWallpaperFile(null);
        }
      }

      if (logoFile) {
        const formData = new FormData();
        formData.append("file", logoFile);
        const uploadRes = await uploadAssetAction(formData, "logo");
        if (!uploadRes.success) {
          setAppearanceMessage({
            type: "error",
            text: uploadRes.error || "Logo upload failed.",
          });
          return;
        }
        if (uploadRes.url) {
          finalLogoUrl = uploadRes.url;
          setLogoUrl(uploadRes.url);
          setLogoFile(null);
        }
      }

      const res = await updateThemeAppearanceAction({
        wallpaperUrl: finalWallpaperUrl,
        overlayOpacity,
        logoUrl: finalLogoUrl,
        fontSans,
        fontDisplay,
        themePreset: selectedPreset,
        themeTokens: {
          ...tokens,
          overlayOpacity,
        },
      });

      if (res.success) {
        setAppearanceMessage({
          type: "success",
          text: "Theme and appearance settings published successfully.",
        });
      } else {
        setAppearanceMessage({
          type: "error",
          text: res.error || "Failed to save appearance settings.",
        });
      }
    });
  };

  // ─────────────────────────────────────────────────────────────
  // 2. EVENTS STATE
  // ─────────────────────────────────────────────────────────────
  const [eventsList, setEventsList] = useState<Event[]>(initialEvents);
  const [eventSearch, setEventSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [eventPendingId, setEventPendingId] = useState<string | null>(null);
  const [eventMessages, setEventMessages] = useState<
    Record<string, { type: "success" | "error"; text: string } | undefined>
  >({});

  // Modals for Events
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editPosterFile, setEditPosterFile] = useState<File | null>(null);

  // New Event Form State
  const [newEventData, setNewEventData] = useState({
    title: "",
    category: "General",
    shortDescription: "",
    fullDescription: "",
    rulesText: "Adhere to all festival rules.\nReport 15 minutes before scheduled start time.\nDecision of judges is final.",
    prizesText: "Winner: Gold Trophy & Certificate\nRunner Up: Silver Trophy & Certificate",
    participationType: "INDIVIDUAL" as "INDIVIDUAL" | "TEAM",
    teamSizeLimit: 1,
    registrationUrl: "",
    registrationStatus: "OPEN" as Event["registrationStatus"],
    registrationEnabled: true,
    posterUrl: "",
    published: true,
  });
  const [newPosterFile, setNewPosterFile] = useState<File | null>(null);
  const [isCreateEventPending, startCreateEventTransition] = useTransition();
  const [createEventError, setCreateEventError] = useState<string | null>(null);

  // Edit Coordinator Form State
  const [newCoordData, setNewCoordData] = useState({
    name: "",
    role: "HEAD" as CoordinatorRole,
    phone: "",
    email: "",
  });
  const [isCoordPending, startCoordTransition] = useTransition();

  // Categories list for event filter
  const eventCategories = ["ALL", ...Array.from(new Set(eventsList.map((e) => e.category)))];

  const filteredEvents = eventsList.filter((e) => {
    const matchesCat = selectedCategory === "ALL" || e.category === selectedCategory;
    const matchesQuery =
      e.title.toLowerCase().includes(eventSearch.toLowerCase()) ||
      e.category.toLowerCase().includes(eventSearch.toLowerCase()) ||
      e.slug.toLowerCase().includes(eventSearch.toLowerCase());
    return matchesCat && matchesQuery;
  });

  // Handle Quick Registration Save
  const handleQuickSaveRegistration = async (eventItem: Event) => {
    setEventPendingId(eventItem.id);
    setEventMessages((prev) => ({ ...prev, [eventItem.id]: undefined }));

    const res = await updateEventRegistrationAction({
      id: eventItem.id,
      registrationUrl: eventItem.registrationUrl,
      registrationStatus: eventItem.registrationStatus,
      registrationEnabled: eventItem.registrationEnabled,
    });

    setEventPendingId(null);

    if (res.success && res.event) {
      setEventMessages((prev) => ({
        ...prev,
        [eventItem.id]: {
          type: "success",
          text: "Registration link updated.",
        },
      }));
      setEventsList((prev) =>
        prev.map((e) =>
          e.id === eventItem.id
            ? {
                ...e,
                registrationUrl: res.event!.registrationUrl || "",
                registrationStatus: res.event!.registrationStatus,
                registrationEnabled: res.event!.registrationEnabled ?? true,
              }
            : e
        )
      );
    } else {
      setEventMessages((prev) => ({
        ...prev,
        [eventItem.id]: {
          type: "error",
          text: res.error || "Failed to save registration link.",
        },
      }));
    }
  };

  // Handle Create Event
  const handleCreateEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateEventError(null);

    startCreateEventTransition(async () => {
      let finalPosterUrl = newEventData.posterUrl.trim() || null;

      if (newPosterFile) {
        const formData = new FormData();
        formData.append("file", newPosterFile);
        const uploadRes = await uploadAssetAction(formData, "posters");
        if (uploadRes.success && uploadRes.url) {
          finalPosterUrl = uploadRes.url;
        }
      }

      const rules = newEventData.rulesText
        .split("\n")
        .map((r) => r.trim())
        .filter(Boolean);

      const prizes = newEventData.prizesText
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean);

      const res = await createEventAction({
        title: newEventData.title.trim(),
        category: newEventData.category.trim(),
        shortDescription: newEventData.shortDescription.trim(),
        fullDescription: newEventData.fullDescription.trim(),
        rules,
        prizes,
        participationType: newEventData.participationType,
        teamSizeLimit:
          newEventData.participationType === "TEAM" ? Number(newEventData.teamSizeLimit) : null,
        registrationUrl: newEventData.registrationUrl.trim() || null,
        registrationStatus: newEventData.registrationStatus,
        registrationEnabled: newEventData.registrationEnabled,
        posterUrl: finalPosterUrl,
        published: newEventData.published,
      });

      if (res.success && res.event) {
        setEventsList((prev) => [res.event!, ...prev]);
        setIsCreateEventOpen(false);
        setNewPosterFile(null);
        setNewEventData({
          title: "",
          category: "General",
          shortDescription: "",
          fullDescription: "",
          rulesText: "Adhere to all festival rules.\nReport 15 minutes before scheduled start time.",
          prizesText: "Winner: Gold Trophy & Certificate\nRunner Up: Silver Trophy & Certificate",
          participationType: "INDIVIDUAL",
          teamSizeLimit: 1,
          registrationUrl: "",
          registrationStatus: "OPEN",
          registrationEnabled: true,
          posterUrl: "",
          published: true,
        });
      } else {
        setCreateEventError(res.error || "Failed to create event.");
      }
    });
  };

  // Handle Update Event Modal Save
  const handleUpdateEditingEvent = async () => {
    if (!editingEvent) return;
    setEventPendingId(editingEvent.id);

    let finalPosterUrl = editingEvent.posterUrl;

    if (editPosterFile) {
      const formData = new FormData();
      formData.append("file", editPosterFile);
      const uploadRes = await uploadAssetAction(formData, "posters");
      if (uploadRes.success && uploadRes.url) {
        finalPosterUrl = uploadRes.url;
      } else if (!uploadRes.success) {
        alert(uploadRes.error || "Poster upload failed.");
        setEventPendingId(null);
        return;
      }
    }

    const res = await updateEventAction(editingEvent.id, {
      title: editingEvent.title,
      category: editingEvent.category,
      shortDescription: editingEvent.shortDescription,
      fullDescription: editingEvent.fullDescription,
      rules: editingEvent.rules,
      prizes: editingEvent.prizes,
      participationType: editingEvent.participationType,
      teamSizeLimit: editingEvent.teamSizeLimit,
      posterUrl: finalPosterUrl,
      published: editingEvent.published,
      registrationUrl: editingEvent.registrationUrl,
      registrationStatus: editingEvent.registrationStatus,
      registrationEnabled: editingEvent.registrationEnabled,
    });

    setEventPendingId(null);
    setEditPosterFile(null);

    if (res.success && res.event) {
      setEventsList((prev) => prev.map((e) => (e.id === editingEvent.id ? res.event! : e)));
      setEditingEvent(null);
    } else {
      alert(res.error || "Failed to update event.");
    }
  };

  // Handle Delete Event
  const handleDeleteEvent = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the event "${title}"?`)) return;

    const res = await deleteEventAction(id);
    if (res.success) {
      setEventsList((prev) => prev.filter((e) => e.id !== id));
      if (editingEvent?.id === id) setEditingEvent(null);
    } else {
      alert(res.error || "Failed to delete event.");
    }
  };

  // Handle Add Coordinator
  const handleAddCoordinator = () => {
    if (!editingEvent || !newCoordData.name.trim()) return;

    startCoordTransition(async () => {
      const res = await addEventCoordinatorAction(editingEvent.id, {
        name: newCoordData.name.trim(),
        role: newCoordData.role,
        phone: newCoordData.phone.trim() || null,
        email: newCoordData.email.trim() || null,
      });

      if (res.success && res.coordinator) {
        const updatedCoordinators = [...(editingEvent.coordinators || []), res.coordinator];
        const updatedEvent = { ...editingEvent, coordinators: updatedCoordinators };
        setEditingEvent(updatedEvent);
        setEventsList((prev) => prev.map((e) => (e.id === editingEvent.id ? updatedEvent : e)));
        setNewCoordData({ name: "", role: "HEAD", phone: "", email: "" });
      } else {
        alert(res.error || "Failed to add coordinator.");
      }
    });
  };

  // Handle Remove Coordinator
  const handleRemoveCoordinator = async (coordId: string) => {
    if (!editingEvent) return;
    if (!confirm("Remove this coordinator?")) return;

    const res = await removeEventCoordinatorAction(coordId);
    if (res.success) {
      const updatedCoordinators = (editingEvent.coordinators || []).filter((c) => c.id !== coordId);
      const updatedEvent = { ...editingEvent, coordinators: updatedCoordinators };
      setEditingEvent(updatedEvent);
      setEventsList((prev) => prev.map((e) => (e.id === editingEvent.id ? updatedEvent : e)));
    } else {
      alert(res.error || "Failed to remove coordinator.");
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 3. GALLERY STATE
  // ─────────────────────────────────────────────────────────────
  const [galleryList, setGalleryList] = useState<GalleryItem[]>(initialGallery);
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState<string>("ALL");
  const [isAddPhotoOpen, setIsAddPhotoOpen] = useState(false);
  const [editingGalleryItem, setEditingGalleryItem] = useState<GalleryItem | null>(null);

  // New Photo Form State
  const [newPhotoData, setNewPhotoData] = useState({
    title: "",
    category: "Organizing Team" as GalleryCategory,
    caption: "",
    mediaUrl: "",
    aspectRatio: "landscape" as "landscape" | "portrait" | "square",
    photographer: "",
    year: 2026,
    isPublished: true,
  });
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [isPhotoPending, startPhotoTransition] = useTransition();
  const [photoError, setPhotoError] = useState<string | null>(null);

  const filteredGallery = galleryList.filter((item) => {
    if (galleryCategoryFilter === "ALL") return true;
    return item.category === galleryCategoryFilter;
  });

  // Handle Add Photo
  const handleCreatePhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPhotoError(null);

    startPhotoTransition(async () => {
      let finalMediaUrl = newPhotoData.mediaUrl.trim();

      if (newPhotoFile) {
        const formData = new FormData();
        formData.append("file", newPhotoFile);
        const uploadRes = await uploadAssetAction(formData, "gallery");
        if (uploadRes.success && uploadRes.url) {
          finalMediaUrl = uploadRes.url;
        } else {
          setPhotoError(uploadRes.error || "Photo upload failed.");
          return;
        }
      }

      if (!finalMediaUrl) {
        setPhotoError("Please provide an image URL or upload an image file.");
        return;
      }

      const res = await createGalleryItemAction({
        title: newPhotoData.title.trim(),
        category: newPhotoData.category,
        caption: newPhotoData.caption.trim(),
        mediaUrl: finalMediaUrl,
        aspectRatio: newPhotoData.aspectRatio,
        photographer: newPhotoData.photographer.trim() || null,
        year: Number(newPhotoData.year) || 2026,
        isPublished: newPhotoData.isPublished,
      });

      if (res.success && res.item) {
        setGalleryList((prev) => [res.item!, ...prev]);
        setIsAddPhotoOpen(false);
        setNewPhotoFile(null);
        setNewPhotoData({
          title: "",
          category: "Organizing Team",
          caption: "",
          mediaUrl: "",
          aspectRatio: "landscape",
          photographer: "",
          year: 2026,
          isPublished: true,
        });
      } else {
        setPhotoError(res.error || "Failed to add photo.");
      }
    });
  };

  // Handle Toggle Gallery Published
  const handleToggleGalleryPublished = async (item: GalleryItem) => {
    const newStatus = !item.isPublished;
    const res = await updateGalleryItemAction(item.id, { isPublished: newStatus });
    if (res.success && res.item) {
      setGalleryList((prev) => prev.map((g) => (g.id === item.id ? { ...g, isPublished: newStatus } : g)));
    }
  };

  // Handle Delete Gallery Item
  const handleDeleteGalleryItem = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}" from the gallery?`)) return;

    const res = await deleteGalleryItemAction(id);
    if (res.success) {
      setGalleryList((prev) => prev.filter((g) => g.id !== id));
      if (editingGalleryItem?.id === id) setEditingGalleryItem(null);
    } else {
      alert(res.error || "Failed to delete gallery item.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0A09] text-[#E9E6DF] pb-28 select-none">
      {/* ═══════════════════════════════════════════════
          HEADER BAR
          ═══════════════════════════════════════════════ */}
      <div className="border-b border-white/[0.08] bg-[#0E0D0C]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-widest text-[#8F3025] font-bold px-2 py-0.5 border border-[#8F3025]/40 bg-[#8F3025]/10">
              Master Admin
            </span>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              YATHARTH &apos;26 Console
            </h1>
          </div>

          {/* Authenticated Session & Logout */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-emerald-950/40 text-emerald-300 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Authenticated Session
            </span>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/15 rounded-xs transition-colors cursor-pointer text-xs font-mono disabled:opacity-50"
              title="End Administrative Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isLoggingOut ? "Logging out..." : "Log Out"}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 border-t border-white/[0.04] overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("appearance")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "appearance"
                ? "border-[#8F3025] text-white font-bold bg-white/[0.02]"
                : "border-transparent text-[#77716A] hover:text-[#E9E6DF]"
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Appearance &amp; Theme</span>
          </button>

          <button
            onClick={() => setActiveTab("content")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "content"
                ? "border-[#8F3025] text-white font-bold bg-white/[0.02]"
                : "border-transparent text-[#77716A] hover:text-[#E9E6DF]"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Content &amp; Editorial</span>
          </button>

          <button
            onClick={() => setActiveTab("events")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "events"
                ? "border-[#8F3025] text-white font-bold bg-white/[0.02]"
                : "border-transparent text-[#77716A] hover:text-[#E9E6DF]"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Events ({eventsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("schedule")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "schedule"
                ? "border-[#8F3025] text-white font-bold bg-white/[0.02]"
                : "border-transparent text-[#77716A] hover:text-[#E9E6DF]"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Schedule ({initialSchedule.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("team")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "team"
                ? "border-[#8F3025] text-white font-bold bg-white/[0.02]"
                : "border-transparent text-[#77716A] hover:text-[#E9E6DF]"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Organising Team ({initialTeams.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("faculty")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "faculty"
                ? "border-[#8F3025] text-white font-bold bg-white/[0.02]"
                : "border-transparent text-[#77716A] hover:text-[#E9E6DF]"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Faculty ({facultyList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("gallery")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "gallery"
                ? "border-[#8F3025] text-white font-bold bg-white/[0.02]"
                : "border-transparent text-[#77716A] hover:text-[#E9E6DF]"
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Gallery ({galleryList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("links")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "links"
                ? "border-[#8F3025] text-white font-bold bg-white/[0.02]"
                : "border-transparent text-[#77716A] hover:text-[#E9E6DF]"
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Social &amp; Links ({initialLinks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("contact")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "contact"
                ? "border-[#8F3025] text-white font-bold bg-white/[0.02]"
                : "border-transparent text-[#77716A] hover:text-[#E9E6DF]"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Contact Page</span>
          </button>

          <button
            onClick={() => setActiveTab("announcements")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "announcements"
                ? "border-[#8F3025] text-white font-bold bg-white/[0.02]"
                : "border-transparent text-[#77716A] hover:text-[#E9E6DF]"
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Announcements ({announcementsList.length})</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        {/* ═══════════════════════════════════════════════
            TAB 1: APPEARANCE & THEME
            ═══════════════════════════════════════════════ */}
        {activeTab === "appearance" && (
          <div className="space-y-10">
            <div className="border-b border-white/[0.08] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">
                  Festival Appearance &amp; Brand System
                </h2>
                <p className="text-xs text-[#77716A] mt-1">
                  Configure the master wallpaper, brand logo mark, active typography, and theme color
                  tokens.
                </p>
              </div>

              <button
                type="button"
                disabled={!isDevelopment || isAppearancePending}
                onClick={handleSaveAppearance}
                className="px-6 py-2.5 bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 shrink-0"
              >
                {isAppearancePending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <span>Publish All Appearance &rarr;</span>
                )}
              </button>
            </div>

            {appearanceMessage && (
              <div
                className={`p-4 border rounded-xs flex items-center gap-3 text-xs ${
                  appearanceMessage.type === "success"
                    ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300"
                    : "border-[#8F3025]/50 bg-[#8F3025]/15 text-rose-300"
                }`}
              >
                {appearanceMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{appearanceMessage.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Form Controls */}
              <div className="lg:col-span-7 space-y-8">
                {/* 1. Theme Presets */}
                <div className="p-6 bg-[#121110] border border-white/[0.08] rounded-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#8F3025]" />
                      Theme Presets (Theme-Agnostic)
                    </h3>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">
                      Preset: {selectedPreset}
                    </span>
                  </div>

                  <p className="text-xs text-[#77716A]">
                    Select a curated starting preset. Selecting a preset immediately updates the
                    color token inputs below.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PRESET_OPTIONS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPreset(p.id)}
                        className={`p-3.5 rounded-xs border text-left transition-all cursor-pointer ${
                          selectedPreset === p.id
                            ? "border-[#8F3025] bg-[#8F3025]/15 text-white"
                            : "border-white/10 bg-black/40 text-zinc-400 hover:border-white/25 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs font-mono">{p.name}</span>
                          {selectedPreset === p.id && (
                            <span className="w-2 h-2 rounded-full bg-[#8F3025]" />
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-snug">{p.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Custom Token Color Pickers */}
                <div className="p-6 bg-[#121110] border border-white/[0.08] rounded-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold flex items-center gap-2">
                      <Palette className="w-3.5 h-3.5 text-[#8F3025]" />
                      Color Tokens
                    </h3>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">
                      Fine-Tuning
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono text-zinc-400 uppercase">
                        Background Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={tokens.background}
                          onChange={(e) => {
                            setSelectedPreset("custom");
                            setTokens((prev) => ({ ...prev, background: e.target.value }));
                          }}
                          className="w-8 h-8 rounded-xs cursor-pointer border border-white/20 bg-transparent"
                        />
                        <input
                          type="text"
                          value={tokens.background}
                          onChange={(e) => {
                            setSelectedPreset("custom");
                            setTokens((prev) => ({ ...prev, background: e.target.value }));
                          }}
                          className="flex-1 px-2.5 py-1.5 bg-black/60 border border-white/15 text-xs font-mono text-white rounded-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono text-zinc-400 uppercase">
                        Surface Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={tokens.surface}
                          onChange={(e) => {
                            setSelectedPreset("custom");
                            setTokens((prev) => ({ ...prev, surface: e.target.value }));
                          }}
                          className="w-8 h-8 rounded-xs cursor-pointer border border-white/20 bg-transparent"
                        />
                        <input
                          type="text"
                          value={tokens.surface}
                          onChange={(e) => {
                            setSelectedPreset("custom");
                            setTokens((prev) => ({ ...prev, surface: e.target.value }));
                          }}
                          className="flex-1 px-2.5 py-1.5 bg-black/60 border border-white/15 text-xs font-mono text-white rounded-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono text-zinc-400 uppercase">
                        Primary Text Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={tokens.textPrimary}
                          onChange={(e) => {
                            setSelectedPreset("custom");
                            setTokens((prev) => ({ ...prev, textPrimary: e.target.value }));
                          }}
                          className="w-8 h-8 rounded-xs cursor-pointer border border-white/20 bg-transparent"
                        />
                        <input
                          type="text"
                          value={tokens.textPrimary}
                          onChange={(e) => {
                            setSelectedPreset("custom");
                            setTokens((prev) => ({ ...prev, textPrimary: e.target.value }));
                          }}
                          className="flex-1 px-2.5 py-1.5 bg-black/60 border border-white/15 text-xs font-mono text-white rounded-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono text-zinc-400 uppercase">
                        Accent Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={tokens.accent}
                          onChange={(e) => {
                            setSelectedPreset("custom");
                            setTokens((prev) => ({ ...prev, accent: e.target.value }));
                          }}
                          className="w-8 h-8 rounded-xs cursor-pointer border border-white/20 bg-transparent"
                        />
                        <input
                          type="text"
                          value={tokens.accent}
                          onChange={(e) => {
                            setSelectedPreset("custom");
                            setTokens((prev) => ({ ...prev, accent: e.target.value }));
                          }}
                          className="flex-1 px-2.5 py-1.5 bg-black/60 border border-white/15 text-xs font-mono text-white rounded-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono text-zinc-400 uppercase">
                        CTA Button Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={tokens.cta}
                          onChange={(e) => {
                            setSelectedPreset("custom");
                            setTokens((prev) => ({ ...prev, cta: e.target.value }));
                          }}
                          className="w-8 h-8 rounded-xs cursor-pointer border border-white/20 bg-transparent"
                        />
                        <input
                          type="text"
                          value={tokens.cta}
                          onChange={(e) => {
                            setSelectedPreset("custom");
                            setTokens((prev) => ({ ...prev, cta: e.target.value }));
                          }}
                          className="flex-1 px-2.5 py-1.5 bg-black/60 border border-white/15 text-xs font-mono text-white rounded-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono text-zinc-400 uppercase">
                        CTA Text Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={tokens.ctaText}
                          onChange={(e) => {
                            setSelectedPreset("custom");
                            setTokens((prev) => ({ ...prev, ctaText: e.target.value }));
                          }}
                          className="w-8 h-8 rounded-xs cursor-pointer border border-white/20 bg-transparent"
                        />
                        <input
                          type="text"
                          value={tokens.ctaText}
                          onChange={(e) => {
                            setSelectedPreset("custom");
                            setTokens((prev) => ({ ...prev, ctaText: e.target.value }));
                          }}
                          className="flex-1 px-2.5 py-1.5 bg-black/60 border border-white/15 text-xs font-mono text-white rounded-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Typography Configuration */}
                <div className="p-6 bg-[#121110] border border-white/[0.08] rounded-xs space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold flex items-center gap-2">
                    <Type className="w-3.5 h-3.5 text-[#8F3025]" />
                    Typography System
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-mono text-zinc-400 uppercase">
                        Primary Sans Font
                      </label>
                      <select
                        value={fontSans}
                        onChange={(e) => setFontSans(e.target.value)}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 focus:border-[#8F3025] focus:outline-none text-xs font-mono text-white rounded-xs"
                      >
                        <option value="geist">Geist Sans (Modern Technical)</option>
                        <option value="inter">Inter (High-Legibility Grotesque)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-mono text-zinc-400 uppercase">
                        Headline Display Font
                      </label>
                      <select
                        value={fontDisplay}
                        onChange={(e) => setFontDisplay(e.target.value)}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 focus:border-[#8F3025] focus:outline-none text-xs font-mono text-white rounded-xs"
                      >
                        <option value="graduate">Graduate (Varsity Collegiate Athletic)</option>
                        <option value="cinzel">Cinzel (Classical Roman Inscription)</option>
                        <option value="playfair">Playfair Display (High-Contrast Serif)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 4. Wallpaper & Overlay */}
                <div className="p-6 bg-[#121110] border border-white/[0.08] rounded-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold flex items-center gap-2">
                      <ImageIcon className="w-3.5 h-3.5 text-[#8F3025]" />
                      Master Wallpaper
                    </h3>
                    <button
                      type="button"
                      onClick={() => setWallpaperUrl("/assets/wallpaper/yatharth-wallpaper.jpg")}
                      className="text-[10px] font-mono text-[#8F3025] hover:text-white uppercase transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Reset to Default
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-mono text-zinc-400 uppercase">
                      Wallpaper Image URL
                    </label>
                    <input
                      type="text"
                      value={wallpaperUrl}
                      onChange={(e) => setWallpaperUrl(e.target.value)}
                      placeholder="https://... or /assets/wallpaper/..."
                      className="w-full px-3.5 py-2 bg-black/60 border border-white/15 focus:border-[#8F3025] focus:outline-none text-xs font-mono text-white rounded-xs"
                    />
                  </div>

                  {/* Master Wallpaper Upload */}
                  <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                    <span className="text-[11px] font-mono uppercase text-zinc-400">
                      Upload Master Wallpaper
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setWallpaperFile(file);
                        if (file) setWallpaperUrl(URL.createObjectURL(file));
                      }}
                      className="w-full text-xs text-zinc-400 file:mr-3 file:py-1 file:px-2.5 file:rounded-xs file:border file:border-white/15 file:text-xs file:font-mono file:bg-white/[0.04] file:text-white hover:file:bg-white/10 file:cursor-pointer cursor-pointer"
                    />
                  </div>

                  {/* Overlay Darkness Slider */}
                  <div className="pt-3 border-t border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-3.5 h-3.5 text-[#8F3025]" />
                        <label className="text-[11px] font-mono uppercase text-zinc-300 font-semibold">
                          Overlay Opacity
                        </label>
                      </div>
                      <span className="text-xs font-mono text-white bg-white/[0.06] px-2 py-0.5 border border-white/10">
                        {Math.round(overlayOpacity * 100)}%
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0.10"
                      max="0.95"
                      step="0.01"
                      value={overlayOpacity}
                      onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                      className="w-full accent-[#8F3025] cursor-pointer"
                    />
                  </div>
                </div>

                {/* 5. Logo Mark */}
                <div className="p-6 bg-[#121110] border border-white/[0.08] rounded-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold">
                      Festival Logo Mark
                    </h3>
                    {logoUrl && (
                      <button
                        type="button"
                        onClick={() => setLogoUrl(null)}
                        className="text-[10px] font-mono text-rose-400 hover:text-white uppercase transition-colors cursor-pointer"
                      >
                        Remove Logo
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-[#77716A]">
                    When a logo mark is uploaded or set, it is cleanly rendered in the header and
                    footer. When empty, the typographic YATHARTH identity displays automatically.
                  </p>

                  <div className="space-y-2">
                    <label className="text-[11px] font-mono text-zinc-400 uppercase">
                      Logo Image URL
                    </label>
                    <input
                      type="text"
                      value={logoUrl || ""}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://... or /assets/logo/..."
                      className="w-full px-3.5 py-2 bg-black/60 border border-white/15 focus:border-[#8F3025] focus:outline-none text-xs font-mono text-white rounded-xs"
                    />
                  </div>

                  <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                    <span className="text-[11px] font-mono uppercase text-zinc-400">
                      Upload Logo Mark
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setLogoFile(file);
                        if (file) setLogoUrl(URL.createObjectURL(file));
                      }}
                      className="w-full text-xs text-zinc-400 file:mr-3 file:py-1 file:px-2.5 file:rounded-xs file:border file:border-white/15 file:text-xs file:font-mono file:bg-white/[0.04] file:text-white hover:file:bg-white/10 file:cursor-pointer cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Dynamic Live Preview */}
              <div className="lg:col-span-5 space-y-6">
                <div className="sticky top-24 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      Dynamic Live Preview
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">
                      Theme Real-Time
                    </span>
                  </div>

                  {/* Simulated Hero Card with exact live tokens */}
                  <div
                    className="relative aspect-[16/12] w-full rounded-xs border overflow-hidden shadow-2xl flex flex-col justify-between p-6 transition-all duration-300"
                    style={{
                      backgroundColor: tokens.background,
                      borderColor: tokens.border,
                      color: tokens.textPrimary,
                    }}
                  >
                    {/* Live Wallpaper Background */}
                    {wallpaperUrl && (
                      <Image
                        src={wallpaperUrl}
                        alt="Preview Background"
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover object-center pointer-events-none"
                        unoptimized={wallpaperUrl.startsWith("blob:")}
                      />
                    )}

                    {/* Dark / Light Overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none transition-opacity"
                      style={{
                        backgroundColor: tokens.overlayBg || "rgba(11, 10, 9, 1)",
                        opacity: overlayOpacity,
                      }}
                    />

                    {/* Top simulation bar */}
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={logoUrl}
                            alt="Logo"
                            className="h-7 max-w-[160px] w-auto object-contain shrink-0"
                          />
                        ) : (
                          <span
                            className="font-varsity text-lg font-bold tracking-wider"
                            style={{ color: tokens.textPrimary }}
                          >
                            YATHARTH &apos;26
                          </span>
                        )}
                      </div>

                      <span
                        className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-xs"
                        style={{
                          backgroundColor: tokens.accent,
                          color: "#ffffff",
                        }}
                      >
                        Live Test
                      </span>
                    </div>

                    {/* Center Typography Preview */}
                    <div className="relative z-10 space-y-2 my-auto">
                      <div
                        className="text-[10px] font-mono uppercase tracking-[0.25em] font-bold"
                        style={{ color: tokens.accent }}
                      >
                        Maharaja Agrasen College &bull; DU
                      </div>
                      <h3
                        className="text-2xl sm:text-3xl font-black uppercase tracking-tight"
                        style={{
                          fontFamily:
                            fontDisplay === "cinzel"
                              ? "var(--font-cinzel), serif"
                              : fontDisplay === "playfair"
                              ? "var(--font-playfair), serif"
                              : "var(--font-varsity), serif",
                          color: tokens.textPrimary,
                        }}
                      >
                        National Journalism Festival
                      </h3>
                      <p
                        className="text-xs leading-relaxed max-w-sm line-clamp-2"
                        style={{
                          color: tokens.textSecondary,
                          fontFamily:
                            fontSans === "inter"
                              ? "var(--font-inter), sans-serif"
                              : "var(--font-geist-sans), sans-serif",
                        }}
                      >
                        Celebrating authentic student reporting, documentary photography, and
                        media innovation.
                      </p>
                    </div>

                    {/* Bottom CTA preview */}
                    <div className="relative z-10 flex items-center gap-3">
                      <button
                        type="button"
                        className="px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider rounded-xs shadow-md"
                        style={{
                          backgroundColor: tokens.cta,
                          color: tokens.ctaText,
                        }}
                      >
                        Register Now
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-xs border"
                        style={{
                          borderColor: tokens.border,
                          color: tokens.textPrimary,
                          backgroundColor: tokens.glassBg,
                        }}
                      >
                        Explore Events
                      </button>
                    </div>
                  </div>

                  {/* Surface Palette Swatches */}
                  <div className="p-4 bg-[#121110] border border-white/[0.08] rounded-xs space-y-2">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">
                      Active Palette Swatches:
                    </span>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-xs border border-white/20"
                        style={{ backgroundColor: tokens.background }}
                        title={`Background: ${tokens.background}`}
                      />
                      <div
                        className="w-7 h-7 rounded-xs border border-white/20"
                        style={{ backgroundColor: tokens.surface }}
                        title={`Surface: ${tokens.surface}`}
                      />
                      <div
                        className="w-7 h-7 rounded-xs border border-white/20"
                        style={{ backgroundColor: tokens.accent }}
                        title={`Accent: ${tokens.accent}`}
                      />
                      <div
                        className="w-7 h-7 rounded-xs border border-white/20"
                        style={{ backgroundColor: tokens.cta }}
                        title={`CTA: ${tokens.cta}`}
                      />
                      <div
                        className="w-7 h-7 rounded-xs border border-white/20"
                        style={{ backgroundColor: tokens.textPrimary }}
                        title={`Text Primary: ${tokens.textPrimary}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB 2: FESTIVAL CONTENT & EDITORIAL
            ═══════════════════════════════════════════════ */}
        {activeTab === "content" && (
          <AdminContentTab
            initialContent={initialContent}
            initialDates={initialDates}
            isDevelopment={isDevelopment}
          />
        )}

        {/* ═══════════════════════════════════════════════
            TAB 3: EVENTS & REGISTRATION
            ═══════════════════════════════════════════════ */}
        {activeTab === "events" && (
          <div className="space-y-6">
            <div className="border-b border-white/[0.08] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">
                  Festival Competitions &amp; Registration
                </h2>
                <p className="text-xs text-[#77716A] mt-1">
                  Manage event details, rules, prizes, coordinators, poster visuals, and Google
                  Forms links.
                </p>
              </div>

              <button
                type="button"
                disabled={!isDevelopment}
                onClick={() => setIsCreateEventOpen(true)}
                className="px-4 py-2.5 bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Event</span>
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 bg-[#121110] border border-white/[0.08] rounded-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search events by title or slug..."
                  value={eventSearch}
                  onChange={(e) => setEventSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-black/60 border border-white/15 focus:border-[#8F3025] focus:outline-none text-xs font-mono text-white rounded-xs"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none">
                {eventCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider border rounded-xs transition-colors whitespace-nowrap cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-[#8F3025] border-[#8F3025] text-white font-bold"
                        : "border-white/10 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Events List */}
            <div className="space-y-4">
              {filteredEvents.map((evt) => {
                const message = eventMessages[evt.id];
                const isPending = eventPendingId === evt.id;

                return (
                  <div
                    key={evt.id}
                    className="p-5 bg-[#121110] border border-white/[0.08] hover:border-white/20 transition-all rounded-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/[0.06] pb-4">
                      <div className="flex items-start gap-4">
                        {/* Poster Thumbnail */}
                        <div className="relative w-16 h-20 bg-black/60 border border-white/15 rounded-xs overflow-hidden shrink-0 flex items-center justify-center">
                          {evt.posterUrl ? (
                            <Image
                              src={evt.posterUrl}
                              alt={evt.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <span className="font-mono text-[9px] text-zinc-500 text-center px-1">
                              No Poster
                            </span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] uppercase text-[#8F3025] bg-[#8F3025]/10 px-2 py-0.5 border border-[#8F3025]/30">
                              {evt.category}
                            </span>
                            <span className="font-mono text-[10px] text-zinc-500">
                              /events/{evt.slug}
                            </span>
                            <span
                              className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-xs border ${
                                evt.published
                                  ? "border-emerald-500/30 text-emerald-400 bg-emerald-950/20"
                                  : "border-amber-500/30 text-amber-400 bg-amber-950/20"
                              }`}
                            >
                              {evt.published ? "Published" : "Draft"}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-white">{evt.title}</h3>
                          <p className="text-xs text-[#77716A] line-clamp-1">
                            {evt.shortDescription}
                          </p>

                          {/* Coordinator count */}
                          <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5 pt-1">
                            <Users className="w-3 h-3 text-zinc-500" />
                            <span>
                              {evt.coordinators?.length || 0} assigned coordinator(s)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => setEditingEvent(evt)}
                          className="px-3 py-1.5 border border-white/20 hover:border-white text-xs font-mono uppercase tracking-wider text-zinc-300 hover:text-white transition-colors rounded-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit Details</span>
                        </button>

                        <button
                          type="button"
                          disabled={!isDevelopment}
                          onClick={() => handleDeleteEvent(evt.id, evt.title)}
                          className="p-1.5 border border-rose-500/30 hover:border-rose-500 text-rose-400 hover:text-rose-300 transition-colors rounded-xs cursor-pointer disabled:opacity-40"
                          title="Delete Event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Quick Registration Settings Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center pt-1">
                      <div className="lg:col-span-6 flex items-center gap-2">
                        <input
                          type="url"
                          placeholder="Google Forms URL (https://forms.gle/...)"
                          value={evt.registrationUrl || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEventsList((prev) =>
                              prev.map((item) =>
                                item.id === evt.id ? { ...item, registrationUrl: val } : item
                              )
                            );
                          }}
                          className="flex-1 px-3 py-1.5 bg-black/60 border border-white/15 focus:border-[#8F3025] focus:outline-none text-xs font-mono text-white rounded-xs"
                        />
                        {evt.registrationUrl && (
                          <a
                            href={evt.registrationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 border border-white/15 bg-white/[0.03] hover:bg-white/10 text-zinc-400 hover:text-white rounded-xs transition-colors shrink-0"
                            title="Open Google Form in New Tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      <div className="lg:col-span-3 flex items-center gap-3">
                        <select
                          value={evt.registrationStatus}
                          onChange={(e) => {
                            const newStatus = e.target.value as Event["registrationStatus"];
                            setEventsList((prev) =>
                              prev.map((item) =>
                                item.id === evt.id ? { ...item, registrationStatus: newStatus } : item
                              )
                            );
                          }}
                          className="bg-black/60 border border-white/15 text-xs font-mono text-white px-2 py-1.5 rounded-xs focus:border-[#8F3025] focus:outline-none cursor-pointer flex-1"
                        >
                          <option value="OPEN">OPEN</option>
                          <option value="CLOSED">CLOSED</option>
                          <option value="COMING_SOON">COMING_SOON</option>
                          <option value="NOT_AVAILABLE">NOT_AVAILABLE</option>
                        </select>

                        <label className="flex items-center gap-1.5 text-xs font-mono cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={evt.registrationEnabled !== false}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setEventsList((prev) =>
                                prev.map((item) =>
                                  item.id === evt.id ? { ...item, registrationEnabled: checked } : item
                                )
                              );
                            }}
                            className="accent-[#8F3025] w-3.5 h-3.5 cursor-pointer"
                          />
                          <span
                            className={
                              evt.registrationEnabled !== false
                                ? "text-emerald-400"
                                : "text-zinc-500"
                            }
                          >
                            Active
                          </span>
                        </label>
                      </div>

                      <div className="lg:col-span-3 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          disabled={!isDevelopment || isPending}
                          onClick={() => handleQuickSaveRegistration(evt)}
                          className="px-4 py-1.5 bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                        >
                          {isPending ? "Saving..." : "Save Link"}
                        </button>
                      </div>
                    </div>

                    {message && (
                      <div
                        className={`text-xs font-mono pt-1 flex items-center gap-1.5 ${
                          message.type === "success" ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {message.type === "success" ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5" />
                        )}
                        <span>{message.text}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            TAB 4: ORGANISING TEAM & LEADERSHIP
            ═══════════════════════════════════════════════ */}
        {activeTab === "team" && (
          <AdminTeamTab
            initialTeams={initialTeams}
            events={eventsList}
            isDevelopment={isDevelopment}
          />
        )}

        {/* ═══════════════════════════════════════════════
            TAB: FACULTY LEADERSHIP & ACADEMIC MENTORSHIP
            ═══════════════════════════════════════════════ */}
        {activeTab === "faculty" && (
          <AdminFacultyTab
            initialFaculty={facultyList}
            isDevelopment={isDevelopment}
            onFacultyChange={(updated) => setFacultyList(updated)}
          />
        )}

        {/* ═══════════════════════════════════════════════
            TAB 5: GALLERY MANAGEMENT
            ═══════════════════════════════════════════════ */}
        {activeTab === "gallery" && (
          <div className="space-y-6">
            <div className="border-b border-white/[0.08] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">
                  Festival Gallery &amp; Retrospective
                </h2>
                <p className="text-xs text-[#77716A] mt-1">
                  Curate photos, assign categories and aspect ratios, credit photographers, and publish
                  visual moments.
                </p>
              </div>

              <button
                type="button"
                disabled={!isDevelopment}
                onClick={() => setIsAddPhotoOpen(true)}
                className="px-4 py-2.5 bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Photo</span>
              </button>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2">
              {["ALL", ...GALLERY_CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setGalleryCategoryFilter(cat)}
                  className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider border rounded-xs transition-colors whitespace-nowrap cursor-pointer ${
                    galleryCategoryFilter === cat
                      ? "bg-[#8F3025] border-[#8F3025] text-white font-bold"
                      : "border-white/10 text-zinc-400 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGallery.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#121110] border border-white/[0.08] rounded-xs overflow-hidden flex flex-col justify-between group hover:border-white/20 transition-all"
                >
                  <div className="relative aspect-[16/10] bg-black/60">
                    <Image
                      src={item.mediaUrl || item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="font-mono text-[9px] uppercase px-2 py-0.5 bg-black/80 text-white border border-white/20 backdrop-blur-xs">
                        {item.category}
                      </span>
                      <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 bg-black/80 text-zinc-400 border border-white/20 backdrop-blur-xs">
                        {item.aspectRatio || "16:9"}
                      </span>
                    </div>

                    <div className="absolute top-2 right-2">
                      <button
                        type="button"
                        disabled={!isDevelopment}
                        onClick={() => handleToggleGalleryPublished(item)}
                        className={`text-[9px] font-mono uppercase px-2 py-0.5 border cursor-pointer ${
                          item.isPublished
                            ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-300"
                            : "bg-zinc-900/80 border-zinc-700 text-zinc-400"
                        }`}
                      >
                        {item.isPublished ? "Published" : "Draft"}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-sm text-white">{item.title}</h3>
                    <p className="text-xs text-[#77716A] line-clamp-2">{item.caption}</p>

                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-2 border-t border-white/[0.06]">
                      <span>{item.photographer || "Staff Photographer"}</span>
                      <span>{item.year || 2026}</span>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        disabled={!isDevelopment}
                        onClick={() => handleDeleteGalleryItem(item.id, item.title)}
                        className="px-2.5 py-1 text-[11px] font-mono text-rose-400 border border-rose-500/30 hover:border-rose-500 transition-colors rounded-xs cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════
            SCHEDULE MANAGEMENT TAB
            ═══════════════════════════════════════════════ */}
        {activeTab === "schedule" && (
          <AdminScheduleTab
            initialSchedule={initialSchedule}
            events={eventsList}
            venues={initialVenues}
            isDevelopment={isDevelopment}
          />
        )}

        {/* ═══════════════════════════════════════════════
            TAB 6: SOCIAL MEDIA & FESTIVAL LINKS
            ═══════════════════════════════════════════════ */}
        {activeTab === "links" && (
          <AdminLinksTab
            initialLinktree={initialLinktree}
            initialLinks={initialLinks}
            isDevelopment={isDevelopment}
          />
        )}

        {/* ═══════════════════════════════════════════════
            CONTACT PAGE CMS TAB
            ═══════════════════════════════════════════════ */}
        {activeTab === "contact" && (
          <AdminContactTab
            initialSettings={initialContactSettings}
            initialLinks={initialLinks}
            isDevelopment={isDevelopment}
          />
        )}

        {/* ═══════════════════════════════════════════════
            ANNOUNCEMENTS CMS TAB
            ═══════════════════════════════════════════════ */}
        {activeTab === "announcements" && (
          <AdminAnnouncementsTab
            initialAnnouncements={announcementsList}
            isDevelopment={isDevelopment}
            onAnnouncementsChange={(updated) => setAnnouncementsList(updated)}
          />
        )}
      </div>

      {/* ═══════════════════════════════════════════════
          MODAL: CREATE NEW EVENT
          ═══════════════════════════════════════════════ */}
      {isCreateEventOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121110] border border-white/20 rounded-xs max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                Create New Event
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateEventOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createEventError && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs rounded-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createEventError}</span>
              </div>
            )}

            <form onSubmit={handleCreateEventSubmit} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Event Title *</label>
                  <input
                    type="text"
                    required
                    value={newEventData.title}
                    onChange={(e) => setNewEventData({ ...newEventData, title: e.target.value })}
                    placeholder="e.g. Lead Story Investigative Contest"
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Category *</label>
                  <input
                    type="text"
                    required
                    value={newEventData.category}
                    onChange={(e) => setNewEventData({ ...newEventData, category: e.target.value })}
                    placeholder="e.g. Photography, Print, Broadcast, Debate"
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Short Synopsis (Homepage Brief) *</label>
                <input
                  type="text"
                  required
                  value={newEventData.shortDescription}
                  onChange={(e) =>
                    setNewEventData({ ...newEventData, shortDescription: e.target.value })
                  }
                  placeholder="Single-sentence summary of the event contest"
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Full Event Details</label>
                <textarea
                  rows={3}
                  value={newEventData.fullDescription}
                  onChange={(e) =>
                    setNewEventData({ ...newEventData, fullDescription: e.target.value })
                  }
                  placeholder="Detailed competition briefing and format..."
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                />
              </div>

              {/* Poster Image with File Upload, Preview, Replace, Remove */}
              <div className="space-y-3 p-4 bg-black/40 border border-white/10 rounded-xs">
                <div className="flex items-center justify-between">
                  <label className="text-zinc-300 font-bold uppercase flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5 text-[#8F3025]" />
                    <span>Portrait Poster Image</span>
                  </label>
                  {(newPosterFile || newEventData.posterUrl) && (
                    <button
                      type="button"
                      onClick={() => {
                        setNewPosterFile(null);
                        setNewEventData({ ...newEventData, posterUrl: "" });
                      }}
                      className="text-rose-400 hover:text-rose-300 text-[10px] uppercase font-mono cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove Poster</span>
                    </button>
                  )}
                </div>

                {/* Poster Preview */}
                {(newPosterFile || newEventData.posterUrl) ? (
                  <div className="flex items-center gap-4 p-3 bg-black/60 border border-white/15 rounded-xs">
                    <div className="relative w-20 h-28 bg-black border border-white/20 rounded-xs overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={newPosterFile ? URL.createObjectURL(newPosterFile) : newEventData.posterUrl}
                        alt="Poster Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="text-[11px] text-zinc-300 font-semibold truncate">
                        {newPosterFile ? newPosterFile.name : newEventData.posterUrl.split("/").pop()}
                      </div>
                      <span className="inline-block text-[9px] font-mono uppercase px-1.5 py-0.5 bg-emerald-950/40 text-emerald-300 border border-emerald-500/40">
                        {newPosterFile ? "Local File Ready to Upload" : "Image URL Set"}
                      </span>
                      <div className="pt-1">
                        <label className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono uppercase bg-white/10 hover:bg-white/20 text-white rounded-xs border border-white/20 cursor-pointer">
                          <Upload className="w-3 h-3" />
                          <span>Replace File</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => {
                              if (e.target.files?.[0]) setNewPosterFile(e.target.files[0]);
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-white/20 hover:border-[#8F3025] rounded-xs p-6 text-center space-y-2 transition-colors">
                    <Upload className="w-6 h-6 text-zinc-500 mx-auto" />
                    <div className="text-xs text-zinc-300">
                      Upload festival event poster (JPG, PNG, WebP)
                    </div>
                    <label className="inline-block px-3 py-1.5 bg-white text-black font-bold text-[11px] uppercase tracking-wider hover:bg-zinc-200 transition-colors rounded-xs cursor-pointer">
                      Choose Image File
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => {
                          if (e.target.files?.[0]) setNewPosterFile(e.target.files[0]);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                <div className="pt-1">
                  <span className="text-[10px] text-zinc-500 uppercase block mb-1">
                    Or Enter Poster Image URL:
                  </span>
                  <input
                    type="text"
                    placeholder="https://... or /assets/posters/..."
                    value={newEventData.posterUrl}
                    onChange={(e) => setNewEventData({ ...newEventData, posterUrl: e.target.value })}
                    className="w-full px-3 py-1.5 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none text-xs"
                  />
                </div>
              </div>

              {/* Registration Google Form */}
              <div className="space-y-2 p-3 bg-black/40 border border-white/10 rounded-xs">
                <label className="text-zinc-300 font-bold uppercase">Google Forms Link</label>
                <input
                  type="url"
                  placeholder="https://forms.gle/... or https://docs.google.com/forms/..."
                  value={newEventData.registrationUrl}
                  onChange={(e) =>
                    setNewEventData({ ...newEventData, registrationUrl: e.target.value })
                  }
                  className="w-full px-3 py-1.5 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                />

                <div className="flex items-center gap-4 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400">Status:</span>
                    <select
                      value={newEventData.registrationStatus}
                      onChange={(e) =>
                        setNewEventData({
                          ...newEventData,
                          registrationStatus: e.target.value as Event["registrationStatus"],
                        })
                      }
                      className="bg-black/60 border border-white/15 text-white px-2 py-1 rounded-xs"
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="CLOSED">CLOSED</option>
                      <option value="COMING_SOON">COMING_SOON</option>
                      <option value="NOT_AVAILABLE">NOT_AVAILABLE</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newEventData.registrationEnabled}
                      onChange={(e) =>
                        setNewEventData({ ...newEventData, registrationEnabled: e.target.checked })
                      }
                      className="accent-[#8F3025]"
                    />
                    <span className="text-zinc-300">Registration Active</span>
                  </label>
                </div>
              </div>

              {/* Rules & Prizes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Rules (1 per line)</label>
                  <textarea
                    rows={3}
                    value={newEventData.rulesText}
                    onChange={(e) => setNewEventData({ ...newEventData, rulesText: e.target.value })}
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Prizes (1 per line)</label>
                  <textarea
                    rows={3}
                    value={newEventData.prizesText}
                    onChange={(e) =>
                      setNewEventData({ ...newEventData, prizesText: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newEventData.published}
                    onChange={(e) =>
                      setNewEventData({ ...newEventData, published: e.target.checked })
                    }
                    className="accent-[#8F3025]"
                  />
                  <span className="text-zinc-300">Publish Immediately</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateEventOpen(false)}
                    className="px-4 py-2 border border-white/20 text-zinc-400 hover:text-white rounded-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreateEventPending}
                    className="px-5 py-2 bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors rounded-xs cursor-pointer"
                  >
                    {isCreateEventPending ? "Creating..." : "Create Event"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          MODAL: EDIT EVENT & MANAGE COORDINATORS
          ═══════════════════════════════════════════════ */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121110] border border-white/20 rounded-xs max-w-3xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono text-[#8F3025] uppercase tracking-widest block font-bold">
                  Editing Competition
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {editingEvent.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingEvent(null)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 text-xs font-mono">
              {/* Core Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Title</label>
                  <input
                    type="text"
                    value={editingEvent.title}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, title: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Category</label>
                  <input
                    type="text"
                    value={editingEvent.category}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, category: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Short Synopsis</label>
                <input
                  type="text"
                  value={editingEvent.shortDescription}
                  onChange={(e) =>
                    setEditingEvent({ ...editingEvent, shortDescription: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Full Event Details</label>
                <textarea
                  rows={3}
                  value={editingEvent.fullDescription}
                  onChange={(e) =>
                    setEditingEvent({ ...editingEvent, fullDescription: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
                />
              </div>

              {/* Poster Image with File Upload, Preview, Replace, Remove */}
              <div className="space-y-3 p-4 bg-black/40 border border-white/10 rounded-xs">
                <div className="flex items-center justify-between">
                  <label className="text-zinc-300 font-bold uppercase flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5 text-[#8F3025]" />
                    <span>Portrait Poster Image</span>
                  </label>
                  {(editPosterFile || editingEvent.posterUrl) && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditPosterFile(null);
                        setEditingEvent({ ...editingEvent, posterUrl: null });
                      }}
                      className="text-rose-400 hover:text-rose-300 text-[10px] uppercase font-mono cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove Poster</span>
                    </button>
                  )}
                </div>

                {/* Poster Preview */}
                {(editPosterFile || editingEvent.posterUrl) ? (
                  <div className="flex items-center gap-4 p-3 bg-black/60 border border-white/15 rounded-xs">
                    <div className="relative w-20 h-28 bg-black border border-white/20 rounded-xs overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={editPosterFile ? URL.createObjectURL(editPosterFile) : editingEvent.posterUrl!}
                        alt="Poster Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="text-[11px] text-zinc-300 font-semibold truncate">
                        {editPosterFile ? editPosterFile.name : editingEvent.posterUrl?.split("/").pop()}
                      </div>
                      <span className="inline-block text-[9px] font-mono uppercase px-1.5 py-0.5 bg-emerald-950/40 text-emerald-300 border border-emerald-500/40">
                        {editPosterFile ? "New File Ready to Upload" : "Current Poster Active"}
                      </span>
                      <div className="pt-1">
                        <label className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono uppercase bg-white/10 hover:bg-white/20 text-white rounded-xs border border-white/20 cursor-pointer">
                          <Upload className="w-3 h-3" />
                          <span>Replace File</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => {
                              if (e.target.files?.[0]) setEditPosterFile(e.target.files[0]);
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-white/20 hover:border-[#8F3025] rounded-xs p-6 text-center space-y-2 transition-colors">
                    <Upload className="w-6 h-6 text-zinc-500 mx-auto" />
                    <div className="text-xs text-zinc-300">
                      Upload festival event poster (JPG, PNG, WebP)
                    </div>
                    <label className="inline-block px-3 py-1.5 bg-white text-black font-bold text-[11px] uppercase tracking-wider hover:bg-zinc-200 transition-colors rounded-xs cursor-pointer">
                      Choose Image File
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => {
                          if (e.target.files?.[0]) setEditPosterFile(e.target.files[0]);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                <div className="pt-1">
                  <span className="text-[10px] text-zinc-500 uppercase block mb-1">
                    Or Enter Poster Image URL:
                  </span>
                  <input
                    type="text"
                    value={editingEvent.posterUrl || ""}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, posterUrl: e.target.value })
                    }
                    placeholder="https://... or /assets/posters/..."
                    className="w-full px-3 py-1.5 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none text-xs"
                  />
                </div>
              </div>

              {/* Coordinator Manager */}
              <div className="p-4 bg-black/40 border border-white/10 rounded-xs space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                  <span className="text-xs font-bold text-white uppercase flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-[#8F3025]" />
                    Event Desk Coordinators ({editingEvent.coordinators?.length || 0})
                  </span>
                </div>

                {/* Existing Coordinators */}
                <div className="space-y-2">
                  {(editingEvent.coordinators || []).map((coord) => {
                    const name =
                      coord.person?.name ||
                      coord.teamMember?.name ||
                      coord.contactOverride?.split(":")[0] ||
                      "Coordinator";
                    const phone = coord.person?.phone || coord.teamMember?.socialLinks?.phone || "";

                    return (
                      <div
                        key={coord.id}
                        className="flex items-center justify-between p-2.5 bg-[#121110] border border-white/10 rounded-xs"
                      >
                        <div>
                          <span className="font-bold text-white">{name}</span>
                          <span className="text-zinc-400 text-[10px] ml-2 font-mono">
                            [{coord.role}] {phone ? `• ${phone}` : ""}
                          </span>
                        </div>
                        <button
                          type="button"
                          disabled={!isDevelopment}
                          onClick={() => handleRemoveCoordinator(coord.id)}
                          className="text-rose-400 hover:text-rose-300 text-[10px] uppercase font-mono cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Add Coordinator Form */}
                <div className="pt-2 border-t border-white/[0.06] space-y-2">
                  <span className="text-[11px] font-bold text-zinc-300 uppercase">
                    Add Coordinator
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      placeholder="Name *"
                      value={newCoordData.name}
                      onChange={(e) =>
                        setNewCoordData({ ...newCoordData, name: e.target.value })
                      }
                      className="px-2 py-1.5 bg-black/60 border border-white/15 text-white rounded-xs"
                    />
                    <select
                      value={newCoordData.role}
                      onChange={(e) =>
                        setNewCoordData({
                          ...newCoordData,
                          role: e.target.value as CoordinatorRole,
                        })
                      }
                      className="px-2 py-1.5 bg-black/60 border border-white/15 text-white rounded-xs"
                    >
                      <option value="HEAD">HEAD</option>
                      <option value="CO_HEAD">CO_HEAD</option>
                      <option value="COORDINATOR">COORDINATOR</option>
                    </select>
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={newCoordData.phone}
                      onChange={(e) =>
                        setNewCoordData({ ...newCoordData, phone: e.target.value })
                      }
                      className="px-2 py-1.5 bg-black/60 border border-white/15 text-white rounded-xs"
                    />
                    <button
                      type="button"
                      disabled={!isDevelopment || isCoordPending || !newCoordData.name.trim()}
                      onClick={handleAddCoordinator}
                      className="px-3 py-1.5 bg-white text-black font-bold uppercase rounded-xs hover:bg-zinc-200 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      {isCoordPending ? "Adding..." : "Add"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingEvent.published}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, published: e.target.checked })
                    }
                    className="accent-[#8F3025]"
                  />
                  <span className="text-zinc-300">Published Status</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingEvent(null)}
                    className="px-4 py-2 border border-white/20 text-zinc-400 hover:text-white rounded-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!isDevelopment || eventPendingId === editingEvent.id}
                    onClick={handleUpdateEditingEvent}
                    className="px-5 py-2 bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors rounded-xs cursor-pointer"
                  >
                    {eventPendingId === editingEvent.id ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          MODAL: ADD NEW PHOTO TO GALLERY
          ═══════════════════════════════════════════════ */}
      {isAddPhotoOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121110] border border-white/20 rounded-xs max-w-lg w-full p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-white uppercase tracking-tight">
                Add Photo to Gallery
              </h3>
              <button
                type="button"
                onClick={() => setIsAddPhotoOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {photoError && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs rounded-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{photoError}</span>
              </div>
            )}

            <form onSubmit={handleCreatePhotoSubmit} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Title *</label>
                <input
                  type="text"
                  required
                  value={newPhotoData.title}
                  onChange={(e) => setNewPhotoData({ ...newPhotoData, title: e.target.value })}
                  placeholder="e.g. Inaugural Keynote Address"
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Category</label>
                  <select
                    value={newPhotoData.category}
                    onChange={(e) =>
                      setNewPhotoData({
                        ...newPhotoData,
                        category: e.target.value as GalleryCategory,
                      })
                    }
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
                  >
                    {GALLERY_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Aspect Ratio</label>
                  <select
                    value={newPhotoData.aspectRatio}
                    onChange={(e) =>
                      setNewPhotoData({
                        ...newPhotoData,
                        aspectRatio: e.target.value as "landscape" | "portrait" | "square",
                      })
                    }
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
                  >
                    <option value="landscape">Landscape (16:9)</option>
                    <option value="portrait">Portrait (3:4)</option>
                    <option value="square">Square (1:1)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Caption / Brief Story</label>
                <input
                  type="text"
                  value={newPhotoData.caption}
                  onChange={(e) => setNewPhotoData({ ...newPhotoData, caption: e.target.value })}
                  placeholder="Atmospheric moment capture..."
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
                />
              </div>

              {/* Photo Source */}
              <div className="space-y-2 p-3 bg-black/40 border border-white/10 rounded-xs">
                <label className="text-zinc-300 font-bold uppercase">Image Source</label>
                <input
                  type="text"
                  placeholder="Image URL (https://... or /assets/gallery/...)"
                  value={newPhotoData.mediaUrl}
                  onChange={(e) => setNewPhotoData({ ...newPhotoData, mediaUrl: e.target.value })}
                  className="w-full px-3 py-1.5 bg-black/60 border border-white/15 text-white rounded-xs"
                />
                {isDevelopment && (
                  <div className="pt-1">
                    <span className="text-[10px] text-zinc-500 uppercase block mb-1">
                      Or Upload Local Image (Dev Only):
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => setNewPhotoFile(e.target.files?.[0] || null)}
                      className="w-full text-[11px] text-zinc-400 file:mr-2 file:py-1 file:px-2 file:border file:border-white/20 file:bg-white/5 file:text-white"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Photographer</label>
                  <input
                    type="text"
                    value={newPhotoData.photographer}
                    onChange={(e) =>
                      setNewPhotoData({ ...newPhotoData, photographer: e.target.value })
                    }
                    placeholder="Staff Attribution"
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Year</label>
                  <input
                    type="number"
                    value={newPhotoData.year}
                    onChange={(e) =>
                      setNewPhotoData({ ...newPhotoData, year: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPhotoData.isPublished}
                    onChange={(e) =>
                      setNewPhotoData({ ...newPhotoData, isPublished: e.target.checked })
                    }
                    className="accent-[#8F3025]"
                  />
                  <span className="text-zinc-300">Published</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddPhotoOpen(false)}
                    className="px-4 py-2 border border-white/20 text-zinc-400 hover:text-white rounded-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPhotoPending}
                    className="px-5 py-2 bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors rounded-xs cursor-pointer"
                  >
                    {isPhotoPending ? "Adding..." : "Add Photo"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
