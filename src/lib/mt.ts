import { LANG_CODES } from "./data";

const MT_KEY = "vitech-mt-v1";
const COOLDOWN_KEY = "vitech-mt-cooldown";
type Cache = Record<string, Record<string, string>>;
let cache: Cache = {};
try { cache = JSON.parse(localStorage.getItem(MT_KEY) ?? "{}"); } catch { cache = {}; }

const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());
export const onMT = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
export const mtGet = (lang: string, key: string) => cache[lang]?.[key];
const save = () => { try { localStorage.setItem(MT_KEY, JSON.stringify(cache)); } catch { /* quota */ } };

const COOLDOWN_MS = 10 * 60 * 1000;
let cooldownUntil = 0;
try { cooldownUntil = parseInt(localStorage.getItem(COOLDOWN_KEY) ?? "0", 10); } catch { cooldownUntil = 0; }
let consecutiveFailures = 0;
const MAX_FAILURES = 2;

const failedKeys = new Map<string, number>();
const FAIL_TTL = 15 * 60 * 1000;

const inCooldown = () => Date.now() < cooldownUntil;
const enterCooldown = () => {
  cooldownUntil = Date.now() + COOLDOWN_MS;
  consecutiveFailures = 0;
  try { localStorage.setItem(COOLDOWN_KEY, String(cooldownUntil)); } catch { /* ignore */ }
};

const pending = new Map<string, Set<string>>();
let timer: ReturnType<typeof setTimeout> | null = null;
let queue: Promise<void> = Promise.resolve();

export function requestMT(lang: string, key: string) {
  if (lang === "en" || !LANG_CODES.includes(lang as never)) return;
  if (cache[lang]?.[key]) return;
  if (inCooldown()) return;
  const fk = `${lang}:${key}`;
  const fExp = failedKeys.get(fk);
  if (fExp && Date.now() < fExp) return;
  let set = pending.get(lang);
  if (!set) { set = new Set(); pending.set(lang, set); }
  if (set.has(key)) return;
  set.add(key);
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    if (inCooldown()) { pending.clear(); return; }
    const s = pending.get(lang);
    if (s?.size) { pending.delete(lang); queue = queue.then(() => flush(lang, [...s])); }
  }, 600);
}

const SEP = " ||| ";
async function fetchChunk(lang: string, ch: string[]): Promise<boolean> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(ch.join(SEP))}&langpair=${encodeURIComponent(`en|${lang}`)}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (res.status === 429 || res.status === 403) { enterCooldown(); return false; }
  if (!res.ok) { consecutiveFailures++; if (consecutiveFailures >= MAX_FAILURES) enterCooldown(); return false; }
  const json = await res.json();
  const out: string = json?.responseData?.translatedText ?? "";
  if (!out || json?.responseStatus !== 200) { consecutiveFailures++; if (consecutiveFailures >= MAX_FAILURES) enterCooldown(); return false; }
  consecutiveFailures = 0;
  const parts = out.split(/\s*\|\|\|\s*/);
  cache[lang] = cache[lang] ?? {};
  ch.forEach((k, i) => {
    const v = parts[i]?.trim();
    if (v && v !== k) cache[lang][k] = v;
    else failedKeys.set(`${lang}:${k}`, Date.now() + FAIL_TTL);
  });
  save(); emit();
  return true;
}

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
      const ok = await fetchChunk(lang, ch);
      if (!ok && inCooldown()) break;
    } catch { /* offline */ }
    await new Promise((r) => setTimeout(r, 900));
  }
}
