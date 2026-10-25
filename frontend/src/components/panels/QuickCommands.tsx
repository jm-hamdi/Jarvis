import { FileText, BarChart2, Clock, Download } from "lucide-react";
import { useJarvis } from "../../jarvis/JarvisContext";

const COMMANDS = [
  { icon: FileText,  label: "Rapport d'incident",   color: "#22D3EE" },
  { icon: BarChart2, label: "Ouvrir Grafana",        color: "#38BDF8", disabled: true },
  { icon: Clock,     label: "Rejouer la timeline",   color: "#A855F7", disabled: true },
  { icon: Download,  label: "Exporter le rapport",   color: "#22C55E" },
];

export default function QuickCommands() {
  const j = useJarvis();
  return (
    <div className="panel flex flex-col p-3" style={{height:"100%"}}>
      <span className="panel-title mb-3">Quick Commands</span>
      <div className="flex flex-col gap-2 flex-1">
        {COMMANDS.map(({ icon: Icon, label, color, disabled }) => (
          <button
            type="button"
            key={label}
            disabled={disabled}
            onClick={() => label === "Exporter le rapport" ? j.exportReport() : j.open("incident")}
            title={disabled ? "Non disponible dans cette version" : undefined}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-left transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: "rgba(12,32,58,0.6)",
              border: `1px solid ${color}30`,
            }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}20` }}
            >
              <Icon size={14} color={color} strokeWidth={1.5} />
            </div>
            <span className="text-[12px] text-text-main">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
