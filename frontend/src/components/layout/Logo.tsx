export default function Logo() {
  return (
    <div className="flex flex-col items-center py-5 px-4 border-b border-border-panel">
      <div className="relative w-14 h-14 mb-2">
        {/* Outer ring */}
        <svg width="56" height="56" className="absolute inset-0 animate-spin-slow">
          <circle cx="28" cy="28" r="26" fill="none" stroke="rgba(34,211,238,0.3)" strokeWidth="1" strokeDasharray="4 4" />
        </svg>
        {/* Middle ring */}
        <svg width="56" height="56" className="absolute inset-0 animate-spin-slow-reverse">
          <circle cx="28" cy="28" r="20" fill="none" stroke="rgba(34,211,238,0.5)" strokeWidth="1.5" strokeDasharray="6 3" />
        </svg>
        {/* Inner circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              background: "radial-gradient(circle, rgba(34,211,238,0.25) 0%, rgba(8,22,42,0.9) 100%)",
              border: "1.5px solid rgba(34,211,238,0.7)",
              boxShadow: "0 0 12px rgba(34,211,238,0.5)",
            }}
          >
            <span className="font-orbitron text-xs font-black text-cyan-DEFAULT" style={{ color: "#22D3EE" }}>J</span>
          </div>
        </div>
      </div>
      <span className="font-orbitron font-black text-base tracking-widest" style={{ color: "#22D3EE" }}>JARVIS</span>
      <span className="font-rajdhani text-[10px] tracking-[0.2em] text-text-sec mt-0.5">COMMAND CENTER</span>
    </div>
  );
}
