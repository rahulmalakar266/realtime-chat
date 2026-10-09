import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:4000";
const ROOMS = ["General", "Tech Support"];

export default function App() {
  const [nameInput, setNameInput] = useState("");
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState(ROOMS[0]);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState({}); // { [room]: Message[] }
  const [typingUsers, setTypingUsers] = useState([]);
  const [text, setText] = useState("");

  const socketRef = useRef(null);
  const roomRef = useRef(room);
  const typingTimer = useRef(null);
  const bottomRef = useRef(null);

  roomRef.current = room;

  // Connect only after a username is chosen. Cleanup handles StrictMode double-invoke.
  useEffect(() => {
    if (!username) return;
    const socket = io(SERVER_URL);
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join", { username, room: roomRef.current });
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("message", (msg) =>
      setMessages((prev) => ({ ...prev, [msg.room]: [...(prev[msg.room] || []), msg] }))
    );
    socket.on("typing", ({ username: who, isTyping }) =>
      setTypingUsers((prev) => {
        const without = prev.filter((u) => u !== who);
        return isTyping ? [...without, who] : without;
      })
    );

    return () => {
      socket.disconnect();
      setConnected(false);
    };
  }, [username]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, room, typingUsers]);

  const switchRoom = (next) => {
    if (next === room) return;
    clearTimeout(typingTimer.current);
    socketRef.current?.emit("typing", false);
    setTypingUsers([]);
    setRoom(next);
    socketRef.current?.emit("join", { username, room: next });
  };

  const onChange = (e) => {
    setText(e.target.value);
    const s = socketRef.current;
    if (!s) return;
    s.emit("typing", true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => s.emit("typing", false), 1500);
  };

  const send = (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    socketRef.current?.emit("message", t);
    clearTimeout(typingTimer.current);
    socketRef.current?.emit("typing", false);
    setText("");
  };

  if (!username) {
    return (
      <div className="login">
        <form
          className="card"
          onSubmit={(e) => {
            e.preventDefault();
            if (nameInput.trim()) setUsername(nameInput.trim());
          }}
        >
          <h1>Realtime Chat</h1>
          <p>Choose a unique name to join.</p>
          <input
            autoFocus
            value={nameInput}
            maxLength={24}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Your name (e.g. Nakul)"
          />
          <button disabled={!nameInput.trim()}>Join</button>
        </form>
      </div>
    );
  }

  const list = messages[room] || [];
  const others = typingUsers.filter((u) => u !== username);
  const typingText =
    others.length === 0
      ? ""
      : others.length === 1
      ? `${others[0]} is typing...`
      : `${others.join(", ")} are typing...`;

  return (
    <div className="app">
      <aside>
        <h2>Rooms</h2>
        {ROOMS.map((r) => (
          <button key={r} className={r === room ? "room active" : "room"} onClick={() => switchRoom(r)}>
            # {r}
          </button>
        ))}
        <div className="me">
          <span className={connected ? "dot on" : "dot"} />
          {username}
        </div>
      </aside>

      <main>
        <header># {room}</header>
        <div className="messages">
          {list.map((m) =>
            m.system ? (
              <div key={m.id} className="system">{m.text}</div>
            ) : (
              <div key={m.id} className={m.username === username ? "msg mine" : "msg"}>
                <strong>[{m.username}]:</strong> {m.text}
              </div>
            )
          )}
          <div ref={bottomRef} />
        </div>
        <div className="typing">{typingText}</div>
        <form className="composer" onSubmit={send}>
          <input value={text} onChange={onChange} placeholder={`Message #${room}`} disabled={!connected} />
          <button disabled={!connected || !text.trim()}>Send</button>
        </form>
      </main>
    </div>
  );
}
