import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import BottomNav from "./components/BottomNav";
import ShameModal from "./components/ShameModal";
import Welcome from "./pages/Welcome";
import PickHomie from "./pages/PickHomie";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Standings from "./pages/Standings";
import Matchups from "./pages/Matchups";
import Waivers from "./pages/Waivers";
import Profile from "./pages/Profile";
import ChaosConfig from "./pages/ChaosConfig";
import DraftBoard from "./pages/DraftBoard";
import DraftPrep from "./pages/DraftPrep";
import InstallPrompt from "./components/InstallPrompt";
import ChallengePrompt from "./components/ChallengePrompt";
import { useTracking } from "./hooks/useTracking";
import { api } from "./api";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/welcome" replace />;
  return <>{children}</>;
}

function AppLayout() {
  const [announcement, setAnnouncement] = useState<{
    id: string;
    title: string;
    message: string;
    emoji: string;
  } | null>(null);

  // Auto-track page views
  useTracking();

  const pollAnnouncements = useCallback(async () => {
    try {
      const anns = await api.get<{
        id: string;
        title: string;
        message: string;
        emoji: string;
      }[]>("/api/chaos/announcements");
      if (anns && anns.length > 0) {
        setAnnouncement(anns[0]);
      }
    } catch {
      // API unavailable
    }
  }, []);

  useEffect(() => {
    pollAnnouncements();
    const interval = setInterval(pollAnnouncements, 60_000);
    return () => clearInterval(interval);
  }, [pollAnnouncements]);

  async function dismissAnnouncement() {
    if (!announcement) return;
    try {
      await api.post(`/api/chaos/announcements/${announcement.id}/acknowledge`);
    } catch {
      // best-effort
    }
    setAnnouncement(null);
  }

  return (
    <div className="max-w-lg mx-auto min-h-screen flex flex-col relative">
      <main
        className="flex-1 overflow-y-auto px-5"
        style={{ paddingTop: "max(16px, env(safe-area-inset-top))" }}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/standings" element={<ProtectedRoute><Standings /></ProtectedRoute>} />
          <Route path="/matchups" element={<ProtectedRoute><Matchups /></ProtectedRoute>} />
          <Route path="/matchups/:id" element={<ProtectedRoute><Matchups /></ProtectedRoute>} />
          <Route path="/waivers" element={<ProtectedRoute><Waivers /></ProtectedRoute>} />
          <Route path="/draft" element={<ProtectedRoute><DraftBoard /></ProtectedRoute>} />
          <Route path="/draft-prep" element={<ProtectedRoute><DraftPrep /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/chaos-config" element={<ProtectedRoute><ChaosConfig /></ProtectedRoute>} />
        </Routes>
      </main>
      <ProtectedRoute><BottomNav /></ProtectedRoute>

      <ShameModal
        open={announcement !== null}
        title={announcement?.title ?? ""}
        message={announcement?.message ?? ""}
        emoji={announcement?.emoji ?? "🤡"}
        onDismiss={dismissAnnouncement}
      />
      <ChallengePrompt />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <InstallPrompt />
      <Routes>
        {/* Landing page (public) — moved from / to /welcome */}
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/pick-homie" element={<PickHomie />} />
        <Route path="/login" element={<Login />} />

        {/* Protected app — / is the dashboard when logged in */}
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </AuthProvider>
  );
}
