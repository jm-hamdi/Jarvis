import {
  LayoutDashboard, Cpu, AlertTriangle, Shield, Wrench,
  Brain, CreditCard, BookOpen, FileText, Settings,
} from "lucide-react";
import Logo from "./Logo";
import VoiceStatus from "./VoiceStatus";
import { useJarvis } from "../../jarvis/JarvisContext";
import { useOperations, type OpsView } from "../../jarvis/OperationsContext";

const NAV: { icon: typeof LayoutDashboard; label: string; badge: number | null; active?: boolean; opsView?: OpsView }[] = [
  { icon: LayoutDashboard, label: "Command Center", badge: null, active: true },
  { icon: Cpu,             label: "Services",        badge: null,  opsView: "services" },
  { icon: AlertTriangle,   label: "Incidents",        badge: 2,     opsView: "incidents" },
  { icon: Shield,          label: "Alertes SIEM",     badge: 4,     opsView: "incidents" },
  { icon: Wrench,          label: "Remédiation",      badge: null,  opsView: "remediation" },
  { icon: Brain,           label: "Détecteur ML",     badge: null,  opsView: "ml" },
  { icon: CreditCard,      label: "Transactions",     badge: null,  opsView: "transactions" },
  { icon: BookOpen,        label: "Knowledge Base",   badge: null,  opsView: "knowledge" },
  { icon: FileText,        label: "Logs",             badge: null,  opsView: "logs" },
  { icon: Settings,        label: "Paramètres",       badge: null },
];

export default function Sidebar() {
  const j = useJarvis();
  const ops = useOperations();
  return (
    <div
      className="flex flex-col h-full"
      style={{
        width: 296,
        background: "rgba(3,9,20,0.95)",
        borderRight: "1px solid rgba(56,189,248,0.2)",
      }}
    >
      <Logo />

      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV.map(({ icon: Icon, label, badge, active, opsView }) => (
          <button
            type="button"
            onClick={() => {
              if (label === "Paramètres") j.setDialog("connection");
              else if (opsView) ops.open(opsView);
            }}
            key={label}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all group"
            style={{
              background: active ? "rgba(34,211,238,0.08)" : "transparent",
              borderLeft: active ? "2px solid #22D3EE" : "2px solid transparent",
            }}
          >
            <Icon
              size={16}
              strokeWidth={1.5}
              color={active ? "#22D3EE" : "#7FA3C0"}
              className="flex-shrink-0"
            />
            <span
              className="text-[13px] font-medium flex-1"
              style={{ color: active ? "#E6F6FF" : "#7FA3C0" }}
            >
              {label}
            </span>
            {badge !== null && (
              <span className="badge badge-cyan text-[10px]">{badge}</span>
            )}
          </button>
        ))}
      </nav>

      <VoiceStatus />
    </div>
  );
}
