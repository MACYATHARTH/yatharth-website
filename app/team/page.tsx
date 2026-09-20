import { Metadata } from "next";
import Link from "next/link";
import { getFestivalTeams } from "@/lib/data/team.service";
import { getEvents } from "@/lib/data/event.service";
import { TeamMember, EventCoordinator } from "@/lib/data/types";
import { Mail, Phone, Trophy, Users, Shield, ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { BackToHome } from "@/components/layout/BackToHome";

export const metadata: Metadata = {
  title: "Organising Secretariat & Team Leadership",
  description:
    "Meet the student coordinators, functional departmental heads, and event leads steering YATHARTH at Maharaja Agrasen College (University of Delhi).",
};

export default async function TeamPage() {
  const [teams, events] = await Promise.all([
    getFestivalTeams(),
    getEvents(),
  ]);

  // 1. Coordinators (Secretariat)
  const coordinatorsTeam = teams.find(
    (t) =>
      t.id === "team-coordinators" ||
      t.teamType === "COORDINATOR" ||
      (t.name.toLowerCase().includes("coordinator") && !t.name.toLowerCase().includes("faculty"))
  );
  const coordinators = (coordinatorsTeam?.members || []).filter(
    (m) => m.isPublished !== false
  );

  // 2. Functional Team Heads (Tech, Decor, Social Media, Design, Video Editing, Logistics, etc.)
  const functionalTeams = teams
    .filter(
      (t) =>
        t.id !== coordinatorsTeam?.id &&
        t.teamType !== "COORDINATOR" &&
        !t.name.toLowerCase().includes("faculty") &&
        t.isPublished !== false
    )
    .sort((a, b) => a.displayOrder - b.displayOrder);

  // 3. Competition Event Heads (2 heads per competition)
  const publishedEvents = events.filter((e) => e.published !== false);

  const renderMemberCard = (member: TeamMember, badgeLabel: string = "STUDENT LEAD") => {
    const person = member.person;
    const displayName = person?.name || member.name;
    const designation = member.designation;
    const bio = person?.bio || member.bio;
    const email = person?.email || (member.socialLinks?.email as string);
    const phone = person?.phone || (member.socialLinks?.phone as string);

    return (
      <div className="p-6 bg-[var(--theme-surface)] border border-[var(--theme-border)] hover:border-[var(--theme-accent)] rounded-xs flex flex-col justify-between space-y-5 transition-all duration-300 group">
        <div className="space-y-4">
          {/* Monogram Frame */}
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xs bg-[var(--theme-glass-bg)] border border-[var(--theme-border)] group-hover:border-[var(--theme-accent)] flex items-center justify-center font-mono font-bold text-sm text-[var(--theme-text-primary)] shrink-0 transition-colors">
              {displayName
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-[var(--theme-text-muted)]">
              [ {badgeLabel} ]
            </span>
          </div>

          <div>
            <h3 className="font-bold text-lg text-[var(--theme-text-primary)] leading-snug group-hover:text-[var(--theme-accent)] transition-colors">
              {displayName}
            </h3>
            <p className="text-xs font-mono text-[var(--theme-text-muted)] mt-1 uppercase tracking-wider">
              {designation}
            </p>
          </div>

          {bio && (
            <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed font-normal line-clamp-3 font-sans">
              {bio}
            </p>
          )}
        </div>

        {/* Verified Contact Details */}
        {(email || phone) && (
          <div className="pt-3 border-t border-[var(--theme-border)] flex flex-wrap items-center gap-3 text-xs font-mono text-[var(--theme-text-muted)]">
            {email && (
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-1.5 hover:text-[var(--theme-text-primary)] transition-colors"
                title={email}
              >
                <Mail className="w-3.5 h-3.5 text-[var(--theme-accent)]" />
                <span className="truncate max-w-[170px]">{email}</span>
              </a>
            )}
            {phone && (
              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="inline-flex items-center gap-1.5 hover:text-[var(--theme-text-primary)] transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[var(--theme-accent)]" />
                <span>{phone}</span>
              </a>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderCoordinatorCard = (coord: EventCoordinator) => {
    const person = coord.person;
    const displayName = person?.name || "Event Lead";
    const roleLabel = coord.role === "HEAD" ? "Head" : "Co-Head";
    const email = person?.email;
    const phone = person?.phone;

    return (
      <div className="p-4 bg-[var(--theme-surface)] border border-[var(--theme-border)] hover:border-[var(--theme-accent)] rounded-xs flex flex-col justify-between space-y-3 transition-all group">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono uppercase tracking-widest text-[var(--theme-accent)] font-semibold">
              [ {roleLabel} ]
            </span>
          </div>
          <h4 className="font-bold text-sm text-[var(--theme-text-primary)] mt-1 group-hover:text-[var(--theme-accent)] transition-colors">
            {displayName}
          </h4>
        </div>

        {(email || phone) && (
          <div className="pt-2 border-t border-[var(--theme-border)] flex flex-col gap-1 text-[11px] font-mono text-[var(--theme-text-muted)]">
            {email && (
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-1.5 hover:text-[var(--theme-text-primary)] transition-colors truncate"
              >
                <Mail className="w-3 h-3 text-[var(--theme-accent)] shrink-0" />
                <span className="truncate">{email}</span>
              </a>
            )}
            {phone && (
              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="inline-flex items-center gap-1.5 hover:text-[var(--theme-text-primary)] transition-colors"
              >
                <Phone className="w-3 h-3 text-[var(--theme-accent)] shrink-0" />
                <span>{phone}</span>
              </a>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="pt-24 pb-28 min-h-screen text-[var(--theme-text-primary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Large Header Entrance */}
        <div className="border-b border-[var(--theme-border)] pb-12 pt-8 space-y-4">
          <BackToHome currentPage="Organising Team" />
          <div className="text-[11px] font-mono tracking-[0.25em] text-[var(--theme-accent)] uppercase font-semibold">
            Festival Organisation &bull; YATHARTH
          </div>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight uppercase leading-none font-varsity">
            Organising Team
          </h1>
          <p className="text-xs sm:text-sm font-mono text-[var(--theme-text-muted)] max-w-2xl leading-relaxed">
            The student leadership and operational hierarchy steering YATHARTH: from executive secretariat coordinators to departmental functional teams and competition event heads.
          </p>
        </div>

        {/* ═══════════════════════════════════════════════
            1. COORDINATORS (Student Core Secretariat)
            ═══════════════════════════════════════════════ */}
        <section className="py-6 border-b border-[var(--theme-border)]">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.5fr] gap-10 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-24 space-y-3">
              <div className="text-[10px] font-mono tracking-[0.2em] text-[var(--theme-accent)] uppercase font-semibold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>01 / SECRETARIAT</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight font-varsity uppercase">
                Coordinators
              </h2>
              <p className="text-xs font-mono text-[var(--theme-text-muted)] leading-relaxed">
                Overall Coordinator, Joint Coordinator, and Secretary directing overall festival governance, university administration, and inter-collegiate liaison.
              </p>
              <div className="text-[11px] font-mono text-[var(--theme-text-muted)] pt-2 border-t border-[var(--theme-border)]">
                {coordinators.length} MEMBERS
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {coordinators.map((member, idx) => (
                <ScrollReveal key={member.id} delay={idx * 60}>
                  {renderMemberCard(member, "SECRETARIAT")}
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            2. TEAM HEADS (Functional Departmental Teams)
            ═══════════════════════════════════════════════ */}
        <section className="py-6 border-b border-[var(--theme-border)]">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.5fr] gap-10 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-24 space-y-3">
              <div className="text-[10px] font-mono tracking-[0.2em] text-[var(--theme-accent)] uppercase font-semibold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>02 / OPERATIONS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight font-varsity uppercase">
                Team Heads
              </h2>
              <p className="text-xs font-mono text-[var(--theme-text-muted)] leading-relaxed">
                Departmental leads executing on-ground operations: Tech, Decor, Social Media, Design, Video Editing, and Logistics.
              </p>
              <div className="text-[11px] font-mono text-[var(--theme-text-muted)] pt-2 border-t border-[var(--theme-border)]">
                {functionalTeams.length} TEAMS
              </div>
            </div>

            {/* Grouped by Team */}
            <div className="space-y-10">
              {functionalTeams.map((team, teamIdx) => {
                const heads = (team.members || []).filter((m) => m.isPublished !== false);

                return (
                  <ScrollReveal key={team.id} delay={teamIdx * 40}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-[var(--theme-border)] pb-2">
                        <h3 className="text-base font-bold uppercase tracking-wider font-mono text-[var(--theme-text-primary)]">
                          {team.name}
                        </h3>
                        <span className="text-[10px] font-mono text-[var(--theme-text-muted)] uppercase">
                          {heads.length} Heads
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {heads.map((head) => (
                          <div key={head.id}>
                            {renderMemberCard(head, team.name)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            3. EVENT HEADS (Competition Desks)
            ═══════════════════════════════════════════════ */}
        <section className="py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.5fr] gap-10 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-24 space-y-3">
              <div className="text-[10px] font-mono tracking-[0.2em] text-[var(--theme-accent)] uppercase font-semibold flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" />
                <span>03 / COMPETITIONS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight font-varsity uppercase">
                Event Heads
              </h2>
              <p className="text-xs font-mono text-[var(--theme-text-muted)] leading-relaxed">
                Desk heads and co-heads managing rulebook integrity, participant coordination, and evaluations across competitions.
              </p>
              <div className="text-[11px] font-mono text-[var(--theme-text-muted)] pt-2 border-t border-[var(--theme-border)]">
                {publishedEvents.length} COMPETITIONS
              </div>
            </div>

            <div className="space-y-8">
              {publishedEvents.map((ev, evIdx) => {
                const coords = ev.coordinators || [];

                return (
                  <ScrollReveal key={ev.id} delay={evIdx * 50}>
                    <div className="p-6 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 border-b border-[var(--theme-border)] pb-3">
                        <div>
                          <h3 className="font-bold text-lg text-[var(--theme-text-primary)] font-varsity tracking-tight">
                            {ev.title}
                          </h3>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--theme-accent)] block mt-0.5">
                            {ev.category}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-[var(--theme-text-muted)]">
                          {coords.length} Event Leads
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {coords.length > 0 ? (
                          coords.map((c) => (
                            <div key={c.id}>
                              {renderCoordinatorCard(c)}
                            </div>
                          ))
                        ) : (
                          <div className="col-span-2 text-xs font-mono text-[var(--theme-text-muted)] italic">
                            Event heads will be announced shortly.
                          </div>
                        )}
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* Discovery Cross-Link to Faculty Section */}
        <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)]/40 p-6 sm:p-8 rounded-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base font-bold text-[var(--theme-text-primary)] font-varsity uppercase tracking-wider">
              Academic Leadership &amp; Faculty Mentors
            </h4>
            <p className="text-xs text-[var(--theme-text-muted)]">
              Looking for our institutional patron, Head of Department, and faculty advisors?
            </p>
          </div>
          <Link
            href="/faculty"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--theme-surface-secondary)] border border-[var(--theme-border)] hover:border-[var(--theme-accent)] text-xs font-mono uppercase tracking-wider text-[var(--theme-text-primary)] transition-all rounded-xs shrink-0"
          >
            <span>View Faculty Leadership</span>
            <ArrowRight className="w-3.5 h-3.5 text-[var(--theme-accent)]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
