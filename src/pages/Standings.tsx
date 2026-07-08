import { useApi } from "../hooks/useApi";

interface TeamRow {
  rank: number;
  name: string;
  record: string;
  pts: string;
  me?: boolean;
  taco?: boolean;
}

interface StandingsApiTeam {
  id: string;
  name: string;
  wins: number;
  losses: number;
  ties: number;
  total_points: number;
  taco_count?: number;
}

interface StandingsApiResponse {
  teams: StandingsApiTeam[];
  name: string;
}

const MOCK_TEAMS: TeamRow[] = [
  { rank: 1, name: "Gridiron Gladiators", record: "8–1", pts: "1,342.1" },
  { rank: 2, name: "Dune Coast Marauders", record: "7–2", pts: "1,284.4", me: true },
  { rank: 3, name: "Ironhide Herd", record: "6–3", pts: "1,198.7" },
  { rank: 4, name: "Sunday Morning Comeback", record: "5–4", pts: "1,156.2" },
  { rank: 5, name: "Bye Week Heroes", record: "4–5", pts: "1,102.8" },
  { rank: 6, name: "Hail Mary SZN", record: "3–6", pts: "1,054.3" },
  { rank: 7, name: "The Soggy Pigeons", record: "2–7", pts: "987.6", taco: true },
  { rank: 8, name: "Taco Town Titans", record: "1–8", pts: "923.4", taco: true },
];

function toRows(apiData: StandingsApiResponse | null): TeamRow[] {
  if (!apiData?.teams) return MOCK_TEAMS;
  return apiData.teams
    .sort((a, b) => b.wins - a.wins || b.total_points - a.total_points)
    .map((t, i) => ({
      rank: i + 1,
      name: t.name,
      record: `${t.wins}–${t.losses}${t.ties > 0 ? `–${t.ties}` : ""}`,
      pts: t.total_points.toFixed(1),
      me: false,
      taco: (t.taco_count ?? 0) > 0,
    }));
}

export default function Standings() {
  const { data: apiData } = useApi<StandingsApiResponse>("/api/league/standings", { teams: [], name: "Sleepiez" });
  const teams = toRows(apiData);

  return (
    <>
      <div className="pt-3 mb-2">
        <h2 className="font-display text-display-lg font-bold">Standings</h2>
        <p className="text-body-sz text-ink-600 mt-1">{apiData?.name ?? "Sleepiez"} · Week 9</p>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-caption text-ink-400 border-b border-line-200">
              <th className="py-3 px-2 font-bold">#</th>
              <th className="py-3 px-2 font-bold">Team</th>
              <th className="py-3 px-2 font-bold text-right">Record</th>
              <th className="py-3 px-2 font-bold text-right">PF</th>
              <th className="py-3 px-2 font-bold text-right">🌮</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-200">
            {teams.map((t) => (
              <tr key={t.rank} className={t.me ? "bg-gold-100" : ""}>
                <td className="py-2.5 px-2 font-bold font-display text-sm">{t.rank}</td>
                <td className="py-2.5 px-2 font-semibold text-sm">
                  {t.name}
                  {t.me && <span className="text-caption text-gold-600"> — you</span>}
                  {t.taco && <span className="ml-1">🌮</span>}
                </td>
                <td className="py-2.5 px-2 text-right text-sm text-ink-600">{t.record}</td>
                <td className="py-2.5 px-2 text-right text-sm font-display font-bold">{t.pts}</td>
                <td className="py-2.5 px-2 text-right text-sm">{t.taco ? "×1" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
