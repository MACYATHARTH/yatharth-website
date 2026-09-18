import { ThemeTokens, ThemePresetName } from "./types";

export const THEME_PRESETS: Record<Exclude<ThemePresetName, "custom">, ThemeTokens> = {
  "dark-festival": {
    background: "#0B0A09",
    surface: "#171513",
    surfaceSecondary: "#201D1A",
    textPrimary: "#E9E6DF",
    textSecondary: "#A8A29E",
    textMuted: "#77716A",
    border: "rgba(233, 230, 223, 0.10)",
    borderSubtle: "rgba(233, 230, 223, 0.05)",
    accent: "#8F3025",
    accentHover: "#5C211C",
    cta: "#8F3025",
    ctaText: "#FFFFFF",
    ctaHover: "#5C211C",
    overlayBg: "rgba(11, 10, 9, 1)",
    overlayOpacity: 0.58,
    glassBg: "rgba(23, 21, 19, 0.45)",
    glassBorder: "rgba(233, 230, 223, 0.08)",
  },
  "light-festival": {
    background: "#F7F5F0",
    surface: "#FFFFFF",
    surfaceSecondary: "#EDEAE2",
    textPrimary: "#181716",
    textSecondary: "#57534E",
    textMuted: "#8C867E",
    border: "rgba(24, 23, 22, 0.12)",
    borderSubtle: "rgba(24, 23, 22, 0.06)",
    accent: "#8F3025",
    accentHover: "#5C211C",
    cta: "#8F3025",
    ctaText: "#FFFFFF",
    ctaHover: "#5C211C",
    overlayBg: "rgba(247, 245, 240, 1)",
    overlayOpacity: 0.25,
    glassBg: "rgba(255, 255, 255, 0.70)",
    glassBorder: "rgba(24, 23, 22, 0.10)",
  },
  "warm-parchment": {
    background: "#1C1917",
    surface: "#292524",
    surfaceSecondary: "#34302C",
    textPrimary: "#FAF7F2",
    textSecondary: "#D6D3D1",
    textMuted: "#A8A29E",
    border: "rgba(250, 247, 242, 0.12)",
    borderSubtle: "rgba(250, 247, 242, 0.06)",
    accent: "#B45309",
    accentHover: "#92400E",
    cta: "#B45309",
    ctaText: "#FFFFFF",
    ctaHover: "#92400E",
    overlayBg: "rgba(28, 25, 23, 1)",
    overlayOpacity: 0.55,
    glassBg: "rgba(41, 37, 36, 0.50)",
    glassBorder: "rgba(250, 247, 242, 0.10)",
  },
  "cool-obsidian": {
    background: "#090D14",
    surface: "#111827",
    surfaceSecondary: "#1F2937",
    textPrimary: "#F3F4F6",
    textSecondary: "#9CA3AF",
    textMuted: "#6B7280",
    border: "rgba(243, 244, 246, 0.12)",
    borderSubtle: "rgba(243, 244, 246, 0.06)",
    accent: "#3B82F6",
    accentHover: "#2563EB",
    cta: "#2563EB",
    ctaText: "#FFFFFF",
    ctaHover: "#1D4ED8",
    overlayBg: "rgba(9, 13, 20, 1)",
    overlayOpacity: 0.60,
    glassBg: "rgba(17, 24, 39, 0.50)",
    glassBorder: "rgba(243, 244, 246, 0.10)",
  },
};

export function resolveThemeTokens(settings?: Record<string, unknown> | null): ThemeTokens {
  const preset = (settings?.themePreset as ThemePresetName) || "dark-festival";
  const base = THEME_PRESETS[preset === "custom" ? "dark-festival" : preset] || THEME_PRESETS["dark-festival"];
  const custom = (settings?.themeTokens as Partial<ThemeTokens>) || {};

  const overlayOpacity =
    typeof settings?.wallpaperOverlayOpacity === "number"
      ? settings.wallpaperOverlayOpacity
      : typeof custom.overlayOpacity === "number"
      ? custom.overlayOpacity
      : base.overlayOpacity;

  return {
    ...base,
    ...custom,
    overlayOpacity,
  };
}

export function tokensToCssVariables(tokens: ThemeTokens): Record<string, string> {
  return {
    "--theme-background": tokens.background,
    "--theme-surface": tokens.surface,
    "--theme-surface-secondary": tokens.surfaceSecondary,
    "--theme-text-primary": tokens.textPrimary,
    "--theme-text-secondary": tokens.textSecondary,
    "--theme-text-muted": tokens.textMuted,
    "--theme-border": tokens.border,
    "--theme-border-subtle": tokens.borderSubtle || tokens.border,
    "--theme-accent": tokens.accent,
    "--theme-accent-hover": tokens.accentHover || tokens.accent,
    "--theme-cta": tokens.cta,
    "--theme-cta-text": tokens.ctaText,
    "--theme-cta-hover": tokens.ctaHover || tokens.cta,
    "--theme-overlay-bg": tokens.overlayBg,
    "--theme-overlay-opacity": String(tokens.overlayOpacity),
    "--theme-glass-bg": tokens.glassBg,
    "--theme-glass-border": tokens.glassBorder,

    // Backward-compatible color variable aliases
    "--background": tokens.background,
    "--foreground": tokens.textPrimary,
    "--color-bg": tokens.background,
    "--color-surface": tokens.surface,
    "--color-text": tokens.textPrimary,
    "--color-text-muted": tokens.textMuted,
    "--color-accent": tokens.accent,
    "--color-accent-deep": tokens.accentHover || tokens.accent,
    "--wallpaper-overlay-opacity": String(tokens.overlayOpacity),
  };
}
