import { Shield, AlertTriangle, GitPullRequest, Clock, Cpu, CheckCircle } from "lucide-react";
import { INTEL_FEED } from "../../mocks/data";

const ICONS = [Shield, AlertTriangle, GitPullRequest, Clock, Cpu, CheckCircle];
const BADGE_CLASS: Record<string, string> = {
  CRIT: "badge-red",
  WARN: "badge-orange",
  INFO: "badge-cyan",
  TIP:  "badge-yellow",
  LIVE: "badge-green",
};

export default function IntelFeed() {
  return (
    <div className="panel h-full flex flex-col p-3">
      <div className="flex items-center mb-3">
        <span className="panel-title">Live Intelligence Feed</span>
        <span className="ml-auto badge badge-green text-[10px]">● LIVE</span>
      </div>
      <div className="flex flex-col gap-2 flex-1 overflow-hidden">
        {INTEL_FEED.map((item, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <div key={item.id} className="flex items-start gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.2)" }}
              >
                <Icon size={13} color="#22D3EE" strokeWidth={1.5} />
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
