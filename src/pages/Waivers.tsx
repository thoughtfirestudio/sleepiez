import { useApi } from "../hooks/useApi";

interface WaiverApiItem {
  id: string;
  player_id: string;
  bid_amount: number;
  status: string;
}

export default function Waivers() {
  const { data: claims } = useApi<WaiverApiItem[]>("/api/waivers", []);
  const pendingCount = claims?.filter((c) => c.status === "pending").length ?? 0;

  return (
    <>
      <div className="pt-3 mb-2">
        <div className="flex justify-between items-baseline">
          <div>
            <h2 className="font-display text-display-lg font-bold">Waivers</h2>
            <p className="text-body-sz text-ink-600 mt-1">
              {pendingCount > 0
                ? `${pendingCount} pending claim${pendingCount !== 1 ? "s" : ""}`
                : "No active claims"}
            </p>
          </div>
          <div className="text-right">
            <div className="text-caption text-ink-400">FAAB</div>
            <div className="font-display text-title font-bold">$100</div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {["All", "WR", "RB", "TE", "QB"].map((t) => (
          <div key={t} className={`pos-tab${t === "All" ? " active" : ""}`}>{t}</div>
        ))}
      </div>

      {pendingCount === 0 ? (
        <div className="card p-8 text-center">
          <div className="text-3xl mb-3">🔄</div>
          <p className="text-ink-600 text-sm">No waiver claims yet. Browse available players once the season starts.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {claims?.filter((c) => c.status === "pending").map((c) => (
            <div key={c.id} className="player-card bench">
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold">
                  Claim <span className="text-caption text-ink-600">${c.bid_amount}</span>
                </div>
                <div className="text-[11px] text-ink-600 mt-0.5">Status: {c.status}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
