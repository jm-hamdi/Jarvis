import { Brain, Wrench, CheckCircle, Shield, Eye, BookOpen } from "lucide-react";
import Waveform from "../ui/Waveform";
import { AGENTS } from "../../mocks/data";

const ICONS = [Brain, Wrench, CheckCircle, Shield, Eye, BookOpen];

export default function AgentsGrid() {
  return (
    <div className="panel h-full flex flex-col p-3">
      <div className="flex items-center mb-3">
        <span className="panel-title">Active Agents</span>
        <button className="ml-auto text-[11px] text-text-sec hover:text-cyan-DEFAULT flex items-center gap-1">
          View All <span style={{ color: "#22D3EE" }}>›</span>
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2 flex-1">
        {AGENTS.map(({ name, status, color }, i) => {
          const Icon = ICONS[i];
          const isActive = status === "Active";
          return (
            <div
              key={name}
              className="rounded-lg p-2.5 flex flex-col gap-1.5"
              style={{
                background: "rgba(12,32,58,0.6)",
                border: `1px solid ${isActive ? color + "40" : "rgba(56,189,248,0.15)"}`,
              }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `${color}20` }}
              >
                <Icon size={14} color={color} strokeWidth={1.5} />
              </div>
              <p className="text-[11px] font-semibold text-text-main leading-tight">{name}</p>
              <div className="flex items-center gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: isActive ? color : "#F59E0B" }}
                />
                <span className="text-[10px]" style={{ color: isActive ? color : "#F59E0B" }}>{status}</span>
              </div>
              <Waveform color={isActive ? color : "#F59E0B"} bars={6} height={12} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
