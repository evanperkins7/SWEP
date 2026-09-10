import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleHelp,
  Clock3,
  Copy,
  LayoutGrid,
  Pause,
  Play,
  Plus,
  Settings2,
  X,
} from "lucide-react";
import { PixelAvatar } from "./Character";
import { waitingStudents } from "./queue";
import type { Room, Student } from "./queue";
import "./round-room.css";

const SPOTS = [
  [50, 10],
  [77, 23],
  [88, 50],
  [77, 77],
  [50, 90],
  [23, 77],
  [12, 50],
  [23, 23],
];
type Props = {
  room: Room;
  now: number;
  onDashboard: () => void;
  onStudentView: () => void;
  onSettings: () => void;
  onCreateRoom: () => void;
  onCopyCode: () => void;
  onToggleOpen: () => void;
  onStatus: (ids: string[], status: Student["status"]) => void;
};

export function RoundRoom({
  room,
  now,
  onDashboard,
  onStudentView,
  onSettings,
  onCreateRoom,
  onCopyCode,
  onToggleOpen,
  onStatus,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const waiting = waitingStudents(room);
  const helping = room.students.filter((s) => s.status === "helping");
  const active = [...waiting, ...helping];
  const pageCount = Math.max(1, Math.ceil(active.length / SPOTS.length));
  const visiblePage = Math.min(page, pageCount - 1);
  const visible = active.slice(
    visiblePage * SPOTS.length,
    (visiblePage + 1) * SPOTS.length,
  );
  // Keep the question open after calling a student, so completion is one click away.
  const selected = active.find((s) => s.id === selectedId);
  const selectedTopic = room.topics.find((t) => t.id === selected?.topicId);
  const minutes = (joinedAt: number) =>
    Math.max(0, Math.floor((now - joinedAt) / 60000));
  function changePage(next: number) {
    setPage(next);
    setSelectedId(null);
  }
  return (
    <main className="round-room">
      <header className="round-topbar">
        <a
          href="#/instructor"
          className="round-brand"
          onClick={(e) => {
            e.preventDefault();
            onDashboard();
          }}
          aria-label="TAble dashboard"
        >
          <img src="/table.svg" alt="" />
          <span>
            <b>TA</b>ble<span>.</span>
          </span>
        </a>
        <div className="round-top-actions">
          <button
            className="round-code"
            onClick={onCopyCode}
            aria-label={`Copy room code ${room.code}`}
          >
            <span>
              ROOM CODE<strong>{room.code}</strong>
            </span>
            <Copy size={15} />
          </button>
          <span className="round-top-divider" />
          <button
            className="round-icon-button"
            onClick={onSettings}
            aria-label="Room settings"
          >
            <Settings2 size={20} />
          </button>
          <button className="round-button dark" onClick={onCreateRoom}>
            <Plus size={16} /> Create room
          </button>
        </div>
      </header>
      <div className="round-room-heading">
        <div>
          <button className="round-back" onClick={onDashboard}>
            <ArrowLeft size={14} /> Dashboard
          </button>
          <h1>{room.course}</h1>
          <span className="round-session-status">
            <i className={room.open ? "open" : ""} />
            {room.open
              ? "Room open · Come on in"
              : "Room paused · Helping the current queue"}
          </span>
        </div>
        <div className="round-totals" aria-label="Room activity">
          <div>
            <strong>{waiting.length.toString().padStart(2, "0")}</strong>
            <span>
              <i className="waiting-dot" /> Waiting
            </span>
          </div>
          <div>
            <strong>{helping.length.toString().padStart(2, "0")}</strong>
            <span>
              <i className="helping-dot" /> Getting help
            </span>
          </div>
          <div>
            <strong>
              {room.students
                .filter((s) => s.status === "done")
                .length.toString()
                .padStart(2, "0")}
            </strong>
            <span>
              <Check size={12} /> All set
            </span>
          </div>
        </div>
      </div>
      <div className="round-play-area">
        <aside className="round-room-key">
          <span className="round-kicker">AROUND THE TABLE</span>
          <h2>
            Good questions.
            <br />
            Good company.
          </h2>
          <p>Click a character to check in.</p>
          <div className="round-topic-key">
            {room.topics.map((t) => (
              <div key={t.id}>
                <span className={`round-topic-dot ${t.color}`} />
                <span>{t.name}</span>
                <b>{waiting.filter((s) => s.topicId === t.id).length}</b>
              </div>
            ))}
          </div>
          <div className="round-next-up">
            <span className="round-kicker">NEXT IN LINE</span>
            {waiting[0] ? (
              <button
                onClick={() => {
                  setSelectedId(waiting[0].id);
                  setPage(0);
                }}
              >
                <PixelAvatar
                  avatar={waiting[0].avatar}
                  label={`${waiting[0].name}’s character`}
                />
                <span>
                  {waiting[0].name}
                  <small>Waiting {minutes(waiting[0].joinedAt)} min</small>
                </span>
                <ArrowRight size={15} />
              </button>
            ) : (
              <p>
                {helping.length
                  ? "Everyone is getting help."
                  : "A little breathing room."}
              </p>
            )}
          </div>
        </aside>
        <section
          className="round-scene-column"
          aria-label="Students around the round table"
        >
          <div className="round-scene">
            <div className="round-rug" aria-hidden="true" />
            <div className="round-tabletop" aria-hidden="true">
              <div className="round-wood-grain" />
              <span className="round-table-brand">
                TAble<span>THERE’S ROOM FOR YOU.</span>
              </span>
              <span className="round-notebook" />
              <span className="round-coffee" />
            </div>
            {visible.map((student, index) => {
              const position = waiting.findIndex((s) => s.id === student.id);
              const topic = room.topics.find((t) => t.id === student.topicId);
              return (
                <button
                  key={student.id}
                  className={`round-person ${student.status === "helping" ? "being-helped" : ""} ${selectedId === student.id ? "selected" : ""}`}
                  style={{
                    left: `${SPOTS[index][0]}%`,
                    top: `${SPOTS[index][1]}%`,
                  }}
                  onClick={() => setSelectedId(student.id)}
                  aria-label={`${student.name}, ${student.status === "helping" ? "getting help" : `queue position ${position + 1}`}`}
                  aria-pressed={selectedId === student.id}
                  aria-controls="round-question-panel"
                  title={student.name}
                >
                  <span className="round-nameplate">
                    <span
                      className={`round-topic-dot ${topic?.color || "sand"}`}
                    />
                    {student.name}
                  </span>
                  <PixelAvatar
                    avatar={student.avatar}
                    label={`${student.name}’s character`}
                  />
                  <span className="round-person-status">
                    {student.status === "helping" ? (
                      <>
                        <span className="round-live-dot" /> Getting help
                      </>
                    ) : (
                      <>
                        <b>#{position + 1}</b> · {minutes(student.joinedAt)} min
                      </>
                    )}
                  </span>
                </button>
              );
            })}
            {!active.length && (
              <div className="round-empty">
                <span>All quiet at the table.</span>
                <p>
                  Share <b>{room.code}</b> to welcome your first student.
                </p>
              </div>
            )}
          </div>
          <div className="round-scene-caption">
            {pageCount > 1 ? (
              <nav className="round-pagination" aria-label="Round table pages">
                <button
                  aria-label="Previous table"
                  disabled={visiblePage === 0}
                  onClick={() => changePage(visiblePage - 1)}
                >
                  <ArrowLeft size={16} />
                </button>
                <span>
                  Table {visiblePage + 1} / {pageCount} · {active.length}{" "}
                  students
                </span>
                <button
                  aria-label="Next table"
                  disabled={visiblePage === pageCount - 1}
                  onClick={() => changePage(visiblePage + 1)}
                >
                  <ArrowRight size={16} />
                </button>
              </nav>
            ) : (
              <span>
                <span aria-hidden="true">✦</span> Every name is a question
                waiting to click.
              </span>
            )}
          </div>
        </section>
        <aside
          id="round-question-panel"
          className={`round-question-panel ${selected ? "has-selection" : ""}`}
          aria-label="Student question"
          aria-live="polite"
        >
          {selected ? (
            <>
              <button
                className="round-close"
                onClick={() => setSelectedId(null)}
                aria-label="Close student question"
              >
                <X size={17} />
              </button>
              <span className="round-kicker">
                {selected.status === "helping"
                  ? "AT YOUR TABLE"
                  : `QUESTION ${waiting.findIndex((s) => s.id === selected.id) + 1}`}
              </span>
              <div className="round-selected-person">
                <PixelAvatar
                  avatar={selected.avatar}
                  label={`${selected.name}’s character`}
                />
                <div>
                  <h2>{selected.name}</h2>
                  <span>
                    {selected.status === "helping"
                      ? "Getting help now"
                      : `Waiting ${minutes(selected.joinedAt)} min`}
                  </span>
                </div>
              </div>
              <span
                className={`round-question-topic ${selectedTopic?.color || "sand"}`}
              >
                {selectedTopic?.name || "Question"}
              </span>
              <p className="round-question-text">
                {selected.question ||
                  "No extra details yet. Ready to talk it through."}
              </p>
              <button
                className="round-button dark round-call"
                onClick={() =>
                  onStatus(
                    [selected.id],
                    selected.status === "waiting" ? "helping" : "done",
                  )
                }
              >
                {selected.status === "waiting" ? (
                  <>
                    Call to help <ArrowRight size={16} />
                  </>
                ) : (
                  <>
                    Mark as helped <Check size={16} />
                  </>
                )}
              </button>
              <span className="round-question-footnote">
                {selected.status === "waiting"
                  ? "They’ll see that you’re ready for them."
                  : "A little guidance goes a long way."}
              </span>
            </>
          ) : (
            <div className="round-selection-hint">
              <CircleHelp size={25} />
              <h2>Who’s got a question?</h2>
              <p>
                Select a character to see their question and invite them over.
              </p>
              <span>Names above. Questions one click away.</span>
            </div>
          )}
        </aside>
      </div>
      <footer className="round-footer">
        <button className="round-button" onClick={onToggleOpen}>
          {room.open ? <Pause size={14} /> : <Play size={14} />}{" "}
          {room.open ? "Pause arrivals" : "Open arrivals"}
        </button>
        <span>
          <Clock3 size={13} /> Arrival order stays the same in every view.
        </span>
        <div>
          <button className="round-footer-link" onClick={onStudentView}>
            Student view <ArrowRight size={14} />
          </button>
          <button className="round-button" onClick={onDashboard}>
            <LayoutGrid size={14} /> Dashboard
          </button>
        </div>
      </footer>
    </main>
  );
}
