import { LucideIcon } from "lucide-react";

interface IconTileProps {
  icon: LucideIcon;
  color: string;
  size?: number;
}

export default function IconTile({ icon: Icon, color, size = 16 }: IconTileProps) {
  return (
    <div
      className="flex items-center justify-center rounded-lg flex-shrink-0"
      style={{
        width: size + 12,
        height: size + 12,
        background: `${color}26`,
        border: `1px solid ${color}40`,
      }}
    >
      <Icon size={size} color={color} strokeWidth={1.5} />
    </div>
  );
}
