import { useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import { useApp, setPrefs, type Lang } from "../lib/data";
import { useT, LANGS } from "../lib/i18n";
import { Ic } from "../components/icons";
import { Chip, Reveal, toast } from "../components/ui";

/* deterministic pseudo SHA-256 for demo checksums */
const fakeSha = (seed: string) => {
  let h1 = 0xdeadbeef ^ seed.length, h2 = 0x41c6ce57 ^ seed.length;
  for (let i = 0; i < seed.length; i++) { const ch = seed.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const n = (h2 >>> 0).toString(16).padStart(8, "0") + (h1 >>> 0).toString(16).padStart(8, "0");
  return (n + n + n + n).slice(0, 64);
};

type OS = "win" | "mac" | "linux";
const detectOS = (): OS => {
  const ua = navigator.userAgent;
  if (/Windows/i.test(ua)) return "win";
  if (/Mac|iPhone|iPad/i.test(ua)) return "mac";
  return "linux";
};

const OsGlyph = ({ os, size = 22 }: { os: OS; size?: number }) => {
  if (os === "win") return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 5.5 10.5 4.4v7.1H3zM11.5 4.2 21 3v8.5h-9.5zM3 12.5h7.5v7.1L3 18.5zM11.5 12.5H21V21l-9.5-1.3z" />
    </svg>
  );
  if (os === "mac") return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.6 12.8c0-2.2 1.8-3.2 1.9-3.3-1-1.5-2.6-1.7-3.2-1.7-1.4-.1-2.7.8-3.4.8-.7 0-1.8-.8-2.9-.8-1.5 0-2.9.9-3.7 2.2-1.6 2.7-.4 6.8 1.1 9 .7 1.1 1.6 2.3 2.7 2.3 1.1 0 1.5-.7 2.9-.7s1.7.7 2.9.7c1.2 0 1.9-1.1 2.6-2.2.9-1.2 1.2-2.4 1.2-2.5 0 0-2.1-.9-2.1-3.8zM14.4 6.1c.6-.8 1-1.8.9-2.9-.9 0-2 .6-2.6 1.4-.6.7-1.1 1.8-.9 2.8 1 .1 2-.5 2.6-1.3z" />
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2.5" /><path d="m7 9 3 3-3 3M12.5 15H17" />
    </svg>
  );
};

const CopyIc = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

interface DlEntry { id: string; os: OS; file: string; size: string; time: string; }

export default function DownloadPage({ nav }: { nav: (to: string) => void }) {
  const s = useApp();
  const tt = useT();
  const lang = s.prefs.lang;
  const sys = s.db.system;
  const [channel, setChannel] = useState<"stable" | "beta">(sys.channel);
  const version = channel === "stable" ? sys.version : "3.4.0";
  const build = channel === "stable" ? "8f3a2c1" : "b72e90d";
  const detected = useMemo(detectOS, []);
  const [prog, setProg] = useState<Record<OS, number>>({ win: 0, mac: 0, linux: 0 });
  const [hist, setHist] = useState<DlEntry[]>([]);
  const [tab, setTab] = useState<"news" | "req" | "install">("news");
  const [deferred, setDeferred] = useState<Event | null>(null);
  const timers = useRef<Record<OS, ReturnType<typeof setInterval> | null>>({ win: null, mac: null, linux: null });

  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setDeferred(e); };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);
  useEffect(() => () => { Object.values(timers.current).forEach((t) => t && clearInterval(t)); }, []);

  const PLATFORMS: Record<OS, { label: string; file: string; size: string; note: string; sha: string }> = {
    win: { label: "Windows", file: `VITECH-School-Setup-${version}-x64.exe`, size: "86.4 MB", note: "Windows 10 / 11 · 64-bit · installer + portable", sha: fakeSha(`win${version}`) },
    mac: { label: "macOS", file: `VITECH-School-${version}-universal.dmg`, size: "92.1 MB", note: "macOS 12+ · Apple Silicon & Intel universal", sha: fakeSha(`mac${version}`) },
    linux: { label: "Linux", file: `vitech-school_${version}_amd64.deb`, size: "81.7 MB", note: "Ubuntu 20.04+ / Debian · .deb & AppImage", sha: fakeSha(`linux${version}`) },
  };

  const startDownload = (os: OS) => {
    if (prog[os] > 0 && prog[os] < 100) return;
    const p = PLATFORMS[os];
    setProg((q) => ({ ...q, [os]: 1 }));
    let mb = 0; const total = parseFloat(p.size);
    timers.current[os] = setInterval(() => {
      mb += total * (0.05 + Math.random() * 0.09);
      const pct = Math.min(100, Math.round((mb / total) * 100));
      setProg((q) => ({ ...q, [os]: pct }));
      if (pct >= 100) {
        clearInterval(timers.current[os]!); timers.current[os] = null;
        void buildAndSave(os);
      }
    }, 90);
  };

  const buildAndSave = async (os: OS) => {
    const p = PLATFORMS[os];
    const zip = new JSZip();
    zip.file("app-manifest.json", JSON.stringify({
      app: "VITECH School Management System", version, channel, platform: os, arch: "x64", build,
      released: new Date().toISOString().slice(0, 10), engine: "Tauri 2 · offline-first", sha256: p.sha,
      updater: { channel, endpoint: "https://releases.vitech.school/appcast.json", auto: true },
    }, null, 2));
    zip.file("README.txt", [
      "VITECH SCHOOL MANAGEMENT SYSTEM — DESKTOP EDITION", "===================================================", "",
      `Version ${version} (${channel}) · build ${build}`, `Platform: ${p.label}`, "",
      "1. Run the installer for your platform (see install scripts).",
      "2. Sign in with your school account — your data syncs automatically.",
      "3. The app works offline and syncs when the connection returns.", "",
      "Support: support@vitech.school · +250 788 000 111",
    ].join("\n"));
    zip.file("LICENSE.txt", "VITECH School — commercial license. One license per school group.\nCopyright (c) 2026 VITECH Education Systems. All rights reserved.");
    if (os === "win") zip.file("install-windows.bat", "@echo off\necho Installing VITECH School %1...\nstart /wait VITECH-School-Setup.exe /S\necho Done.");
    if (os === "mac") zip.file("install-macos.sh", "#!/bin/bash\necho \"Installing VITECH School...\"\nhdiutil attach VITECH-School.dmg && cp -R \"/Volumes/VITECH School/VITECH School.app\" /Applications/ && echo Done.");
    if (os === "linux") zip.file("install-linux.sh", "#!/bin/bash\necho \"Installing VITECH School...\"\nsudo dpkg -i vitech-school_amd64.deb && echo Done.");
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `VITECH-School-Desktop-${version}-${os}-x64.zip`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    setHist((h) => [{ id: Math.random().toString(36).slice(2), os, file: `VITECH-School-Desktop-${version}-${os}-x64.zip`, size: p.size, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }, ...h]);
    setProg((q) => ({ ...q, [os]: 0 }));
    toast(`${tt("Download complete")} — ${p.label} · ${tt("verify the SHA-256 checksum")}`);
  };

  const copy = (txt: string) => { void navigator.clipboard?.writeText(txt); toast("SHA-256 copied"); };
  const pwaInstall = async () => {
    const e = deferred as unknown as { prompt?: () => void } | null;
    if (e?.prompt) { e.prompt(); setDeferred(null); toast(tt("Install prompt opened")); }
    else toast("Use your browser menu → “Install app”", "info");
  };
  const DBtn = ({ os, big }: { os: OS; big?: boolean }) => {
    const p = prog[os]; const busy = p > 0;
    return (
      <button onClick={() => startDownload(os)} disabled={busy}
        className={`${big ? "btn-gold !h-12 !px-7 !text-[15px]" : "btn-p btn-sm"} relative overflow-hidden min-w-[170px]`}>
        {busy && <span className="absolute inset-y-0 left-0 bg-black/20 transition-all" style={{ width: `${p}%` }} />}
        <span className="relative flex items-center gap-2">
          {busy ? <>{p}% · {Math.round(parseFloat(PLATFORMS[os].size) * p / 100)} MB</> : <><Ic n="download" size={big ? 17 : 14} />{big ? tt("Download for") + " " + PLATFORMS[os].label : tt("Download")}</>}
        </span>
      </button>
    );
  };

  const NEWS: { type: "New" | "Fix" | "Perf" | "Sec"; text: string }[] = [
    { type: "New", text: tt("Offline-first engine — full register, grading and payments while disconnected, auto-sync on reconnect") },
    { type: "New", text: tt("Biometric attendance kiosk mode for reception desks") },
    { type: "New", text: tt("Receipt & report-card printing with native printer dialog") },
    { type: "Perf", text: tt("Cold start 2.4× faster; 100,000-student lists render instantly") },
    { type: "Fix", text: tt("Currency conversion rounding on very small balances") },
    { type: "Sec", text: tt("Session keys now stored in the OS keychain (Windows Credential Manager / macOS Keyring)") },
  ];
  const toneOf = { New: "green", Fix: "blue", Perf: "gold", Sec: "red" } as const;

  return (
    <div className="min-h-screen bg-paper dark:bg-ink-950 text-ink-900 dark:text-ink-100">
      {/* mini nav */}
      <header className="sticky top-0 z-40 border-b border-ink-100 dark:border-ink-800 bg-paper/85 dark:bg-ink-950/85 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <button onClick={() => nav("/")} className="flex items-center gap-2.5 cursor-pointer group">
            <span className="w-8 h-8 rounded-lg bg-ink-950 dark:bg-cobalt-600 flex items-center justify-center text-gold-400 font-display font-bold">V</span>
            <span className="font-display font-bold text-[15px] tracking-tight group-hover:text-cobalt-700 dark:group-hover:text-cobalt-300 transition-colors">VITECH <span className="text-cobalt-600 dark:text-cobalt-400">School</span></span>
          </button>
          <Chip tone="navy" className="ml-1 hidden sm:inline-flex">{tt("Desktop app")}</Chip>
          <div className="ml-auto flex items-center gap-2">
            <select className="input !w-auto !h-8 !text-[12px] font-bold" value={lang} onChange={(e) => setPrefs({ lang: e.target.value as Lang })} aria-label={tt("Language")}>
              {LANGS.map((l) => <option key={l.code} value={l.code}>{l.native}</option>)}
            </select>
            <button className="btn-o btn-sm" onClick={() => nav("/")}><Ic n="chevL" size={14} />{tt("Back to site")}</button>
          </div>
        </div>
      </header>

      {/* release header — opens on the release itself */}
      <section className="relative overflow-hidden bg-ink-950 text-ink-100">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute right-[-120px] top-[-120px] w-[420px] h-[420px] dot-bg rounded-full opacity-25" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-16 grid lg:grid-cols-[1.15fr_1fr] gap-10 items-center">
          <div>
            <Reveal>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="chip bg-gold-400 text-ink-950 !py-1.5 font-mono">v{version}</span>
                <div className="panel !shadow-none !bg-white/[0.06] !border-white/10 p-0.5 flex gap-0.5">
                  {(["stable", "beta"] as const).map((c) => (
                    <button key={c} onClick={() => setChannel(c)} className={`px-3 h-7 rounded-md text-[11.5px] font-extrabold uppercase tracking-wide transition-all cursor-pointer ${channel === c ? "bg-gold-400 text-ink-950" : "text-ink-300 hover:text-white"}`}>{c}</button>
                  ))}
                </div>
                <span className="text-[11.5px] font-bold text-ink-400 font-mono">build {build} · {new Date().toLocaleDateString()}</span>
              </div>
            </Reveal>
            <Reveal delay={70}>
              <h1 className="font-display font-bold text-[34px] sm:text-[46px] leading-[1.05] tracking-tight mt-4">
                {tt("VITECH School")} <span className="text-gold-400">{tt("for Desktop")}</span>
              </h1>
            </Reveal>
            <Reveal delay={140}>
              <p className="text-[15px] text-ink-300 leading-relaxed mt-4 max-w-lg">
                {tt("The full ERP on your machine — offline-first registers, receipts and report cards, with automatic background sync to your school.")}
              </p>
            </Reveal>
            <Reveal delay={210}>
              <div className="flex flex-wrap items-center gap-3 mt-7">
                <DBtn os={detected} big />
                <a href="#platforms" className="btn-o !h-12 !px-5 !border-ink-700 !bg-transparent !text-ink-100 hover:!border-gold-400 hover:!text-gold-300">{tt("Other platforms")}<Ic n="chevD" size={15} /></a>
                {deferred && <button className="btn-g !h-12 !text-ink-200" onClick={() => void pwaInstall()}><Ic n="sparkles" size={16} />{tt("Install as app")}</button>}
              </div>
            </Reveal>
            <Reveal delay={280}>
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6 text-[12px] font-bold text-ink-400">
                <span className="flex items-center gap-1.5"><Ic n="shield" size={13} className="text-emerald-400" />{tt("Signed & notarized")}</span>
                <span className="flex items-center gap-1.5"><Ic n="refresh" size={13} className="text-cobalt-300" />{tt("Auto-updates via")} <b className="text-ink-200 capitalize">{channel}</b></span>
                <span className="flex items-center gap-1.5"><Ic n="database" size={13} className="text-gold-400" />{tt("Offline-first sync")}</span>
                <span className="font-mono">{PLATFORMS[detected].size}</span>
              </div>
            </Reveal>
          </div>
          {/* app window mockup */}
          <Reveal delay={180} className="hidden md:block">
            <div className="float-y rounded-xl border border-white/10 bg-ink-900 shadow-pop overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 h-9 bg-ink-950/80 border-b border-white/[0.06]">
                <i className="w-2.5 h-2.5 rounded-full bg-rose-500" /><i className="w-2.5 h-2.5 rounded-full bg-gold-400" /><i className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="ml-3 text-[10.5px] font-bold text-ink-400 font-mono">VITECH School — {s.db.school.name}</span>
                <span className="ml-auto chip !py-0.5 bg-emerald-500/15 text-emerald-300"><i className="w-1.5 h-1.5 rounded-full bg-emerald-400 tick-pulse" />synced</span>
              </div>
              <div className="flex">
                <div className="w-24 shrink-0 p-2.5 space-y-1 border-r border-white/[0.05]">
                  {["dashboard", "students", "attendance", "payment", "grades"].map((ic, i) => (
                    <span key={ic} className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-wide ${i === 0 ? "bg-cobalt-600 text-white" : "text-ink-500"}`}><Ic n={ic} size={11} />{["Dash", "Students", "Attend", "Fees", "Grades"][i]}</span>
                  ))}
                </div>
                <div className="flex-1 p-4">
                  <div className="grid grid-cols-3 gap-2">
                    {[["240", "Students", "#4f7df3"], ["92%", "Attend.", "#34d399"], ["1.2M", "RWF in", "#dca638"]].map(([v, l, col]) => (
                      <div key={l} className="rounded-lg bg-white/[0.05] border border-white/[0.06] p-2.5">
                        <div className="font-display font-bold text-[15px] tnum" style={{ color: col }}>{v}</div>
                        <div className="text-[8px] font-extrabold uppercase tracking-wider text-ink-500 mt-0.5">{l}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-end gap-1.5 h-16 mt-4">
                    {[42, 60, 38, 74, 55, 88, 66, 95].map((h, i) => <div key={i} className="flex-1 rounded-t-[3px] bar-anim" style={{ height: `${h}%`, background: i % 2 ? "#dca638" : "#4f7df3", animationDelay: `${i * 60}ms` }} />)}
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[9.5px] font-bold text-ink-500"><i className="w-1.5 h-1.5 rounded-full bg-emerald-400 tick-pulse" />{tt("Offline-ready")} · SQLite · {tt("encrypted at rest")}</div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* platform rows */}
      <section id="platforms" className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <Reveal>
          <div className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-gold-600 dark:text-gold-400">{tt("Choose your platform")}</div>
          <h2 className="font-display text-[26px] sm:text-[32px] font-bold tracking-tight mt-1.5">{tt("One codebase, every desktop")}</h2>
        </Reveal>
        <div className="mt-6 space-y-3">
          {(["win", "mac", "linux"] as OS[]).map((os, i) => {
            const p = PLATFORMS[os];
            const isDet = os === detected;
            return (
              <Reveal key={os} delay={i * 70}>
                <div className={`panel p-4 sm:p-5 flex flex-wrap items-center gap-4 transition-all hover:shadow-lift hover:-translate-y-0.5 ${isDet ? "!border-gold-300 dark:!border-gold-700 ring-1 ring-gold-300/50 dark:ring-gold-700/40" : ""}`}>
                  <span className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isDet ? "bg-gold-400 text-ink-950" : "bg-ink-950 dark:bg-cobalt-600 text-white"}`}><OsGlyph os={os} size={24} /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <b className="font-display text-[17px]">{p.label}</b>
                      {isDet && <Chip tone="gold"><Ic n="check" size={11} />{tt("Detected on this device")}</Chip>}
                      <Chip tone="gray">x64</Chip>
                    </div>
                    <p className="text-[12.5px] text-ink-400 font-semibold mt-0.5">{p.note} · {p.size}</p>
                    <button onClick={() => copy(p.sha)} className="group flex items-center gap-2 mt-2 font-mono text-[11px] text-ink-400 hover:text-cobalt-600 dark:hover:text-cobalt-300 transition-colors cursor-pointer" title={tt("Copy checksum")}>
                      <span className="truncate max-w-[240px] sm:max-w-[340px]">sha256: {p.sha}</span><CopyIc /><span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">copy</span>
                    </button>
                  </div>
                  <div className="flex flex-col items-stretch sm:items-end gap-1.5 ml-auto">
                    <DBtn os={os} />
                    <span className="text-[10.5px] font-mono font-bold text-ink-300 text-right">{p.file}</span>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* history */}
        {hist.length > 0 && (
          <div className="panel p-5 mt-5">
            <h3 className="font-display font-bold text-[15px] flex items-center gap-2"><Ic n="clock" size={16} className="text-cobalt-500" />{tt("Download history")}<Chip tone="blue">{hist.length}</Chip></h3>
            <div className="mt-3 space-y-2">
              {hist.map((h) => (
                <div key={h.id} className="feed-in flex items-center gap-3 rounded-lg border border-ink-100 dark:border-ink-800 px-3.5 py-2.5 text-[12.5px]">
                  <span className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 flex items-center justify-center"><Ic n="check" size={15} sw={2.4} /></span>
                  <OsGlyph os={h.os} size={16} />
                  <span className="font-mono font-bold truncate flex-1">{h.file}</span>
                  <span className="text-ink-400 font-semibold hidden sm:inline">{h.size}</span>
                  <span className="text-ink-300 font-bold tnum">{h.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* tabs: news / requirements / install */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="panel !shadow-none p-1 flex gap-1 w-fit max-w-full overflow-x-auto mb-5">
          {([["news", tt("What's new")], ["req", tt("System requirements")], ["install", tt("Install & auto-update")]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`px-4 h-9 rounded-lg text-[13px] font-bold whitespace-nowrap transition-colors cursor-pointer ${tab === id ? "bg-cobalt-600 text-white" : "text-ink-400 hover:text-ink-800 dark:hover:text-ink-100"}`}>{label}</button>
          ))}
        </div>
        {tab === "news" && (
          <div className="panel p-5 sm:p-6 pop-in">
            <div className="flex items-center gap-2.5 flex-wrap mb-4">
              <h3 className="font-display font-bold text-[18px]">v{version} — {channel === "stable" ? tt("Stable release") : "Beta"}</h3>
              <Chip tone="gray" className="font-mono">{build}</Chip><Chip tone="blue">{new Date().toLocaleDateString()}</Chip>
            </div>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
              {NEWS.map((n, i) => (
                <div key={i} className="flex gap-3 items-start py-2 border-b border-ink-100/70 dark:border-ink-800/70 last:border-0">
                  <Chip tone={toneOf[n.type]} className="shrink-0 mt-0.5 !w-14 justify-center">{n.type}</Chip>
                  <p className="text-[13.5px] leading-relaxed">{n.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === "req" && (
          <div className="panel overflow-x-auto pop-in">
            <table className="tbl">
              <thead><tr><th> </th><th>Windows</th><th>macOS</th><th>Linux</th></tr></thead>
              <tbody>
                {[[tt("Operating system"), "Windows 10 / 11 (64-bit)", "macOS 12 Monterey+", "Ubuntu 20.04+ / Debian 11+"],
                [tt("Memory"), "4 GB RAM", "4 GB RAM", "4 GB RAM"],
                [tt("Disk space"), "350 MB + school data", "380 MB + school data", "320 MB + school data"],
                [tt("Screen"), "1280 × 720", "1280 × 720", "1280 × 720"],
                ["Internet", tt("Optional — offline-first"), tt("Optional — offline-first"), tt("Optional — offline-first")],
                [tt("Printer"), tt("Any system printer — A4 & ID cards"), tt("AirPrint supported"), "CUPS"]].map((row) => (
                  <tr key={row[0]}><td className="font-extrabold text-[12px] uppercase tracking-wide text-ink-400">{row[0]}</td><td className="font-semibold text-[13px]">{row[1]}</td><td className="font-semibold text-[13px]">{row[2]}</td><td className="font-semibold text-[13px]">{row[3]}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab === "install" && (
          <div className="grid md:grid-cols-2 gap-4 pop-in">
            <div className="panel p-6">
              <h3 className="font-display font-bold text-[16px] mb-4">{tt("Installation steps")}</h3>
              {[tt("Download the package for your platform above"), tt("Run the installer and accept the license"), tt("Sign in with your school account"), tt("Your data syncs automatically — work offline anytime")].map((st, i) => (
                <div key={i} className="flex gap-3.5 py-2.5">
                  <span className="w-7 h-7 rounded-lg bg-ink-950 dark:bg-cobalt-600 text-gold-400 flex items-center justify-center font-display font-bold text-[13px] shrink-0">{i + 1}</span>
                  <p className="text-[13.5px] font-semibold pt-1">{st}</p>
                </div>
              ))}
              <div className="rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-800 px-4 py-3 mt-2 text-[12.5px] font-semibold text-amber-800 dark:text-amber-200 flex gap-2">
                <Ic n="info" size={15} className="shrink-0 mt-0.5" />{tt("Always verify the SHA-256 checksum after downloading — click any checksum to copy it.")}
              </div>
            </div>
            <div className="panel p-6">
              <h3 className="font-display font-bold text-[16px] mb-4">{tt("Auto-update architecture")}</h3>
              <div className="space-y-3">
                {[["sparkles", tt("Delta updates"), tt("Only changed binaries are downloaded — typically under 8 MB.")],
                ["refresh", tt("Channel-based rollout"), tt("Stable receives tested builds; beta previews new modules two weeks earlier.")],
                ["database", tt("Local encrypted store"), tt("SQLite database encrypted at rest; backups nightly at 02:00.")],
                ["shield", tt("Signed releases"), tt("Every build is signed and notarized; tampered files refuse to install.")]].map(([ic, t2, b]) => (
                  <div key={t2} className="flex gap-3.5">
                    <span className="w-9 h-9 rounded-lg bg-cobalt-50 dark:bg-cobalt-500/15 text-cobalt-600 dark:text-cobalt-300 flex items-center justify-center shrink-0"><Ic n={ic} size={17} /></span>
                    <div><b className="block text-[13.5px]">{t2}</b><p className="text-[12.5px] text-ink-400 leading-relaxed">{b}</p></div>
                  </div>
                ))}
              </div>
              <button className="btn-o btn-sm mt-5" onClick={() => nav("/app")}><Ic n="dashboard" size={14} />{tt("Open the web app")}</button>
            </div>
          </div>
        )}
      </section>

      {/* footer strip */}
      <footer className="border-t border-ink-100 dark:border-ink-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-wrap items-center gap-4 text-[12.5px] font-semibold text-ink-400">
          <span>© 2026 VITECH School Management System</span>
          <div className="ml-auto flex gap-4">
            <button className="hover:text-cobalt-600 dark:hover:text-cobalt-300 transition-colors cursor-pointer" onClick={() => nav("/verify")}>{tt("Verify certificate")}</button>
            <button className="hover:text-cobalt-600 dark:hover:text-cobalt-300 transition-colors cursor-pointer" onClick={() => nav("/login")}>{tt("Login")}</button>
            <button className="hover:text-cobalt-600 dark:hover:text-cobalt-300 transition-colors cursor-pointer" onClick={() => nav("/register")}>{tt("Get Started")}</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
