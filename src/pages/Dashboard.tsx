export default function Dashboard({ nav }: { nav: (to: string) => void }) {
  return (
    <div>
      <h1 className="font-display text-[26px] sm:text-[30px] font-bold tracking-tight mb-5">Dashboard</h1>
      <div className="panel p-6">
        <p className="text-ink-400">Welcome to VITECH School Management System</p>
        <button className="btn-p mt-4" onClick={() => nav("/app/students")}>Go to Students</button>
      </div>
    </div>
  );
}
