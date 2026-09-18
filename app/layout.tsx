import type { Metadata } from "next";
import { Geist, Geist_Mono, Graduate, Inter, Playfair_Display, Cinzel } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DemoModeBadge } from "@/components/layout/DemoModeBadge";
import { WallpaperBackground } from "@/components/layout/WallpaperBackground";
import { Preloader } from "@/components/layout/Preloader";
import { getActiveEdition } from "@/lib/data/edition.service";
import { getLinktreeLink } from "@/lib/data/link.service";
import { resolveThemeTokens, tokensToCssVariables } from "@/lib/data/theme.config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const graduate = Graduate({
  variable: "--font-varsity",
  subsets: ["latin"],
  weight: "400",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "YATHARTH '26 | Annual Journalism Festival | Maharaja Agrasen College (DU)",
    template: "%s | YATHARTH '26 — Department of Journalism, MAC DU",
  },
  description:
    "Official digital platform for YATHARTH '26, the flagship annual national journalism and media festival organized by the Department of Journalism, Maharaja Agrasen College, University of Delhi.",
  keywords: [
    "YATHARTH 2026",
    "YATHARTH",
    "Department of Journalism",
    "Maharaja Agrasen College",
    "University of Delhi",
    "Journalism Festival",
    "Media Competitions",
    "Print Journalism",
    "Photojournalism",
    "Broadcast Bulletin",
    "Media Quiz",
  ],
  authors: [{ name: "Department of Journalism, Maharaja Agrasen College" }],
  creator: "Department of Journalism, MAC DU",
  openGraph: {
    title: "YATHARTH '26 — Department of Journalism, Maharaja Agrasen College, University of Delhi",
    description:
      "The Annual National Journalism Festival celebrating investigative reporting, photojournalism, broadcast television, and media literacy.",
    url: "https://yatharth.mac.du.ac.in",
    siteName: "YATHARTH '26",
    locale: "en_IN",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [edition, linktree] = await Promise.all([
    getActiveEdition().catch(() => null),
    getLinktreeLink().catch(() => null),
  ]);

  const wallpaperUrl = (edition?.themeSettings?.wallpaperUrl as string) || null;
  const overlayOpacity =
    typeof edition?.themeSettings?.wallpaperOverlayOpacity === "number"
      ? (edition.themeSettings.wallpaperOverlayOpacity as number)
      : null;

  const logoUrl = (edition?.themeSettings?.logoUrl as string) || null;

  const fontSansChoice = (edition?.themeSettings?.fontSans as string) || "geist";
  const fontDisplayChoice = (edition?.themeSettings?.fontDisplay as string) || "graduate";

  const activeFontSans =
    fontSansChoice === "inter"
      ? "var(--font-inter), system-ui, sans-serif"
      : "var(--font-geist-sans), system-ui, sans-serif";

  const activeFontDisplay =
    fontDisplayChoice === "playfair"
      ? "var(--font-playfair), serif"
      : fontDisplayChoice === "cinzel"
      ? "var(--font-cinzel), serif"
      : "var(--font-varsity), serif";

  const themeTokens = resolveThemeTokens(edition?.themeSettings);
  const cssVars = tokensToCssVariables(themeTokens);

  const allVars: Record<string, string> = {
    ...cssVars,
    "--font-sans": activeFontSans,
    "--font-display": activeFontDisplay,
    "--font-varsity": activeFontDisplay,
  };

  const cssVarString = Object.entries(allVars)
    .map(([k, v]) => `${k}: ${v};`)
    .join(" ");

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${graduate.variable} ${inter.variable} ${playfair.variable} ${cinzel.variable} h-full antialiased`}
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: `:root { ${cssVarString} }` }} />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--theme-background)] text-[var(--theme-text-primary)] relative selection:bg-[var(--theme-accent)] selection:text-white transition-colors duration-200">
        <Preloader />
        <WallpaperBackground wallpaperUrl={wallpaperUrl} overlayOpacity={overlayOpacity} />
        <DemoModeBadge />
        <Navbar logoUrl={logoUrl} />
        <main className="flex-1 w-full relative z-10">{children}</main>
        <Footer linktreeUrl={linktree?.url} logoUrl={logoUrl} />
      </body>
    </html>
  );
}
