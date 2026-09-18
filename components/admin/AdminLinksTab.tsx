"use client";

import React, { useState, useTransition } from "react";
import {
  Link2,
  ExternalLink,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Share2,
} from "lucide-react";
import {
  updateLinktreeAction,
  createFestivalLinkAction,
  updateFestivalLinkAction,
  deleteFestivalLinkAction,
} from "@/app/admin/actions";
import { FestivalLink } from "@/lib/data/types";

interface AdminLinksTabProps {
  initialLinktree: {
    url: string;
    enabled: boolean;
  };
  initialLinks: FestivalLink[];
  isDevelopment: boolean;
}

// Simple Platform Icon Helper
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

  return <Share2 className={className} />;
}

export function AdminLinksTab({
  initialLinktree,
  initialLinks,
  isDevelopment,
}: AdminLinksTabProps) {
  // Linktree State
  const [linktreeUrl, setLinktreeUrl] = useState(initialLinktree.url);
  const [linktreeEnabled, setLinktreeEnabled] = useState(initialLinktree.enabled);
  const [linktreeMessage, setLinktreeMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isLinktreePending, startLinktreeTransition] = useTransition();

  // Festival Links (Social Handles) State
  const [linksList, setLinksList] = useState<FestivalLink[]>(initialLinks);
  const [socialMessage, setSocialMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isSocialPending, startSocialTransition] = useTransition();

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newLinkData, setNewLinkData] = useState({
    platform: "Instagram",
    label: "",
    url: "",
    displayOrder: linksList.length + 1,
    isPublished: true,
  });

  const [editingLink, setEditingLink] = useState<FestivalLink | null>(null);

  // Linktree Save
  const handleSaveLinktree = () => {
    setLinktreeMessage(null);
    startLinktreeTransition(async () => {
      const res = await updateLinktreeAction({
        url: linktreeUrl,
        enabled: linktreeEnabled,
      });

      if (res.success) {
        setLinktreeMessage({
          type: "success",
          text: "Linktree configuration saved successfully.",
        });
      } else {
        setLinktreeMessage({
          type: "error",
          text: res.error || "Failed to update Linktree link.",
        });
      }
    });
  };

  // Social Handle Submit
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkData.platform.trim() || !newLinkData.label.trim() || !newLinkData.url.trim()) return;

    setSocialMessage(null);
    startSocialTransition(async () => {
      const res = await createFestivalLinkAction({
        platform: newLinkData.platform.trim(),
        label: newLinkData.label.trim(),
        url: newLinkData.url.trim(),
        displayOrder: newLinkData.displayOrder,
        isPublished: newLinkData.isPublished,
      });

      if (res.success && res.link) {
        setLinksList((prev) => [...prev, res.link!]);
        setIsCreateOpen(false);
        setNewLinkData({
          platform: "Instagram",
          label: "",
          url: "",
          displayOrder: linksList.length + 2,
          isPublished: true,
        });
        setSocialMessage({
          type: "success",
          text: `Social handle "${res.link.platform}" created successfully.`,
        });
      } else {
        setSocialMessage({ type: "error", text: res.error || "Failed to add social handle." });
      }
    });
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink) return;

    setSocialMessage(null);
    startSocialTransition(async () => {
      const res = await updateFestivalLinkAction(editingLink.id, {
        platform: editingLink.platform,
        label: editingLink.label,
        url: editingLink.url,
        displayOrder: editingLink.displayOrder,
        isPublished: editingLink.isPublished,
      });

      if (res.success && res.link) {
        setLinksList((prev) => prev.map((l) => (l.id === editingLink.id ? res.link! : l)));
        setEditingLink(null);
        setSocialMessage({
          type: "success",
          text: `Social handle for ${res.link.platform} updated.`,
        });
      } else {
        setSocialMessage({ type: "error", text: res.error || "Failed to update social handle." });
      }
    });
  };

  const handleTogglePublished = async (link: FestivalLink) => {
    const updatedStatus = !link.isPublished;
    const res = await updateFestivalLinkAction(link.id, { isPublished: updatedStatus });
    if (res.success && res.link) {
      setLinksList((prev) =>
        prev.map((l) => (l.id === link.id ? { ...l, isPublished: updatedStatus } : l))
      );
    }
  };

  const handleDelete = async (linkId: string, label: string) => {
    if (!confirm(`Are you sure you want to delete handle "${label}"?`)) return;

    const res = await deleteFestivalLinkAction(linkId);
    if (res.success) {
      setLinksList((prev) => prev.filter((l) => l.id !== linkId));
      setSocialMessage({ type: "success", text: `Deleted handle "${label}".` });
    } else {
      alert(res.error || "Failed to delete handle.");
    }
  };

  return (
    <div className="space-y-10 max-w-3xl">
      {/* Header */}
      <div className="border-b border-white/[0.08] pb-4">
        <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
          <Link2 className="w-5 h-5 text-[#8F3025]" />
          <span>Social Media &amp; Official Links</span>
        </h2>
        <p className="text-xs text-[#77716A] mt-1">
          Manage the central Linktree portal and official social media handles displayed on the homepage and footer.
        </p>
      </div>

      {/* ═══════════════════════════════════════════════
          SECTION 1: OFFICIAL SOCIAL MEDIA HANDLES
          ═══════════════════════════════════════════════ */}
      <div className="p-6 bg-[#121110] border border-white/[0.08] rounded-xs space-y-6">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#8F3025]" />
              <span>Official Social Media Handles</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Rendered on the dedicated Homepage Social Media section and footer directory.
            </p>
          </div>

          <button
            type="button"
            disabled={!isDevelopment}
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#8F3025] hover:bg-[#A3382D] text-white text-xs font-mono uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Social Handle</span>
          </button>
        </div>

        {/* Social Status Message */}
        {socialMessage && (
          <div
            className={`p-3 border rounded-xs flex items-center gap-2 text-xs ${
              socialMessage.type === "success"
                ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300"
                : "border-[#8F3025]/50 bg-[#8F3025]/15 text-rose-300"
            }`}
          >
            {socialMessage.type === "success" ? (
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>{socialMessage.text}</span>
          </div>
        )}

        {/* Handles List */}
        <div className="space-y-3">
          {linksList.map((link) => (
            <div
              key={link.id}
              className={`p-4 bg-black/40 border rounded-xs flex items-center justify-between gap-4 transition-all ${
                link.isPublished ? "border-white/10" : "border-white/5 opacity-50"
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-9 h-9 rounded-xs bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300 shrink-0">
                  <PlatformIcon platform={link.platform} className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      {link.platform}
                    </span>
                    <span
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-xs ${
                        link.isPublished
                          ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {link.isPublished ? "Visible" : "Hidden"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-zinc-300 font-mono truncate">{link.label}</span>
                    <span className="text-zinc-600">&bull;</span>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-mono text-zinc-500 hover:text-white truncate max-w-[220px] flex items-center gap-1"
                    >
                      <span>{link.url}</span>
                      <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={!isDevelopment}
                  onClick={() => handleTogglePublished(link)}
                  className="p-1.5 text-zinc-400 hover:text-white cursor-pointer"
                  title={link.isPublished ? "Hide handle" : "Publish handle"}
                >
                  {link.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  disabled={!isDevelopment}
                  onClick={() => setEditingLink(link)}
                  className="p-1.5 text-zinc-400 hover:text-white cursor-pointer"
                  title="Edit Handle"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={!isDevelopment}
                  onClick={() => handleDelete(link.id, link.label)}
                  className="p-1.5 text-rose-400/80 hover:text-rose-300 cursor-pointer"
                  title="Delete Handle"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {linksList.length === 0 && (
            <div className="p-4 text-center text-xs font-mono text-zinc-600 border border-dashed border-white/5 rounded-xs">
              No official social media handles configured yet.
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          SECTION 2: CENTRAL LINKTREE PORTAL
          ═══════════════════════════════════════════════ */}
      <div className="p-6 bg-[#121110] border border-white/[0.08] rounded-xs space-y-5">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Link2 className="w-4 h-4 text-[#8F3025]" />
              <span>Linktree Portal</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Central linktree hub featured in the website footer and festival directory.
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer font-mono text-xs">
            <input
              type="checkbox"
              checked={linktreeEnabled}
              onChange={(e) => setLinktreeEnabled(e.target.checked)}
              className="accent-[#8F3025] w-4 h-4 cursor-pointer"
            />
            <span className={linktreeEnabled ? "text-emerald-400 font-semibold" : "text-zinc-500"}>
              {linktreeEnabled ? "Enabled" : "Disabled"}
            </span>
          </label>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
            Linktree Portal URL
          </label>
          <input
            type="url"
            placeholder="https://linktr.ee/..."
            value={linktreeUrl}
            onChange={(e) => setLinktreeUrl(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-black/60 border border-white/15 focus:border-[#8F3025] focus:outline-none text-xs font-mono text-white rounded-xs"
          />
        </div>

        {/* Live Footer Preview */}
        <div className="p-4 bg-black/40 border border-white/10 rounded-xs space-y-2">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
            Website Footer Preview:
          </span>
          {linktreeEnabled && linktreeUrl ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#8F3025]/50 bg-[#8F3025]/10 text-[#E9E6DF] text-xs font-mono uppercase tracking-wider rounded-xs">
              <span>Official Linktree</span>
              <ExternalLink className="w-3 h-3 text-[#8F3025]" />
            </div>
          ) : (
            <span className="text-xs font-mono text-zinc-600 italic">
              Linktree is currently disabled and hidden from the website.
            </span>
          )}
        </div>

        {/* Feedback Message */}
        {linktreeMessage && (
          <div
            className={`p-3 border rounded-xs flex items-center gap-2 text-xs ${
              linktreeMessage.type === "success"
                ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300"
                : "border-[#8F3025]/50 bg-[#8F3025]/15 text-rose-300"
            }`}
          >
            {linktreeMessage.type === "success" ? (
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>{linktreeMessage.text}</span>
          </div>
        )}

        {/* Save Button */}
        <button
          type="button"
          disabled={!isDevelopment || isLinktreePending}
          onClick={handleSaveLinktree}
          className="w-full py-2.5 bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 rounded-xs"
        >
          {isLinktreePending ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Saving Linktree...</span>
            </>
          ) : (
            <span>Save Linktree Settings &rarr;</span>
          )}
        </button>
      </div>

      {/* ═══════════════════════════════════════════════
          MODAL: ADD SOCIAL HANDLE
          ═══════════════════════════════════════════════ */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121110] border border-white/20 rounded-xs max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white uppercase tracking-tight">
                Add Official Social Handle
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Platform *</label>
                <select
                  value={newLinkData.platform}
                  onChange={(e) => setNewLinkData({ ...newLinkData, platform: e.target.value })}
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                >
                  <option value="Instagram">Instagram</option>
                  <option value="YouTube">YouTube</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="X (Twitter)">X (Twitter)</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Spotify">Spotify</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Handle / Label *</label>
                <input
                  type="text"
                  required
                  value={newLinkData.label}
                  onChange={(e) => setNewLinkData({ ...newLinkData, label: e.target.value })}
                  placeholder="e.g. @yatharth.mac"
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">URL Link *</label>
                <input
                  type="url"
                  required
                  value={newLinkData.url}
                  onChange={(e) => setNewLinkData({ ...newLinkData, url: e.target.value })}
                  placeholder="https://instagram.com/yatharth.mac"
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newLinkData.isPublished}
                    onChange={(e) =>
                      setNewLinkData({ ...newLinkData, isPublished: e.target.checked })
                    }
                    className="accent-[#8F3025]"
                  />
                  <span className="text-zinc-300">Visible on Site</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 border border-white/20 text-zinc-400 hover:text-white rounded-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSocialPending}
                    className="px-5 py-2 bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors rounded-xs cursor-pointer flex items-center gap-1.5"
                  >
                    {isSocialPending ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
                    <span>Add Handle</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          MODAL: EDIT SOCIAL HANDLE
          ═══════════════════════════════════════════════ */}
      {editingLink && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121110] border border-white/20 rounded-xs max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white uppercase tracking-tight">
                Edit Social Handle
              </h3>
              <button
                type="button"
                onClick={() => setEditingLink(null)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Platform *</label>
                <input
                  type="text"
                  required
                  value={editingLink.platform}
                  onChange={(e) =>
                    setEditingLink({ ...editingLink, platform: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Handle / Label *</label>
                <input
                  type="text"
                  required
                  value={editingLink.label}
                  onChange={(e) =>
                    setEditingLink({ ...editingLink, label: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">URL Link *</label>
                <input
                  type="url"
                  required
                  value={editingLink.url}
                  onChange={(e) =>
                    setEditingLink({ ...editingLink, url: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingLink.isPublished}
                    onChange={(e) =>
                      setEditingLink({ ...editingLink, isPublished: e.target.checked })
                    }
                    className="accent-[#8F3025]"
                  />
                  <span className="text-zinc-300">Visible on Site</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingLink(null)}
                    className="px-4 py-2 border border-white/20 text-zinc-400 hover:text-white rounded-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSocialPending}
                    className="px-5 py-2 bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors rounded-xs cursor-pointer flex items-center gap-1.5"
                  >
                    {isSocialPending ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
                    <span>Save Changes</span>
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
