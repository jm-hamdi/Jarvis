import { useEffect, useState } from "react";
import { useJarvis } from "./JarvisContext";

type ML = {
  status?: string; time?: string; model?: string; training_source?: string;
  anomaly?: boolean; eligible_for_recovery?: boolean; score?: number; threshold?: number;
  event_count?: number; affected_services?: string[]; rule_ids?: string[];
  evaluation_simulated?: { precision: number; recall: number; false_positive_rate: number };
};
type Recovery = { state: string; service: string; event_time: string; reason: string; payment_http?: number | null };

export function MlWorkshop() {
  const j = useJarvis();
  const [record, setRecord] = useState<ML | null>(null);
  const [issue, setIssue] = useState("");
  useEffect(() => {
    if (!j.token) return;
    let active = true;
    async function tick() {
      try {
        const response = await fetch("/api/workshop/ml/latest", {
          headers: { Authorization: `Bearer ${j.token}` }, cache: "no-store",
        });
        if (!response.ok) throw new Error(`API ML HTTP ${response.status}`);
        if (active) { setRecord((await response.json()) as ML); setIssue(""); }
      } catch (error) {
        if (active) { setRecord(null); setIssue(error instanceof Error ? error.message : "ML indisponible"); }
      }
    }
    void tick();
    const timer = window.setInterval(() => void tick(), 5000);
    return () => { active = false; window.clearInterval(timer); };
  }, [j.token]);
  return (
    <section className="op-guides">
      <article>
        <strong>IsolationForest · détection statistique</strong>
        <p>{issue || (record?.status === "observed" ? `Dernière inférence : ${record.time || "—"}` : "Aucune mesure ML reçue")}</p>
        {record?.status === "observed" && <>
          <p><strong>{record.anomaly ? "Anomalie ML détectée" : "Écart ML non détecté"}</strong>
            {" "}· score {record.score?.toFixed(3)} · seuil {record.threshold?.toFixed(3)}</p>
          <p>{record.event_count ?? 0} alertes Wazuh dans la fenêtre
            {" "}· service(s) indisponible(s) : {record.affected_services?.join(", ") || "aucun"}</p>
          <p>Proposition de reprise : {record.eligible_for_recovery
            ? "Oui, conditions réunies (l'agent Windows décide et journalise)"
            : "Non"}</p>
        </>}
      </article>
      <article>
        <strong>Limites de l'évaluation</strong>
        <p>Entraînement initial : <strong>{record?.training_source || "non renseigné"}</strong>.
          {" "}Les métriques suivantes sont issues de données <strong>synthétiques</strong>, pas d'un banc d'essai réel.</p>
        {record?.evaluation_simulated && (
          <p>Précision {record.evaluation_simulated.precision}
            {" "}· Rappel {record.evaluation_simulated.recall}
            {" "}· Taux de faux positifs {record.evaluation_simulated.false_positive_rate}</p>
        )}
      </article>
    </section>
  );
}

export function RecoveryWorkshop() {
  const j = useJarvis();
  const [logs, setLogs] = useState<Recovery[]>([]);
  const [issue, setIssue] = useState("");
  useEffect(() => {
    if (!j.token) return;
    let active = true;
    async function tick() {
      try {
        const response = await fetch("/api/workshop/recovery/recent", {
          headers: { Authorization: `Bearer ${j.token}` }, cache: "no-store",
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (active) { setLogs(Array.isArray(data.items) ? data.items : []); setIssue(""); }
      } catch (e) {
        if (active) { setLogs([]); setIssue(e instanceof Error ? e.message : "Indisponible"); }
      }
    }
    void tick();
    const timer = window.setInterval(() => void tick(), 8000);
    return () => { active = false; window.clearInterval(timer); };
  }, [j.token]);
  return (
    <div className="op-guides">
      <article>
        <strong>Journal de remédiation locale</strong>
        <p>Actions autorisées uniquement par l'agent Windows local. Aucune commande Docker n'est générée par une IA ni exécutée depuis JARVIS.</p>
        {issue && <p role="alert">{issue}</p>}
        {!logs.length && <p>Pas encore d'exécution prouvée. Le service peut être sain sans qu'une remédiation ait eu lieu.</p>}
      </article>
      {logs.slice(0, 12).map((log, index) => (
        <article key={`${log.event_time}-${index}`}>
          <strong>{log.state} · {log.service}</strong>
          <p>{new Date(log.event_time).toLocaleString("fr-FR")} — {log.reason}</p>
          {log.payment_http != null && (
            <p>Paiement de preuve : HTTP {log.payment_http} {log.payment_http === 201 ? "(accepté)" : "(non confirmé)"}</p>
          )}
        </article>
      ))}
    </div>
  );
}

export function LocalRagWorkshop() {
  const j = useJarvis();
  const [question, setQuestion] = useState("Que signifie la règle Wazuh 100213 ?");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  async function ask() {
    if (!j.token || busy || question.trim().length < 5) return;
    setBusy(true); setAnswer(""); setSources([]);
    try {
      const response = await fetch("/api/workshop/rag/ask", {
        method: "POST",
        headers: { Authorization: `Bearer ${j.token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.detail || `HTTP ${response.status}`);
      setAnswer(String(body.answer || "Aucune réponse"));
      setSources((body.sources || []).map((s: { file: string }) => s.file));
    } catch (e) { setAnswer(e instanceof Error ? e.message : "RAG local indisponible"); }
    finally { setBusy(false); }
  }
  return (
    <article className="op-guides" style={{ display: "grid", gap: 12 }}>
      <strong>RAG local · Ollama qwen2.5:3b · LangChain</strong>
      <label htmlFor="rag-q">Question sur la documentation du workshop</label>
      <input
        id="rag-q" value={question} maxLength={1000}
        onChange={e => setQuestion(e.target.value)}
        style={{ padding: 10, background: "#0f1d2b", color: "white", border: "1px solid #486078", borderRadius: 6 }}
      />
      <button disabled={busy || question.trim().length < 5} onClick={() => void ask()}>
        {busy ? "Analyse locale en cours…" : "Interroger la base locale"}
      </button>
      {answer && <p style={{ whiteSpace: "pre-wrap" }} role="status">{answer}</p>}
      {sources.length > 0 && <small>Sources : {sources.join(", ")}</small>}
      <small>Recherche TF-IDF sur documents locaux ; la génération utilise Ollama. Aucune requête n'est envoyée à OpenRouter pour cette fonction.</small>
    </article>
  );
}
