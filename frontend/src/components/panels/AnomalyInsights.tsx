import { ANOMALY } from "../../mocks/data";

// Simple deterministic constellation of dots
const DOTS = [
  { x: 30, y: 70 }, { x: 55, y: 45 }, { x: 80, y: 65 }, { x: 105, y: 35 },
  { x: 130, y: 55 }, { x: 155, y: 40 }, { x: 180, y: 70 }, { x: 95, y: 80 },
  { x: 145, y: 80 }, { x: 65, y: 90 },
];
const EDGES = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[1,7],[4,7],[5,8],[2,8],[0,9]];
const ANOMALOUS = [3, 5]; // dots above threshold

export default function AnomalyInsights() {
  return (
    <div className="panel h-full flex flex-col p-3">
      <span className="panel-title mb-3">Memory Insights</span>
      <div className="flex items-center gap-3 flex-1">
        {/* Constellation */}
        <div className="flex-1">
          <svg width="100%" viewBox="0 0 210 120" className="overflow-visible">
            {EDGES.map(([a, b], i) => (
              <line
                key={i}
                x1={DOTS[a].x} y1={DOTS[a].y}
                x2={DOTS[b].x} y2={DOTS[b].y}
                stroke="rgba(56,189,248,0.25)" strokeWidth="1"
              />
            ))}
            {DOTS.map(({ x, y }, i) => {
              const anomalous = ANOMALOUS.includes(i);
              return (
                <circle
                  key={i} cx={x} cy={y} r={anomalous ? 5 : 3.5}
                  fill={anomalous ? "#EF4444" : "#22D3EE"}
                  opacity={0.85}
                  style={{ filter: `drop-shadow(0 0 ${anomalous ? 5 : 3}px ${anomalous ? "#EF4444" : "#22D3EE"})` }}
                />
              );
            })}
          </svg>
        </div>
        {/* Stats */}
        <div className="flex flex-col gap-3 min-w-[90px]">
          <div>
            <p className="text-[10px] text-text-off">Anomaly Score</p>
            <p className="font-orbitron text-sm" style={{ color: ANOMALY.score >= ANOMALY.threshold ? "#EF4444" : "#22D3EE" }}>
              {ANOMALY.score.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-text-off">Threshold</p>
            <p className="font-orbitron text-sm text-text-sec">{ANOMALY.threshold.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[10px] text-text-off">Events</p>
            <p className="font-orbitron text-sm text-text-main">{ANOMALY.events.toLocaleString()}</p>
          </div>
        </div>
      </div>
      <button className="mt-2 text-[11px] text-text-sec hover:text-cyan-DEFAULT flex items-center gap-1 self-end">
        View Memory Map <span style={{ color: "#22D3EE" }}>›</span>
      </button>
    </div>
  );
}
