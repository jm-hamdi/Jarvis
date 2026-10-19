import { useEffect, useState } from "react";
import { Search, LayoutGrid, Bell, Settings } from "lucide-react";
import type { SystemState } from "../../types/events";

interface HeaderProps {
  state: SystemState;
}

const STATE_COLORS: Record<SystemState, { dot: string; text: string; pill: string }> = {
  OPTIMAL:       { dot: "#22C55E", text: "#22C55E", pill: "rgba(34,197,94,0.12)" },
  "UNDER ATTACK":{ dot: "#EF4444", text: "#EF4444", pill: "rgba(239,68,68,0.12)" },
  RECOVERING:    { dot: "#F59E0B", text: "#F59E0B", pill: "rgba(245,158,11,0.12)" },
  RECOVERED:     { dot: "#22C55E", text: "#22C55E", pill: "rgba(34,197,94,0.12)" },
};

export default function Header({ state }: HeaderProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const c = STATE_COLORS[state];

  const fmt = (n: number) => String(n).padStart(2, "0");
  const h = time.getHours() % 12 || 12;
  const ampm = time.getHours() >= 12 ? "pm" : "am";
  const timeStr = `${fmt(h)}:${fmt(time.getMinutes())}:${fmt(time.getSeconds())} ${ampm}`;
  const dateStr = time.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div
      className="flex items-center px-4"
      style={{
        height: 88,
        borderBottom: "1px solid rgba(56,189,248,0.2)",
        background: "rgba(3,9,20,0.92)",
      }}
    >
      {/* Left — System Status Pill */}
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-full"
        style={{ background: c.pill, border: `1px solid ${c.dot}40` }}
      >
        <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: c.dot }} />
        <span className="font-rajdhani font-semibold text-[13px] tracking-widest" style={{ color: c.text }}>
          SYSTEM STATUS
        </span>
        <span className="font-rajdhani font-semibold text-[13px] tracking-widest" style={{ color: c.text }}>
          ● {state}
        </span>
      </div>

      {/* Center — Clock */}
      <div className="flex-1 flex flex-col items-center">
        <span className="text-[11px] text-text-sec">{dateStr}</span>
        <span
          className="font-orbitron font-black tracking-wider"
          style={{ fontSize: 32, color: "#22D3EE", lineHeight: 1.1 }}
        >
          {timeStr}
        </span>
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ background: "rgba(8,22,42,0.7)", border: "1px solid rgba(56,189,248,0.2)" }}
        >
          <Search size={14} color="#7FA3C0" />
          <span className="text-[12px] text-text-off">Search…</span>
        </div>
        {[LayoutGrid, Bell, Settings].map((Icon, i) => (
          <button
            key={i}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-white/5"
            style={{ border: "1px solid rgba(56,189,248,0.15)" }}
          >
            <Icon size={15} color="#7FA3C0" strokeWidth={1.5} />
          </button>
        ))}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.3)" }}
        >
          <div className="w-6 h-6 rounded-full bg-cyan-DEFAULT/20 border border-cyan-DEFAULT/50 flex items-center justify-center">
            <span className="text-[9px] font-bold text-cyan-DEFAULT" style={{ color: "#22D3EE" }}>OP</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold" style={{ color: "#22D3EE" }}>Operator</span>
            <span className="text-[10px] text-text-off">Commander</span>
          </div>
        </div>
      </div>
    </div>
  );
}
