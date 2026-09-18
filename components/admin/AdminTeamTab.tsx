"use client";

import React, { useState, useTransition } from "react";
import {
  Users,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  X,
  Mail,
  Phone,
  Shield,
  Briefcase,
  Trophy,
  RefreshCw,
} from "lucide-react";
import {
  createFestivalTeamAction,
  updateFestivalTeamAction,
  deleteFestivalTeamAction,
  createTeamMemberAction,
  updateTeamMemberAction,
  deleteTeamMemberAction,
  addEventCoordinatorAction,
  removeEventCoordinatorAction,
} from "@/app/admin/actions";
import { FestivalTeam, TeamMember, TeamType, Event, CoordinatorRole } from "@/lib/data/types";

interface AdminTeamTabProps {
  initialTeams: FestivalTeam[];
  events: Event[];
  isDevelopment: boolean;
}

export function AdminTeamTab({ initialTeams, events, isDevelopment }: AdminTeamTabProps) {
  const [teamsList, setTeamsList] = useState<FestivalTeam[]>(initialTeams);
  const [eventsList, setEventsList] = useState<Event[]>(events);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  // ─────────────────────────────────────────────────────────────
  // Modal States
  // ─────────────────────────────────────────────────────────────
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamType, setNewTeamType] = useState<TeamType>("ORGANIZER");

  const [isCreateMemberOpen, setIsCreateMemberOpen] = useState(false);
  const [targetTeamId, setTargetTeamId] = useState<string>("");
  const [memberFormData, setMemberFormData] = useState({
    name: "",
    designation: "",
    email: "",
    phone: "",
    bio: "",
    displayOrder: 1,
    isPublished: true,
  });

  const [editingMember, setEditingMember] = useState<{
    id: string;
    teamId: string;
    name: string;
    designation: string;
    email: string;
    phone: string;
    bio: string;
    displayOrder: number;
    isPublished: boolean;
  } | null>(null);

  // Event Coordinator Assign Modal
  const [isAssignCoordOpen, setIsAssignCoordOpen] = useState(false);
  const [targetEventId, setTargetEventId] = useState<string>("");
  const [assignCoordData, setAssignCoordData] = useState({
    personName: "",
    role: "HEAD" as CoordinatorRole,
    email: "",
    phone: "",
  });

  // Split teams into Coordinators vs Functional Teams
  const coordinatorTeam = teamsList.find(
    (t) => t.teamType === "COORDINATOR" || t.id === "team-coordinators"
  );
  const functionalTeams = teamsList.filter(
    (t) => t.id !== coordinatorTeam?.id && t.teamType !== "COORDINATOR"
  );

  // ─────────────────────────────────────────────────────────────
  // Team Actions
  // ─────────────────────────────────────────────────────────────
  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    setMessage(null);
    startTransition(async () => {
      const res = await createFestivalTeamAction({
        name: newTeamName.trim(),
        teamType: newTeamType,
        displayOrder: teamsList.length + 1,
        isPublished: true,
      });

      if (res.success && res.team) {
        setTeamsList((prev) => [...prev, { ...res.team!, members: [] }]);
        setIsCreateTeamOpen(false);
        setNewTeamName("");
        setMessage({ type: "success", text: `Team "${res.team.name}" created successfully.` });
      } else {
        setMessage({ type: "error", text: res.error || "Failed to create team." });
      }
    });
  };

  const handleToggleTeamPublished = async (team: FestivalTeam) => {
    const updatedStatus = !team.isPublished;
    const res = await updateFestivalTeamAction(team.id, { isPublished: updatedStatus });
    if (res.success && res.team) {
      setTeamsList((prev) =>
        prev.map((t) => (t.id === team.id ? { ...t, isPublished: updatedStatus } : t))
      );
    }
  };

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (!confirm(`Are you sure you want to delete "${teamName}" and all its assigned members?`)) return;

    const res = await deleteFestivalTeamAction(teamId);
    if (res.success) {
      setTeamsList((prev) => prev.filter((t) => t.id !== teamId));
      setMessage({ type: "success", text: `Team "${teamName}" deleted.` });
    } else {
      alert(res.error || "Failed to delete team.");
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Member Actions
  // ─────────────────────────────────────────────────────────────
  const handleOpenAddMember = (teamId: string) => {
    const team = teamsList.find((t) => t.id === teamId);
    setTargetTeamId(teamId);
    setMemberFormData({
      name: "",
      designation: team?.teamType === "COORDINATOR" ? "Coordinator" : "Head",
      email: "",
      phone: "",
      bio: "",
      displayOrder: (team?.members?.length || 0) + 1,
      isPublished: true,
    });
    setIsCreateMemberOpen(true);
  };

  const handleCreateMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberFormData.name.trim() || !memberFormData.designation.trim()) return;

    setMessage(null);
    startTransition(async () => {
      const res = await createTeamMemberAction({
        teamId: targetTeamId,
        name: memberFormData.name.trim(),
        designation: memberFormData.designation.trim(),
        email: memberFormData.email.trim() || null,
        phone: memberFormData.phone.trim() || null,
        bio: memberFormData.bio.trim() || null,
        displayOrder: memberFormData.displayOrder,
        isPublished: memberFormData.isPublished,
      });

      if (res.success && res.member) {
        setTeamsList((prev) =>
          prev.map((t) => {
            if (t.id === targetTeamId) {
              return {
                ...t,
                members: [...(t.members || []), res.member!],
              };
            }
            return t;
          })
        );
        setIsCreateMemberOpen(false);
        setMessage({ type: "success", text: `Added "${res.member.name}" to team.` });
      } else {
        setMessage({ type: "error", text: res.error || "Failed to add member." });
      }
    });
  };

  const handleOpenEditMember = (member: TeamMember, teamId: string) => {
    setEditingMember({
      id: member.id,
      teamId: member.teamId || teamId,
      name: member.person?.name || member.name,
      designation: member.designation,
      email: member.person?.email || (member.socialLinks?.email as string) || "",
      phone: member.person?.phone || (member.socialLinks?.phone as string) || "",
      bio: member.person?.bio || member.bio || "",
      displayOrder: member.displayOrder || member.order || 1,
      isPublished: member.isPublished ?? true,
    });
  };

  const handleUpdateMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    setMessage(null);
    startTransition(async () => {
      const res = await updateTeamMemberAction(editingMember.id, {
        name: editingMember.name.trim(),
        designation: editingMember.designation.trim(),
        email: editingMember.email.trim() || null,
        phone: editingMember.phone.trim() || null,
        bio: editingMember.bio.trim() || null,
        displayOrder: editingMember.displayOrder,
        isPublished: editingMember.isPublished,
        teamId: editingMember.teamId,
      });

      if (res.success && res.member) {
        setTeamsList((prev) =>
          prev.map((t) => {
            if (t.id === editingMember.teamId) {
              return {
                ...t,
                members: (t.members || []).map((m) => (m.id === editingMember.id ? res.member! : m)),
              };
            }
            return t;
          })
        );
        setEditingMember(null);
        setMessage({ type: "success", text: `Updated "${res.member.name}".` });
      } else {
        setMessage({ type: "error", text: res.error || "Failed to update member." });
      }
    });
  };

  const handleToggleMemberPublished = async (member: TeamMember) => {
    const updatedStatus = !(member.isPublished ?? true);
    const res = await updateTeamMemberAction(member.id, { isPublished: updatedStatus });
    if (res.success && res.member) {
      setTeamsList((prev) =>
        prev.map((t) => ({
          ...t,
          members: (t.members || []).map((m) =>
            m.id === member.id ? { ...m, isPublished: updatedStatus } : m
          ),
        }))
      );
    }
  };

  const handleDeleteMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove "${memberName}"?`)) return;

    const res = await deleteTeamMemberAction(memberId);
    if (res.success) {
      setTeamsList((prev) =>
        prev.map((t) => ({
          ...t,
          members: (t.members || []).filter((m) => m.id !== memberId),
        }))
      );
      setMessage({ type: "success", text: `Removed "${memberName}".` });
    } else {
      alert(res.error || "Failed to remove member.");
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Event Coordinator Handlers
  // ─────────────────────────────────────────────────────────────
  const handleOpenAssignCoord = (eventId: string) => {
    setTargetEventId(eventId);
    setAssignCoordData({
      personName: "",
      role: "HEAD",
      email: "",
      phone: "",
    });
    setIsAssignCoordOpen(true);
  };

  const handleAssignCoordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignCoordData.personName.trim()) return;

    setMessage(null);
    startTransition(async () => {
      const res = await addEventCoordinatorAction(targetEventId, {
        name: assignCoordData.personName.trim(),
        role: assignCoordData.role,
        email: assignCoordData.email.trim() || undefined,
        phone: assignCoordData.phone.trim() || undefined,
      });

      if (res.success && res.coordinator) {
        setEventsList((prev) =>
          prev.map((ev) => {
            if (ev.id === targetEventId) {
              const currentCoords = ev.coordinators || [];
              return {
                ...ev,
                coordinators: [...currentCoords, res.coordinator!],
              };
            }
            return ev;
          })
        );
        setIsAssignCoordOpen(false);
        setMessage({
          type: "success",
          text: `Assigned "${assignCoordData.personName}" as event ${assignCoordData.role.toLowerCase()}.`,
        });
      } else {
        setMessage({ type: "error", text: res.error || "Failed to assign coordinator." });
      }
    });
  };

  const handleRemoveCoordinator = async (eventId: string, coordinatorId: string, name: string) => {
    if (!confirm(`Remove "${name}" from this event?`)) return;

    const res = await removeEventCoordinatorAction(coordinatorId);
    if (res.success) {
      setEventsList((prev) =>
        prev.map((ev) => {
          if (ev.id === eventId) {
            return {
              ...ev,
              coordinators: (ev.coordinators || []).filter((c) => c.id !== coordinatorId),
            };
          }
          return ev;
        })
      );
      setMessage({ type: "success", text: `Removed "${name}" from event.` });
    } else {
      alert(res.error || "Failed to remove event coordinator.");
    }
  };

  return (
    <div className="space-y-12 max-w-6xl">
      {/* Header */}
      <div className="border-b border-white/[0.08] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-[#8F3025]" />
            <span>Organising Team &amp; Leadership</span>
          </h2>
          <p className="text-xs text-[#77716A] mt-1">
            Manage the three structural tiers: Secretariat Coordinators, Departmental Team Heads, and Competition Event Heads.
          </p>
        </div>

        <button
          type="button"
          disabled={!isDevelopment}
          onClick={() => setIsCreateTeamOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-mono uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Functional Team</span>
        </button>
      </div>

      {/* Status Feedback */}
      {message && (
        <div
          className={`p-4 border rounded-xs flex items-center gap-3 text-xs ${
            message.type === "success"
              ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300"
              : "border-[#8F3025]/50 bg-[#8F3025]/15 text-rose-300"
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

      {/* ═══════════════════════════════════════════════
          TIER 1: COORDINATORS (Secretariat)
          ═══════════════════════════════════════════════ */}
      <div className="p-6 bg-[#121110] border border-white/[0.08] rounded-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#8F3025]/10 border border-[#8F3025]/30 rounded-xs text-[#8F3025]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white uppercase tracking-wider">
                  Tier 1: Coordinators (Secretariat)
                </h3>
                <span className="px-2 py-0.5 bg-white/10 text-[10px] font-mono uppercase text-zinc-300 rounded-xs">
                  {coordinatorTeam?.members?.length || 0} Members
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Central festival governance (Overall Coordinator, Joint Coordinator, Secretary).
              </p>
            </div>
          </div>

          {coordinatorTeam && (
            <button
              type="button"
              disabled={!isDevelopment}
              onClick={() => handleOpenAddMember(coordinatorTeam.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#8F3025] hover:bg-[#A3382D] text-white text-xs font-mono uppercase tracking-wider rounded-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Coordinator</span>
            </button>
          )}
        </div>

        {/* Coordinators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {coordinatorTeam?.members && coordinatorTeam.members.length > 0 ? (
            coordinatorTeam.members.map((member) => {
              const person = member.person;
              const name = person?.name || member.name;
              const email = person?.email || (member.socialLinks?.email as string);
              const phone = person?.phone || (member.socialLinks?.phone as string);
              const isPub = member.isPublished ?? true;

              return (
                <div
                  key={member.id}
                  className={`p-4 bg-black/50 border rounded-xs flex flex-col justify-between space-y-4 transition-all ${
                    isPub ? "border-white/10" : "border-white/5 opacity-60"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#8F3025] font-semibold">
                        [ SECRETARIAT ]
                      </span>
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

                    <h4 className="text-sm font-bold text-white">{name}</h4>
                    <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                      {member.designation}
                    </p>

                    {(person?.bio || member.bio) && (
                      <p className="text-[11px] text-zinc-500 leading-relaxed font-sans line-clamp-2">
                        {person?.bio || member.bio}
                      </p>
                    )}

                    {(email || phone) && (
                      <div className="pt-2 border-t border-white/5 space-y-1 text-[11px] font-mono text-zinc-400">
                        {email && (
                          <div className="flex items-center gap-1.5 truncate">
                            <Mail className="w-3 h-3 text-zinc-500 shrink-0" />
                            <span className="truncate">{email}</span>
                          </div>
                        )}
                        {phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-zinc-500 shrink-0" />
                            <span>{phone}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      disabled={!isDevelopment}
                      onClick={() => handleToggleMemberPublished(member)}
                      className="p-1.5 text-zinc-400 hover:text-white cursor-pointer"
                      title={isPub ? "Hide from public site" : "Make visible"}
                    >
                      {isPub ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={!isDevelopment}
                        onClick={() => handleOpenEditMember(member, coordinatorTeam.id)}
                        className="p-1.5 text-zinc-400 hover:text-white cursor-pointer"
                        title="Edit Coordinator"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={!isDevelopment}
                        onClick={() => handleDeleteMember(member.id, name)}
                        className="p-1.5 text-rose-400/80 hover:text-rose-300 cursor-pointer"
                        title="Delete Coordinator"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-3 p-6 text-center text-xs font-mono text-zinc-500 border border-dashed border-white/10 rounded-xs">
              No coordinators defined. Click &quot;Add Coordinator&quot; above to add Secretariat leadership.
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          TIER 2: TEAM HEADS (Functional Departmental Teams)
          ═══════════════════════════════════════════════ */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/[0.08] pb-4">
          <div className="p-2 bg-white/5 border border-white/10 rounded-xs text-zinc-300">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Tier 2: Team Heads (Functional Teams)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Grouped by department (Tech, Decor, Social Media, Design, Video Editing, Logistics). Each team typically has 2 heads.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {functionalTeams.map((team) => (
            <div
              key={team.id}
              className={`p-6 bg-[#121110] border rounded-xs space-y-5 flex flex-col justify-between ${
                team.isPublished ? "border-white/[0.08]" : "border-white/5 opacity-60"
              }`}
            >
              {/* Team Card Header */}
              <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-white tracking-tight">{team.name}</h4>
                    <span
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-xs ${
                        team.isPublished
                          ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {team.isPublished ? "Published" : "Hidden"}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mt-0.5">
                    {team.members?.length || 0} Heads Assigned
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={!isDevelopment}
                    onClick={() => handleToggleTeamPublished(team)}
                    className="p-1.5 text-zinc-400 hover:text-white cursor-pointer"
                    title={team.isPublished ? "Hide team" : "Publish team"}
                  >
                    {team.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    disabled={!isDevelopment}
                    onClick={() => handleDeleteTeam(team.id, team.name)}
                    className="p-1.5 text-rose-400/80 hover:text-rose-300 cursor-pointer"
                    title="Delete Team"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Members of this team */}
              <div className="space-y-3">
                {team.members && team.members.length > 0 ? (
                  team.members.map((member) => {
                    const person = member.person;
                    const name = person?.name || member.name;
                    const email = person?.email || (member.socialLinks?.email as string);
                    const isPub = member.isPublished ?? true;

                    return (
                      <div
                        key={member.id}
                        className={`p-3 bg-black/40 border rounded-xs flex items-center justify-between gap-3 ${
                          isPub ? "border-white/10" : "border-white/5 opacity-50"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white truncate">{name}</span>
                            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                              ({member.designation})
                            </span>
                          </div>
                          {email && (
                            <span className="text-[10px] font-mono text-zinc-500 truncate block mt-0.5">
                              {email}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={!isDevelopment}
                            onClick={() => handleToggleMemberPublished(member)}
                            className="p-1 text-zinc-400 hover:text-white cursor-pointer"
                            title={isPub ? "Hide head" : "Show head"}
                          >
                            {isPub ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          </button>
                          <button
                            type="button"
                            disabled={!isDevelopment}
                            onClick={() => handleOpenEditMember(member, team.id)}
                            className="p-1 text-zinc-400 hover:text-white cursor-pointer"
                            title="Edit Head"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={!isDevelopment}
                            onClick={() => handleDeleteMember(member.id, name)}
                            className="p-1 text-rose-400/80 hover:text-rose-300 cursor-pointer"
                            title="Remove Head"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-xs font-mono text-zinc-600 border border-dashed border-white/5 rounded-xs">
                    No heads assigned to this team yet.
                  </div>
                )}
              </div>

              {/* Add Head Button */}
              <button
                type="button"
                disabled={!isDevelopment}
                onClick={() => handleOpenAddMember(team.id)}
                className="w-full py-2 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-mono uppercase tracking-wider rounded-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Head to {team.name}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          TIER 3: EVENT HEADS (Assigned per Competition)
          ═══════════════════════════════════════════════ */}
      <div className="p-6 bg-[#121110] border border-white/[0.08] rounded-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
          <div className="p-2 bg-white/5 border border-white/10 rounded-xs text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Tier 3: Event Heads (Competition Desks)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Assigned to specific competitions (2 heads per competition). Visible on event detail pages and the team directory.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {eventsList.map((ev) => {
            const coords = ev.coordinators || [];

            return (
              <div
                key={ev.id}
                className="p-5 bg-black/40 border border-white/10 rounded-xs space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 border-b border-white/5 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-tight">{ev.title}</h4>
                      <span className="text-[10px] font-mono text-[#8F3025] uppercase tracking-wider block mt-0.5">
                        {ev.category}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 bg-white/5 px-2 py-0.5 rounded-xs">
                      {coords.length} Heads
                    </span>
                  </div>

                  <div className="space-y-2 mt-3">
                    {coords.length > 0 ? (
                      coords.map((coord) => {
                        const person = coord.person;
                        const name = person?.name || "Event Lead";
                        const roleLabel = coord.role === "HEAD" ? "Head" : "Co-Head";

                        return (
                          <div
                            key={coord.id}
                            className="p-2.5 bg-black/60 border border-white/5 rounded-xs flex items-center justify-between gap-2"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-white">{name}</span>
                                <span className="text-[10px] font-mono text-zinc-400 uppercase">
                                  [{roleLabel}]
                                </span>
                              </div>
                              {person?.email && (
                                <span className="text-[10px] font-mono text-zinc-500 block">
                                  {person.email}
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              disabled={!isDevelopment}
                              onClick={() => handleRemoveCoordinator(ev.id, coord.id, name)}
                              className="p-1 text-rose-400/70 hover:text-rose-300 cursor-pointer"
                              title="Remove Coordinator"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-3 text-center text-xs font-mono text-zinc-600 border border-dashed border-white/5 rounded-xs">
                        No heads assigned to this competition.
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!isDevelopment}
                  onClick={() => handleOpenAssignCoord(ev.id)}
                  className="w-full py-2 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-mono uppercase tracking-wider rounded-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3 h-3" />
                  <span>Assign Head / Co-Head</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          MODAL: CREATE NEW TEAM
          ═══════════════════════════════════════════════ */}
      {isCreateTeamOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121110] border border-white/20 rounded-xs max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white uppercase tracking-tight">
                Create Functional Team
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateTeamOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTeamSubmit} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Team Name *</label>
                <input
                  type="text"
                  required
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g. Stage Management Team"
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Team Type</label>
                <select
                  value={newTeamType}
                  onChange={(e) => setNewTeamType(e.target.value as TeamType)}
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                >
                  <option value="ORGANIZER">ORGANIZER (Functional Team)</option>
                  <option value="COORDINATOR">COORDINATOR (Secretariat)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateTeamOpen(false)}
                  className="px-4 py-2 border border-white/20 text-zinc-400 hover:text-white rounded-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors rounded-xs cursor-pointer flex items-center gap-1.5"
                >
                  {isPending ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
                  <span>Create Team</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          MODAL: CREATE TEAM MEMBER
          ═══════════════════════════════════════════════ */}
      {isCreateMemberOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121110] border border-white/20 rounded-xs max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white uppercase tracking-tight">
                Add Team Member
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateMemberOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMemberSubmit} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Full Name *</label>
                <input
                  type="text"
                  required
                  value={memberFormData.name}
                  onChange={(e) => setMemberFormData({ ...memberFormData, name: e.target.value })}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Designation / Role *</label>
                <input
                  type="text"
                  required
                  value={memberFormData.designation}
                  onChange={(e) =>
                    setMemberFormData({ ...memberFormData, designation: e.target.value })
                  }
                  placeholder="e.g. Head, Co-Head, Overall Coordinator"
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Email</label>
                  <input
                    type="email"
                    value={memberFormData.email}
                    onChange={(e) => setMemberFormData({ ...memberFormData, email: e.target.value })}
                    placeholder="email@yatharthdu.org"
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Phone</label>
                  <input
                    type="text"
                    value={memberFormData.phone}
                    onChange={(e) => setMemberFormData({ ...memberFormData, phone: e.target.value })}
                    placeholder="+91 98112 34567"
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Bio / Responsibility</label>
                <textarea
                  rows={2}
                  value={memberFormData.bio}
                  onChange={(e) => setMemberFormData({ ...memberFormData, bio: e.target.value })}
                  placeholder="Short role description..."
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none font-sans"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={memberFormData.isPublished}
                    onChange={(e) =>
                      setMemberFormData({ ...memberFormData, isPublished: e.target.checked })
                    }
                    className="accent-[#8F3025]"
                  />
                  <span className="text-zinc-300">Visible on Site</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateMemberOpen(false)}
                    className="px-4 py-2 border border-white/20 text-zinc-400 hover:text-white rounded-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-5 py-2 bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors rounded-xs cursor-pointer flex items-center gap-1.5"
                  >
                    {isPending ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
                    <span>Add Member</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          MODAL: EDIT TEAM MEMBER
          ═══════════════════════════════════════════════ */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121110] border border-white/20 rounded-xs max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white uppercase tracking-tight">
                Edit Member: {editingMember.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateMemberSubmit} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Designation / Role *</label>
                <input
                  type="text"
                  required
                  value={editingMember.designation}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, designation: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Email</label>
                  <input
                    type="email"
                    value={editingMember.email}
                    onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Phone</label>
                  <input
                    type="text"
                    value={editingMember.phone}
                    onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Bio / Responsibility</label>
                <textarea
                  rows={2}
                  value={editingMember.bio}
                  onChange={(e) => setEditingMember({ ...editingMember, bio: e.target.value })}
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none font-sans"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingMember.isPublished}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, isPublished: e.target.checked })
                    }
                    className="accent-[#8F3025]"
                  />
                  <span className="text-zinc-300">Visible on Site</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingMember(null)}
                    className="px-4 py-2 border border-white/20 text-zinc-400 hover:text-white rounded-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-5 py-2 bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors rounded-xs cursor-pointer flex items-center gap-1.5"
                  >
                    {isPending ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          MODAL: ASSIGN EVENT COORDINATOR
          ═══════════════════════════════════════════════ */}
      {isAssignCoordOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121110] border border-white/20 rounded-xs max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white uppercase tracking-tight">
                Assign Competition Head
              </h3>
              <button
                type="button"
                onClick={() => setIsAssignCoordOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignCoordSubmit} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Person Name *</label>
                <input
                  type="text"
                  required
                  value={assignCoordData.personName}
                  onChange={(e) =>
                    setAssignCoordData({ ...assignCoordData, personName: e.target.value })
                  }
                  placeholder="e.g. Kabir Sengupta"
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 uppercase">Role</label>
                <select
                  value={assignCoordData.role}
                  onChange={(e) =>
                    setAssignCoordData({
                      ...assignCoordData,
                      role: e.target.value as CoordinatorRole,
                    })
                  }
                  className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                >
                  <option value="HEAD">HEAD</option>
                  <option value="CO_HEAD">CO_HEAD</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Contact Email</label>
                  <input
                    type="email"
                    value={assignCoordData.email}
                    onChange={(e) =>
                      setAssignCoordData({ ...assignCoordData, email: e.target.value })
                    }
                    placeholder="email@domain.com"
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 uppercase">Contact Phone</label>
                  <input
                    type="text"
                    value={assignCoordData.phone}
                    onChange={(e) =>
                      setAssignCoordData({ ...assignCoordData, phone: e.target.value })
                    }
                    placeholder="+91 99988 77665"
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 text-white rounded-xs focus:border-[#8F3025] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAssignCoordOpen(false)}
                  className="px-4 py-2 border border-white/20 text-zinc-400 hover:text-white rounded-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors rounded-xs cursor-pointer flex items-center gap-1.5"
                >
                  {isPending ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
                  <span>Assign</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
