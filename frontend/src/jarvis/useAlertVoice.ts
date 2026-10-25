import { useCallback, useEffect, useRef, useState } from "react";
import type { WazuhAlert } from "./JarvisContext";

/** Speech is unlocked by an explicit click; the first poll is always a silent baseline. */
export function useAlertVoice(alerts: WazuhAlert[], token: string, paused: boolean,
  onError: (message: string) => void) {
  const [announcements, setAnnouncements] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [lastAnnouncement, setLastAnnouncement] = useState("");
  const seen = useRef(new Set<string>());
  const baseline = useRef(false);
  const pending = useRef<WazuhAlert[]>([]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel(); setSpeaking(false);
  }, []);
  const speak = useCallback((text: string, interrupt = true) => {
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      onError("Synthèse vocale indisponible dans ce navigateur."); return;
    }
    if (interrupt) window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR"; utterance.rate = 1;
    const voice = window.speechSynthesis.getVoices().find(v => v.lang.startsWith("fr"));
    if (voice) utterance.voice = voice;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = event => {
      setSpeaking(false);
      if (event.error !== "interrupted" && event.error !== "canceled")
        onError("Lecture vocale bloquée ou indisponible. Réactivez les annonces et vérifiez le son du navigateur.");
    };
    window.speechSynthesis.speak(utterance);
  }, [onError]);

  useEffect(() => {
    baseline.current = false; seen.current.clear(); pending.current = [];
    setAnnouncements(false); setLastAnnouncement(""); stopSpeaking();
  }, [token, stopSpeaking]);

  const observe = useCallback((items: WazuhAlert[]) => {
    if (!baseline.current) {
      items.forEach(a => seen.current.add(a.id)); baseline.current = true; return;
    }
    const fresh = items.filter(a => !seen.current.has(a.id));
    items.forEach(a => seen.current.add(a.id));
    if (seen.current.size > 5000) seen.current = new Set(items.map(a => a.id));
    if (announcements && fresh.length) pending.current = [...pending.current, ...fresh].slice(-100);
  }, [announcements]);

  useEffect(() => {
    if (!announcements || paused || !pending.current.length) return;
    const batch = pending.current.splice(0);
    const strongest = batch.reduce((a, b) => a.level > b.level ? a : b);
    const message = batch.length > 1 ?
      "JARVIS. " + batch.length + " nouvelles alertes Wazuh. Niveau maximal " + strongest.level + ". Consultez le flux et le plan d’action." :
      "JARVIS. Nouvelle alerte Wazuh. Règle " + strongest.rule_id + ", niveau " + strongest.level + ". " +
      (strongest.id.startsWith("DEMO.") ? "Événement de démonstration. " : "") + "Ouvrez l’incident pour voir les actions à prendre.";
    setLastAnnouncement(message); speak(message, false);
  }, [alerts, announcements, paused, speak]);

  function toggleAnnouncements() {
    onError("");
    if (announcements) { setAnnouncements(false); pending.current = []; stopSpeaking(); }
    else {
      if (!("speechSynthesis" in window)) { onError("Synthèse vocale indisponible."); return; }
      setAnnouncements(true);
      speak("JARVIS. Annonces activées. Je signalerai les nouvelles alertes reçues.");
    }
  }
  return { announcements, toggleAnnouncements, speaking, speak, stopSpeaking,
    lastAnnouncement, observe };
}

