import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Ic } from "./icons";
import { useT } from "../lib/i18n";

/* ---------- hooks ---------- */
export function useMounted() { const [m, setM] = useState(false); useEffect(() => { const t = requestAnimationFrame(() => setM(true)); return () => cancelAnimationFrame(t); }, []); return m; }
export function useCountUp(target: number, dur = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (rm) { setV(target); return; }
    let raf = 0; const t0 = performance.now();
    const step = (t: number) => { const p = Math.min(1, (t - t0) / dur); setV(target * (1 - Math.pow(1 - p, 3))); if (p < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step); return () => cancelAnimationFrame(raf);
  }, [target, dur]);
  return v;
}
export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("on"); ob.disconnect(); } }, { threshold: 0.08 });
    ob.observe(el); return () => ob.disconnect();
  }, []);
  return <div ref={ref} className={`rv ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

/* ---------- atoms ---------- */
export const Avatar = ({ first, last, hue, size = 34 }: { first: string; last: string; hue: number; size?: number }) => (
  <span className="inline-flex items-center justify-center rounded-full font-display font-bold text-white shrink-0 select-none"
    style={{ width: size, height: size, fontSize: size * 0.36, background: `linear-gradient(135deg, hsl(${hue} 55% 46%), hsl(${(hue + 40) % 360} 60% 34%))` }}>
    {(first[0] ?? "") + (last[0] ?? "")}
  </span>
);
export const Chip = ({ tone = "gray", children, className = "" }: { tone?: "gray" | "green" | "red" | "amber" | "blue" | "navy" | "gold"; children: ReactNode; className?: string }) => {
  const tones = {
    gray: "bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-200",
    green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    red: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    blue: "bg-cobalt-100 text-cobalt-700 dark:bg-cobalt-500/15 dark:text-cobalt-300",
    navy: "bg-ink-900 text-ink-100 dark:bg-ink-100 dark:text-ink-900",
    gold: "bg-gold-100 text-gold-700 dark:bg-gold-500/15 dark:text-gold-300",
  };
  return <span className={`chip ${tones[tone]} ${className}`}>{children}</span>;
};
export const Dot = ({ tone = "green" }: { tone?: string }) => <span className={`inline-block w-1.5 h-1.5 rounded-full bg-${tone}-500`} />;

export function Stat({ label, value, sub, icon, tone = "blue", count = true, money = false, prefix = "" }: { label: string; value: number; sub?: ReactNode; icon: string; tone?: "blue" | "gold" | "green" | "red" | "navy"; count?: boolean; money?: string | false; prefix?: string }) {
  const tt = useT();
  const v = useCountUp(value);
  const tones = { blue: "bg-cobalt-600", gold: "bg-gold-400 text-ink-950", green: "bg-emerald-500", red: "bg-rose-500", navy: "bg-ink-900 dark:bg-ink-700" };
  const display = money ? `${prefix}${Math.round(v).toLocaleString("en-US")} ${money}` : `${prefix}${Math.round(v).toLocaleString("en-US")}`;
  return (
    <div className="panel p-4 flex items-start gap-3.5 hover:shadow-lift hover:-translate-y-0.5 transition-all duration-200 group">
      <span className={`w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 ${tones[tone]} group-hover:scale-105 transition-transform`}><Ic n={icon} /></span>
      <div className="min-w-0">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-ink-400">{tt(label)}</div>
        <div className="font-display text-[22px] leading-7 font-bold tnum truncate">{count ? display : `${prefix}${value.toLocaleString("en-US")}${money ? ` ${money}` : ""}`}</div>
        {sub && <div className="text-[12px] text-ink-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

/* ---------- modal / confirm / drawer ---------- */
export function Modal({ open, onClose, title, children, w = "max-w-lg", footer }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; w?: string; footer?: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink-950/55 backdrop-blur-[2px] fade-in" onClick={onClose} />
      <div className={`relative w-full ${w} panel pop-in rounded-b-none sm:rounded-xl max-h-[92vh] flex flex-col shadow-pop`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100 dark:border-ink-800">
          <h3 className="font-display font-bold text-[17px]">{title}</h3>
          <button className="btn-g !px-2" onClick={onClose} aria-label="Close"><Ic n="x" /></button>
        </div>
        <div className="px-5 py-4 overflow-y-auto">{children}</div>
        {footer && <div className="px-5 py-3.5 border-t border-ink-100 dark:border-ink-800 flex justify-end gap-2 bg-ink-50/50 dark:bg-ink-950/40 rounded-b-xl">{footer}</div>}
      </div>
    </div>
  );
}
export function Confirm({ open, onClose, onYes, title, body, yes = "Delete" }: { open: boolean; onClose: () => void; onYes: () => void; title: string; body: string; yes?: string }) {
  const tt = useT();
  return (
    <Modal open={open} onClose={onClose} title={title} w="max-w-sm"
      footer={<><button className="btn-o btn-sm" onClick={onClose}>{tt("Cancel")}</button><button className="btn-d btn-sm" onClick={() => { onYes(); onClose(); }}>{tt(yes)}</button></>}>
      <div className="flex gap-3">
        <span className="w-9 h-9 rounded-lg bg-rose-100 dark:bg-rose-500/15 text-rose-600 flex items-center justify-center shrink-0"><Ic n="alert" /></span>
        <p className="text-sm text-ink-500 dark:text-ink-300">{body}</p>
      </div>
    </Modal>
  );
}

/* ---------- form bits ---------- */
export const Field = ({ label, children, err }: { label: string; children: ReactNode; err?: string }) => (
  <div><label className="label">{label}</label>{children}{err && <p className="text-[12px] text-rose-600 mt-1 font-semibold">{err}</p>}</div>
);
export function Tabs({ tabs, active, onChange }: { tabs: { id: string; label: string; icon?: string; badge?: number }[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="flex gap-1 overflow-x-auto p-1 rounded-xl bg-ink-100/70 dark:bg-ink-900 border border-ink-100 dark:border-ink-800 w-fit max-w-full">
      {tabs.map((tb) => (
        <button key={tb.id} onClick={() => onChange(tb.id)}
          className={`flex items-center gap-1.5 px-3.5 h-9 rounded-lg text-[13px] font-bold whitespace-nowrap transition-all cursor-pointer ${active === tb.id ? "bg-white dark:bg-ink-700 text-ink-900 dark:text-white shadow-panel" : "text-ink-500 hover:text-ink-800 dark:hover:text-ink-200"}`}>
          {tb.icon && <Ic n={tb.icon} size={15} />}{tb.label}{tb.badge !== undefined && <span className="chip bg-cobalt-600 text-white !py-0 !px-1.5">{tb.badge}</span>}
        </button>
      ))}
    </div>
  );
}
export function Pagination({ page, pages, onPage, total, shown }: { page: number; pages: number; onPage: (p: number) => void; total: number; shown: number }) {
  const tt = useT();
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 text-[13px] text-ink-400">
      <span>{tt("Showing")} <b className="text-ink-700 dark:text-ink-200">{shown}</b> {tt("of")} <b className="text-ink-700 dark:text-ink-200">{total.toLocaleString()}</b></span>
      <div className="flex items-center gap-1">
        <button className="btn-g btn-sm !px-2" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous"><Ic n="chevL" size={15} /></button>
        {Array.from({ length: Math.min(5, pages) }, (_, i) => {
          const p = pages <= 5 ? i + 1 : Math.min(Math.max(page - 2, 1), pages - 4) + i;
          return <button key={p} onClick={() => onPage(p)} className={`w-8 h-8 rounded-lg text-[13px] font-bold transition-colors cursor-pointer ${p === page ? "bg-cobalt-600 text-white" : "hover:bg-ink-100 dark:hover:bg-ink-800"}`}>{p}</button>;
        })}
        <button className="btn-g btn-sm !px-2" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Next"><Ic n="chevR" size={15} /></button>
      </div>
    </div>
  );
}
export function Empty({ icon = "folder", title, body, action }: { icon?: string; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <span className="w-14 h-14 rounded-2xl bg-ink-100 dark:bg-ink-800 text-ink-400 flex items-center justify-center mb-3"><Ic n={icon} size={26} /></span>
      <h4 className="font-display font-bold text-[16px]">{title}</h4>
      {body && <p className="text-[13px] text-ink-400 max-w-xs mt-1">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ---------- charts ---------- */
export function AreaChart({ data, labels, h = 120, color = "#1e49c9", id = "ar" }: { data: number[]; labels?: string[]; h?: number; color?: string; id?: string }) {
  const m = useMounted();
  const W = 300; const max = Math.max(...data, 1);
  const pts = data.map((v, i) => [8 + (i * (W - 16)) / Math.max(1, data.length - 1), 8 + (1 - v / max) * (h - 20)]);
  const path = pts.map((p, i) => (i ? `L${p[0].toFixed(1)},${p[1].toFixed(1)}` : `M${p[0].toFixed(1)},${p[1].toFixed(1)}`)).join(" ");
  const area = `${path} L${pts[pts.length - 1][0]},${h - 4} L${pts[0][0]},${h - 4} Z`;
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${h}`} className="w-full" style={{ height: h }} preserveAspectRatio="none" role="img" aria-label="chart">
        <defs><linearGradient id={`g-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.28" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
        {[0.25, 0.5, 0.75].map((f) => <line key={f} x1="8" x2={W - 8} y1={8 + f * (h - 20)} y2={8 + f * (h - 20)} stroke="currentColor" className="text-ink-100 dark:text-ink-800" strokeWidth="1" strokeDasharray="3 4" />)}
        <path d={area} fill={`url(#g-${id})`} className="fade-in" style={{ opacity: m ? 1 : 0, transition: "opacity .8s .3s" }} />
        <path d={path} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" className="line-anim" />
        {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="white" stroke={color} strokeWidth="2" className="fade-in" style={{ opacity: m ? 1 : 0, transition: `opacity .3s ${0.2 + i * 0.05}s` }}><title>{labels?.[i]}: {data[i].toLocaleString()}</title></circle>)}
      </svg>
      {labels && <div className="flex justify-between px-1 mt-1 text-[10px] font-bold uppercase tracking-wide text-ink-300">{labels.map((l, i) => <span key={i}>{l}</span>)}</div>}
    </div>
  );
}
export function DuoBars({ data, aLabel, bLabel, aColor = "#1e49c9", bColor = "#dca638", money }: { data: { label: string; a: number; b: number }[]; aLabel: string; bLabel: string; aColor?: string; bColor?: string; money?: string }) {
  const m = useMounted();
  const max = Math.max(...data.map((d) => Math.max(d.a, d.b)), 1);
  return (
    <div>
      <div className="flex items-end gap-2 h-[130px]">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <div className="flex items-end gap-[3px] w-full h-[110px] justify-center">
              <div className="w-[38%] max-w-[16px] rounded-t-[3px] bar-anim" title={`${aLabel}: ${d.a.toLocaleString()}${money ? " " + money : ""}`} style={{ height: m ? `${(d.a / max) * 100}%` : 0, background: aColor, animationDelay: `${i * 40}ms` }} />
              <div className="w-[38%] max-w-[16px] rounded-t-[3px] bar-anim" title={`${bLabel}: ${d.b.toLocaleString()}${money ? " " + money : ""}`} style={{ height: m ? `${(d.b / max) * 100}%` : 0, background: bColor, animationDelay: `${i * 40 + 60}ms` }} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wide text-ink-300 truncate">{d.label}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-3 text-[11.5px] font-semibold text-ink-400">
        <span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-[3px]" style={{ background: aColor }} />{aLabel}</span>
        <span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-[3px]" style={{ background: bColor }} />{bLabel}</span>
      </div>
    </div>
  );
}
export function Donut({ segments, size = 130, label, sub }: { segments: { value: number; color: string; name: string }[]; size?: number; label: string; sub?: string }) {
  const total = Math.max(1, segments.reduce((a, b) => a + b.value, 0));
  const r = 42; const C = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" width={size} height={size} className="-rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" strokeWidth="11" className="stroke-ink-100 dark:stroke-ink-800" />
          {segments.map((s, i) => {
            const len = (s.value / total) * (C - 8); const off = -acc; acc += len + 8 / segments.length * 0;
            const frac = s.value / total; const gap = 8;
            return <circle key={i} cx="50" cy="50" r={r} fill="none" stroke={s.color} strokeWidth="11" strokeLinecap="round"
              strokeDasharray={`${Math.max(0, frac * C - gap)} ${C}`} strokeDashoffset={off - (acc - len - 0) * 0} className="donut-anim" style={{ transition: "stroke-dasharray .8s" }} />;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold text-[19px] leading-none tnum">{label}</span>
          {sub && <span className="text-[10px] font-bold uppercase tracking-wide text-ink-400 mt-0.5">{sub}</span>}
        </div>
      </div>
      <div className="space-y-1.5 min-w-0">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-[12px]">
            <i className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-ink-500 dark:text-ink-300 truncate">{s.name}</span>
            <b className="tnum ml-auto">{Math.round((s.value / total) * 100)}%</b>
          </div>
        ))}
      </div>
    </div>
  );
}
export function Ring({ value, size = 84, color = "#1e49c9", label }: { value: number; size?: number; color?: string; label?: string }) {
  const m = useMounted();
  const r = 40; const C = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0 inline-flex" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} className="-rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="10" className="stroke-ink-100 dark:stroke-ink-800" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={m ? C * (1 - value / 100) : C} style={{ transition: "stroke-dashoffset 1s cubic-bezier(.3,.6,.3,1)" }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-display font-bold tnum" style={{ fontSize: size * 0.22 }}>{label ?? `${value}%`}</div>
    </div>
  );
}
export function HBars({ rows, money }: { rows: { label: string; value: number; color?: string }[]; money?: string }) {
  const m = useMounted();
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="space-y-2.5">
      {rows.map((r, i) => (
        <div key={i}>
          <div className="flex justify-between text-[12px] mb-1"><span className="font-semibold text-ink-500 dark:text-ink-300 truncate">{r.label}</span><b className="tnum">{r.value.toLocaleString()}{money ? ` ${money}` : ""}</b></div>
          <div className="h-2 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
            <div className="h-full rounded-full barx-anim" style={{ width: m ? `${(r.value / max) * 100}%` : 0, background: r.color ?? "#1e49c9", animationDelay: `${i * 60}ms` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- print ---------- */
export function PrintPortal({ children }: { children: ReactNode }) {
  const el = document.getElementById("print-sheet");
  if (!el) return null;
  return createPortal(<div className="bg-white text-ink-900 print:text-black">{children}</div>, el);
}

/* On-demand printing: renders a document into #print-sheet, prints, then clears. */
let printJob: ReactNode | null = null;
const printSubs = new Set<() => void>();
export const printNow = (node: ReactNode) => {
  printJob = node;
  printSubs.forEach((f) => f());
  setTimeout(() => window.print(), 160);
};
export function PrintHost() {
  const [job, setJob] = useState<ReactNode | null>(null);
  useEffect(() => {
    const f = () => setJob(printJob);
    printSubs.add(f);
    const clear = () => setTimeout(() => { printJob = null; setJob(null); }, 400);
    window.addEventListener("afterprint", clear);
    return () => { printSubs.delete(f); window.removeEventListener("afterprint", clear); };
  }, []);
  const el = document.getElementById("print-sheet");
  if (!el || !job) return null;
  return createPortal(<div className="bg-white text-ink-900 print:text-black">{job}</div>, el);
}

/* ---------- toasts ---------- */
export type ToastMsg = { id: string; kind: "ok" | "err" | "info"; text: string };
const tsubs = new Set<(t: ToastMsg) => void>();
export const toast = (text: string, kind: ToastMsg["kind"] = "ok") => { const t = { id: Math.random().toString(36).slice(2), kind, text }; tsubs.forEach((f) => f(t)); };
export function Toaster() {
  const [list, setList] = useState<ToastMsg[]>([]);
  useEffect(() => {
    const f = (t: ToastMsg) => { setList((l) => [...l, t]); setTimeout(() => setList((l) => l.filter((x) => x.id !== t.id)), 3800); };
    tsubs.add(f); return () => { tsubs.delete(f); };
  }, []);
  const ic = { ok: "check", err: "alert", info: "info" } as const;
  const col = { ok: "bg-emerald-500", err: "bg-rose-500", info: "bg-cobalt-600" } as const;
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none" role="status" aria-live="polite">
      {list.map((t) => (
        <div key={t.id} className="toast-in flex items-center gap-3 rounded-xl border border-ink-100 dark:border-ink-700 bg-white dark:bg-ink-900 px-4 py-3 shadow-lift max-w-[360px]">
          <span className={`w-6 h-6 rounded-full text-white flex items-center justify-center shrink-0 ${col[t.kind]}`}><Ic n={ic[t.kind]} size={13} sw={2.6} /></span>
          <p className="text-[13.5px] font-semibold">{t.text}</p>
        </div>
      ))}
    </div>
  );
}
