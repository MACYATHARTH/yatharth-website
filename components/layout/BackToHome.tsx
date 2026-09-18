import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface BackToHomeProps {
  currentPage?: string;
  parentHref?: string;
  parentLabel?: string;
  className?: string;
}

export function BackToHome({
  currentPage,
  parentHref,
  parentLabel,
  className = "",
}: BackToHomeProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`inline-flex items-center gap-2 text-xs font-mono tracking-wider select-none mb-6 ${className}`}
    >
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-colors group cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
        <span>Home</span>
      </Link>

      {parentHref && parentLabel && (
        <>
          <span className="text-[var(--theme-text-muted)]/40 font-mono">/</span>
          <Link
            href={parentHref}
            className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-colors cursor-pointer"
          >
            {parentLabel}
          </Link>
        </>
      )}

      {currentPage && (
        <>
          <span className="text-[var(--theme-text-muted)]/40 font-mono">/</span>
          <span className="text-[var(--theme-accent)] font-semibold truncate max-w-[200px] sm:max-w-none">
            {currentPage}
          </span>
        </>
      )}
    </nav>
  );
}
