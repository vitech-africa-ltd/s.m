import { useState } from "react";
import { useApp, mutate, uid, todayISO, fmtDate } from "../lib/data";
import { Ic } from "../components/icons";
import { Stat, Chip, Modal, Field, toast } from "../components/ui";
import { useT } from "../lib/i18n";

export default function CommunicationPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ channel: "SMS" as "SMS" | "WhatsApp" | "Email", to: "", body: "" });

  const sendMessage = () => {
    if (!formData.to || !formData.body) {
      toast("Please fill all fields", "err");
      return;
    }
    mutate((db) => {
      db.commLogs.unshift({
        id: uid(),
        ...formData,
        date: todayISO(),
        status: "sent",
      });
    });
    toast("Message sent successfully");
    setShowModal(false);
    setFormData({ channel: "SMS", to: "", body: "" });
  };

  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("Communication Center")}</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <Stat label="SMS sent" value={db.commLogs.filter(l => l.channel === "SMS").length} icon="sms" tone="gold" />
        <Stat label="WhatsApp" value={db.commLogs.filter(l => l.channel === "WhatsApp").length} icon="comm" tone="green" />
        <Stat label="Emails" value={db.commLogs.filter(l => l.channel === "Email").length} icon="email" tone="blue" />
        <Stat label="Templates" value={db.templates.length} icon="file" />
      </div>

      <div className="panel overflow-hidden">
        <div className="panel-h">
          <h2 className="font-display font-bold text-[18px]">{tt("Communication logs")}</h2>
          <button className="btn-p btn-sm" onClick={() => setShowModal(true)}>
            <Ic n="plus" size={15} />{tt("Send message")}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>{tt("Channel")}</th>
                <th>{tt("To")}</th>
                <th>{tt("Message")}</th>
                <th>{tt("Status")}</th>
                <th>{tt("Date")}</th>
              </tr>
            </thead>
            <tbody>
              {db.commLogs.slice(0, 20).map((log) => (
                <tr key={log.id}>
                  <td>
                    <Chip tone={log.channel === "SMS" ? "gold" : log.channel === "WhatsApp" ? "green" : "blue"}>
                      {log.channel}
                    </Chip>
                  </td>
                  <td className="text-[12.5px]">{log.to}</td>
                  <td className="text-[12px] max-w-[300px] truncate">{log.body}</td>
                  <td>
                    <Chip tone={log.status === "sent" ? "green" : log.status === "failed" ? "red" : "gold"}>
                      {log.status}
                    </Chip>
                  </td>
                  <td className="text-[12px] text-ink-400">{fmtDate(log.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={tt("Send message")} w="max-w-md">
        <div className="space-y-4">
          <Field label={tt("Channel")}>
            <select className="input" value={formData.channel} onChange={(e) => setFormData({ ...formData, channel: e.target.value as any })}>
              <option value="SMS">SMS</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Email">Email</option>
            </select>
          </Field>
          <Field label={tt("Recipient")}>
            <input type="text" className="input" value={formData.to} onChange={(e) => setFormData({ ...formData, to: e.target.value })} placeholder="Phone number or email" />
          </Field>
          <Field label={tt("Message")}>
            <textarea className="input" rows={5} value={formData.body} onChange={(e) => setFormData({ ...formData, body: e.target.value })} />
          </Field>
          <button className="btn-p w-full" onClick={sendMessage}>
            <Ic n="send" size={15} />{tt("Send message")}
          </button>
        </div>
      </Modal>
    </div>
  );
}

export function AnnouncementsPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: "", body: "", audience: "All" });

  const createAnnouncement = () => {
    if (!formData.title || !formData.body) {
      toast("Please fill all fields", "err");
      return;
    }
    mutate((db) => {
      db.announcements.unshift({
        id: uid(),
        ...formData,
        date: todayISO(),
        by: "Admin",
      });
    });
    toast("Announcement created");
    setShowModal(false);
    setFormData({ title: "", body: "", audience: "All" });
  };

  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("Announcements")}</h1>

      <div className="panel overflow-hidden">
        <div className="panel-h">
          <h2 className="font-display font-bold text-[18px]">{tt("All announcements")}</h2>
          <button className="btn-p btn-sm" onClick={() => setShowModal(true)}>
            <Ic n="plus" size={15} />{tt("Create announcement")}
          </button>
        </div>
        <div className="p-5 space-y-4">
          {db.announcements.map((ann) => (
            <div key={ann.id} className={`rounded-xl border-2 p-4 ${ann.pinned ? "border-gold-400 bg-gold-50 dark:bg-gold-500/10" : "border-ink-100 dark:border-ink-800"}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-[14px]">{ann.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Chip tone="blue">{ann.audience}</Chip>
                    <span className="text-[11px] text-ink-400">{fmtDate(ann.date)} · {ann.by}</span>
                  </div>
                </div>
                {ann.pinned && <Ic n="star" size={18} className="text-gold-500" />}
              </div>
              <p className="text-[13px] text-ink-500 dark:text-ink-300">{ann.body}</p>
            </div>
          ))}
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={tt("Create announcement")} w="max-w-md">
        <div className="space-y-4">
          <Field label={tt("Title")}>
            <input type="text" className="input" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          </Field>
          <Field label={tt("Audience")}>
            <select className="input" value={formData.audience} onChange={(e) => setFormData({ ...formData, audience: e.target.value })}>
              <option>All</option>
              <option>Students</option>
              <option>Teachers</option>
              <option>Parents</option>
            </select>
          </Field>
          <Field label={tt("Message")}>
            <textarea className="input" rows={5} value={formData.body} onChange={(e) => setFormData({ ...formData, body: e.target.value })} />
          </Field>
          <button className="btn-p w-full" onClick={createAnnouncement}>
            <Ic n="megaphone" size={15} />{tt("Create announcement")}
          </button>
        </div>
      </Modal>
    </div>
  );
}
