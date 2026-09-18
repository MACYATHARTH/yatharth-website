"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Sponsor } from "@/lib/data/types";

interface DirectoryPatronsLedgerProps {
  sponsors: Sponsor[];
}

const DIRECTORY_ITEMS = [
  { href: "/events", label: "Events Directory", desc: "All competitive categories, eligibility & briefs" },
  { href: "/schedule", label: "Programme Schedule", desc: "Two-day on-campus itinerary & venues" },
  { href: "/team", label: "Festival Secretariat", desc: "Student leadership & competition directors" },
  { href: "/gallery", label: "Visual Archive", desc: "Photojournalism captures & festival repository" },
  { href: "/about", label: "Ethos & Legacy", desc: "Department of Journalism institutional history" },
  { href: "/contact", label: "Desk & Campus Location", desc: "Campus directions, transport & queries" },
];

export function DirectoryPatronsLedger({ sponsors }: DirectoryPatronsLedgerProps) {
  return (
    <section className="relative w-full py-24 sm:py-32 px-6 sm:px-10 lg:px-14 bg-[#0B0A09] text-[#E9E6DF] border-t border-[#E9E6DF]/10 select-none">
      {/* ─── Patrons & Partners ─── */}
      {sponsors && sponsors.length > 0 && (
        <div className="mb-20">
          <div className="font-mono text-xs uppercase tracking-[0.25em] text-[#8B1E2D] font-bold mb-8 text-center">
            [ 06 / PATRONS &amp; PARTNERS ]
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            {sponsors.map((s) => (
              <a
                key={s.id}
                href={s.websiteUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 text-[#A3B1C6] hover:text-[#FAF6EE] transition-colors"
              >
                <div className="w-8 h-8 bg-[#0E1838] border border-[#FAF6EE]/15 flex items-center justify-center font-mono text-xs text-[#FAF6EE] group-hover:border-[#8B1E2D] transition-all">
                  {s.name.charAt(0)}
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-[#FAF6EE]/90 group-hover:text-[#FAF6EE] transition-colors">
                    {s.name}
                  </div>
                  <div className="text-[9px] font-mono text-[#8B1E2D] font-bold uppercase tracking-widest">
                    {s.tier.replace("_", " ")}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ─── Festival Ledger Index ─── */}
      <div className="border-t border-[#FAF6EE]/10 pt-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.25em] text-[#8B1E2D] font-bold mb-2">
              [ 07 / INDEX LEDGER ]
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-[#FAF6EE] tracking-tight uppercase">
              Festival Directory
            </h2>
          </div>
          <div className="text-[11px] font-mono text-[#A3B1C6] uppercase tracking-widest">
            MAHARAJA AGRASEN COLLEGE &bull; UNIVERSITY OF DELHI
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {DIRECTORY_ITEMS.map((item, idx) => (
            <Link
              key={item.href}
              href={item.href}
              className="group p-6 bg-[#0E1838] border border-[#FAF6EE]/10 hover:border-[#8B1E2D] transition-all flex flex-col justify-between min-h-[130px]"
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-xs text-[#8B1E2D] font-bold tracking-widest">
                  [ 0{idx + 1} ]
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#A3B1C6] group-hover:text-[#FAF6EE] group-hover:translate-x-1 transition-all" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#FAF6EE] group-hover:text-white transition-colors">
                  {item.label}
                </h3>
                <p className="text-xs text-[#A3B1C6] mt-1 font-sans font-normal">
                  {item.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
