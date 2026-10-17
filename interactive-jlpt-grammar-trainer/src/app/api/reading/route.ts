import path from "node:path";
import kuromoji from "kuromoji";
import { toHiragana } from "wanakana";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Tokenizer = kuromoji.Tokenizer<kuromoji.IpadicFeatures>;

const g = globalThis as typeof globalThis & { __kuroPromise?: Promise<Tokenizer> };

function getTokenizer(): Promise<Tokenizer> {
  if (!g.__kuroPromise) {
    g.__kuroPromise = new Promise((resolve, reject) => {
      kuromoji
        .builder({ dicPath: path.join(process.cwd(), "node_modules", "kuromoji", "dict") })
        .build((err, tokenizer) => {
          if (err) {
            g.__kuroPromise = undefined;
            reject(err);
          } else resolve(tokenizer);
        });
    });
  }
  return g.__kuroPromise;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { text?: string };
    const text = (body.text ?? "").slice(0, 1000);
    if (!text.trim()) return Response.json({ reading: "" });
    const tokenizer = await getTokenizer();
    const tokens = tokenizer.tokenize(text);
    const parts: string[] = [];
    for (const t of tokens) {
      const r = t.reading && t.reading !== "*" ? t.reading : t.surface_form;
      const hira = toHiragana(r, { passRomaji: true });
      // Attach particles/auxiliaries to the previous word for natural spacing
      if (parts.length && ["助詞", "助動詞", "記号"].includes(t.pos)) parts[parts.length - 1] += hira;
      else if (parts.length && t.pos === "動詞" && t.pos_detail_1 === "非自立") parts[parts.length - 1] += hira;
      else parts.push(hira);
    }
    return Response.json({ reading: parts.join(" ") });
  } catch (e) {
    console.error("reading error", e);
    return Response.json({ reading: "", error: "conversion failed" }, { status: 500 });
  }
}
