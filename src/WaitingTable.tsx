import { useState } from "react";
import { ArrowLeft, ArrowRight, Coffee } from "lucide-react";
import { PixelAvatar } from "./Character";
import type { Student, Topic } from "./queue";
export function WaitingTable({
  students,
  topics,
  onHelp,
}: {
  students: Student[];
  topics: Topic[];
  onHelp: (id: string) => void;
}) {
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const pages = Math.max(1, Math.ceil(students.length / 8));
  const currentPage = Math.min(page, pages - 1);
  const seated = students.slice(currentPage * 8, currentPage * 8 + 8);
  const selected = seated.find((s) => s.id === selectedId);
  return (
    <section className="waiting-room" aria-labelledby="waiting-room-title">
      <div className="waiting-room-heading">
        <div>
          <span className="eyebrow">THE COMMON TABLE</span>
          <h2 id="waiting-room-title">A seat for every question.</h2>
          <p>
            {students.length
              ? "Pick a character to see who’s waiting and call them over."
              : "The chairs are ready. Share your room code to fill them."}
          </p>
        </div>
        <span className="waiting-room-count">
          <span className="status-dot" />
          {students.length} waiting
        </span>
      </div>
      <div className="table-scene">
        <div className="table-seats">
          {Array.from({ length: 8 }, (_, index) => {
            const student = seated[index];
            return student ? (
              <button
                key={student.id}
                className={`table-seat ${selectedId === student.id ? "selected" : ""}`}
                aria-pressed={selectedId === student.id}
                aria-label={`Seat ${currentPage * 8 + index + 1}: ${student.name}`}
                onClick={() => setSelectedId(student.id)}
              >
                <span className="seat-number">
                  {String(currentPage * 8 + index + 1).padStart(2, "0")}
                </span>
                <PixelAvatar
                  avatar={student.avatar}
                  seated
                  label={`${student.name}’s character`}
                />
                <span className="seat-name">{student.name}</span>
              </button>
            ) : (
              <div
                className="table-seat empty-seat"
                key={`empty-${index}`}
                aria-hidden="true"
              >
                <div className="empty-chair" />
                <span>Open seat</span>
              </div>
            );
          })}
        </div>
        <div className="wooden-table" aria-hidden="true">
          <div className="table-grain" />
          <span className="table-book" />
          <span className="table-centerpiece">
            <Coffee size={18} /> TAble<span>GOOD COMPANY. GOOD QUESTIONS.</span>
          </span>
          <span className="table-mug" />
        </div>
      </div>
      <div className="seat-details" aria-live="polite">
        {selected ? (
          <>
            <PixelAvatar
              avatar={selected.avatar}
              label={`${selected.name}’s character`}
            />
            <div>
              <strong>{selected.name}</strong>
              <span>{topics.find((t) => t.id === selected.topicId)?.name}</span>
              <p>
                {selected.question || "Ready to talk their question through."}
              </p>
            </div>
            <button
              className="button primary"
              onClick={() => onHelp(selected.id)}
            >
              Call to help <ArrowRight size={15} />
            </button>
          </>
        ) : (
          <p>
            <span aria-hidden="true">✦</span> Names and seat numbers match the
            arrival queue below.
          </p>
        )}
      </div>
      {pages > 1 && (
        <nav className="table-pagination" aria-label="Waiting tables">
          <button
            className="button neutral"
            disabled={currentPage === 0}
            onClick={() => {
              setPage(currentPage - 1);
              setSelectedId(null);
            }}
          >
            <ArrowLeft size={14} /> Previous
          </button>
          <span>
            Table {currentPage + 1} of {pages}
          </span>
          <button
            className="button neutral"
            disabled={currentPage === pages - 1}
            onClick={() => {
              setPage(currentPage + 1);
              setSelectedId(null);
            }}
          >
            Next <ArrowRight size={14} />
          </button>
        </nav>
      )}
    </section>
  );
}
