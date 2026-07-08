import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS Safari
    const ua = navigator.userAgent;
    const iOS = /iphone|ipad|ipod/i.test(ua);
    const safari = /safari/i.test(ua) && !/chrome|fxios|opios/i.test(ua);
    setIsIOS(iOS && safari);

    // Listen for the beforeinstallprompt event (Android Chrome / Samsung)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Check if already dismissed or not available
  if (dismissed) return null;
  if (!deferredPrompt && !isIOS) return null;

  async function handleInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === "accepted") {
        setDeferredPrompt(null);
      }
    }
    setDismissed(true);
  }

  function handleDismiss() {
    setDismissed(true);
  }

  return (
    <div className="fixed bottom-24 left-5 right-5 max-w-lg mx-auto z-50 animate-slide-up"
         style={{ left: "50%", transform: "translateX(-50%)", width: "calc(100% - 40px)" }}>
      <div className="bg-ink-900 rounded-lg p-4 shadow-nav">
        <div className="flex items-start gap-3">
          <div className="text-2xl shrink-0">🏈</div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-bold">
              {isIOS ? "Add to Home Screen" : "Install Sleepy Joezzz"}
            </p>
            <p className="text-ink-200 text-[11px] mt-1">
              {isIOS
                ? "Tap Share → Add to Home Screen for the full app experience."
                : "Install the app for a better experience and faster access."}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleInstall}
              className="bg-gold-500 text-ink-900 text-[11px] font-bold rounded-pill px-4 py-2 border-none cursor-pointer"
            >
              {isIOS ? "Got it" : "Install"}
            </button>
            <button
              onClick={handleDismiss}
              className="text-ink-400 text-[11px] font-bold px-2 border-none bg-transparent cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
