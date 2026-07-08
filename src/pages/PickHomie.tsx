import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

interface TeamInfo {
  id: string;
  name: string;
  abbreviation: string;
  owner_name: string | null;
}

export default function PickHomie() {
  const [teams, setTeams] = useState<TeamInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get<TeamInfo[]>("/api/teams")
      .then(setTeams)
      .catch(() => setTeams([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ink-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-10"
         style={{ paddingTop: "max(32px, env(safe-area-inset-top))" }}>
      <button
        className="text-sm font-bold text-ink-600 self-start mb-4 cursor-pointer"
        onClick={() => navigate("/")}
      >
        ← Back
      </button>

      <h2 className="font-display text-display-lg font-bold mb-2">Who are you?</h2>
      <p className="text-body-sz text-ink-600 mb-6">Pick your name to sign in.</p>

      <div className="flex flex-col gap-3">
        {teams.map((team) => (
          <button
            key={team.id}
            className="card p-4 flex items-center gap-4 text-left w-full cursor-pointer border-none"
            onClick={() => {
              // Find the user's email from the team
              navigate(`/login?team=${encodeURIComponent(team.name)}&owner=${encodeURIComponent(team.owner_name || "")}`);
            }}
          >
            <div className="w-[42px] h-[42px] rounded-full bg-cream-100 flex items-center justify-center text-sm font-bold font-display shrink-0">
              {team.abbreviation}
            </div>
            <div>
              <div className="text-sm font-bold">{team.owner_name || team.name}</div>
              <div className="text-[11px] text-ink-600">{team.name}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
