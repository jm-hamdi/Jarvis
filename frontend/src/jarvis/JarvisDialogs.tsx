import { useEffect, useRef, useState } from "react";
import { Brain, FileCode2, Loader2, LockKeyhole, Mic, Send, Square, Volume2, X } from "lucide-react";
import { createPortal } from "react-dom";
import { formatDate, useJarvis } from "./JarvisContext";
import "./jarvis.css";
import ResponseChecklist from "./ResponseChecklist";

export default function JarvisDialogs() {
  const j = useJarvis();
  const [draft, setDraft] = useState("");
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const result = j.selected ? j.analyses[j.selected.id] : null;
  useEffect(() => {
    if (!j.dialog) return;
    returnFocus.current = document.activeElement as HTMLElement;
    closeRef.current?.focus();
    const dashboard = document.querySelector<HTMLElement>('[data-testid="command-center"]');
    if (dashboard) { dashboard.inert = true; dashboard.setAttribute("aria-hidden", "true"); }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") j.setDialog(null);
      if (event.key === "Tab") {
        const elements = [...document.querySelectorAll<HTMLElement>('.jv-dialog button:not(:disabled),.jv-dialog input,.jv-dialog textarea,.jv-dialog select,.jv-dialog summary')];
        const first = elements[0], last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (dashboard) { dashboard.inert = false; dashboard.removeAttribute("aria-hidden"); }
      returnFocus.current?.focus();
    };
  }, [j.dialog]);
  if (!j.dialog) return null;
  const title = j.dialog === "connection" ? "OPERATOR ACCESS" : j.dialog === "chat" ? "TALK TO JARVIS" : "INCIDENT INVESTIGATION";
  return createPortal(
    <div className="jv-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) j.setDialog(null); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="jv-title" className={"jv-dialog " + (j.dialog === "connection" ? "jv-connection" : "")}>
        <header className="jv-dialog-header"><div><h2 id="jv-title">{title}</h2><p>JARVIS COMMAND CENTER · LECTURE SEULE</p></div>
          <button ref={closeRef} className="jv-icon" aria-label="Fermer" onClick={() => j.setDialog(null)}><X size={21}/></button></header>
        <div className="jv-dialog-body">
          {j.error && <div className="jv-error" role="alert">{j.error}</div>}
          {j.dialog === "connection" ? <>
            <p className="jv-intro">Connectez votre session opérateur au flux Wazuh et à JARVIS. Les clés des modèles restent sur le serveur.</p>
            <form onSubmit={event => { event.preventDefault(); j.connect(draft); setDraft(""); }}>
              <label className="jv-label" htmlFor="jv-token">Jeton opérateur</label>
              <input id="jv-token" type="password" autoComplete="off" minLength={32} required
                value={draft} onChange={e => setDraft(e.target.value)} placeholder="JARVIS_OPERATOR_TOKEN"/>
              <div className="jv-actions"><button className="jv-primary" type="submit"><LockKeyhole size={15}/>Connecter</button>
                {j.token && <button type="button" onClick={j.logout}>Déconnecter</button>}</div>
            </form>
            <p className="jv-note">Utilisez le jeton de votre fichier .env privé. Il est conservé uniquement pour cet onglet.</p>
            {j.connected && <div className="jv-connected" role="status">API connectée · {j.alerts.length} événements reçus
              <button onClick={() => j.setDialog(null)}>Retour au Command Center</button></div>}
          </> : <>
            <div className="jv-context">
              <label htmlFor="jv-incident">INCIDENT WAZUH</label>
              <select id="jv-incident" value={j.selected?.id || ""} onChange={e => j.setSelected(j.alerts.find(a => a.id === e.target.value) || null)}>
                {!j.selected && <option value="">Sélectionnez une alerte</option>}
                {j.selected && !j.alerts.some(a => a.id === j.selected?.id) &&
                  <option value={j.selected.id}>{j.selected.id}</option>}
                {j.alerts.map(a => <option key={a.id} value={a.id}>{a.id} · #{a.rule_id} · niveau {a.level}</option>)}
              </select>
              <span>{j.selected?.id.startsWith("DEMO.") ? "ÉCHANTILLON SYNTHÉTIQUE" : "ÉVÉNEMENT REÇU"}</span>
            </div>
            {!j.selected ? <p className="jv-empty">Aucune alerte reçue. Envoyez un événement depuis Wazuh ou le script de démonstration.</p> :
              j.dialog === "incident" ? <><div className="jv-investigation">
                <div className="jv-evidence"><h3><FileCode2 size={16}/> FAITS WAZUH</h3>
                  <h4>{j.selected.description}</h4><dl>
                    <div><dt>Règle / niveau</dt><dd>#{j.selected.rule_id} · {j.selected.level} / 16 · {j.selected.severity}</dd></div>
                    <div><dt>Date</dt><dd>{formatDate(j.selected.timestamp)}</dd></div>
                    <div><dt>Source locale</dt><dd>{j.selected.src_ip || "Non fournie"}</dd></div>
                    <div><dt>HTTP / chemin</dt><dd>{j.selected.http_status || "—"} · {j.selected.url || "—"}</dd></div>
                  </dl>
                  <details open><summary>XML original reçu</summary><pre>{j.selected.xml}</pre></details>
                  <p className="jv-note">XML et adresse IP restent locaux. Seules les métadonnées autorisées sont envoyées au modèle.</p>
                </div>
                <div className="jv-ai"><h3><Brain size={16}/> JARVIS ANALYSIS</h3>
                  <div className="jv-ai-control"><span>{j.health?.configured ? j.health.model : "Configurez une clé OpenRouter côté backend."}</span>
                    <button className="jv-primary" disabled={!!j.busy || !j.health?.configured} onClick={() => void j.analyze()}>
                      {j.busy === "analysis" ? <Loader2 className="jv-spin" size={15}/> : <Brain size={15}/>}
                      {j.busy === "analysis" ? "Analyse en cours…" : result ? "Afficher l’analyse en cache" : "Analyser avec l’IA"}
                    </button></div>
                  {result ? <article className="jv-analysis">
                    <p className="jv-result-meta">{result.cached ? "CACHE" : "ANALYSE GÉNÉRÉE"} · {formatDate(result.generated_at)}</p>
                    <h4>{result.analysis.title}</h4><p>{result.analysis.summary}</p>
                    <div className="jv-tags"><span>Risque IA : {result.analysis.risk_level}</span><span>{result.analysis.verdict}</span></div>
                    <h5>Interprétation possible</h5><p>{result.analysis.interpretation}</p>
                    <h5>Éléments transmis au modèle</h5><ul>{result.evidence.map(e => <li key={e}>{e}</li>)}</ul>
                    <h5>Vérifications manuelles</h5><ol>{result.analysis.recommended_steps.map((step, i) => <li key={i}>{step}</li>)}</ol>
                    <p className="jv-limit">{result.analysis.limitations}</p>
                    <p className="jv-note">Modèle : {result.model} · Aucune action exécutée</p>
                    <button onClick={() => j.speak(result.analysis.summary)}><Volume2 size={15}/>Lire le résumé</button>
                  </article> : <p className="jv-empty">Demandez une analyse pour expliquer les éléments de cette alerte. Aucune action de remédiation ne sera exécutée.</p>}
                </div>
              </div><ResponseChecklist key={j.selected.id} plan={j.plans[j.selected.id] || result?.response_plan}/></> : <div className="jv-chat">
                <p className="jv-note">Questions sur l’incident sélectionné. Chaque question est indépendante.</p>
                <div className="jv-messages" aria-live="polite">
                  {!j.messages.some(m => m.incident === j.selected?.id) &&
                    <p className="jv-empty">« Explique cette alerte. Que faut-il vérifier ? »</p>}
                  {j.messages.filter(m => m.incident === j.selected?.id).map((m, i) =>
                    <div className={"jv-message " + m.role} key={i}><strong>{m.role === "operator" ? "OPERATOR" : "JARVIS"}</strong>
                      <p>{m.text}</p>{m.role === "jarvis" && <button aria-label="Lire la réponse" onClick={() => j.speak(m.text)}><Volume2 size={15}/></button>}</div>)}
                  {j.busy === "chat" && <p className="jv-note">JARVIS prépare sa réponse…</p>}
                </div>
                <form onSubmit={event => { event.preventDefault(); void j.send(); }}>
                  <textarea aria-label="Question à JARVIS" maxLength={2000} rows={3} value={j.question}
                    onChange={e => j.setQuestion(e.target.value)} placeholder="Votre question sur cet incident…"/>
                  <div className="jv-actions">
                    <button type="button" onClick={() => void j.toggleRecording()}
                      disabled={(!j.recording && !!j.busy) || !j.health?.voice_transcription_configured}
                      aria-label={j.recording ? "Arrêter l’enregistrement" : "Enregistrer une question"}>
                      {j.recording ? <Square size={15}/> : <Mic size={15}/>} {j.recording ? "Arrêter" : "Micro"}
                    </button>
                    <label className="jv-voice-option"><input type="checkbox" checked={j.readAloud}
                      onChange={e => j.setReadAloud(e.target.checked)}/>Lire les réponses</label>
                    <button type="submit" className="jv-primary" disabled={!!j.busy || j.recording || !j.question.trim() || !j.health?.configured}><Send size={15}/>Envoyer</button>
                  </div>
                </form>
                <p className="jv-note">{j.recording ? "Enregistrement… arrêt automatique après 15 s." :
                  j.health?.voice_transcription_configured ? "Micro : Groq · relecture avant envoi · sortie vocale : navigateur." :
                  "Configurez GROQ_API_KEY pour le microphone. Le chat texte reste disponible."}</p>
              </div>}
          </>}
          {j.voiceError && <p className="jv-error" role="alert">{j.voiceError}</p>}
          {j.connected && <div className="jv-speech-controls">
            <button type="button" aria-pressed={j.announcements} onClick={j.toggleAnnouncements}>
              <Volume2 size={14}/>Annonces des alertes : {j.announcements ? "ON" : "OFF"}</button>
            <button type="button" onClick={j.stopSpeaking}>Arrêter la voix</button>
            <p className="jv-note">Activez une fois par ouverture de page pour autoriser le son. Les anciennes alertes ne sont pas relues.</p>
            {j.lastAnnouncement && <p className="jv-note" role="status">Dernière annonce : {j.lastAnnouncement}</p>}
          </div>}
        </div>
        {j.dialog !== "connection" && <footer className="jv-dialog-footer">
          <span>AUCUNE ACTION EXÉCUTÉE · OPERATOR CONTROL</span><div className="jv-actions">
            <button onClick={() => j.open(j.dialog === "chat" ? "incident" : "chat")}>{j.dialog === "chat" ? "Voir l’incident" : "Talk to JARVIS"}</button>
            <button disabled={!j.selected} onClick={j.exportReport}>Exporter le rapport</button>
          </div></footer>}
      </section>
    </div>, document.body
  );
}
