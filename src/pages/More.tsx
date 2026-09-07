export function LibraryPage() {
  return <div><h1 className="font-display text-[26px] font-bold mb-5">Library</h1><div className="panel p-6">Library management</div></div>;
}
export function TransportPage() {
  return <div><h1 className="font-display text-[26px] font-bold mb-5">Transport</h1><div className="panel p-6">Transport management</div></div>;
}
export function HRPage() {
  return <div><h1 className="font-display text-[26px] font-bold mb-5">HR & Staff</h1><div className="panel p-6">HR management</div></div>;
}
export function DocumentsPage() {
  return <div><h1 className="font-display text-[26px] font-bold mb-5">Documents</h1><div className="panel p-6">Documents management</div></div>;
}
export function CertificatesPage() {
  return <div><h1 className="font-display text-[26px] font-bold mb-5">Certificates</h1><div className="panel p-6">Certificates management</div></div>;
}
export function VerifyPage({ nav }: { nav: (to: string) => void }) {
  return <div><h1 className="font-display text-[26px] font-bold mb-5">Verify Certificate</h1><div className="panel p-6">Certificate verification</div></div>;
}
export function IDCardsPage() {
  return <div><h1 className="font-display text-[26px] font-bold mb-5">ID Cards</h1><div className="panel p-6">ID cards management</div></div>;
}
export function AuditPage() {
  return <div><h1 className="font-display text-[26px] font-bold mb-5">Audit Logs</h1><div className="panel p-6">Audit logs</div></div>;
}
export function BackupsPage() {
  return <div><h1 className="font-display text-[26px] font-bold mb-5">Backups</h1><div className="panel p-6">Backup management</div></div>;
}
export function AnalyticsPage() {
  return <div><h1 className="font-display text-[26px] font-bold mb-5">Analytics</h1><div className="panel p-6">Analytics dashboard</div></div>;
}
export function PlatformPage() {
  return <div><h1 className="font-display text-[26px] font-bold mb-5">Platform (SaaS)</h1><div className="panel p-6">Platform management</div></div>;
}
