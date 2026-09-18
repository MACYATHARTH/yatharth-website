import Link from "next/link";
import { Mail, MapPin, Globe, ExternalLink } from "lucide-react";
import { InstagramIcon, YoutubeIcon, LinkedinIcon, TwitterIcon } from "@/components/icons/SocialIcons";

export function Footer({
  linktreeUrl,
  logoUrl,
}: {
  linktreeUrl?: string | null;
  logoUrl?: string | null;
}) {
  return (
    <footer className="bg-[var(--theme-surface)] text-[var(--theme-text-primary)] border-t border-[var(--theme-border)] mt-auto relative z-20 select-none">
      {/* Upper Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Column 1: Festival Identity */}
          <div className="space-y-4">
            {logoUrl ? (
              <div className="mb-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoUrl}
                  alt="YATHARTH '26"
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              </div>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="font-varsity text-2xl tracking-wider text-[var(--theme-text-primary)]">
                  YATHARTH
                </span>
                <span className="font-mono text-xs tracking-wider text-[var(--theme-accent)] font-bold uppercase">
                  &apos;26
                </span>
              </div>
            )}
            <p className="text-xs text-[var(--theme-text-muted)] leading-relaxed max-w-sm font-sans font-normal">
              The flagship annual festival organised by the Department of Journalism,
              Maharaja Agrasen College, University of Delhi. Celebrating media excellence,
              visual storytelling, and investigative rigour.
            </p>
          </div>

          {/* Column 2: Festival Directory */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-[var(--theme-accent)] font-semibold mb-4 pb-2 border-b border-[var(--theme-border)] font-mono">
              Directory
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
              <Link href="/" className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-colors">Home</Link>
              <Link href="/about" className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-colors">About</Link>
              <Link href="/events" className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-colors">Events</Link>
              <Link href="/schedule" className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-colors">Schedule</Link>
              <Link href="/announcements" className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-colors">Announcements</Link>
              <Link href="/gallery" className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-colors">Gallery</Link>
              <Link href="/sponsors" className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-colors">Sponsors</Link>
              <Link href="/team" className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-colors">Team</Link>
              <Link href="/faculty" className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-colors">Faculty</Link>
              <Link href="/contact" className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-colors">Contact</Link>
              <Link href="/events" className="text-[var(--theme-text-primary)] font-semibold hover:text-[var(--theme-accent)] transition-colors">Register &rarr;</Link>
            </div>
          </div>

          {/* Column 3: Venue & Contact */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-[var(--theme-accent)] font-semibold mb-4 pb-2 border-b border-[var(--theme-border)] font-mono">
              Location &amp; Contact
            </h3>
            <ul className="space-y-3 text-xs text-[var(--theme-text-muted)]">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[var(--theme-accent)] shrink-0 mt-0.5" aria-hidden="true" />
                <span className="leading-relaxed">
                  Department of Journalism<br />
                  Maharaja Agrasen College<br />
                  Vasundhara Enclave, Delhi – 110096
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[var(--theme-accent)] shrink-0" aria-hidden="true" />
                <a href="mailto:yatharth@mac.du.ac.in" className="hover:text-[var(--theme-text-primary)] transition-colors">
                  yatharth@mac.du.ac.in
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-[var(--theme-accent)] shrink-0" aria-hidden="true" />
                <a
                  href="http://mac.du.ac.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-[var(--theme-text-primary)] transition-colors"
                >
                  mac.du.ac.in <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Social */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-[var(--theme-accent)] font-semibold mb-4 pb-2 border-b border-[var(--theme-border)] font-mono">
              Connect
            </h3>
            <p className="text-xs text-[var(--theme-text-muted)] mb-4 leading-relaxed">
              Follow the festival for updates, highlights, and behind-the-scenes coverage.
            </p>
            <div className="flex items-center gap-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-secondary)] flex items-center justify-center text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] hover:border-[var(--theme-accent)] transition-all rounded-xs"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-secondary)] flex items-center justify-center text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] hover:border-[var(--theme-accent)] transition-all rounded-xs"
              >
                <YoutubeIcon className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-secondary)] flex items-center justify-center text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] hover:border-[var(--theme-accent)] transition-all rounded-xs"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="w-9 h-9 border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-secondary)] flex items-center justify-center text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] hover:border-[var(--theme-accent)] transition-all rounded-xs"
              >
                <TwitterIcon className="w-4 h-4" />
              </a>
            </div>

            {linktreeUrl && (
              <div className="mt-4 pt-3 border-t border-[var(--theme-border)]">
                <a
                  href={linktreeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[var(--theme-accent)]/50 bg-[var(--theme-accent)]/10 hover:bg-[var(--theme-accent)]/20 text-[var(--theme-text-primary)] text-xs font-mono uppercase tracking-wider rounded-xs transition-all"
                >
                  <span>Official Linktree</span>
                  <ExternalLink className="w-3 h-3 text-[var(--theme-accent)]" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lower Footer */}
      <div className="border-t border-[var(--theme-border)] py-5 text-xs text-[var(--theme-text-muted)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-[11px] text-[var(--theme-text-muted)]">
            &copy; {new Date().getFullYear()} YATHARTH &bull; Department of Journalism, Maharaja Agrasen College, University of Delhi.
          </p>
          <div className="flex items-center gap-4 font-mono text-[11px] text-[var(--theme-text-muted)]">
            <Link href="/about" className="hover:text-[var(--theme-text-primary)] transition-colors">About</Link>
            <span>&bull;</span>
            <Link href="/contact" className="hover:text-[var(--theme-text-primary)] transition-colors">Contact</Link>
            <span>&bull;</span>
            <Link href="/admin" className="hover:text-[var(--theme-text-primary)] transition-colors">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
