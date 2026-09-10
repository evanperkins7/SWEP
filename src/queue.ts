import type { Avatar } from "./avatar.ts";
import { sampleAvatar } from "./avatar.ts";
export type Topic = { id: string; name: string; color: string };
export type Student = {
  id: string;
  name: string;
  topicId: string;
  question: string;
  joinedAt: number;
  status: "waiting" | "helping" | "done";
  avatar?: Avatar;
};
export type Room = {
  code: string;
  title: string;
  course: string;
  open: boolean;
  topics: Topic[];
  students: Student[];
  createdAt: number;
};
export const defaultTopics: Topic[] = [
  { id: "concept", name: "Concept check", color: "sage" },
  { id: "debug", name: "Debugging", color: "peach" },
  { id: "assignment", name: "Assignment help", color: "lilac" },
  { id: "other", name: "Something else", color: "sand" },
];
export function waitingStudents(room: Room) {
  return room.students
    .filter((s) => s.status === "waiting")
    .sort((a, b) => a.joinedAt - b.joinedAt);
}
export function changeStatus(
  room: Room,
  ids: string[],
  status: Student["status"],
): Room {
  return {
    ...room,
    students: room.students.map((s) =>
      ids.includes(s.id) && s.status !== "done" ? { ...s, status } : s,
    ),
  };
}
export function joinRoom(room: Room, student: Student): Room {
  if (!room.open)
    throw new Error(
      "This room is paused. Please wait for your instructor to reopen it.",
    );
  if (!student.name.trim()) throw new Error("Please enter your name.");
  if (!room.topics.some((t) => t.id === student.topicId))
    throw new Error("Choose a help topic.");
  if (room.students.some((s) => s.id === student.id && s.status !== "done"))
    throw new Error("You are already in this queue.");
  return {
    ...room,
    students: [
      ...room.students,
      { ...student, name: student.name.trim(), status: "waiting" },
    ],
  };
}
export function createRoom(title: string, course: string): Room {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const code = Array.from(
    crypto.getRandomValues(new Uint8Array(6)),
    (n) => alphabet[n % alphabet.length],
  ).join("");
  return {
    code,
    title,
    course,
    open: true,
    topics: defaultTopics.map((t) => ({ ...t })),
    students: [],
    createdAt: Date.now(),
  };
}
export function demoRoom(): Room {
  const now = Date.now();
  return {
    code: "TA4BLE",
    title: "Let’s figure it out, together.",
    course: "CS 241 · Office hours",
    open: true,
    topics: defaultTopics.map((t) => ({ ...t })),
    createdAt: now,
    students: [
      {
        id: "1",
        avatar: sampleAvatar(0),
        name: "Alex Morgan",
        topicId: "debug",
        question:
          "My loop works… until it doesn’t. Can we look at the exit condition?",
        joinedAt: now - 14 * 60000,
        status: "waiting",
      },
      {
        id: "2",
        avatar: sampleAvatar(1),
        name: "Jamie Chen",
        topicId: "concept",
        question:
          "A little stuck on the difference between a stack and a queue.",
        joinedAt: now - 11 * 60000,
        status: "waiting",
      },
      {
        id: "3",
        avatar: sampleAvatar(2),
        name: "Sam Rivera",
        topicId: "assignment",
        question:
          "Could I get a second pair of eyes on my approach to problem 3?",
        joinedAt: now - 8 * 60000,
        status: "waiting",
      },
      {
        id: "4",
        avatar: sampleAvatar(3),
        name: "Jordan Lee",
        topicId: "debug",
        question:
          "Getting an index out of bounds error in my array implementation.",
        joinedAt: now - 6 * 60000,
        status: "waiting",
      },
      {
        id: "5",
        avatar: sampleAvatar(4),
        name: "Taylor Brooks",
        topicId: "concept",
        question: "When would a linked list be a better choice than an array?",
        joinedAt: now - 4 * 60000,
        status: "waiting",
      },
      {
        id: "6",
        avatar: sampleAvatar(5),
        name: "Riley Patel",
        topicId: "other",
        question: "A quick question about the project proposal.",
        joinedAt: now - 2 * 60000,
        status: "waiting",
      },
      {
        id: "7",
        avatar: sampleAvatar(6),
        name: "Casey Kim",
        topicId: "assignment",
        question: "Walking through the first part of the assignment.",
        joinedAt: now - 18 * 60000,
        status: "helping",
      },
    ],
  };
}
