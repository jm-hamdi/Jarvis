import { INFRA } from "../../mocks/data";
import { Server } from "lucide-react";

const STATUS_COLOR: Record<string, string> = {
  Running:    "#22C55E",
  Down:       "#EF4444",
  Restarting: "#F59E0B",
};

const connected = INFRA.filter(s => s.status === "Running").length;

export default function InfraStatus() {
  return (
    <div className="panel h-full flex flex-col p-3">
      <div className="flex items-center mb-3">
        <span className="panel-title">LLM Status</span>
        <span className="ml-auto badge badge-green">{connected} Connected</span>
      </div>
      <div className="grid grid-cols-3 gap-2 flex-1">
        {INFRA.map(({ name, status, color }) => (
          <div
            key={name}
            className="rounded-lg p-2 flex flex-col items-center gap-1.5"
            style={{
              background: "rgba(12,32,58,0.6)",
              border: `1px solid ${color}25`,
            }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: `${color}20` }}
            >
              <Server size={13} color={color} strokeWidth={1.5} />
            </div>
            <span className="text-[10px] text-text-main text-center leading-tight">{name}</span>
            <span className="text-[10px]" style={{ color: STATUS_COLOR[status] }}>{status}</span>
          </div>
        ))}
      </div>
      <button className="mt-2 text-[11px] text-text-sec hover:text-cyan-DEFAULT flex items-center gap-1 self-end">
        Manage Providers <span style={{ color: "#22D3EE" }}>›</span>
      </button>
    </div>
  );
}
