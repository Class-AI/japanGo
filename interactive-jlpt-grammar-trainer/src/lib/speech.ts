"use client";

/** Text-to-speech in Japanese using the browser voice. */
export function speakJa(text: string, rate = 0.9) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ja-JP";
  u.rate = rate;
  const voice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith("ja"));
  if (voice) u.voice = voice;
  window.speechSynthesis.speak(u);
}

// Minimal typings for the Web Speech API (not in lib.dom for all TS versions)
export interface SRAlternative {
  transcript: string;
  confidence: number;
}
export interface SRResult {
  isFinal: boolean;
  length: number;
  [i: number]: SRAlternative;
}
export interface SREvent {
  resultIndex: number;
  results: { length: number; [i: number]: SRResult };
}
export interface SRInstance {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SREvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}

export function createRecognizer(): SRInstance | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SRInstance;
    webkitSpeechRecognition?: new () => SRInstance;
  };
  const C = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!C) return null;
  const r = new C();
  r.lang = "ja-JP";
  r.interimResults = true;
  r.continuous = true;
  r.maxAlternatives = 1;
  return r;
}

export async function toReading(text: string): Promise<string> {
  try {
    const res = await fetch("/api/reading", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const d = (await res.json()) as { reading?: string };
    return d.reading ?? "";
  } catch {
    return "";
  }
}
