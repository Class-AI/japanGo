const levels = [
  {
    level: "N4",
    color: "rose",
    summary: "Understand basic Japanese: everyday conversation spoken slowly, simple reading on familiar topics.",
    words: "≈ 1,500 words · ≈ 300 kanji",
    sections: [
      ["言語知識（文字・語彙） Vocabulary", "25 min"],
      ["言語知識（文法）・読解 Grammar & Reading", "55 min"],
      ["聴解 Listening", "35 min"],
    ],
    scoring: [
      ["Language Knowledge (Vocab/Grammar) + Reading", "0–120", "min 38"],
      ["Listening", "0–60", "min 19"],
    ],
    pass: "Overall pass: 90 / 180 (and every sectional minimum)",
  },
  {
    level: "N3",
    color: "indigo",
    summary: "Understand everyday Japanese to a certain degree: newspaper headlines, slightly difficult text, natural-speed conversation.",
    words: "≈ 3,700 words · ≈ 650 kanji",
    sections: [
      ["言語知識（文字・語彙） Vocabulary", "30 min"],
      ["言語知識（文法）・読解 Grammar & Reading", "70 min"],
      ["聴解 Listening", "40 min"],
    ],
    scoring: [
      ["Language Knowledge (Vocab/Grammar)", "0–60", "min 19"],
      ["Reading", "0–60", "min 19"],
      ["Listening", "0–60", "min 19"],
    ],
    pass: "Overall pass: 95 / 180 (and every sectional minimum)",
  },
];

const questionTypes = [
  ["文字・語彙 Vocabulary", ["漢字読み — read the kanji", "表記 — choose the correct kanji", "文脈規定 — fill the right word in context", "言い換え類義 — choose the synonym", "用法 — choose the sentence using the word correctly"]],
  ["文法 Grammar", ["文法形式の判断 — choose the correct grammar form", "文の組み立て — put 4 pieces in order, answer the ★ position", "文章の文法 — grammar in a short passage"]],
  ["読解 Reading", ["内容理解（短文・中文）— short & medium passages", "長文 — long passage (N3)", "情報検索 — find info in ads/notices/timetables"]],
  ["聴解 Listening", ["課題理解 — what will the person do next?", "ポイント理解 — catch the key point/reason", "概要理解 — overall gist (N3)", "発話表現 — what do you say in this situation?", "即時応答 — choose the quick natural reply"]],
] as const;

const plan = [
  ["Weeks 1–2", "Hiragana/Katakana perfect + N5 review. Learn the particle table on the Tamil page by heart."],
  ["Weeks 3–8", "Units 1–3 of the grammar path (N4). 15–20 new words + 5 kanji daily. Do every speaking test out loud."],
  ["Weeks 9–12", "Unit 4 + N4 mock tests. Listening 20 min/day (NHK Easy, JLPT sample audio). Take N4."],
  ["Months 4–6", "Units 5–6 (N3). Vocabulary rises to 25 words/day. Read NHK News Web Easy daily."],
  ["Months 7–8", "N3 past papers under timed conditions. Shadowing listening. Fix weak sections. Take N3."],
];

const methods = [
  ["🎤 Speak every sentence", "Grammar sticks when you produce it. Use this site's speaking tests — saying a pattern 10× beats reading it 50×."],
  ["🪷 Translate from Tamil, not English", "Tamil word order = Japanese word order. Build the Tamil sentence in your head, then swap each piece."],
  ["🔁 Spaced repetition (SRS)", "Review vocab after 1, 3, 7, 14, 30 days. Use the flashcards here or Anki."],
  ["🎧 Shadowing", "Play a short audio line, pause, repeat it with the same rhythm. Huge for 聴解."],
  ["⏱ Timed mock tests", "Reading time is tight. Practise with a timer from month 2. Answer every question — no negative marking."],
  ["✍️ Kanji by components", "Learn radicals (氵water, 亻person, 言 speech). 話・語・読 all have 言 → 'speech' words."],
  ["📰 Daily input", "NHK News Web Easy, Japanese YouTube with Japanese subtitles, anime with Japanese subtitles."],
  ["🗓 Exam dates", "JLPT is held twice a year (July & December) — in India at centres incl. Chennai, Bengaluru, Delhi, Mumbai. Register ~3 months ahead."],
];

export default function ExamPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">🎯 JLPT N4 & N3 — Exam guide</h1>
        <p className="mt-1 text-slate-600">What&apos;s tested, how it&apos;s scored, and a fresher-to-N3 study plan designed for Tamil speakers.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {levels.map((l) => (
          <section key={l.level} className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className={`rounded-xl px-3 py-1 text-2xl font-bold text-white ${l.color === "rose" ? "bg-rose-600" : "bg-indigo-600"}`}>{l.level}</span>
              <span className="text-sm text-slate-500">{l.words}</span>
            </div>
            <p className="mt-3 text-slate-700">{l.summary}</p>
            <h3 className="mt-4 font-semibold">Sections</h3>
            <ul className="mt-1 space-y-1 text-sm">
              {l.sections.map(([s, t]) => (
                <li key={s} className="flex justify-between rounded-lg bg-slate-50 px-3 py-1.5">
                  <span>{s}</span>
                  <span className="font-semibold">{t}</span>
                </li>
              ))}
            </ul>
            <h3 className="mt-4 font-semibold">Scoring</h3>
            <ul className="mt-1 space-y-1 text-sm">
              {l.scoring.map(([s, r, m]) => (
                <li key={s} className="flex justify-between gap-2 rounded-lg bg-slate-50 px-3 py-1.5">
                  <span>{s}</span>
                  <span className="whitespace-nowrap">
                    {r} · <b>{m}</b>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">{l.pass}</p>
          </section>
        ))}
      </div>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Question types (問題)</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          {questionTypes.map(([title, items]) => (
            <div key={title} className="rounded-xl bg-slate-50 p-4">
              <div className="font-bold text-rose-700">{title}</div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">📅 Fresher → N4 → N3 plan (~8 months, 1.5–2 h/day)</h2>
        <ol className="mt-3 space-y-2">
          {plan.map(([w, d]) => (
            <li key={w} className="grid gap-1 rounded-xl bg-slate-50 p-3 md:grid-cols-[140px_1fr]">
              <span className="font-bold text-indigo-700">{w}</span>
              <span className="text-slate-700">{d}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">🧠 Methods that work</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {methods.map(([t, d]) => (
            <div key={t} className="rounded-xl border border-slate-100 p-4">
              <div className="font-bold">{t}</div>
              <div className="text-sm text-slate-600">{d}</div>
            </div>
          ))}
        </div>
      </section>

      <p className="text-xs text-slate-400">Timings and scoring follow the official JLPT format (jlpt.jp). Word/kanji counts are common estimates — the official test no longer publishes lists.</p>
    </div>
  );
}
