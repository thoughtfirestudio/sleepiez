import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useApi } from "../hooks/useApi";
import { Events } from "../hooks/useTracking";

interface LeagueApiResponse {
  name: string;
  scoring_type: string;
  roster_size: number;
  waiver_budget: number;
}

export default function Profile() {
  const { user, logout } = useAuth();
  const { data: league } = useApi<LeagueApiResponse>("/api/league", null);
  const navigate = useNavigate();

  async function handleSignOut() {
    Events.logout();
    await logout();
    navigate("/welcome");
  }

  return (
    <>
      <div className="pt-3 mb-2">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-300 to-gold-500 shrink-0" />
          <div>
            <h2 className="font-display text-display-lg font-bold">
              {user?.display_name ?? "Homiez"}
            </h2>
            <p className="text-body-sz text-ink-600">{user?.email ?? ""}</p>
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
            <button
              onClick={handleSignOut}
              className="font-semibold text-sm text-red-500 cursor-pointer bg-transparent border-none p-0"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
