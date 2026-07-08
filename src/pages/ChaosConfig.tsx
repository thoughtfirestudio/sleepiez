import { useState, useEffect } from "react";
import { api } from "../api";

interface ChaosRule {
  key: string;
  label: string;
  description: string;
}

const RULES: ChaosRule[] = [
  { key: "clown_car_enabled", label: "🤡 Clown Car", description: "Forces bench > starters swap if bench outscored starters by ≥20 pts" },
  { key: "hex_enabled", label: "🔮 The Hex", description: "Last week's highest scorer gets hexed; opponent gets +3 bonus" },
  { key: "steal_a_player_enabled", label: "🫳 Steal-a-Player", description: "Lowest scorer steals a bench player from highest scorer" },
  { key: "taco_trophy_enabled", label: "🌮 Taco Trophy", description: "Lowest scorer gets a taco appended to their name" },
  { key: "morale_multiplier_enabled", label: "💪 Morale Multiplier", description: "Win/loss margins affect morale, which affects future scores" },
  { key: "auto_rename_enabled", label: "🕊️ 3-Strike Rename", description: "3+ loss streak renames team to 'The [Adjective] Pigeons'" },
];

const DEFAULT_CONFIG: Record<string, boolean> = Object.fromEntries(
  RULES.map((r) => [r.key, false])
);

export default function ChaosConfig() {
  const [config, setConfig] = useState<Record<string, boolean>>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    api.get<Record<string, boolean>>("/api/league/config")
      .then((data) => {
        if (data && typeof data === "object") {
          setConfig({ ...DEFAULT_CONFIG, ...data });
        }
      })
      .catch(() => {
        // Use defaults if API unavailable
        setConfig(DEFAULT_CONFIG);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeCount = Object.values(config).filter(Boolean).length;

  function toggle(key: string) {
    setConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      await api.patch("/api/league/config", config);
      setMessage("Saved! Changes take effect next chaos run (Tue 11 AM).");
    } catch {
      setMessage("Failed to save — API unavailable. Toggling locally only.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="pt-3 mb-2">
        <h2 className="font-display text-display-lg font-bold">Chaos Config</h2>
        <p className="text-body-sz text-ink-600 mt-1">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="pt-3 mb-2">
        <h2 className="font-display text-display-lg font-bold">Chaos Config</h2>
        <p className="text-body-sz text-ink-600 mt-1">
          {activeCount} of {RULES.length} rules active
        </p>
      </div>

      {message && (
        <div className="card-accent p-3 mb-4 text-sm font-semibold text-center">
          {message}
        </div>
      )}

      <div className="flex flex-col gap-2.5 mb-6">
        {RULES.map((rule) => (
          <div
            key={rule.key}
            className="card p-4 flex items-center gap-3 cursor-pointer"
            onClick={() => toggle(rule.key)}
          >
            <div
              className={`w-[44px] h-[44px] rounded-pill flex items-center justify-center text-sm font-bold font-display transition-colors ${
                config[rule.key]
                  ? "bg-gold-500 text-ink-900"
                  : "bg-cream-100 text-ink-400"
              }`}
            >
              {config[rule.key] ? "ON" : "OFF"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold">{rule.label}</div>
              <div className="text-[11px] text-ink-600 mt-0.5">{rule.description}</div>
            </div>
          </div>
        ))}
      </div>

      <button
        className="btn-primary w-full"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save config"}
      </button>
    </>
  );
}
