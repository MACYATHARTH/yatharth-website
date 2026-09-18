"use client";

import { useState, useTransition } from "react";
import {
  Mail,
  Phone,
  Building,
  MapPin,
  Plus,
  Trash2,
  Edit3,
  X,
  CheckCircle2,
  AlertCircle,
  Users,
  Navigation,
  Sparkles,
  Eye,
  EyeOff,
  ExternalLink,
  Share2,
  Globe,
} from "lucide-react";
import {
  updateContactSettingsAction,
  createFestivalLinkAction,
  updateFestivalLinkAction,
  deleteFestivalLinkAction,
} from "@/app/admin/actions";
import {
  ContactPageSettings,
  ContactPerson,
  TransitGuideItem,
  FestivalLink,
} from "@/lib/data/types";

interface AdminContactTabProps {
  initialSettings?: ContactPageSettings;
  initialLinks?: FestivalLink[];
  onLinksChange?: (updated: FestivalLink[]) => void;
  isDevelopment: boolean;
}

function PlatformIcon({ platform, className }: { platform: string; className?: string }) {
  const p = platform.toLowerCase();

  if (p.includes("instagram")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    );
  }

  if (p.includes("youtube")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
        <path d="m10 15 5-3-5-3z" />
      </svg>
    );
  }

  if (p.includes("linkedin")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    );
  }

  if (p.includes("twitter") || p.includes("x")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }

  return <Globe className={className} />;
}

const DEFAULT_SETTINGS: ContactPageSettings = {
  title: "Contact & Campus Venue",
  subtitle: "Festival Secretariat & Official Inquiries",
  description:
    "Direct communications channel for collegiate delegations, participating institutions, faculty advisors, and media queries.",
  departmentName: "Department of Journalism",
  collegeName: "Maharaja Agrasen College, University of Delhi",
  address: "Vasundhara Enclave, Delhi 110096, India",
  officialEmail: "yatharth@mac.du.ac.in",
  epabxPhone: "+91 11 2261 0565",
  deskHours: "Monday – Saturday: 09:00 – 18:00 IST",
  transitGuide: [
    {
      id: "metro",
      title: "Delhi Metro (Recommended)",
      description:
        "Noida Sector 15 (Blue Line) or New Ashok Nagar (Blue Line) are the closest stations. Auto-rickshaws operate directly to Maharaja Agrasen College campus (approx. 5-7 minutes).",
    },
    {
      id: "pink-line",
      title: "Delhi Metro (Pink Line)",
      description:
        "Mayur Vihar Pocket-1 or Trilokpuri Sanjay Lake stations connect directly to campus via local feeder auto transit.",
    },
    {
      id: "railway",
      title: "Inter-State Rail & Bus Transit",
      description:
        "Anand Vihar ISBT & Railway Terminal is 7 km away. Hazrat Nizamuddin is 11 km away. Both are readily connected by taxi and direct transport.",
    },
  ],
  contacts: [
    {
      id: "c-pr-1",
      name: "Priyanshi Patel",
      role: "Public Relations Head",
      department: "PR & Media Liaison",
      email: "pr.yatharth@mac.du.ac.in",
      phone: "+91 98112 04821",
      displayOrder: 1,
      isPrimary: true,
      isEnabled: true,
    },
    {
      id: "c-pr-2",
      name: "Arjun Mehta",
      role: "Alternate PR Head",
      department: "Institutional Outreach & PR",
      email: "outreach.yatharth@mac.du.ac.in",
      phone: "+91 98731 55420",
      displayOrder: 2,
      isPrimary: false,
      isEnabled: true,
    },
    {
      id: "c-convener",
      name: "Dr. Sanjeev Kumar",
      role: "Faculty Convener",
      department: "Department of Journalism",
      email: "skumar@mac.du.ac.in",
      phone: "+91 11 2261 0565",
      displayOrder: 3,
      isPrimary: false,
      isEnabled: true,
    },
  ],
};

export function AdminContactTab({
  initialSettings,
  initialLinks = [],
  onLinksChange,
  isDevelopment,
}: AdminContactTabProps) {
  const [settings, setSettings] = useState<ContactPageSettings>({
    ...DEFAULT_SETTINGS,
    ...(initialSettings || {}),
    contacts: initialSettings?.contacts?.length ? initialSettings.contacts : DEFAULT_SETTINGS.contacts,
    transitGuide: initialSettings?.transitGuide?.length ? initialSettings.transitGuide : DEFAULT_SETTINGS.transitGuide,
  });

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Social Links State (uses existing FestivalLink system)
  const [linksList, setLinksList] = useState<FestivalLink[]>(initialLinks);
  const [socialMessage, setSocialMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSocialPending, startSocialTransition] = useTransition();
  const [editingSocialLink, setEditingSocialLink] = useState<FestivalLink | null>(null);
  const [isNewSocialLink, setIsNewSocialLink] = useState(false);

  // Contact editing state
  const [editingContact, setEditingContact] = useState<ContactPerson | null>(null);
  const [isNewContact, setIsNewContact] = useState(false);

  // Transit editing state
  const [editingTransit, setEditingTransit] = useState<TransitGuideItem | null>(null);
  const [isNewTransit, setIsNewTransit] = useState(false);

  // Save full settings with validation
  const handleSaveSettings = () => {
    setMessage(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (settings.officialEmail && settings.officialEmail.trim() && !emailRegex.test(settings.officialEmail.trim())) {
      setMessage({ type: "error", text: "Please enter a valid official email address format." });
      return;
    }

    if (!settings.title?.trim()) {
      setMessage({ type: "error", text: "Page Title is required." });
      return;
    }

    startTransition(async () => {
      const res = await updateContactSettingsAction(settings);
      if (res.success) {
        setMessage({ type: "success", text: "Contact page configuration saved successfully." });
      } else {
        setMessage({ type: "error", text: res.error || "Failed to save contact settings." });
      }
    });
  };

  // Toggle Contact Enabled Status
  const handleToggleContactEnabled = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      contacts: (prev.contacts || []).map((c) =>
        c.id === id ? { ...c, isEnabled: c.isEnabled === false ? true : false } : c
      ),
    }));
  };

  // Add / Edit Contact handlers with validation
  const handleSaveContactModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact) return;

    if (!editingContact.name.trim() || !editingContact.role.trim()) {
      alert("Name and Role are required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (editingContact.email && editingContact.email.trim() && !emailRegex.test(editingContact.email.trim())) {
      alert("Please enter a valid email address.");
      return;
    }

    const cleanedContact: ContactPerson = {
      ...editingContact,
      name: editingContact.name.trim(),
      role: editingContact.role.trim(),
      department: editingContact.department?.trim() || undefined,
      phone: editingContact.phone?.trim() || undefined,
      email: editingContact.email?.trim() || undefined,
      isEnabled: editingContact.isEnabled !== false,
    };

    if (isNewContact) {
      setSettings((prev) => ({
        ...prev,
        contacts: [...(prev.contacts || []), cleanedContact],
      }));
    } else {
      setSettings((prev) => ({
        ...prev,
        contacts: (prev.contacts || []).map((c) =>
          c.id === cleanedContact.id ? cleanedContact : c
        ),
      }));
    }

    setEditingContact(null);
    setIsNewContact(false);
  };

  const handleDeleteContact = (id: string) => {
    if (!confirm("Remove this contact person?")) return;
    setSettings((prev) => ({
      ...prev,
      contacts: (prev.contacts || []).filter((c) => c.id !== id),
    }));
  };

  // Social Links Handlers (reuses existing FestivalLink system)
  const handleToggleSocialPublished = async (link: FestivalLink) => {
    setSocialMessage(null);
    startSocialTransition(async () => {
      const res = await updateFestivalLinkAction(link.id, {
        isPublished: !link.isPublished,
      });

      if (res.success && res.link) {
        const updated = linksList.map((l) => (l.id === link.id ? res.link! : l));
        setLinksList(updated);
        if (onLinksChange) onLinksChange(updated);
        setSocialMessage({
          type: "success",
          text: `"${link.label}" visibility set to ${!link.isPublished ? "Visible" : "Hidden"}.`,
        });
      } else {
        setSocialMessage({ type: "error", text: res.error || "Failed to update social link status." });
      }
    });
  };

  const handleSaveSocialModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSocialLink) return;

    if (!editingSocialLink.url.trim() || !editingSocialLink.label.trim()) {
      alert("Platform URL and Label are required.");
      return;
    }

    setSocialMessage(null);
    startSocialTransition(async () => {
      if (isNewSocialLink) {
        const res = await createFestivalLinkAction({
          platform: editingSocialLink.platform,
          url: editingSocialLink.url.trim(),
          label: editingSocialLink.label.trim(),
          category: editingSocialLink.category || "SOCIAL",
          displayOrder: editingSocialLink.displayOrder || linksList.length + 1,
        });

        if (res.success && res.link) {
          const updated = [...linksList, res.link].sort((a, b) => a.displayOrder - b.displayOrder);
          setLinksList(updated);
          if (onLinksChange) onLinksChange(updated);
          setEditingSocialLink(null);
          setIsNewSocialLink(false);
          setSocialMessage({ type: "success", text: "Social channel added successfully." });
        } else {
          setSocialMessage({ type: "error", text: res.error || "Failed to create social link." });
        }
      } else {
        const res = await updateFestivalLinkAction(editingSocialLink.id, {
          platform: editingSocialLink.platform,
          url: editingSocialLink.url.trim(),
          label: editingSocialLink.label.trim(),
          category: editingSocialLink.category,
          displayOrder: editingSocialLink.displayOrder,
          isPublished: editingSocialLink.isPublished,
        });

        if (res.success && res.link) {
          const updated = linksList
            .map((l) => (l.id === editingSocialLink.id ? res.link! : l))
            .sort((a, b) => a.displayOrder - b.displayOrder);
          setLinksList(updated);
          if (onLinksChange) onLinksChange(updated);
          setEditingSocialLink(null);
          setSocialMessage({ type: "success", text: "Social channel updated successfully." });
        } else {
          setSocialMessage({ type: "error", text: res.error || "Failed to update social link." });
        }
      }
    });
  };

  const handleDeleteSocial = async (id: string, label: string) => {
    if (!confirm(`Delete channel "${label}"?`)) return;

    setSocialMessage(null);
    startSocialTransition(async () => {
      const res = await deleteFestivalLinkAction(id);
      if (res.success) {
        const updated = linksList.filter((l) => l.id !== id);
        setLinksList(updated);
        if (onLinksChange) onLinksChange(updated);
        setSocialMessage({ type: "success", text: `Channel "${label}" removed successfully.` });
      } else {
        setSocialMessage({ type: "error", text: res.error || "Failed to delete channel." });
      }
    });
  };

  // Transit handlers
  const handleSaveTransitModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransit) return;

    if (!editingTransit.title.trim()) {
      alert("Title is required.");
      return;
    }

    if (isNewTransit) {
      setSettings((prev) => ({
        ...prev,
        transitGuide: [...(prev.transitGuide || []), editingTransit],
      }));
    } else {
      setSettings((prev) => ({
        ...prev,
        transitGuide: (prev.transitGuide || []).map((t) =>
          t.id === editingTransit.id ? editingTransit : t
        ),
      }));
    }

    setEditingTransit(null);
    setIsNewTransit(false);
  };

  const handleDeleteTransit = (id: string) => {
    if (!confirm("Remove this transit guide entry?")) return;
    setSettings((prev) => ({
      ...prev,
      transitGuide: (prev.transitGuide || []).filter((t) => t.id !== id),
    }));
  };

  return (
    <div className="space-y-10">
      {/* Header & Save Bar */}
      <div className="border-b border-white/[0.08] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
            <MapPin className="w-5 h-5 text-[#8F3025]" />
            Contact Page CMS &amp; Secretariat Info
          </h2>
          <p className="text-xs text-[#77716A] mt-1">
            Configure official secretariat details, operating hours, transit directions, and PR team contacts.
          </p>
        </div>

        <button
          type="button"
          disabled={isPending || !isDevelopment}
          onClick={handleSaveSettings}
          className="px-5 py-2.5 bg-[#8F3025] hover:bg-[#5C211C] text-white font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{isPending ? "Saving..." : "Save Contact Page"}</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-4 border rounded-xs text-xs flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
              : "bg-rose-950/40 border-rose-500/40 text-rose-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* 1. Page Header Content */}
      <div className="p-6 bg-[#121110] border border-white/[0.08] rounded-xs space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#8F3025]" />
          Page Header &amp; Subtitle
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="space-y-1.5">
            <label className="text-zinc-400 uppercase">Page Title</label>
            <input
              type="text"
              value={settings.title || ""}
              onChange={(e) => setSettings({ ...settings, title: e.target.value })}
              className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-zinc-400 uppercase">Page Subtitle / Tag</label>
            <input
              type="text"
              value={settings.subtitle || ""}
              onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
              className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
            />
          </div>
        </div>

        <div className="space-y-1.5 text-xs font-mono">
          <label className="text-zinc-400 uppercase">Header Description</label>
          <textarea
            rows={2}
            value={settings.description || ""}
            onChange={(e) => setSettings({ ...settings, description: e.target.value })}
            className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
          />
        </div>
      </div>

      {/* 2. Campus Secretariat Details */}
      <div className="p-6 bg-[#121110] border border-white/[0.08] rounded-xs space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold flex items-center gap-2">
          <Building className="w-3.5 h-3.5 text-[#8F3025]" />
          Department &amp; Campus Secretariat
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="space-y-1.5">
            <label className="text-zinc-400 uppercase">Department Name</label>
            <input
              type="text"
              value={settings.departmentName || ""}
              onChange={(e) => setSettings({ ...settings, departmentName: e.target.value })}
              className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-zinc-400 uppercase">College Name</label>
            <input
              type="text"
              value={settings.collegeName || ""}
              onChange={(e) => setSettings({ ...settings, collegeName: e.target.value })}
              className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-zinc-400 uppercase">Official Secretariat Email</label>
            <input
              type="email"
              value={settings.officialEmail || ""}
              onChange={(e) => setSettings({ ...settings, officialEmail: e.target.value })}
              className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-zinc-400 uppercase">College EPABX Phone</label>
            <input
              type="text"
              value={settings.epabxPhone || ""}
              onChange={(e) => setSettings({ ...settings, epabxPhone: e.target.value })}
              className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-zinc-400 uppercase">Campus Physical Address</label>
            <input
              type="text"
              value={settings.address || ""}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-zinc-400 uppercase">Desk Operating Hours</label>
            <input
              type="text"
              value={settings.deskHours || ""}
              onChange={(e) => setSettings({ ...settings, deskHours: e.target.value })}
              className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
            />
          </div>
        </div>
      </div>

      {/* 3. Dynamic Festival Contacts (PR Team, Convener, Support) */}
      <div className="p-6 bg-[#121110] border border-white/[0.08] rounded-xs space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-[#8F3025]" />
              Festival Contacts &amp; PR Desk ({settings.contacts?.length || 0})
            </h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Primary PR Contact, Alternate PR Contact, Convener, and inquiry leads shown on public contact page.
            </p>
          </div>

          <button
            type="button"
            disabled={!isDevelopment}
            onClick={() => {
              setEditingContact({
                id: `c-${Date.now()}`,
                name: "",
                role: "Public Relations Head",
                department: "PR & Media Liaison",
                email: "",
                phone: "",
                displayOrder: (settings.contacts?.length || 0) + 1,
                isPrimary: false,
              });
              setIsNewContact(true);
            }}
            className="px-3 py-1.5 bg-white text-black font-bold text-[11px] uppercase tracking-wider hover:bg-zinc-200 transition-colors flex items-center gap-1 rounded-xs cursor-pointer shrink-0"
          >
            <Plus className="w-3 h-3" />
            <span>Add Contact</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(settings.contacts || []).map((c) => {
            const isVisible = c.isEnabled !== false;
            return (
              <div
                key={c.id}
                className={`p-4 bg-black/50 border rounded-xs space-y-3 flex flex-col justify-between transition-all ${
                  isVisible ? "border-white/10 hover:border-white/20" : "border-amber-500/20 opacity-70"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-[#8F3025]/15 border border-[#8F3025]/40 text-[#8F3025] font-bold">
                        {c.isPrimary ? "PRIMARY CONTACT" : "DESK LEAD"}
                      </span>
                      <span
                        className={`text-[9px] font-mono uppercase px-1.5 py-0.5 font-bold ${
                          isVisible
                            ? "bg-emerald-950/30 border border-emerald-500/30 text-emerald-400"
                            : "bg-amber-950/30 border border-amber-500/30 text-amber-400"
                        }`}
                      >
                        {isVisible ? "Visible" : "Hidden"}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">#{c.displayOrder}</span>
                  </div>
                  <h4 className="font-bold text-sm text-white">{c.name}</h4>
                  <div className="text-[11px] text-zinc-300 font-mono">{c.role}</div>
                  {c.department && (
                    <div className="text-[10px] text-zinc-500 font-mono">{c.department}</div>
                  )}

                  <div className="pt-2 border-t border-white/[0.06] space-y-1 text-xs font-mono">
                    {c.phone && (
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <Phone className="w-3 h-3 text-[#8F3025]" />
                        <span>{c.phone}</span>
                      </div>
                    )}
                    {c.email && (
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <Mail className="w-3 h-3 text-[#8F3025]" />
                        <span className="truncate">{c.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                  <span className="text-[10px] font-mono text-zinc-500">
                    {isVisible ? "Shown Publicly" : "Hidden from Public"}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={!isDevelopment}
                      onClick={() => handleToggleContactEnabled(c.id)}
                      className="p-1 text-zinc-400 hover:text-white cursor-pointer"
                      title={isVisible ? "Click to Hide on Public Page" : "Click to Show on Public Page"}
                    >
                      {isVisible ? (
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={!isDevelopment}
                      onClick={() => {
                        setEditingContact({ ...c, isEnabled: c.isEnabled !== false });
                        setIsNewContact(false);
                      }}
                      className="p-1 text-zinc-400 hover:text-white cursor-pointer"
                      title="Edit Contact"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={!isDevelopment}
                      onClick={() => handleDeleteContact(c.id)}
                      className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer"
                      title="Remove Contact"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Transit Guide Management */}
      <div className="p-6 bg-[#121110] border border-white/[0.08] rounded-xs space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold flex items-center gap-2">
              <Navigation className="w-3.5 h-3.5 text-[#8F3025]" />
              Campus Transit Directions Guide ({settings.transitGuide?.length || 0})
            </h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Clear transit information for collegiate delegations arriving by Metro, Train, or Inter-State road.
            </p>
          </div>

          <button
            type="button"
            disabled={!isDevelopment}
            onClick={() => {
              setEditingTransit({
                id: `transit-${Date.now()}`,
                title: "",
                description: "",
              });
              setIsNewTransit(true);
            }}
            className="px-3 py-1.5 bg-white text-black font-bold text-[11px] uppercase tracking-wider hover:bg-zinc-200 transition-colors flex items-center gap-1 rounded-xs cursor-pointer shrink-0"
          >
            <Plus className="w-3 h-3" />
            <span>Add Direction Item</span>
          </button>
        </div>

        <div className="space-y-3">
          {(settings.transitGuide || []).map((item) => (
            <div
              key={item.id}
              className="p-4 bg-black/50 border border-white/10 hover:border-white/20 rounded-xs flex items-start justify-between gap-4"
            >
              <div className="space-y-1">
                <h4 className="font-bold text-xs font-mono text-white">{item.title}</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">{item.description}</p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={!isDevelopment}
                  onClick={() => {
                    setEditingTransit({ ...item });
                    setIsNewTransit(false);
                  }}
                  className="p-1 text-zinc-400 hover:text-white cursor-pointer"
                  title="Edit Direction"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={!isDevelopment}
                  onClick={() => handleDeleteTransit(item.id)}
                  className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer"
                  title="Remove Direction"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Official Social Media Channels (Reuses Master FestivalLink System) */}
      <div className="p-6 bg-[#121110] border border-white/[0.08] rounded-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold flex items-center gap-2">
              <Share2 className="w-3.5 h-3.5 text-[#8F3025]" />
              Official Social Media &amp; Public Channels ({linksList.length})
            </h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Public social handles and verified channels displayed on the Contact page and footer. Operates directly on the master festival links system.
            </p>
          </div>

          <button
            type="button"
            disabled={!isDevelopment || isSocialPending}
            onClick={() => {
              setEditingSocialLink({
                id: "",
                editionId: "",
                platform: "INSTAGRAM",
                url: "",
                label: "",
                category: "SOCIAL",
                displayOrder: linksList.length + 1,
                isPublished: true,
              });
              setIsNewSocialLink(true);
            }}
            className="px-3 py-1.5 bg-white text-black font-bold text-[11px] uppercase tracking-wider hover:bg-zinc-200 transition-colors flex items-center gap-1 rounded-xs cursor-pointer shrink-0"
          >
            <Plus className="w-3 h-3" />
            <span>Add Channel</span>
          </button>
        </div>

        {socialMessage && (
          <div
            className={`p-3 border rounded-xs text-xs flex items-center gap-2 ${
              socialMessage.type === "success"
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                : "bg-rose-950/40 border-rose-500/40 text-rose-300"
            }`}
          >
            {socialMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{socialMessage.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {linksList.map((link) => (
            <div
              key={link.id}
              className="p-4 bg-black/50 border border-white/10 hover:border-white/20 rounded-xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PlatformIcon platform={link.platform} className="w-4 h-4 text-[#8F3025]" />
                    <span className="text-xs font-bold text-white font-mono uppercase">
                      {link.platform}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-mono uppercase px-1.5 py-0.5 font-bold ${
                      link.isPublished
                        ? "bg-emerald-950/30 border border-emerald-500/30 text-emerald-400"
                        : "bg-zinc-900 border border-zinc-700 text-zinc-500"
                    }`}
                  >
                    {link.isPublished ? "Active" : "Disabled"}
                  </span>
                </div>

                <div className="space-y-0.5 text-xs font-mono">
                  <div className="text-zinc-300 font-semibold truncate">{link.label}</div>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-zinc-500 hover:text-white truncate flex items-center gap-1"
                  >
                    <span className="truncate">{link.url}</span>
                    <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                  </a>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs font-mono">
                <span className="text-[10px] font-mono text-zinc-500">Order #{link.displayOrder}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={!isDevelopment || isSocialPending}
                    onClick={() => handleToggleSocialPublished(link)}
                    className="p-1 text-zinc-400 hover:text-white cursor-pointer"
                    title={link.isPublished ? "Click to Hide Channel" : "Click to Show Channel"}
                  >
                    {link.isPublished ? (
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-zinc-500" />
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={!isDevelopment}
                    onClick={() => {
                      setEditingSocialLink({ ...link });
                      setIsNewSocialLink(false);
                    }}
                    className="p-1 text-zinc-400 hover:text-white cursor-pointer"
                    title="Edit Channel"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={!isDevelopment || isSocialPending}
                    onClick={() => handleDeleteSocial(link.id, link.label)}
                    className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer"
                    title="Remove Channel"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          MODAL: ADD / EDIT CONTACT
          ═══════════════════════════════════════════════ */}
      {editingContact && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121110] border border-white/20 rounded-xs max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                {isNewContact ? "Add Festival Contact" : "Edit Festival Contact"}
              </h3>
              <button
                type="button"
                onClick={() => setEditingContact(null)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveContactModal} className="space-y-3 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Contact Name *</label>
                <input
                  type="text"
                  value={editingContact.name}
                  onChange={(e) => setEditingContact({ ...editingContact, name: e.target.value })}
                  placeholder="e.g. Priyanshi Patel"
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Role / Title *</label>
                <input
                  type="text"
                  value={editingContact.role}
                  onChange={(e) => setEditingContact({ ...editingContact, role: e.target.value })}
                  placeholder="e.g. Public Relations Head"
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Department / Desk</label>
                <input
                  type="text"
                  value={editingContact.department || ""}
                  onChange={(e) => setEditingContact({ ...editingContact, department: e.target.value })}
                  placeholder="e.g. PR & Media Liaison"
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Phone Number</label>
                  <input
                    type="tel"
                    value={editingContact.phone || ""}
                    onChange={(e) => setEditingContact({ ...editingContact, phone: e.target.value })}
                    placeholder="+91 98112 04821"
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Email Address</label>
                  <input
                    type="email"
                    value={editingContact.email || ""}
                    onChange={(e) => setEditingContact({ ...editingContact, email: e.target.value })}
                    placeholder="pr.yatharth@mac.du.ac.in"
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Display Order</label>
                  <input
                    type="number"
                    value={editingContact.displayOrder || 1}
                    onChange={(e) =>
                      setEditingContact({ ...editingContact, displayOrder: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
                  />
                </div>

                <div className="flex flex-col gap-2 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingContact.isPrimary || false}
                      onChange={(e) =>
                        setEditingContact({ ...editingContact, isPrimary: e.target.checked })
                      }
                      className="accent-[#8F3025]"
                    />
                    <span className="text-zinc-300">Set as Primary PR Contact</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingContact.isEnabled !== false}
                      onChange={(e) =>
                        setEditingContact({ ...editingContact, isEnabled: e.target.checked })
                      }
                      className="accent-[#8F3025]"
                    />
                    <span className="text-zinc-300">Enable Public Visibility (Show on Contact Page)</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingContact(null)}
                  className="px-3 py-1.5 border border-white/20 text-zinc-400 hover:text-white rounded-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#8F3025] hover:bg-[#5C211C] text-white font-bold rounded-xs cursor-pointer"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          MODAL: ADD / EDIT TRANSIT ITEM
          ═══════════════════════════════════════════════ */}
      {editingTransit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121110] border border-white/20 rounded-xs max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                {isNewTransit ? "Add Transit Direction" : "Edit Transit Direction"}
              </h3>
              <button
                type="button"
                onClick={() => setEditingTransit(null)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTransitModal} className="space-y-3 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Transit Heading *</label>
                <input
                  type="text"
                  value={editingTransit.title}
                  onChange={(e) => setEditingTransit({ ...editingTransit, title: e.target.value })}
                  placeholder="e.g. Delhi Metro (Blue Line)"
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Directions &amp; Details *</label>
                <textarea
                  rows={3}
                  value={editingTransit.description}
                  onChange={(e) =>
                    setEditingTransit({ ...editingTransit, description: e.target.value })
                  }
                  placeholder="Detailed directions to campus..."
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingTransit(null)}
                  className="px-3 py-1.5 border border-white/20 text-zinc-400 hover:text-white rounded-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#8F3025] hover:bg-[#5C211C] text-white font-bold rounded-xs cursor-pointer"
                >
                  Save Direction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          MODAL: ADD / EDIT SOCIAL LINK
          ═══════════════════════════════════════════════ */}
      {editingSocialLink && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121110] border border-white/20 rounded-xs max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                {isNewSocialLink ? "Add Social Channel" : "Edit Social Channel"}
              </h3>
              <button
                type="button"
                onClick={() => setEditingSocialLink(null)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSocialModal} className="space-y-3 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Platform *</label>
                <input
                  type="text"
                  required
                  value={editingSocialLink.platform}
                  onChange={(e) =>
                    setEditingSocialLink({ ...editingSocialLink, platform: e.target.value })
                  }
                  placeholder="e.g. Instagram, YouTube, LinkedIn, X, Website"
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Handle / Label *</label>
                <input
                  type="text"
                  required
                  value={editingSocialLink.label}
                  onChange={(e) =>
                    setEditingSocialLink({ ...editingSocialLink, label: e.target.value })
                  }
                  placeholder="e.g. @yatharth.mac or Official Instagram"
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">URL Link *</label>
                <input
                  type="url"
                  required
                  value={editingSocialLink.url}
                  onChange={(e) =>
                    setEditingSocialLink({ ...editingSocialLink, url: e.target.value })
                  }
                  placeholder="https://instagram.com/yatharth.mac"
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Display Order</label>
                  <input
                    type="number"
                    value={editingSocialLink.displayOrder || 1}
                    onChange={(e) =>
                      setEditingSocialLink({
                        ...editingSocialLink,
                        displayOrder: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                  />
                </div>

                <div className="flex items-center pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingSocialLink.isPublished}
                      onChange={(e) =>
                        setEditingSocialLink({
                          ...editingSocialLink,
                          isPublished: e.target.checked,
                        })
                      }
                      className="accent-[#8F3025]"
                    />
                    <span className="text-zinc-300">Enable Channel (Visible on Contact Page)</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingSocialLink(null)}
                  className="px-3 py-1.5 border border-white/20 text-zinc-400 hover:text-white rounded-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSocialPending}
                  className="px-4 py-1.5 bg-[#8F3025] hover:bg-[#5C211C] disabled:opacity-50 text-white font-bold rounded-xs cursor-pointer"
                >
                  {isSocialPending ? "Saving..." : "Save Channel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
