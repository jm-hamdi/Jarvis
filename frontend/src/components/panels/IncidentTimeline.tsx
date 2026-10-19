import { TIMELINE } from "../../mocks/data";

export default function IncidentTimeline() {
  return (
    <div className="panel h-full flex flex-col p-3">
      <div className="flex items-center mb-3">
        <span className="panel-title">Mission Timeline</span>
        <span className="ml-auto text-[11px] text-text-sec">Today</span>
      </div>
      <div className="flex flex-col gap-3 flex-1 overflow-hidden">
        {TIMELINE.map(({ time, label, bar, status, color }) => (
          <div key={label} className="flex items-start gap-2">
            <span className="text-[10px] text-text-off w-10 flex-shrink-0 pt-0.5">{time}</span>
            <div className="flex flex-col flex-1 gap-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-text-main truncate">{label}</span>
                <span
                  className="text-[10px] flex-shrink-0 ml-2"
                  style={{ color: status === "Done" ? "#22C55E" : "#F59E0B" }}
                >
                  {status}
                </span>
              </div>
              <div className="h-1 rounded-full w-full" style={{ background: "rgba(56,189,248,0.15)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${bar}%`, background: color, boxShadow: `0 0 4px ${color}80` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="mt-2 text-[11px] text-text-sec hover:text-cyan-DEFAULT flex items-center gap-1 self-end">
        View Full Schedule <span style={{ color: "#22D3EE" }}>›</span>
      </button>
    </div>
  );
}
