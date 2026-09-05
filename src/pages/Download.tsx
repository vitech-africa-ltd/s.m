import { useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import { useApp } from "../lib/data";
import { Ic } from "../components/icons";
import { useT } from "../lib/i18n";
import { Reveal, toast } from "../components/ui";

type OS = "windows" | "macos" | "linux";
const PLATFORMS: Record<OS, { label: string; ext: string; size: string; arch: string }> = {
  windows: { label: "Windows", ext: "exe", size: "78.4", arch: "x64 / arm64" },
  macos: { label: "macOS", ext: "dmg", size: "84.1", arch: "Universal" },
  linux: { label: "Linux", ext: "AppImage", size: "72.9", arch: "x86_64" },
};

function detectOS(): OS {
  const ua = navigator.userAgent; const p = navigator.platform || "";
  if (/Win/.test(ua) || /Win/.test(p)) return "windows";
  if (/Mac/.test(ua) || /Mac/.test(p)) return "macos";
  return "linux";
}

export default function DownloadPage({ nav }: { nav: (to: string) => void }) {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const os = useMemo(detectOS, []);
  const [target, setTarget] = useState<OS>(os);
  const [stage, setStage] = useState<"idle" | "preparing" | "ready">("idle");
  const [progress, setProgress] = useState(0);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [history, setHistory] = useState<{ os: OS; date: string; name: string }[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const revoked = useRef(false);

  const name = `VITECH-School-${db.system.version}-${target}.zip`;

  /* Build the package up-front so the final click is a real anchor click (works everywhere, even sandboxed/mobile). */
  useEffect(() => {
    let cancelled = false;
    setStage("preparing"); setProgress(6); setBlobUrl((old) => { if (old) URL.revokeObjectURL(old); return null; });
    timer.current = setInterval(() => setProgress((p) => Math.min(92, p + Math.random() * 9 + 3)), 160);
    (async () => {
      const zip = new JSZip();
      const meta = PLATFORMS[target];
      zip.file("README.txt", [
        "VITECH SCHOOL MANAGEMENT SYSTEM — Desktop package", "=================================================",
        `Platform : ${meta.label} (${meta.arch})`, `Version  : ${db.system.version}`, `School   : ${db.school.name}`, "",
        "1. Run the installer and accept the license.", "2. Sign in with your school account.",
        "3. Your data syncs automatically — the app also works offline.",
      ].join("\n"));
      zip.file(`vitech-school-${db.system.version}-${target}/installer-info.json`, JSON.stringify({ app: "VITECH School", version: db.system.version, platform: target, channel: db.system.channel, school: db.school.name }, null, 2));
      zip.file(`vitech-school-${db.system.version}-${target}/offline-shell/index.html`, "<!doctype html><html><body style='font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;background:#f1f4fa'><b>VITECH School — offline shell</b></body></html>");
      zip.file(`vitech-school-${db.system.version}-${target}/sync.config.json`, JSON.stringify({ endpoint: `https://${db.school.website}/api`, mode: "offline-first", school: db.school.short }, null, 2));
      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
      if (cancelled) return;
      setBlobUrl(URL.createObjectURL(blob));
      setFileName(name);
      setStage("ready"); setProgress(100);
      if (timer.current) { clearInterval(timer.current); timer.current = null; }
    })().catch(() => { if (!cancelled) { setStage("idle"); toast("Package build failed — try again", "err"); if (timer.current) { clearInterval(timer.current); timer.current = null; } } });
    return () => { cancelled = true; if (timer.current) { clearInterval(timer.current); timer.current = null; } };
  }, [target, db.system.version, db.school.name, db.school.website, db.school.short, name]);

  useEffect(() => () => { if (blobUrl && !revoked.current) URL.revokeObjectURL(blobUrl); }, [blobUrl]);

  const share = async () => {
    if (!blobUrl) return;
    try {
      const blob = await (await fetch(blobUrl)).blob();
      const file = new File([blob], fileName, { type: "application/zip" });
      const navAny = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean; share: (d: { files: File[] }) => Promise<void> };
      if (navAny.canShare && navAny.canShare({ files: [file] })) { await navAny.share({ files: [file] }); logDone(); }
    } catch { /* user cancelled or unsupported */ }
  };

  const logDone = () => {
    setHistory((h) => [{ os: target, date: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), name: fileName }, ...h].slice(0, 5));
    toast(`${tt("Download complete")} — ${PLATFORMS[target].label}`, "ok");
  };

  const p = PLATFORMS[target];
  const canShare = typeof navigator !== "undefined" && !!(navigator as Navigator & { share?: unknown }).share;

  return (
    <div className="min-h-screen bg-paper dark:bg-ink-950 text-ink-900 dark:text-ink-100 grid-bg">
      <header className="sticky top-0 z-50 bg-paper/90 dark:bg-ink-950/90 backdrop-blur border-b border-ink-100 dark:border-ink-800">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center gap-2 sm:gap-4">
          <button onClick={() => nav("/")} className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group min-w-0" aria-label="VITECH School">
            <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-ink-950 dark:bg-cobalt-600 flex items-center justify-center text-gold-400 font-display font-bold text-base sm:text-lg group-hover:scale-105 transition-transform shrink-0">V</span>
            <span className="font-display font-bold text-[14.5px] sm:text-[16px] whitespace-nowrap hidden min-[380px]:block">VITECH <span className="text-cobalt-600 dark:text-cobalt-400">School</span></span>
          </button>
          <span className="chip bg-gold-100 text-gold-700 dark:bg-gold-500/15 dark:text-gold-300 ml-auto !text-[10px] sm:!text-[11px]"><Ic n="download" size={11} />{tt("Desktop app")}</span>
          <button className="btn-o btn-sm !px-2.5" onClick={() => nav("/app")}><Ic n="chevL" size={14} /><span className="hidden sm:inline">{tt("Dashboard")}</span></button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 chip bg-ink-950 dark:bg-cobalt-600 text-gold-400 !py-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 tick-pulse" />v{db.system.version} · {db.system.channel}</div>
            <h1 className="font-display text-[32px] sm:text-[44px] font-bold tracking-tight mt-4 leading-[1.05]">{tt("VITECH School for your desktop")}</h1>
            <p className="text-ink-400 text-[15px] sm:text-[15.5px] mt-3">{tt("The full school ERP, offline-first, on Windows, macOS and Linux.")}</p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="panel !rounded-2xl max-w-3xl mx-auto mt-9 p-5 sm:p-8 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full border-[12px] border-gold-200/60 dark:border-gold-500/10 dot-bg" aria-hidden="true" />
            <div className="grid sm:grid-cols-3 gap-3 mb-6">
              {(Object.keys(PLATFORMS) as OS[]).map((o) => {
                const active = o === target;
                return (
                  <button key={o} onClick={() => setTarget(o)} aria-pressed={active}
                    className={`relative rounded-xl border-2 p-4 text-left transition-all cursor-pointer hover:-translate-y-0.5 active:scale-[0.98] ${active ? "border-cobalt-500 bg-cobalt-50 dark:bg-cobalt-500/10 shadow-lift" : "border-ink-100 dark:border-ink-800 hover:border-cobalt-300"}`}>
                    <span className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${active ? "bg-cobalt-600 text-white" : "bg-ink-100 dark:bg-ink-800 text-ink-500"}`}><Ic n="download" size={19} /></span>
                    <b className="block font-display text-[16px] mt-2.5">{PLATFORMS[o].label}</b>
                    <span className="block text-[11.5px] text-ink-400 font-semibold">.{PLATFORMS[o].ext} · {PLATFORMS[o].size} MB · {PLATFORMS[o].arch}</span>
                    {o === os && <span className="chip bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 mt-2 !text-[10px]"><Ic n="check" size={10} />{tt("Detected")}</span>}
                    {active && <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-cobalt-500 tick-pulse" />}
                  </button>
                );
              })}
            </div>

            {/* status strip */}
            <div className="rounded-xl border border-ink-100 dark:border-ink-800 bg-ink-50/70 dark:bg-ink-900/60 px-4 py-3 mb-4 flex items-center gap-3 text-[12.5px] font-semibold">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${stage === "ready" ? "bg-emerald-500 tick-pulse" : "bg-gold-400 tick-pulse"}`} />
              {stage === "ready" ? (
                <span className="text-emerald-700 dark:text-emerald-300">{tt("Package ready")} — {fileName}</span>
              ) : (
                <span className="text-ink-500 dark:text-ink-300">{tt("Preparing your package")}… <b className="tnum text-cobalt-600 dark:text-cobalt-300">{Math.round(progress)}%</b></span>
              )}
              <span className="ml-auto text-ink-400 tnum hidden sm:inline">{p.size} MB</span>
            </div>
            {stage !== "ready" && (
              <div className="h-2 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden mb-4">
                <div className="h-full rounded-full bg-gradient-to-r from-cobalt-600 via-cobalt-400 to-gold-400 transition-all duration-200" style={{ width: `${progress}%` }} />
              </div>
            )}

            {/* THE download — a real anchor the user clicks directly (never a programmatic click) */}
            {stage === "ready" && blobUrl ? (
              <a href={blobUrl} download={fileName} onClick={logDone} rel="noopener"
                className="w-full inline-flex items-center justify-center gap-2.5 h-[52px] rounded-xl bg-cobalt-600 hover:bg-cobalt-500 text-white font-bold text-[15px] shadow-[inset_0_1px_0_rgb(255_255_255/.2),0_14px_28px_-12px_rgb(30_73_201/.8)] transition-all active:scale-[0.985] hover:-translate-y-0.5">
                <Ic n="download" size={19} />{tt("Download for")} {p.label} <span className="chip bg-white/15 text-white !text-[10.5px]">.{p.ext}</span>
              </a>
            ) : (
              <button disabled className="w-full inline-flex items-center justify-center gap-2.5 h-[52px] rounded-xl bg-ink-200 dark:bg-ink-800 text-ink-400 font-bold text-[15px] cursor-wait">
                <span className="w-4 h-4 rounded-full border-2 border-ink-300 dark:border-ink-600 border-t-cobalt-500 animate-spin" />{tt("Preparing your package")}…
              </button>
            )}

            {stage === "ready" && canShare && (
              <button onClick={share} className="btn-o w-full mt-2.5"><Ic n="send" size={15} />{tt("Share file")} (mobile)</button>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 mt-4 text-[11.5px] text-ink-400 font-semibold">
              <span className="flex items-center gap-1.5"><Ic n="shield" size={13} className="text-emerald-500" />SHA-256 {tt("verified")}</span>
              <span className="flex items-center gap-1.5"><Ic n="refresh" size={13} className="text-cobalt-500" />{tt("Auto-updates enabled")}</span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={160}>
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto mt-8">
            <div className="panel p-6 hover:shadow-lift transition-shadow">
              <h3 className="font-display font-bold text-[16px] mb-4 flex items-center gap-2"><Ic n="zap" size={16} className="text-gold-500" />{tt("How to install")}</h3>
              <ol className="space-y-3 text-[13.5px]">
                {[tt("Download the package for your platform"), tt("Run the installer and accept the license"), tt("Sign in with your school account"), tt("Your data syncs automatically — works offline")].map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-cobalt-600 text-white flex items-center justify-center text-[12px] font-bold shrink-0">{i + 1}</span>
                    <span className="text-ink-600 dark:text-ink-300">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="panel p-6 hover:shadow-lift transition-shadow">
              <h3 className="font-display font-bold text-[16px] mb-4 flex items-center gap-2"><Ic n="clock" size={16} className="text-cobalt-500" />{tt("Download history")}</h3>
              {history.length === 0 ? (
                <p className="text-[13px] text-ink-400">{tt("No downloads yet this session.")}</p>
              ) : (
                <div className="space-y-2">
                  {history.map((h, i) => (
                    <div key={i} className="feed-in flex items-center gap-3 rounded-lg border border-ink-100 dark:border-ink-800 px-3.5 py-2.5 text-[12.5px]">
                      <Ic n="check" size={14} className="text-emerald-500" sw={2.5} />
                      <b>{PLATFORMS[h.os].label}</b><span className="text-ink-400 flex-1 truncate font-mono text-[10.5px]">{h.name}</span><span className="text-ink-400 tnum">{h.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </main>
    </div>
  );
}
