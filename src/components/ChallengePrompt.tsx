import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api";

export default function ChallengePrompt() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    // Only show if user hasn't dismissed it on any device
    if (user.challenge_prompt_seen) return;

    const timer = setTimeout(() => setOpen(true), 800);
    return () => clearTimeout(timer);
  }, [user]);

  async function handleGo() {
    setOpen(false);
    // Mark as seen on the server
    await api.post("/api/auth/dismiss-challenge-prompt").catch(() => {});
    navigate("/draft-prep");
  }

  async function handleDismiss() {
    setOpen(false);
    await api.post("/api/auth/dismiss-challenge-prompt").catch(() => {});
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-6">
      <div className="bg-surface rounded-lg p-6 max-w-sm w-full shadow-nav">
        <div className="text-center">
          <div className="text-4xl mb-3">📅</div>
          <h2 className="font-display text-title font-bold mb-2">Challenge is live!</h2>
          <p className="text-body-sz text-ink-600 mb-4">
            Week 1 trivia is open — 2010s Pop &amp; Indie. Answer 5 questions to earn your draft pick.
          </p>

          <div className="bg-cream-50 rounded-lg p-4 mb-4 flex items-center gap-3">
            <div className="bg-ink-900 rounded-pill flex items-center gap-1 px-4 py-2">
              <span className="text-white text-xs font-bold">📅</span>
              <span className="text-white text-xs font-bold">Prep</span>
            </div>
            <span className="text-sm font-semibold text-ink-600">→</span>
            <span className="text-sm font-semibold">Tap the Prep tab below</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDismiss}
              className="flex-1 bg-cream-100 text-ink-600 font-bold text-sm rounded-pill px-5 py-3 border-none cursor-pointer"
            >
              Later
            </button>
            <button
              onClick={handleGo}
              className="flex-1 bg-gold-500 text-ink-900 font-bold text-sm rounded-pill px-5 py-3 border-none cursor-pointer"
            >
              Take me there
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
