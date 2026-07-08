import { useApi } from "../hooks/useApi";

interface WaiverApiItem {
  id: string;
  player_id: string;
  bid_amount: number;
  status: string;
}

const MOCK_WAIVERS = [
  { name: "R. Rice", pos: "WR", team: "KC", opponent: "LAC", proj: "14.2", faab: "12" },
  { name: "J. Williams", pos: "RB", team: "DEN", opponent: "LV", proj: "12.8", faab: "8" },
  { name: "P. Nacua", pos: "WR", team: "LAR", opponent: "SEA", proj: "16.1", faab: "5" },
  { name: "D. Kincaid", pos: "TE", team: "BUF", opponent: "MIA", proj: "9.4", faab: "3" },
];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("");
}

export default function Waivers() {
  const { data: claims } = useApi<WaiverApiItem[]>("/api/waivers", []);

  return (
    <>
      <div className="pt-3 mb-2">
        <div className="flex justify-between items-baseline">
          <div>
            <h2 className="font-display text-display-lg font-bold">Waivers</h2>
            <p className="text-body-sz text-ink-600 mt-1">
              Processing Tue 2:00am · {claims?.length ?? 0} pending claim{(claims?.length ?? 0) !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="text-right">
            <div className="text-caption text-ink-400">Your FAAB</div>
            <div className="font-display text-title font-bold">$64</div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {["All", "WR", "RB", "TE", "QB"].map((t) => (
          <div key={t} className={`pos-tab${t === "All" ? " active" : ""}`}>{t}</div>
        ))}
      </div>

      <div className="flex flex-col gap-2.5">
        {MOCK_WAIVERS.map((p, i) => (
          <div key={i} className="player-card bench">
            <div className="w-[42px] h-[42px] rounded-full bg-surface flex items-center justify-center text-[15px] font-bold font-display shrink-0 shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
              {getInitials(p.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold">
                {p.name} <span className="text-caption text-ink-600">{p.pos}</span>
              </div>
              <div className="text-[11px] text-ink-600 mt-0.5">
                {p.team} vs {p.opponent} · Proj {p.proj}
              </div>
            </div>
            <div className="text-right">
              <div className="text-caption text-ink-600 font-bold">${p.faab}</div>
              <button className="mt-1 text-[10px] font-bold text-gold-600 bg-gold-100 rounded-pill px-3 py-1 border-none cursor-pointer">
                Claim
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
