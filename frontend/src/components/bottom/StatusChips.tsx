import { MapPin, Activity, Wifi } from "lucide-react";

interface Props { txPerMin: number }

export default function StatusChips({ txPerMin }: Props) {
  return (
    <div className="flex items-center gap-3">
      {[
        { icon: MapPin,   label: "Location",     value: "PC Hôte",        color: "#22D3EE" },
        { icon: Activity, label: "Transactions",  value: `${txPerMin} tx/min`, color: txPerMin > 30 ? "#22C55E" : txPerMin > 15 ? "#F59E0B" : "#EF4444" },
        { icon: Wifi,     label: "Network",       value: "RESILIENCE-G1",  color: "#22C55E" },
      ].map(({ icon: Icon, label, value, color }) => (
        <div key={label} className="flex items-center gap-1.5">
          <Icon size={13} color={color} strokeWidth={1.5} />
          <div className="flex flex-col">
            <span className="text-[9px] text-text-off leading-none">{label}</span>
            <span className="text-[11px]" style={{ color }}>{value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
