import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useAlertVoice } from "./useAlertVoice";

export type WazuhAlert = { id: string; timestamp: string; rule_id: string; level: number;
  description: string; src_ip: string; program: string; url: string; http_status: string;
  agent: string; xml: string; severity: string };
export type ResponsePlan = { title: string; notes: string[]; family: string; steps: {
  id: string; title: string; where: string; when: string; instructions: string;
  command: string; expected_result: string; requires_approval: boolean; rollback: string }[] };
export type Analysis = { event_id: string; model: string; generated_at: string; cached: boolean; response_plan?: ResponsePlan;
  evidence: string[]; execution_status: string; analysis: { title: string; summary: string;
  category: string; verdict: string; risk_level: string; interpretation: string;
  recommended_steps: string[]; limitations: string } };
type Message = { role: "operator" | "jarvis"; text: string; incident: string };
export type Dialog = "connection" | "incident" | "chat" | null;

export function formatDate(value: string) {
  const parsed = new Date(value.replace(/([+-]\d\d)(\d\d)$/, "$1:$2"));
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString("fr-FR");
}

function useController() {
  const [token, setToken] = useState(() => sessionStorage.getItem("jarvis_operator_token") || "");
  const [alerts, setAlerts] = useState<WazuhAlert[]>([]);
  const [selected, setSelected] = useState<WazuhAlert | null>(null);
  const [analyses, setAnalyses] = useState<Record<string, Analysis>>({});
  const [plans, setPlans] = useState<Record<string, ResponsePlan>>({});
  const [health, setHealth] = useState<{ configured: boolean; model: string; voice_transcription_configured: boolean } | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [dialog, setDialog] = useState<Dialog>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [recording, setRecording] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [readAloud, setReadAloud] = useState(false);
  const voice = useAlertVoice(alerts, token, recording || busy === "transcription", setVoiceError);
  const observeRef = useRef(voice.observe); observeRef.current = voice.observe;
  const recorder = useRef<MediaRecorder | null>(null);
  const recordingGeneration = useRef(0);
  const requestingMic = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const tokenRef = useRef(token);
  tokenRef.current = token;

  const api = useCallback(async (path: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers);
    headers.set("Authorization", "Bearer " + token);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 260000);
    try {
      const response = await fetch("/api" + path, { ...options, headers, signal: controller.signal });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const detail = typeof body.detail === "string" ? body.detail : "Erreur HTTP " + response.status;
        const retry = response.headers.get("Retry-After");
        throw new Error(detail + (response.status === 429 ? " · Limite temporaire" + (retry ? ": réessayer dans " + retry + " s." : ": attendre avant de réessayer; les quotas gratuits peuvent être journaliers.") : ""));
      }
      return response;
    } finally { window.clearTimeout(timeout); }
  }, [token]);

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const body = await (await api("/wazuh/recent?limit=100")).json();
      if (tokenRef.current !== token) return;
      observeRef.current(body.items); setAlerts(body.items); setConnected(true);
    } catch (e) {
      if (tokenRef.current === token) {
        setConnected(false); setError(e instanceof Error ? e.message : "API indisponible");
      }
    }
  }, [token, api]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    let timeout: number;
    const poll = async () => { await refresh(); if (!cancelled) timeout = window.setTimeout(poll, 3500); };
    void poll();
    api("/jarvis/ai/health").then(r => r.json()).then(body => {
      if (!cancelled) { setHealth(body); setError(""); }
    }).catch(e => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; window.clearTimeout(timeout); };
  }, [token, api, refresh]);

  useEffect(() => {
    if (!selected || !token || !dialog || dialog === "connection") return;
    let cancelled = false;
    api("/jarvis/incident/" + encodeURIComponent(selected.id) + "/summary")
      .then(r => r.json()).then(body => {
        if (!cancelled && body.status === "completed")
          setAnalyses(old => ({ ...old, [body.event_id]: body }));
      }).catch(e => { if (!cancelled) setError(e.message); });
    api("/jarvis/incident/" + encodeURIComponent(selected.id) + "/response-plan")
      .then(r => r.json()).then(body => {
        if (!cancelled) setPlans(old => ({ ...old, [selected.id]: body }));
      }).catch(e => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, [selected?.id, token, api, dialog]);

  useEffect(() => () => {
    recordingGeneration.current++; requestingMic.current = false;
    window.clearTimeout(timer.current);
    if (recorder.current) recorder.current.onstop = null;
    recorder.current?.stream.getTracks().forEach(t => t.stop());
    window.speechSynthesis?.cancel();
  }, []);

  function connect(value: string) {
    sessionStorage.setItem("jarvis_operator_token", value.trim());
    setError(""); setToken(value.trim());
  }
  function logout() {
    recordingGeneration.current++; requestingMic.current = false;
    sessionStorage.removeItem("jarvis_operator_token"); tokenRef.current = "";
    setToken(""); setConnected(false); setAlerts([]); setSelected(null);
    setAnalyses({}); setPlans({}); setMessages([]); setHealth(null); setError(""); setDialog("connection");
    if (recorder.current) recorder.current.onstop = null;
    recorder.current?.stream.getTracks().forEach(t => t.stop()); setRecording(false);
    window.clearTimeout(timer.current); window.speechSynthesis?.cancel();
  }
  function open(next: Dialog, alert?: WazuhAlert) {
    setError(""); setVoiceError("");
    if (alert) setSelected(alert);
    else if (!selected && alerts.length) setSelected(alerts[0]);
    changeDialog(token ? next : "connection");
  }
  async function analyze() {
    if (!selected) return;
    const id = selected.id; setBusy("analysis"); setError("");
    try {
      const body = await (await api("/jarvis/incident/" + encodeURIComponent(id) + "/analyze", { method: "POST" })).json();
      if (tokenRef.current === token) setAnalyses(old => ({ ...old, [id]: body }));
    } catch (e) { setError(e instanceof Error ? e.message : "Analyse indisponible"); }
    finally { setBusy(""); }
  }
  const speak = voice.speak;
  async function send() {
    if (!question.trim() || !selected || busy) return;
    const text = question.trim(), id = selected.id;
    setQuestion(""); setBusy("chat"); setError("");
    setMessages(old => [...old, { role: "operator", text, incident: id }]);
    try {
      const body = await (await api("/jarvis/chat", { method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, incident_id: id }) })).json();
      if (tokenRef.current === token) {
        setMessages(old => [...old, { role: "jarvis", text: body.reply, incident: id }]);
        if (readAloud) speak(body.reply);
      }
    } catch (e) { setError(e instanceof Error ? e.message : "Conversation indisponible"); }
    finally { setBusy(""); }
  }
  async function toggleRecording() {
    if (recording) { recorder.current?.stop(); return; }
    if (requestingMic.current) return;
    if (!navigator.mediaDevices || !("MediaRecorder" in window)) {
      setVoiceError("Microphone indisponible : utilisez localhost ou HTTPS."); return;
    }
    setVoiceError("");
    const generation = ++recordingGeneration.current; requestingMic.current = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (generation !== recordingGeneration.current || tokenRef.current !== token) {
        stream.getTracks().forEach(t => t.stop()); return;
      }
      const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg"].find(t => MediaRecorder.isTypeSupported(t));
      if (!mime) { stream.getTracks().forEach(t => t.stop()); throw new Error("Format audio non pris en charge."); }
      const rec = new MediaRecorder(stream, { mimeType: mime });
      const chunks: BlobPart[] = [];
      rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      rec.onstop = async () => {
        window.clearTimeout(timer.current); setRecording(false);
        stream.getTracks().forEach(t => t.stop()); setBusy("transcription");
        const form = new FormData();
        form.append("audio", new Blob(chunks, { type: mime }), mime.includes("ogg") ? "question.ogg" : "question.webm");
        try {
          const body = await (await api("/jarvis/voice/transcribe", { method: "POST", body: form })).json();
          if (tokenRef.current === token) setQuestion(body.transcript);
        } catch (e) { setVoiceError(e instanceof Error ? e.message : "Transcription indisponible"); }
        finally { setBusy(""); }
      };
      recorder.current = rec; rec.start(); setRecording(true);
      timer.current = window.setTimeout(() => { if (rec.state === "recording") rec.stop(); }, 15000);
    } catch (e) { if (generation === recordingGeneration.current) setVoiceError(e instanceof Error ? e.message : "Accès au microphone refusé"); }
    finally { if (generation === recordingGeneration.current) requestingMic.current = false; }
  }
  function exportReport() {
    if (!selected) { open("incident"); return; }
    const blob = new Blob([JSON.stringify({ event: selected, report: analyses[selected.id] || null,
      response_plan: plans[selected.id] || null }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob), link = document.createElement("a");
    link.href = url; link.download = "jarvis-" + selected.id + ".json"; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function changeDialog(next: Dialog) {
    if (next !== "chat") {
      recordingGeneration.current++; requestingMic.current = false;
      if (recorder.current) {
        recorder.current.onstop = null;
        if (recorder.current.state === "recording") recorder.current.stop();
        recorder.current.stream.getTracks().forEach(t => t.stop());
      }
      setRecording(false); window.clearTimeout(timer.current);
    }
    setDialog(next);
  }
  return { token, alerts, selected, setSelected, analyses, plans, health, connected, error, busy,
    dialog, setDialog: changeDialog, open, refresh, connect, logout, analyze, messages, question, setQuestion,
    send, speak, recording, toggleRecording, voiceError, readAloud, setReadAloud, exportReport,
    announcements: voice.announcements, toggleAnnouncements: voice.toggleAnnouncements,
    speaking: voice.speaking, stopSpeaking: voice.stopSpeaking, lastAnnouncement: voice.lastAnnouncement };
}

const Context = createContext<ReturnType<typeof useController> | null>(null);
export function JarvisProvider({ children }: { children: ReactNode }) {
  return <Context.Provider value={useController()}>{children}</Context.Provider>;
}
export function useJarvis() {
  const value = useContext(Context);
  if (!value) throw new Error("JarvisProvider missing");
  return value;
}
