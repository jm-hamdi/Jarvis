import { CreditCard, Lock, Database, Shield, Eye, Brain } from "lucide-react";
import IconTile from "../ui/IconTile";

const SERVICES = [
  { icon: CreditCard, label: "Payment API",  sub: "Active",   color: "#22D3EE", status: "up" },
  { icon: Lock,       label: "Auth Service", sub: "Active",   color: "#22C55E", status: "up" },
  { icon: Database,   label: "Database",     sub: "Active",   color: "#38BDF8", status: "up" },
  { icon: Shield,     label: "WAF",          sub: "Active",   color: "#A855F7", status: "up" },
  { icon: Eye,        label: "SIEM",         sub: "Active",   color: "#F59E0B", status: "up" },
  { icon: Brain,      label: "Detector ML",  sub: "Active",   color: "#22D3EE", status: "up" },
];

const STATUS_COLOR: Record<string, string> = {
  up: "#22C55E",
  down: "#EF4444",
  degraded: "#F59E0B",
};

export default function CoreOverview() {
  return (
    <div className="panel h-full flex flex-col p-3">
      <span className="panel-title mb-3">AI Core Overview</span>
      <div className="flex flex-col gap-1.5 flex-1">
        {SERVICES.map(({ icon, label, sub, color, status }) => (
          <div
            key={label}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg"
            style={{ background: "rgba(12,32,58,0.6)" }}
          >
            <IconTile icon={icon} color={color} size={14} />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[12px] font-medium text-text-main truncate">{label}</span>
              <span className="text-[10px]" style={{ color: STATUS_COLOR[status] }}>{sub}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
