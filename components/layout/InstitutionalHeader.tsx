import { Landmark } from "lucide-react";

export function InstitutionalHeader() {
  return (
    <div
      role="region"
      aria-label="Institutional Affiliation"
      className="w-full bg-[var(--theme-background)]/95 border-b border-[var(--theme-border)]/60 text-[var(--theme-text-muted)] text-[11px] tracking-wide font-mono select-none"
    >
      <div className="w-full px-4 sm:px-8 lg:px-14 py-1.5 flex flex-wrap items-center justify-between gap-y-1 gap-x-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 text-[var(--theme-text-muted)] text-[11px]">
            <Landmark className="w-3 h-3 shrink-0 text-[var(--theme-accent)]" aria-hidden="true" />
            <span className="text-[var(--theme-text-primary)]/90 font-medium">Maharaja Agrasen College</span>
          </div>
          <span className="text-[var(--theme-text-muted)]/40 hidden sm:inline">&bull;</span>
          <span className="text-[var(--theme-text-muted)] hidden sm:inline">University of Delhi</span>
        </div>
        <div className="text-[var(--theme-text-muted)] text-[11px]">
          <span>Department of Journalism</span>
        </div>
      </div>
    </div>
  );
}

