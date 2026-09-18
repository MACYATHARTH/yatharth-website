"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, X } from "lucide-react";
import { InstitutionalHeader } from "./InstitutionalHeader";

interface NavItem {
  number: string;
  name: string;
  href: string;
  description: string;
}

const MENU_ITEMS: NavItem[] = [
  { number: "00", name: "Home", href: "/", description: "Festival landing, countdown & highlights" },
  { number: "01", name: "Events", href: "/events", description: "Festival competitions, details & rulebooks" },
  { number: "02", name: "Schedule", href: "/schedule", description: "Programme timeline & stage itinerary" },
  { number: "03", name: "Announcements", href: "/announcements", description: "Official circulars, updates & notices" },
  { number: "04", name: "Gallery", href: "/gallery", description: "Visual memories, filmstrip & photo archive" },
  { number: "05", name: "About", href: "/about", description: "Festival ethos & leadership addresses" },
  { number: "06", name: "Faculty", href: "/faculty", description: "Academic leadership & faculty mentorship" },
  { number: "07", name: "Team", href: "/team", description: "Student coordinators & competition leads" },
  { number: "08", name: "Contact", href: "/contact", description: "Campus location, desks & enquiries" },
];

export function Navbar({ logoUrl }: { logoUrl?: string | null }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setDrawerOpen(false);
  }

  // Handle escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle scroll detection for hairline border
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [drawerOpen]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 select-none flex flex-col ${
          scrolled
            ? "bg-[var(--theme-background)]/90 backdrop-blur-md border-b border-[var(--theme-border)] shadow-lg"
            : "bg-[var(--theme-background)]/60 backdrop-blur-xs border-b border-[var(--theme-border)]/40"
        }`}
      >
        {/* Top Institutional Bar — Stacked directly above Navigation, zero collision */}
        <InstitutionalHeader />

        {/* Main Navigation Bar */}
        <div className="w-full px-4 sm:px-8 lg:px-14 h-14 sm:h-16 flex items-center justify-between">
          {/* Left: Menu Trigger & Desktop Links */}
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-colors cursor-pointer py-1 font-medium"
              aria-label="Open Navigation Menu"
            >
              <span className="w-3.5 h-0.5 bg-[var(--theme-accent)] rounded-full" />
              <span>Menu</span>
            </button>

            {/* Desktop Direct Links */}
            <nav className="hidden lg:flex items-center gap-7 text-xs uppercase tracking-[0.18em] font-medium">
              <Link
                href="/"
                className={`transition-colors ${
                  pathname === "/"
                    ? "text-[var(--theme-text-primary)] font-bold"
                    : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)]"
                }`}
              >
                Home
              </Link>
              <Link
                href="/events"
                className={`transition-colors ${
                  isActive("/events")
                    ? "text-[var(--theme-text-primary)] font-bold"
                    : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)]"
                }`}
              >
                Events
              </Link>
              <Link
                href="/schedule"
                className={`transition-colors ${
                  isActive("/schedule")
                    ? "text-[var(--theme-text-primary)] font-bold"
                    : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)]"
                }`}
              >
                Schedule
              </Link>
              <Link
                href="/announcements"
                className={`transition-colors ${
                  isActive("/announcements")
                    ? "text-[var(--theme-text-primary)] font-bold"
                    : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)]"
                }`}
              >
                Announcements
              </Link>
              <Link
                href="/gallery"
                className={`transition-colors ${
                  isActive("/gallery")
                    ? "text-[var(--theme-text-primary)] font-bold"
                    : "text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)]"
                }`}
              >
                Gallery
              </Link>
            </nav>
          </div>

          {/* Center Brand: Logo only (No redundant "YATHARTH" text in top bar) */}
          <Link
            href="/"
            className="flex items-center hover:opacity-90 transition-opacity"
            aria-label="Festival Home"
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt="Festival Logo"
                className="h-8 sm:h-9 max-w-[180px] sm:max-w-[240px] w-auto object-contain shrink-0"
              />
            ) : (
              <div className="flex items-center text-[var(--theme-text-primary)]">
                <span className="w-8 h-8 rounded-full border border-[var(--theme-accent)]/40 bg-[var(--theme-accent)]/10 flex items-center justify-center font-display font-black text-sm text-[var(--theme-accent)]">
                  Y
                </span>
              </div>
            )}
          </Link>

          {/* Right: Quick Action CTA */}
          <div className="flex items-center gap-3">
            <Link
              href="/events"
              className="btn-primary text-xs py-1.5 sm:py-2 px-3.5 sm:px-4"
            >
              <span>Register</span>
              <ArrowRight className="w-3 h-3 hidden sm:inline" />
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Mobile / Drawer Menu Opening from the LEFT ─── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-start bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={() => setDrawerOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Site Navigation"
        >
          <div
            className="w-full max-w-xs sm:max-w-sm h-full bg-[var(--theme-glass-bg)] border-r border-[var(--theme-glass-border)] backdrop-blur-2xl shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar of Left Drawer */}
            <div className="w-full flex items-center justify-between border-b border-[var(--theme-border)] pb-4">
              <div className="text-xs uppercase tracking-[0.2em] text-[var(--theme-accent)] font-semibold font-mono">
                Navigation
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-colors cursor-pointer py-1 font-medium font-mono"
                aria-label="Close menu"
              >
                <span>Close</span>
                <X className="w-4 h-4 text-[var(--theme-accent)]" />
              </button>
            </div>

            {/* Main Links List */}
            <div className="py-4 flex flex-col divide-y divide-[var(--theme-border)]">
              {MENU_ITEMS.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className="group flex flex-col py-3.5 hover:pl-1.5 transition-all"
                  >
                    <div className="flex items-baseline gap-3">
                      <span className="text-xs text-[var(--theme-accent)] font-semibold tracking-widest font-mono">
                        {item.number}
                      </span>
                      <span
                        className={`text-xl sm:text-2xl font-extrabold uppercase tracking-wide transition-colors ${
                          active
                            ? "text-[var(--theme-text-primary)]"
                            : "text-[var(--theme-text-muted)] group-hover:text-[var(--theme-text-primary)]"
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-[var(--theme-text-muted)] mt-0.5 pl-7 line-clamp-1 group-hover:text-[var(--theme-text-primary)]/80 transition-colors">
                      {item.description}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Bottom Bar: Institutional Credit & Register */}
            <div className="w-full border-t border-[var(--theme-border)] pt-4 flex flex-col gap-3">
              <div className="text-[10px] uppercase tracking-widest text-[var(--theme-text-muted)]">
                Department of Journalism &bull; MAC &bull; University of Delhi
              </div>
              <Link
                href="/events"
                onClick={() => setDrawerOpen(false)}
                className="btn-primary text-xs w-full text-center justify-center py-2.5"
              >
                <span>Register for Events &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
