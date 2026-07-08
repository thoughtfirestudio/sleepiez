import { useApi } from "../hooks/useApi";

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

export default function Standings() {
  const { data: apiData } = useApi<StandingsApiResponse>("/api/league/standings", null);
  const teams = apiData?.teams?.length
    ? [...apiData.teams]
        .sort((a, b) => b.wins - a.wins || b.total_points - a.total_points)
        .map((t, i) => ({
          rank: i + 1,
          name: t.name,
          record: `${t.wins}–${t.losses}${t.ties > 0 ? `–${t.ties}` : ""}`,
          pts: t.total_points.toFixed(1),
          taco: (t.taco_count ?? 0) > 0,
        }))
    : [];

  return (
    <>
      <div className="pt-3 mb-2">
        <h2 className="font-display text-display-lg font-bold">Standings</h2>
        <p className="text-body-sz text-ink-600 mt-1">{apiData?.name ?? "League"} · 2026</p>
      </div>

      {teams.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-ink-400 text-sm font-semibold">No teams in the league yet</p>
        </div>
      ) : (
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
                <tr key={t.rank}>
                  <td className="py-2.5 px-2 font-bold font-display text-sm">{t.rank}</td>
                  <td className="py-2.5 px-2 font-semibold text-sm">
                    {t.name}
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
      )}
    </>
  );
}
