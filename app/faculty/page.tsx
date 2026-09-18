import { Metadata } from "next";
import Link from "next/link";
import { getFacultyData } from "@/lib/data/faculty.service";
import { FacultyMember } from "@/lib/data/types";
import { Mail, Award, BookOpen, ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { BackToHome } from "@/components/layout/BackToHome";

export const metadata: Metadata = {
  title: "Faculty Leadership & Academic Mentorship",
  description:
    "Academic patron, Head of Department, and faculty mentors guiding institutional ethics, scholarly inquiry, and professional journalism standards for YATHARTH '26 at Maharaja Agrasen College (University of Delhi).",
};

export default async function FacultyPage() {
  const { principal, hod, facultyMembers } = await getFacultyData();

  // Combine Department Leadership cards: HOD is always FIRST, followed by other faculty sorted by displayOrder
  const departmentFaculty: FacultyMember[] = [
    ...(hod ? [hod] : []),
    ...facultyMembers.filter((m) => m.id !== hod?.id),
  ];

  return (
    <div className="pt-24 pb-28 min-h-screen text-[var(--theme-text-primary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Large Header Entrance (Visual match to Organizing Team) */}
        <div className="border-b border-[var(--theme-border)] pb-12 pt-8 space-y-4">
          <BackToHome currentPage="Faculty" />
          <div className="text-[11px] font-mono tracking-[0.25em] text-[var(--theme-accent)] uppercase font-semibold">
            Academic Mentorship &bull; YATHARTH &apos;26
          </div>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight uppercase leading-none font-varsity">
            Faculty Leadership
          </h1>
          <p className="text-xs sm:text-sm font-mono text-[var(--theme-text-muted)] max-w-2xl leading-relaxed">
            Academic patron, Head of Department, and faculty mentors guiding institutional ethics, scholarly inquiry, and professional journalism standards at Maharaja Agrasen College (University of Delhi).
          </p>
        </div>

        {/* ═══════════════════════════════════════════════
            1. PRINCIPAL (Institutional Patron)
            ═══════════════════════════════════════════════ */}
        <section className="py-6 border-b border-[var(--theme-border)]">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.5fr] gap-10 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-24 space-y-3">
              <div className="text-[10px] font-mono tracking-[0.2em] text-[var(--theme-accent)] uppercase font-semibold flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                <span>01 / PATRON</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight font-varsity uppercase">
                Principal
              </h2>
              <p className="text-xs font-mono text-[var(--theme-text-muted)] leading-relaxed">
                Patron and institutional head directing academic integrity, campus facilities, and collegiate governance across the University of Delhi.
              </p>
              <div className="text-[11px] font-mono text-[var(--theme-text-muted)] pt-2 border-t border-[var(--theme-border)]">
                INSTITUTIONAL LEADERSHIP
              </div>
            </div>

            {/* Right Column: Featured Principal Profile */}
            <div>
              <ScrollReveal>
                {principal ? (
                  <div className="p-6 sm:p-8 bg-[var(--theme-surface)] border border-[var(--theme-border)] hover:border-[var(--theme-accent)] rounded-xs flex flex-col md:flex-row gap-6 sm:gap-8 items-start transition-all duration-300 group">
                    {principal.photoUrl && (
                      <div className="w-full sm:w-48 md:w-56 aspect-[5/6] shrink-0 overflow-hidden rounded-xs border border-[var(--theme-border)] group-hover:border-[var(--theme-accent)] bg-[var(--theme-surface-secondary)] transition-colors">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={principal.photoUrl}
                          alt={principal.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono uppercase tracking-widest text-[var(--theme-accent)] font-semibold">
                          [ PATRON &amp; PRINCIPAL ]
                        </span>
                        <span className="text-[11px] font-mono text-[var(--theme-text-muted)]">
                          {principal.institution || "Maharaja Agrasen College"}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-2xl sm:text-3xl text-[var(--theme-text-primary)] font-varsity uppercase tracking-tight group-hover:text-[var(--theme-accent)] transition-colors">
                          {principal.name}
                        </h3>
                        <p className="text-xs font-mono text-[var(--theme-text-muted)] mt-1 uppercase tracking-wider">
                          {principal.designation}
                        </p>
                      </div>

                      {principal.bio && (
                        <p className="text-xs sm:text-sm text-[var(--theme-text-muted)] leading-relaxed font-sans">
                          {principal.bio}
                        </p>
                      )}

                      {principal.email && (
                        <div className="pt-3 border-t border-[var(--theme-border)] flex items-center gap-2 text-xs font-mono text-[var(--theme-text-muted)]">
                          <Mail className="w-3.5 h-3.5 text-[var(--theme-accent)] shrink-0" />
                          <a
                            href={`mailto:${principal.email}`}
                            className="hover:text-[var(--theme-text-primary)] transition-colors truncate"
                            title={principal.email}
                          >
                            {principal.email}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center border border-dashed border-[var(--theme-border)] rounded-xs text-xs font-mono text-[var(--theme-text-muted)]">
                    Principal details will be announced shortly.
                  </div>
                )}
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            2. DEPARTMENT LEADERSHIP (Academics & Mentorship)
            ═══════════════════════════════════════════════ */}
        <section className="py-6 border-b border-[var(--theme-border)]">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.5fr] gap-10 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-24 space-y-3">
              <div className="text-[10px] font-mono tracking-[0.2em] text-[var(--theme-accent)] uppercase font-semibold flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>02 / ACADEMICS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight font-varsity uppercase">
                Department Leadership
              </h2>
              <p className="text-xs font-mono text-[var(--theme-text-muted)] leading-relaxed">
                Department of Journalism faculty steering academic curriculum, newsroom ethics, and media scholarship for collegiate journalists.
              </p>
              <div className="text-[11px] font-mono text-[var(--theme-text-muted)] pt-2 border-t border-[var(--theme-border)]">
                {departmentFaculty.length} FACULTY MEMBERS
              </div>
            </div>

            {/* Right Column: Journalism Department Roster */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--theme-border)] pb-2">
                <h3 className="text-base font-bold uppercase tracking-wider font-mono text-[var(--theme-text-primary)]">
                  Department of Journalism
                </h3>
                <span className="text-[10px] font-mono text-[var(--theme-text-muted)] uppercase">
                  {departmentFaculty.length} Faculty
                </span>
              </div>

              {departmentFaculty.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {departmentFaculty.map((member, idx) => {
                    const isHod = member.role === "HOD";
                    const badgeLabel = isHod ? "HEAD OF DEPARTMENT" : "FACULTY";

                    return (
                      <ScrollReveal key={member.id} delay={idx * 40}>
                        <div className="p-6 bg-[var(--theme-surface)] border border-[var(--theme-border)] hover:border-[var(--theme-accent)] rounded-xs flex flex-col justify-between space-y-4 transition-all duration-300 group">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-[var(--theme-border)]/60 pb-2.5">
                              <span
                                className={`text-[9px] font-mono uppercase tracking-widest font-semibold ${
                                  isHod
                                    ? "text-[var(--theme-accent)]"
                                    : "text-[var(--theme-text-muted)]"
                                }`}
                              >
                                [ {badgeLabel} ]
                              </span>
                              <span className="text-[10px] font-mono text-[var(--theme-text-muted)] truncate max-w-[150px]">
                                {member.department || "Department of Journalism"}
                              </span>
                            </div>

                            <div>
                              <h4 className="font-bold text-lg text-[var(--theme-text-primary)] leading-snug group-hover:text-[var(--theme-accent)] transition-colors">
                                {member.name}
                              </h4>
                              <p className="text-xs font-mono text-[var(--theme-text-muted)] mt-1 uppercase tracking-wider">
                                {member.designation}
                              </p>
                            </div>

                            {member.bio && (
                              <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed font-normal line-clamp-3 font-sans">
                                {member.bio}
                              </p>
                            )}
                          </div>

                          {member.email && (
                            <div className="pt-3 border-t border-[var(--theme-border)] flex items-center gap-2 text-xs font-mono text-[var(--theme-text-muted)]">
                              <Mail className="w-3.5 h-3.5 text-[var(--theme-accent)] shrink-0" />
                              <a
                                href={`mailto:${member.email}`}
                                className="hover:text-[var(--theme-text-primary)] transition-colors truncate"
                                title={member.email}
                              >
                                {member.email}
                              </a>
                            </div>
                          )}
                        </div>
                      </ScrollReveal>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-[var(--theme-border)] rounded-xs text-xs font-mono text-[var(--theme-text-muted)]">
                  Department faculty details will be announced shortly.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Discovery Cross-Link to Student Team */}
        <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)]/40 p-6 sm:p-8 rounded-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base font-bold text-[var(--theme-text-primary)] font-varsity uppercase tracking-wider">
              Student Leadership &amp; Coordinators
            </h4>
            <p className="text-xs text-[var(--theme-text-muted)]">
              Looking for student organizing heads, functional desks, and competition leads?
            </p>
          </div>
          <Link
            href="/team"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--theme-surface-secondary)] border border-[var(--theme-border)] hover:border-[var(--theme-accent)] text-xs font-mono uppercase tracking-wider text-[var(--theme-text-primary)] transition-all rounded-xs shrink-0"
          >
            <span>View Organising Team</span>
            <ArrowRight className="w-3.5 h-3.5 text-[var(--theme-accent)]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
