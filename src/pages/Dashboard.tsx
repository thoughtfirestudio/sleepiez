import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useApi } from "../hooks/useApi";

interface TeamApiResponse {
  name: string;
  wins: number;
  losses: number;
  ties: number;
  total_points: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: team } = useApi<TeamApiResponse>("/api/teams/mine", null);

  return (
    <>
      <div className="flex justify-between items-center py-3 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-gold-300 to-gold-500 shrink-0" />
          <div>
            <div className="text-[12px] text-ink-600">Hey,</div>
            <div className="text-[16px] font-bold font-display">{user?.display_name ?? "Homiez"}</div>
          </div>
        </div>
        <div className="w-[38px] h-[38px] rounded-full bg-surface flex items-center justify-center shadow-card cursor-pointer">
          🔔
        </div>
      </div>

      {team ? (
        <div className="card p-5 relative mb-4">
          <div className="absolute -top-[18px] left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-ink-900 text-gold-500 flex items-center justify-center text-[15px] shadow-nav">
            🏈
          </div>
          <div className="text-center font-display text-[15px] font-bold mt-1 mb-0.5">
            {team.name}
          </div>
          <div className="text-center text-[12px] text-ink-600 mb-3.5">
            Season underway
          </div>
          <div className="flex">
            <div className="flex-1">
              <div className="text-[12px] text-ink-600 mb-1">Total points</div>
              <div className="font-display text-[22px] font-extrabold tracking-tight">{team.total_points.toFixed(1)}</div>
            </div>
            <div className="flex-1">
              <div className="text-[12px] text-ink-600 mb-1">Record</div>
              <div className="font-display text-[22px] font-extrabold tracking-tight">{team.wins}–{team.losses}{team.ties > 0 ? `–${team.ties}` : ""}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-8 mb-4 text-center">
          <div className="text-3xl mb-3">🏈</div>
          <p className="text-ink-600 text-sm">No team yet. League setup in progress.</p>
        </div>
      )}

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

      <div className="flex justify-between items-baseline mb-3">
        <h3 className="font-display text-[16px] font-bold">Starting lineup</h3>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {["All", "QB", "RB", "WR", "TE", "FLEX"].map((t) => (
          <div key={t} className={`pos-tab${t === "All" ? " active" : ""}`}>{t}</div>
        ))}
      </div>

      <div className="bg-cream-100 rounded-lg p-6 text-center">
        <p className="text-ink-400 text-sm font-semibold">Roster empty — draft or sync players to get started</p>
      </div>
    </>
  );
}
