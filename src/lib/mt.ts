/* AI-assisted machine translation layer.
   Batches & caches strings missing from the curated dictionaries.
   Includes a CIRCUIT BREAKER: on rate-limit (429) or repeated failures the
   remote API is put on cooldown and the app gracefully falls back to English,
   so there is never a retry storm against the provider. */
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

/* ---- circuit breaker (persisted so it survives page reloads) ---- */
const COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes after a rate-limit
const COOLDOWN_KEY = "vitech-mt-cooldown";
let cooldownUntil = 0; // timestamp until which we do NOT call the API
try { cooldownUntil = Number(localStorage.getItem(COOLDOWN_KEY)) || 0; } catch { cooldownUntil = 0; }
let consecutiveFailures = 0;
const MAX_FAILURES = 2; // after this many failures in a row, enter cooldown

/* keys we recently failed to translate — do not re-request them for a while */
const failedKeys = new Map<string, number>(); // `${lang}:${key}` -> expiry timestamp
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
  if (cache[lang]?.[key]) return; // already translated
  if (inCooldown()) return; // circuit open — stay on English
  const fk = `${lang}:${key}`;
  const fExp = failedKeys.get(fk);
  if (fExp && Date.now() < fExp) return; // recently failed — skip
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
  if (!res.ok) return false;
  const json = await res.json();
  const out: string = json?.responseData?.translatedText ?? "";
  const status = json?.responseStatus;
  /* MyMemory signals quota errors with responseStatus 403/429 inside the body too */
  if (status === 403 || status === 429) { enterCooldown(); return false; }
  if (out && status === 200) {
    const parts = out.split(/\s*\|\|\|\s*/);
    cache[lang] = cache[lang] ?? {};
    ch.forEach((k, i) => { const v = parts[i]?.trim(); if (v && v !== k) cache[lang][k] = v; });
    save(); emit();
    return true;
  }
  return false;
}

async function flush(lang: string, keys: string[]) {
  if (!navigator.onLine || inCooldown()) return;
  const chunks: string[][] = []; let cur: string[] = []; let len = 0;
  for (const k of keys) {
    if (len + k.length + SEP.length > 440 && cur.length) { chunks.push(cur); cur = []; len = 0; }
    cur.push(k); len += k.length + SEP.length;
  }
  if (cur.length) chunks.push(cur);
  for (const ch of chunks) {
    if (inCooldown()) { markFailed(lang, ch); return; }
    let ok = false;
    try { ok = await fetchChunk(lang, ch); } catch { ok = false; }
    if (!ok) {
      consecutiveFailures++;
      markFailed(lang, ch);
      if (consecutiveFailures >= MAX_FAILURES) { enterCooldown(); return; }
    } else {
      consecutiveFailures = 0;
    }
    await new Promise((r) => setTimeout(r, 900)); // gentle pacing
  }
}

function markFailed(lang: string, ch: string[]) {
  const exp = Date.now() + FAIL_TTL;
  ch.forEach((k) => failedKeys.set(`${lang}:${k}`, exp));
}
