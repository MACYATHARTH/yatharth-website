"use client";

import React, { useState, useTransition } from "react";
import {
  Layers,
  Plus,
  Edit3,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
} from "lucide-react";
import {
  createEditionAction,
  updateEditionAction,
  activateEditionAction,
  archiveEditionAction,
} from "@/app/admin/actions";
import { Edition, EditionFormData, EditionStatus } from "@/lib/data/types";
import { formatEditionBranding } from "@/lib/data/edition-branding";

interface AdminEditionTabProps {
  initialEditions?: Edition[];
  activeEdition?: Edition | null;
  onEditionChange?: (editions: Edition[]) => void;
}

export function AdminEditionTab({
  initialEditions = [],
  activeEdition: initialActive,
  onEditionChange,
}: AdminEditionTabProps) {
  const [editionsList, setEditionsList] = useState<Edition[]>(initialEditions);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewEdition, setIsNewEdition] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Activation Confirmation Modal State
  const [confirmActivationId, setConfirmActivationId] = useState<string | null>(null);

  const [formData, setFormData] = useState<EditionFormData>({
    name: "YATHARTH",
    displayLabel: "’26–27",
    startYear: 2026,
    endYear: 2027,
    code: "yatharth-26",
    status: "DRAFT" as EditionStatus,
  });

  const activeEdition = editionsList.find((e) => e.status === "ACTIVE") || initialActive || editionsList[0];
  const activeBranding = formatEditionBranding(activeEdition);

  const previewBranding = formatEditionBranding({
    name: formData.name,
    displayLabel: formData.displayLabel,
  });

  const handleOpenCreateModal = () => {
    setIsNewEdition(true);
    setEditingId(null);
    const nextStartYear = new Date().getFullYear() + 1;
    const nextEndYear = nextStartYear + 1;
    const nextStartStr = String(nextStartYear).slice(-2);
    const nextEndStr = String(nextEndYear).slice(-2);

    setFormData({
      name: "YATHARTH",
      displayLabel: `’${nextStartStr}–${nextEndStr}`,
      startYear: nextStartYear,
      endYear: nextEndYear,
      code: `yatharth-${nextStartStr}-${nextEndStr}`,
      status: "DRAFT",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (edition: Edition) => {
    setIsNewEdition(false);
    setEditingId(edition.id);
    setFormData({
      name: edition.name,
      displayLabel: edition.displayLabel || "",
      startYear: edition.startYear ?? edition.year,
      endYear: edition.endYear ?? (edition.startYear ? edition.startYear + 1 : edition.year + 1),
      code: edition.code,
      status: edition.status,
    });
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setMessage({ type: "error", text: "Edition name is required." });
      return;
    }

    startTransition(async () => {
      try {
        if (isNewEdition) {
          const res = await createEditionAction(formData);
          if (res.success && res.edition) {
            let updatedList: Edition[];
            if (res.edition.status === "ACTIVE") {
              updatedList = editionsList.map((ed) =>
                ed.status === "ACTIVE" ? { ...ed, status: "ARCHIVED" as const } : ed
              );
              updatedList.unshift(res.edition);
            } else {
              updatedList = [res.edition, ...editionsList];
            }
            setEditionsList(updatedList);
            onEditionChange?.(updatedList);
            setMessage({
              type: "success",
              text: `Created edition "${formatEditionBranding(res.edition).fullBranding}" successfully.`,
            });
            setIsModalOpen(false);
          } else {
            setMessage({ type: "error", text: res.error || "Failed to create edition." });
          }
        } else if (editingId) {
          const res = await updateEditionAction(editingId, formData);
          if (res.success && res.edition) {
            let updatedList: Edition[];
            if (res.edition.status === "ACTIVE") {
              updatedList = editionsList.map((ed) =>
                ed.id === editingId
                  ? res.edition!
                  : ed.status === "ACTIVE"
                  ? { ...ed, status: "ARCHIVED" as const }
                  : ed
              );
            } else {
              updatedList = editionsList.map((ed) => (ed.id === editingId ? res.edition! : ed));
            }
            setEditionsList(updatedList);
            onEditionChange?.(updatedList);
            setMessage({
              type: "success",
              text: `Updated edition "${formatEditionBranding(res.edition).fullBranding}" successfully.`,
            });
            setIsModalOpen(false);
          } else {
            setMessage({ type: "error", text: res.error || "Failed to update edition." });
          }
        }
      } catch (err: unknown) {
        const errText = err instanceof Error ? err.message : "Error saving edition.";
        setMessage({ type: "error", text: errText });
      }
    });
  };

  const handleActivate = (editionId: string) => {
    startTransition(async () => {
      try {
        const res = await activateEditionAction(editionId);
        if (res.success && res.edition) {
          const updatedList = editionsList.map((ed) => {
            if (ed.id === editionId) return res.edition!;
            if (ed.status === "ACTIVE") return { ...ed, status: "ARCHIVED" as const };
            return ed;
          });
          setEditionsList(updatedList);
          onEditionChange?.(updatedList);
          setConfirmActivationId(null);
          setMessage({
            type: "success",
            text: `Activated "${formatEditionBranding(res.edition).fullBranding}". Public branding updated across the website.`,
          });
        } else {
          setMessage({ type: "error", text: res.error || "Failed to activate edition." });
        }
      } catch (err: unknown) {
        const errText = err instanceof Error ? err.message : "Error activating edition.";
        setMessage({ type: "error", text: errText });
      }
    });
  };

  const handleArchive = (editionId: string) => {
    startTransition(async () => {
      try {
        const res = await archiveEditionAction(editionId);
        if (res.success && res.edition) {
          const updatedList = editionsList.map((ed) => (ed.id === editionId ? res.edition! : ed));
          setEditionsList(updatedList);
          onEditionChange?.(updatedList);
          setMessage({
            type: "success",
            text: `Archived edition "${formatEditionBranding(res.edition).fullBranding}".`,
          });
        } else {
          setMessage({ type: "error", text: res.error || "Failed to archive edition." });
        }
      } catch (err: unknown) {
        const errText = err instanceof Error ? err.message : "Error archiving edition.";
        setMessage({ type: "error", text: errText });
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* ─── Notification Alert ─── */}
      {message && (
        <div
          className={`p-4 border text-xs font-mono flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
            message.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
              : "bg-red-950/40 border-red-500/40 text-red-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-zinc-400 hover:text-white cursor-pointer"
            aria-label="Dismiss message"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─── Top Header Card ─── */}
      <div className="border border-white/[0.08] bg-[#141210] p-6 sm:p-8 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#8F3025]/10 border border-[#8F3025]/30 text-[10px] font-mono uppercase tracking-wider text-[#8F3025] font-bold">
            <Layers className="w-3.5 h-3.5" />
            <span>Edition Control CMS</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Festival Edition Management
          </h2>
          <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
            Manage annual festival cycles, configure display branding labels (e.g. &apos;26–27), and toggle the current active public edition. Future editions can be activated without altering application code.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#8F3025] hover:bg-[#A3382C] text-white text-xs font-mono uppercase tracking-wider font-bold rounded-xs transition-colors shrink-0 shadow-lg cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Edition</span>
        </button>
      </div>

      {/* ─── Active Edition Spotlight Card ─── */}
      {activeEdition && (
        <div className="border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-950/20 via-[#141210] to-[#141210] p-6 sm:p-8 rounded-xs shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-emerald-300 font-bold">
                  Current Active Public Edition
                </span>
              </div>

              <div>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-varsity uppercase">
                  {activeBranding.fullBranding}
                </h3>
                <p className="text-xs text-zinc-400 font-mono mt-1">
                  Public-facing branding is dynamically derived and rendered across all website headers, footers, ribbons, and metadata.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono text-zinc-300">
                <span className="px-2.5 py-1 bg-white/[0.04] border border-white/10 rounded-xs">
                  Name: <strong className="text-white">{activeEdition.name}</strong>
                </span>
                <span className="px-2.5 py-1 bg-white/[0.04] border border-white/10 rounded-xs">
                  Label: <strong className="text-emerald-300">{activeEdition.displayLabel || "None"}</strong>
                </span>
                <span className="px-2.5 py-1 bg-white/[0.04] border border-white/10 rounded-xs">
                  Years: <strong className="text-white">{activeEdition.startYear ?? activeEdition.year} – {activeEdition.endYear ?? "—"}</strong>
                </span>
                <span className="px-2.5 py-1 bg-white/[0.04] border border-white/10 rounded-xs">
                  Code: <strong className="text-zinc-400">{activeEdition.code}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => handleOpenEditModal(activeEdition)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-mono uppercase tracking-wider rounded-xs transition-colors cursor-pointer border border-white/20"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Active Edition</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Editions Repository Table ─── */}
      <div className="border border-white/[0.08] bg-[#141210] rounded-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-white/[0.08] flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white tracking-tight">
              All Festival Editions ({editionsList.length})
            </h3>
            <p className="text-xs text-zinc-400 font-mono">
              Historical archive and future editions configured in the database.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-black/40 text-zinc-400 uppercase tracking-wider border-b border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Full Branding / Name</th>
                <th className="py-3.5 px-4">Display Label</th>
                <th className="py-3.5 px-4">Years</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Code / Internal ID</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {editionsList.map((edition) => {
                const branding = formatEditionBranding(edition);
                const isActive = edition.status === "ACTIVE";
                const isDraft = edition.status === "DRAFT";
                const isArchived = edition.status === "ARCHIVED";

                return (
                  <tr
                    key={edition.id}
                    className={`hover:bg-white/[0.02] transition-colors ${
                      isActive ? "bg-emerald-950/10" : ""
                    }`}
                  >
                    {/* Full Branding */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-sm text-white font-sans">
                          {branding.fullBranding}
                        </span>
                        {isActive && (
                          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                            Current
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Display Label */}
                    <td className="py-4 px-4">
                      {edition.displayLabel ? (
                        <span className="text-emerald-400 font-bold">{edition.displayLabel}</span>
                      ) : (
                        <span className="text-zinc-500 italic">None</span>
                      )}
                    </td>

                    {/* Years */}
                    <td className="py-4 px-4 text-zinc-300">
                      {edition.startYear ?? edition.year}
                      {edition.endYear ? ` – ${edition.endYear}` : ""}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider border ${
                          isActive
                            ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/40"
                            : isDraft
                            ? "bg-amber-950/40 text-amber-300 border-amber-500/40"
                            : "bg-zinc-900 text-zinc-400 border-zinc-700"
                        }`}
                      >
                        {edition.status}
                      </span>
                    </td>

                    {/* Code */}
                    <td className="py-4 px-4 text-zinc-400">
                      <div className="font-mono text-[11px]">{edition.code}</div>
                      <div className="text-[10px] text-zinc-500 truncate max-w-[140px]" title={edition.id}>
                        {edition.id}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 sm:px-6 text-right space-x-2 whitespace-nowrap">
                      {!isActive && (
                        <button
                          type="button"
                          onClick={() => setConfirmActivationId(edition.id)}
                          disabled={isPending}
                          className="px-2.5 py-1 bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 rounded-xs transition-colors cursor-pointer text-[11px] font-bold uppercase disabled:opacity-50"
                        >
                          Activate
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(edition)}
                        disabled={isPending}
                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/15 rounded-xs transition-colors cursor-pointer text-[11px] disabled:opacity-50"
                      >
                        Edit
                      </button>

                      {!isActive && !isArchived && (
                        <button
                          type="button"
                          onClick={() => handleArchive(edition.id)}
                          disabled={isPending}
                          className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-amber-300 border border-white/10 rounded-xs transition-colors cursor-pointer text-[11px] disabled:opacity-50"
                        >
                          Archive
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Confirmation Modal: Activate Edition ─── */}
      {confirmActivationId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#141210] border border-white/20 p-6 rounded-xs max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 rounded-xs shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white tracking-tight">
                  Activate Festival Edition?
                </h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Activating this edition will immediately switch the public-facing branding across the entire live website. The current active edition will automatically transition to <strong>ARCHIVED</strong> status.
                </p>
              </div>
            </div>

            <div className="p-3 bg-white/[0.03] border border-white/10 rounded-xs text-xs font-mono space-y-1">
              <span className="text-zinc-400">Target Edition:</span>
              <div className="text-sm font-bold text-emerald-300">
                {
                  formatEditionBranding(
                    editionsList.find((e) => e.id === confirmActivationId)
                  ).fullBranding
                }
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmActivationId(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-mono uppercase tracking-wider rounded-xs transition-colors cursor-pointer border border-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleActivate(confirmActivationId)}
                disabled={isPending}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono uppercase tracking-wider font-bold rounded-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isPending ? "Activating..." : "Confirm & Activate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Create / Edit Edition Modal ─── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#141210] border border-white/20 p-6 sm:p-8 rounded-xs max-w-lg w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h4 className="text-lg font-bold text-white tracking-tight">
                  {isNewEdition ? "Create Festival Edition" : "Edit Festival Edition"}
                </h4>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  Configure naming and year ranges for annual festival editions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Branding Preview Box */}
            <div className="p-4 bg-black/40 border border-[#8F3025]/30 rounded-xs space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#8F3025] font-bold">
                Live Public Branding Preview
              </span>
              <div className="text-2xl font-bold font-varsity tracking-wide text-white uppercase">
                {previewBranding.fullBranding}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveForm} className="space-y-4 text-xs font-mono">
              {/* Edition Name */}
              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Edition Base Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. YATHARTH"
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none font-sans"
                />
              </div>

              {/* Display Label */}
              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">
                  Display Label (Appended to base name)
                </label>
                <input
                  type="text"
                  value={formData.displayLabel || ""}
                  onChange={(e) => setFormData({ ...formData, displayLabel: e.target.value })}
                  placeholder="e.g. ’26–27 or ’27–28"
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none font-sans"
                />
                <p className="text-[11px] text-zinc-500 font-sans">
                  Leave empty if you only want to display the base name (e.g. &quot;YATHARTH&quot;).
                </p>
              </div>

              {/* Start & End Years */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Start Year *</label>
                  <input
                    type="number"
                    required
                    min={2020}
                    max={2040}
                    value={formData.startYear ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        startYear: e.target.value ? parseInt(e.target.value, 10) : null,
                      })
                    }
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">End Year (Optional)</label>
                  <input
                    type="number"
                    min={2020}
                    max={2045}
                    value={formData.endYear ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        endYear: e.target.value ? parseInt(e.target.value, 10) : null,
                      })
                    }
                    placeholder="e.g. 2027"
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                  />
                </div>
              </div>

              {/* Unique Code Slug */}
              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Internal Code Slug *</label>
                <input
                  type="text"
                  required
                  value={formData.code || ""}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. yatharth-26 or yatharth-27-28"
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                />
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Lifecycle Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as EditionStatus })
                  }
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                >
                  <option value="DRAFT">DRAFT (Hidden, Work in Progress)</option>
                  <option value="ACTIVE">ACTIVE (Public Active Edition)</option>
                  <option value="ARCHIVED">ARCHIVED (Historical Record)</option>
                </select>
                {formData.status === "ACTIVE" && (
                  <p className="text-[11px] text-emerald-400 font-sans">
                    Setting this edition to ACTIVE will automatically archive the previous active edition upon saving.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-mono uppercase tracking-wider rounded-xs transition-colors cursor-pointer border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-[#8F3025] hover:bg-[#A3382C] text-white text-xs font-mono uppercase tracking-wider font-bold rounded-xs transition-colors cursor-pointer disabled:opacity-50 shadow-lg"
                >
                  {isPending ? "Saving..." : isNewEdition ? "Create Edition" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
