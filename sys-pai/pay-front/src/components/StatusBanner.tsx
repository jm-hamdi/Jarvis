import { CheckCircle, AlertTriangle, XCircle, Loader } from "lucide-react";
import type { HealthStatus } from "../hooks/useHealth";

const CONFIG = {
  up: {
    bg: "bg-emerald-500",
    text: "text-white",
    icon: CheckCircle,
    label: "All systems operational",
    sub: "Payment platform is running normally.",
  },
  degraded: {
    bg: "bg-amber-500",
    text: "text-white",
    icon: AlertTriangle,
    label: "Service degraded",
    sub: "Elevated response times detected. Transactions may be slow.",
  },
  down: {
    bg: "bg-red-600",
    text: "text-white",
    icon: XCircle,
    label: "Service unavailable",
    sub: "Payment platform is under incident. Recovery in progress…",
  },
  checking: {
    bg: "bg-slate-400",
    text: "text-white",
    icon: Loader,
    label: "Checking system status…",
    sub: "",
  },
};

interface Props { status: HealthStatus }

export default function StatusBanner({ status }: Props) {
  const { bg, text, icon: Icon, label, sub } = CONFIG[status];
  const spinning = status === "checking";

  return (
    <div className={`w-full ${bg} ${text} animate-slide-down`}>
      <div className="max-w-4xl mx-auto px-6 py-2.5 flex items-center gap-3">
        <Icon
          size={16}
          className={`flex-shrink-0 ${spinning ? "animate-spin-slow" : ""}`}
        />
        <span className="font-semibold text-sm">{label}</span>
        {sub && <span className="text-sm opacity-80 hidden sm:inline">— {sub}</span>}
        <span className="ml-auto text-xs opacity-70 font-mono">
          {new Date().toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}
