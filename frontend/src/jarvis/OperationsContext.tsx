import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useJarvis, type WazuhAlert } from "./JarvisContext";

export type OpsView = "services" | "incidents" | "remediation" | "ml" | "transactions" | "knowledge" | "logs";
export type ServiceState = "reachable" | "degraded" | "unreachable";
export type ServiceProbe = {
  name: string; label: string; state: ServiceState;
  status_code: number | null; latency_ms: number | null; evidence?: string;
};
export type OperationsOverview = {
  source: string; sampled_at: string; services: ServiceProbe[];
  alerts: { total_sample: number; critical: number; high: number; last_event_at: string | null; last_rule_id: string | null };
  not_monitored: string[]; notes: string;
};
export type HistoryPoint = { sampled_at: string; ok: number; total: number; degraded: number };

type Controller = {
  view: OpsView | null; open: (view: OpsView) => void; close: () => void;
  overview: OperationsOverview | null; history: HistoryPoint[]; error: string; loading: boolean;
  refresh: () => Promise<void>; investigate: (item: WazuhAlert) => void;
};

const Context = createContext<Controller | null>(null);

export function OperationsProvider({ children }: { children: ReactNode }) {
  const j = useJarvis();
  const [view, setView] = useState<OpsView | null>(null);
  const [overview, setOverview] = useState<OperationsOverview | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!j.token) return;
    setLoading(true);
    try {
      const response = await fetch("/api/ops/overview", {
        headers: { Authorization: `Bearer ${j.token}` }, cache: "no-store",
      });
      if (!response.ok) throw new Error(`Sondes indisponibles (HTTP ${response.status})`);
      const body = (await response.json()) as OperationsOverview;
      if (!body || !Array.isArray(body.services)) throw new Error("Format de supervision invalide");
      setOverview(body); setError("");
      // History is optional; failure never hides live probes.
      try {
        const timeline = await fetch("/api/ops/history", {
          headers: { Authorization: `Bearer ${j.token}` }, cache: "no-store",
        });
        if (timeline.ok) {
          const data = await timeline.json();
          setHistory(Array.isArray(data.items) ? data.items.slice(-60) : []);
        }
      } catch { setHistory([]); }
    } catch (e) {
      setOverview(null); setHistory([]);
      setError(e instanceof Error ? e.message : "Supervision indisponible");
    } finally { setLoading(false); }
  }, [j.token]);

  useEffect(() => {
    if (!j.token) { setOverview(null); setHistory([]); setError(""); setView(null); return; }
    let cancelled = false;
    let timer: number;
    async function tick() { await refresh(); if (!cancelled) timer = window.setTimeout(tick, 10000); }
    void tick();
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [j.token, refresh]);

  function open(next: OpsView) {
    if (!j.token) { j.setDialog("connection"); return; }
    j.setDialog(null); setView(next);
  }
  function investigate(item: WazuhAlert) { setView(null); j.open("incident", item); }

  return (
    <Context.Provider value={{ view, open, close: () => setView(null), overview, history, error, loading, refresh, investigate }}>
      {children}
    </Context.Provider>
  );
}

export function useOperations() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("OperationsProvider missing");
  return ctx;
}
