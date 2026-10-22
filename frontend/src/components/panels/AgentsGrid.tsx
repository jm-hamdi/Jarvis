import { Brain, Wrench, CheckCircle, Shield, Eye, BookOpen } from "lucide-react";
import Waveform from "../ui/Waveform";
import type { ScenarioState } from "../../mocks/scenario";

const AGENT_DEFS = [
  { name: "Detector ML",    icon: Brain,       color: "#22D3EE" },
  { name: "Remediator",     icon: Wrench,      color: "#EF4444" },
  { name: "Verifier",       icon: CheckCircle, color: "#22C55E" },
  { name: "WAF Guard",      icon: Shield,      color: "#A855F7" },
  { name: "SIEM Collector", icon: Eye,         color: "#F59E0B" },
  { name: "Jarvis RAG",     icon: BookOpen,    color: "#38BDF8" },
];

const STATUS_COLOR: Record<string, string> = {
  Active:  "#22C55E",
  Standby: "#F59E0B",
  Running: "#22D3EE",
};

interface Props { agentStates: ScenarioState["agentStates"] }

export default function AgentsGrid({ agentStates }: Props) {
  return (
    <div className="panel flex flex-col p-3" style={{ height: "100%" }}>
      <div className="flex items-center mb-2">
        <span className="panel-title">Active Agents</span>
        <button className="ml-auto text-[11px] text-text-sec hover:text-cyan-DEFAULT flex items-center gap-1">
          View All <span style={{ color: "#22D3EE" }}>›</span>
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2 flex-1 min-h-0">
        {AGENT_DEFS.map(({ name, icon: Icon, color }) => {
          const status = agentStates[name] ?? "Standby";
          const statusColor = STATUS_COLOR[status] ?? "#F59E0B";
          const waveColor = status === "Running" ? "#22D3EE" : status === "Active" ? color : "#F59E0B";
          return (
            <div
              key={name}
              className="rounded-lg px-2 py-1.5 flex flex-col justify-between overflow-hidden"
              style={{
                background: "rgba(12,32,58,0.6)",
                border: `1px solid ${status !== "Standby" ? color + "40" : "rgba(56,189,248,0.15)"}`,
              }}
            >
              <div className="flex items-center gap-1.5">
                <div
                  className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}20` }}
                >
                  <Icon size={11} color={color} strokeWidth={1.5} />
                </div>
                <p className="text-[10px] font-semibold text-text-main leading-tight truncate">{name}</p>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: statusColor }} />
                <span className="text-[10px]" style={{ color: statusColor }}>{status}</span>
              </div>
              <Waveform color={waveColor} bars={8} height={10} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
