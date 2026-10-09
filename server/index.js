import express from "express";
import http from "http";
import cors from "cors";
import { randomUUID } from "crypto";
import { Server } from "socket.io";

const PORT = process.env.PORT || 4000;
const ORIGINS = (process.env.CLIENT_ORIGIN || "http://localhost:5173").split(",");
const ROOMS = ["General", "Tech Support"];

const app = express();
app.use(cors({ origin: ORIGINS }));
app.get("/", (_req, res) => res.json({ status: "ok", rooms: ROOMS }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: ORIGINS, methods: ["GET", "POST"] } });

const system = (room, text) =>
  io.to(room).emit("message", { id: randomUUID(), system: true, room, text, ts: Date.now() });

function leaveRoom(socket) {
  const { room, username } = socket.data;
  if (!room) return;
  socket.leave(room);
  socket.to(room).emit("typing", { username, isTyping: false });
  system(room, `${username} left`);
  socket.data.room = null;
}

io.on("connection", (socket) => {
  console.log(`[connect] client handshake OK: ${socket.id}`);

  socket.on("join", ({ username, room }, ack) => {
    username = String(username || "").trim().slice(0, 24);
    if (!username || !ROOMS.includes(room)) return ack?.({ ok: false, error: "Invalid username or room" });
    if (socket.data.room === room) return ack?.({ ok: true, rooms: ROOMS });
    leaveRoom(socket);
    socket.data.username = username;
    socket.data.room = room;
    socket.join(room);
    system(room, `${username} joined ${room}`);
    console.log(`[join] ${username} -> ${room}`);
    ack?.({ ok: true, rooms: ROOMS });
  });

  socket.on("message", (text) => {
    const { room, username } = socket.data;
    text = String(text || "").trim().slice(0, 1000);
    if (!room || !text) return;
    // Only clients in this room receive it
    io.to(room).emit("message", { id: randomUUID(), username, room, text, ts: Date.now() });
  });

  socket.on("typing", (isTyping) => {
    const { room, username } = socket.data;
    if (!room) return;
    socket.to(room).emit("typing", { username, isTyping: !!isTyping });
  });

  socket.on("disconnect", () => {
    console.log(`[disconnect] ${socket.id}`);
    leaveRoom(socket);
  });
});

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
