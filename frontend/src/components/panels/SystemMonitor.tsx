import RingGauge from "../ui/RingGauge";
import { SYSTEM_METRICS } from "../../mocks/data";

export default function SystemMonitor() {
  return (
    <div className="panel flex flex-col p-3" style={{ height: "100%" }}>
      <span className="panel-title mb-2">System Monitor</span>
      <div className="flex items-center justify-around flex-1 min-h-0">
        <RingGauge value={SYSTEM_METRICS.cpu}  label="CPU"  color="#22D3EE" size={76} />
        <RingGauge value={SYSTEM_METRICS.ram}  label="RAM"  color="#38BDF8" size={76} />
        <RingGauge value={SYSTEM_METRICS.disk} label="Disk" color="#A855F7" size={76} />
      </div>
    </div>
  );
}
