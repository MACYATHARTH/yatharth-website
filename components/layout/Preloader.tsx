"use client";

import { useEffect, useState } from "react";

export function Preloader() {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Smooth high-speed progress simulation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsLoaded(true), 150);
          setTimeout(() => setShouldRender(false), 800);
          return 100;
        }
        return prev + 15;
      });
    }, 40);

    return () => clearInterval(interval);
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[9999] bg-[#050507] text-white flex flex-col justify-between p-6 sm:p-10 transition-opacity duration-700 ease-out select-none ${
        isLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Top Bar */}
      <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono uppercase tracking-[0.2em] text-zinc-400">
        <span>[ EST. 2026 ]</span>
        <span>[ DEPT. OF JOURNALISM &bull; MAC DU ]</span>
      </div>

      {/* Center Title & Progress */}
      <div className="text-center my-auto w-full max-w-xl mx-auto space-y-6">
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tight text-white font-sans">
          YATHARTH
        </h1>
        <div className="w-full h-[2px] bg-white/10 relative overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
          <span>INITIALIZING SHOWCASE</span>
          <span>{progress}%</span>
        </div>
      </div>

      {/* Bottom Subtitle */}
      <div className="text-center text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em] text-zinc-400">
        <span>VOICE &bull; VISION &bull; VERACITY &bull; ANNUAL NATIONAL JOURNALISM FESTIVAL</span>
      </div>
    </div>
  );
}
