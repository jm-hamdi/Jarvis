import { CreditCard, Lock, Database, Shield, Eye, Brain } from "lucide-react";
import IconTile from "../ui/IconTile";
import type { SystemState } from "../../types/events";

interface Props { systemState: SystemState }

const STATUS_COLOR: Record<string, string> = {
  up:       "#22C55E",
  down:     "#EF4444",
  degraded: "#F59E0B",
};

function getStatus(systemState: SystemState): "up" | "down" | "degraded" {
  if (systemState === "OPTIMAL" || systemState === "RECOVERED") return "up";
  if (systemState === "UNDER ATTACK") return "degraded";
  return "degraded";
}

function getLatency(systemState: SystemState, base: number): string {
  if (systemState === "UNDER ATTACK") return `${base * 8} ms`;
  if (systemState === "RECOVERING")   return `${base * 3} ms`;
  return `${base} ms`;
}

const SERVICES = [
  { icon: CreditCard, label: "Payment API",  color: "#22D3EE", baseLatency: 42 },
  { icon: Lock,       label: "Auth Service", color: "#22C55E", baseLatency: 18 },
  { icon: Database,   label: "Database",     color: "#38BDF8", baseLatency: 11 },
  { icon: Shield,     label: "WAF",          color: "#A855F7", baseLatency: 3  },
  { icon: Eye,        label: "SIEM",         color: "#F59E0B", baseLatency: 7  },
  { icon: Brain,      label: "Detector ML",  color: "#22D3EE", baseLatency: 5  },
];

export default function CoreOverview({ systemState }: Props) {
  const status = getStatus(systemState);
  return (
    <div className="panel flex flex-col p-3" style={{height:"100%"}}>
      <span className="panel-title mb-3">AI Core Overview</span>
      <div className="flex flex-col gap-1.5 flex-1">
        {SERVICES.map(({ icon, label, color, baseLatency }) => (
          <div
            key={label}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg"
            style={{ background: "rgba(12,32,58,0.6)" }}
          >
            <IconTile icon={icon} color={color} size={14} />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[12px] font-medium text-text-main truncate">{label}</span>
              <span className="text-[10px]" style={{ color: STATUS_COLOR[status] }}>
                {status === "up" ? "Active" : status === "degraded" ? "Degraded" : "Down"} · {getLatency(systemState, baseLatency)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
