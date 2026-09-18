import { Metadata } from "next";
import Link from "next/link";
import { getSponsors } from "@/lib/data/sponsor.service";
import { Sponsor, SponsorTier } from "@/lib/data/types";
import { Award, ExternalLink, Mail, Building, CheckCircle2, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Festival Sponsors & Media Partners",
  description:
    "Official sponsors, broadcast networks, and media publishing partners supporting YATHARTH '26. Download sponsorship prospectus and partnership tiers.",
};

const TIER_CONFIG: Record<
  SponsorTier,
  { label: string; description: string; badgeColor: string }
> = {
  TITLE: {
    label: "Title Partner",
    description: "Principal institutional partner presenting the national journalism festival.",
    badgeColor: "border-[var(--theme-border)] text-[var(--theme-text-primary)] bg-[var(--theme-surface-secondary)]",
  },
  POWERED_BY: {
    label: "Powered By",
    description: "Key technology and broadcasting infrastructure enablers.",
    badgeColor: "border-[var(--theme-border)] text-[var(--theme-text-muted)] bg-[var(--theme-surface)]/50",
  },
  ASSOCIATE: {
    label: "Associate Sponsors",
    description: "Publishing houses, media academies, and prize sponsor organizations.",
    badgeColor: "border-[var(--theme-border)] text-[var(--theme-text-muted)] bg-[var(--theme-surface)]/50",
  },
  MEDIA_PARTNER: {
    label: "Media & Broadcasting Partners",
    description: "Official news broadcast networks, press wire coverage, and digital chronicle distributors.",
    badgeColor: "border-[var(--theme-border)] text-[var(--theme-text-muted)] bg-[var(--theme-surface)]/50",
  },
};

export default async function SponsorsPage() {
  const sponsors = await getSponsors();

  const groupedSponsors: Record<SponsorTier, Sponsor[]> = {
    TITLE: sponsors.filter((s) => s.tier === "TITLE"),
    POWERED_BY: sponsors.filter((s) => s.tier === "POWERED_BY"),
    ASSOCIATE: sponsors.filter((s) => s.tier === "ASSOCIATE"),
    MEDIA_PARTNER: sponsors.filter((s) => s.tier === "MEDIA_PARTNER"),
  };

  return (
    <div className="pt-28 sm:pt-36 pb-20 min-h-screen text-[var(--theme-text-primary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header Billboard */}
        <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)]/60 backdrop-blur-md p-8 sm:p-12 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--theme-surface-secondary)] border border-[var(--theme-border)] text-[11px] font-mono uppercase tracking-wider text-[var(--theme-text-muted)]">
            <Award className="w-3.5 h-3.5 text-[var(--theme-accent)]" />
            <span>Corporate &bull; Media &bull; Academic Alliances</span>
          </div>
          <div className="space-y-2">
            <span className="font-mono text-xs tracking-widest text-[var(--theme-accent)] uppercase block">
              Partners &amp; Supporters
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--theme-text-primary)] tracking-tight font-varsity uppercase">
              Festival Patrons &amp; Partners
            </h1>
          </div>
          <p className="text-sm sm:text-base text-[var(--theme-text-muted)] max-w-3xl leading-relaxed">
            YATHARTH &apos;26 is supported by leading press organizations, national broadcast networks, and educational institutions committed to nurturing fearless and verified student journalism.
          </p>
        </div>

        {/* Tiered Showcase Sections */}
        <div className="space-y-16">
          {(Object.keys(TIER_CONFIG) as SponsorTier[]).map((tierKey, idx) => {
            const tierInfo = TIER_CONFIG[tierKey];
            const tierList = groupedSponsors[tierKey];

            if (tierList.length === 0) return null;

            return (
              <section key={tierKey} className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-[var(--theme-border)] pb-3 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[var(--theme-text-muted)] uppercase tracking-wider">
                      [ 0{idx + 1} / {tierKey} ]
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-[var(--theme-text-primary)] tracking-tight">
                      {tierInfo.label}
                    </h2>
                  </div>
                  <span className="font-mono text-xs text-[var(--theme-text-muted)]">
                    {tierInfo.description}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tierList.map((sponsor) => (
                    <div
                      key={sponsor.id}
                      className="border border-[var(--theme-border)] bg-[var(--theme-surface)]/80 backdrop-blur-md p-6 flex flex-col justify-between space-y-5"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="w-12 h-12 border border-[var(--theme-border)] bg-[var(--theme-surface-secondary)]/40 flex items-center justify-center font-mono text-lg font-bold text-[var(--theme-text-primary)]">
                            {sponsor.name.charAt(0)}
                          </div>
                          <span
                            className={`font-mono text-[10px] uppercase px-2 py-0.5 border ${tierInfo.badgeColor}`}
                          >
                            {tierInfo.label}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-[var(--theme-text-primary)]">
                          {sponsor.name}
                        </h3>

                        <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed">
                          Official {tierInfo.label} collaborating with the Department of Journalism to empower emerging investigative reporters and broadcast talents.
                        </p>
                      </div>

                      <div className="pt-4 border-t border-[var(--theme-border)] flex items-center justify-between text-xs">
                        {sponsor.websiteUrl ? (
                          <a
                            href={sponsor.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] uppercase tracking-wider transition-colors"
                          >
                            <span>Visit Portal</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="font-mono text-[11px] text-[var(--theme-text-muted)]/60 uppercase">Institutional</span>
                        )}
                        <span className="font-mono text-[10px] text-[var(--theme-text-muted)]/40 uppercase">
                          Verified
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* "Become a Sponsor" Prospectus Section */}
        <section className="border border-[var(--theme-border)] bg-[var(--theme-surface)]/80 backdrop-blur-md p-8 sm:p-12 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-8 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--theme-surface-secondary)]/40 border border-[var(--theme-border)] text-[var(--theme-text-muted)] text-xs font-mono uppercase tracking-wider">
                <Building className="w-3.5 h-3.5 text-[var(--theme-accent)]" />
                <span>Partnership Prospectus &bull; YATHARTH &apos;26</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--theme-text-primary)] tracking-tight">
                Partner With Delhi University&apos;s Flagship Journalism Festival
              </h2>
              <p className="text-xs sm:text-sm text-[var(--theme-text-muted)] leading-relaxed max-w-2xl">
                Align your brand with authentic student journalism, national media discussions, and an audience of over 1,500 aspiring reporters, anchors, documentary creators, and academicians across India.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[var(--theme-text-primary)] pt-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--theme-accent)] shrink-0" />
                  <span>On-campus brand presence &amp; mainstage branding</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--theme-accent)] shrink-0" />
                  <span>Keynote session co-branding opportunities</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--theme-accent)] shrink-0" />
                  <span>Direct recruitment &amp; media internship access</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--theme-accent)] shrink-0" />
                  <span>Digital features across circulars &amp; web portals</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 border border-[var(--theme-border)] bg-[var(--theme-surface-secondary)]/40 p-7 space-y-5 text-center">
              <h3 className="text-sm font-mono uppercase tracking-wider text-[var(--theme-text-primary)]">
                Sponsorship Secretariat
              </h3>
              <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed">
                Contact the Faculty Convenor or Student Sponsorship Lead to request the official brochure and partnership prospectus.
              </p>
              <div className="space-y-3">
                <a
                  href="mailto:convenor.yatharth@mac.du.ac.in?subject=YATHARTH%2026%20Sponsorship%20Inquiry"
                  className="w-full py-3 bg-[var(--theme-cta)] text-[var(--theme-cta-text)] hover:opacity-90 text-xs font-mono uppercase font-bold tracking-wider transition-opacity flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email Sponsorship Desk</span>
                </a>
                <Link
                  href="/contact"
                  className="w-full py-2.5 border border-white/20 bg-white/[0.02] hover:bg-white/[0.08] text-white text-xs font-mono uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                >
                  <span>Contact Committee</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
