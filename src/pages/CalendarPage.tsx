import { useState } from "react";
import { useApp, mutate, uid, todayISO, fmtDate } from "../lib/data";
import { Ic } from "../components/icons";
import { Stat, Chip, Modal, Field, toast } from "../components/ui";
import { useT } from "../lib/i18n";

export default function CalendarPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: "", date: "", kind: "event" as "exam" | "holiday" | "meeting" | "sports" | "event" | "graduation", note: "" });

  const createEvent = () => {
    if (!formData.title || !formData.date) {
      toast("Please fill required fields", "err");
      return;
    }
    mutate((db) => {
      db.events.unshift({
        id: uid(),
        ...formData,
      });
    });
    toast("Event created successfully");
    setShowModal(false);
    setFormData({ title: "", date: "", kind: "event", note: "" });
  };

  const deleteEvent = (id: string) => {
    if (confirm("Are you sure?")) {
      mutate((db) => { db.events = db.events.filter(e => e.id !== id); });
      toast("Event deleted");
    }
  };

  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("School Calendar")}</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <Stat label="Upcoming events" value={db.events.filter(e => e.date >= todayISO()).length} icon="calendar" />
        <Stat label="Exams" value={db.events.filter(e => e.kind === "exam").length} icon="exams" tone="red" />
        <Stat label="Holidays" value={db.events.filter(e => e.kind === "holiday").length} icon="star" tone="green" />
        <Stat label="Meetings" value={db.events.filter(e => e.kind === "meeting").length} icon="comm" tone="blue" />
      </div>

      <div className="panel overflow-hidden">
        <div className="panel-h">
          <h2 className="font-display font-bold text-[18px]">{tt("Upcoming events")}</h2>
          <button className="btn-p btn-sm" onClick={() => setShowModal(true)}>
            <Ic n="plus" size={15} />{tt("Add event")}
          </button>
        </div>
        <div className="p-5 space-y-3">
          {db.events
            .filter(e => e.date >= todayISO())
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(0, 10)
            .map((ev) => (
              <div key={ev.id} className="flex items-center gap-4 rounded-xl border border-ink-100 dark:border-ink-800 p-4">
                <div className="w-14 h-14 rounded-xl bg-cobalt-50 dark:bg-cobalt-500/15 text-cobalt-600 dark:text-cobalt-300 flex flex-col items-center justify-center shrink-0">
                  <div className="font-display font-bold text-[18px] leading-none">{ev.date.slice(8, 10)}</div>
                  <div className="text-[10px] font-bold uppercase mt-0.5">{new Date(ev.date).toLocaleDateString("en", { month: "short" })}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-[15px]">{ev.title}</h3>
                  {ev.note && <p className="text-[12px] text-ink-400 mt-0.5">{ev.note}</p>}
                </div>
                <Chip tone={ev.kind === "exam" ? "red" : ev.kind === "holiday" ? "green" : ev.kind === "meeting" ? "blue" : ev.kind === "sports" ? "gold" : "gray"}>
                  {ev.kind}
                </Chip>
                <button className="btn-g btn-sm !text-rose-500" onClick={() => deleteEvent(ev.id)}>
                  <Ic n="trash" size={14} />
                </button>
              </div>
            ))}
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={tt("Add event")} w="max-w-md">
        <div className="space-y-4">
          <Field label={tt("Event title")}>
            <input type="text" className="input" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          </Field>
          <Field label={tt("Date")}>
            <input type="date" className="input" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
          </Field>
          <Field label={tt("Event type")}>
            <select className="input" value={formData.kind} onChange={(e) => setFormData({ ...formData, kind: e.target.value as any })}>
              <option value="event">Event</option>
              <option value="exam">Exam</option>
              <option value="holiday">Holiday</option>
              <option value="meeting">Meeting</option>
              <option value="sports">Sports</option>
              <option value="graduation">Graduation</option>
            </select>
          </Field>
          <Field label={tt("Note (optional)")}>
            <textarea className="input" rows={3} value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} />
          </Field>
          <button className="btn-p w-full" onClick={createEvent}>
            <Ic n="check" size={15} />{tt("Add event")}
          </button>
        </div>
      </Modal>
    </div>
  );
}
