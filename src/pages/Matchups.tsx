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

const MOCK = {
  week: 9,
  myScore: "86.4",
  oppScore: "79.1",
  opponent: "Ironhide Herd",
  playersLeft: "4 players left",
  compare: [
    { pos: "QB", my: "24.6", opp: "21.0", win: true },
    { pos: "RB", my: "18.2", opp: "14.7", win: true },
    { pos: "WR", my: "11.4", opp: "16.9", win: false },
    { pos: "TE", my: "9.8", opp: "7.2", win: true },
  ],
  stats: [
    { label: "Bench points", my: "14.2", opp: "9.8" },
    { label: "Win probability", my: "68%", opp: "32%", bar: 68, compare: true },
    { label: "Proj. total", my: "102", opp: "94" },
    { label: "Players active", my: "5", opp: "4" },
    { label: "Highest scorer", my: "24.6", opp: "21.0" },
    { label: "Waiver moves", my: "3", opp: "1" },
  ],
};

export default function Matchups() {
  const navigate = useNavigate();
  const { data: matchup } = useApi<MatchupApiResponse>("/api/matchups/current", {
    id: "", week: 9, home_team_id: "", away_team_id: "",
    raw_points: 86.4, bonus_points: 0, penalty_points: 0,
    final_score: 86.4, is_complete: false,
  });

  const week = matchup?.week ?? MOCK.week;
  const myScore = matchup ? matchup.raw_points.toFixed(1) : MOCK.myScore;

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
        <div className="text-center text-xs text-ink-600 font-semibold mb-3">Week {week} · Matchup</div>
        <div className="flex items-center justify-between mb-1.5">
          <TeamSide abbr="DCM" name="Dune Coast<br>Marauders" />
          <div className="text-center">
            <div className="font-display text-[26px] font-extrabold tabular-nums">
              {myScore} : {MOCK.oppScore}
            </div>
            <div className="text-[11px] text-ink-600 font-semibold mt-0.5">{MOCK.playersLeft}</div>
          </div>
          <TeamSide abbr="IH" name="Ironhide<br>Herd" />
        </div>

        <div className="bg-gold-100 rounded-md mt-4 px-3.5 py-1.5">
          <div className="border-b border-black/6" />
          {MOCK.compare.map((r, i) => (
            <div key={i} className="flex items-center justify-between py-2 text-xs font-bold">
              <span className={`w-9 text-left ${r.win ? "text-gold-600" : ""}`}>{r.my}</span>
              <span className="text-[10px] text-ink-600 font-bold w-8 text-center">{r.pos}</span>
              <span className={`w-9 text-right ${!r.win ? "text-gold-600" : ""}`}>{r.opp}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2.5 my-4 overflow-x-auto">
        {["Matchup", "Roster", "Waivers", "Standings"].map((t) => (
          <div key={t} className={`tab-chip${t === "Matchup" ? " active" : ""}`}>{t}</div>
        ))}
      </div>

      <div className="bg-gold-50 rounded-lg p-4.5">
        <h4 className="font-display text-[15px] font-bold mb-3.5">Matchup stats</h4>
        <div className="grid grid-cols-2 gap-2.5">
          {MOCK.stats.map((s, i) => {
            if (s.compare) {
              return (
                <div key={i} className="stat-cell compare col-span-full">
                  <div className="text-[11px] font-bold mb-1 text-white/70">{s.label}</div>
                  <div className="h-[6px] rounded-pill bg-white/18 overflow-hidden mb-2">
                    <div className="h-full rounded-pill" style={{ width: `${s.bar}%`, background: "#F4C43D" }} />
                  </div>
                  <div className="flex justify-between font-display font-bold text-[15px]">
                    <span>{s.my}</span><span>{s.opp}</span>
                  </div>
                </div>
              );
            }
            return (
              <div key={i} className="stat-cell">
                <div className="text-[11px] font-bold mb-3.5">{s.label}</div>
                <div className="flex justify-between font-display font-bold text-[15px]">
                  <span>{s.my}</span><span>{s.opp}</span>
                </div>
              </div>
            );
          })}
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
      <div className="text-xs font-semibold text-center" dangerouslySetInnerHTML={{ __html: name }} />
    </div>
  );
}
