# Table

A cozy, pixel-inspired office-hours queue for a Software Engineering Processes class project. Built with React, TypeScript, and Vite.

## Run locally

Requires Node.js 22.6 or newer (Node.js 24 recommended).

```sh
npm install
npm run dev
```

Open the local address printed by Vite. `npm run build` checks TypeScript and creates a production build. `npm test` checks queue ordering, grouped help, joining validation, and completion.

## Try the prototype

1. Explore the sample instructor room, or choose **Create room** to start an empty one.
2. Copy the room code and switch to **Student view**. Enter the code, your name, and a help topic.
3. Return to **My room** to see the student in arrival order. Choose **Help** to call them over, then **Mark as helped**.
4. Use **By topic** and **Help group** to help students with similar questions together.
5. Use **Room settings** to edit the room name, welcome message, and help topics. **Pause queue** temporarily prevents new arrivals.
6. In **Student view**, build a pixel character before joining: optional gender, skin tone, hair style and color, eye color, outfit, clothing color, and pants color. All appearance options are independent of gender.
7. The **Common Table** seats waiting students in arrival order, eight per table. Select a character to see their name and question, then **Call to help**. For larger queues, use the table navigation. The same character appears on queue entries, active help cards, and the student ticket.
8. Choose **Room view** for the separate pastel-red room at `/#/room`: a circular brown table surrounded by standing characters and floating nameplates. Queue positions, topic colors, waiting times, and “Getting help” labels provide an overview. Click a character to read their question, call them over, or mark them as helped. Larger rooms use pages of eight characters.

The original dashboard remains at `/#/instructor`, and the student join page is at `/#/student`. The pages share the current room and queue; browser Back/Forward and direct links work. Reloading selects the first saved room, as in the original prototype.

## Current scope

This is an interactive frontend prototype, not a networked service. Rooms and students are stored in this browser’s local storage, and changes synchronize between tabs on the same origin. Rooms do not work across devices. Instructor and student views are demonstration modes, not access controls. Student tickets remain active in the current page session; after a refresh, the instructor can still manage the saved queue.

The first room contains fictional sample students; newly created rooms start empty. The interface includes responsive layouts, labeled controls, keyboard-accessible dialogs, and empty/error states. Illustrations are original SVG pixel art. Fonts use Google Fonts with local fallbacks.

For a real classroom pilot, the next steps are a shared backend with atomic queue updates, real-time subscriptions, instructor authentication, and room expiration/data retention rules.
