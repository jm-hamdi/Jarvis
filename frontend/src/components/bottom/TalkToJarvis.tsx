import Waveform from "../ui/Waveform";
import { useJarvis } from "../../jarvis/JarvisContext";

export default function TalkToJarvis() {
  const j = useJarvis();
  return (
    <div className="flex items-center gap-3 flex-1 justify-center">
      <Waveform color="#22D3EE" bars={10} height={20} />
      <button
        onClick={() => j.open("chat")}
        className="flex flex-col items-center justify-center px-8 py-2 rounded-full relative"
        style={{
          background: "rgba(34,211,238,0.08)",
          border: "1.5px solid rgba(34,211,238,0.6)",
          boxShadow: "0 0 20px rgba(34,211,238,0.3), inset 0 0 20px rgba(34,211,238,0.05)",
          minWidth: 200,
          cursor: "pointer",
        }}
      >
        <span className="font-orbitron font-black text-[13px] tracking-[0.2em]" style={{ color: "#22D3EE" }}>
          TALK TO JARVIS
        </span>
        <span className="text-[10px] tracking-widest" style={{ color: j.connected ? "#22C55E" : "#7FA3C0" }}>
          {j.connected ? `${j.alerts.length} alerts · Connected` : "I am listening…"}
        </span>
      </button>
      <Waveform color="#22D3EE" bars={10} height={20} />
    </div>
  );
}
