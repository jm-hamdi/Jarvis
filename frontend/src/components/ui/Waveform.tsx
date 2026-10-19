interface WaveformProps {
  color?: string;
  bars?: number;
  height?: number;
}

export default function Waveform({ color = "#22D3EE", bars = 7, height = 20 }: WaveformProps) {
  const delays = [0, 0.1, 0.2, 0.3, 0.4, 0.3, 0.2];
  return (
    <div className="flex items-end gap-[2px]" style={{ height }}>
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={`w-[3px] rounded-sm`}
          style={{
            background: color,
            height: `${height}px`,
            animation: `wave 1s ease-in-out infinite`,
            animationDelay: `${delays[i % delays.length]}s`,
            opacity: 0.85,
          }}
        />
      ))}
    </div>
  );
}
