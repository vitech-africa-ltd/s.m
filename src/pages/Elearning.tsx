import { useState } from "react";
import { useApp, mutate, uid, todayISO } from "../lib/data";
import { Ic } from "../components/icons";
import { Stat, Chip, Modal, Field, toast } from "../components/ui";
import { useT } from "../lib/i18n";

export default function ElearningPage() {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"courses" | "live" | "assignments">("courses");

  // Demo courses data
  const courses = [
    { id: "math-s6", title: "Mathematics S6", description: "Advanced calculus, algebra, and geometry", lessons: 12, progress: 75, icon: "grades", teacher: "Mr. Okello", category: "Mathematics" },
    { id: "physics-s5", title: "Physics S5", description: "Mechanics, thermodynamics, and electromagnetism", lessons: 10, progress: 45, icon: "subject", teacher: "Ms. Mwangi", category: "Sciences" },
    { id: "cs", title: "Computer Science", description: "Programming fundamentals and algorithms", lessons: 8, progress: 90, icon: "subject", teacher: "Mr. Dusabe", category: "ICT" },
    { id: "english", title: "English Grammar", description: "Advanced grammar and composition", lessons: 15, progress: 60, icon: "book", teacher: "Ms. Harper", category: "Languages" },
    { id: "biology", title: "Biology S4", description: "Cell biology, genetics, and ecology", lessons: 11, progress: 30, icon: "subject", teacher: "Ms. Nakato", category: "Sciences" },
    { id: "entrepreneurship", title: "Entrepreneurship", description: "Business planning and innovation", lessons: 9, progress: 55, icon: "coins", teacher: "Mr. Murenzi", category: "Business" },
  ];

  const liveClasses = [
    { id: "live1", title: "Advanced Mathematics", teacher: "Mr. Okello", time: "Today 14:00", status: "live", students: 32, duration: "60 min" },
    { id: "live2", title: "Physics Lab Session", teacher: "Ms. Mwangi", time: "Tomorrow 10:00", status: "upcoming", students: 28, duration: "90 min" },
    { id: "live3", title: "English Literature", teacher: "Ms. Harper", time: "Wed 15:30", status: "upcoming", students: 35, duration: "45 min" },
    { id: "live4", title: "Computer Science Workshop", teacher: "Mr. Dusabe", time: "Thu 09:00", status: "upcoming", students: 25, duration: "120 min" },
  ];

  const assignments = [
    { id: "assign1", title: "Calculus Problem Set", course: "Mathematics S6", dueDate: "2026-02-15", status: "pending", points: 100 },
    { id: "assign2", title: "Physics Lab Report", course: "Physics S5", dueDate: "2026-02-12", status: "submitted", points: 50 },
    { id: "assign3", title: "Programming Assignment", course: "Computer Science", dueDate: "2026-02-18", status: "pending", points: 75 },
    { id: "assign4", title: "Essay Writing", course: "English Grammar", dueDate: "2026-02-10", status: "graded", points: 60, score: 55 },
  ];

  const handleJoinLive = (title: string) => {
    toast(`Joining live class: ${title}`);
    window.open("https://meet.jit.si/VITECH-" + encodeURIComponent(title), "_blank");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-[26px] sm:text-[30px] font-bold tracking-tight">{tt("E-Learning")}</h1>
          <p className="text-ink-400 text-[13px] mt-1">{tt("Learning Management System")}</p>
        </div>
        <button className="btn-p btn-sm" onClick={() => setShowCreateCourse(true)}>
          <Ic n="plus" size={15} />{tt("Create course")}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        <Stat label="Courses" value={courses.length} icon="learn" />
        <Stat label="Lessons" value={courses.reduce((a, c) => a + c.lessons, 0)} icon="book" tone="blue" />
        <Stat label="Live classes" value={liveClasses.filter(l => l.status === "live").length} icon="live" tone="red" />
        <Stat label="Assignments" value={assignments.filter(a => a.status === "pending").length} icon="exams" tone="gold" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto p-1 rounded-xl bg-ink-100/70 dark:bg-ink-900 border border-ink-100 dark:border-ink-800 w-fit max-w-full mb-5">
        {[
          { id: "courses", label: "My Courses", icon: "learn" },
          { id: "live", label: "Live Classes", icon: "live" },
          { id: "assignments", label: "Assignments", icon: "exams" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-3.5 h-9 rounded-lg text-[13px] font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id 
                ? "bg-white dark:bg-ink-700 text-ink-900 dark:text-white shadow-panel" 
                : "text-ink-500 hover:text-ink-800 dark:hover:text-ink-200"
            }`}
          >
            <Ic n={tab.icon} size={15} />{tt(tab.label)}
          </button>
        ))}
      </div>

      {/* Courses Tab */}
      {activeTab === "courses" && (
        <div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <div key={course.id} className="panel p-5 hover:shadow-lift hover:-translate-y-0.5 transition-all cursor-pointer" onClick={() => setSelectedCourse(course)}>
                <div className="flex items-start justify-between mb-3">
                  <span className="w-11 h-11 rounded-xl bg-cobalt-50 dark:bg-cobalt-500/15 text-cobalt-600 dark:text-cobalt-300 flex items-center justify-center">
                    <Ic n={course.icon} size={20} />
                  </span>
                  <Chip tone={course.progress >= 75 ? "green" : course.progress >= 50 ? "gold" : "blue"}>
                    {course.progress}%
                  </Chip>
                </div>
                <h3 className="font-display font-bold text-[16px] mb-1">{course.title}</h3>
                <p className="text-[12px] text-ink-400 mb-2">{course.description}</p>
                <div className="flex items-center gap-2 text-[11px] text-ink-400 mb-3">
                  <Ic n="teacher" size={12} />
                  <span>{course.teacher}</span>
                  <span className="ml-auto">
                    <Chip tone="gray" className="!text-[9px]">{course.category}</Chip>
                  </span>
                </div>
                <div className="flex items-center justify-between text-[12px] mb-2">
                  <span className="text-ink-400">{course.lessons} lessons</span>
                  <span className="font-bold">{course.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden mb-3">
                  <div className="h-full bg-cobalt-500" style={{ width: `${course.progress}%` }} />
                </div>
                <button className="btn-o btn-sm w-full">
                  {tt("Continue")}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Classes Tab */}
      {activeTab === "live" && (
        <div className="space-y-3">
          {liveClasses.map((live) => (
            <div key={live.id} className="panel p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-cobalt-50 dark:bg-cobalt-500/15 text-cobalt-600 dark:text-cobalt-300 flex items-center justify-center shrink-0">
                <Ic n="video" size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-[16px]">{live.title}</h3>
                <div className="flex items-center gap-3 text-[12px] text-ink-400 mt-1">
                  <span className="flex items-center gap-1"><Ic n="teacher" size={12} />{live.teacher}</span>
                  <span className="flex items-center gap-1"><Ic n="clock" size={12} />{live.time}</span>
                  <span className="flex items-center gap-1"><Ic n="students" size={12} />{live.students} students</span>
                  <span className="flex items-center gap-1"><Ic n="attendance" size={12} />{live.duration}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Chip tone={live.status === "live" ? "red" : "blue"}>
                  {live.status === "live" ? (
                    <><span className="w-2 h-2 rounded-full bg-white tick-pulse" />LIVE</>
                  ) : "Upcoming"}
                </Chip>
                {live.status === "live" && (
                  <button 
                    className="btn-p btn-sm"
                    onClick={() => handleJoinLive(live.title)}
                  >
                    <Ic n="video" size={14} />{tt("Join")}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assignments Tab */}
      {activeTab === "assignments" && (
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>{tt("Title")}</th>
                  <th>{tt("Course")}</th>
                  <th>{tt("Due date")}</th>
                  <th>{tt("Points")}</th>
                  <th>{tt("Status")}</th>
                  <th>{tt("Actions")}</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assign) => (
                  <tr key={assign.id}>
                    <td className="font-bold">{assign.title}</td>
                    <td className="text-[12.5px]">{assign.course}</td>
                    <td className="text-[12px]">{assign.dueDate}</td>
                    <td className="tnum font-bold">{assign.points}</td>
                    <td>
                      <Chip tone={assign.status === "pending" ? "gold" : assign.status === "submitted" ? "blue" : "green"}>
                        {assign.status}
                      </Chip>
                    </td>
                    <td>
                      {assign.status === "pending" && (
                        <button className="btn-o btn-sm" onClick={() => toast("Assignment submission opened")}>
                          <Ic n="upload" size={14} />{tt("Submit")}
                        </button>
                      )}
                      {assign.status === "graded" && (
                        <span className="font-bold text-emerald-600">{assign.score}/{assign.points}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Course Detail Modal */}
      {selectedCourse && (
        <Modal open={!!selectedCourse} onClose={() => setSelectedCourse(null)} title={selectedCourse.title} w="max-w-2xl">
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <span className="w-16 h-16 rounded-xl bg-cobalt-50 dark:bg-cobalt-500/15 text-cobalt-600 dark:text-cobalt-300 flex items-center justify-center">
                <Ic n={selectedCourse.icon} size={28} />
              </span>
              <div className="flex-1">
                <h3 className="font-display font-bold text-[18px]">{selectedCourse.title}</h3>
                <p className="text-[13px] text-ink-400">{selectedCourse.description}</p>
                <div className="flex items-center gap-3 text-[12px] text-ink-400 mt-2">
                  <span className="flex items-center gap-1"><Ic n="teacher" size={12} />{selectedCourse.teacher}</span>
                  <span className="flex items-center gap-1"><Ic n="book" size={12} />{selectedCourse.lessons} lessons</span>
                  <Chip tone="gray" className="!text-[10px]">{selectedCourse.category}</Chip>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-display font-bold text-[15px] mb-3">{tt("Course content")}</h4>
              <div className="space-y-2">
                {Array.from({ length: selectedCourse.lessons }, (_, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-ink-100 dark:border-ink-800 p-3">
                    <div className="w-8 h-8 rounded-lg bg-ink-100 dark:bg-ink-800 flex items-center justify-center text-[12px] font-bold">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-[13px]">Lesson {i + 1}</div>
                      <div className="text-[11px] text-ink-400">Duration: 45 min</div>
                    </div>
                    {i < Math.floor(selectedCourse.lessons * selectedCourse.progress / 100) ? (
                      <Chip tone="green"><Ic n="check" size={12} />{tt("Completed")}</Chip>
                    ) : (
                      <button className="btn-o btn-sm">{tt("Start")}</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Course Modal */}
      <Modal open={showCreateCourse} onClose={() => setShowCreateCourse(false)} title={tt("Create new course")} w="max-w-md">
        <div className="space-y-4">
          <Field label={tt("Course title")}>
            <input type="text" className="input" placeholder="e.g. Advanced Mathematics" />
          </Field>
          <Field label={tt("Description")}>
            <textarea className="input" rows={3} placeholder="Course description..." />
          </Field>
          <Field label={tt("Category")}>
            <select className="input">
              <option>Mathematics</option>
              <option>Sciences</option>
              <option>ICT</option>
              <option>Languages</option>
              <option>Business</option>
            </select>
          </Field>
          <button className="btn-p w-full" onClick={() => { setShowCreateCourse(false); toast("Course created successfully"); }}>
            <Ic n="check" size={15} />{tt("Create course")}
          </button>
        </div>
      </Modal>
    </div>
  );
}
