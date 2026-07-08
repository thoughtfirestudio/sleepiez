import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api";
import { Events } from "../hooks/useTracking";

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
  submission: { score: number; total: number } | null;
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

const WEEK_THEMES: Record<number, { emoji: string; accent: string }> = {
  1: { emoji: "🎵", accent: "gold" },
  2: { emoji: "🎬", accent: "blue" },
  3: { emoji: "🧪", accent: "green" },
  4: { emoji: "💍", accent: "purple" },
  5: { emoji: "✨", accent: "yellow" },
  6: { emoji: "🔊", accent: "pink" },
};

const ACCENT_COLORS: Record<string, string> = {
  gold: "#F4C43D", blue: "#60A5FA", green: "#34D399",
  purple: "#A78BFA", yellow: "#FBBF24", pink: "#F472B6",
};

const SCORE_MESSAGES = [
  { min: 5, msg: "Perfect! You're a genius 🧠", emojis: "🏆🔥💀" },
  { min: 4, msg: "Close! One more brain cell and you'd have it", emojis: "👏🎯😤" },
  { min: 3, msg: "Mid. Absolutely mid.", emojis: "🤷‍♂️💤📉" },
  { min: 2, msg: "Did you even try? Be honest.", emojis: "🙈💀😂" },
  { min: 0, msg: "Bro. BRO.", emojis: "🤡🪦💀" },
];

function getScoreMessage(score: number, total: number) {
  const pct = score / total;
  if (pct === 1) return SCORE_MESSAGES[0];
  if (pct >= 0.8) return SCORE_MESSAGES[1];
  if (pct >= 0.6) return SCORE_MESSAGES[2];
  if (pct >= 0.4) return SCORE_MESSAGES[3];
  return SCORE_MESSAGES[4];
}

export default function DraftPrep() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<ChallengeInfo[]>([]);
  const [current, setCurrent] = useState<ChallengeDetail | null>(null);
  const [standings, setStandings] = useState<StandingEntry[]>([]);
  const [qu, setQu] = useState(0); // current question index
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number } | null>(null);
  const [celebrating, setCelebrating] = useState(false);

  const fetchAll = useCallback(async () => {
    const [c, cur, s] = await Promise.all([
      api.get<ChallengeInfo[]>("/api/challenges").catch(() => []),
      api.get<ChallengeDetail>("/api/challenges/current").catch(() => null),
      api.get<{ standings: StandingEntry[] }>("/api/challenges/standings").catch(() => ({ standings: [] })),
    ]);
    setChallenges(c);
    setCurrent(cur);
    setStandings(s.standings);
    if (cur?.is_open && cur.questions) {
      setAnswers(new Array(cur.questions.length).fill(-1));
      setQu(0);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  function selectAnswer(oi: number) {
    const next = [...answers];
    next[qu] = oi;
    setAnswers(next);
    // If not on last question, auto-advance after a brief flash
    if (qu < (current?.questions?.length || 1) - 1) {
      setTimeout(() => setQu((q) => q + 1), 200);
    }
  }

  function goToQuestion(i: number) {
    if (i >= 0 && i < (current?.questions?.length || 0)) setQu(i);
  }

  async function handleSubmit() {
    if (!current || answers.includes(-1)) return;
    try {
      const res = await api.post<{ score: number; total: number }>(
        `/api/challenges/${current.id}/submit`, answers,
      );
      setResult(res);
      setSubmitted(true);
      setCelebrating(true);
      Events.challengeSubmit(current.week_number, res.score);
      try { navigator.vibrate?.(80); } catch {}
      setTimeout(() => setCelebrating(false), 3000);
      fetchAll();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to submit");
    }
  }

  // Check if already submitted — show results immediately
  const alreadySubmitted = current?.submission;
  if (alreadySubmitted && !result) {
    setResult(alreadySubmitted);
    setSubmitted(true);
  }

  const draftDate = new Date("2026-08-26T20:00:00Z");
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((draftDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const theme = current ? WEEK_THEMES[current.week_number] || WEEK_THEMES[1] : WEEK_THEMES[1];
  const accentColor = ACCENT_COLORS[theme.accent] || ACCENT_COLORS.gold;
  const qs = current?.questions || [];
  const answered = answers.filter((a) => a >= 0).length;

  return (
    <div className="pt-3" style={{ paddingBottom: "calc(80px + env(safe-area-inset-bottom))" }}>
      {/* Countdown */}
      <div className="bg-ink-900 rounded-lg p-4 text-center mb-4 shadow-nav">
        <div className="text-gold-500 font-display text-[10px] font-bold uppercase tracking-widest">Draft in</div>
        <div className="font-display text-display-lg font-extrabold text-white">{daysLeft}</div>
        <div className="text-ink-400 text-[10px]">Wednesday, August 26</div>
      </div>

      {/* Week timeline */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
        {challenges.map((c) => {
          const isActive = current?.id === c.id;
          const t = WEEK_THEMES[c.week_number] || { emoji: "❓", accent: "gold" };
          return (
            <div key={c.id} className={`shrink-0 w-16 h-20 rounded-lg flex flex-col items-center justify-center text-center ${
              c.is_past ? "bg-green-100 text-green-600 opacity-60" :
              isActive ? "text-ink-900 font-bold shadow-md" :
              "bg-surface shadow-card text-ink-400"
            }`} style={isActive ? { background: accentColor } : {}}>
              <div className={`text-[18px] ${isActive ? "" : ""}`}>{c.is_past ? "✅" : t.emoji}</div>
              <div className="text-[9px] mt-0.5 font-semibold leading-tight px-0.5">{c.title}</div>
            </div>
          );
        })}
        <div className="shrink-0 w-16 h-20 rounded-lg bg-gold-100 text-gold-600 flex flex-col items-center justify-center text-center">
          <div className="text-[18px]">🏆</div>
          <div className="text-[9px] mt-0.5 font-semibold">Draft</div>
        </div>
      </div>

      {/* Active challenge */}
      {current?.is_open && !submitted && qs.length > 0 && (
        <div className="relative">
          {/* Progress bar */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 h-1.5 rounded-pill bg-line-200 overflow-hidden">
              <div className="h-full rounded-pill transition-all duration-300"
                   style={{ width: `${(answered / qs.length) * 100}%`, background: accentColor }} />
            </div>
            <span className="text-[11px] font-bold text-ink-400">{answered}/{qs.length}</span>
          </div>

          {/* Question card */}
          <div className="card p-5 mb-4" style={{ borderTop: `3px solid ${accentColor}` }}>
            {/* Header row */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">{theme.emoji}</span>
              <div>
                <div className="text-caption font-bold" style={{ color: accentColor }}>Week {current.week_number}</div>
                <div className="text-sm font-bold">{current.title}</div>
              </div>
            </div>

            {/* Question text */}
            <div className="bg-cream-50 rounded-lg p-4 mb-4">
              <p className="text-sm font-bold leading-relaxed">
                <span className="font-mono text-gold-600 font-bold mr-2">Q{qu + 1}.</span>
                {qs[qu].q}
              </p>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-2">
              {qs[qu].options.map((opt, oi) => {
                const selected = answers[qu] === oi;
                return (
                  <button key={oi} onClick={() => selectAnswer(oi)}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-pill text-sm font-semibold border-2 cursor-pointer transition-all active:scale-[0.98] ${
                      selected
                        ? "text-ink-900 shadow-sm"
                        : "border-line-200 bg-surface text-ink-600 hover:border-ink-400"
                    }`}
                    style={selected ? { borderColor: accentColor, background: `${accentColor}18` } : {}}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 transition-colors ${
                      selected ? "text-white" : "bg-cream-100 text-ink-400"
                    }`} style={selected ? { background: accentColor } : {}}>
                      {String.fromCharCode(65 + oi)}
                    </div>
                    <span className="flex-1">{opt}</span>
                    {selected && <span className="text-lg">✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Question dots */}
            <div className="flex justify-center gap-1.5 mt-4">
              {qs.map((_, i) => (
                <button key={i} onClick={() => goToQuestion(i)}
                  className={`w-2.5 h-2.5 rounded-full border-0 cursor-pointer transition-all ${
                    answers[i] >= 0
                      ? "opacity-100" : "opacity-30"
                  } ${i === qu ? "scale-125" : ""}`}
                  style={{ background: answers[i] >= 0 ? accentColor : "#9C988E" }}
                />
              ))}
            </div>
          </div>

          {/* Submit */}
          <button className="btn-primary w-full text-base py-4"
            disabled={answers.includes(-1)}
            onClick={handleSubmit}
          >
            {answers.includes(-1) ? `Answer all questions (${qs.length - answered} left)` : "Submit all answers →"}
          </button>
        </div>
      )}

      {/* No challenge open yet */}
      {current && !current.is_open && !submitted && (
        <div className="card p-6 text-center">
          <div className="text-4xl mb-3">{theme.emoji}</div>
          <h3 className="font-display text-title font-bold mb-1">{current.title}</h3>
          <p className="text-body-sz text-ink-600">Opens {new Date(current.opens_at).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
        </div>
      )}

      {/* Result celebration */}
      {result && (
        <div className={`relative overflow-hidden rounded-lg mb-5 transition-all ${celebrating ? 'scale-[1.02]' : ''}`}
          style={{ background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}44)` }}>
          {celebrating && (
            <div className="absolute inset-0 pointer-events-none text-2xl leading-none">
              {"🏆🔥💀👏🎯😤🕊️🌮🤡💪".split("").map((e, i) => (
                <span key={i} className="absolute animate-bounce"
                  style={{
                    left: `${10 + (i * 9)}%`,
                    top: `${Math.random() * 60}%`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: "0.6s",
                    opacity: 0.8,
                  }}>{e}</span>
              ))}
            </div>
          )}
          <div className="p-6 text-center relative z-10">
            <div className="text-5xl mb-3">{(getScoreMessage(result.score, result.total).emojis)[0]}</div>
            <div className="font-display text-display-lg font-extrabold mb-1">{result.score}/{result.total}</div>
            <p className="text-sm font-bold" style={{ color: accentColor }}>
              {getScoreMessage(result.score, result.total).msg}
            </p>
            <p className="text-[10px] text-ink-400 mt-2">{getScoreMessage(result.score, result.total).emojis}</p>
          </div>
        </div>
      )}

      {/* Standings */}
      <h3 className="font-display text-title font-bold mb-3">Draft Order</h3>
      {standings.length === 0 ? (
        <div className="card p-5 text-center"><p className="text-ink-400 text-sm">No challenges completed yet.</p></div>
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
              {standings.map((s) => {
                const isMe = s.display_name === user?.display_name;
                return (
                  <tr key={s.user_id} className={isMe ? "bg-gold-100" : ""}>
                    <td className="py-3 px-3 font-bold font-display text-sm">{s.draft_pick}</td>
                    <td className="py-3 px-2 font-semibold text-sm">
                      <div>{s.abbreviation}</div>
                      <div className="text-[10px] text-ink-400">{s.display_name}</div>
                    </td>
                    <td className="py-3 px-2 text-right text-sm font-display font-bold">{s.total_score}</td>
                    <td className="py-3 px-2 text-right text-sm text-ink-600">{s.challenges_completed}/{(standings[0]?.challenges_completed || 0)}</td>
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
