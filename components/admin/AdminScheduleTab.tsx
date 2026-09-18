"use client";

import { useState, useTransition } from "react";
import {
  Clock,
  MapPin,
  Plus,
  Trash2,
  Edit3,
  X,
  AlertCircle,
  Search,
} from "lucide-react";
import {
  createScheduleEntryAction,
  updateScheduleEntryAction,
  deleteScheduleEntryAction,
} from "@/app/admin/actions";
import { ScheduleEntry, Event, Venue } from "@/lib/data/types";

interface AdminScheduleTabProps {
  initialSchedule: ScheduleEntry[];
  events: Event[];
  venues: Venue[];
  isDevelopment: boolean;
}

export function AdminScheduleTab({
  initialSchedule,
  events,
  venues,
  isDevelopment,
}: AdminScheduleTabProps) {
  const [scheduleList, setScheduleList] = useState<ScheduleEntry[]>(initialSchedule);
  const [dayFilter, setDayFilter] = useState<number | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ScheduleEntry | null>(null);

  // Form states for Add
  const [newEntryData, setNewEntryData] = useState({
    dayNumber: 1,
    calendarDate: "2026-10-24",
    startTime: "10:00 AM",
    endTime: "11:30 AM",
    eventId: "",
    title: "",
    description: "",
    venueId: "",
    status: "UPCOMING" as "UPCOMING" | "LIVE" | "COMPLETED",
    displayOrder: 1,
    isPublished: true,
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filtered entries
  const filteredEntries = scheduleList.filter((entry) => {
    if (dayFilter !== "ALL" && entry.dayNumber !== dayFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = entry.title?.toLowerCase().includes(q) || false;
      const eventMatch = entry.event?.title.toLowerCase().includes(q) || false;
      const venueMatch = entry.venue?.name.toLowerCase().includes(q) || false;
      if (!titleMatch && !eventMatch && !venueMatch) return false;
    }
    return true;
  });

  // Handle Add Entry
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newEntryData.startTime.trim() || !newEntryData.endTime.trim()) {
      setFormError("Start and End times are required.");
      return;
    }

    startTransition(async () => {
      const res = await createScheduleEntryAction({
        dayNumber: Number(newEntryData.dayNumber),
        calendarDate: newEntryData.calendarDate || null,
        startTime: newEntryData.startTime.trim(),
        endTime: newEntryData.endTime.trim(),
        eventId: newEntryData.eventId || null,
        title: newEntryData.title.trim() || null,
        description: newEntryData.description.trim() || null,
        venueId: newEntryData.venueId || null,
        status: newEntryData.status,
        displayOrder: Number(newEntryData.displayOrder) || 1,
        isPublished: newEntryData.isPublished,
      });

      if (res.success && res.entry) {
        setScheduleList((prev) => [...prev, res.entry!]);
        setIsAddOpen(false);
        setNewEntryData({
          dayNumber: 1,
          calendarDate: "2026-10-24",
          startTime: "10:00 AM",
          endTime: "11:30 AM",
          eventId: "",
          title: "",
          description: "",
          venueId: "",
          status: "UPCOMING",
          displayOrder: scheduleList.length + 2,
          isPublished: true,
        });
      } else {
        setFormError(res.error || "Failed to create schedule entry.");
      }
    });
  };

  // Handle Update Entry
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;
    setFormError(null);

    startTransition(async () => {
      const res = await updateScheduleEntryAction(editingEntry.id, {
        dayNumber: Number(editingEntry.dayNumber),
        calendarDate: editingEntry.calendarDate || null,
        startTime: editingEntry.startTime,
        endTime: editingEntry.endTime,
        eventId: editingEntry.eventId || null,
        title: editingEntry.title || null,
        description: editingEntry.description || null,
        venueId: editingEntry.venueId || null,
        status: editingEntry.status,
        displayOrder: Number(editingEntry.displayOrder),
        isPublished: editingEntry.isPublished,
      });

      if (res.success && res.entry) {
        setScheduleList((prev) =>
          prev.map((item) => (item.id === editingEntry.id ? res.entry! : item))
        );
        setEditingEntry(null);
      } else {
        setFormError(res.error || "Failed to update schedule entry.");
      }
    });
  };

  // Handle Toggle Published
  const handleTogglePublished = async (entry: ScheduleEntry) => {
    const newStatus = !entry.isPublished;
    const res = await updateScheduleEntryAction(entry.id, { isPublished: newStatus });
    if (res.success && res.entry) {
      setScheduleList((prev) =>
        prev.map((item) => (item.id === entry.id ? { ...item, isPublished: newStatus } : item))
      );
    }
  };

  // Handle Delete Entry
  const handleDeleteEntry = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove "${title || "this schedule item"}"?`)) return;

    const res = await deleteScheduleEntryAction(id);
    if (res.success) {
      setScheduleList((prev) => prev.filter((item) => item.id !== id));
      if (editingEntry?.id === id) setEditingEntry(null);
    } else {
      alert(res.error || "Failed to delete schedule entry.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Action */}
      <div className="border-b border-white/[0.08] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-[#8F3025]" />
            Festival Schedule Management
          </h2>
          <p className="text-xs text-[#77716A] mt-1">
            Program timeline, session times, stage itineraries, and venue allocations.
          </p>
        </div>

        <button
          type="button"
          disabled={!isDevelopment}
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2.5 bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Schedule Entry</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-[#121110] border border-white/[0.08] rounded-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search schedule by title or venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-black/60 border border-white/15 focus:border-[#8F3025] focus:outline-none text-xs font-mono text-white rounded-xs"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setDayFilter("ALL")}
            className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider border rounded-xs transition-colors cursor-pointer ${
              dayFilter === "ALL"
                ? "bg-[#8F3025] border-[#8F3025] text-white font-bold"
                : "border-white/10 text-zinc-400 hover:text-white"
            }`}
          >
            All Days ({scheduleList.length})
          </button>
          {[1, 2].map((day) => (
            <button
              key={day}
              onClick={() => setDayFilter(day)}
              className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider border rounded-xs transition-colors cursor-pointer ${
                dayFilter === day
                  ? "bg-[#8F3025] border-[#8F3025] text-white font-bold"
                  : "border-white/10 text-zinc-400 hover:text-white"
              }`}
            >
              Day {day} ({scheduleList.filter((s) => s.dayNumber === day).length})
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Items List */}
      <div className="space-y-3">
        {filteredEntries.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-white/10 text-zinc-500 text-xs font-mono">
            No schedule entries found for the selected criteria.
          </div>
        ) : (
          filteredEntries
            .sort((a, b) => a.dayNumber - b.dayNumber || (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
            .map((entry) => {
              const displayTitle = entry.title || entry.event?.title || "Scheduled Event";
              const venueName = entry.venue?.name || "Main Campus Auditorium";

              return (
                <div
                  key={entry.id}
                  className="p-4 bg-[#121110] border border-white/[0.08] hover:border-white/20 transition-all rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    {/* Time & Day badge */}
                    <div className="w-28 shrink-0 space-y-1">
                      <div className="text-[10px] font-mono uppercase text-[#8F3025] font-bold">
                        Day {entry.dayNumber}
                      </div>
                      <div className="text-xs font-mono text-white font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        <span>{entry.startTime}</span>
                      </div>
                      <div className="text-[10px] font-mono text-zinc-500">
                        to {entry.endTime}
                      </div>
                    </div>

                    {/* Entry Information */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-white">{displayTitle}</h3>
                        {entry.event && (
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-white/5 border border-white/10 text-zinc-400">
                            Linked: {entry.event.title}
                          </span>
                        )}
                        <span
                          className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-xs border ${
                            entry.status === "LIVE"
                              ? "bg-rose-950/40 border-rose-500 text-rose-400"
                              : entry.status === "COMPLETED"
                              ? "bg-zinc-800 border-zinc-600 text-zinc-400"
                              : "bg-emerald-950/20 border-emerald-500/30 text-emerald-400"
                          }`}
                        >
                          {entry.status || "UPCOMING"}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-zinc-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#8F3025]" />
                          <span>{venueName}</span>
                        </span>
                        {entry.calendarDate && (
                          <span className="font-mono text-[11px] text-zinc-500">
                            {entry.calendarDate}
                          </span>
                        )}
                        <span className="font-mono text-[10px] text-zinc-600">
                          Order: #{entry.displayOrder}
                        </span>
                      </div>

                      {entry.description && (
                        <p className="text-xs text-[#77716A] line-clamp-1">
                          {entry.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      disabled={!isDevelopment}
                      onClick={() => handleTogglePublished(entry)}
                      className={`text-[10px] font-mono uppercase px-2.5 py-1 border rounded-xs cursor-pointer ${
                        entry.isPublished
                          ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                          : "bg-zinc-900 border-zinc-700 text-zinc-500"
                      }`}
                    >
                      {entry.isPublished ? "Published" : "Draft"}
                    </button>

                    <button
                      type="button"
                      disabled={!isDevelopment}
                      onClick={() => {
                        setEditingEntry({ ...entry });
                        setFormError(null);
                      }}
                      className="p-1.5 border border-white/10 hover:border-white/30 text-zinc-300 hover:text-white rounded-xs cursor-pointer"
                      title="Edit Entry"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      disabled={!isDevelopment}
                      onClick={() => handleDeleteEntry(entry.id, displayTitle)}
                      className="p-1.5 border border-rose-500/20 hover:border-rose-500/60 text-rose-400 rounded-xs cursor-pointer"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* ═══════════════════════════════════════════════
          MODAL: ADD SCHEDULE ENTRY
          ═══════════════════════════════════════════════ */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121110] border border-white/20 rounded-xs max-w-xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white uppercase tracking-tight">
                Add Schedule Entry
              </h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs rounded-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Day Number *</label>
                  <select
                    value={newEntryData.dayNumber}
                    onChange={(e) =>
                      setNewEntryData({
                        ...newEntryData,
                        dayNumber: Number(e.target.value),
                        calendarDate: e.target.value === "2" ? "2026-10-25" : "2026-10-24",
                      })
                    }
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
                  >
                    <option value={1}>Day 1 (Saturday)</option>
                    <option value={2}>Day 2 (Sunday)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Calendar Date</label>
                  <input
                    type="date"
                    value={newEntryData.calendarDate}
                    onChange={(e) =>
                      setNewEntryData({ ...newEntryData, calendarDate: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Start Time *</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM"
                    value={newEntryData.startTime}
                    onChange={(e) =>
                      setNewEntryData({ ...newEntryData, startTime: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">End Time *</label>
                  <input
                    type="text"
                    placeholder="e.g. 11:30 AM"
                    value={newEntryData.endTime}
                    onChange={(e) =>
                      setNewEntryData({ ...newEntryData, endTime: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Link to Existing Event (Optional)</label>
                <select
                  value={newEntryData.eventId}
                  onChange={(e) => {
                    const selected = events.find((ev) => ev.id === e.target.value);
                    setNewEntryData({
                      ...newEntryData,
                      eventId: e.target.value,
                      title: selected ? selected.title : newEntryData.title,
                      description: selected ? selected.shortDescription : newEntryData.description,
                    });
                  }}
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
                >
                  <option value="">None (Independent Session / Ceremony)</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} ({ev.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Session Title</label>
                <input
                  type="text"
                  placeholder="e.g. Keynote Address or Live Reporting Desk"
                  value={newEntryData.title}
                  onChange={(e) =>
                    setNewEntryData({ ...newEntryData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Description / Overview</label>
                <textarea
                  rows={2}
                  value={newEntryData.description}
                  onChange={(e) =>
                    setNewEntryData({ ...newEntryData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Venue</label>
                  <select
                    value={newEntryData.venueId}
                    onChange={(e) =>
                      setNewEntryData({ ...newEntryData, venueId: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
                  >
                    <option value="">Select Venue</option>
                    {venues.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.building})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Status</label>
                  <select
                    value={newEntryData.status}
                    onChange={(e) =>
                      setNewEntryData({
                        ...newEntryData,
                        status: e.target.value as "UPCOMING" | "LIVE" | "COMPLETED",
                      })
                    }
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
                  >
                    <option value="UPCOMING">UPCOMING</option>
                    <option value="LIVE">LIVE NOW</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Display Order</label>
                  <input
                    type="number"
                    value={newEntryData.displayOrder}
                    onChange={(e) =>
                      setNewEntryData({ ...newEntryData, displayOrder: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newEntryData.isPublished}
                      onChange={(e) =>
                        setNewEntryData({ ...newEntryData, isPublished: e.target.checked })
                      }
                      className="accent-[#8F3025]"
                    />
                    <span className="text-zinc-300">Published</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border border-white/20 text-zinc-400 hover:text-white rounded-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !isDevelopment}
                  className="px-4 py-2 bg-[#8F3025] hover:bg-[#5C211C] text-white font-bold rounded-xs transition-colors cursor-pointer"
                >
                  {isPending ? "Creating..." : "Save Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          MODAL: EDIT SCHEDULE ENTRY
          ═══════════════════════════════════════════════ */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121110] border border-white/20 rounded-xs max-w-xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white uppercase tracking-tight">
                Edit Schedule Entry
              </h3>
              <button
                type="button"
                onClick={() => setEditingEntry(null)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs rounded-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Day Number *</label>
                  <select
                    value={editingEntry.dayNumber}
                    onChange={(e) =>
                      setEditingEntry({
                        ...editingEntry,
                        dayNumber: Number(e.target.value),
                        calendarDate: e.target.value === "2" ? "2026-10-25" : "2026-10-24",
                      })
                    }
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
                  >
                    <option value={1}>Day 1 (Saturday)</option>
                    <option value={2}>Day 2 (Sunday)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Calendar Date</label>
                  <input
                    type="date"
                    value={editingEntry.calendarDate || "2026-10-24"}
                    onChange={(e) =>
                      setEditingEntry({ ...editingEntry, calendarDate: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Start Time *</label>
                  <input
                    type="text"
                    value={editingEntry.startTime}
                    onChange={(e) =>
                      setEditingEntry({ ...editingEntry, startTime: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">End Time *</label>
                  <input
                    type="text"
                    value={editingEntry.endTime}
                    onChange={(e) =>
                      setEditingEntry({ ...editingEntry, endTime: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Linked Event</label>
                <select
                  value={editingEntry.eventId || ""}
                  onChange={(e) => {
                    const selected = events.find((ev) => ev.id === e.target.value);
                    setEditingEntry({
                      ...editingEntry,
                      eventId: e.target.value || null,
                      title: selected ? selected.title : editingEntry.title,
                      description: selected ? selected.shortDescription : editingEntry.description,
                      event: selected || null,
                    });
                  }}
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
                >
                  <option value="">None (Custom Program Session)</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} ({ev.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Session Title</label>
                <input
                  type="text"
                  value={editingEntry.title || ""}
                  onChange={(e) =>
                    setEditingEntry({ ...editingEntry, title: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Description / Overview</label>
                <textarea
                  rows={2}
                  value={editingEntry.description || ""}
                  onChange={(e) =>
                    setEditingEntry({ ...editingEntry, description: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Venue</label>
                  <select
                    value={editingEntry.venueId || ""}
                    onChange={(e) => {
                      const selected = venues.find((v) => v.id === e.target.value);
                      setEditingEntry({
                        ...editingEntry,
                        venueId: e.target.value || null,
                        venue: selected || null,
                      });
                    }}
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
                  >
                    <option value="">Select Venue</option>
                    {venues.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.building})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Status</label>
                  <select
                    value={editingEntry.status || "UPCOMING"}
                    onChange={(e) =>
                      setEditingEntry({
                        ...editingEntry,
                        status: e.target.value as "UPCOMING" | "LIVE" | "COMPLETED",
                      })
                    }
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
                  >
                    <option value="UPCOMING">UPCOMING</option>
                    <option value="LIVE">LIVE NOW</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Display Order</label>
                  <input
                    type="number"
                    value={editingEntry.displayOrder}
                    onChange={(e) =>
                      setEditingEntry({
                        ...editingEntry,
                        displayOrder: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingEntry.isPublished !== false}
                      onChange={(e) =>
                        setEditingEntry({
                          ...editingEntry,
                          isPublished: e.target.checked,
                        })
                      }
                      className="accent-[#8F3025]"
                    />
                    <span className="text-zinc-300">Published</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingEntry(null)}
                  className="px-4 py-2 border border-white/20 text-zinc-400 hover:text-white rounded-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !isDevelopment}
                  className="px-4 py-2 bg-[#8F3025] hover:bg-[#5C211C] text-white font-bold rounded-xs transition-colors cursor-pointer"
                >
                  {isPending ? "Saving..." : "Update Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
