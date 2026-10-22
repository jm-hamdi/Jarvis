import { useEffect, useState } from "react";
import type { SystemState } from "../types/events";

export type ScenarioPhase = "OPTIMAL" | "UNDER_ATTACK" | "RECOVERING" | "RECOVERED";

export interface ScenarioState {
  phase:       ScenarioPhase;
  systemState: SystemState;
  mttr:        number;        // seconds since attack start
  txPerMin:    number;
  anomalyScore: number;
  intelFeed:   { id: number; title: string; sub: string; badge: string; color: "red"|"orange"|"cyan"|"yellow"|"green" }[];
  timeline:    { time: string; label: string; bar: number; status: string; color: string }[];
  agentStates: Record<string, "Active"|"Standby"|"Running">;
}

const PHASE_DURATION = { OPTIMAL: 10, UNDER_ATTACK: 10, RECOVERING: 7, RECOVERED: 8 }; // seconds
const TOTAL = Object.values(PHASE_DURATION).reduce((a, b) => a + b, 0); // 35s

function buildState(t: number): ScenarioState {
  const cycle = t % TOTAL;

  const thresholds = {
    OPTIMAL:      PHASE_DURATION.OPTIMAL,
    UNDER_ATTACK: PHASE_DURATION.OPTIMAL + PHASE_DURATION.UNDER_ATTACK,
    RECOVERING:   PHASE_DURATION.OPTIMAL + PHASE_DURATION.UNDER_ATTACK + PHASE_DURATION.RECOVERING,
  };

  let phase: ScenarioPhase;
  if      (cycle < thresholds.OPTIMAL)      phase = "OPTIMAL";
  else if (cycle < thresholds.UNDER_ATTACK) phase = "UNDER_ATTACK";
  else if (cycle < thresholds.RECOVERING)   phase = "RECOVERING";
  else                                       phase = "RECOVERED";

  const attackStart = thresholds.OPTIMAL;
  const mttr = phase === "OPTIMAL" ? 0 : Math.floor(cycle - attackStart);

  const fmt = (base: Date, addSec: number) => {
    const d = new Date(base.getTime() + addSec * 1000);
    return d.toTimeString().slice(0, 8);
  };

  const now = new Date();
  const t0  = fmt(now, -(mttr));

  const commonTimeline = [
    { time: t0, label: "Trafic normal établi", bar: 100, status: "Done", color: "#22C55E" },
  ];

  if (phase === "OPTIMAL") return {
    phase, systemState: "OPTIMAL", mttr: 0, txPerMin: 47, anomalyScore: 0.12,
    intelFeed: [
      { id:1, title:"Trafic nominal — 47 tx/min",            sub:"payment-api · latence 42 ms",         badge:"LIVE",  color:"green"  },
      { id:2, title:"Auth Service opérationnel",             sub:"0 échec d'auth en 5 min",              badge:"INFO",  color:"cyan"   },
      { id:3, title:"WAF actif — 0 menace bloquée",          sub:"ModSecurity CRS v3.3",                 badge:"INFO",  color:"cyan"   },
      { id:4, title:"Detector ML — score 0.12",              sub:"Seuil 0.80 · aucune anomalie",         badge:"INFO",  color:"cyan"   },
      { id:5, title:"Wazuh SIEM — aucune alerte",            sub:"Règles actives · scan OK",             badge:"TIP",   color:"yellow" },
      { id:6, title:"CPU 15% · RAM 54% · Disk 40%",         sub:"Charge système normale",               badge:"LIVE",  color:"green"  },
    ],
    timeline: commonTimeline,
    agentStates: { "Detector ML":"Active","Remediator":"Standby","Verifier":"Standby","WAF Guard":"Active","SIEM Collector":"Active","Jarvis RAG":"Active" },
  };

  if (phase === "UNDER_ATTACK") return {
    phase, systemState: "UNDER ATTACK", mttr, txPerMin: 12, anomalyScore: 0.94,
    intelFeed: [
      { id:1, title:"WAF : injection SQL bloquée",             sub:`${fmt(now,-mttr+1)} · IP 192.168.1.45 → /payments`, badge:"CRIT",  color:"red"    },
      { id:2, title:"Score anomalie ML : 0.94 ⚠",             sub:"Seuil 0.80 dépassé · Isolation Forest",              badge:"CRIT",  color:"red"    },
      { id:3, title:"Flood détecté — 320 req/s",               sub:"IP 192.168.1.45 · brute-force auth",                 badge:"CRIT",  color:"red"    },
      { id:4, title:"Auth Service : 18 échecs en 30 s",       sub:"Possible credential stuffing",                       badge:"WARN",  color:"orange" },
      { id:5, title:"Latence API : 1 240 ms (P99)",           sub:"Pic anormal · timeout possible",                     badge:"WARN",  color:"orange" },
      { id:6, title:"Detector ML → anomaly_detected publié",  sub:`incident_id: INC-${String(Math.floor(t/TOTAL)).padStart(3,"0")}`, badge:"CRIT", color:"red" },
    ],
    timeline: [
      ...commonTimeline,
      { time: fmt(now, -mttr+1), label:"Attaque détectée — Isolation Forest",  bar:100, status:"Done",    color:"#EF4444" },
      { time: fmt(now, -mttr+2), label:"Remediator — décision playbook flood",  bar: 65, status:"Running", color:"#F59E0B" },
    ],
    agentStates: { "Detector ML":"Running","Remediator":"Running","Verifier":"Standby","WAF Guard":"Running","SIEM Collector":"Running","Jarvis RAG":"Active" },
  };

  if (phase === "RECOVERING") return {
    phase, systemState: "RECOVERING", mttr, txPerMin: 23, anomalyScore: 0.78,
    intelFeed: [
      { id:1, title:"IP 192.168.1.45 bannie — WAF reload",   sub:`${fmt(now,-mttr+3)} · banned_ips.conf mis à jour`,   badge:"WARN",  color:"orange" },
      { id:2, title:"Nginx rechargé — config appliquée",      sub:"reload sans coupure · 0 ms downtime",               badge:"WARN",  color:"orange" },
      { id:3, title:"Remediator : playbook flood terminé",    sub:"étape remédiation → done",                          badge:"INFO",  color:"cyan"   },
      { id:4, title:"Verifier — transaction test en cours",   sub:"POST /payments · 1.00 EUR",                         badge:"LIVE",  color:"green"  },
      { id:5, title:"Score ML : 0.78 — en baisse",            sub:"Seuil 0.80 · retour progressif",                    badge:"WARN",  color:"orange" },
      { id:6, title:"Services redémarrés — health OK",        sub:"payment-api, auth-service ✓",                       badge:"INFO",  color:"cyan"   },
    ],
    timeline: [
      ...commonTimeline,
      { time: fmt(now, -mttr+1), label:"Attaque détectée — Isolation Forest",  bar:100, status:"Done", color:"#EF4444" },
      { time: fmt(now, -mttr+2), label:"IP bannie — WAF reload",               bar:100, status:"Done", color:"#F59E0B" },
      { time: fmt(now, -mttr+3), label:"Verifier — transaction de test",       bar: 40, status:"Running", color:"#22D3EE" },
    ],
    agentStates: { "Detector ML":"Active","Remediator":"Running","Verifier":"Running","WAF Guard":"Active","SIEM Collector":"Active","Jarvis RAG":"Active" },
  };

  // RECOVERED
  return {
    phase, systemState: "RECOVERED", mttr, txPerMin: 44, anomalyScore: 0.18,
    intelFeed: [
      { id:1, title:"Transaction vérifiée — 201 OK",          sub:`tx_id: 8f3a… · ${fmt(now,-2)} · MTTR ${mttr}s`, badge:"INFO",  color:"cyan"   },
      { id:2, title:"Système rétabli — MTTR : "+mttr+" s",   sub:"attaque → détection → remédiation → OK",         badge:"INFO",  color:"cyan"   },
      { id:3, title:"Score ML : 0.18 — nominal",             sub:"Seuil 0.80 · aucune anomalie active",            badge:"LIVE",  color:"green"  },
      { id:4, title:"47 tx/min — trafic restauré",           sub:"payment-api · latence 44 ms",                    badge:"LIVE",  color:"green"  },
      { id:5, title:"WAF — IP bannie maintenue",             sub:"192.168.1.45 · règle persistante",               badge:"INFO",  color:"cyan"   },
      { id:6, title:"Jarvis RAG — rapport d'incident prêt", sub:"Cliquez Executive Briefing",                      badge:"TIP",   color:"yellow" },
    ],
    timeline: [
      ...commonTimeline,
      { time: fmt(now, -mttr+1), label:"Attaque détectée — Isolation Forest", bar:100, status:"Done", color:"#EF4444" },
      { time: fmt(now, -mttr+2), label:"IP bannie — WAF reload",              bar:100, status:"Done", color:"#F59E0B" },
      { time: fmt(now, -mttr+3), label:"Transaction vérifiée — 201 OK",       bar:100, status:"Done", color:"#22C55E" },
    ],
    agentStates: { "Detector ML":"Active","Remediator":"Standby","Verifier":"Active","WAF Guard":"Active","SIEM Collector":"Active","Jarvis RAG":"Active" },
  };
}

export function useScenario(): ScenarioState {
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT(s => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return buildState(t);
}
