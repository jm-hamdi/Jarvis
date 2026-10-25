import { Mic } from "lucide-react";
import Waveform from "../ui/Waveform";
import { useJarvis } from "../../jarvis/JarvisContext";

export default function VoiceStatus() {
  const j = useJarvis();
  return (
    <div
      className="mx-3 mb-3 p-3 rounded-panel"
      style={{ border: "1px solid rgba(34,211,238,0.2)", background: "rgba(8,22,42,0.6)" }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="panel-title text-[11px]">Voice Status</span>
        <span className="ml-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-green-ok inline-block animate-pulse" />
        </span>
      </div>

      <div className="flex items-center justify-center mb-2">
        <Waveform color="#22D3EE" bars={12} height={16} />
      </div>

      <p className="text-center text-[11px] text-text-sec mb-3">
        {j.recording ? "Listening…" : j.speaking ? "JARVIS speaks…" : "Push-to-talk ready"}
      </p>

      <div className="flex justify-center mb-2">
        <button
          type="button"
          aria-label="Ouvrir le chat vocal"
          onClick={() => j.open("chat")}
          className="relative w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: "radial-gradient(circle, rgba(34,211,238,0.2) 0%, rgba(8,22,42,0.9) 100%)",
            border: "1.5px solid rgba(34,211,238,0.6)",
            boxShadow: "0 0 16px rgba(34,211,238,0.4)",
          }}
        >
          <div
            className="absolute inset-0 rounded-full animate-pulse-ring"
            style={{ border: "1px solid rgba(34,211,238,0.3)" }}
          />
          <Mic size={18} color="#22D3EE" strokeWidth={1.5} />
        </button>
      </div>
      <p className="text-center text-[10px] text-text-off mb-2">Tap to Speak</p>

      <button
        type="button"
        aria-label="Annonces vocales des nouvelles alertes"
        aria-pressed={j.announcements}
        onClick={j.toggleAnnouncements}
        className="w-full py-1.5 rounded text-[11px] text-text-sec flex items-center justify-center gap-1.5 transition-all hover:text-cyan-DEFAULT"
        style={{ border: "1px solid rgba(56,189,248,0.2)" }}
      >
        <span style={{ color: "#22D3EE" }}>⊙</span> Auto-alertes : {j.announcements ? "ON" : "OFF"}
      </button>
    </div>
  );
}
