const THRESHOLD = 0.80;

const DOTS = [
  { x: 30, y: 70 }, { x: 55, y: 45 }, { x: 80, y: 65 }, { x: 105, y: 35 },
  { x: 130, y: 55 }, { x: 155, y: 40 }, { x: 180, y: 70 }, { x: 95, y: 80 },
  { x: 145, y: 80 }, { x: 65, y: 90 },
];
const EDGES = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[1,7],[4,7],[5,8],[2,8],[0,9]];

interface Props { anomalyScore: number }

export default function AnomalyInsights({ anomalyScore }: Props) {
  const isAlert = anomalyScore >= THRESHOLD;
  // Dynamically mark dots as anomalous based on score
  const anomalousCount = Math.round(anomalyScore * DOTS.length);
  const anomalousSet = new Set(
    [...DOTS.keys()].sort(() => 0.5 - Math.sin(anomalyScore * 100)).slice(0, anomalousCount)
  );

  return (
    <div className="panel flex flex-col p-3" style={{height:"100%"}}>
      <span className="panel-title mb-3">Anomaly Insights</span>
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
              const anomalous = anomalousSet.has(i);
              const dotColor = anomalous ? "#EF4444" : "#22D3EE";
              return (
                <circle
                  key={i} cx={x} cy={y} r={anomalous ? 5 : 3.5}
                  fill={dotColor}
                  opacity={0.85}
                  style={{ filter: `drop-shadow(0 0 ${anomalous ? 5 : 3}px ${dotColor})` }}
                />
              );
            })}
          </svg>
        </div>
        {/* Stats */}
        <div className="flex flex-col gap-3 min-w-[90px]">
          <div>
            <p className="text-[10px] text-text-off">Anomaly Score</p>
            <p className="font-orbitron text-sm" style={{ color: isAlert ? "#EF4444" : "#22D3EE" }}>
              {anomalyScore.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-text-off">Threshold</p>
            <p className="font-orbitron text-sm text-text-sec">{THRESHOLD.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[10px] text-text-off">Events</p>
            <p className="font-orbitron text-sm text-text-main">1 247</p>
          </div>
        </div>
      </div>
      <button className="mt-2 text-[11px] text-text-sec hover:text-cyan-DEFAULT flex items-center gap-1 self-end">
        View Anomaly Map <span style={{ color: "#22D3EE" }}>›</span>
      </button>
    </div>
  );
}
