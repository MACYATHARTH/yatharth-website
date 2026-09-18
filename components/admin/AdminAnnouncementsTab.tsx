"use client";

import React, { useState, useTransition } from "react";
import {
  Bell,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Pin,
  AlertCircle,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  Calendar,
  Search,
  X,
  RefreshCw,
} from "lucide-react";
import {
  createAnnouncementAction,
  updateAnnouncementAction,
  toggleAnnouncementPublishAction,
  deleteAnnouncementAction,
  reorderAnnouncementsAction,
} from "@/app/admin/actions";
import { Announcement, PriorityLevel } from "@/lib/data/types";

interface AdminAnnouncementsTabProps {
  initialAnnouncements?: Announcement[];
  isDevelopment: boolean;
  onAnnouncementsChange?: (updated: Announcement[]) => void;
}

export function AdminAnnouncementsTab({
  initialAnnouncements = [],
  isDevelopment,
  onAnnouncementsChange,
}: AdminAnnouncementsTabProps) {
  const [announcementsList, setAnnouncementsList] = useState<Announcement[]>(initialAnnouncements);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | PriorityLevel>("ALL");
  const [publishFilter, setPublishFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewAnnouncement, setIsNewAnnouncement] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    title: string;
    priority: PriorityLevel;
    date: string;
    time: string;
    summary: string;
    content: string;
    displayOrder: number;
    isPublished: boolean;
  }>({
    title: "",
    priority: "NORMAL",
    date: new Date().toISOString().slice(0, 10),
    time: "10:00",
    summary: "",
    content: "",
    displayOrder: 1,
    isPublished: true,
  });

  // Helper to notify changes
  const updateList = (updated: Announcement[]) => {
    const sorted = [...updated].sort((a, b) => {
      const orderDiff = (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
      if (orderDiff !== 0) return orderDiff;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
    setAnnouncementsList(sorted);
    if (onAnnouncementsChange) onAnnouncementsChange(sorted);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    setFormData({
      title: "",
      priority: "NORMAL",
      date: dateStr,
      time: `${hours}:${minutes}`,
      summary: "",
      content: "",
      displayOrder: announcementsList.length + 1,
      isPublished: true,
    });
    setIsNewAnnouncement(true);
    setEditingId(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: Announcement) => {
    const d = new Date(item.publishedAt);
    const dateStr = !isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
    const timeStr = !isNaN(d.getTime())
      ? `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
      : "10:00";

    setFormData({
      title: item.title,
      priority: item.priority || "NORMAL",
      date: dateStr,
      time: timeStr,
      summary: item.summary,
      content: item.content,
      displayOrder: item.displayOrder ?? 1,
      isPublished: item.isPublished !== false,
    });
    setIsNewAnnouncement(false);
    setEditingId(item.id);
    setIsModalOpen(true);
  };

  // Submit Modal
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Please provide an announcement title.");
      return;
    }
    if (!formData.summary.trim()) {
      alert("Please provide a short summary / description.");
      return;
    }
    if (!formData.content.trim()) {
      alert("Please provide the full notice content.");
      return;
    }

    let publishedAtIso: string;
    try {
      const combined = `${formData.date}T${formData.time || "00:00"}:00`;
      const parsed = new Date(combined);
      publishedAtIso = !isNaN(parsed.getTime()) ? parsed.toISOString() : new Date().toISOString();
    } catch {
      publishedAtIso = new Date().toISOString();
    }

    setMessage(null);

    startTransition(async () => {
      if (isNewAnnouncement) {
        const res = await createAnnouncementAction({
          title: formData.title.trim(),
          summary: formData.summary.trim(),
          content: formData.content.trim(),
          priority: formData.priority,
          publishedAt: publishedAtIso,
          displayOrder: Number(formData.displayOrder) || 1,
          isPublished: formData.isPublished,
        });

        if (res.success && res.item) {
          updateList([...announcementsList, res.item]);
          setIsModalOpen(false);
          setMessage({
            type: "success",
            text: `Announcement "${res.item.title}" created successfully.`,
          });
        } else {
          setMessage({
            type: "error",
            text: res.error || "Failed to create announcement.",
          });
        }
      } else if (editingId) {
        const res = await updateAnnouncementAction(editingId, {
          title: formData.title.trim(),
          summary: formData.summary.trim(),
          content: formData.content.trim(),
          priority: formData.priority,
          publishedAt: publishedAtIso,
          displayOrder: Number(formData.displayOrder) || 1,
          isPublished: formData.isPublished,
        });

        if (res.success && res.item) {
          const updated = announcementsList.map((a) => (a.id === editingId ? res.item! : a));
          updateList(updated);
          setIsModalOpen(false);
          setMessage({
            type: "success",
            text: `Announcement "${res.item.title}" updated successfully.`,
          });
        } else {
          setMessage({
            type: "error",
            text: res.error || "Failed to update announcement.",
          });
        }
      }
    });
  };

  // Toggle Visibility
  const handleTogglePublished = (item: Announcement) => {
    setMessage(null);
    const targetStatus = !item.isPublished;

    startTransition(async () => {
      const res = await toggleAnnouncementPublishAction(item.id, targetStatus);
      if (res.success && res.item) {
        const updated = announcementsList.map((a) => (a.id === item.id ? res.item! : a));
        updateList(updated);
        setMessage({
          type: "success",
          text: `"${item.title}" set to ${targetStatus ? "Published (Visible)" : "Unpublished (Hidden)"}.`,
        });
      } else {
        setMessage({
          type: "error",
          text: res.error || "Failed to toggle announcement status.",
        });
      }
    });
  };

  // Delete Announcement
  const handleDelete = (item: Announcement) => {
    if (
      !confirm(
        `Are you sure you want to permanently delete the announcement:\n\n"${item.title}"?\n\nThis action cannot be undone.`
      )
    ) {
      return;
    }

    setMessage(null);
    startTransition(async () => {
      const res = await deleteAnnouncementAction(item.id);
      if (res.success) {
        const updated = announcementsList.filter((a) => a.id !== item.id);
        updateList(updated);
        setMessage({
          type: "success",
          text: `Announcement "${item.title}" deleted successfully.`,
        });
      } else {
        setMessage({
          type: "error",
          text: res.error || "Failed to delete announcement.",
        });
      }
    });
  };

  // Reorder announcements
  const handleMoveOrder = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= announcementsList.length) return;

    const currentItem = announcementsList[index];
    const targetItem = announcementsList[targetIndex];

    const currentOrder = currentItem.displayOrder ?? index + 1;
    const targetOrder = targetItem.displayOrder ?? targetIndex + 1;

    // Swap displayOrder
    const updated = [...announcementsList];
    updated[index] = { ...currentItem, displayOrder: targetOrder };
    updated[targetIndex] = { ...targetItem, displayOrder: currentOrder };

    updateList(updated);
    setMessage(null);

    startTransition(async () => {
      const res = await reorderAnnouncementsAction([
        { id: currentItem.id, displayOrder: targetOrder },
        { id: targetItem.id, displayOrder: currentOrder },
      ]);

      if (res.success) {
        setMessage({
          type: "success",
          text: "Display order updated successfully.",
        });
      } else {
        setMessage({
          type: "error",
          text: res.error || "Failed to save reordered announcements.",
        });
      }
    });
  };

  // Filtered List
  const filteredAnnouncements = announcementsList.filter((item) => {
    // Priority / category filter
    if (priorityFilter !== "ALL" && item.priority !== priorityFilter) {
      return false;
    }

    // Publish filter
    if (publishFilter === "PUBLISHED" && item.isPublished === false) {
      return false;
    }
    if (publishFilter === "DRAFT" && item.isPublished !== false) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSummary = item.summary.toLowerCase().includes(q);
      const matchContent = item.content.toLowerCase().includes(q);
      if (!matchTitle && !matchSummary && !matchContent) return false;
    }

    return true;
  });

  const publishedCount = announcementsList.filter((a) => a.isPublished !== false).length;
  const draftCount = announcementsList.length - publishedCount;

  return (
    <div className="space-y-8">
      {/* ═══════════════════════════════════════════════
          HEADER BAR
          ═══════════════════════════════════════════════ */}
      <div className="border-b border-white/[0.08] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-[#8F3025]" />
            Announcements &amp; Circulars CMS
          </h2>
          <p className="text-xs text-[#77716A] mt-1">
            Publish official notices, competition guidelines, deadline bulletins, and press releases.
          </p>
        </div>

        <button
          type="button"
          disabled={!isDevelopment || isPending}
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 shrink-0 rounded-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {message && (
        <div
          className={`p-3.5 border rounded-xs text-xs flex items-center justify-between gap-3 ${
            message.type === "success"
              ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
              : "bg-rose-950/30 border-rose-500/40 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          SEARCH & FILTER TOOLBAR
          ═══════════════════════════════════════════════ */}
      <div className="p-4 bg-[#121110] border border-white/[0.08] rounded-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search box */}
          <div className="md:col-span-6 relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search circulars by headline or keywords..."
              className="w-full pl-9 pr-3 py-2 bg-black/60 border border-white/10 text-xs text-white placeholder-zinc-500 rounded-xs focus:border-[#8F3025] focus:outline-none"
            />
          </div>

          {/* Priority / Category select */}
          <div className="md:col-span-3">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as "ALL" | PriorityLevel)}
              className="w-full px-3 py-2 bg-black/60 border border-white/10 text-xs font-mono text-zinc-300 uppercase rounded-xs focus:border-[#8F3025] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="URGENT">Urgent Alerts</option>
              <option value="PINNED">Pinned Notices</option>
              <option value="NORMAL">Standard Circulars</option>
            </select>
          </div>

          {/* Published filter */}
          <div className="md:col-span-3">
            <select
              value={publishFilter}
              onChange={(e) => setPublishFilter(e.target.value as "ALL" | "PUBLISHED" | "DRAFT")}
              className="w-full px-3 py-2 bg-black/60 border border-white/10 text-xs font-mono text-zinc-300 uppercase rounded-xs focus:border-[#8F3025] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses ({announcementsList.length})</option>
              <option value="PUBLISHED">Published Only ({publishedCount})</option>
              <option value="DRAFT">Drafts / Hidden ({draftCount})</option>
            </select>
          </div>
        </div>

        {/* Status badges bar */}
        <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-zinc-500 pt-2 border-t border-white/[0.04]">
          <div className="flex items-center gap-3">
            <span>
              Total: <strong className="text-white">{announcementsList.length}</strong>
            </span>
            <span>•</span>
            <span className="text-emerald-400">
              Published: <strong>{publishedCount}</strong>
            </span>
            <span>•</span>
            <span className="text-zinc-400">
              Drafts: <strong>{draftCount}</strong>
            </span>
          </div>

          {(searchQuery || priorityFilter !== "ALL" || publishFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setPriorityFilter("ALL");
                setPublishFilter("ALL");
              }}
              className="text-[#8F3025] hover:underline cursor-pointer uppercase text-[10px]"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          ANNOUNCEMENTS DIRECTORY LIST
          ═══════════════════════════════════════════════ */}
      {filteredAnnouncements.length === 0 ? (
        <div className="p-12 text-center bg-[#121110] border border-white/[0.08] rounded-xs space-y-3 font-mono">
          <Bell className="w-8 h-8 text-zinc-600 mx-auto" />
          <p className="text-xs text-zinc-400">No circulars or announcements found.</p>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="text-xs text-[#8F3025] hover:underline uppercase font-bold cursor-pointer"
          >
            + Create First Announcement
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAnnouncements.map((item, index) => {
            const formattedDate = new Date(item.publishedAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            const formattedTime = new Date(item.publishedAt).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={item.id}
                className="p-5 bg-[#121110] border border-white/[0.08] hover:border-white/20 rounded-xs space-y-3 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-2 flex-1">
                    {/* Metadata Header */}
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                      {/* Order Badge */}
                      <span className="px-1.5 py-0.5 bg-black/60 border border-white/10 text-zinc-400 rounded-xs">
                        Order #{item.displayOrder ?? index + 1}
                      </span>

                      {/* Priority Badge */}
                      <span
                        className={`px-2 py-0.5 font-bold uppercase rounded-xs border ${
                          item.priority === "URGENT"
                            ? "bg-[#8F3025]/20 text-rose-300 border-[#8F3025]/50 animate-pulse"
                            : item.priority === "PINNED"
                            ? "bg-amber-950/30 text-amber-300 border-amber-500/30"
                            : "bg-zinc-900 text-zinc-400 border-zinc-700"
                        }`}
                      >
                        {item.priority === "PINNED" && <Pin className="w-2.5 h-2.5 inline mr-1" />}
                        {item.priority === "URGENT"
                          ? "Urgent Alert"
                          : item.priority === "PINNED"
                          ? "Pinned Notice"
                          : "Standard Circular"}
                      </span>

                      {/* Publish Status Badge */}
                      <span
                        className={`px-2 py-0.5 font-bold uppercase rounded-xs border ${
                          item.isPublished !== false
                            ? "bg-emerald-950/30 text-emerald-400 border-emerald-500/30"
                            : "bg-zinc-900 text-zinc-500 border-zinc-700"
                        }`}
                      >
                        {item.isPublished !== false ? "Published" : "Draft / Hidden"}
                      </span>

                      {/* Date & Time */}
                      <span className="text-zinc-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#8F3025]" />
                        {formattedDate} at {formattedTime}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-white leading-snug">
                      {item.title}
                    </h3>

                    {/* Summary Excerpt */}
                    <p className="text-xs text-zinc-400 leading-relaxed max-w-4xl line-clamp-2">
                      {item.summary}
                    </p>
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center gap-1.5 shrink-0 self-start pt-1">
                    {/* Order buttons */}
                    <button
                      type="button"
                      disabled={!isDevelopment || index === 0 || isPending}
                      onClick={() => handleMoveOrder(index, "up")}
                      className="p-1.5 border border-white/10 hover:border-white/30 text-zinc-400 hover:text-white rounded-xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Move Up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={
                        !isDevelopment ||
                        index === filteredAnnouncements.length - 1 ||
                        isPending
                      }
                      onClick={() => handleMoveOrder(index, "down")}
                      className="p-1.5 border border-white/10 hover:border-white/30 text-zinc-400 hover:text-white rounded-xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Move Down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Quick Visibility Toggle */}
                    <button
                      type="button"
                      disabled={!isDevelopment || isPending}
                      onClick={() => handleTogglePublished(item)}
                      className={`p-1.5 border rounded-xs transition-colors cursor-pointer ${
                        item.isPublished !== false
                          ? "border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/20"
                          : "border-zinc-700 text-zinc-500 hover:text-white hover:border-zinc-500"
                      }`}
                      title={
                        item.isPublished !== false
                          ? "Click to Unpublish (Hide from website)"
                          : "Click to Publish (Show on website)"
                      }
                    >
                      {item.isPublished !== false ? (
                        <Eye className="w-3.5 h-3.5" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Edit button */}
                    <button
                      type="button"
                      disabled={!isDevelopment}
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1.5 border border-white/10 hover:border-white/30 text-zinc-400 hover:text-white rounded-xs cursor-pointer"
                      title="Edit Announcement"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      disabled={!isDevelopment || isPending}
                      onClick={() => handleDelete(item)}
                      className="p-1.5 border border-white/10 hover:border-rose-500/40 text-rose-400 hover:text-rose-300 rounded-xs cursor-pointer"
                      title="Delete Announcement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          MODAL: ADD / EDIT ANNOUNCEMENT
          ═══════════════════════════════════════════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121110] border border-white/20 rounded-xs max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-tight flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#8F3025]" />
                {isNewAnnouncement ? "Create Festival Announcement" : "Edit Festival Announcement"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs font-mono">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Announcement Headline *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. YATHARTH '26 Rulebook & Guidelines Released"
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none font-sans"
                />
              </div>

              {/* Priority / Category and Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Notice Category / Priority *</label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value as PriorityLevel })
                    }
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none cursor-pointer uppercase"
                  >
                    <option value="NORMAL">Standard Circular (NORMAL)</option>
                    <option value="PINNED">Pinned Notice (PINNED)</option>
                    <option value="URGENT">Urgent Alert (URGENT)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Display Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) =>
                      setFormData({ ...formData, displayOrder: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Publish Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Publish Time</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                  />
                </div>
              </div>

              {/* Short Summary */}
              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Short Description / Excerpt *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Brief summary appearing on the card preview..."
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none font-sans"
                />
              </div>

              {/* Full Content */}
              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Full Announcement Copy *</label>
                <textarea
                  rows={5}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Complete announcement text displayed when circular is expanded..."
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none font-sans leading-relaxed"
                />
              </div>

              {/* Published Toggle Checkbox */}
              <div className="pt-2 border-t border-white/10">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="accent-[#8F3025]"
                  />
                  <span className="text-zinc-200">
                    Publish immediately (Make visible on public /announcements page)
                  </span>
                </label>
                <p className="text-[11px] text-zinc-500 pl-6 mt-0.5">
                  If unchecked, this notice will be saved as a draft and will not be displayed to visitors.
                </p>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-white/20 text-zinc-400 hover:text-white rounded-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-[#8F3025] hover:bg-[#5C211C] text-white font-bold rounded-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isPending && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isNewAnnouncement ? "Create Notice" : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
