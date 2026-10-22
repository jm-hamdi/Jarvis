import type { ScenarioState } from "../../mocks/scenario";

interface Props { items: ScenarioState["timeline"] }

export default function IncidentTimeline({ items }: Props) {
  return (
    <div className="panel flex flex-col p-3" style={{ height: "100%" }}>
      <div className="flex items-center mb-2">
        <span className="panel-title">Mission Timeline</span>
        <span className="ml-auto text-[11px] text-text-sec">Today</span>
      </div>
      <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-hidden justify-around">
        {items.map(({ time, label, bar, status, color }) => (
          <div key={label} className="flex items-start gap-2">
            <span className="text-[10px] text-text-off w-11 flex-shrink-0 pt-0.5 leading-tight font-mono">{time}</span>
            <div className="flex flex-col flex-1 gap-0.5 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] text-text-main truncate leading-tight">{label}</span>
                <span
                  className="text-[10px] flex-shrink-0"
                  style={{ color: status === "Done" ? "#22C55E" : status === "Running" ? "#22D3EE" : "#F59E0B" }}
                >
                  {status}
                </span>
              </div>
              <div className="h-[3px] rounded-full w-full" style={{ background: "rgba(56,189,248,0.15)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${bar}%`, background: color, boxShadow: `0 0 4px ${color}80` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="mt-1.5 text-[11px] text-text-sec hover:text-cyan-DEFAULT flex items-center gap-1 self-end">
        View Full Timeline <span style={{ color: "#22D3EE" }}>›</span>
      </button>
    </div>
  );
}
