import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../api";

/**
 * Auto-tracks page views and provides a track() function
 * for manual event logging. Silently fails if API is down.
 */
export function useTracking() {
  const location = useLocation();
  const prevPath = useRef("");

  useEffect(() => {
    const path = location.pathname + location.search;
    if (path === prevPath.current) return;
    prevPath.current = path;

    api.post("/api/events?event_type=page_view&page_url=" + encodeURIComponent(path))
      .catch(() => {});
  }, [location]);
}

export function trackEvent(eventType: string, data?: Record<string, unknown>) {
  const params = new URLSearchParams({ event_type: eventType });
  if (data) params.set("event_data", JSON.stringify(data));
  api.post(`/api/events?${params}`).catch(() => {});
}

// Key events used across the app
export const Events = {
  login: () => trackEvent("login"),
  logout: () => trackEvent("logout"),
  challengeSubmit: (week: number, score: number) =>
    trackEvent("challenge_submit", { week, score }),
  draftPick: (playerName: string) =>
    trackEvent("draft_pick", { player: playerName }),
  matchupView: () => trackEvent("matchup_view"),
  standingsView: () => trackEvent("standings_view"),
} as const;
