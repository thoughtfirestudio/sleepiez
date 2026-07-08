import { useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import PlayerCard from "../components/PlayerCard";

interface PlayerData {
  initials: string;
  name: string;
  pos: string;
  meta: string;
  pts?: string;
  proj?: string;
  forcedSub?: boolean;
  badge?: "live" | "bye";
}

interface BenchData {
  initials: string;
  name: string;
  pos: string;
  meta: string;
  badge: "bye" | "bench";
}

interface DashboardData {
  name: string;
  team: string;
  record: string;
  rank: string;
  seasonPts: string;
  starters: PlayerData[];
  bench: BenchData[];
}

const MOCK: DashboardData = {
  name: "Markus",
  team: "Dune Coast Marauders",
  record: "7–2",
  rank: "#2 of 12",
  seasonPts: "1,284.4",
  starters: [
    { initials: "JA", name: "J. Allen", pos: "QB", meta: "BUF vs MIA · Sun 1:00pm", pts: "24.6", proj: "22.1" },
    { initials: "CM", name: "C. McCaffrey", pos: "RB", meta: "SF @ SEA · Live · Q3", pts: "18.2", proj: "19.4", forcedSub: true },
  ],
  bench: [
    { initials: "TK", name: "T. Kelce", pos: "TE", meta: "KC · Bye week", badge: "bye" },
  ],
};

// API shape from /api/teams/mine
interface TeamApiResponse {
  name: string;
  wins: number;
  losses: number;
  total_points: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: teamData } = useApi<TeamApiResponse>("/api/teams/mine", { name: "Dune Coast Marauders", wins: 7, losses: 2, total_points: 1284.4 });

  const displayName = "Markus";
  const teamName = teamData?.name ?? MOCK.team;
  const record = teamData ? `${teamData.wins}–${teamData.losses}` : MOCK.record;
  const seasonPts = teamData ? teamData.total_points.toFixed(1) : MOCK.seasonPts;

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center py-3 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-gold-300 to-gold-500 shrink-0" />
          <div>
            <div className="text-[12px] text-ink-600">Hey,</div>
            <div className="text-[16px] font-bold font-display">{displayName}</div>
          </div>
        </div>
        <div className="w-[38px] h-[38px] rounded-full bg-surface flex items-center justify-center shadow-card cursor-pointer">
          🔔
        </div>
      </div>

      {/* Team Card */}
      <div className="card p-5 relative mb-4">
        <div className="absolute -top-[18px] left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-ink-900 text-gold-500 flex items-center justify-center text-[15px] shadow-nav">
          🏈
        </div>
        <div className="text-center font-display text-[15px] font-bold mt-1 mb-0.5">
          {teamName}
        </div>
        <div className="text-center text-[12px] text-ink-600 mb-3.5">
          Week 9 · Rank {MOCK.rank}
        </div>
        <div className="flex">
          <div className="flex-1">
            <div className="text-[12px] text-ink-600 mb-1">Season points</div>
            <div className="font-display text-[22px] font-extrabold tracking-tight">{seasonPts}</div>
          </div>
          <div className="flex-1">
            <div className="text-[12px] text-ink-600 mb-1">Record</div>
            <div className="font-display text-[22px] font-extrabold tracking-tight">{record}</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2.5 mb-5">
        <button className="btn-primary flex-1" onClick={() => navigate("/matchups")}>
          <span className="w-[22px] h-[22px] rounded-full bg-black/10 flex items-center justify-center text-[11px]">⇄</span>
          Set lineup
        </button>
        <button className="btn-secondary flex-1" onClick={() => navigate("/waivers")}>
          <span className="w-[22px] h-[22px] rounded-full bg-white/16 flex items-center justify-center text-[11px]">＋</span>
          Waivers
        </button>
      </div>

      {/* Starting Lineup */}
      <div className="flex justify-between items-baseline mb-3">
        <h3 className="font-display text-[16px] font-bold">Starting lineup</h3>
        <span className="text-[12px] font-semibold text-ink-600 cursor-pointer">Optimize</span>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {["All", "QB", "RB", "WR", "TE", "FLEX"].map((t) => (
          <div key={t} className={`pos-tab${t === "All" ? " active" : ""}`}>{t}</div>
        ))}
      </div>

      {MOCK.starters.map((p, i) => <PlayerCard key={i} {...p} />)}

      <div className="mt-4">
        <h3 className="font-display text-[16px] font-bold mb-3">Bench</h3>
        {MOCK.bench.map((p, i) => <PlayerCard key={i} {...p} bench />)}
      </div>
    </>
  );
}
