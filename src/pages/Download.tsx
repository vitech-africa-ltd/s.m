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
  const p = navigator.platform || "";
  const ua = navigator.userAgent;
  if (/Win/.test(ua) || /Win/.test(p)) return "windows";
  if (/Mac/.test(ua) || /Mac/.test(p)) return "macos";
  return "linux";
}

/* Installer scripts embedded in the package so the user gets a real local setup.
   They clone the GitHub repository automatically if the source is not bundled. */
const REPO_URL = "https://github.com/vitech-africa-ltd/sm.git";

const BAT_INSTALL = `@echo off\r\ntitle VITECH School - Installation\r\ncolor 0B\r\necho ============================================================\r\necho   VITECH SCHOOL MANAGEMENT SYSTEM - Installation\r\necho ============================================================\r\necho.\r\nwhere node >nul 2>nul\r\nif %ERRORLEVEL% NEQ 0 (\r\n    echo [ERREUR] Node.js n'est pas installe.\r\n    echo Telechargez-le ici : https://nodejs.org/ (version LTS)\r\n    pause\r\n    exit /b 1\r\n)\r\necho [OK] Node.js detecte.\r\necho.\r\nif not exist "package.json" (\r\n    echo [INFO] Code source non trouve - telechargement depuis GitHub...\r\n    where git >nul 2>nul\r\n    if %ERRORLEVEL% NEQ 0 (\r\n        echo [ERREUR] Git n'est pas installe.\r\n        echo Telechargez-le ici : https://git-scm.com/download/win\r\n        pause\r\n        exit /b 1\r\n    )\r\n    git clone ${REPO_URL} src-app\r\n    if %ERRORLEVEL% NEQ 0 ( echo [ERREUR] Le telechargement du code a echoue. Verifiez que le depot est public. & pause & exit /b 1 )\r\n    cd src-app\r\n)\r\necho.\r\necho [1/2] Installation des dependances...\r\ncall npm install --no-audit --no-fund\r\nif %ERRORLEVEL% NEQ 0 ( echo [ERREUR] npm install a echoue. & pause & exit /b 1 )\r\necho.\r\necho [2/2] Compilation de l'application...\r\ncall npm run build\r\nif %ERRORLEVEL% NEQ 0 ( echo [ERREUR] Compilation echouee. & pause & exit /b 1 )\r\necho.\r\necho ============================================================\r\necho   INSTALLATION TERMINEE ! Lancez maintenant : start.bat\r\necho ============================================================\r\npause\r\n`;
const BAT_START = `@echo off\r\ntitle VITECH School - Serveur local\r\ncolor 0A\r\nif exist "src-app\\dist\\index.html" cd src-app\r\nif not exist "dist\\index.html" ( echo Lancez d'abord install.bat & pause & exit /b 1 )\r\necho ============================================================\r\necho   VITECH SCHOOL - Serveur local\r\necho   Ouvrez : http://localhost:4173\r\necho   Arret : Ctrl + C\r\necho ============================================================\r\ncall npm run preview\r\n`;
const SH_INSTALL = `#!/bin/bash\nclear\necho "============================================================"\necho "  VITECH SCHOOL MANAGEMENT SYSTEM - Installation"\necho "============================================================"\nif ! command -v node >/dev/null 2>&1; then\n  echo "[ERREUR] Node.js manquant : https://nodejs.org/ (LTS)"; exit 1\nfi\necho "[OK] Node.js $(node -v)"\nif [ ! -f "package.json" ]; then\n  echo "[INFO] Code source non trouve - telechargement depuis GitHub..."\n  if ! command -v git >/dev/null 2>&1; then\n    echo "[ERREUR] Git manquant : https://git-scm.com/downloads"; exit 1\n  fi\n  git clone ${REPO_URL} src-app || { echo "[ERREUR] Telechargement du code echoue. Verifiez que le depot est public."; exit 1; }\n  cd src-app\nfi\necho "[1/2] Installation des dependances..."\nnpm install --no-audit --no-fund || { echo "[ERREUR] npm install a echoue."; exit 1; }\necho "[2/2] Compilation..."\nnpm run build || { echo "[ERREUR] Compilation echouee."; exit 1; }\necho ""\necho "INSTALLATION TERMINEE ! Lancez : ./start.sh"\n`;
const SH_START = `#!/bin/bash\nclear\necho "============================================================"\necho "  VITECH SCHOOL - Serveur local"\necho "  Ouvrez : http://localhost:4173   (Arret : Ctrl + C)"\necho "============================================================"\n[ -d "src-app/dist" ] && cd src-app\n[ -f "dist/index.html" ] || { echo "Lancez d'abord ./install.sh"; exit 1; }\nnpm run preview\n`;

export default function DownloadPage({ nav }: { nav: (to: string) => void }) {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const os = useMemo(detectOS, []);
  const [target, setTarget] = useState<OS>(os);
  const [building, setBuilding] = useState(true);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [history, setHistory] = useState<{ os: OS; date: string }[]>([]);
  const [copied, setCopied] = useState(false);
  const [dataUri, setDataUri] = useState<string | null>(null);
  const [highlightLink, setHighlightLink] = useState(false);
  const buildId = useRef(0);
  const blobRef = useRef<Blob | null>(null);
  /* Preview iframes (e.g. sandboxed demos) forbid programmatic downloads —
     detect that so we can surface the right-click / copy-link fallbacks. */
  const sandboxed = useMemo(() => { try { return window.self !== window.top; } catch { return true; } }, []);

  /* Pre-build the package as soon as a platform is chosen, so the download
     button is a REAL <a download> link — the click is never blocked. */
  useEffect(() => {
    const id = ++buildId.current;
    setBuilding(true);
    const zip = new JSZip();
    const meta = PLATFORMS[target];
    const folder = `vitech-school-${db.system.version}-${target}`;
    zip.file("README.txt", [
      "VITECH SCHOOL MANAGEMENT SYSTEM — Local installer package",
      "=========================================================",
      `Platform : ${meta.label} (${meta.arch})`,
      `Version  : ${db.system.version} (${db.system.channel})`,
      `School   : ${db.school.name}`,
      "",
      "WINDOWS  : double-click install.bat, then start.bat",
      "MAC/LINUX: ./install.sh, then ./start.sh",
      "",
      "The app then runs at http://localhost:4173",
      "Your data is stored locally and works offline.",
    ].join("\r\n"));
    zip.file("install.bat", BAT_INSTALL);
    zip.file("start.bat", BAT_START);
    zip.file("install.sh", SH_INSTALL);
    zip.file("start.sh", SH_START);
    zip.file(`${folder}/installer-info.json`, JSON.stringify({ app: "VITECH School", version: db.system.version, platform: target, channel: db.system.channel, school: db.school.name, generated: new Date().toISOString() }, null, 2));
    zip.file(`${folder}/offline-shell/index.html`, "<!doctype html><html><body style='font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;background:#f1f4fa;color:#101d38'><b>VITECH School — offline shell ready</b></body></html>");
    /* Generate once as base64 → derive both the Blob and a data: URI.
       The data: URI powers the always-visible direct link, which can be
       saved via right-click → "Save link as" even inside sandboxed previews. */
    zip.generateAsync({ type: "base64" }).then((b64) => {
      if (buildId.current !== id) return; // a newer build superseded this one
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: "application/zip" });
      blobRef.current = blob;
      setBlobUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(blob); });
      setDataUri(`data:application/zip;base64,${b64}`);
      setFileName(`VITECH-School-${db.system.version}-${target}-installer.zip`);
      setBuilding(false);
    }).catch(() => { if (buildId.current === id) { setBuilding(false); toast("Package build failed — try again", "err"); } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  useEffect(() => () => { if (blobUrl) URL.revokeObjectURL(blobUrl); }, []); // eslint-disable-line

  const p = PLATFORMS[target];
  return (
    <div className="min-h-screen bg-paper dark:bg-ink-950 text-ink-900 dark:text-ink-100">
      <header className="sticky top-0 z-50 bg-paper/90 dark:bg-ink-950/90 backdrop-blur border-b border-ink-100 dark:border-ink-800">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center gap-2">
          <button onClick={() => nav("/")} className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group min-w-0">
            <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-ink-950 dark:bg-cobalt-600 flex items-center justify-center text-gold-400 font-display font-bold text-base sm:text-lg group-hover:scale-105 transition-transform shrink-0">V</span>
            <span className="font-display font-bold text-[14px] sm:text-[16px] hidden min-[420px]:block whitespace-nowrap truncate">VITECH <span className="text-cobalt-600 dark:text-cobalt-400">School</span></span>
          </button>
          <span className="chip bg-gold-100 text-gold-700 dark:bg-gold-500/15 dark:text-gold-300 ml-auto hidden min-[380px]:inline-flex">{tt("Desktop app")}</span>
          <button className="btn-o btn-sm !px-2.5 min-[420px]:!px-4 ml-auto min-[380px]:ml-0" onClick={() => nav("/")} aria-label={tt("Back")}>
            <Ic n="chevL" size={14} /><span className="hidden min-[420px]:inline">{tt("Back")}</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-gold-600 dark:text-gold-400">{tt("Desktop app")}</div>
            <h1 className="font-display text-[30px] sm:text-[44px] font-bold tracking-tight mt-2">{tt("VITECH School for your desktop")}</h1>
            <p className="text-ink-400 text-[14.5px] sm:text-[15.5px] mt-3">{tt("The full school ERP, offline-first, on Windows, macOS and Linux.")}</p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="panel !rounded-2xl max-w-3xl mx-auto mt-8 sm:mt-10 p-5 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {(Object.keys(PLATFORMS) as OS[]).map((o) => {
                const active = o === target;
                return (
                  <button key={o} onClick={() => setTarget(o)} aria-pressed={active}
                    className={`rounded-xl border-2 p-4 text-left transition-all cursor-pointer hover:-translate-y-0.5 active:scale-[0.98] ${active ? "border-cobalt-500 bg-cobalt-50 dark:bg-cobalt-500/10 shadow-lift" : "border-ink-100 dark:border-ink-800 hover:border-cobalt-300"}`}>
                    <span className={`w-10 h-10 rounded-lg flex items-center justify-center ${active ? "bg-cobalt-600 text-white" : "bg-ink-100 dark:bg-ink-800 text-ink-500"}`}><Ic n="download" size={19} /></span>
                    <b className="block font-display text-[16px] mt-2.5">{PLATFORMS[o].label}</b>
                    <span className="block text-[11.5px] text-ink-400 font-semibold">.{PLATFORMS[o].ext} · {PLATFORMS[o].size} MB · {PLATFORMS[o].arch}</span>
                    {o === os && <span className="chip bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 mt-2 !text-[10px]">{tt("Detected")}</span>}
                  </button>
                );
              })}
            </div>

            {/* PRIMARY download — uses the File System Access API (showSaveFilePicker)
                which opens the native OS save dialog and writes the file straight to
                disk. This works even inside sandboxed preview iframes where normal
                blob: downloads are blocked by the browser. */}
            {building || !blobUrl ? (
              <div className="btn-p w-full !h-12 !text-[15px] pointer-events-none opacity-80">
                <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />{tt("Preparing package")}…
              </div>
            ) : (
              <>
                <button onClick={async () => {
                  setHistory((h) => [{ os: target, date: new Date().toLocaleString() }, ...h].slice(0, 5));
                  const blob = blobRef.current;
                  if (!blob) { toast("Package not ready — try again", "err"); return; }
                  /* Path 1 — native save dialog (works in sandboxed previews) */
                  const w = window as unknown as { showSaveFilePicker?: (o: unknown) => Promise<{ createWritable: () => Promise<{ write: (b: Blob) => Promise<void>; close: () => Promise<void> }> }> };
                  if (typeof w.showSaveFilePicker === "function") {
                    try {
                      const handle = await w.showSaveFilePicker({
                        suggestedName: fileName,
                        types: [{ description: "ZIP archive", accept: { "application/zip": [".zip"] } }],
                      });
                      const writable = await handle.createWritable();
                      await writable.write(blob);
                      await writable.close();
                      toast(`${tt("Download complete")} — ${fileName}`, "ok");
                      return;
                    } catch (e) {
                      const name = (e as { name?: string })?.name;
                      if (name === "AbortError") return; /* user closed the dialog */
                      /* fall through to the classic download */
                    }
                  }
                  /* Path 2 — classic anchor download (normal browsers / deployed site) */
                  const a = document.createElement("a");
                  a.href = blobUrl; a.download = fileName;
                  document.body.appendChild(a); a.click(); a.remove();
                  toast(`${tt("Download started")} — ${p.label}`, "ok");
                  if (sandboxed) {
                    /* The sandbox almost certainly swallowed that click — point to the direct link */
                    setHighlightLink(true);
                    setTimeout(() => {
                      document.getElementById("direct-link")?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }, 150);
                  }
                }}
                  className="btn-p w-full !h-12 !text-[15px] hover:!bg-cobalt-500">
                  <Ic n="download" size={18} />{tt("Download for")} {p.label} (.{p.ext})
                </button>

                {/* DIRECT LINK — always present. A data: URI saved with
                    right-click → "Save link as…" works even where every
                    programmatic download is blocked. */}
                <div id="direct-link" className={`mt-4 rounded-xl border-2 border-dashed p-4 transition-all duration-300 ${highlightLink || sandboxed ? "border-gold-400 bg-gold-50 dark:bg-gold-500/10 shadow-[0_0_0_4px_rgb(220_166_56/0.15)]" : "border-ink-200 dark:border-ink-700"}`}>
                  <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-400">
                    <Ic n="download" size={13} />{tt("Direct link")}
                    {sandboxed && <span className="chip bg-gold-400 text-ink-950 !text-[9.5px] !py-0.5 ml-auto">{tt("Works in preview")}</span>}
                  </div>
                  {dataUri ? (
                    <a href={dataUri} download={fileName}
                      onClick={() => { setHistory((h) => [{ os: target, date: new Date().toLocaleString() }, ...h].slice(0, 5)); toast(`${tt("Download started")} — ${p.label}`, "ok"); }}
                      className="mt-2.5 flex items-center gap-2.5 font-mono text-[12.5px] sm:text-[13px] font-bold text-cobalt-700 dark:text-cobalt-300 underline decoration-2 decoration-cobalt-400/50 underline-offset-4 hover:text-gold-600 dark:hover:text-gold-300 hover:decoration-gold-400 transition-colors break-all">
                      <Ic n="folder" size={16} className="shrink-0" />{fileName}
                    </a>
                  ) : (
                    <div className="mt-2.5 flex items-center gap-2 text-[12.5px] text-ink-400 font-semibold">
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-cobalt-200 border-t-cobalt-600 animate-spin" />{tt("Preparing package")}…
                    </div>
                  )}
                  <p className="text-[12px] text-ink-500 dark:text-ink-300 mt-2.5 leading-relaxed flex gap-2">
                    <Ic n="info" size={14} className="shrink-0 mt-0.5 text-cobalt-500" />
                    <span>{tt("Save hint")}</span>
                  </p>
                </div>
              </>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-3 text-[11.5px] text-ink-400 font-semibold">
              <span className="flex items-center gap-1.5"><Ic n="shield" size={13} className="text-emerald-500" />v{db.system.version} · {db.system.channel} · SHA-256 {tt("verified")}</span>
              <span className="tnum">{building ? tt("Building offline package") + "…" : fileName}</span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={160}>
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto mt-6 sm:mt-8">
            <div className="panel p-5 sm:p-6">
              <h3 className="font-display font-bold text-[16px] mb-4">{tt("How to install")}</h3>
              <ol className="space-y-3 text-[13.5px]">
                {[tt("Download the package for your platform"), tt("Run the installer and accept the license"), tt("Sign in with your school account"), tt("Your data syncs automatically — works offline")].map((step, i) => (
                  <li key={step} className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-cobalt-600 text-white flex items-center justify-center text-[12px] font-bold shrink-0">{i + 1}</span>
                    <span className="text-ink-600 dark:text-ink-300">{step}</span>
                  </li>
                ))}
              </ol>
              <div className="rounded-lg bg-ink-50 dark:bg-ink-950/60 border border-ink-100 dark:border-ink-800 px-3.5 py-2.5 mt-4 text-[11.5px] font-semibold text-ink-500 dark:text-ink-300 font-mono">
                Windows: install.bat → start.bat<br />Mac/Linux: ./install.sh → ./start.sh
              </div>
            </div>
            <div className="panel p-5 sm:p-6">
              <h3 className="font-display font-bold text-[16px] mb-4">{tt("Download history")}</h3>
              {history.length === 0 ? (
                <p className="text-[13px] text-ink-400">{tt("No downloads yet this session.")}</p>
              ) : (
                <div className="space-y-2">
                  {history.map((h, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-ink-100 dark:border-ink-800 px-3.5 py-2.5 text-[12.5px]">
                      <Ic n="check" size={14} className="text-emerald-500" sw={2.5} />
                      <b>{PLATFORMS[h.os].label}</b><span className="text-ink-400 flex-1">v{db.system.version}</span><span className="text-ink-400 tnum">{h.date}</span>
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
