import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api";

interface TeamInfo {
  id: string;
  name: string;
  abbreviation: string;
  owner_name: string | null;
  picks: number;
}

interface DraftStatus {
  in_progress: boolean;
  current_round: number;
  total_rounds: number;
  picks_made: number;
  total_picks: number;
  current_team: TeamInfo | null;
  drafted_players: string[];
  teams: TeamInfo[];
}

interface PlayerInfo {
  id: string;
  first_name: string;
  last_name: string;
  position: string;
  team_abbr: string | null;
  bye_week: number | null;
}

export default function DraftBoard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<DraftStatus | null>(null);
  const [available, setAvailable] = useState<PlayerInfo[]>([]);
  const [posFilter, setPosFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [picking, setPicking] = useState(false);
  const [message, setMessage] = useState("");

  const isMyTurn = status?.current_team?.owner_name === user?.display_name;

  const fetchStatus = useCallback(async () => {
    try {
      const s = await api.get<DraftStatus>("/api/draft/status");
      setStatus(s);
    } catch {
      setStatus(null);
    }
  }, []);

  const fetchAvailable = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (posFilter !== "ALL") params.set("position", posFilter);
      if (search.trim()) params.set("search", search.trim());
      const players = await api.get<PlayerInfo[]>(`/api/draft/available?${params}`);
      setAvailable(players);
    } catch {
      setAvailable([]);
    }
  }, [posFilter, search]);

  useEffect(() => {
    fetchStatus().then(() => setLoading(false));
  }, [fetchStatus]);

  useEffect(() => {
    fetchAvailable();
  }, [fetchAvailable]);

  async function handlePick(playerId: string) {
    if (!isMyTurn || picking) return;
    setPicking(true);
    setMessage("");
    try {
      const result = await api.post<{ ok: boolean; player: string; slot: string }>(
        `/api/draft/pick?player_id=${playerId}`
      );
      setMessage(`✅ Drafted ${result.player} (${result.slot})`);
      await fetchStatus();
      await fetchAvailable();
    } catch (err) {
      setMessage(`❌ ${err instanceof Error ? err.message : "Pick failed"}`);
    } finally {
      setPicking(false);
    }
  }

  if (loading) {
    return <div className="pt-10 text-center text-ink-400">Loading draft...</div>;
  }

  return (
    <div className="pt-3" style={{ paddingBottom: "calc(80px + env(safe-area-inset-bottom))" }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="font-display text-display-lg font-bold">Draft</h2>
          {status && (
            <p className="text-body-sz text-ink-600">
              Round {status.current_round} of {status.total_rounds} · {status.picks_made} picks in
            </p>
          )}
        </div>
        {status?.current_team && (
          <div className={`text-right px-4 py-2 rounded-pill text-xs font-bold ${isMyTurn ? "bg-gold-500 text-ink-900" : "bg-cream-100 text-ink-600"}`}>
            {isMyTurn ? "YOUR PICK" : `${status.current_team.owner_name ?? status.current_team.name} picking`}
          </div>
        )}
      </div>

      {/* Pick message */}
      {message && (
        <div className="card-accent p-3 mb-3 text-sm font-semibold text-center">{message}</div>
      )}

      {/* Teams overview */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {status?.teams.map((t) => {
          const isMe = t.owner_name === user?.display_name;
          const isCurrent = status.current_team?.id === t.id;
          return (
            <div
              key={t.id}
              className={`shrink-0 px-3 py-2 rounded-pill text-center text-[11px] font-bold ${
                isCurrent ? "bg-ink-900 text-white" : isMe ? "bg-gold-100 text-ink-900" : "bg-surface shadow-card"
              }`}
            >
              <div>{t.abbreviation}</div>
              <div className="opacity-60">{t.picks} picks</div>
            </div>
          );
        })}
      </div>

      {/* Search + Position filters */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          placeholder="Search players..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-surface rounded-pill px-4 py-2.5 text-xs font-semibold border-2 border-line-200 outline-none focus:border-gold-500"
        />
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {["ALL", "QB", "RB", "WR", "TE", "K", "DEF"].map((p) => (
          <div
            key={p}
            className={`pos-tab${posFilter === p ? " active" : ""}`}
            onClick={() => setPosFilter(p)}
          >
            {p}
          </div>
        ))}
      </div>

      {/* Available players */}
      {available.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="text-3xl mb-3">🏆</div>
          <p className="text-ink-600 text-sm">No available players matching filters.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {available.map((p) => (
            <div
              key={p.id}
              className={`player-card bench cursor-pointer transition-colors ${isMyTurn && !picking ? "hover:bg-gold-100" : "opacity-80"}`}
              onClick={() => handlePick(p.id)}
            >
              <div className="w-[38px] h-[38px] rounded-full bg-surface flex items-center justify-center text-sm font-bold font-display shrink-0 shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
                {p.position}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold">
                  {p.first_name} {p.last_name}
                </div>
                <div className="text-[11px] text-ink-600 mt-0.5">
                  {p.position} · {p.team_abbr ?? "FA"}{p.bye_week ? ` · Bye ${p.bye_week}` : ""}
                </div>
              </div>
              {isMyTurn && !picking && (
                <div className="text-caption text-gold-600 font-bold">Pick</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
