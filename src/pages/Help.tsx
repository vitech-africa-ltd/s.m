import { Ic } from "../components/icons";
import { useT } from "../lib/i18n";

export default function HelpPage() {
  const tt = useT();
  
  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("Help & Support")}</h1>
      
      <div className="grid md:grid-cols-2 gap-4 mb-5">
        <div className="panel p-6">
          <div className="w-12 h-12 rounded-xl bg-cobalt-50 dark:bg-cobalt-500/15 text-cobalt-600 dark:text-cobalt-300 flex items-center justify-center mb-3">
            <Ic n="help" size={24} />
          </div>
          <h2 className="font-display font-bold text-[18px] mb-2">{tt("Documentation")}</h2>
          <p className="text-ink-400 text-[13px] mb-4">{tt("Read our documentation to learn more about this error.")}</p>
          <button className="btn-o btn-sm">{tt("View docs")}</button>
        </div>
        
        <div className="panel p-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mb-3">
            <Ic n="comm" size={24} />
          </div>
          <h2 className="font-display font-bold text-[18px] mb-2">{tt("Contact Support")}</h2>
          <p className="text-ink-400 text-[13px] mb-4">{tt("Get help from our support team")}</p>
          <button className="btn-p btn-sm">{tt("Contact us")}</button>
        </div>
      </div>
      
      <div className="panel p-6">
        <h2 className="font-display font-bold text-[18px] mb-4">{tt("Frequently Asked Questions")}</h2>
        <div className="space-y-3">
          {[
            { q: "How do I add a new student?", a: "Go to Students → Add student and fill in the required information." },
            { q: "How do I record a payment?", a: "Go to Payments → Record payment and select the student." },
            { q: "How do I generate report cards?", a: "Go to Report cards, select the exam and class, then click Print." },
            { q: "How do I change the school settings?", a: "Go to Settings and update your school information." },
          ].map((faq, i) => (
            <div key={i} className="rounded-lg border border-ink-100 dark:border-ink-800 p-4">
              <h3 className="font-bold text-[14px] mb-2">{faq.q}</h3>
              <p className="text-[13px] text-ink-500 dark:text-ink-300">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
