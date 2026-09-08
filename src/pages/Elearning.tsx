import { Ic } from "../components/icons";
import { Stat, Chip, toast } from "../components/ui";
import { useT } from "../lib/i18n";

export default function ElearningPage({ nav }: { nav: (to: string) => void }) {
  const tt = useT();
  
  const courses = [
    { id: "math-s6", title: "Mathematics S6", lessons: 12, progress: 75, icon: "grades" },
    { id: "physics-s5", title: "Physics S5", lessons: 10, progress: 45, icon: "subject" },
    { id: "cs", title: "Computer Science", lessons: 8, progress: 90, icon: "subject" },
    { id: "english", title: "English Grammar", lessons: 15, progress: 60, icon: "book" },
    { id: "biology", title: "Biology S4", lessons: 11, progress: 30, icon: "subject" },
    { id: "entrepreneurship", title: "Entrepreneurship", lessons: 9, progress: 55, icon: "coins" },
  ];
  
  const handleContinue = (courseId: string) => {
    nav(`/app/course?id=${courseId}`);
  };
  
  const handleJoinLive = (title: string) => {
    toast(`Joining live class: ${title}`);
    // Ici vous pouvez ouvrir une fenêtre de visioconférence
    window.open("https://meet.jit.si/VITECH-" + encodeURIComponent(title), "_blank");
  };
  
  return (
    <div>
      <h1 className="font-display text-[26px] font-bold mb-5">{tt("E-Learning")}</h1>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <Stat label="Courses" value={courses.length} icon="learn" />
        <Stat label="Lessons" value={courses.reduce((a, c) => a + c.lessons, 0)} icon="book" tone="blue" />
        <Stat label="Quizzes" value={12} icon="exams" tone="gold" />
        <Stat label="Live classes" value={3} icon="live" tone="green" />
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <div key={course.id} className="panel p-5 hover:shadow-lift hover:-translate-y-0.5 transition-all">
            <div className="flex items-start justify-between mb-3">
              <span className="w-11 h-11 rounded-xl bg-cobalt-50 dark:bg-cobalt-500/15 text-cobalt-600 dark:text-cobalt-300 flex items-center justify-center">
                <Ic n={course.icon} size={20} />
              </span>
              <Chip tone={course.progress >= 75 ? "green" : course.progress >= 50 ? "gold" : "blue"}>
                {course.progress}%
              </Chip>
            </div>
            <h3 className="font-display font-bold text-[16px] mb-1">{course.title}</h3>
            <p className="text-[12px] text-ink-400 mb-3">{course.lessons} lessons</p>
            <div className="h-2 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
              <div className="h-full bg-cobalt-500" style={{ width: `${course.progress}%` }} />
            </div>
            <button 
              className="btn-o btn-sm w-full mt-3"
              onClick={() => handleContinue(course.id)}
            >
              {tt("Continue")}
            </button>
          </div>
        ))}
      </div>
      
      <div className="panel p-6 mt-5">
        <h2 className="font-display font-bold text-[18px] mb-4">{tt("Live classes")}</h2>
        <div className="space-y-3">
          {[
            { title: "Advanced Mathematics", teacher: "Mr. Okello", time: "Today 14:00", status: "live" },
            { title: "Physics Lab Session", teacher: "Ms. Mwangi", time: "Tomorrow 10:00", status: "upcoming" },
            { title: "English Literature", teacher: "Ms. Harper", time: "Wed 15:30", status: "upcoming" },
          ].map((live, i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl border border-ink-100 dark:border-ink-800 p-4">
              <div className="w-12 h-12 rounded-xl bg-cobalt-50 dark:bg-cobalt-500/15 text-cobalt-600 dark:text-cobalt-300 flex items-center justify-center shrink-0">
                <Ic n="video" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-[15px]">{live.title}</h3>
                <p className="text-[12px] text-ink-400">{live.teacher} · {live.time}</p>
              </div>
              <Chip tone={live.status === "live" ? "red" : "blue"}>
                {live.status === "live" ? "LIVE" : "Upcoming"}
              </Chip>
              {live.status === "live" && (
                <button 
                  className="btn-p btn-sm"
                  onClick={() => handleJoinLive(live.title)}
                >
                  {tt("Join")}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
