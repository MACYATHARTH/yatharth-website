export function DemoModeBadge() {
  const isDemo = process.env.DATA_SOURCE === "demo";

  if (!isDemo) return null;

  return (
    <div className="bg-[#171513] border-b border-[#8F3025]/40 px-4 py-2 text-center text-xs font-mono text-[#A8A29E] relative z-30">
      <span className="inline-block px-1.5 py-0.5 mr-2 rounded-xs bg-[#8F3025]/30 border border-[#8F3025]/60 font-mono text-[10px] uppercase font-bold tracking-wider text-[#E9E6DF]">
        DEMO / PLACEHOLDER DATA
      </span>
      <span>
        This preview is for design and website review only. Final faculty, team, event, schedule, gallery and other content will be updated through the production admin system.
      </span>
    </div>
  );
}