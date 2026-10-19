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
import type { SystemState } from "./types/events";

const SYSTEM_STATE: SystemState = "OPTIMAL";

// ─── Layout constants (scaled from 1920×1080 reference) ───────────────────────
// Sidebar: 296px  |  Content: 1624px  |  Gap: 16px  |  Margin: 16px
// Header: 88px
// Row 1: 365px  |  Row 2: 224px  |  Row 3: 261px
// Bottom: 86px

export default function App() {
  return (
    <div
      className="flex w-screen h-screen overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 40%, #0A1E3A 0%, #030914 70%)" }}
    >
      {/* ── SIDEBAR ────────────────────────────────────────────────────────────── */}
      <Sidebar />

      {/* ── MAIN ───────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0">
        <Header state={SYSTEM_STATE} />

        {/* Content area */}
        <div
          className="flex-1 min-h-0 flex flex-col"
          style={{ padding: 16, gap: 16 }}
        >
          {/* ROW 1 */}
          <div className="flex gap-4 min-h-0" style={{ flex: "0 0 calc(35% - 8px)" }}>
            {/* AI Core Overview — 272px equiv → ~16.7% */}
            <div style={{ flex: "0 0 16.7%", minWidth: 0 }}>
              <CoreOverview />
            </div>
            {/* Orbe centrale — 906px equiv → ~55.8% */}
            <div style={{ flex: "1 1 0%", minWidth: 0 }}>
              <CoreOrb state={SYSTEM_STATE} />
            </div>
            {/* Live Intel Feed — 379px equiv → ~23.3% */}
            <div style={{ flex: "0 0 23.3%", minWidth: 0 }}>
              <IntelFeed />
            </div>
          </div>

          {/* ROW 2 */}
          <div className="flex gap-4 min-h-0" style={{ flex: "0 0 calc(22% - 8px)" }}>
            {/* Active Agents — 792px equiv → ~52.5% */}
            <div style={{ flex: "0 0 52.5%", minWidth: 0 }}>
              <AgentsGrid />
            </div>
            {/* Mission Timeline — 424px equiv → ~28% */}
            <div style={{ flex: "0 0 28%", minWidth: 0 }}>
              <IncidentTimeline />
            </div>
            {/* Quick Commands — 344px equiv → ~22.8% */}
            <div style={{ flex: "1 1 0%", minWidth: 0 }}>
              <QuickCommands />
            </div>
          </div>

          {/* ROW 3 */}
          <div className="flex gap-4 min-h-0" style={{ flex: "1 1 0%" }}>
            {/* System Monitor — 416px equiv → ~27.6% */}
            <div style={{ flex: "0 0 27.6%", minWidth: 0 }}>
              <SystemMonitor />
            </div>
            {/* Anomaly Insights — 387px equiv → ~25.6% */}
            <div style={{ flex: "0 0 25.6%", minWidth: 0 }}>
              <AnomalyInsights />
            </div>
            {/* LLM / Infra Status — 757px equiv → ~50.1% */}
            <div style={{ flex: "1 1 0%", minWidth: 0 }}>
              <InfraStatus />
            </div>
          </div>
        </div>

        {/* ── BOTTOM BAR ─────────────────────────────────────────────────────── */}
        <div
          className="flex items-center px-4 flex-shrink-0"
          style={{
            height: 86,
            background: "rgba(3,9,20,0.95)",
            borderTop: "1px solid rgba(56,189,248,0.2)",
          }}
        >
          <StatusChips />
          <TalkToJarvis />
          <ExecutiveBriefing />
        </div>
      </div>
    </div>
  );
}
