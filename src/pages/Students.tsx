export default function StudentsPage({ nav, query }: { nav: (to: string) => void; query: string }) {
  return <div><h1 className="font-display text-[26px] font-bold mb-5">Students</h1><div className="panel p-6">Students management page</div></div>;
}
export function AdmissionsPage() {
  return <div><h1 className="font-display text-[26px] font-bold mb-5">Admissions</h1><div className="panel p-6">Admissions pipeline</div></div>;
}
