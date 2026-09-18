import { Metadata } from "next";
import { getGalleryItems } from "@/lib/data/gallery.service";
import { GalleryClient } from "@/components/gallery/GalleryClient";
import { BackToHome } from "@/components/layout/BackToHome";

export const metadata: Metadata = {
  title: "Festival Gallery & Visual Moments",
  description:
    "Explore the visual retrospective of YATHARTH: Keynote addresses, spot photography challenges, broadcast studio sessions, and valedictory awards.",
};

export default async function GalleryPage() {
  const items = await getGalleryItems("ALL");

  return (
    <div className="pt-28 pb-20 min-h-screen text-[var(--theme-text-primary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="border-b border-[var(--theme-border)] pb-10 space-y-4">
          <BackToHome currentPage="Gallery" />
          <div className="text-[11px] font-mono tracking-[0.25em] text-[var(--theme-accent)] uppercase font-bold">
            Visual Retrospective
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-[var(--theme-text-primary)] tracking-tight font-varsity uppercase">
            Festival Memories &amp; Moments
          </h1>
          <p className="text-xs sm:text-sm font-mono text-[var(--theme-text-muted)] max-w-2xl leading-relaxed">
            Visual chronicle of keynote sessions, spot photojournalism challenges, broadcast studios, and valedictory honours at Maharaja Agrasen College.
          </p>
        </div>

        {/* Asymmetric Interactive Gallery */}
        <GalleryClient initialItems={items} />
      </div>
    </div>
  );
}
