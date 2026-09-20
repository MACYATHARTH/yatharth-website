import type { Edition } from "./types";

/**
 * Derives public-facing branding dynamically from edition metadata.
 * Example:
 * name = "YATHARTH", displayLabel = "’26–27" -> fullBranding = "YATHARTH ’26–27"
 * If displayLabel is missing/empty: fullBranding = "YATHARTH"
 */
export function formatEditionBranding(edition?: Partial<Edition> | null): {
  name: string;
  displayLabel: string;
  fullBranding: string;
} {
  const name = edition?.name?.trim() || "YATHARTH";
  const displayLabel = edition?.displayLabel?.trim() || "";

  return {
    name,
    displayLabel,
    fullBranding: displayLabel ? `${name} ${displayLabel}` : name,
  };
}
