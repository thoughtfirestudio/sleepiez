import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Welcome() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Already logged-in users get redirected to dashboard
  if (loading) return null;
  if (user) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
         style={{ paddingTop: "max(40px, env(safe-area-inset-top))", paddingBottom: "max(40px, env(safe-area-inset-bottom))" }}>
      <div className="text-7xl mb-5">🏈</div>
      <h1 className="font-display text-display-xl font-extrabold mb-2">Sleepy Joezzz</h1>
      <p className="text-body-sz text-ink-600 max-w-xs mb-8">
        Fantasy football for the homiez. Check your lineup, talk your trash.
      </p>
      <button
        className="btn-primary px-10 py-4 text-base"
        onClick={() => navigate("/pick-homie")}
      >
        Who are you?
      </button>
      <p className="text-caption text-ink-400 mt-6">
        6 homiez · 0.5 PPR · Chaos rules pending
      </p>
    </div>
  );
}
