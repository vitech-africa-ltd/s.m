/* AI-assisted machine translation layer — batches & caches strings
   that are missing from the curated dictionaries. */
import { LANG_CODES } from "./data";

const MT_KEY = "vitech-mt-v1";
type Cache = Record<string, Record<string, string>>;
let cache: Cache = {};
try { cache = JSON.parse(localStorage.getItem(MT_KEY) ?? "{}"); } catch { cache = {}; }

const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());
export const onMT = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
export const mtGet = (lang: string, key: string) => cache[lang]?.[key];
const save = () => { try { localStorage.setItem(MT_KEY, JSON.stringify(cache)); } catch { /* quota */ } };

const pending = new Map<string, Set<string>>();
let timer: ReturnType<typeof setTimeout> | null = null;
let queue: Promise<void> = Promise.resolve();

export function requestMT(lang: string, key: string) {
  if (lang === "en" || !LANG_CODES.includes(lang as never)) return;
  if (cache[lang]?.[key]) return;
  let set = pending.get(lang);
  if (!set) { set = new Set(); pending.set(lang, set); }
  if (set.has(key)) return;
  set.add(key);
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    const s = pending.get(lang);
    if (s?.size) { pending.delete(lang); queue = queue.then(() => flush(lang, [...s])); }
  }, 350);
}

const SEP = " ||| ";
async function flush(lang: string, keys: string[]) {
  if (!navigator.onLine) return;
  const chunks: string[][] = []; let cur: string[] = []; let len = 0;
  for (const k of keys) {
    if (len + k.length + SEP.length > 440 && cur.length) { chunks.push(cur); cur = []; len = 0; }
    cur.push(k); len += k.length + SEP.length;
  }
  if (cur.length) chunks.push(cur);
  for (const ch of chunks) {
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(ch.join(SEP))}&langpair=${encodeURIComponent(`en|${lang}`)}`;
      const res = await fetch(url);
      const json = await res.json();
      const out: string = json?.responseData?.translatedText ?? "";
      if (out && json?.responseStatus === 200) {
        const parts = out.split(/\s*\|\|\|\s*/);
        cache[lang] = cache[lang] ?? {};
        ch.forEach((k, i) => { const v = parts[i]?.trim(); if (v && v !== k) cache[lang][k] = v; });
        save(); emit();
      }
    } catch { /* offline or quota — English fallback */ }
    await new Promise((r) => setTimeout(r, 450));
  }
}
