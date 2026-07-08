import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api";

interface ChallengeInfo {
  id: string;
  week_number: number;
  title: string;
  description: string;
  opens_at: string;
  closes_at: string;
  is_open: boolean;
  is_past: boolean;
  is_future: boolean;
  question_count: number;
}

interface ChallengeDetail extends ChallengeInfo {
  questions: { q: string; options: string[] }[];
}

interface StandingEntry {
  user_id: string;
  display_name: string;
  team_name: string;
  abbreviation: string;
  total_score: number;
  challenges_completed: number;
  draft_pick: number;
}

export default function DraftPrep() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<ChallengeInfo[]>([]);
  const [current, setCurrent] = useState<ChallengeDetail | null>(null);
  const [standings, setStandings] = useState<StandingEntry[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number } | null>(null);

  const fetchAll = useCallback(async () => {
    const [c, cur, s] = await Promise.all([
      api.get<ChallengeInfo[]>("/api/challenges").catch(() => []),
      api.get<ChallengeDetail>("/api/challenges/current").catch(() => null),
      api.get<{ standings: StandingEntry[] }>("/api/challenges/standings").catch(() => ({ standings: [] })),
    ]);
    setChallenges(c);
    setCurrent(cur);
    setStandings(s.standings);
    if (cur?.is_open) {
      setSelectedAnswers(new Array(cur.questions?.length || 0).fill(-1));
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function handleSubmit() {
    if (!current || selectedAnswers.includes(-1)) return;
    try {
      const res = await api.post<{ score: number; total: number }>(
        `/api/challenges/${current.id}/submit`,
        selectedAnswers,
      );
      setResult(res);
      setSubmitted(true);
      fetchAll();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to submit");
    }
  }

  const draftDate = new Date("2026-08-26T20:00:00Z");
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((draftDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="pt-3" style={{ paddingBottom: "calc(80px + env(safe-area-inset-bottom))" }}>
      {/* Countdown header */}
      <div className="bg-ink-900 rounded-lg p-5 text-center mb-5 shadow-nav">
        <div className="text-gold-500 font-display text-[11px] font-bold uppercase tracking-widest mb-1">
          Days Until Draft
        </div>
        <div className="font-display text-display-xl font-extrabold text-white">{daysLeft}</div>
        <div className="text-ink-400 text-xs mt-1">Wednesday, August 26</div>
      </div>

      {/* Timeline */}
      <h3 className="font-display text-title font-bold mb-3">Challenge Timeline</h3>
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {challenges.map((c) => {
          const isCurrent = current?.id === c.id;
          return (
            <div
              key={c.id}
              className={`shrink-0 w-20 h-24 rounded-lg flex flex-col items-center justify-center text-center ${
                c.is_past ? "bg-green-100 text-green-600" :
                isCurrent ? "bg-gold-500 text-ink-900" :
                "bg-surface shadow-card text-ink-400"
              }`}
            >
              <div className="text-[11px] font-bold">W{c.week_number}</div>
              <div className="text-[18px] font-bold font-display mt-1">
                {c.is_past ? "✓" : isCurrent ? "●" : "·"}
              </div>
              <div className="text-[9px] mt-1 font-semibold leading-tight px-1">{c.title}</div>
            </div>
          );
        })}
        <div className="shrink-0 w-20 h-24 rounded-lg bg-gold-100 text-gold-600 flex flex-col items-center justify-center text-center">
          <div className="text-[11px] font-bold">🏆</div>
          <div className="text-[18px] font-bold font-display mt-1">Draft</div>
          <div className="text-[9px] mt-1 font-semibold">Aug 26</div>
        </div>
      </div>

      {/* Active challenge */}
      {current?.is_open && !submitted && (
        <div className="card p-4 mb-5">
          <div className="text-caption text-gold-600 font-bold mb-1">Week {current.week_number} — Active</div>
          <h3 className="font-display text-title font-bold mb-1">{current.title}</h3>
          <p className="text-body-sz text-ink-600 mb-4">{current.description}</p>

          {current.questions?.map((q, qi) => (
            <div key={qi} className="mb-4">
              <p className="text-sm font-bold mb-2">{qi + 1}. {q.q}</p>
              <div className="flex flex-col gap-1.5">
                {q.options.map((opt, oi) => (
                  <label
                    key={oi}
                    className={`flex items-center gap-3 px-4 py-3 rounded-pill text-sm font-semibold border-2 cursor-pointer transition-colors ${
                      selectedAnswers[qi] === oi
                        ? "border-gold-500 bg-gold-50 text-ink-900"
                        : "border-line-200 bg-surface text-ink-600"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      selectedAnswers[qi] === oi ? "bg-gold-500 text-ink-900" : "bg-cream-100 text-ink-400"
                    }`}>
                      {String.fromCharCode(65 + oi)}
                    </div>
                    {opt}
                    <input
                      type="radio"
                      name={`q-${qi}`}
                      className="hidden"
                      checked={selectedAnswers[qi] === oi}
                      onChange={() => {
                        const next = [...selectedAnswers];
                        next[qi] = oi;
                        setSelectedAnswers(next);
                      }}
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button
            className="btn-primary w-full mt-2"
            onClick={handleSubmit}
            disabled={selectedAnswers.includes(-1)}
          >
            Submit answers
          </button>
        </div>
      )}

      {/* Submitted / result */}
      {result && (
        <div className="card-accent p-4 mb-5 text-center">
          <div className="text-3xl mb-2">✅</div>
          <h3 className="font-display text-title font-bold">Challenge Complete!</h3>
          <p className="text-display-lg font-extrabold text-gold-600 mt-2">{result.score}/{result.total}</p>
        </div>
      )}

      {/* No active challenge */}
      {current && !current.is_open && !submitted && (
        <div className="card p-5 mb-5 text-center">
          <div className="text-3xl mb-2">📅</div>
          <h3 className="font-display text-title font-bold mb-1">{current.title}</h3>
          <p className="text-body-sz text-ink-600">
            Opens {new Date(current.opens_at).toLocaleDateString()} · Closes {new Date(current.closes_at).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* Standings */}
      <h3 className="font-display text-title font-bold mb-3">Draft Order Standings</h3>
      {standings.length === 0 ? (
        <div className="card p-5 text-center">
          <p className="text-ink-400 text-sm">No challenges completed yet. First one starts soon!</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-caption text-ink-400 border-b border-line-200">
                <th className="py-3 px-3 font-bold">Pick</th>
                <th className="py-3 px-2 font-bold">Team</th>
                <th className="py-3 px-2 font-bold text-right">Score</th>
                <th className="py-3 px-2 font-bold text-right">Done</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-200">
              {standings.map((s, i) => {
                const isMe = s.display_name === user?.display_name;
                return (
                  <tr key={s.user_id} className={isMe ? "bg-gold-100" : ""}>
                    <td className="py-3 px-3 font-bold font-display text-sm">{s.draft_pick}</td>
                    <td className="py-3 px-2 font-semibold text-sm">
                      <div>{s.abbreviation}</div>
                      <div className="text-[10px] text-ink-400">{s.display_name}</div>
                    </td>
                    <td className="py-3 px-2 text-right text-sm font-display font-bold">{s.total_score}</td>
                    <td className="py-3 px-2 text-right text-sm text-ink-600">{s.challenges_completed}/{standings.length > 0 ? Math.max(...standings.map(x => x.challenges_completed)) : 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
