import { Metadata } from "next";
import { Landmark, Award, BookOpen, Users, Compass, ShieldCheck, Feather, Sparkles } from "lucide-react";
import { getActiveEdition } from "@/lib/data/edition.service";
import { BackToHome } from "@/components/layout/BackToHome";

export const metadata: Metadata = {
  title: "About the Festival & Department Heritage",
  description:
    "Explore the history, core principles, leadership messages, and academic pedigree behind YATHARTH, hosted by the Department of Journalism at Maharaja Agrasen College, University of Delhi.",
};

export default async function AboutPage() {
  const edition = await getActiveEdition().catch(() => null);
  const themeSettings = edition?.themeSettings || {};
  const collegeName = (themeSettings.college as string) || "Maharaja Agrasen College • University of Delhi";
  const themeTitle = (themeSettings.themeTitle as string) || "Voice, Vision & Veracity";
  const aboutIntro = (themeSettings.aboutIntro as string) || "A student-led celebration of creativity, competition, and courageous storytelling.";
  const aboutParagraphs = Array.isArray(themeSettings.aboutParagraphs) && themeSettings.aboutParagraphs.length > 0
    ? (themeSettings.aboutParagraphs as string[])
    : null;
  return (
    <div className="pt-28 sm:pt-36 pb-20 text-[var(--theme-text-primary)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        <BackToHome currentPage="About" />
        {/* Section Header */}
        <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-8 sm:p-14 text-center space-y-6 relative overflow-hidden rounded-xs">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--theme-glass-bg)] border border-[var(--theme-border)] text-[11px] font-mono uppercase tracking-wider text-[var(--theme-text-muted)]">
            <Landmark className="w-3.5 h-3.5 text-[var(--theme-accent)]" />
            <span>{collegeName}</span>
          </div>

          <div className="space-y-3">
            <span className="font-mono text-xs tracking-widest text-[var(--theme-accent)] uppercase block font-bold">
              Festival Heritage
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight font-varsity uppercase">
              The Legacy of YATHARTH
            </h1>
            {themeTitle && (
              <p className="font-mono text-sm text-[var(--theme-accent)] uppercase tracking-wider">
                &ldquo;{themeTitle}&rdquo;
              </p>
            )}
          </div>

          <p className="text-sm sm:text-base text-[var(--theme-text-secondary)] max-w-2xl mx-auto font-serif italic leading-relaxed">
            &ldquo;{aboutIntro}&rdquo;
          </p>
        </div>

        {/* Section 1: Department Legacy & MAC Context */}
        <section className="space-y-8">
          <div className="flex items-baseline justify-between border-b border-[var(--theme-border)] pb-3">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight font-varsity uppercase">
              Department of Journalism
            </h2>
            <span className="font-mono text-xs text-[var(--theme-accent)] uppercase tracking-wider font-semibold">
              Institutional Roots
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-7 border border-[var(--theme-border)] bg-[var(--theme-surface)] p-6 sm:p-8 space-y-5 text-[var(--theme-text-secondary)] leading-relaxed text-sm sm:text-base rounded-xs">
              {aboutParagraphs ? (
                aboutParagraphs.map((p, idx) => (
                  <p key={idx} className={idx > 0 ? "text-[var(--theme-text-muted)] text-sm" : ""}>
                    {p}
                  </p>
                ))
              ) : (
                <>
                  <p>
                    Established under the esteemed aegis of the <strong className="text-[var(--theme-text-primary)]">University of Delhi</strong>, the <strong className="text-[var(--theme-text-primary)]">Department of Journalism at Maharaja Agrasen College</strong> stands as one of the pioneering undergraduate journalism departments in the nation. With a rigorous syllabus combining media law, investigative techniques, broadcast production, and digital documentation, the department fosters critical thinkers committed to democratic accountability.
                  </p>
                  <p className="text-[var(--theme-text-muted)] text-sm">
                    Maharaja Agrasen College is accredited with an <strong className="text-[var(--theme-text-primary)]">&apos;A+&apos; Grade by NAAC</strong>, boasting state-of-the-art media studios, high-definition broadcast audio-visual suites, newsrooms, and a vibrant community of published student reporters.
                  </p>
                </>
              )}
            </div>

            <div className="md:col-span-5 border border-[var(--theme-border)] bg-[var(--theme-surface)] p-6 space-y-5 rounded-xs">
              <h3 className="font-mono text-xs text-[var(--theme-accent)] uppercase tracking-wider border-b border-[var(--theme-border)] pb-3 font-semibold">
                Institutional Snapshot
              </h3>
              <ul className="space-y-4 text-xs text-[var(--theme-text-muted)] font-mono">
                <li className="flex items-start gap-3">
                  <Award className="w-4 h-4 text-[var(--theme-accent)] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[var(--theme-text-primary)] font-semibold block">Accreditation</span>
                    <span>NAAC &apos;A+&apos; Grade College, University of Delhi</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <BookOpen className="w-4 h-4 text-[var(--theme-accent)] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[var(--theme-text-primary)] font-semibold block">Academic Program</span>
                    <span>B.A. (Honours) Journalism (Four-Year FYUP)</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Users className="w-4 h-4 text-[var(--theme-accent)] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[var(--theme-text-primary)] font-semibold block">Alumni Network</span>
                    <span>Leading national news networks, media houses, and wire services</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Compass className="w-4 h-4 text-[var(--theme-accent)] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[var(--theme-text-primary)] font-semibold block">Campus Locale</span>
                    <span>Vasundhara Enclave, East Delhi &ndash; 110096</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 2: Leadership Addresses */}
        <section className="space-y-8">
          <div className="flex items-baseline justify-between border-b border-[var(--theme-border)] pb-3">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight font-varsity uppercase">
              Leadership Addresses
            </h2>
            <span className="font-mono text-xs text-[var(--theme-accent)] uppercase tracking-wider font-semibold">
              Messages
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Patron's Message */}
            <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-7 sm:p-8 space-y-5 rounded-xs">
              <div className="border-b border-[var(--theme-border)] pb-4">
                <span className="font-mono text-[10px] uppercase text-[var(--theme-accent)] font-semibold tracking-wider">
                  Patron&apos;s Message
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[var(--theme-text-primary)] mt-1">
                  Principal Name
                </h3>
                <p className="text-xs text-[var(--theme-text-muted)] font-mono">Principal, Maharaja Agrasen College</p>
              </div>
              <blockquote className="text-xs sm:text-sm text-[var(--theme-text-secondary)] leading-relaxed font-serif italic">
                &ldquo;YATHARTH is the signature manifestation of our department&apos;s commitment to rigorous enquiry. Journalism is not merely a profession; it is an institutional trust essential to a healthy constitutional democracy. I welcome young journalists from all colleges across India to test their skills in this premier arena.&rdquo;
              </blockquote>
            </div>

            {/* Convenor's Message */}
            <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-7 sm:p-8 space-y-5 rounded-xs">
              <div className="border-b border-[var(--theme-border)] pb-4">
                <span className="font-mono text-[10px] uppercase text-[var(--theme-accent)] font-semibold tracking-wider">
                  Convenor&apos;s Message
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[var(--theme-text-primary)] mt-1">
                  Faculty Member Name
                </h3>
                <p className="text-xs text-[var(--theme-text-muted)] font-mono">Associate Professor &amp; Faculty Convenor, YATHARTH</p>
              </div>
              <blockquote className="text-xs sm:text-sm text-[var(--theme-text-secondary)] leading-relaxed font-serif italic">
                &ldquo;Every edition of YATHARTH challenges participants to go beyond theoretical academia and enter high-pressure real-world newsroom conditions. Whether on the teleprompter or tracking grassroots stories with a camera lens, we champion the unadulterated truth.&rdquo;
              </blockquote>
            </div>
          </div>
        </section>

        {/* Section 3: The 4 Core Pillars */}
        <section className="space-y-8">
          <div className="flex items-baseline justify-between border-b border-[var(--theme-border)] pb-3">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight font-varsity uppercase">
              Foundational Principles
            </h2>
            <span className="font-mono text-xs text-[var(--theme-accent)] uppercase tracking-wider font-semibold">
              Core Pillars
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-6 space-y-4 rounded-xs">
              <div className="w-8 h-8 border border-[var(--theme-border)] bg-[var(--theme-glass-bg)] flex items-center justify-center text-[var(--theme-accent)]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[var(--theme-text-primary)] tracking-tight font-mono">01. Integrity</h3>
              <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed">
                Uncompromising fidelity to facts, ethical citation, refusal of disinformation, and transparent verification.
              </p>
            </div>

            <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-6 space-y-4 rounded-xs">
              <div className="w-8 h-8 border border-[var(--theme-border)] bg-[var(--theme-glass-bg)] flex items-center justify-center text-[var(--theme-accent)]">
                <Feather className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[var(--theme-text-primary)] tracking-tight font-mono">02. Investigative Rigour</h3>
              <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed">
                Persistent sleuthing, public record analysis, data verification, and uncovering stories essential to democracy.
              </p>
            </div>

            <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-6 space-y-4 rounded-xs">
              <div className="w-8 h-8 border border-[var(--theme-border)] bg-[var(--theme-glass-bg)] flex items-center justify-center text-[var(--theme-accent)]">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[var(--theme-text-primary)] tracking-tight font-mono">03. Media Literacy</h3>
              <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed">
                Equipping youth to deconstruct media bias, algorithmic echo chambers, and synthetic digital media.
              </p>
            </div>

            <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-6 space-y-4 rounded-xs">
              <div className="w-8 h-8 border border-[var(--theme-border)] bg-[var(--theme-glass-bg)] flex items-center justify-center text-[var(--theme-accent)]">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[var(--theme-text-primary)] tracking-tight font-mono">04. Creative Expression</h3>
              <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed">
                Mastering compelling narrative prose, visual documentaries, spot photography, and broadcast presentation.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Festival Evolution */}
        <section className="space-y-8">
          <div className="flex items-baseline justify-between border-b border-[var(--theme-border)] pb-3">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight font-varsity uppercase">
              Festival Chronology
            </h2>
            <span className="font-mono text-xs text-[var(--theme-accent)] uppercase tracking-wider font-semibold">
              Timeline
            </span>
          </div>

          <div className="border border-[var(--theme-border)] bg-[var(--theme-surface)] p-8 sm:p-10 rounded-xs">
            <div className="border-l border-[var(--theme-border)] ml-2 pl-8 space-y-8">
              <div className="relative space-y-1.5">
                <div className="absolute -left-[37px] top-1.5 w-2.5 h-2.5 bg-[var(--theme-accent)] border border-black"></div>
                <span className="text-[11px] font-mono text-[var(--theme-accent)] uppercase tracking-wider block font-bold">Edition &bull; 2026–27</span>
                <h3 className="text-base font-bold text-[var(--theme-text-primary)]">YATHARTH ’26–27: Voice, Vision &amp; Veracity</h3>
                <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed max-w-2xl font-sans">
                  Expanding national participation with dedicated broadcast studio challenges, inter-state delegations, and veteran media masterclasses.
                </p>
              </div>

              <div className="relative space-y-1.5">
                <div className="absolute -left-[37px] top-1.5 w-2.5 h-2.5 bg-zinc-600 border border-black"></div>
                <span className="text-[11px] font-mono text-[var(--theme-text-muted)] uppercase tracking-wider block">Edition &bull; 2025</span>
                <h3 className="text-base font-bold text-[var(--theme-text-primary)]">YATHARTH &apos;25: The Digital Frontier</h3>
                <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed max-w-2xl font-sans">
                  Over 45 colleges represented across Delhi NCR, featuring masterclasses by senior correspondents and documentary filmmakers.
                </p>
              </div>

              <div className="relative space-y-1.5">
                <div className="absolute -left-[37px] top-1.5 w-2.5 h-2.5 bg-zinc-600 border border-black"></div>
                <span className="text-[11px] font-mono text-[var(--theme-text-muted)] uppercase tracking-wider block">Edition &bull; Inception</span>
                <h3 className="text-base font-bold text-[var(--theme-text-primary)]">Inauguration of Annual Media Conclave</h3>
                <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed max-w-2xl font-sans">
                  Founded by the faculty and students of the Department of Journalism to create an authentic student media forum in Delhi University.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
