interface PlayerCardProps {
  initials: string;
  name: string;
  pos: string;
  meta: string;
  pts?: string;
  proj?: string;
  bench?: boolean;
  badge?: "live" | "bye" | "bench" | "forced";
  forcedSub?: boolean;
}

export default function PlayerCard({
  initials,
  name,
  pos,
  meta,
  pts,
  proj,
  bench,
  badge,
  forcedSub,
}: PlayerCardProps) {
  return (
    <div className={`player-card${bench ? " bench" : ""}`}>
      <div className="w-[42px] h-[42px] rounded-full bg-surface flex items-center justify-center text-[15px] font-bold font-display shrink-0 shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold">
          {name}{" "}
          <span className="text-caption text-ink-600">{pos}</span>
        </div>
        <div className="text-[11px] text-ink-600 mt-0.5">{meta}</div>
        {forcedSub && (
          <div className="text-[10px] font-bold text-red-500 mt-0.5">
            🤡 FORCED SUB
          </div>
        )}
      </div>
      {pts && (
        <div className="text-right">
          <div className="font-display text-[18px] font-extrabold">{pts}</div>
          {proj && (
            <div className="text-[10px] text-ink-600 font-semibold">
              Proj {proj}
            </div>
          )}
        </div>
      )}
      {badge === "bye" && <span className="badge-bye">Bye</span>}
      {badge === "bench" && <span className="badge-bench">Bench</span>}
      {badge === "live" && (
        <div className="flex items-center gap-1">
          <span className="live-dot"></span>
          <span className="badge-live">Live</span>
        </div>
      )}
    </div>
  );
}
