import { Metadata } from "next";
import { getActiveEdition } from "@/lib/data/edition.service";
import { getFestivalLinks } from "@/lib/data/link.service";
import { ContactPageSettings } from "@/lib/data/types";
import { BackToHome } from "@/components/layout/BackToHome";
import {
  MapPin,
  Mail,
  Phone,
  Navigation,
  Clock,
  Building,
  Users,
  ShieldCheck,
} from "lucide-react";
import {
  InstagramIcon,
  YoutubeIcon,
  LinkedinIcon,
  TwitterIcon,
} from "@/components/icons/SocialIcons";

export const metadata: Metadata = {
  title: "Contact Desk & Campus Venue Directions",
  description:
    "Official contact directory, secretariat desks, PR liaison, and transit directions for YATHARTH '26 at the Department of Journalism, Maharaja Agrasen College (University of Delhi).",
};

const DEFAULT_SETTINGS: ContactPageSettings = {
  title: "Contact & Campus Venue",
  subtitle: "Festival Secretariat & Official Inquiries",
  description:
    "Direct communications channel for collegiate delegations, participating institutions, faculty advisors, and media queries.",
  departmentName: "Department of Journalism",
  collegeName: "Maharaja Agrasen College, University of Delhi",
  address: "Vasundhara Enclave, East Delhi – 110096, India",
  officialEmail: "yatharth@mac.du.ac.in",
  epabxPhone: "+91 11 2261 0565",
  deskHours: "Monday – Saturday: 09:00 – 18:00 IST",
  transitGuide: [
    {
      id: "metro",
      title: "Delhi Metro (Blue Line)",
      description:
        "De-board at Noida Sector 15 or New Ashok Nagar (approx. 5-7 minutes by auto-rickshaw directly to the campus gate).",
    },
    {
      id: "pink-line",
      title: "Delhi Metro (Pink Line)",
      description:
        "Mayur Vihar Pocket-1 or Trilokpuri Sanjay Lake stations connect directly to campus via local feeder auto transit.",
    },
    {
      id: "railway",
      title: "Inter-State Rail & Terminal Links",
      description:
        "Anand Vihar ISBT & Railway Terminal is 7 km away. Hazrat Nizamuddin is 11 km away. Both are readily connected by taxi and direct auto services.",
    },
  ],
  contacts: [
    {
      id: "c-pr-1",
      name: "Priyanshi Patel",
      role: "Public Relations Head",
      department: "PR & Media Liaison",
      email: "pr.yatharth@mac.du.ac.in",
      phone: "+91 98112 04821",
      displayOrder: 1,
      isPrimary: true,
    },
    {
      id: "c-pr-2",
      name: "Arjun Mehta",
      role: "Alternate PR Head",
      department: "Institutional Outreach & PR",
      email: "outreach.yatharth@mac.du.ac.in",
      phone: "+91 98731 55420",
      displayOrder: 2,
      isPrimary: false,
    },
    {
      id: "c-convener",
      name: "Dr. Sanjeev Kumar",
      role: "Faculty Convener",
      department: "Department of Journalism",
      email: "skumar@mac.du.ac.in",
      phone: "+91 11 2261 0565",
      displayOrder: 3,
      isPrimary: false,
    },
  ],
};

export default async function ContactPage() {
  const [edition, links] = await Promise.all([
    getActiveEdition().catch(() => null),
    getFestivalLinks().catch(() => []),
  ]);

  const rawSettings = (edition?.themeSettings?.contactSettings as ContactPageSettings | undefined) || {};
  const settings: ContactPageSettings = {
    ...DEFAULT_SETTINGS,
    ...rawSettings,
    contacts: rawSettings.contacts?.length ? rawSettings.contacts : DEFAULT_SETTINGS.contacts,
    transitGuide: rawSettings.transitGuide?.length ? rawSettings.transitGuide : DEFAULT_SETTINGS.transitGuide,
  };

  const contactsList = (settings.contacts || [])
    .filter((c) => c.isEnabled !== false)
    .sort((a, b) => (a.displayOrder || 1) - (b.displayOrder || 1));

  return (
    <div className="pt-28 sm:pt-36 pb-20 min-h-screen text-[var(--theme-text-primary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <BackToHome currentPage="Contact" />

        {/* Header Billboard */}
        <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)]/60 backdrop-blur-md p-8 sm:p-12 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--theme-surface-secondary)] border border-[var(--theme-border)] text-[11px] font-mono uppercase tracking-wider text-[var(--theme-text-muted)]">
            <MapPin className="w-3.5 h-3.5 text-[var(--theme-accent)]" />
            <span>Campus Venue &bull; Secretariat Desks &bull; PR Liaison</span>
          </div>

          <div className="space-y-2">
            <span className="font-mono text-xs tracking-widest text-[var(--theme-accent)] uppercase block">
              {settings.subtitle || "Festival Secretariat & Official Inquiries"}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--theme-text-primary)] tracking-tight font-varsity uppercase">
              {settings.title || "Contact & Campus Venue"}
            </h1>
          </div>

          <p className="text-sm sm:text-base text-[var(--theme-text-muted)] max-w-3xl leading-relaxed">
            {settings.description ||
              "Need directions to the college studios, clarification on competition eligibility, or accredited press passes? Contact our festival coordination desks below."}
          </p>
        </div>

        {/* 2-Column Grid: Left (Secretariat & Transit), Right (Key Contacts & Help Desks) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Campus Address, Transit & Socials */}
          <div className="lg:col-span-6 space-y-8">
            {/* Campus Secretariat Box */}
            <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)]/80 backdrop-blur-md p-6 sm:p-8 space-y-5">
              <div className="border-b border-[var(--theme-border)] pb-3 flex items-baseline justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-[var(--theme-text-primary)]">
                  {settings.departmentName || "Department of Journalism"}
                </h2>
                <span className="font-mono text-[11px] uppercase text-[var(--theme-accent)] tracking-wider font-semibold">
                  [ SECRETARIAT ]
                </span>
              </div>

              <div className="space-y-4 text-xs text-[var(--theme-text-muted)] leading-relaxed">
                <div className="flex items-start gap-3">
                  <Building className="w-4 h-4 text-[var(--theme-text-muted)] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[var(--theme-text-primary)]">
                      {settings.collegeName || "Maharaja Agrasen College, University of Delhi"}
                    </strong>
                    <br />
                    {settings.address || "Vasundhara Enclave, East Delhi – 110096, India"}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[var(--theme-text-muted)] shrink-0" />
                  <span>
                    Official Desk:{" "}
                    <a
                      href={`mailto:${settings.officialEmail || "yatharth@mac.du.ac.in"}`}
                      className="text-[var(--theme-text-primary)] font-mono hover:underline"
                    >
                      {settings.officialEmail || "yatharth@mac.du.ac.in"}
                    </a>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[var(--theme-text-muted)] shrink-0" />
                  <span className="font-mono">
                    College EPABX: {settings.epabxPhone || "+91 11 2261 0565"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[var(--theme-text-muted)] shrink-0" />
                  <span>
                    Festival Control Desk: {settings.deskHours || "Monday – Saturday: 09:00 – 18:00 IST"}
                  </span>
                </div>
              </div>
            </div>

            {/* Transit & Metro Directions */}
            <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)]/80 backdrop-blur-md p-6 sm:p-8 space-y-5">
              <div className="flex items-center gap-2 border-b border-[var(--theme-border)] pb-3">
                <Navigation className="w-4 h-4 text-[var(--theme-accent)]" />
                <h3 className="text-sm font-mono uppercase tracking-wider text-[var(--theme-text-primary)]">
                  Campus Transit Guide
                </h3>
              </div>

              <ul className="space-y-4 text-xs text-[var(--theme-text-muted)] leading-relaxed">
                {(settings.transitGuide || []).map((item) => (
                  <li key={item.id} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-[var(--theme-accent)] shrink-0 mt-1.5" />
                    <div>
                      <strong className="text-[var(--theme-text-primary)] block mb-0.5">
                        {item.title}
                      </strong>
                      <span>{item.description}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Department Social Links */}
            <div className="border border-[var(--theme-border)] bg-[var(--theme-surface-secondary)]/40 p-5 flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-[var(--theme-text-muted)]">
                Official Channels:
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={links.find((l) => l.platform.toLowerCase() === "instagram")?.url || "https://instagram.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-8 h-8 border border-[var(--theme-border)] bg-[var(--theme-surface)] flex items-center justify-center text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] hover:border-[var(--theme-text-primary)]/30 transition-all"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
                <a
                  href={links.find((l) => l.platform.toLowerCase() === "youtube")?.url || "https://youtube.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-8 h-8 border border-[var(--theme-border)] bg-[var(--theme-surface)] flex items-center justify-center text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] hover:border-[var(--theme-text-primary)]/30 transition-all"
                >
                  <YoutubeIcon className="w-4 h-4" />
                </a>
                <a
                  href={links.find((l) => l.platform.toLowerCase() === "linkedin")?.url || "https://linkedin.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="w-8 h-8 border border-[var(--theme-border)] bg-[var(--theme-surface)] flex items-center justify-center text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] hover:border-[var(--theme-text-primary)]/30 transition-all"
                >
                  <LinkedinIcon className="w-4 h-4" />
                </a>
                <a
                  href={links.find((l) => l.platform.toLowerCase() === "twitter" || l.platform.toLowerCase() === "x")?.url || "https://x.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter / X"
                  className="w-8 h-8 border border-[var(--theme-border)] bg-[var(--theme-surface)] flex items-center justify-center text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] hover:border-[var(--theme-text-primary)]/30 transition-all"
                >
                  <TwitterIcon className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Key Contacts Directory (PR Leads, Convener, Support) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)]/80 backdrop-blur-md p-6 sm:p-8 space-y-6">
              <div className="border-b border-[var(--theme-border)] pb-3 flex items-baseline justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[var(--theme-accent)]" />
                  <h2 className="text-lg sm:text-xl font-bold text-[var(--theme-text-primary)]">
                    Official Contacts &amp; Help Desks
                  </h2>
                </div>
                <span className="font-mono text-[11px] uppercase text-[var(--theme-text-muted)] tracking-wider">
                  [ {contactsList.length} DIRECT CONTACTS ]
                </span>
              </div>

              <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed">
                Connect directly with designated PR heads and festival conveners for delegation registrations, rule inquiries, accommodation advice, and media press accreditation.
              </p>

              {/* Dynamic Contacts Cards */}
              {contactsList.length > 0 ? (
                <div className="space-y-4">
                  {contactsList.map((c) => (
                    <div
                      key={c.id}
                      className="p-5 border border-[var(--theme-border)] bg-[var(--theme-surface-secondary)]/40 hover:border-[var(--theme-accent)] transition-all rounded-xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-[var(--theme-text-primary)]">
                              {c.name}
                            </h3>
                            {c.isPrimary && (
                              <span className="text-[9px] font-mono uppercase px-2 py-0.5 bg-[var(--theme-accent)]/15 border border-[var(--theme-accent)]/40 text-[var(--theme-accent)] font-bold">
                                PRIMARY PR
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-mono text-[var(--theme-text-muted)] mt-0.5">
                            {c.role} {c.department ? `• ${c.department}` : ""}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-[var(--theme-border)] text-xs font-mono">
                        {c.phone && (
                          <a
                            href={`tel:${c.phone.replace(/\s+/g, "")}`}
                            className="inline-flex items-center gap-1.5 text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5 text-[var(--theme-accent)]" />
                            <span>{c.phone}</span>
                          </a>
                        )}
                        {c.email && (
                          <a
                            href={`mailto:${c.email}`}
                            className="inline-flex items-center gap-1.5 text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5 text-[var(--theme-accent)]" />
                            <span>{c.email}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-[var(--theme-border)] rounded-xs text-xs font-mono text-[var(--theme-text-muted)]">
                  Official festival contact directory will be updated shortly.
                </div>
              )}
            </div>

            {/* Outstation Delegations Box */}
            <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)]/60 backdrop-blur-md p-6 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[var(--theme-accent)]" />
                <h4 className="font-mono text-xs uppercase tracking-wider text-[var(--theme-text-primary)] font-bold">
                  College Delegations &amp; Media Credentials
                </h4>
              </div>
              <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed">
                Outstation teams arriving with equipment kits or requiring faculty verification letters are requested to reach out to the Primary PR Head at least 48 hours prior to festival commencement for security gate clearances.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

