import { Shield, AlertTriangle, GitPullRequest, Clock, Cpu, CheckCircle } from "lucide-react";
import type { ScenarioState } from "../../mocks/scenario";

const ICONS = [Shield, AlertTriangle, GitPullRequest, Clock, Cpu, CheckCircle];
const BADGE_CLASS: Record<string, string> = {
  CRIT: "badge-red",
  WARN: "badge-orange",
  INFO: "badge-cyan",
  TIP:  "badge-yellow",
  LIVE: "badge-green",
};

const ICON_COLORS: Record<string, string> = {
  red:    "#EF4444",
  orange: "#F59E0B",
  cyan:   "#22D3EE",
  yellow: "#FACC15",
  green:  "#22C55E",
};

interface Props { items: ScenarioState["intelFeed"] }

export default function IntelFeed({ items }: Props) {
  return (
    <div className="panel flex flex-col p-3" style={{height:"100%"}}>
      <div className="flex items-center mb-3">
        <span className="panel-title">Live Intelligence Feed</span>
        <span className="ml-auto badge badge-green text-[10px]">● LIVE</span>
      </div>
      <div className="flex flex-col gap-2 flex-1 overflow-hidden">
        {items.map((item, i) => {
          const Icon = ICONS[i % ICONS.length];
          const iconColor = ICON_COLORS[item.color] ?? "#22D3EE";
          return (
            <div key={item.id} className="flex items-start gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: `${iconColor}18`, border: `1px solid ${iconColor}30` }}
              >
                <Icon size={13} color={iconColor} strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-text-main leading-tight truncate">{item.title}</p>
                <p className="text-[11px] text-text-off truncate">{item.sub}</p>
              </div>
              <span className={`badge ${BADGE_CLASS[item.badge]} flex-shrink-0 mt-0.5`}>{item.badge}</span>
            </div>
          );
        })}
      </div>
      <button className="mt-2 text-[11px] text-text-sec hover:text-cyan-DEFAULT flex items-center gap-1 self-end">
        View All Intelligence <span style={{ color: "#22D3EE" }}>›</span>
      </button>
    </div>
  );
}
