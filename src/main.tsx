import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowDownUp,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCheck,
  ChevronRight,
  Clock3,
  Code2,
  Coffee,
  Copy,
  DoorOpen,
  GraduationCap,
  HelpCircle,
  LayoutGrid,
  List,
  LogOut,
  MessageCircle,
  Pause,
  Play,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import type { Room, Student } from "./queue";
import {
  changeStatus,
  createRoom,
  demoRoom,
  joinRoom,
  waitingStudents,
} from "./queue";
import "./styles.css";
import "./avatars.css";
import { AvatarBuilder, PixelAvatar } from "./Character";
import { defaultAvatar, normalizeAvatar, sampleAvatar } from "./avatar";
import type { Avatar } from "./avatar";
import { WaitingTable } from "./WaitingTable";

const STORAGE = "table-rooms-v1";
const COLORS = ["sage", "peach", "lilac", "sand"];
function readRooms(): Room[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE) || "null");
    if (
      Array.isArray(saved) &&
      saved.length &&
      saved.every(
        (r) =>
          typeof r.code === "string" &&
          Array.isArray(r.topics) &&
          Array.isArray(r.students),
      )
    )
      return saved.map((r: Room) => ({
        ...r,
        students: r.students.map((s, index) => ({
          ...s,
          avatar: s.avatar
            ? normalizeAvatar(s.avatar)
            : r.code === "TA4BLE" && /^[1-7]$/.test(s.id)
              ? sampleAvatar(index)
              : normalizeAvatar(),
        })),
      }));
  } catch {
    /* A fresh demo also works when storage is unavailable. */
  }
  return [demoRoom()];
}
function PixelPlant({ small = false }: { small?: boolean }) {
  return (
    <svg
      className={small ? "pixel-plant small" : "pixel-plant"}
      viewBox="0 0 80 96"
      aria-hidden="true"
      shapeRendering="crispEdges"
    >
      <path
        fill="#658e58"
        d="M36 44V20h8v24h8V28h16v16H52v12H44v12H36V52H20V36H8V20h16v16h12z"
      />
      <path fill="#95ad74" d="M36 8h8v20h-8zM52 20h16v8H52zM8 12h16v8H8z" />
      <path fill="#b26c4f" d="M20 64h40v8H20zm8 8h24v24H28z" />
      <path fill="#d9926d" d="M24 64h28v8H24zm8 8h8v20h-8z" />
      <path fill="#7c503b" d="M28 92h24v4H28z" />
    </svg>
  );
}
function Classroom() {
  return (
    <div className="classroom" aria-hidden="true">
      <svg viewBox="0 0 420 180" shapeRendering="crispEdges">
        <path fill="#bdd0b1" d="M170 10h186v126H170z" />
        <path fill="#f8efce" d="M178 18h170v110H178z" />
        <path
          fill="#a8c6b2"
          d="M186 26h72v44h-72zm82 0h72v44h-72zm-82 54h72v40h-72zm82 0h72v40h-72z"
        />
        <path
          fill="#e7e7c7"
          d="M198 46h20v-8h24v8h10v12h-54zm78 46h18v-8h24v8h16v12h-58z"
        />
        <path fill="#476447" d="M40 62h88v64H40z" />
        <path fill="#92a36c" d="M48 70h72v48H48z" />
        <path fill="#e9e0b0" d="M58 82h36v4H58zm0 12h50v4H58zm0 12h25v4H58z" />
        <path
          fill="#af7b50"
          d="M22 132h365v12H22zm18 12h12v36H40zm310 0h12v36h-12z"
        />
        <path fill="#d9ae76" d="M22 128h365v8H22z" />
        <path fill="#786d58" d="M145 98h62v6h-62zm-4 6h70v28h-70z" />
        <path fill="#344d43" d="M151 104h50v22h-50z" />
        <path fill="#c8d4a7" d="M161 110h20v3h-20zm0 7h30v3h-30z" />
        <path fill="#dfbd79" d="M228 109h29v21h-29zm29 4h8v13h-8z" />
        <path fill="#f4e8c5" d="M229 99h5v-12h-5zm13 0h5V83h-5z" />
        <path
          fill="#789255"
          d="M313 101V73h8v28h8V81h16v16h-16v12h-16zm-16-8h16v8h-16V85h-8V69h16v16h-8z"
        />
        <path fill="#b77855" d="M302 109h36v7h-36zm6 7h24v16h-24z" />
        <path fill="#d0ad70" d="M91 122h37v6H91z" />
        <path fill="#a8b891" d="M96 116h37v6H96z" />
      </svg>
    </div>
  );
}
function App() {
  const [rooms, setRooms] = useState<Room[]>(readRooms);
  const [activeCode, setActiveCode] = useState(() => rooms[0].code);
  const [view, setView] = useState<"instructor" | "student">("instructor");
  const [grouped, setGrouped] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"room" | "settings" | "about" | null>(
    null,
  );
  const [toast, setToast] = useState("");
  const [now, setNow] = useState(Date.now());
  const [joinCode, setJoinCode] = useState("");
  const [joined, setJoined] = useState<{ code: string; id: string } | null>(
    null,
  );
  const [studentRoom, setStudentRoom] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [avatar, setAvatar] = useState<Avatar>({ ...defaultAvatar });
  const room = rooms.find((r) => r.code === activeCode) || rooms[0];
  const waiting = waitingStudents(room);
  const helping = room.students.filter((s) => s.status === "helping");
  const done = room.students.filter((s) => s.status === "done");
  const shown = waiting.filter(
    (s) =>
      (filter === "all" || s.topicId === filter) &&
      `${s.name} ${s.question}`.toLowerCase().includes(search.toLowerCase()),
  );
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE, JSON.stringify(rooms));
    } catch {
      setToast(
        "Browser storage is unavailable. Changes will last until you close this page.",
      );
    }
  }, [rooms]);
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE) setRooms(readRooms());
    };
    window.addEventListener("storage", onStorage);
    const timer = window.setInterval(() => setNow(Date.now()), 15000);
    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(timer);
    };
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (modal) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [modal]);
  function updateRoom(update: (r: Room) => Room, code = room.code) {
    setRooms((previous) =>
      previous.map((r) => (r.code === code ? update(r) : r)),
    );
  }
  function status(ids: string[], next: Student["status"]) {
    updateRoom((r) => changeStatus(r, ids, next));
    setToast(
      next === "helping"
        ? "You’re up! Students have been called to the table."
        : "All set. Another question figured out.",
    );
  }
  async function copyCode() {
    try {
      await navigator.clipboard.writeText(room.code);
      setToast("Room code copied. Share it with your students.");
    } catch {
      setToast(`Your room code is ${room.code}`);
    }
  }
  const minutes = (time: number) =>
    `${Math.max(0, Math.floor((now - time) / 60000))} min`;
  function studentCard(s: Student, index: number) {
    const topic = room.topics.find((t) => t.id === s.topicId);
    return (
      <article className="queue-row" key={s.id}>
        <span className="position">{String(index + 1).padStart(2, "0")}</span>
        <div className={`avatar character-badge ${topic?.color || "sage"}`}>
          <PixelAvatar avatar={s.avatar} label={`${s.name}’s character`} />
        </div>
        <div className="student-info">
          <strong>{s.name}</strong>
          <p>{s.question || "No extra details — ready to talk it through."}</p>
        </div>
        <span className={`tag ${topic?.color}`}>
          {topic?.name || "Archived topic"}
        </span>
        <span className="wait-time">
          <Clock3 size={14} />
          {minutes(s.joinedAt)}
        </span>
        <button
          className="help-button"
          onClick={() => status([s.id], "helping")}
        >
          Help <ArrowRight size={16} />
        </button>
      </article>
    );
  }
  const selectedStudentRoom = rooms.find((r) => r.code === studentRoom);
  const joinedRoom = rooms.find((r) => r.code === joined?.code);
  const currentStudent = joinedRoom?.students.find((s) => s.id === joined?.id);
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setView("instructor");
          }}
          aria-label="Table home"
        >
          <img src="/table.svg" alt="" />
          <span>
            <b>TA</b>ble<span className="brand-dot">.</span>
          </span>
        </a>
        <div className="workspace-label">YOUR TEACHING SPACE</div>
        <button
          className={`nav-item ${view === "instructor" ? "active" : ""}`}
          onClick={() => setView("instructor")}
        >
          <LayoutGrid size={19} /> My room <span className="nav-dot" />
        </button>
        <button
          className={`nav-item ${view === "student" ? "active" : ""}`}
          onClick={() => {
            setView("student");
            setError("");
          }}
        >
          <GraduationCap size={20} /> Student view{" "}
          <ArrowRight className="nav-arrow" size={15} />
        </button>
        <div className="sidebar-divider" />
        <div className="workspace-label">
          YOUR ROOMS{" "}
          <button aria-label="Create a room" onClick={() => setModal("room")}>
            <Plus size={16} />
          </button>
        </div>
        <div className="room-list">
          {rooms.map((r) => (
            <button
              key={r.code}
              className={r.code === activeCode ? "selected-room" : ""}
              onClick={() => {
                setActiveCode(r.code);
                setFilter("all");
                setView("instructor");
              }}
            >
              <span className={`little-square ${r.open ? "" : "muted"}`} />
              <span>{r.course}</span>
            </button>
          ))}
        </div>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <PixelPlant small />
            <p>
              Good questions.
              <br />
              Better together.
            </p>
            <span>Pull up a chair.</span>
          </div>
          <button className="nav-item" onClick={() => setModal("about")}>
            <HelpCircle size={18} /> A little help
          </button>
          <div className="profile">
            <div className="profile-avatar">TA</div>
            <div>
              <strong>Your teaching space</strong>
              <span>Instructor · Local demo</span>
            </div>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <ChevronRight size={14} />
            <strong>
              {view === "instructor" ? "My room" : "Student view"}
            </strong>
          </div>
          <div className="top-actions">
            <span className="demo-label">
              <span /> Interactive prototype
            </span>
            <button
              className="button primary small-button"
              onClick={() => setModal("room")}
            >
              <Plus size={16} /> Create room
            </button>
          </div>
        </header>
        {view === "instructor" ? (
          <main className="dashboard">
            <div className="page-title">
              <div>
                <div className="eyebrow">
                  <span className="status-dot" /> YOUR ROOM, AT A GLANCE
                </div>
                <h1>
                  Room for a little help<span>.</span>
                </h1>
                <p>
                  A place for every question. A little order to the office
                  hours.
                </p>
              </div>
              <button
                className="button neutral"
                onClick={() => setModal("settings")}
              >
                <Settings2 size={16} /> Room settings
              </button>
            </div>
            <section className="welcome-banner">
              <div className="welcome-copy">
                <span className="course-label">
                  <Coffee size={15} />
                  {room.course}
                </span>
                <h2>{room.title}</h2>
                <p>Grab a seat. We’ll take it one question at a time.</p>
                <span className="banner-status">
                  <span className={`status-dot ${room.open ? "" : "paused"}`} />
                  {room.open
                    ? "Room is open for students"
                    : "Room is paused for new arrivals"}
                </span>
              </div>
              <Classroom />
              <div className="join-code-card">
                <span>COME ON IN. ROOM CODE</span>
                <button
                  onClick={copyCode}
                  aria-label={`Copy room code ${room.code}`}
                >
                  <strong>{room.code}</strong>
                  <Copy size={17} />
                </button>
                <div>Share the code. Find your people.</div>
              </div>
            </section>
            <section className="stats">
              <div className="stat">
                <div className="stat-icon sage">
                  <Users size={21} />
                </div>
                <div>
                  <span>In the queue</span>
                  <strong>
                    {waiting.length.toString().padStart(2, "0")}
                    <small>students waiting</small>
                  </strong>
                </div>
                <span className="stat-decoration">···</span>
              </div>
              <div className="stat">
                <div className="stat-icon peach">
                  <MessageCircle size={21} />
                </div>
                <div>
                  <span>At the table</span>
                  <strong>
                    {helping.length.toString().padStart(2, "0")}
                    <small>getting help now</small>
                  </strong>
                </div>
              </div>
              <div className="stat">
                <div className="stat-icon lilac">
                  <CheckCheck size={21} />
                </div>
                <div>
                  <span>All figured out</span>
                  <strong>
                    {done.length.toString().padStart(2, "0")}
                    <small>students helped</small>
                  </strong>
                </div>
              </div>
            </section>
            <WaitingTable
              key={room.code}
              students={waiting}
              topics={room.topics}
              onHelp={(id) => status([id], "helping")}
            />
            <div className="content-grid">
              <section className="queue-panel">
                <div className="section-heading">
                  <div>
                    <h2>
                      The help queue{" "}
                      <span className="count-badge">{waiting.length}</span>
                    </h2>
                    <p>First here, first helped. Just as it should be.</p>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => updateRoom((r) => ({ ...r, open: !r.open }))}
                  >
                    {room.open ? <Pause size={15} /> : <Play size={15} />}{" "}
                    {room.open ? "Pause queue" : "Open queue"}
                  </button>
                </div>
                <div className="queue-toolbar">
                  <div className="view-toggle">
                    <button
                      className={!grouped ? "selected" : ""}
                      onClick={() => setGrouped(false)}
                    >
                      <List size={16} /> By arrival
                    </button>
                    <button
                      className={grouped ? "selected" : ""}
                      onClick={() => setGrouped(true)}
                    >
                      <LayoutGrid size={15} /> By topic
                    </button>
                  </div>
                  <label className="search-box">
                    <Search size={16} />
                    <input
                      aria-label="Search the queue"
                      placeholder="Find a student…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </label>
                </div>
                <div className="topic-filters">
                  <button
                    className={filter === "all" ? "selected" : ""}
                    onClick={() => setFilter("all")}
                  >
                    All questions <span>{waiting.length}</span>
                  </button>
                  {room.topics.map((t) => (
                    <button
                      key={t.id}
                      className={filter === t.id ? "selected" : ""}
                      onClick={() => setFilter(t.id)}
                    >
                      <span className={`topic-dot ${t.color}`} />
                      {t.name}
                    </button>
                  ))}
                </div>
                <div className="queue-column-labels">
                  <span>STUDENT & QUESTION</span>
                  <span>
                    <ArrowDownUp size={12} /> ARRIVAL ORDER
                  </span>
                </div>
                <div className="queue-list">
                  {shown.length === 0 ? (
                    <div className="empty-state">
                      <Coffee size={30} />
                      <h3>
                        {waiting.length
                          ? "No matching questions"
                          : "A little breathing room."}
                      </h3>
                      <p>
                        {waiting.length
                          ? "Try another name or topic."
                          : "Share your room code to welcome the first student."}
                      </p>
                    </div>
                  ) : grouped ? (
                    room.topics.map((t) => {
                      const students = shown.filter((s) => s.topicId === t.id);
                      return students.length ? (
                        <div className="topic-group" key={t.id}>
                          <div className={`group-heading ${t.color}`}>
                            <strong>
                              {t.name} <span>· {students.length}</span>
                            </strong>
                            <button
                              onClick={() =>
                                status(
                                  students.map((s) => s.id),
                                  "helping",
                                )
                              }
                            >
                              Help group <ArrowRight size={14} />
                            </button>
                          </div>
                          {students.map((s) =>
                            studentCard(
                              s,
                              waiting.findIndex((w) => w.id === s.id),
                            ),
                          )}
                        </div>
                      ) : null;
                    })
                  ) : (
                    shown.map((s) =>
                      studentCard(
                        s,
                        waiting.findIndex((w) => w.id === s.id),
                      ),
                    )
                  )}
                </div>
                <div className="queue-footer">
                  <span>
                    <span className="status-dot" />{" "}
                    {room.open
                      ? "Ready for new questions"
                      : "New arrivals paused"}
                  </span>
                  <span>Every question has a place here.</span>
                </div>
              </section>
              <aside className="right-column">
                <section className="table-panel">
                  <div className="section-heading">
                    <h2>At the table</h2>
                    <span className="count-badge peach">{helping.length}</span>
                  </div>
                  <p className="section-subtitle">
                    A little guidance goes a long way.
                  </p>
                  {helping.length ? (
                    helping.map((s) => (
                      <div className="helping-card" key={s.id}>
                        <div className="helping-person">
                          <div className="avatar character-badge sand">
                            <PixelAvatar
                              avatar={s.avatar}
                              label={`${s.name}’s character`}
                            />
                          </div>
                          <div>
                            <strong>{s.name}</strong>
                            <span>
                              {
                                room.topics.find((t) => t.id === s.topicId)
                                  ?.name
                              }
                            </span>
                          </div>
                          <span className="helping-dot" />
                        </div>
                        <p>
                          {s.question || "Ready to work through a question."}
                        </p>
                        <button
                          className="button complete-button"
                          onClick={() => status([s.id], "done")}
                        >
                          <Check size={16} /> Mark as helped
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="table-empty">
                      <Coffee size={26} />
                      <p>
                        Your table is ready.
                        <br />
                        Invite the next student over.
                      </p>
                      {waiting.length > 0 && (
                        <button
                          className="button neutral"
                          onClick={() => status([waiting[0].id], "helping")}
                        >
                          Help next <ArrowRight size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </section>
                <section className="topics-panel">
                  <div className="section-heading">
                    <h2>What brings you in?</h2>
                    <button
                      aria-label="Edit help topics"
                      onClick={() => setModal("settings")}
                    >
                      <Settings2 size={17} />
                    </button>
                  </div>
                  <p className="section-subtitle">
                    Your room’s question topics.
                  </p>
                  <div className="topic-summary">
                    {room.topics.map((t, i) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setFilter(t.id);
                          setGrouped(true);
                        }}
                      >
                        <span className={`topic-icon ${t.color}`}>
                          {i % 3 === 0 ? (
                            <Sparkles size={15} />
                          ) : i % 3 === 1 ? (
                            <Code2 size={15} />
                          ) : (
                            <MessageCircle size={15} />
                          )}
                        </span>
                        <span>{t.name}</span>
                        <b>
                          {waiting.filter((s) => s.topicId === t.id).length}
                        </b>
                      </button>
                    ))}
                  </div>
                  <button
                    className="add-topic"
                    onClick={() => setModal("settings")}
                  >
                    <Plus size={15} /> Customize topics
                  </button>
                </section>
                <div className="little-note">
                  <span>✦</span>
                  <p>
                    Same question? Same table.
                    <br />
                    <span>Group by topic to learn together.</span>
                  </p>
                </div>
              </aside>
            </div>
            <footer className="page-footer">
              <span className="mini-brand">TAble.</span>
              <span>Less waiting around. More figuring it out.</span>
              <span>
                Made for the moments when it clicks <Sparkles size={13} />
              </span>
            </footer>
          </main>
        ) : (
          <main className="student-page">
            <div className="eyebrow">PULL UP A CHAIR</div>
            <h1>
              A good place to get unstuck<span>.</span>
            </h1>
            <p className="student-intro">
              A question, a little help, and you’re on your way.
            </p>
            <div className="student-layout">
              <div className="student-form-panel">
                {currentStudent && joinedRoom ? (
                  <div className="ticket">
                    <div className="ticket-character">
                      <PixelAvatar
                        avatar={currentStudent.avatar}
                        label="Your character"
                      />
                    </div>
                    <span className="eyebrow">{joinedRoom.course}</span>
                    <h2>
                      {currentStudent.status === "done"
                        ? "You’re all set!"
                        : currentStudent.status === "helping"
                          ? "Your seat is ready!"
                          : "You’re in the queue."}
                    </h2>
                    <p>
                      {currentStudent.status === "done"
                        ? "Here’s to that lightbulb moment. Keep going."
                        : currentStudent.status === "helping"
                          ? "Your instructor has called you over. Come to the table."
                          : `Thanks, ${currentStudent.name.split(" ")[0]}. We’ll keep your place.`}
                    </p>
                    {currentStudent.status === "waiting" && (
                      <div className="ticket-position">
                        <strong>
                          #
                          {waitingStudents(joinedRoom).findIndex(
                            (s) => s.id === currentStudent.id,
                          ) + 1}
                        </strong>
                        <span>your place in line</span>
                      </div>
                    )}
                    <div className="ticket-topic">
                      {
                        joinedRoom.topics.find(
                          (t) => t.id === currentStudent.topicId,
                        )?.name
                      }
                    </div>
                    <button
                      className="button neutral"
                      onClick={() => {
                        if (currentStudent.status !== "done")
                          updateRoom(
                            (r) => ({
                              ...r,
                              students: r.students.filter(
                                (s) => s.id !== currentStudent.id,
                              ),
                            }),
                            joinedRoom.code,
                          );
                        setJoined(null);
                        setStudentRoom(null);
                        setError("");
                      }}
                    >
                      {currentStudent.status === "done" ? (
                        <ArrowLeft size={16} />
                      ) : (
                        <LogOut size={16} />
                      )}{" "}
                      {currentStudent.status === "done"
                        ? "Back to join"
                        : "Leave queue"}
                    </button>
                  </div>
                ) : selectedStudentRoom ? (
                  <form
                    key={selectedStudentRoom.code}
                    onSubmit={(e) => {
                      e.preventDefault();
                      const data = new FormData(e.currentTarget);
                      const s: Student = {
                        id: crypto.randomUUID(),
                        name: String(data.get("name") || ""),
                        topicId: String(data.get("topic") || ""),
                        question: String(data.get("question") || "").trim(),
                        joinedAt: Date.now(),
                        status: "waiting",
                        avatar: { ...avatar },
                      };
                      try {
                        const latest = rooms.find(
                          (r) => r.code === selectedStudentRoom.code,
                        )!;
                        const next = joinRoom(latest, s);
                        updateRoom(() => next, next.code);
                        setJoined({ code: next.code, id: s.id });
                        setError("");
                      } catch (err) {
                        setError((err as Error).message);
                      }
                    }}
                  >
                    <button
                      type="button"
                      className="text-button back-button"
                      onClick={() => {
                        setStudentRoom(null);
                        setError("");
                      }}
                    >
                      <ArrowLeft size={15} /> Change room
                    </button>
                    <span className="room-chip">
                      ROOM {selectedStudentRoom.code}
                    </span>
                    <h2>{selectedStudentRoom.course}</h2>
                    <label>
                      Your name
                      <input
                        name="name"
                        required
                        maxLength={60}
                        placeholder="What should we call you?"
                        autoComplete="name"
                      />
                    </label>
                    <AvatarBuilder value={avatar} onChange={setAvatar} />
                    <fieldset>
                      <legend>What brings you in?</legend>
                      <div className="student-topic-options">
                        {selectedStudentRoom.topics.map((t) => (
                          <label key={t.id} className={t.color}>
                            <input
                              type="radio"
                              name="topic"
                              value={t.id}
                              required
                            />
                            <span>{t.name}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <label>
                      A little more context{" "}
                      <span className="optional">(optional)</span>
                      <textarea
                        name="question"
                        maxLength={300}
                        rows={3}
                        placeholder="Where are you getting stuck?"
                      />
                    </label>
                    {error && (
                      <p role="alert" className="form-error">
                        {error}
                      </p>
                    )}
                    {!selectedStudentRoom.open && (
                      <p className="form-error">
                        This room is paused. Check back in a moment.
                      </p>
                    )}
                    <button
                      className="button primary full-button"
                      disabled={!selectedStudentRoom.open}
                    >
                      Take a seat <ArrowRight size={17} />
                    </button>
                  </form>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const found = rooms.find(
                        (r) => r.code === joinCode.trim().toUpperCase(),
                      );
                      if (!found) {
                        setError(
                          "We couldn’t find that room in this browser. Check the code and try again.",
                        );
                        return;
                      }
                      setStudentRoom(found.code);
                      setError("");
                    }}
                  >
                    <span className="student-door">
                      <DoorOpen size={27} />
                    </span>
                    <h2>Come on in.</h2>
                    <p>Enter the code from your TA or instructor.</p>
                    <label>
                      Room code
                      <input
                        className="code-input"
                        placeholder="ABC123"
                        value={joinCode}
                        onChange={(e) =>
                          setJoinCode(e.target.value.toUpperCase())
                        }
                        required
                        maxLength={6}
                        minLength={6}
                        autoCapitalize="characters"
                        autoComplete="off"
                      />
                    </label>
                    {error && (
                      <p role="alert" className="form-error">
                        {error}
                      </p>
                    )}
                    <button className="button primary full-button">
                      Find my room <ArrowRight size={17} />
                    </button>
                    <button
                      type="button"
                      className="try-demo"
                      onClick={() => setJoinCode(room.code)}
                    >
                      Trying it out? Use <b>{room.code}</b>
                    </button>
                  </form>
                )}
              </div>
              <div className="student-welcome">
                <Classroom />
                <h2>No question too small.</h2>
                <p>
                  Pick a topic. Keep your place.
                  <br />
                  We’ll figure out the rest together.
                </p>
                <div className="local-notice">
                  <span className="status-dot" /> Local prototype · Rooms work
                  in this browser.
                  <br />
                  Cross-device joining will need a backend.
                </div>
              </div>
            </div>
          </main>
        )}
      </div>
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
      <dialog
        ref={dialogRef}
        onCancel={() => setModal(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setModal(null);
        }}
      >
        <button
          className="close-dialog"
          onClick={() => setModal(null)}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>
        {modal === "room" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              const course = String(data.get("course")).trim();
              const title = String(data.get("title")).trim();
              if (!course || !title) return;
              let next = createRoom(title, course);
              while (rooms.some((r) => r.code === next.code))
                next = createRoom(title, course);
              setRooms((r) => [...r, next]);
              setActiveCode(next.code);
              setFilter("all");
              setSearch("");
              setView("instructor");
              setModal(null);
              setToast("Your room is ready. Share the code to get started.");
            }}
          >
            <span className="eyebrow">MAKE SOME ROOM</span>
            <h2>A new place for questions.</h2>
            <p>Set up your office hours. We’ll handle the line.</p>
            <label>
              Course or room name
              <input
                name="course"
                required
                maxLength={60}
                placeholder="CS 241 · Office hours"
              />
            </label>
            <label>
              A welcome for your students
              <input
                name="title"
                required
                maxLength={75}
                defaultValue="Let’s figure it out, together."
              />
            </label>
            <button className="button primary full-button">
              Create room <Plus size={16} />
            </button>
          </form>
        )}
        {modal === "settings" && (
          <SettingsForm
            room={room}
            onSave={(next) => {
              updateRoom(() => next);
              setModal(null);
              setToast("Room settings saved.");
              setFilter("all");
            }}
          />
        )}
        {modal === "about" && (
          <div className="about">
            <PixelPlant small />
            <span className="eyebrow">A LITTLE HELP</span>
            <h2>Everyone gets a seat.</h2>
            <p>
              Create a room and share its six-character code. Students join,
              choose a topic, and keep their place in line.
            </p>
            <p>
              Use <b>By topic</b> to bring similar questions together.{" "}
              <b>Help</b> calls a student to your table; <b>Mark as helped</b>{" "}
              finishes their visit.
            </p>
            <div className="about-note">
              <strong>This is a local classroom prototype.</strong>
              <p>
                Sample students are included. Data is saved in this browser and
                updates across its tabs. A backend and instructor sign-in are
                needed for real sessions across different devices.
              </p>
            </div>
            <button
              className="button primary full-button"
              onClick={() => setModal(null)}
            >
              Got it <Check size={16} />
            </button>
          </div>
        )}
      </dialog>
    </div>
  );
}
function SettingsForm({
  room,
  onSave,
}: {
  room: Room;
  onSave: (room: Room) => void;
}) {
  const [topics, setTopics] = useState(room.topics.map((t) => ({ ...t })));
  const [topicName, setTopicName] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const course = String(data.get("course")).trim();
        const title = String(data.get("title")).trim();
        if (course && title) onSave({ ...room, course, title, topics });
      }}
    >
      <span className="eyebrow">MAKE IT YOURS</span>
      <h2>Room settings</h2>
      <label>
        Course or room name
        <input
          name="course"
          required
          maxLength={60}
          defaultValue={room.course}
        />
      </label>
      <label>
        Welcome message
        <input name="title" required maxLength={75} defaultValue={room.title} />
      </label>
      <label>Help topics</label>
      <div className="editable-topics">
        {topics.map((t) => {
          const used = room.students.some(
            (s) => s.topicId === t.id && s.status !== "done",
          );
          return (
            <div key={t.id}>
              <span className={`tag ${t.color}`}>{t.name}</span>
              <button
                type="button"
                disabled={used || topics.length === 1}
                title={
                  used ? "This topic has students in the queue" : "Remove topic"
                }
                aria-label={`Remove ${t.name}`}
                onClick={() => setTopics(topics.filter((x) => x.id !== t.id))}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
      <div className="topic-input">
        <input
          aria-label="New topic name"
          value={topicName}
          maxLength={30}
          placeholder="Add a topic…"
          onChange={(e) => setTopicName(e.target.value)}
        />
        <button
          type="button"
          className="button neutral"
          disabled={
            !topicName.trim() ||
            topics.length >= 8 ||
            topics.some(
              (t) => t.name.toLowerCase() === topicName.trim().toLowerCase(),
            )
          }
          onClick={() => {
            setTopics([
              ...topics,
              {
                id: crypto.randomUUID(),
                name: topicName.trim(),
                color: COLORS[topics.length % 4],
              },
            ]);
            setTopicName("");
          }}
        >
          <Plus size={16} /> Add
        </button>
      </div>
      <p className="form-hint">
        Up to 8 topics. Topics with waiting students stay available.
      </p>
      <button className="button primary full-button">
        Save changes <Check size={16} />
      </button>
    </form>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
