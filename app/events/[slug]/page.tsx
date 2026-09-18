import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getEventBySlug, getEvents } from "@/lib/data/event.service";
import { getScheduleEntries } from "@/lib/data/schedule.service";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { BackToHome } from "@/components/layout/BackToHome";
import {
  Award,
  Calendar,
  Clock,
  Building,
  ShieldAlert,
  ExternalLink,
  Phone,
  Mail,
  CheckCircle2,
} from "lucide-react";

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const events = await getEvents();
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: EventDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    return { title: "Event Not Found" };
  }

  return {
    title: `${event.title} | Rules & Registration`,
    description: event.shortDescription,
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const [event, allSchedule] = await Promise.all([
    getEventBySlug(slug),
    getScheduleEntries(),
  ]);

  if (!event) {
    notFound();
  }

  const eventSchedule = allSchedule.find((s) => s.eventId === event.id);
  const coordinators = event.coordinators || event.heads || [];

  return (
    <div className="pt-28 sm:pt-36 pb-28 min-h-screen text-[var(--theme-text-primary)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between border-b border-[var(--theme-border)] pb-4">
          <BackToHome
            parentHref="/events"
            parentLabel="Events"
            currentPage={event.title}
            className="mb-0"
          />

          <span className="text-[10px] font-mono text-[var(--theme-accent)] uppercase tracking-widest font-semibold">
            {event.category}
          </span>
        </div>

        {/* ═══════════════════════════════════════════════
            1. LARGE EVENT POSTER
            ═══════════════════════════════════════════════ */}
        <div className="w-full">
          <div className="aspect-[3/4] max-h-[75vh] mx-auto rounded-sm bg-[var(--theme-surface)] border border-[var(--theme-border)] relative overflow-hidden flex flex-col justify-between shadow-2xl">
            {event.posterUrl ? (
              <Image
                src={event.posterUrl}
                alt={event.title}
                fill
                priority
                sizes="(max-width: 896px) 100vw, 896px"
                className="object-cover object-center"
              />
            ) : (
              <div className="w-full h-full flex flex-col justify-between p-8 sm:p-12 bg-gradient-to-br from-[var(--theme-surface)] to-[var(--theme-surface-secondary)]">
                {/* Top metadata tags */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono tracking-[0.2em] text-[var(--theme-accent)] uppercase font-semibold">
                    Official Competition Poster
                  </span>
                  <span
                    className={`text-[9px] font-mono uppercase font-bold px-2.5 py-1 rounded-xs border ${
                      event.registrationStatus === "OPEN"
                        ? "text-white border-[var(--theme-accent)] bg-[var(--theme-accent)]"
                        : "text-[var(--theme-text-muted)] border-[var(--theme-border)]"
                    }`}
                  >
                    {event.registrationStatus.replace("_", " ")}
                  </span>
                </div>

                {/* Poster Graphic Identity */}
                <div className="my-auto flex flex-col items-center text-center py-10">
                  <div className="text-xs font-mono uppercase tracking-[0.3em] text-[var(--theme-accent)] mb-2 font-bold">
                    YATHARTH &apos;26 &bull; {event.category}
                  </div>
                  <h2 className="text-3xl sm:text-5xl font-black text-[var(--theme-text-primary)] font-varsity tracking-tight max-w-xl leading-tight uppercase">
                    {event.title}
                  </h2>
                </div>

                {/* Bottom poster credits */}
                <div className="flex items-center justify-between text-xs font-mono text-[var(--theme-text-muted)] border-t border-[var(--theme-border)] pt-4">
                  <span>
                    {event.participationType}{" "}
                    {event.teamSizeLimit ? `(MAX ${event.teamSizeLimit})` : ""}
                  </span>
                  <span>DEPARTMENT OF JOURNALISM &bull; MAC DU</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            2. EVENT NAME & SYNOPSIS
            ═══════════════════════════════════════════════ */}
        <ScrollReveal>
          <div className="space-y-4 border-b border-[var(--theme-border)] pb-10">
            <div className="text-[11px] font-mono tracking-[0.25em] text-[var(--theme-accent)] uppercase font-bold">
              Event Overview
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-[var(--theme-text-primary)] tracking-tight font-varsity uppercase">
              {event.title}
            </h1>
            <p className="text-base sm:text-lg text-[var(--theme-text-secondary)] leading-relaxed font-normal">
              {event.shortDescription}
            </p>
          </div>
        </ScrollReveal>

        {/* ═══════════════════════════════════════════════
            3. FULL EVENT DETAILS
            ═══════════════════════════════════════════════ */}
        <ScrollReveal>
          <div className="space-y-4 border-b border-[var(--theme-border)] pb-10">
            <div className="text-[11px] font-mono tracking-[0.25em] text-[var(--theme-accent)] uppercase font-bold">
              Full Event Details
            </div>
            <div className="text-sm sm:text-base text-[var(--theme-text-secondary)] leading-relaxed space-y-4">
              <p>{event.fullDescription}</p>
              {event.eligibility && (
                <div className="pt-2 text-xs font-mono text-[var(--theme-text-muted)]">
                  <span className="text-[var(--theme-text-primary)] uppercase font-bold">
                    Eligibility:
                  </span>{" "}
                  {event.eligibility}
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* ═══════════════════════════════════════════════
            4. EVENT INFORMATION: VENUE & PRIZES
            ═══════════════════════════════════════════════ */}
        <ScrollReveal>
          <div className="space-y-6 border-b border-[var(--theme-border)] pb-10">
            <div className="text-[11px] font-mono tracking-[0.25em] text-[var(--theme-accent)] uppercase font-bold">
              Logistics &amp; Awards
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date & Time if scheduled */}
              {eventSchedule && (
                <div className="p-6 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-sm space-y-3">
                  <div className="flex items-center gap-2 text-[var(--theme-accent)] font-mono text-xs uppercase tracking-wider font-semibold">
                    <Clock className="w-4 h-4" />
                    <span>Date &amp; Slot</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-[var(--theme-text-primary)] text-sm">
                      Day {String(eventSchedule.dayNumber).padStart(2, "0")}
                      {eventSchedule.calendarDate
                        ? ` • ${new Date(eventSchedule.calendarDate).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}`
                        : ""}
                    </div>
                    <div className="text-[var(--theme-text-muted)] font-mono">
                      {eventSchedule.startTime} &ndash; {eventSchedule.endTime}
                    </div>
                  </div>
                </div>
              )}

              {/* Venue */}
              {event.venue && (
                <div className="p-6 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-sm space-y-3">
                  <div className="flex items-center gap-2 text-[var(--theme-text-muted)] font-mono text-xs uppercase tracking-wider">
                    <Building className="w-4 h-4 text-[var(--theme-text-muted)]" />
                    <span>Venue Details</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-[var(--theme-text-primary)] text-sm">
                      {event.venue.name}
                    </div>
                    <div className="text-[var(--theme-text-muted)] font-mono">
                      {event.venue.building}{" "}
                      {event.venue.roomNumber ? `• ${event.venue.roomNumber}` : ""}
                    </div>
                    {event.venue.directions && (
                      <div className="text-[var(--theme-text-muted)] italic pt-1">
                        {event.venue.directions}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Prize Pool */}
              <div className="p-6 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-sm space-y-3">
                <div className="flex items-center gap-2 text-[var(--theme-accent)] font-mono text-xs uppercase tracking-wider font-semibold">
                  <Award className="w-4 h-4" />
                  <span>Awards &amp; Prize Pool</span>
                </div>
                <div className="space-y-2">
                  {event.prizes.map((prize, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-[var(--theme-text-secondary)] flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--theme-accent)] shrink-0 mt-0.5" />
                      <span>{prize}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ═══════════════════════════════════════════════
            5. RULES & GUIDELINES
            ═══════════════════════════════════════════════ */}
        <ScrollReveal>
          <div className="space-y-6 border-b border-[var(--theme-border)] pb-10">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-mono tracking-[0.25em] text-[var(--theme-accent)] uppercase font-bold">
                Rules &amp; Guidelines
              </div>
              <ShieldAlert className="w-4 h-4 text-[var(--theme-text-muted)]" />
            </div>

            <ol className="space-y-3 font-mono text-xs sm:text-sm text-[var(--theme-text-secondary)] leading-relaxed divide-y divide-[var(--theme-border)]">
              {event.rules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-4 pt-3 first:pt-0">
                  <span className="text-[var(--theme-text-muted)] font-bold shrink-0">
                    {String(idx + 1).padStart(2, "0")}.
                  </span>
                  <span>{rule}</span>
                </li>
              ))}
            </ol>
          </div>
        </ScrollReveal>

        {/* ═══════════════════════════════════════════════
            6. EVENT COORDINATORS & CONTACT INFORMATION
            ═══════════════════════════════════════════════ */}
        <ScrollReveal>
          <div className="space-y-6 border-b border-[var(--theme-border)] pb-10">
            <div className="text-[11px] font-mono tracking-[0.25em] text-[var(--theme-accent)] uppercase font-bold">
              Event Coordinators
            </div>

            {coordinators.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {coordinators.map((coord) => {
                  const person = coord.person;
                  const member = coord.teamMember;
                  const name =
                    person?.name ||
                    member?.name ||
                    coord.contactOverride?.split(":")[0] ||
                    "Coordinator";
                  const designation =
                    member?.designation ||
                    (coord.role === "HEAD" ? "Lead Coordinator" : "Co-Coordinator");

                  let displayPhone = person?.phone || member?.socialLinks?.phone || null;
                  const override = coord.contactOverride;
                  if (override && override.includes("+91")) {
                    const match = override.match(/\+91\s*[\d\s]+/);
                    if (match) displayPhone = match[0].trim();
                  }
                  const email = person?.email || member?.socialLinks?.email || null;

                  return (
                    <div
                      key={coord.id}
                      className="p-5 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-sm space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[var(--theme-text-primary)] text-sm">
                          {name}
                        </span>
                        <span className="text-[10px] font-mono uppercase text-[var(--theme-accent)] border border-[var(--theme-border)] px-2 py-0.5">
                          {coord.role}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--theme-text-muted)] font-mono">
                        {designation}
                      </p>

                      <div className="pt-2 border-t border-[var(--theme-border)] space-y-1.5 text-xs font-mono">
                        {displayPhone && (
                          <a
                            href={`tel:${displayPhone.replace(/\s+/g, "")}`}
                            className="flex items-center gap-2 text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5 text-[var(--theme-text-muted)]" />
                            <span>{displayPhone}</span>
                          </a>
                        )}
                        {email && (
                          <a
                            href={`mailto:${email}`}
                            className="flex items-center gap-2 text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-colors truncate"
                          >
                            <Mail className="w-3.5 h-3.5 text-[var(--theme-text-muted)]" />
                            <span className="truncate">{email}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs font-mono text-[var(--theme-text-muted)]">
                Desk coordinators will be published with the festival schedule.
              </p>
            )}
          </div>
        </ScrollReveal>

        {/* ═══════════════════════════════════════════════
            7. REGISTER CTA
            ═══════════════════════════════════════════════ */}
        <ScrollReveal>
          <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-6 bg-[var(--theme-surface)] border border-[var(--theme-border)] p-8 rounded-sm">
            <div>
              <div className="text-[11px] font-mono text-[var(--theme-accent)] uppercase tracking-widest mb-1 font-bold">
                Registration Desk
              </div>
              <h3 className="text-xl font-bold text-[var(--theme-text-primary)] font-varsity uppercase">
                Submit Your Entry
              </h3>
              <p className="text-xs text-[var(--theme-text-secondary)] mt-1 font-mono">
                {event.registrationEnabled !== false &&
                event.registrationStatus !== "NOT_AVAILABLE"
                  ? event.registrationStatus === "OPEN"
                    ? "Registrations are currently live. Fill out the official entry form."
                    : event.registrationStatus === "CLOSED"
                    ? "Registrations for this competition are currently closed."
                    : "Official registration form will be published shortly."
                  : "Direct online registration is not active for this entry."}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {event.registrationEnabled !== false &&
              event.registrationStatus !== "NOT_AVAILABLE" ? (
                event.registrationStatus === "OPEN" && event.registrationUrl ? (
                  <a
                    href={event.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-xs flex items-center gap-2"
                  >
                    <span>Register Now</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : event.registrationStatus === "CLOSED" ? (
                  <span className="text-xs font-mono text-[var(--theme-text-muted)] uppercase px-4 py-2 border border-[var(--theme-border)] bg-black/10 rounded-sm cursor-not-allowed">
                    Registration Closed
                  </span>
                ) : (
                  <span className="text-xs font-mono text-[var(--theme-text-muted)] uppercase px-4 py-2 border border-[var(--theme-border)] rounded-sm">
                    Opening Soon
                  </span>
                )
              ) : null}

              <Link href="/schedule" className="btn-ghost text-xs flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>Schedule</span>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
