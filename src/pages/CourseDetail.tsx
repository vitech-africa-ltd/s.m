import { useState } from "react";
import { useApp, me } from "../lib/data";
import { Ic } from "../components/icons";
import { Chip, Avatar } from "../components/ui";
import { useT } from "../lib/i18n";

interface Course {
  id: string;
  title: string;
  description: string;
  teacher: string;
  lessons: Lesson[];
  progress: number;
}

interface Lesson {
  id: string;
  title: string;
  type: "video" | "reading" | "quiz";
  duration: string;
  completed: boolean;
}

export default function CourseDetailPage({ courseId, nav }: { courseId: string; nav: (to: string) => void }) {
  const s = useApp();
  const tt = useT();
  const db = s.db;
  const user = me(s);

  // Demo course data
  const courses: Course[] = [
    {
      id: "math-s6",
      title: "Advanced Mathematics S6",
      description: "Master advanced mathematical concepts including calculus, algebra, and geometry.",
      teacher: "Mr. Okello",
      progress: 75,
      lessons: [
        { id: "1", title: "Introduction to Calculus", type: "video", duration: "45 min", completed: true },
        { id: "2", title: "Derivatives and Applications", type: "video", duration: "60 min", completed: true },
        { id: "3", title: "Integration Techniques", type: "reading", duration: "30 min", completed: true },
        { id: "4", title: "Calculus Quiz", type: "quiz", duration: "20 min", completed: false },
        { id: "5", title: "Advanced Algebra", type: "video", duration: "55 min", completed: false },
      ],
    },
    {
      id: "physics-s5",
      title: "Physics S5",
      description: "Explore mechanics, thermodynamics, and electromagnetic theory.",
      teacher: "Ms. Mwangi",
      progress: 45,
      lessons: [
        { id: "1", title: "Newton's Laws of Motion", type: "video", duration: "50 min", completed: true },
        { id: "2", title: "Work and Energy", type: "video", duration: "45 min", completed: true },
        { id: "3", title: "Thermodynamics Basics", type: "reading", duration: "25 min", completed: false },
        { id: "4", title: "Physics Quiz 1", type: "quiz", duration: "15 min", completed: false },
      ],
    },
  ];

  const course = courses.find(c => c.id === courseId) || courses[0];
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video": return "video";
      case "reading": return "book";
      case "quiz": return "exams";
      default: return "book";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "video": return "blue";
      case "reading": return "green";
      case "quiz": return "gold";
      default: return "gray";
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <button className="btn-o btn-sm mb-4" onClick={() => nav("/app/elearning")}>
        <Ic n="chevL" size={15} />{tt("Back to courses")}
      </button>

      {/* Course header */}
      <div className="panel p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="font-display text-[28px] font-bold mb-2">{course.title}</h1>
            <p className="text-ink-400 text-[14px] mb-3">{course.description}</p>
            <div className="flex items-center gap-3">
              <Avatar first={course.teacher.split(" ")[0]} last={course.teacher.split(" ")[1] || ""} hue={200} size={36} />
              <div>
                <p className="text-[13px] font-semibold">{course.teacher}</p>
                <p className="text-[11px] text-ink-400">{tt("Instructor")}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-display text-[32px] font-bold text-cobalt-600">{course.progress}%</div>
            <p className="text-[12px] text-ink-400">{tt("Complete")}</p>
          </div>
        </div>
        <div className="h-3 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cobalt-500 to-cobalt-600" style={{ width: `${course.progress}%` }} />
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-6">
        {/* Lessons list */}
        <div className="panel">
          <div className="panel-h">
            <h2 className="font-display font-bold text-[18px]">{tt("Course content")}</h2>
            <Chip tone="blue">{course.lessons.length} {tt("lessons")}</Chip>
          </div>
          <div className="divide-y divide-ink-100 dark:divide-ink-800">
            {course.lessons.map((lesson, idx) => (
              <button
                key={lesson.id}
                onClick={() => setActiveLesson(lesson)}
                className={`w-full p-4 flex items-center gap-4 hover:bg-ink-50 dark:hover:bg-ink-900 transition-colors text-left ${
                  activeLesson?.id === lesson.id ? "bg-cobalt-50 dark:bg-cobalt-500/10" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-ink-100 dark:bg-ink-800 flex items-center justify-center shrink-0">
                  {lesson.completed ? (
                    <Ic n="check" size={20} className="text-emerald-500" />
                  ) : (
                    <span className="font-bold text-[14px] text-ink-400">{idx + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[14px] mb-1">{lesson.title}</h3>
                  <div className="flex items-center gap-3 text-[12px] text-ink-400">
                    <Chip tone={getTypeColor(lesson.type) as any}>
                      <Ic n={getTypeIcon(lesson.type)} size={12} />
                      {lesson.type}
                    </Chip>
                    <span>{lesson.duration}</span>
                  </div>
                </div>
                {activeLesson?.id === lesson.id && (
                  <Ic n="play" size={20} className="text-cobalt-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Lesson content area */}
        <div className="panel">
          {activeLesson ? (
            <div className="p-6">
              <div className="mb-4">
                <Chip tone={getTypeColor(activeLesson.type) as any} className="mb-2">
                  <Ic n={getTypeIcon(activeLesson.type)} size={12} />
                  {activeLesson.type}
                </Chip>
                <h2 className="font-display font-bold text-[20px] mb-2">{activeLesson.title}</h2>
                <p className="text-[13px] text-ink-400">{tt("Duration")}: {activeLesson.duration}</p>
              </div>

              {activeLesson.type === "video" && (
                <div className="aspect-video bg-ink-900 rounded-xl flex items-center justify-center mb-4">
                  <div className="text-center text-white">
                    <Ic n="play" size={48} className="mx-auto mb-2" />
                    <p className="text-[14px]">{tt("Video player")}</p>
                  </div>
                </div>
              )}

              {activeLesson.type === "reading" && (
                <div className="prose dark:prose-invert max-w-none mb-4">
                  <div className="bg-ink-50 dark:bg-ink-950/60 rounded-xl p-6">
                    <h3 className="font-bold text-[16px] mb-3">{activeLesson.title}</h3>
                    <p className="text-[14px] leading-relaxed text-ink-600 dark:text-ink-300">
                      This is the reading content for {activeLesson.title}. In a real application, 
                      this would contain the full lesson material with text, images, and interactive elements.
                    </p>
                  </div>
                </div>
              )}

              {activeLesson.type === "quiz" && (
                <div className="bg-cobalt-50 dark:bg-cobalt-500/10 rounded-xl p-6 mb-4">
                  <h3 className="font-bold text-[16px] mb-3">{tt("Quiz time!")}</h3>
                  <p className="text-[14px] text-ink-600 dark:text-ink-300 mb-4">
                    {tt("Test your knowledge with this interactive quiz.")}
                  </p>
                  <button className="btn-p w-full">
                    <Ic n="exams" size={16} />
                    {tt("Start quiz")}
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                {!activeLesson.completed && (
                  <button className="btn-p flex-1">
                    <Ic n="check" size={16} />
                    {tt("Mark as complete")}
                  </button>
                )}
                <button className="btn-o flex-1">
                  {tt("Next lesson")}
                  <Ic n="chevR" size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 flex items-center justify-center h-full text-ink-400">
              <div className="text-center">
                <Ic n="book" size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-[14px]">{tt("Select a lesson to start")}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
