export type EditionStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";
export type RegistrationStatus = "COMING_SOON" | "OPEN" | "CLOSED" | "NOT_AVAILABLE";
export type PriorityLevel = "NORMAL" | "PINNED" | "URGENT";
export type SponsorTier = "TITLE" | "POWERED_BY" | "ASSOCIATE" | "MEDIA_PARTNER";
export type TeamType = "LEADERSHIP" | "COORDINATOR" | "ORGANIZER" | "CUSTOM";
export type CoordinatorRole = "HEAD" | "CO_HEAD" | "COORDINATOR";

export type ThemePresetName = "dark-festival" | "light-festival" | "warm-parchment" | "cool-obsidian" | "custom";

export interface ThemeTokens {
  background: string;
  surface: string;
  surfaceSecondary: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderSubtle?: string;
  accent: string;
  accentHover?: string;
  cta: string;
  ctaText: string;
  ctaHover?: string;
  overlayBg: string;
  overlayOpacity: number;
  glassBg: string;
  glassBorder: string;
}

export interface FestivalThemeSettings {
  wallpaperUrl?: string | null;
  wallpaperOverlayOpacity?: number | null;
  logoUrl?: string | null;
  fontSans?: "geist" | "inter" | "jakarta" | string;
  fontDisplay?: "graduate" | "cinzel" | "playfair" | string;
  themePreset?: ThemePresetName;
  themeTokens?: Partial<ThemeTokens>;
  [key: string]: unknown;
}

export interface Edition {
  id: string;
  code: string;
  name: string;
  year: number;
  status: EditionStatus;
  startDate: string | null;
  endDate: string | null;
  countdownTarget?: string | null;
  isDateConfirmed: boolean;
  themeSettings: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
}

export type FacultyRole = "PRINCIPAL" | "HOD" | "FACULTY";

export interface FacultyMember {
  id: string;
  editionId?: string;
  name: string;
  designation: string;
  photoUrl?: string | null;
  role: FacultyRole;
  displayOrder: number;
  isPublished: boolean;
  email?: string | null;
  department?: string | null;
  institution?: string | null;
  bio?: string | null;
}

export interface FacultyData {
  principal: FacultyMember | null;
  hod: FacultyMember | null;
  facultyMembers: FacultyMember[];
}

export interface Venue {
  id: string;
  name: string;
  building: string;
  floor?: string | null;
  roomNumber?: string | null;
  capacity?: number | null;
  mapUrl?: string | null;
  directions?: string | null;
}

export interface Person {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  socialLinks?: Record<string, string> | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface FestivalTeam {
  id: string;
  editionId: string;
  name: string;
  teamType: TeamType;
  displayOrder: number;
  isPublished: boolean;
  members?: TeamMember[];
}

export interface TeamMember {
  id: string;
  editionId: string;
  personId: string;
  teamId: string;
  designation: string;
  displayOrder: number;
  isPublished?: boolean;
  person?: Person;
  team?: FestivalTeam;

  // Backward-compatible properties for existing consumers
  name: string;
  teamGroup: string;
  photoUrl?: string | null;
  bio?: string | null;
  socialLinks?: Record<string, string> | null;
  order: number;
}

export interface EventCoordinator {
  id: string;
  eventId: string;
  personId: string;
  role: CoordinatorRole;
  contactOverride?: string | null;
  displayOrder?: number;
  person?: Person;

  // Backward-compatibility properties
  teamMemberId?: string;
  teamMember?: TeamMember;
}

// Type alias for backward compatibility
export type EventHead = EventCoordinator;

export interface Event {
  id: string;
  editionId: string;
  slug: string;
  title: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  rules: string[];
  prizes: string[];
  eligibility?: string | null;
  participationType: "INDIVIDUAL" | "TEAM";
  teamSizeLimit?: number | null;
  registrationStatus: RegistrationStatus;
  registrationUrl?: string | null;
  registrationEnabled?: boolean;
  venueId?: string | null;
  displayOrder?: number;
  posterUrl?: string | null;
  published: boolean;
  venue?: Venue | null;
  coordinators?: EventCoordinator[];
  heads?: EventCoordinator[]; // Backward compatibility
}

export interface ScheduleEntry {
  id: string;
  editionId: string;
  eventId?: string | null;
  venueId?: string | null;
  title?: string | null;
  description?: string | null;
  calendarDate?: string | null;
  dayNumber: number;
  startTime: string;
  endTime: string;
  status: "UPCOMING" | "LIVE" | "COMPLETED";
  displayOrder?: number;
  isPublished?: boolean;
  event?: Event | null;
  venue?: Venue | null;
}

export interface Announcement {
  id: string;
  editionId: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  priority: PriorityLevel;
  publishedAt: string;
  expiresAt?: string | null;
  eventId?: string | null;
  isPublished?: boolean;
  displayOrder?: number;
}

export interface Sponsor {
  id: string;
  editionId: string;
  name: string;
  tier: SponsorTier;
  logoUrl: string;
  websiteUrl?: string | null;
  order: number;
  isPublished?: boolean;
}

export type GalleryCategory = "Organizing Team" | "Behind the Scenes";

export interface GalleryItem {
  id: string;
  editionId?: string;
  title: string;
  category: GalleryCategory;
  caption: string;
  mediaUrl: string;
  imageUrl: string; // Backward compatibility with components expecting imageUrl
  altText?: string | null;
  aspectRatio?: "landscape" | "portrait" | "square";
  photographer?: string | null;
  year?: number | null;
  displayOrder?: number;
  isPublished?: boolean;
}

export interface FestivalLink {
  id: string;
  editionId: string;
  platform: string;
  url: string;
  label: string;
  category?: string;
  displayOrder: number;
  isPublished: boolean;
}

export interface ContactPerson {
  id: string;
  name: string;
  role: string;
  department?: string;
  email?: string;
  phone?: string;
  displayOrder?: number;
  isPrimary?: boolean;
  isEnabled?: boolean;
}

export interface TransitGuideItem {
  id: string;
  title: string;
  description: string;
}

export interface ContactPageSettings {
  title?: string;
  subtitle?: string;
  description?: string;
  departmentName?: string;
  collegeName?: string;
  address?: string;
  officialEmail?: string;
  epabxPhone?: string;
  deskHours?: string;
  transitGuide?: TransitGuideItem[];
  contacts?: ContactPerson[];
}