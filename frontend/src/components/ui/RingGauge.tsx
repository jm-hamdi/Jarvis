interface RingGaugeProps {
  value: number;
  label: string;
  color?: string;
  size?: number;
}

export default function RingGauge({ value, label, color = "#22D3EE", size = 80 }: RingGaugeProps) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (value / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke="rgba(56,189,248,0.15)"
            strokeWidth={6}
          />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke={color}
            strokeWidth={6}
            strokeDasharray={`${filled} ${circ}`}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
          <span className="font-orbitron text-sm font-bold" style={{ color }}>{value}%</span>
        </div>
      </div>
      <span className="text-[11px] text-text-sec uppercase tracking-widest">{label}</span>
    </div>
  );
}
