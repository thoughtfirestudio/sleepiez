import { useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";

interface MatchupApiResponse {
  id: string;
  week: number;
  home_team_id: string;
  away_team_id: string;
  raw_points: number;
  bonus_points: number;
  penalty_points: number;
  final_score: number;
  is_complete: boolean;
}

export default function Matchups() {
  const navigate = useNavigate();
  const { data: matchup } = useApi<MatchupApiResponse>("/api/matchups/current", null);

  if (!matchup) {
    return (
      <>
        <div className="flex justify-between items-center py-3 mb-2">
          <div className="flex items-center gap-1.5 font-bold text-sm cursor-pointer" onClick={() => navigate("/")}>
            ← Back
          </div>
        </div>
        <div className="card p-8 text-center">
          <div className="text-3xl mb-3">📅</div>
          <p className="text-ink-600 text-sm">No active matchup right now. Check back when the season starts.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center py-3 mb-2">
        <div className="flex items-center gap-1.5 font-bold text-sm cursor-pointer" onClick={() => navigate("/")}>
          ← Back
        </div>
        <div className="flex items-center gap-1.5 bg-ink-900 text-white px-3.5 py-2 rounded-pill text-xs">
          <span className="live-dot" />
          Live scoring
        </div>
      </div>

      <div className="card p-4.5 pb-1 mb-4">
        <div className="text-center text-xs text-ink-600 font-semibold mb-3">
          Week {matchup.week} · Matchup
        </div>
        <div className="flex items-center justify-between mb-1.5">
          <TeamSide abbr="??" name="Home" />
          <div className="text-center">
            <div className="font-display text-[26px] font-extrabold tabular-nums">
              {matchup.raw_points.toFixed(1)} : 0.0
            </div>
            <div className="text-[11px] text-ink-600 font-semibold mt-0.5">In progress</div>
          </div>
          <TeamSide abbr="??" name="Away" />
        </div>
      </div>
    </>
  );
}

function TeamSide({ abbr, name }: { abbr: string; name: string }) {
  return (
    <div className="flex flex-col items-center gap-2 w-20">
      <div className="w-[38px] h-[38px] rounded-full bg-cream-100 flex items-center justify-center text-[14px] font-extrabold font-display shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
        {abbr}
      </div>
      <div className="text-xs font-semibold text-center">{name}</div>
    </div>
  );
}
