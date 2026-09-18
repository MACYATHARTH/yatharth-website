import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getTickerAnnouncements } from "@/lib/data/announcement.service";

export async function NewsTicker() {
  const tickerItems = await getTickerAnnouncements();

  if (!tickerItems || tickerItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-[var(--theme-surface)]/90 backdrop-blur-md border-b border-[var(--theme-border)] text-[var(--theme-text-muted)] overflow-hidden text-xs relative z-20">
      <div className="max-w-7xl mx-auto flex items-center">
        {/* Live Dispatch Indicator */}
        <div className="shrink-0 px-4 py-2 flex items-center gap-2 font-mono font-medium tracking-wider uppercase text-[11px] bg-[var(--theme-surface-secondary)]/40 border-r border-[var(--theme-border)] text-[var(--theme-text-primary)] z-10">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--theme-cta)] opacity-60"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--theme-cta)]"></span>
          </span>
          <span className="hidden xs:inline text-[var(--theme-text-primary)]">Updates</span>
        </div>

        {/* Marquee ticker content */}
        <div className="relative flex-1 overflow-hidden py-2 px-4">
          <div className="animate-ticker flex items-center gap-8">
            {/* Double the list for seamless infinite loop */}
            {[...tickerItems, ...tickerItems].map((item, idx) => (
              <Link
                key={`${item.id}-${idx}`}
                href="/announcements"
                className="inline-flex items-center gap-2 text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-colors whitespace-nowrap group text-xs"
              >
                <span className="inline-block px-1.5 py-0.5 border border-[var(--theme-border)] text-[var(--theme-text-primary)] font-mono text-[9px] uppercase tracking-wider">
                  {item.priority}
                </span>
                <span className="font-medium tracking-tight group-hover:text-[var(--theme-text-primary)] transition-colors">{item.title}</span>
                <ChevronRight className="w-3 h-3 text-[var(--theme-text-muted)]/60 group-hover:text-[var(--theme-text-primary)] group-hover:translate-x-0.5 transition-all" />
                <span className="text-[var(--theme-text-muted)]/40 mx-2">&bull;</span>
              </Link>
            ))}
          </div>
        </div>

        {/* View All Announcements shortcut */}
        <div className="hidden sm:block shrink-0 px-4 py-2 z-10 bg-[var(--theme-surface)] border-l border-[var(--theme-border)]">
          <Link
            href="/announcements"
            className="text-[11px] font-mono uppercase tracking-wider text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] flex items-center gap-1 transition-colors"
          >
            <span>All Updates</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
