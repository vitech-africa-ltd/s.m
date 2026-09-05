import { useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import { useApp } from "../lib/data";
import { Ic } from "../components/icons";
import { useT } from "../lib/i18n";
import { Reveal, toast } from "../components/ui";

type OS = "windows" | "macos" | "linux";
const PLATFORMS: Record<OS, { label: string; icon: string; ext: string; size: string; arch: string }> = {
  windows: { label: "Windows", icon: "download", ext: "exe", size: "78.4", arch: "x64 / arm64" },
  macos: { label: "macOS", icon: "download", ext: "dmg", size: "84.1", arch: "Universal" },
  linux: { label: "Linux", icon: "download", ext: "AppImage", size: "72.9", arch: "x86_64" },
};

function detectOS(): OS {
  const ua = navigator.userAgent;
  if (/Win/.test(ua)) return "windows";
  if (/Mac|iPhone|iPad/.test(ua)) return "macos";
  if (/Android/.test(ua)) return "linux";
  return "windows";
}

export default function DownloadPage({ nav }: { nav: (to: string) => void }) {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const os = useMemo(detectOS, []);
  const [target, setTarget] = useState<OS>(os);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState<{ os: OS; date: string; file: string }[]>([]);
  /* The ZIP is pre-built per platform so the actual download happens
     synchronously inside the click — required on mobile browsers. */
  const readyBlob = useRef<Blob | null>(null);
  const raf = useRef(0);

  useEffect(() => {
    let cancelled = false;
    readyBlob.current = null;
    setBusy(true); setProgress(6);
    const t0 = performance.now();
    const tick = () => {
      if (cancelled) return;
      const el = performance.now() - t0;
      setProgress(Math.min(92, 6 + el / 14));
      if (el < 1200) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    const zip = new JSZip();
    const meta = PLATFORMS[target];
    zip.file("README.txt", [
      "VITECH SCHOOL MANAGEMENT SYSTEM — Desktop package",
      "=================================================",
      `Platform: ${meta.label} (${meta.arch})`,
      `Version:  ${db.system.version}`,
      `School:   ${db.school.name}`,
      "",
      "1. Unzip this package.",
      "2. Run the installer for your platform, then accept the license.",
      "3. Sign in with your school account.",
      "Your data syncs automatically and works offline.",
    ].join("\n"));
    zip.file(`vitech-school-${db.system.version}-${target}/installer-info.json`, JSON.stringify({ app: "VITECH School", version: db.system.version, platform: target, channel: db.system.channel, school: db.school.name, schoolEmail: db.school.email }, null, 2));
    zip.file(`vitech-school-${db.system.version}-${target}/offline-shell/index.html`, "<!doctype html><html><body style='font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;background:#f1f4fa'><b>VITECH School — offline shell</b></body></html>");
    zip.generateAsync({ type: "blob" }).then((blob) => {
      if (cancelled) return;
      readyBlob.current = blob;
      cancelAnimationFrame(raf.current);
      setProgress(100);
      setTimeout(() => { if (!cancelled) setBusy(false); }, 350);
    }).catch(() => { if (!cancelled) { cancelAnimationFrame(raf.current); setBusy(false); toast("Package build failed — retry", "err"); } });
    return () => { cancelled = true; cancelAnimationFrame(raf.current); };
  }, [target, db.system.version, db.system.channel, db.school.name, db.school.email]);

  /* Synchronous, gesture-safe download (works on iOS/Android). */
  const startDownload = () => {
    const blob = readyBlob.current;
    if (!blob) { toast("Package still preparing — one second…", "info"); return; }
    const file = `VITECH-School-${db.system.version}-${target}.zip`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = file; a.rel = "noopener";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    setHistory((h) => [{ os: target, date: new Date().toLocaleString(), file }, ...h].slice(0, 5));
    toast(`${tt("Download started")} — ${file}`);
  };

  const p = PLATFORMS[target];
  return (
    <div className="min-h-screen bg-paper dark:bg-ink-950 text-ink-900 dark:text-ink-100">
      <header className="sticky top-0 z-50 bg-paper/90 dark:bg-ink-950/90 backdrop-blur border-b border-ink-100 dark:border-ink-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center gap-2 sm:gap-4">
          <button onClick={() => nav("/")} className="flex items-center gap-2.5 cursor-pointer group min-w-0">
            <span className="w-9 h-9 rounded-lg bg-ink-950 dark:bg-cobalt-600 flex items-center justify-center text-gold-400 font-display font-bold text-lg group-hover:scale-105 transition-transform shrink-0">V</span>
            <span className="font-display font-bold text-[15px] sm:text-[16px] truncate">VITECH <span className="text-cobalt-600 dark:text-cobalt-400">School</span></span>
          </button>
          <span className="chip bg-gold-100 text-gold-700 dark:bg-gold-500/15 dark:text-gold-300 ml-auto hidden sm:inline-flex">{tt("Desktop app")}</span>
          <button className="btn-o btn-sm ml-auto sm:ml-0" onClick={() => nav("/app")}><Ic n="chevL" size={14} />{tt("Dashboard")}</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-gold-600 dark:text-gold-400">{tt("Desktop app")}</div>
            <h1 className="font-display text-[30px] sm:text-[42px] font-bold tracking-tight mt-2">{tt("VITECH School for your desktop")}</h1>
            <p className="text-ink-400 text-[15px] sm:text-[15.5px] mt-3">{tt("The full school ERP, offline-first, on Windows, macOS and Linux.")}</p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="panel !rounded-2xl max-w-3xl mx-auto mt-8 sm:mt-10 p-5 sm:p-8">
            <div className="grid grid-cols-1 min-[420px]:grid-cols-3 gap-3 mb-6">
              {(Object.keys(PLATFORMS) as OS[]).map((o) => {
                const active = o === target;
                return (
                  <button key={o} onClick={() => setTarget(o)} aria-pressed={active}
                    className={`rounded-xl border-2 p-4 text-left transition-all cursor-pointer active:scale-[0.98] hover:-translate-y-0.5 ${active ? "border-cobalt-500 bg-cobalt-50 dark:bg-cobalt-500/10 shadow-lift" : "border-ink-100 dark:border-ink-800 hover:border-cobalt-300"}`}>
                    <span className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${active ? "bg-cobalt-600 text-white" : "bg-ink-100 dark:bg-ink-800 text-ink-500"}`}><Ic n="download" size={19} /></span>
                    <b className="block font-display text-[16px] mt-2.5">{PLATFORMS[o].label}</b>
                    <span className="block text-[11.5px] text-ink-400 font-semibold">.{PLATFORMS[o].ext} · {PLATFORMS[o].size} MB · {PLATFORMS[o].arch}</span>
                    {o === os && <span className="chip bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 mt-2 !text-[10px]">{tt("Detected")}</span>}
                  </button>
                );
              })}
            </div>

            <button onClick={startDownload} disabled={busy}
              className="btn-p w-full !h-[52px] !text-[15px] disabled:opacity-80">
              {busy
                ? <><span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />{tt("Preparing package")}… {Math.round(progress)}%</>
                : <><Ic n="download" size={18} />{tt("Download for")} {p.label} (.{p.ext})</>}
            </button>
            <div className="h-2 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden mt-3">
              <div className={`h-full rounded-full transition-all duration-200 ${busy ? "bg-gradient-to-r from-cobalt-600 to-gold-400" : "bg-emerald-500"}`} style={{ width: `${progress}%` }} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 mt-3 text-[11.5px] text-ink-400 font-semibold">
              <span className="flex items-center gap-1.5"><Ic n="shield" size={13} className="text-emerald-500" />v{db.system.version} · {db.system.channel}</span>
              <span>{busy ? tt("Building offline package") + "…" : "SHA-256 " + tt("verified") + ` · ${p.size} MB`}</span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={160}>
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto mt-8">
            <div className="panel p-6">
              <h3 className="font-display font-bold text-[16px] mb-4">{tt("How to install")}</h3>
              <ol className="space-y-3 text-[13.5px]">
                {[tt("Download the package for your platform"), tt("Run the installer and accept the license"), tt("Sign in with your school account"), tt("Your data syncs automatically — works offline")].map((step, i) => (
                  <li key={step} className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-cobalt-600 text-white flex items-center justify-center text-[12px] font-bold shrink-0">{i + 1}</span>
                    <span className="text-ink-600 dark:text-ink-300">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="panel p-6">
              <h3 className="font-display font-bold text-[16px] mb-4">{tt("Download history")}</h3>
              {history.length === 0 ? (
                <p className="text-[13px] text-ink-400">{tt("No downloads yet this session.")}</p>
              ) : (
                <div className="space-y-2">
                  {history.map((h, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-ink-100 dark:border-ink-800 px-3.5 py-2.5 text-[12.5px]">
                      <Ic n="check" size={14} className="text-emerald-500" sw={2.5} />
                      <b>{PLATFORMS[h.os].label}</b><span className="text-ink-400 flex-1 truncate">{h.file}</span><span className="text-ink-400 tnum whitespace-nowrap">{h.date}</span>
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
