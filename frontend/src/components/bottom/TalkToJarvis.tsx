import Waveform from "../ui/Waveform";

export default function TalkToJarvis() {
  return (
    <div className="flex items-center gap-3 flex-1 justify-center">
      <Waveform color="#22D3EE" bars={10} height={20} />
      <button
        className="flex flex-col items-center justify-center px-8 py-2 rounded-full relative"
        style={{
          background: "rgba(34,211,238,0.08)",
          border: "1.5px solid rgba(34,211,238,0.6)",
          boxShadow: "0 0 20px rgba(34,211,238,0.3), inset 0 0 20px rgba(34,211,238,0.05)",
          minWidth: 200,
        }}
      >
        <span className="font-orbitron font-black text-[13px] tracking-[0.2em]" style={{ color: "#22D3EE" }}>
          TALK TO JARVIS
        </span>
        <span className="text-[10px] text-text-sec tracking-widest">I am listening…</span>
      </button>
      <Waveform color="#22D3EE" bars={10} height={20} />
    </div>
  );
}
