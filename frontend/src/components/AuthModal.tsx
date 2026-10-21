import { useState, type FormEvent } from "react";
import { X, ArrowRight, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AuthModalProps {
  onClose: () => void;
  toast: (msg: string) => void;
}

export function AuthModal({ onClose, toast }: AuthModalProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
        toast("Welcome back to Lumina.");
      } else {
        await register(name, email, password);
        toast("Welcome to Lumina — 100 points added to your account.");
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-[#143e35]/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Sign in to Lumina"
    >
      <div className="booking-sheet relative w-full max-w-lg border border-[#d8cdbd] bg-[#f8f2e8] p-6 text-[#143e35] shadow-2xl sm:p-10">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 p-2 text-[#527069] transition-colors hover:text-[#d47d5b]"
        >
          <X size={18} strokeWidth={1.5} />
        </button>

        <div className="font-mono text-[10px] uppercase tracking-[.16em] text-[#d47d5b]">
          {mode === "login" ? "01" : "02"} — Member access
        </div>
        <h2 className="serif mt-4 text-5xl leading-[.9]">
          {mode === "login" ? (
            <>Sign <em>in.</em></>
          ) : (
            <>Join <em>Lumina.</em></>
          )}
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#527069]">
          {mode === "login"
            ? "Access your bookings and reward points."
            : "Create an account and earn 100 welcome points."}
        </p>

        <form onSubmit={submit} className="mt-7 space-y-4">
          {mode === "register" && (
            <label className="block">
              <span className="font-mono text-[10px] uppercase tracking-[.16em] text-[#527069]">Your name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Sofia Ricci"
                className="mt-2 w-full border-b border-[#b9b8a9] bg-transparent py-3 text-[15px] outline-none focus:border-[#d47d5b]"
              />
            </label>
          )}
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[.16em] text-[#527069]">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="mt-2 w-full border-b border-[#b9b8a9] bg-transparent py-3 text-[15px] outline-none focus:border-[#d47d5b]"
            />
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[.16em] text-[#527069]">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Min. 8 characters"
              className="mt-2 w-full border-b border-[#b9b8a9] bg-transparent py-3 text-[15px] outline-none focus:border-[#d47d5b]"
            />
          </label>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-between bg-[#143e35] px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[.16em] text-[#f8f2e8] transition-colors hover:bg-[#d47d5b] disabled:opacity-60"
          >
            <span>{loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</span>
            <ArrowRight size={16} strokeWidth={1.5} />
          </button>
        </form>

        <div className="mt-6 border-t border-[#d8cdbd] pt-5 text-center text-sm text-[#527069]">
          {mode === "login" ? (
            <>
              No account?{" "}
              <button
                onClick={() => { setMode("register"); setError(""); }}
                className="font-semibold text-[#143e35] underline-offset-2 hover:underline"
              >
                Join Lumina
              </button>
            </>
          ) : (
            <>
              Already a member?{" "}
              <button
                onClick={() => { setMode("login"); setError(""); }}
                className="font-semibold text-[#143e35] underline-offset-2 hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}