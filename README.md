# mcp-server-ntfy

**Let your AI agent reach you on your phone—so you can leave the chat.**

An [MCP](https://modelcontextprotocol.io/) server that sends [ntfy](https://ntfy.sh) push notifications to the human operator. The agent can fire-and-forget alerts or block until you reply on the same topic—without you watching the session in Cursor.

---

## The problem

Long-running agent work creates a bad choice:

- **Stay in the chat** — watch progress, context-switch constantly, lose focus.
- **Walk away** — miss failures, blockers, and “done” signals until you come back and dig through history.

Email and Slack are heavy for a quick “deploy finished” or “approve this?” Mobile push is instant, but agents do not have a standard way to use it. ntfy is simple HTTP; this server bridges **MCP ↔ ntfy** so the model can notify and optionally wait for your answer.

---

## What it does

| Mode | Behavior |
|------|----------|
| **`notification`** | Push to your device and continue. For outcomes, failures, or FYIs that need no reply. |
| **`waiting_for_response`** | Push a question, then poll the topic until you post a reply in the ntfy app (or the wait window expires). |

The agent gets structured tool results (`sent`, `replied`, `timeout`). Server instructions and few-shot examples guide *when* to notify vs. when to stay quiet.

---

## Features

- **Stdio MCP** — works with Cursor and other MCP clients out of the box
- **One `notify` tool** — `message`, optional `title`, required `type`
- **Configurable ntfy server** — public `ntfy.sh` or self-hosted
- **Poll window** — `NTFY_POLL_WINDOW_MS` (default 10 minutes) for wait mode
- **Opinionated prompts** — steers the agent away from spam; includes few-shot examples for each mode
- **TypeScript** — small, functional layout (`ntfy` client, `notify` service, separated prompts)

---

## How it works

```text
Agent (Cursor)  →  MCP notify tool  →  POST ntfy topic  →  your phone (ntfy app)
                              │
                              └─ waiting_for_response: GET …/json?poll=1&since=<id> every 3s
```

1. You subscribe to a **topic** in the ntfy app (same name as `NTFY_TOPIC`).
2. The agent calls `notify` with a message (and optional title).
3. ntfy delivers the push. For **wait mode**, you reply by sending a new message to that topic; the server returns your text to the agent.

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ (20+ recommended)
- An [ntfy](https://ntfy.sh) client subscribed to your topic (iOS, Android, web, or self-hosted)

---

## Quick start

```bash
git clone git@github.com:BirajMainali/mcp-server-ntfy.git
cd mcp-server-ntfy
npm install
npm run build
```

Copy env template and set your topic (treat it like a password on public ntfy):

```bash
cp .env.example .env
# edit NTFY_SERVER_URL and NTFY_TOPIC
```

---

## Cursor configuration

Add to **Cursor Settings → MCP** (or `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "ntfy": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server-ntfy/dist/index.js"],
      "env": {
        "NTFY_SERVER_URL": "https://ntfy.sh",
        "NTFY_TOPIC": "your-secret-topic-name"
      }
    }
  }
}
```

Restart MCP / Cursor after changing config or rebuilding.

For local development without building:

```json
{
  "command": "npx",
  "args": ["tsx", "/absolute/path/to/mcp-server-ntfy/src/index.ts"],
  "env": { "...": "..." }
}
```

---

## Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NTFY_SERVER_URL` | Yes | — | ntfy base URL (e.g. `https://ntfy.sh` or `http://localhost:8080`) |
| `NTFY_TOPIC` | Yes | — | Topic name; agent and you must use the same channel |
| `NTFY_POLL_WINDOW_MS` | No | `600000` (10 min) | Max wait in `waiting_for_response` before timeout |

See [.env.example](.env.example).

---

## `notify` tool

| Parameter | Required | Description |
|-----------|----------|-------------|
| `message` | Yes | Body of the push (plain text) |
| `title` | No | Notification title |
| `type` | Yes | `notification` or `waiting_for_response` |

**Example results**

```json
{ "status": "sent", "type": "notification", "messageId": "…" }
```

```json
{ "status": "replied", "type": "waiting_for_response", "messageId": "…", "reply": "production" }
```

```json
{ "status": "timeout", "type": "waiting_for_response", "messageId": "…", "pollWindowMs": 600000 }
```

(timeout is returned as a tool error)

---

## When should the agent use it?

Built-in guidance tells the model to notify on:

- Terminal outcomes (success / failure of unattended work)
- Hard blockers (needs approval, secret, or decision)
- Material failures
- Explicit “ping me when done” requests

And **not** for routine progress, self-answerable questions, or noise you did not ask for.

---

## Security

- On public **ntfy.sh**, anyone who knows your **topic name** can read and post. Use a long, unguessable topic or [self-host](https://docs.ntfy.sh/config/) with access control.
- Do not commit `.env` or put secrets in notification bodies.
- Auth for private servers is not implemented yet.

---

## Development

```bash
npm run dev    # tsx src/index.ts (stdio — for MCP, not interactive)
npm run build  # compile to dist/
npm start      # node dist/index.js
```

### Project layout

```text
src/
├── index.ts           # stdio entry
├── mcp.ts             # McpServer wiring
├── config.ts          # env → config
├── ntfy/client.ts     # publish + poll
├── notify/service.ts  # notify orchestration
├── tools/notify.ts    # MCP tool registration
└── prompts/           # server + tool descriptions
```

---

## Roadmap / limitations

- No ntfy auth headers (Basic / bearer) for protected topics
- No per-call topic override (single topic from env)
- No automated test suite yet
- `waiting_for_response` blocks the tool call for the poll window (by design)

---

## License

ISC

## Links

- [ntfy documentation](https://docs.ntfy.sh/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Repository](https://github.com/BirajMainali/mcp-server-ntfy)
