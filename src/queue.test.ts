import { test } from "node:test";
import assert from "node:assert/strict";
import { demoRoom, waitingStudents, changeStatus, joinRoom } from "./queue.ts";
import { defaultAvatar, normalizeAvatar } from "./avatar.ts";
test("custom characters survive joining, storage, and the help lifecycle", () => {
  const room = demoRoom();
  const avatar = {
    ...defaultAvatar,
    hairStyle: "bun" as const,
    eyeColor: "#53819a" as const,
    outfit: "overalls" as const,
  };
  const joined = joinRoom(room, {
    ...room.students[0],
    id: "avatar-student",
    joinedAt: Date.now(),
    avatar,
  });
  const restored = JSON.parse(JSON.stringify(joined));
  const finished = changeStatus(
    changeStatus(restored, ["avatar-student"], "helping"),
    ["avatar-student"],
    "done",
  );
  assert.deepEqual(
    finished.students.find((s) => s.id === "avatar-student")?.avatar,
    avatar,
  );
  assert.equal(
    waitingStudents(finished).some((s) => s.id === "avatar-student"),
    false,
  );
});
test("legacy and incomplete characters get valid defaults", () => {
  assert.deepEqual(normalizeAvatar(), defaultAvatar);
  assert.deepEqual(normalizeAvatar({ hairStyle: "long" }), {
    ...defaultAvatar,
    hairStyle: "long",
  });
  assert.equal(
    normalizeAvatar(JSON.parse('{"hairStyle":"unknown"}')).hairStyle,
    defaultAvatar.hairStyle,
  );
});
test("queue preserves arrival order when students are grouped and helped", () => {
  const room = demoRoom();
  const first = waitingStudents(room)[0];
  const grouped = changeStatus(
    room,
    room.students.filter((s) => s.topicId === first.topicId).map((s) => s.id),
    "helping",
  );
  assert.equal(waitingStudents(grouped)[0].name, "Jamie Chen");
  assert.equal(
    grouped.students.filter(
      (s) => s.topicId === first.topicId && s.status === "helping",
    ).length,
    2,
  );
  assert.equal(room.students[0].status, "waiting");
});
test("paused rooms and missing topics cannot accept students", () => {
  const room = demoRoom();
  const student = { ...room.students[0], id: "new" };
  assert.throws(() => joinRoom({ ...room, open: false }, student), /paused/);
  assert.throws(
    () => joinRoom(room, { ...student, topicId: "missing" }),
    /topic/,
  );
  assert.equal(
    waitingStudents(joinRoom(room, { ...student, joinedAt: Date.now() })).at(-1)
      ?.id,
    "new",
  );
});
test("completed students leave the active queue and cannot be accidentally recalled", () => {
  const room = changeStatus(demoRoom(), ["1"], "done");
  assert.equal(
    waitingStudents(room).some((s) => s.id === "1"),
    false,
  );
  assert.equal(changeStatus(room, ["1"], "helping").students[0].status, "done");
});
