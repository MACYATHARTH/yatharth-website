"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Camera } from "lucide-react";
import { GalleryItem } from "@/lib/data/types";

interface AsymmetricGalleryStreamProps {
  items: GalleryItem[];
}

export function AsymmetricGalleryStream({ items }: AsymmetricGalleryStreamProps) {
  const displayItems = items.slice(0, 5);

  return (
    <section className="relative w-full py-24 sm:py-32 px-6 sm:px-10 lg:px-14 bg-[#0B0A09] text-[#E9E6DF] border-t border-[#E9E6DF]/10 select-none">
      {/* Header */}
      <div className="w-full flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#FAF6EE]/10 pb-5 mb-12">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.25em] text-[#8B1E2D] font-bold mb-2">
            [ 04 / VISUAL ARCHIVE ]
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#FAF6EE] tracking-tight uppercase flex items-center gap-3">
            <span>Lens &bull; Archive</span>
            <span className="text-[#8B1E2D] font-light">&rarr;</span>
          </h2>
        </div>

        <Link
          href="/gallery"
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.15em] text-[#A3B1C6] hover:text-[#FAF6EE] transition-colors group"
        >
          <span>Complete Repository</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Asymmetric Editorial Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-6">
        {displayItems.map((item, index) => (
          <GalleryFrame key={item.id} item={item} index={index} />
        ))}
      </div>
    </section>
  );
}

function GalleryFrame({ item, index }: { item: GalleryItem; index: number }) {
  const [imageError, setImageError] = useState(false);
  const src = item.imageUrl || item.mediaUrl;

  const colSpanClass =
    index === 0
      ? "md:col-span-7 min-h-[380px] lg:min-h-[460px]"
      : index === 1
      ? "md:col-span-5 min-h-[380px] lg:min-h-[460px]"
      : "md:col-span-4 min-h-[300px] lg:min-h-[340px]";

  return (
    <Link
      href="/gallery"
      className={`group relative bg-[#0E1838] border border-[#FAF6EE]/10 hover:border-[#8B1E2D] overflow-hidden flex flex-col justify-end transition-all duration-300 ${colSpanClass}`}
    >
      {/* Background Image / Placeholder */}
      {src && !imageError ? (
        <Image
          src={src}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          onError={() => setImageError(true)}
          className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-60 group-hover:opacity-85"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#0E1838] to-[#0B0A09]">
          <div className="w-12 h-12 border border-[#FAF6EE]/15 flex items-center justify-center group-hover:scale-110 transition-transform bg-[#0B0A09]">
            <Camera className="w-5 h-5 text-[#8B1E2D] group-hover:text-[#FAF6EE] transition-colors" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A3B1C6] mt-4">
            [ {item.category} ]
          </span>
        </div>
      )}

      {/* Scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A09] via-[#0B0A09]/50 to-transparent pointer-events-none" />

      {/* Caption Content — Clean typography, no loud badges */}
      <div className="relative z-10 p-6 sm:p-7 flex flex-col justify-end">
        <div className="flex items-center justify-between text-[11px] font-mono tracking-widest uppercase text-[#8B1E2D] font-bold mb-2">
          <span>{item.category}</span>
          <span className="text-[#A3B1C6] font-normal">{item.year || 2025}</span>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-[#FAF6EE] group-hover:text-white transition-colors leading-snug line-clamp-1">
          {item.title}
        </h3>
        {item.photographer && (
          <div className="text-xs font-mono text-[#A3B1C6] mt-1">
            Photo: {item.photographer}
          </div>
        )}
      </div>
    </Link>
  );
}
