import type { SystemState } from "../types/events";

export const SYSTEM_STATE: SystemState = "OPTIMAL";

export const SERVICES = [
  { name: "Payment API", icon: "💳", status: "up" as const, latency: 42 },
  { name: "Auth Service", icon: "🔐", status: "up" as const, latency: 18 },
  { name: "Database", icon: "🗄️", status: "up" as const, latency: 9 },
  { name: "WAF", icon: "🛡️", status: "up" as const, latency: 3 },
  { name: "SIEM", icon: "👁️", status: "up" as const, latency: 5 },
  { name: "Detector ML", icon: "🧠", status: "up" as const, latency: 55 },
];

export const INTEL_FEED = [
  {
    id: 1,
    title: "WAF: SQL Injection attempt blocked",
    sub: "192.168.0.45 → /payments",
    badge: "CRIT",
    color: "red" as const,
  },
  {
    id: 2,
    title: "Anomaly score rising — 0.72",
    sub: "Threshold: 0.80 · Detector ML",
    badge: "WARN",
    color: "orange" as const,
  },
  {
    id: 3,
    title: "Auth Service: brute-force detected",
    sub: "12 failed logins in 30s · 10.0.0.11",
    badge: "WARN",
    color: "orange" as const,
  },
  {
    id: 4,
    title: "Transaction verified post-remediation",
    sub: "tx_id: 8f3a… · 201 OK",
    badge: "INFO",
    color: "cyan" as const,
  },
  {
    id: 5,
    title: "Deep-work block: normal traffic",
    sub: "Load nominal · 47 tx/min",
    badge: "TIP",
    color: "yellow" as const,
  },
  {
    id: 6,
    title: "CPU usage at 15%",
    sub: "System load nominal",
    badge: "LIVE",
    color: "green" as const,
  },
];

export const AGENTS = [
  { name: "Detector ML", status: "Active" as const, color: "#22D3EE" },
  { name: "Remediator", status: "Active" as const, color: "#22C55E" },
  { name: "Verifier", status: "Active" as const, color: "#A855F7" },
  { name: "WAF Guard", status: "Standby" as const, color: "#F59E0B" },
  { name: "SIEM Collector", status: "Standby" as const, color: "#38BDF8" },
  { name: "Jarvis RAG", status: "Active" as const, color: "#22D3EE" },
];

export const TIMELINE = [
  {
    time: "09:30",
    label: "Normal traffic established",
    bar: 100,
    status: "Done",
    color: "#22C55E",
  },
  {
    time: "12:00",
    label: "Flood attack detected by ML",
    bar: 100,
    status: "Done",
    color: "#EF4444",
  },
  {
    time: "12:00",
    label: "IP banned — WAF reload",
    bar: 100,
    status: "Done",
    color: "#F59E0B",
  },
  {
    time: "06:30",
    label: "Verifier: transaction OK",
    bar: 65,
    status: "In 42 min",
    color: "#22D3EE",
  },
];

export const SYSTEM_METRICS = {
  cpu: 15,
  ram: 54,
  disk: 40,
};

export const ANOMALY = {
  score: 0.72,
  threshold: 0.8,
  events: 3380,
  conversationTurns: 22,
  toolCalls: 14,
};

export const INFRA = [
  { name: "payment-api", status: "Running" as const, color: "#22C55E" },
  { name: "auth-service", status: "Running" as const, color: "#22C55E" },
  { name: "postgres", status: "Running" as const, color: "#22C55E" },
  { name: "redis", status: "Running" as const, color: "#22C55E" },
  { name: "vault", status: "Running" as const, color: "#22C55E" },
  { name: "waf", status: "Running" as const, color: "#22C55E" },
  { name: "wazuh", status: "Running" as const, color: "#22C55E" },
  { name: "prometheus", status: "Running" as const, color: "#22C55E" },
  { name: "ollama", status: "Running" as const, color: "#22C55E" },
];

export const NAV_ITEMS = [
  { icon: "LayoutDashboard", label: "Command Center", badge: null },
  { icon: "Cpu", label: "Services", badge: null },
  { icon: "AlertTriangle", label: "Incidents", badge: 2 },
  { icon: "Shield", label: "Alertes SIEM", badge: 4 },
  { icon: "Wrench", label: "Remédiation", badge: null },
  { icon: "Brain", label: "Détecteur ML", badge: null },
  { icon: "CreditCard", label: "Transactions", badge: null },
  { icon: "BookOpen", label: "Knowledge Base", badge: null },
  { icon: "FileText", label: "Logs", badge: null },
  { icon: "Settings", label: "Paramètres", badge: null },
];
