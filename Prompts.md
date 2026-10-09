# Prompts.md: Prompt Engineering Strategy (Sprint 12, Track B)

## Approach
I decomposed the assignment by phase (P0, P1, P2) and prompted for one layer at a time,
reviewing and running the output before moving on.

## Prompts used
1. **Scaffold:** "Create a Node/Express + Socket.io server and a Vite React client in separate folders.
   Server must log client handshakes. Configure CORS explicitly on the Socket.io Server instance."
2. **Phase 1:** "Add a text input; on submit emit 'message'; server broadcasts to all clients; client renders it."
3. **Phase 2:** "Prompt for a username before connecting. Render messages as [Name]: text.
   Emit a debounced 'typing' event and show 'X is typing...' on other clients only."
4. **Phase 3:** "Replace global broadcast with two rooms (General, Tech Support). Use socket.join and io.to(room).emit.
   Add a sidebar room switcher; leave the old room on switch."
5. **Hardening:** "Handle React 18 StrictMode double connections with useEffect cleanup (socket.disconnect()).
   Validate and trim inputs on the server."

## Verification
- Opened two browser windows side by side; confirmed messages and typing indicators sync.
- Confirmed a message in General never appears for a client in Tech Support.
- Checked server logs for connect/join/disconnect events.

## Lessons
- Be specific about CORS and cleanup in the prompt; otherwise generated code often omits them.
- Prompting phase by phase made bugs easy to isolate.
