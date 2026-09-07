export function StudentPortal({ nav }: { nav: (to: string) => void }) {
  return <div><h1 className="font-display text-[26px] font-bold mb-5">Student Portal</h1><div className="panel p-6">Student portal</div></div>;
}
export function ParentPortal() {
  return <div><h1 className="font-display text-[26px] font-bold mb-5">Parent Portal</h1><div className="panel p-6">Parent portal</div></div>;
}
export function TeacherPortal({ nav }: { nav: (to: string) => void }) {
  return <div><h1 className="font-display text-[26px] font-bold mb-5">Teacher Portal</h1><div className="panel p-6">Teacher portal</div></div>;
}
