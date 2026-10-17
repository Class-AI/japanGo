"use client";

import { useEffect, useRef, useState } from "react";
import type { SpeakItem } from "@/lib/types";
import { evaluate, type CheckResult, type PatternRule } from "@/lib/check";
import { createRecognizer, toReading, type SRInstance } from "@/lib/speech";
import { JpLine, Pill } from "./ui";

interface Props {
  items: SpeakItem[];
  rules: PatternRule[];
  passMark: number; // number of correct answers needed
  onFinish: (score: number, total: number) => void;
  combined?: boolean;
}

export default function SpeakingTest({ items, rules, passMark, onFinish, combined }: Props) {
  const [i, setI] = useState(0);
  const [results, setResults] = useState<(boolean | null)[]>(() => items.map(() => null));
  const [listening, setListening] = useState(false);
  const [finalText, setFinalText] = useState("");
  const [interim, setInterim] = useState("");
  const [typed, setTyped] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [supported, setSupported] = useState(true);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const recRef = useRef<SRInstance | null>(null);
  const finalRef = useRef("");

  useEffect(() => {
    setSupported(!!createRecognizer());
    return () => recRef.current?.abort();
  }, []);

  const [en, jp, reading] = items[i];

  const resetItem = () => {
    recRef.current?.abort();
    setListening(false);
    setFinalText("");
    finalRef.current = "";
    setInterim("");
    setTyped("");
    setResult(null);
    setShowAnswer(false);
    setShowHint(false);
    setErr("");
  };

  const runCheck = async (heard: string) => {
    if (!heard.trim()) {
      setErr("I didn't catch anything. Try again, speak clearly, or type your answer.");
      return;
    }
    setChecking(true);
    const heardReading = await toReading(heard);
    const r = evaluate(heard, heardReading, jp, reading, rules);
    setResult(r);
    setChecking(false);
    setResults((arr) => arr.map((v, k) => (k === i ? r.passed || v === true : v)));
  };

  const start = () => {
    const rec = createRecognizer();
    if (!rec) {
      setSupported(false);
      return;
    }
    setErr("");
    setResult(null);
    finalRef.current = "";
    setFinalText("");
    setInterim("");
    rec.onresult = (e) => {
      let fin = "";
      let inter = "";
      for (let k = 0; k < e.results.length; k++) {
        const res = e.results[k];
        if (res.isFinal) fin += res[0].transcript;
        else inter += res[0].transcript;
      }
      finalRef.current = fin;
      setFinalText(fin);
      setInterim(inter);
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed") setErr("Microphone permission denied. Allow mic access in your browser, or type below.");
      else if (e.error !== "aborted" && e.error !== "no-speech") setErr(`Speech error: ${e.error}`);
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  };

  const stop = () => {
    const rec = recRef.current;
    if (!rec) return;
    rec.onend = () => {
      setListening(false);
      const heard = (finalRef.current || "").trim();
      void runCheck(heard || interimRef.current);
    };
    rec.stop();
  };

  const interimRef = useRef("");
  useEffect(() => {
    interimRef.current = interim;
  }, [interim]);

  const markCorrect = () => setResults((arr) => arr.map((v, k) => (k === i ? true : v)));

  const next = () => {
    if (i + 1 >= items.length) {
      const score = results.filter(Boolean).length;
      setDone(true);
      onFinish(score, items.length);
    } else {
      setI(i + 1);
      resetItem();
    }
  };

  if (done) {
    const score = results.filter(Boolean).length;
    const passed = score >= passMark;
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="text-center">
          <div className="text-5xl">{passed ? "🏆" : "💪"}</div>
          <div className="mt-2 text-2xl font-bold">
            {score} / {items.length} sentences correct
          </div>
          <p className="mt-1 text-slate-600">
            {passed ? "Excellent! This section is complete." : `You need ${passMark}/${items.length}. Review the answers below and try again.`}
          </p>
        </div>
        <div className="mt-6 space-y-4">
          {items.map(([e, j, r], k) => (
            <div key={k} className="rounded-xl border border-slate-100 p-3">
              <div className="mb-1 flex items-center gap-2 text-sm">
                {results[k] ? <Pill tone="green">✓</Pill> : <Pill tone="red">✗</Pill>}
                <span className="text-slate-600">{e}</span>
              </div>
              <JpLine reading={r} jp={j} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const live = (finalText + interim).trim();
  const correctSoFar = results.filter(Boolean).length;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-2 flex justify-between text-sm text-slate-500">
        <span>
          {combined ? "Combined sentence" : "Sentence"} {i + 1} / {items.length}
        </span>
        <span>
          ✓ {correctSoFar} (need {passMark})
        </span>
      </div>
      <div className="mb-5 h-1.5 rounded bg-slate-100">
        <div className="h-1.5 rounded bg-indigo-500 transition-all" style={{ width: `${(i / items.length) * 100}%` }} />
      </div>

      <div className="rounded-xl bg-indigo-50 p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-indigo-500">Say this in Japanese</div>
        <div className={`${combined ? "text-lg" : "text-2xl"} mt-1 font-semibold text-indigo-950`}>{en}</div>
        <div className="mt-2">
          {showHint ? (
            <div className="flex flex-wrap gap-1.5">
              {rules
                .filter((r) => evaluate(jp, reading, jp, reading, [r]).patterns.length > 0)
                .map((r) => (
                  <Pill key={r.label} tone="indigo">
                    {r.label}
                  </Pill>
                ))}
            </div>
          ) : (
            <button onClick={() => setShowHint(true)} className="text-sm text-indigo-600 underline">
              Show grammar hint
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-col items-center gap-3">
        {supported ? (
          <button
            onClick={listening ? stop : start}
            disabled={checking}
            className={`flex h-24 w-24 items-center justify-center rounded-full text-4xl text-white shadow-lg transition ${
              listening ? "animate-pulse bg-red-500" : "bg-rose-600 hover:bg-rose-700"
            }`}
            aria-label={listening ? "Stop and check" : "Start speaking"}
          >
            {listening ? "■" : "🎤"}
          </button>
        ) : (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Speech recognition isn&apos;t supported in this browser. Use Chrome / Edge (desktop or Android) for speaking — or type below.
          </p>
        )}
        <p className="text-sm text-slate-500">
          {listening ? "Listening… speak in Japanese, then press ■ to check" : supported ? "Tap the mic and speak" : ""}
        </p>
        {live && !result && <div className="text-xl text-slate-700">{live}</div>}
        {checking && <p className="text-sm text-slate-500">Converting to hiragana & checking grammar…</p>}
        {err && <p className="text-sm text-red-600">{err}</p>}
      </div>

      {!result && (
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void runCheck(typed);
          }}
        >
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="Or type: 日本語 / ひらがな / romaji (e.g. sushi wo tabeta koto ga arimasu)"
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-base focus:border-rose-400 focus:outline-none"
          />
          <button className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white" disabled={checking}>
            Check
          </button>
        </form>
      )}

      {result && (
        <div className={`mt-5 rounded-xl border-2 p-4 ${result.passed ? "border-emerald-400 bg-emerald-50" : "border-amber-300 bg-amber-50"}`}>
          <div className="text-lg font-bold">{result.passed ? "✅ Correct!" : result.grammarOk ? "🟡 Grammar OK, sentence differs" : "❌ Grammar pattern missing"}</div>
          <div className="mt-2 text-sm text-slate-500">You said:</div>
          <div className="text-xl">{result.heardReading || result.heard}</div>
          <div className="text-slate-500">（{result.heard}）</div>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {result.patterns.map((p) => (
              <Pill key={p.label} tone={p.ok ? "green" : "red"}>
                {p.ok ? "✓" : "✗"} {p.label}
              </Pill>
            ))}
            <Pill tone="slate">Match {Math.round(result.similarity * 100)}%</Pill>
          </div>
        </div>
      )}

      {(result || showAnswer) && (
        <div className="mt-4 rounded-xl bg-slate-50 p-4">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Model answer</div>
          <JpLine reading={reading} jp={jp} />
        </div>
      )}

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        {!result && !showAnswer && (
          <button onClick={() => setShowAnswer(true)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm">
            Show answer (counts as wrong)
          </button>
        )}
        {result && (
          <button onClick={resetItem} className="rounded-xl border border-slate-300 px-4 py-2 text-sm">
            ↻ Try again
          </button>
        )}
        {result && !result.passed && results[i] !== true && (
          <button onClick={markCorrect} className="rounded-xl border border-emerald-400 px-4 py-2 text-sm text-emerald-700" title="Use if the mic misheard you">
            Mic misheard — count as correct
          </button>
        )}
        {(result || showAnswer) && (
          <button onClick={next} className="rounded-xl bg-indigo-600 px-5 py-2 font-semibold text-white">
            {i + 1 >= items.length ? "Finish" : "Next sentence →"}
          </button>
        )}
      </div>
    </div>
  );
}
