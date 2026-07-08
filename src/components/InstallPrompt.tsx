import { useState, useEffect } from "react";

const DISMISS_KEY = "sleepiez_prompt_dismissed_at";
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 1 week

/**
 * Checks if the app is already running as an installed PWA.
 */
function isRunningStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

export default function InstallPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Already installed — never show
    if (isRunningStandalone()) return;

    // Check if dismissed recently (localStorage persists across sessions)
    try {
      const dismissedAt = localStorage.getItem(DISMISS_KEY);
      if (dismissedAt && Date.now() - Number(dismissedAt) < DISMISS_TTL_MS) {
        return; // Still in cooldown
      }
    } catch {
      // noop
    }

    // Show the prompt on any mobile device
    const isMobile = /iphone|ipad|ipod|android|mobile/i.test(navigator.userAgent);
    if (isMobile) {
      setVisible(true);
    }
  }, []);

  // Listen for successful install — auto-hide forever
  useEffect(() => {
    const handler = () => {
      setVisible(false);
      try {
        localStorage.setItem(DISMISS_KEY, String(Date.now()));
      } catch {
        // noop
      }
    };
    window.addEventListener("appinstalled", handler);
    return () => window.removeEventListener("appinstalled", handler);
  }, []);

  function handleDismiss() {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // noop
    }
  }

  if (!visible) return null;

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isAndroid = /android/i.test(navigator.userAgent);

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50"
      style={{
        maxWidth: "calc(448px - 32px)", margin: "0 auto",
        left: "50%", transform: "translateX(-50%)", width: "calc(100% - 32px)",
      }}
    >
      <div className="bg-ink-900 rounded-lg p-4 shadow-nav">
        <div className="flex items-start gap-3">
          <div className="text-2xl shrink-0">🏈</div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-bold">
              {isIOS ? "Add to Home Screen" : "Install Sleepy Joezzz"}
            </p>
            <p className="text-ink-200 text-[11px] mt-1 leading-relaxed">
              {isIOS
                ? "Tap the Share icon in Safari, then scroll down and tap Add to Home Screen."
                : isAndroid
                  ? "Tap the Chrome menu (⋮) → Add to Home Screen for the best experience."
                  : "Install this app for a better experience and faster access."}
            </p>
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            {!isIOS && (
              <button
                onClick={handleDismiss}
                className="text-ink-400 text-[10px] font-bold border-none bg-transparent cursor-pointer whitespace-nowrap"
              >
                Not now
              </button>
            )}
            <button
              onClick={handleDismiss}
              className="text-gold-500 text-[10px] font-bold border-none bg-transparent cursor-pointer"
            >
              {isIOS ? "Got it" : "Skip"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
