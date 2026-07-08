import { useApi } from "../hooks/useApi";

interface UserApiResponse {
  id: string;
  email: string;
  display_name: string | null;
  is_admin: boolean;
}

interface LeagueApiResponse {
  name: string;
  scoring_type: string;
  roster_size: number;
  waiver_budget: number;
}

export default function Profile() {
  const { data: user } = useApi<UserApiResponse>("/api/auth/me", null);
  const { data: league } = useApi<LeagueApiResponse>("/api/league", null);

  return (
    <>
      <div className="pt-3 mb-2">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-300 to-gold-500 shrink-0" />
          <div>
            <h2 className="font-display text-display-lg font-bold">
              {user?.display_name ?? "Homiez"}
            </h2>
            <p className="text-body-sz text-ink-600">{user?.email ?? "Not signed in"}</p>
          </div>
        </div>

        <div className="card divide-y divide-line-200">
          <div className="flex justify-between items-center p-4">
            <span className="font-semibold text-sm">League</span>
            <span className="text-ink-400 text-sm">{league?.name ?? "—"}</span>
          </div>
          <div className="flex justify-between items-center p-4">
            <span className="font-semibold text-sm">Scoring</span>
            <span className="text-ink-400 text-sm">{league?.scoring_type?.toUpperCase() ?? "—"}</span>
          </div>
          <div className="flex justify-between items-center p-4">
            <span className="font-semibold text-sm">Roster size</span>
            <span className="text-ink-400 text-sm">{league?.roster_size ?? "—"}</span>
          </div>
          <div className="flex justify-between items-center p-4">
            <span className="font-semibold text-sm">FAAB</span>
            <span className="text-ink-400 text-sm">${league?.waiver_budget ?? "—"}</span>
          </div>
          <div className="p-4">
            <span className="font-semibold text-sm text-red-500 cursor-pointer">
              Sign out
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
