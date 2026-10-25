import { Zap } from "lucide-react";
import { useJarvis } from "../../jarvis/JarvisContext";

export default function ExecutiveBriefing() {
  const j = useJarvis();
  return (
    <button
      onClick={() => j.open("incident")}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold transition-all hover:opacity-90"
      style={{
        border: "1px solid rgba(34,211,238,0.4)",
        color: "#22D3EE",
        background: "rgba(34,211,238,0.06)",
        cursor: "pointer",
      }}
    >
      <Zap size={14} color="#22D3EE" strokeWidth={1.5} />
      Executive Briefing
    </button>
  );
}
