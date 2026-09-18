"use client";

import React, { useState, useTransition } from "react";
import {
  Award,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  X,
  Mail,
  BookOpen,
  Shield,
  Upload,
  RefreshCw,
  Search,
} from "lucide-react";
import {
  createFacultyMemberAction,
  updateFacultyMemberAction,
  deleteFacultyMemberAction,
  uploadAssetAction,
} from "@/app/admin/actions";
import { FacultyMember, FacultyRole } from "@/lib/data/types";

interface AdminFacultyTabProps {
  initialFaculty: FacultyMember[];
  isDevelopment: boolean;
  onFacultyChange?: (updated: FacultyMember[]) => void;
}

export function AdminFacultyTab({
  initialFaculty,
  isDevelopment,
  onFacultyChange,
}: AdminFacultyTabProps) {
  const [facultyList, setFacultyList] = useState<FacultyMember[]>(initialFaculty);
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | FacultyRole>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FacultyMember | null>(null);

  // Form states
  const [formData, setFormData] = useState<{
    name: string;
    designation: string;
    role: FacultyRole;
    photoUrl: string;
    displayOrder: number;
    isPublished: boolean;
    email: string;
    department: string;
    institution: string;
    bio: string;
  }>({
    name: "",
    designation: "",
    role: "FACULTY",
    photoUrl: "",
    displayOrder: 1,
    isPublished: true,
    email: "",
    department: "Department of Journalism",
    institution: "Maharaja Agrasen College, University of Delhi",
    bio: "",
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Notify parent if callback provided
  const updateList = (updater: (prev: FacultyMember[]) => FacultyMember[]) => {
    setFacultyList((prev) => {
      const next = updater(prev).sort((a, b) => a.displayOrder - b.displayOrder);
      if (onFacultyChange) onFacultyChange(next);
      return next;
    });
  };

  // Open Create Modal
  const handleOpenCreateModal = (suggestedRole: FacultyRole = "FACULTY") => {
    setEditingMember(null);
    setPhotoFile(null);
    setFormData({
      name: "",
      designation:
        suggestedRole === "PRINCIPAL"
          ? "Principal, Maharaja Agrasen College"
          : suggestedRole === "HOD"
          ? "Associate Professor & Head, Department of Journalism"
          : "Faculty Advisor & Assistant Professor",
      role: suggestedRole,
      photoUrl:
        suggestedRole === "PRINCIPAL"
          ? "/assets/faculty/principal.svg"
          : suggestedRole === "HOD"
          ? "/assets/faculty/hod.svg"
          : "",
      displayOrder:
        suggestedRole === "PRINCIPAL" ? 1 : suggestedRole === "HOD" ? 2 : facultyList.length + 1,
      isPublished: true,
      email: "",
      department: "Department of Journalism",
      institution: "Maharaja Agrasen College, University of Delhi",
      bio: "",
    });
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (member: FacultyMember) => {
    setEditingMember(member);
    setPhotoFile(null);
    setFormData({
      name: member.name,
      designation: member.designation,
      role: member.role,
      photoUrl: member.photoUrl || "",
      displayOrder: member.displayOrder,
      isPublished: member.isPublished,
      email: member.email || "",
      department: member.department || "Department of Journalism",
      institution: member.institution || "Maharaja Agrasen College, University of Delhi",
      bio: member.bio || "",
    });
    setIsCreateModalOpen(true);
  };

  // Handle Photo File Upload
  const handleUploadPhoto = async (file: File) => {
    if (!isDevelopment) return;
    setIsUploadingPhoto(true);
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await uploadAssetAction(data, "faculty");
      if (res.success && res.url) {
        setFormData((prev) => ({ ...prev, photoUrl: res.url! }));
        setMessage({ type: "success", text: "Photo uploaded successfully." });
      } else {
        setMessage({ type: "error", text: res.error || "Photo upload failed." });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to upload photo." });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Submit Create or Edit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setMessage(null);
    startTransition(async () => {
      // If a new photo file was picked and not yet uploaded
      let finalPhotoUrl = formData.photoUrl.trim();
      if (photoFile && isDevelopment) {
        const uploadData = new FormData();
        uploadData.append("file", photoFile);
        const uploadRes = await uploadAssetAction(uploadData, "faculty");
        if (uploadRes.success && uploadRes.url) {
          finalPhotoUrl = uploadRes.url;
        }
      }

      if (editingMember) {
        // UPDATE
        const res = await updateFacultyMemberAction(editingMember.id, {
          name: formData.name.trim(),
          designation: formData.designation.trim(),
          role: formData.role,
          photoUrl: finalPhotoUrl || null,
          displayOrder: Number(formData.displayOrder) || 0,
          isPublished: formData.isPublished,
          email: formData.email.trim() || null,
          department: formData.department.trim() || null,
          institution: formData.institution.trim() || null,
          bio: formData.bio.trim() || null,
        });

        if (res.success && res.member) {
          updateList((prev) =>
            prev.map((m) => (m.id === editingMember.id ? res.member! : m))
          );
          setMessage({ type: "success", text: `Updated ${res.member.name} successfully.` });
          setIsCreateModalOpen(false);
        } else {
          setMessage({ type: "error", text: res.error || "Failed to update faculty member." });
        }
      } else {
        // CREATE
        const res = await createFacultyMemberAction({
          name: formData.name.trim(),
          designation: formData.designation.trim(),
          role: formData.role,
          photoUrl: finalPhotoUrl || null,
          displayOrder: Number(formData.displayOrder) || 0,
          isPublished: formData.isPublished,
          email: formData.email.trim() || null,
          department: formData.department.trim() || null,
          institution: formData.institution.trim() || null,
          bio: formData.bio.trim() || null,
        });

        if (res.success && res.member) {
          updateList((prev) => [...prev, res.member!]);
          setMessage({ type: "success", text: `Added ${res.member.name} to faculty roster.` });
          setIsCreateModalOpen(false);
        } else {
          setMessage({ type: "error", text: res.error || "Failed to create faculty member." });
        }
      }
    });
  };

  // Toggle Visibility
  const handleTogglePublished = (member: FacultyMember) => {
    startTransition(async () => {
      const res = await updateFacultyMemberAction(member.id, {
        isPublished: !member.isPublished,
      });

      if (res.success && res.member) {
        updateList((prev) =>
          prev.map((m) => (m.id === member.id ? res.member! : m))
        );
        setMessage({
          type: "success",
          text: `${member.name} is now ${res.member.isPublished ? "visible" : "hidden"}.`,
        });
      } else {
        setMessage({ type: "error", text: res.error || "Failed to toggle visibility." });
      }
    });
  };

  // Delete Member
  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from the faculty roster?`)) return;

    startTransition(async () => {
      const res = await deleteFacultyMemberAction(id);
      if (res.success) {
        updateList((prev) => prev.filter((m) => m.id !== id));
        setMessage({ type: "success", text: `Removed ${name} from faculty roster.` });
      } else {
        setMessage({ type: "error", text: res.error || "Failed to delete faculty member." });
      }
    });
  };

  // Filtered members
  const filteredFaculty = facultyList.filter((m) => {
    if (categoryFilter !== "ALL" && m.role !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.designation.toLowerCase().includes(q) ||
        (m.email && m.email.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const principalCount = facultyList.filter((m) => m.role === "PRINCIPAL").length;
  const hodCount = facultyList.filter((m) => m.role === "HOD").length;
  const facultyCount = facultyList.filter((m) => m.role === "FACULTY").length;
  const publishedCount = facultyList.filter((m) => m.isPublished).length;

  return (
    <div className="space-y-8">
      {/* ─── Header & Top Actions ─── */}
      <div className="border-b border-white/[0.08] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
            <Award className="w-5 h-5 text-[#8F3025]" />
            <span>Faculty Leadership &amp; Mentorship</span>
          </h2>
          <p className="text-xs text-[#77716A] mt-1">
            Manage Institutional Patron (Principal), Departmental Leadership (HOD), and Faculty Mentors displayed on <code className="text-zinc-400">/faculty</code>.
          </p>
        </div>

        <button
          type="button"
          disabled={!isDevelopment}
          onClick={() => handleOpenCreateModal("FACULTY")}
          className="px-5 py-2.5 bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 shrink-0 rounded-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Faculty Member</span>
        </button>
      </div>

      {/* ─── Status Message Banner ─── */}
      {message && (
        <div
          className={`p-4 border rounded-xs flex items-center justify-between gap-3 text-xs ${
            message.type === "success"
              ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300"
              : "border-[#8F3025]/50 bg-[#8F3025]/15 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ─── Metric Badges & Filter Strip ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setCategoryFilter("ALL")}
          className={`p-4 bg-[#121110] border rounded-xs cursor-pointer transition-all ${
            categoryFilter === "ALL"
              ? "border-[#8F3025] bg-[#8F3025]/10"
              : "border-white/[0.08] hover:border-white/20"
          }`}
        >
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
            Total Roster
          </span>
          <span className="text-2xl font-bold text-white mt-1 block">
            {facultyList.length}
          </span>
          <span className="text-[11px] font-mono text-emerald-400 mt-0.5 block">
            {publishedCount} Published
          </span>
        </div>

        <div
          onClick={() => setCategoryFilter("PRINCIPAL")}
          className={`p-4 bg-[#121110] border rounded-xs cursor-pointer transition-all ${
            categoryFilter === "PRINCIPAL"
              ? "border-[#8F3025] bg-[#8F3025]/10"
              : "border-white/[0.08] hover:border-white/20"
          }`}
        >
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
            <Award className="w-3 h-3 text-[#8F3025]" />
            Cat 01: Patron
          </span>
          <span className="text-2xl font-bold text-white mt-1 block">
            {principalCount}
          </span>
          <span className="text-[11px] font-mono text-zinc-400 mt-0.5 block">
            Principal Leadership
          </span>
        </div>

        <div
          onClick={() => setCategoryFilter("HOD")}
          className={`p-4 bg-[#121110] border rounded-xs cursor-pointer transition-all ${
            categoryFilter === "HOD"
              ? "border-[#8F3025] bg-[#8F3025]/10"
              : "border-white/[0.08] hover:border-white/20"
          }`}
        >
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
            <BookOpen className="w-3 h-3 text-[#8F3025]" />
            Cat 02: HOD
          </span>
          <span className="text-2xl font-bold text-white mt-1 block">
            {hodCount}
          </span>
          <span className="text-[11px] font-mono text-zinc-400 mt-0.5 block">
            Departmental Lead
          </span>
        </div>

        <div
          onClick={() => setCategoryFilter("FACULTY")}
          className={`p-4 bg-[#121110] border rounded-xs cursor-pointer transition-all ${
            categoryFilter === "FACULTY"
              ? "border-[#8F3025] bg-[#8F3025]/10"
              : "border-white/[0.08] hover:border-white/20"
          }`}
        >
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-[#8F3025]" />
            Cat 03: Mentors
          </span>
          <span className="text-2xl font-bold text-white mt-1 block">
            {facultyCount}
          </span>
          <span className="text-[11px] font-mono text-zinc-400 mt-0.5 block">
            Advisors &amp; Convenors
          </span>
        </div>
      </div>

      {/* ─── Search & Category Pill Strip ─── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[#121110] border border-white/[0.08] rounded-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {(["ALL", "PRINCIPAL", "HOD", "FACULTY"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-xs cursor-pointer transition-colors whitespace-nowrap ${
                categoryFilter === cat
                  ? "bg-[#8F3025] text-white font-bold"
                  : "bg-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              {cat === "ALL"
                ? "All Faculty"
                : cat === "PRINCIPAL"
                ? "Principal"
                : cat === "HOD"
                ? "Head of Department"
                : "Faculty Mentors"}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, designation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-black/50 border border-white/10 text-white text-xs rounded-xs font-mono focus:border-[#8F3025] focus:outline-none"
          />
        </div>
      </div>

      {/* ─── Faculty Roster Cards Grid ─── */}
      <div className="space-y-4">
        {filteredFaculty.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFaculty.map((member) => {
              const isPub = member.isPublished;
              return (
                <div
                  key={member.id}
                  className={`p-6 bg-[#121110] border rounded-xs flex flex-col justify-between space-y-5 transition-all ${
                    isPub ? "border-white/[0.08] hover:border-white/20" : "border-white/5 opacity-60"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header: Avatar, Badge, Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {member.photoUrl ? (
                          <div className="w-12 h-12 rounded-xs overflow-hidden border border-white/10 bg-zinc-900 shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={member.photoUrl}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xs bg-white/5 border border-white/10 flex items-center justify-center font-mono font-bold text-sm text-zinc-300 shrink-0">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")}
                          </div>
                        )}
                        <div>
                          <span
                            className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-xs font-semibold ${
                              member.role === "PRINCIPAL"
                                ? "bg-amber-950/50 text-amber-300 border border-amber-500/20"
                                : member.role === "HOD"
                                ? "bg-cyan-950/50 text-cyan-300 border border-cyan-500/20"
                                : "bg-rose-950/40 text-rose-300 border border-rose-500/20"
                            }`}
                          >
                            [ {member.role === "PRINCIPAL"
                              ? "PATRON & PRINCIPAL"
                              : member.role === "HOD"
                              ? "HEAD OF DEPT"
                              : "FACULTY MENTOR"} ]
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500 block mt-1">
                            Order: {member.displayOrder}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-xs ${
                          isPub
                            ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {isPub ? "Visible" : "Hidden"}
                      </span>
                    </div>

                    {/* Member Details */}
                    <div>
                      <h4 className="font-bold text-base text-white tracking-tight leading-snug">
                        {member.name}
                      </h4>
                      <p className="text-xs font-mono text-[#8F3025] mt-1 uppercase tracking-wider">
                        {member.designation}
                      </p>
                      <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                        {member.department || "Department of Journalism"}
                      </p>
                    </div>

                    {member.bio && (
                      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                        {member.bio}
                      </p>
                    )}

                    {member.email && (
                      <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 pt-3 border-t border-white/[0.06] truncate">
                        <Mail className="w-3.5 h-3.5 text-[#8F3025] shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                    <button
                      type="button"
                      disabled={!isDevelopment || isPending}
                      onClick={() => handleTogglePublished(member)}
                      className="p-1.5 text-zinc-400 hover:text-white cursor-pointer transition-colors"
                      title={isPub ? "Hide from public site" : "Make visible on public site"}
                    >
                      {isPub ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={!isDevelopment || isPending}
                        onClick={() => handleOpenEditModal(member)}
                        className="p-1.5 text-zinc-400 hover:text-white cursor-pointer transition-colors"
                        title="Edit faculty member"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={!isDevelopment || isPending}
                        onClick={() => handleDelete(member.id, member.name)}
                        className="p-1.5 text-rose-400/80 hover:text-rose-300 cursor-pointer transition-colors"
                        title="Delete faculty member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center border border-dashed border-white/10 rounded-xs space-y-3">
            <Award className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-xs font-mono text-zinc-400">
              No faculty members found matching your filters.
            </p>
            <button
              type="button"
              disabled={!isDevelopment}
              onClick={() => handleOpenCreateModal("FACULTY")}
              className="px-4 py-2 bg-white/10 text-white font-mono text-xs rounded-xs hover:bg-white/20 transition-colors"
            >
              + Add First Faculty Member
            </button>
          </div>
        )}
      </div>

      {/* ─── Create / Edit Modal Dialog ─── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#171513] border border-white/15 w-full max-w-xl p-6 rounded-xs space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#8F3025]" />
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  {editingMember ? "Edit Faculty Member" : "Add Faculty Member"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
              {/* Full Name & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Prof. Sanjeev Kumar Tiwari"
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Category / Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value as FacultyRole })
                    }
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                  >
                    <option value="PRINCIPAL">Category 01 — Institutional Patron (Principal)</option>
                    <option value="HOD">Category 02 — Departmental Leadership (HOD)</option>
                    <option value="FACULTY">Category 03 — Faculty Member &amp; Mentor</option>
                  </select>
                </div>
              </div>

              {/* Designation & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-zinc-400 uppercase">Designation *</label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Principal, Maharaja Agrasen College"
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Display Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) =>
                      setFormData({ ...formData, displayOrder: Number(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                  />
                </div>
              </div>

              {/* Department & Institution */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Department of Journalism"
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Institution</label>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="Maharaja Agrasen College, University of Delhi"
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Official Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="faculty@mac.du.ac.in"
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                />
              </div>

              {/* Profile Photo: Upload & URL */}
              <div className="space-y-2 p-3 bg-black/40 border border-white/10 rounded-xs">
                <div className="flex items-center justify-between">
                  <label className="text-zinc-300 font-bold uppercase flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-[#8F3025]" />
                    Profile Photo
                  </label>
                  {formData.photoUrl && (
                    <span className="text-[10px] text-emerald-400 font-mono">Image Configured</span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {formData.photoUrl ? (
                    <div className="w-12 h-12 rounded-xs overflow-hidden border border-white/20 bg-zinc-900 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formData.photoUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xs bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 font-mono text-[10px] shrink-0">
                      No Photo
                    </div>
                  )}

                  <input
                    type="text"
                    placeholder="Photo URL (/assets/faculty/... or https://...)"
                    value={formData.photoUrl}
                    onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                    className="flex-1 px-3 py-2 bg-black/60 border border-white/15 text-white text-xs rounded-xs font-mono focus:border-[#8F3025] focus:outline-none"
                  />
                </div>

                {isDevelopment && (
                  <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <span className="text-[10px] text-zinc-500 uppercase">
                      Upload from local device (saves to /assets/faculty/):
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/svg+xml"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setPhotoFile(file);
                          handleUploadPhoto(file);
                        }
                      }}
                      className="text-[11px] text-zinc-400 file:mr-2 file:py-1 file:px-2 file:border file:border-white/20 file:bg-white/5 file:text-white rounded-xs cursor-pointer"
                    />
                  </div>
                )}
                {isUploadingPhoto && (
                  <div className="flex items-center gap-2 text-[10px] text-amber-400 font-mono">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Uploading photo...</span>
                  </div>
                )}
              </div>

              {/* Bio / Narrative */}
              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Bio / Scholarly Narrative</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Scholarly background, institutional leadership focus, and mentorship advisory details..."
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                />
              </div>

              {/* Published Toggle & Footer Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="accent-[#8F3025] w-4 h-4 cursor-pointer"
                  />
                  <span className="text-zinc-300">Visible on Public Site</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 border border-white/20 text-zinc-400 hover:text-white rounded-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending || isUploadingPhoto}
                    className="px-5 py-2 bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors rounded-xs cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    {isPending ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>{editingMember ? "Save Changes" : "Add Faculty"}</span>
                    )}
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
