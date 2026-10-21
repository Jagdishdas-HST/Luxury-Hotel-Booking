import { useState, useEffect } from "react";
import { X, Star, Gift, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface PointsEntry {
  id: string;
  points: number;
  reason: string;
  createdAt: string | null;
}

interface RewardsPanelProps {
  onClose: () => void;
}

const TIERS = [
  { name: "Wanderer", min: 0, max: 499, color: "#b9b8a9" },
  { name: "Traveller", min: 500, max: 1499, color: "#d47d5b" },
  { name: "Luminary", min: 1500, max: Infinity, color: "#143e35" },
];

function getTier(points: number) {
  return TIERS.find((t) => points >= t.min && points <= t.max) ?? TIERS[0];
}

export function RewardsPanel({ onClose }: RewardsPanelProps) {
  const { user } = useAuth();
  const [history, setHistory] = useState<PointsEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("/api/rewards/history", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setHistory(d.history ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const points = user?.rewardPoints ?? 0;
  const tier = getTier(points);
  const nextTier = TIERS.find((t) => t.min > points);
  const progressPct = nextTier
    ? Math.min(100, ((points - tier.min) / (nextTier.min - tier.min)) * 100)
    : 100;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-end bg-[#143e35]/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Your rewards"
    >
      <div className="booking-sheet relative flex h-full w-full max-w-md flex-col border-l border-[#d8cdbd] bg-[#f8f2e8] text-[#143e35] shadow-2xl overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#d8cdbd] px-7 py-5">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[.16em] text-[#d47d5b]">Member rewards</div>
            <h2 className="serif mt-1 text-3xl">Your points</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close rewards"
            className="p-2 text-[#527069] transition-colors hover:text-[#d47d5b]"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* Points hero */}
        <div className="bg-[#143e35] px-7 py-8 text-[#f8f2e8]">
          <div className="flex items-end justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[.16em] text-[#d6c6b3]">Total points</p>
              <p className="serif mt-1 text-7xl leading-none">{points.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[10px] uppercase tracking-[.16em] text-[#d6c6b3]">Status</p>
              <p className="mt-1 text-lg font-semibold" style={{ color: tier.color === "#143e35" ? "#e8b092" : tier.color }}>
                {tier.name}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="h-1 w-full rounded-full bg-[#f8f2e8]/20">
              <div
                className="h-1 rounded-full bg-[#d47d5b] transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {nextTier ? (
              <p className="mt-2 font-mono text-[10px] text-[#d6c6b3]">
                {nextTier.min - points} pts to {nextTier.name}
              </p>
            ) : (
              <p className="mt-2 font-mono text-[10px] text-[#e8b092]">Highest tier reached</p>
            )}
          </div>
        </div>

        {/* Tier benefits */}
        <div className="border-b border-[#d8cdbd] px-7 py-6">
          <p className="font-mono text-[10px] uppercase tracking-[.16em] text-[#527069]">How to earn</p>
          <div className="mt-4 grid gap-3">
            {[
              { icon: Gift, label: "Welcome bonus", pts: "+100 pts" },
              { icon: Star, label: "Complete a stay", pts: "+250 pts" },
              { icon: Clock, label: "Early booking (30+ days)", pts: "+50 pts" },
            ].map(({ icon: Icon, label, pts }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3 text-[#527069]">
                  <Icon size={15} strokeWidth={1.4} />
                  <span>{label}</span>
                </div>
                <span className="font-mono text-[11px] font-semibold text-[#d47d5b]">{pts}</span>
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        <div className="flex-1 px-7 py-6">
          <p className="font-mono text-[10px] uppercase tracking-[.16em] text-[#527069]">Points history</p>
          {loading ? (
            <p className="mt-4 text-sm text-[#527069]">Loading…</p>
          ) : history.length === 0 ? (
            <p className="mt-4 text-sm text-[#527069]">No history yet.</p>
          ) : (
            <div className="mt-4 grid gap-3">
              {[...history].reverse().map((entry) => (
                <div key={entry.id} className="flex items-center justify-between border-b border-[#d8cdbd] pb-3 text-sm">
                  <div>
                    <p className="text-[#143e35]">{entry.reason}</p>
                    {entry.createdAt && (
                      <p className="mt-0.5 font-mono text-[10px] text-[#b9b8a9]">
                        {new Date(entry.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                  <span className="font-semibold text-[#d47d5b]">+{entry.points}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}