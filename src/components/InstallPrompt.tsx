import { useState, useEffect } from "react";

const STORAGE_KEY = "sleepiez_install_dismissed";

export default function InstallPrompt() {
  const [canInstall, setCanInstall] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    // Persist dismissal across sessions (1 week or until user re-visits)
    try {
      return sessionStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if this is any mobile device
    const ua = navigator.userAgent;
    const mobile = /iphone|ipad|ipod|android|mobile|touch/i.test(ua);
    setIsMobile(mobile);

    // Listen for the beforeinstallprompt event (Chrome on Android)
    const handler = (e: Event) => {
      e.preventDefault();
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // For iOS + desktop Safari that supports PWA but no beforeinstallprompt,
    // always show if it's a mobile device
    if (mobile) {
      setCanInstall(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function handleDismiss() {
    setDismissed(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // noop
    }
  }

  // Don't show on desktop, if dismissed this session, or if not mobile
  if (dismissed || !isMobile || !canInstall) return null;

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50"
      style={{ maxWidth: "calc(448px - 32px)", margin: "0 auto", left: "50%", transform: "translateX(-50%)", width: "calc(100% - 32px)" }}
    >
      <div className="bg-ink-900 rounded-lg p-4 shadow-nav">
        <div className="flex items-start gap-3">
          <div className="text-2xl shrink-0">🏈</div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-bold">Add to Home Screen</p>
            <p className="text-ink-200 text-[11px] mt-1">
              {isIOS
                ? "Tap Share  → Add to Home Screen for the full app experience."
                : "Install Sleepy Joezzz for a better experience and faster access."}
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-ink-400 text-[11px] font-bold shrink-0 border-none bg-transparent cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
