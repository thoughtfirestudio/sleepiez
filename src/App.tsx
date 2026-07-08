import { Routes, Route } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import BottomNav from "./components/BottomNav";
import ShameModal from "./components/ShameModal";
import Dashboard from "./pages/Dashboard";
import Standings from "./pages/Standings";
import Matchups from "./pages/Matchups";
import Waivers from "./pages/Waivers";
import Profile from "./pages/Profile";
import ChaosConfig from "./pages/ChaosConfig";
import { api } from "./api";

interface Announcement {
  id: string;
  type: string;
  title: string;
  message: string;
  emoji: string;
}

export default function App() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);

  const pollAnnouncements = useCallback(async () => {
    try {
      const anns = await api.get<Announcement[]>("/api/chaos/announcements");
      if (anns && anns.length > 0) {
        setAnnouncement(anns[0]);
      }
    } catch {
      // API unavailable — no shame today
    }
  }, []);

  useEffect(() => {
    // Poll every 60 seconds for chaos announcements
    pollAnnouncements();
    const interval = setInterval(pollAnnouncements, 60_000);
    return () => clearInterval(interval);
  }, [pollAnnouncements]);

  async function dismissAnnouncement() {
    if (!announcement) return;
    try {
      await api.post(`/api/chaos/announcements/${announcement.id}/acknowledge`);
    } catch {
      // Best-effort acknowledge
    }
    setAnnouncement(null);
  }

  return (
    <div className="max-w-lg mx-auto min-h-screen flex flex-col relative">
      <main
        className="flex-1 overflow-y-auto px-5 pb-28"
        style={{ paddingTop: "max(16px, env(safe-area-inset-top))" }}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/standings" element={<Standings />} />
          <Route path="/matchups" element={<Matchups />} />
          <Route path="/matchups/:id" element={<Matchups />} />
          <Route path="/waivers" element={<Waivers />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/chaos-config" element={<ChaosConfig />} />
        </Routes>
      </main>
      <BottomNav />

      {/* Chaos shame modal */}
      <ShameModal
        open={announcement !== null}
        title={announcement?.title ?? ""}
        message={announcement?.message ?? ""}
        emoji={announcement?.emoji ?? "🤡"}
        onDismiss={dismissAnnouncement}
      />
    </div>
  );
}
