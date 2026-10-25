import { useState } from "react";
import { Check, Copy, ListChecks } from "lucide-react";
import type { ResponsePlan } from "./JarvisContext";

export default function ResponseChecklist({ plan }: { plan?: ResponsePlan }) {
  const [done, setDone] = useState<string[]>([]);
  const [copied, setCopied] = useState("");
  const [copyError, setCopyError] = useState("");
  if (!plan) return null;
  async function copy(id: string, text: string) {
    try { await navigator.clipboard.writeText(text); setCopied(id); setCopyError(""); }
    catch { setCopyError("Copie indisponible : sélectionnez la commande dans le bloc ci-dessous."); }
  }
  return <section className="jv-runbook" aria-labelledby="jv-runbook-title">
    <div className="jv-runbook-heading"><h3 id="jv-runbook-title"><ListChecks size={18}/>Plan d’action précis</h3>
      <span>{done.length} / {plan.steps.length} vérifications cochées</span></div>
    <p className="jv-note">{plan.title} · Disponible même si l’API IA est limitée. Les commandes se copient; leur exécution reste manuelle.</p>
    <ul className="jv-plan-notes">{plan.notes.map((note, i) => <li key={i}>{note}</li>)}</ul>
    {copyError && <p role="alert" className="jv-error">{copyError}</p>}
    <ol className="jv-steps">{plan.steps.map(step => <li key={step.id} className={done.includes(step.id) ? "jv-step checked" : "jv-step"}>
      <div className="jv-step-heading"><h4>{step.title}</h4>
        {step.requires_approval && <span className="jv-approval">VALIDATION DU PROPRIÉTAIRE REQUISE</span>}</div>
      <dl><div><dt>Où</dt><dd>{step.where}</dd></div><div><dt>Quand</dt><dd>{step.when}</dd></div></dl>
      <p>{step.instructions}</p>
      {step.command && <div className="jv-command"><button type="button" aria-label={"Copier la commande : " + step.id}
        onClick={() => void copy(step.id, step.command)}>{copied === step.id ? <Check size={13}/> : <Copy size={13}/>} {copied === step.id ? "Copié" : "Copier"}</button>
        <pre>{step.command}</pre></div>}
      <p className="jv-expected"><strong>Résultat à vérifier : </strong>{step.expected_result}</p>
      {step.rollback && <details className="jv-rollback"><summary>Retour arrière</summary><pre>{step.rollback}</pre></details>}
      <label className="jv-step-check"><input type="checkbox" checked={done.includes(step.id)}
        onChange={e => setDone(old => e.target.checked ? [...old, step.id] : old.filter(id => id !== step.id))}/>
        Vérification effectuée : {step.id}</label>
    </li>)}</ol>
  </section>;
}

