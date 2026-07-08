import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, verify } = useAuth();

  const ownerName = searchParams.get("owner") || "Homie";
  const teamName = searchParams.get("team") || "";

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", ""]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  useEffect(() => {
    if (step === "code") {
      inputRefs[0].current?.focus();
    }
  }, [step]);

  async function handleSendCode() {
    if (!email.includes("@")) {
      setError("Enter a valid email");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await login(email);
      setMessage(result.message);
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setLoading(false);
    }
  }

  function handleCodeChange(index: number, value: string) {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  }

  function handleCodeKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  }

  async function handleVerify() {
    const fullCode = code.join("");
    if (fullCode.length !== 4) return;

    setLoading(true);
    setError("");
    const success = await verify(email, fullCode);
    if (success) {
      navigate("/dashboard");
    } else {
      setError("Invalid or expired code. Try again.");
      setCode(["", "", "", ""]);
      inputRefs[0].current?.focus();
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-10"
         style={{ paddingTop: "max(32px, env(safe-area-inset-top))" }}>
      <button
        className="text-sm font-bold text-ink-600 self-start mb-6 cursor-pointer"
        onClick={() => navigate(step === "code" ? `/login?team=${encodeURIComponent(teamName)}&owner=${encodeURIComponent(ownerName)}` : "/pick-homie")}
      >
        ← Back
      </button>

      <div className="mb-2">
        <span className="inline-block bg-gold-100 text-gold-600 text-caption rounded-pill px-3 py-1 font-bold">
          {ownerName}
        </span>
      </div>
      <h2 className="font-display text-display-lg font-bold mb-2">
        {step === "email" ? "What's your email?" : "Check your email"}
      </h2>
      <p className="text-body-sz text-ink-600 mb-8">
        {step === "email"
          ? "Enter the email you use for the league."
          : `We sent a 4-digit code to ${email}.`}
      </p>

      {error && (
        <div className="bg-red-500/10 text-red-500 text-sm font-semibold rounded-pill px-4 py-2.5 mb-4 text-center">
          {error}
        </div>
      )}

      {message && step === "code" && (
        <div className="bg-gold-100 text-gold-600 text-sm font-semibold rounded-pill px-4 py-2.5 mb-4 text-center">
          {message}
        </div>
      )}

      {step === "email" ? (
        <>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
            className="w-full bg-surface rounded-pill px-5 py-4 text-sm font-semibold border-2 border-line-200 outline-none focus:border-gold-500 mb-4"
            autoFocus
          />
          <button
            className="btn-primary w-full"
            onClick={handleSendCode}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send code"}
          </button>
        </>
      ) : (
        <>
          <div className="flex gap-3 justify-center mb-8">
            {code.map((digit, i) => (
              <input
                key={i}
                ref={inputRefs[i]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(i, e.target.value)}
                onKeyDown={(e) => handleCodeKeyDown(i, e)}
                className="w-14 h-16 bg-surface rounded-md text-display-lg font-extrabold text-center border-2 border-line-200 outline-none focus:border-gold-500"
              />
            ))}
          </div>
          <button
            className="btn-primary w-full"
            onClick={handleVerify}
            disabled={loading || code.join("").length !== 4}
          >
            {loading ? "Verifying..." : "Sign in"}
          </button>
          <button
            className="text-sm font-semibold text-ink-400 mt-4 cursor-pointer"
            onClick={() => { setStep("email"); setCode(["", "", "", ""]); }}
          >
            Wrong email? Try again
          </button>
        </>
      )}
    </div>
  );
}
