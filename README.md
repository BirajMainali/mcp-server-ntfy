# mcp-server-ntfy

**Let your AI agent reach you on your phone—so you can leave the chat.**

An [MCP](https://modelcontextprotocol.io/) server that sends [ntfy](https://ntfy.sh) push notifications to the human operator and **waits for your reply** on the same topic—without you watching the session in Cursor.

---

## The problem

Long-running agent work creates a bad choice:

- **Stay in the chat** — watch progress, context-switch constantly, lose focus.
- **Walk away** — miss failures, blockers, and “done” signals until you come back and dig through history.

Email and Slack are heavy for a quick “deploy finished” or “approve this?” Mobile push is instant, but agents do not have a standard way to use it. ntfy is simple HTTP; this server bridges **MCP ↔ ntfy** so the model can reach you and read your answer back.

---

## What it does

Every `notify` call:

1. Pushes a message to your device.
2. Polls the topic until you reply in the ntfy app (or the wait window expires).

The agent gets `replied` with your text, or `timeout` as a tool error. Server and tool instructions steer the agent to treat **ntfy as the only operator channel** during an ntfy session (not Cursor chat).

---

## Features

- **Stdio MCP** — works with Cursor and other MCP clients out of the box
- **One `notify` tool** — `message`, optional `title`; always waits for a reply
- **Configurable ntfy server** — public `ntfy.sh` or self-hosted
- **Poll window** — `NTFY_POLL_WINDOW_MS` (default 10 minutes) before timeout
- **Opinionated prompts** — steers the agent away from spam; few-shot examples for reaching the operator
- **TypeScript** — small, functional layout (`ntfy` client, `notify` service, separated prompts)

---

## How it works

```text
Agent (Cursor)  →  MCP notify tool  →  POST ntfy topic  →  your phone (ntfy app)
                              │
                              └─ GET …/json?poll=1&since=<unix-time> every 3s until you reply
                                 (only treats messages newer than the outbound message as a reply)
```

1. You subscribe to a **topic** in the ntfy app (same name as `NTFY_TOPIC`).
2. The agent calls `notify` with a message (and optional title).
3. ntfy delivers the push. You reply by sending a new message to that topic; the server returns your text to the agent.

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ (20+ recommended)
- An [ntfy](https://ntfy.sh) client subscribed to your topic (iOS, Android, web, or self-hosted)

---

## Quick start

### From npm

```bash
npx -y mcp-server-ntfy
```

See [Cursor configuration](#cursor-configuration) below.

### From source (contributors)

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
      "command": "npx",
      "args": ["-y", "mcp-server-ntfy"],
      "env": {
        "NTFY_SERVER_URL": "https://ntfy.sh",
        "NTFY_TOPIC": "your-secret-topic-name"
      }
    }
  }
}
```

Restart MCP / Cursor after changing config.

---

## Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NTFY_SERVER_URL` | Yes | — | ntfy base URL (e.g. `https://ntfy.sh` or `http://localhost:8080`) |
| `NTFY_TOPIC` | Yes | — | Topic name; agent and you must use the same channel |
| `NTFY_POLL_WINDOW_MS` | No | `600000` (10 min) | Max wait for your reply before timeout |

See [.env.example](.env.example).

---

## `notify` tool

| Parameter | Required | Description |
|-----------|----------|-------------|
| `message` | Yes | Body of the push (plain text); say what you need them to reply |
| `title` | No | Notification title |

**Example results**

```json
{ "status": "replied", "messageId": "…", "reply": "production" }
```

```json
{
  "status": "timeout",
  "messageId": "…",
  "pollWindowMs": 600000,
  "guidance": "No reply yet. Call notify again with a short reminder. Do not guess secrets or approvals."
}
```

(timeout is returned as a tool error; the agent is instructed to call `notify` again)

---

## When should the agent use it?

The operator is assumed **not** in Cursor chat—they only see ntfy pushes and replies on the topic.

| Situation | Use `notify` |
|-----------|----------------|
| Starting an **ntfy session** (e.g. “start ntfy session”) | Yes — then stay in ntfy mode until they close the loop on ntfy (`thanks`, `ok`, `published`, `done`, or `end session`) |
| Question, approval, blocker, error, or “done” for the operator | Yes — do not put these only in chat |
| After they reply on ntfy | Yes again for the next step or result |
| Timeout (no reply within poll window) | Call `notify` again with a short reminder (do not guess secrets or approvals) |

Every `notify` call blocks until you reply or the poll window expires.

**Ntfy session flow (what the prompts teach the agent):**

1. You: start session on ntfy → agent notifies you and waits.
2. You: give the task on ntfy → agent works (silent in chat for operator updates).
3. Agent: notifies you with status or outcome → you reply on ntfy.
4. Repeat until you close the loop on ntfy (e.g. `thanks`, `published`, `done`, or `end session`).

Add a Cursor user rule if you want extra guardrails, e.g. *“During an ntfy session I am not at the desk; only ntfy counts.”*

---

## Security

- On public **ntfy.sh**, anyone who knows your **topic name** can read and post. Use a long, unguessable topic or [self-host](https://docs.ntfy.sh/config/) with access control.
- Do not commit `.env` or put secrets in notification bodies.
- Auth for private servers is not implemented yet.

---

## Development

Clone the repo, then:

```bash
npm install
npm run dev    # tsx src/index.ts (stdio)
npm run build  # compile to dist/
npm test
```

To run the built server from a checkout in MCP, point `args` at your local `dist/index.js`:

```json
{
  "mcpServers": {
    "ntfy": {
      "command": "node",
      "args": ["/path/to/mcp-server-ntfy/dist/index.js"],
      "env": {
        "NTFY_SERVER_URL": "https://ntfy.sh",
        "NTFY_TOPIC": "your-secret-topic-name"
      }
    }
  }
}
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
- Run `npm test` for reply-detection unit tests
- Every `notify` blocks the tool call until you reply or the poll window ends (by design)

---

## License

ISC

## Links

- [ntfy documentation](https://docs.ntfy.sh/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Repository](https://github.com/BirajMainali/mcp-server-ntfy)
