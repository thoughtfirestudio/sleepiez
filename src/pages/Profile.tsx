import { useApi } from "../hooks/useApi";

interface UserApiResponse {
  id: string;
  email: string;
  display_name: string | null;
  is_admin: boolean;
}

export default function Profile() {
  const { data: user } = useApi<UserApiResponse>("/api/auth/me", {
    id: "", email: "markus@example.com", display_name: "Markus", is_admin: false,
  });

  const { data: league } = useApi("/api/league", {
    name: "Sleepiez League",
    roster_size: 16,
    scoring_type: "PPR",
    waiver_budget: 100,
  });

  return (
    <>
      <div className="pt-3 mb-2">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-300 to-gold-500 shrink-0" />
          <div>
            <h2 className="font-display text-display-lg font-bold">
              {user?.display_name ?? "Markus"}
            </h2>
            <p className="text-body-sz text-ink-600">Dune Coast Marauders</p>
          </div>
        </div>

        <div className="card divide-y divide-line-200">
          <div className="flex justify-between items-center p-4">
            <span className="font-semibold text-sm">Notifications</span>
            <span className="text-ink-400 text-sm">On</span>
          </div>
          <div className="flex justify-between items-center p-4">
            <span className="font-semibold text-sm">Scoring</span>
            <span className="text-ink-400 text-sm">{league?.scoring_type ?? "PPR"}</span>
          </div>
          <div className="flex justify-between items-center p-4">
            <span className="font-semibold text-sm">Roster size</span>
            <span className="text-ink-400 text-sm">{league?.roster_size ?? 16}</span>
          </div>
          <div className="flex justify-between items-center p-4">
            <span className="font-semibold text-sm">FAAB budget</span>
            <span className="text-ink-400 text-sm">${league?.waiver_budget ?? 100}</span>
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
