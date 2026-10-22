import { useEffect, useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import CoreOverview from "./components/panels/CoreOverview";
import CoreOrb from "./components/panels/CoreOrb";
import IntelFeed from "./components/panels/IntelFeed";
import AgentsGrid from "./components/panels/AgentsGrid";
import IncidentTimeline from "./components/panels/IncidentTimeline";
import QuickCommands from "./components/panels/QuickCommands";
import SystemMonitor from "./components/panels/SystemMonitor";
import AnomalyInsights from "./components/panels/AnomalyInsights";
import InfraStatus from "./components/panels/InfraStatus";
import StatusChips from "./components/bottom/StatusChips";
import TalkToJarvis from "./components/bottom/TalkToJarvis";
import ExecutiveBriefing from "./components/bottom/ExecutiveBriefing";
import { useScenario } from "./mocks/scenario";

const W = 1920;
const H = 1080;
const SIDEBAR = 296;

export default function App() {
  const scenario = useScenario();
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const compute = () => {
      setScale(Math.min(window.innerWidth / W, window.innerHeight / H));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", background: "#030914", position: "relative" }}>
      {/* ── Fixed 1920×1080 canvas, scaled to fit any screen ── */}
      <div
        style={{
          width: W,
          height: H,
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: "center center",
          background: "radial-gradient(ellipse at 50% 40%, #0A1E3A 0%, #030914 70%)",
          display: "grid",
          gridTemplateColumns: `${SIDEBAR}px 1fr`,
          overflow: "hidden",
        }}
      >
        {/* ── SIDEBAR ── */}
        <div style={{ height: H, overflow: "hidden" }}>
          <Sidebar />
        </div>

        {/* ── MAIN COLUMN: 5-row grid, no fixed row heights ── */}
        <div
          style={{
            display: "grid",
            gridTemplateRows: "72px minmax(0,1.6fr) minmax(0,1fr) minmax(0,1.15fr) 72px",
            gap: 12,
            padding: 12,
            height: H,
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          {/* ROW 0 — Header */}
          <Header state={scenario.systemState} />

          {/* ROW 1 — CoreOverview | CoreOrb | IntelFeed */}
          <div style={{ display: "grid", gridTemplateColumns: "272fr 906fr 379fr", gap: 12, minHeight: 0 }}>
            <CoreOverview systemState={scenario.systemState} />
            <CoreOrb state={scenario.systemState} mttr={scenario.mttr} />
            <IntelFeed items={scenario.intelFeed} />
          </div>

          {/* ROW 2 — AgentsGrid | IncidentTimeline | QuickCommands */}
          <div style={{ display: "grid", gridTemplateColumns: "792fr 424fr 344fr", gap: 12, minHeight: 0 }}>
            <AgentsGrid agentStates={scenario.agentStates} />
            <IncidentTimeline items={scenario.timeline} />
            <QuickCommands />
          </div>

          {/* ROW 3 — SystemMonitor | AnomalyInsights | InfraStatus */}
          <div style={{ display: "grid", gridTemplateColumns: "416fr 387fr 757fr", gap: 12, minHeight: 0 }}>
            <SystemMonitor />
            <AnomalyInsights anomalyScore={scenario.anomalyScore} />
            <InfraStatus />
          </div>

          {/* ROW 4 — Bottom Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              paddingLeft: 16,
              paddingRight: 16,
              background: "rgba(3,9,20,0.95)",
              borderTop: "1px solid rgba(56,189,248,0.2)",
              minHeight: 0,
              overflow: "hidden",
            }}
          >
            <StatusChips txPerMin={scenario.txPerMin} />
            <TalkToJarvis />
            <ExecutiveBriefing />
          </div>
        </div>
      </div>
    </div>
  );
}
