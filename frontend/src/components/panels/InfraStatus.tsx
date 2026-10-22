import {
  CreditCard, Lock, Database, Radio, Eye, Activity,
  BarChart2, Server, Brain,
} from "lucide-react";

const INFRA = [
  { name: "payment-api",  icon: CreditCard, color: "#22D3EE", status: "Running" },
  { name: "auth-service", icon: Lock,       color: "#22C55E", status: "Running" },
  { name: "postgres",     icon: Database,   color: "#38BDF8", status: "Running" },
  { name: "redis",        icon: Radio,      color: "#F59E0B", status: "Running" },
  { name: "vault",        icon: Eye,        color: "#A855F7", status: "Running" },
  { name: "waf",          icon: Activity,   color: "#EF4444", status: "Running" },
  { name: "wazuh",        icon: BarChart2,  color: "#F59E0B", status: "Running" },
  { name: "prometheus",   icon: Server,     color: "#22D3EE", status: "Running" },
  { name: "ollama",       icon: Brain,      color: "#22C55E", status: "Running" },
];

const STATUS_COLOR: Record<string, string> = {
  Running:    "#22C55E",
  Down:       "#EF4444",
  Restarting: "#F59E0B",
};

const connected = INFRA.filter(s => s.status === "Running").length;

export default function InfraStatus() {
  return (
    <div className="panel flex flex-col p-3" style={{ height: "100%" }}>
      <div className="flex items-center mb-2">
        <span className="panel-title">Infra Status</span>
        <span className="ml-auto badge badge-green">{connected} Connected</span>
      </div>
      <div className="grid grid-cols-3 gap-1.5 flex-1 min-h-0">
        {INFRA.map(({ name, icon: Icon, status, color }) => (
          <div
            key={name}
            className="rounded-lg px-2 py-1.5 flex flex-col items-center justify-center gap-1"
            style={{
              background: "rgba(12,32,58,0.6)",
              border: `1px solid ${color}25`,
            }}
          >
            <div
              className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}20` }}
            >
              <Icon size={11} color={color} strokeWidth={1.5} />
            </div>
            <span className="text-[10px] text-text-main text-center leading-tight">{name}</span>
            <span className="text-[10px]" style={{ color: STATUS_COLOR[status] }}>{status}</span>
          </div>
        ))}
      </div>
      <button className="mt-1.5 text-[11px] text-text-sec hover:text-cyan-DEFAULT flex items-center gap-1 self-end">
        Manage Services <span style={{ color: "#22D3EE" }}>›</span>
      </button>
    </div>
  );
}
