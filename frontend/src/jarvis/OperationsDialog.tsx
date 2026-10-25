import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Activity, AlertTriangle, BookOpen, Brain, CreditCard,
  Download, FileCode2, RefreshCw, Search, Server, ShieldCheck, X,
} from "lucide-react";
import { formatDate, useJarvis, type WazuhAlert } from "./JarvisContext";
import { useOperations, type OpsView, type ServiceProbe } from "./OperationsContext";
import "./operations.css";
import { MlWorkshop, RecoveryWorkshop, LocalRagWorkshop } from "./WorkshopSections";

const SECTIONS: { key: OpsView; label: string }[] = [
  { key: "services",    label: "Services" },
  { key: "incidents",   label: "Incidents" },
  { key: "logs",        label: "Logs XML" },
  { key: "remediation", label: "Remédiation" },
  { key: "ml",          label: "Détecteur ML" },
  { key: "transactions",label: "Transactions" },
  { key: "knowledge",   label: "Knowledge Base" },
];

function stateText(service: ServiceProbe) {
  return service.state === "reachable"
    ? (service.name === "redis" ? "Redis OK" : "HTTP OK")
    : service.state === "degraded" ? "À vérifier" : "Injoignable";
}

function download(name: string, contents: string, mime: string) {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = name; a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportAlerts(alerts: WazuhAlert[]) {
  download("jarvis-alertes-wazuh.json", JSON.stringify(alerts, null, 2), "application/json");
}

export default function OperationsDialog() {
  const ops = useOperations();
  const j = useJarvis();
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("all");
  const closeRef = useRef<HTMLButtonElement>(null);
  const focusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!ops.view) return;
    focusRef.current = document.activeElement as HTMLElement;
    const dashboard = document.querySelector<HTMLElement>('[data-testid="command-center"]');
    if (dashboard) { dashboard.inert = true; dashboard.setAttribute("aria-hidden", "true"); }
    closeRef.current?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") ops.close();
      if (event.key === "Tab") {
        const elements = [...document.querySelectorAll<HTMLElement>(
          ".op-dialog button:not(:disabled), .op-dialog input:not(:disabled), .op-dialog select:not(:disabled)"
        )];
        const first = elements[0], last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("keydown", key);
      if (dashboard) { dashboard.inert = false; dashboard.removeAttribute("aria-hidden"); }
      focusRef.current?.focus();
    };
  }, [ops.view]);

  if (!ops.view) return null;

  const filtered = j.alerts.filter(alert => {
    const term = query.trim().toLowerCase();
    const match = !term || [alert.id, alert.rule_id, alert.src_ip, alert.description, alert.url, alert.http_status]
      .some(value => String(value || "").toLowerCase().includes(term));
    const bySeverity = severity === "all"
      || (severity === "critical" ? alert.level >= 12
      : severity === "high" ? alert.level >= 9 && alert.level < 12
      : alert.level < 9);
    return match && bySeverity;
  });

  const viewName = SECTIONS.find(item => item.key === ops.view)?.label || "Operations";
  const section = ops.view;

  return createPortal(
    <div className="op-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) ops.close(); }}>
      <section className="op-dialog" role="dialog" aria-modal="true" aria-labelledby="op-title">
        <header className="op-header">
          <div>
            <h2 id="op-title">JARVIS / {viewName.toUpperCase()}</h2>
            <p>SUPERVISION LECTURE SEULE · AGENT WINDOWS DE REPRISE AUTORISÉ SÉPARÉ</p>
          </div>
          <button ref={closeRef} type="button" onClick={ops.close} aria-label="Fermer la vue">
            <X size={20} />
          </button>
        </header>
        <nav className="op-tabs" aria-label="Rubriques JARVIS">
          {SECTIONS.map(s => (
            <button key={s.key} className={section === s.key ? "selected" : ""} onClick={() => ops.open(s.key)}>
              {s.label}
            </button>
          ))}
        </nav>
        <main className="op-body">
          {section === "services" && <>
            <div className="op-heading">
              <h3><Server size={17} /> Vérifications HTTP internes</h3>
              <button onClick={() => void ops.refresh()}><RefreshCw size={14} /> Actualiser</button>
            </div>
            {ops.error && <p className="op-warning" role="status">{ops.error} — aucun statut vert non vérifié n'est conservé.</p>}
            <p className="op-muted">Vérifications depuis le backend JARVIS toutes les 10 secondes. Un HTTP 200 confirme une réponse à /health, pas la santé de tout le conteneur.</p>
            <div className="op-services">
              {(ops.overview?.services || []).map(service => (
                <article key={service.name} className="op-service">
                  <span className={"op-dot " + service.state} />
                  <div><strong>{service.label}</strong><small>{service.name}</small></div>
                  <span title={service.evidence || ""}>
                    {stateText(service)}{service.latency_ms !== null && ` · ${service.latency_ms} ms`}
                    <small style={{ display: "block", maxWidth: 220 }}>{service.evidence || ""}</small>
                  </span>
                </article>
              ))}
              {!ops.overview && <p className="op-muted">{ops.loading ? "Mesures en cours…" : "Aucune mesure disponible."}</p>}
            </div>
            <p className="op-muted">
              Non supervisés ici : {(ops.overview?.not_monitored || ["PostgreSQL", "Wazuh manager", "CPU/RAM", "transactions"]).join(", ")}.
            </p>
            {ops.overview && <p className="op-muted">Dernière mesure : {formatDate(ops.overview.sampled_at)}</p>}
          </>}

          {(section === "incidents" || section === "logs") && <>
            <div className="op-heading">
              <h3><ShieldCheck size={17} /> Alertes Wazuh reçues · {filtered.length}</h3>
              <div className="op-buttons">
                <button onClick={() => void j.refresh()}><RefreshCw size={14} /> Actualiser</button>
                <button disabled={!j.alerts.length} onClick={() => exportAlerts(filtered)}>
                  <Download size={14} /> Export JSON
                </button>
              </div>
            </div>
            <div className="op-filters">
              <label>
                <Search size={14} />
                <input aria-label="Rechercher une alerte" placeholder="Règle, IP, chemin, texte…"
                  value={query} onChange={e => setQuery(e.target.value)} />
              </label>
              <select aria-label="Filtrer par gravité" value={severity} onChange={e => setSeverity(e.target.value)}>
                <option value="all">Toutes gravités</option>
                <option value="critical">Critiques (12+)</option>
                <option value="high">Élevées (9–11)</option>
                <option value="other">Autres (0–8)</option>
              </select>
            </div>
            {!j.connected && <p className="op-warning">Flux Wazuh non connecté. Vérifiez votre session opérateur.</p>}
            {filtered.length
              ? <div className="op-table"><table><thead><tr>
                  <th>Date</th><th>Règle</th><th>Niveau</th><th>IP</th><th>Événement</th><th>Actions</th>
                </tr></thead><tbody>
                {filtered.map(alert => (
                  <tr key={alert.id}>
                    <td>{formatDate(alert.timestamp)}</td>
                    <td>#{alert.rule_id}</td>
                    <td className={alert.level >= 12 ? "op-critical" : ""}>{alert.level}</td>
                    <td>{alert.src_ip || "—"}</td>
                    <td>{alert.description}</td>
                    <td><button onClick={() => ops.investigate(alert)}>
                      <FileCode2 size={14} />{section === "logs" ? "XML" : "Détails / IA"}
                    </button></td>
                  </tr>
                ))}
              </tbody></table></div>
              : <p className="op-muted">Aucune alerte correspondant aux filtres.</p>}
          </>}

          {section === "remediation" && <>
            <div className="op-heading"><h3><AlertTriangle size={17} /> Remédiation locale contrôlée</h3></div>
            <RecoveryWorkshop />
          </>}

          {section === "ml" && <>
            <div className="op-heading"><h3><Brain size={17} /> Détecteur ML réel</h3></div>
            <MlWorkshop />
          </>}

          {section === "transactions" && <>
            <div className="op-heading"><h3><CreditCard size={17} /> Paiements PayLab (cartes fictives)</h3></div>
            <p className="op-warning">Aucune API de statistiques transactionnelles authentifiées n'est reliée à JARVIS. Les alertes de paiement Wazuh ne permettent pas de calculer un chiffre d'affaires ou un nombre exact de transactions.</p>
            <p>Alertes liées aux paiements dans l'échantillon reçu : <strong>{j.alerts.filter(a => ["100220", "100221", "100222", "100225", "100226"].includes(a.rule_id)).length}</strong>.</p>
            <button onClick={() => ops.open("incidents")}>Afficher les alertes PayLab</button>
          </>}

          {section === "knowledge" && <>
            <div className="op-heading"><h3><BookOpen size={17} /> Base de connaissances · règles SYS-PAI</h3></div>
            <div className="op-guides">
              <article><strong>100213 · Sondage /.env</strong><p>Accès à un chemin sensible ; un refus HTTP 403 indique que cette requête a été bloquée.</p></article>
              <article><strong>100224 · Authentifications échouées répétées</strong><p>Corrélation d'échecs depuis une même IP ; vérifier s'il s'agit d'un test ou d'un abus réel.</p></article>
              <article><strong>100226 · Paiements refusés répétés</strong><p>Blocage temporaire déclenché après refus multiples sur des cartes de démonstration.</p></article>
            </div>
            <LocalRagWorkshop />
          </>}
        </main>
        <footer className="op-footer">
          <span><Activity size={13} /> LIVE si connecté · PAS DE DONNÉES FICTIVES DANS CES VUES</span>
          <span>{j.connected ? "Wazuh API connectée" : "Wazuh API non connectée"}</span>
        </footer>
      </section>
    </div>,
    document.body,
  );
}
