import { useState } from "react";
import { useApp, me, mutate, setPrefs } from "../lib/data";
import { Ic } from "../components/icons";
import { Avatar, Field, Chip } from "../components/ui";
import { useT, LANGS } from "../lib/i18n";

export default function ProfilePage() {
  const s = useApp();
  const tt = useT();
  const user = me(s);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  if (!user) return null;

  const saveProfile = () => {
    mutate((db) => {
      const u = db.users.find(x => x.id === user.id);
      if (u) {
        u.name = name;
        u.email = email;
      }
    });
    setEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="font-display text-[28px] font-bold mb-6">{tt("My Profile")}</h1>

      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        {/* Profile card */}
        <div className="panel p-6 text-center">
          <Avatar first={user.name.split(" ")[0]} last={user.name.split(" ")[1] || ""} hue={user.hue} size={120} />
          <h2 className="font-display font-bold text-[22px] mt-4 mb-1">{user.name}</h2>
          <p className="text-ink-400 text-[13px] mb-3">{user.email}</p>
          <Chip tone="blue" className="mb-4">{user.role}</Chip>
          
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2 text-[13px]">
              <Ic n="shield" size={16} className="text-emerald-500" />
              <span>{user.twoFA ? tt("2FA enabled") : tt("2FA disabled")}</span>
            </div>
            <div className="flex items-center gap-2 text-[13px]">
              <Ic n="clock" size={16} className="text-cobalt-500" />
              <span>{tt("Member since")} 2025</span>
            </div>
          </div>
        </div>

        {/* Profile details */}
        <div className="space-y-6">
          {/* Personal info */}
          <div className="panel p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-[18px]">{tt("Personal Information")}</h2>
              <button 
                className="btn-o btn-sm" 
                onClick={() => editing ? saveProfile() : setEditing(true)}
              >
                <Ic n={editing ? "check" : "pencil"} size={14} />
                {editing ? tt("Save") : tt("Edit")}
              </button>
            </div>
            
            <div className="space-y-4">
              <Field label={tt("Full name")}>
                <input 
                  className="input" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  disabled={!editing}
                />
              </Field>
              <Field label={tt("Email")}>
                <input 
                  className="input" 
                  type="email"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!editing}
                />
              </Field>
              <Field label={tt("Role")}>
                <input className="input" value={user.role} disabled />
              </Field>
            </div>
          </div>

          {/* Preferences */}
          <div className="panel p-6">
            <h2 className="font-display font-bold text-[18px] mb-4">{tt("Preferences")}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="label">{tt("Language")}</label>
                <select 
                  className="input" 
                  value={s.prefs.lang} 
                  onChange={(e) => setPrefs({ lang: e.target.value as any })}
                >
                  {LANGS.map(l => (
                    <option key={l.code} value={l.code}>{l.native}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">{tt("Theme")}</label>
                <div className="flex gap-2">
                  <button 
                    className={`btn-o flex-1 ${s.prefs.theme === "light" ? "!border-cobalt-500 !text-cobalt-600" : ""}`}
                    onClick={() => setPrefs({ theme: "light" })}
                  >
                    <Ic n="sun" size={16} />
                    {tt("Light")}
                  </button>
                  <button 
                    className={`btn-o flex-1 ${s.prefs.theme === "dark" ? "!border-cobalt-500 !text-cobalt-600" : ""}`}
                    onClick={() => setPrefs({ theme: "dark" })}
                  >
                    <Ic n="moon" size={16} />
                    {tt("Dark")}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="panel p-6">
            <h2 className="font-display font-bold text-[18px] mb-4">{tt("Security")}</h2>
            
            <div className="space-y-3">
              <button className="btn-o w-full">
                <Ic n="shield" size={16} />
                {user.twoFA ? tt("Disable 2FA") : tt("Enable 2FA")}
              </button>
              <button className="btn-o w-full">
                <Ic n="pencil" size={16} />
                {tt("Change password")}
              </button>
              <button className="btn-o w-full">
                <Ic n="email" size={16} />
                {tt("Update email")}
              </button>
            </div>
          </div>

          {/* Activity */}
          <div className="panel p-6">
            <h2 className="font-display font-bold text-[18px] mb-4">{tt("Recent Activity")}</h2>
            
            <div className="space-y-3">
              {s.db.audits.filter(a => a.user === user.name).slice(0, 5).map(a => (
                <div key={a.id} className="flex items-start gap-3 text-[13px]">
                  <Ic n="check" size={16} className="text-emerald-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">{a.action}</p>
                    <p className="text-ink-400 text-[12px]">{a.detail}</p>
                    <p className="text-ink-300 text-[11px] mt-0.5">{a.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
