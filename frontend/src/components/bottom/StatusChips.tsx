import { MapPin, Cloud, Wifi } from "lucide-react";

export default function StatusChips() {
  return (
    <div className="flex items-center gap-3">
      {[
        { icon: MapPin,  label: "Location",    value: "PC Hôte",         color: "#22D3EE" },
        { icon: Cloud,   label: "Weather",     value: "28°C Overcast",   color: "#38BDF8" },
        { icon: Wifi,    label: "Network",     value: "RESILIENCE-G1",   color: "#22C55E" },
      ].map(({ icon: Icon, label, value, color }) => (
        <div key={label} className="flex items-center gap-1.5">
          <Icon size={13} color={color} strokeWidth={1.5} />
          <div className="flex flex-col">
            <span className="text-[9px] text-text-off leading-none">{label}</span>
            <span className="text-[11px] text-text-sec">{value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
