import { timeoutGuidance } from "./no-response.js";

/** Shared rules: operator is on ntfy only, not in Cursor chat. */
export const operatorChannelRules = [
  "Operator channel: ntfy only. They do not see Cursor chat.",
  "",
  "Ntfy session: When they ask to start an ntfy session (or similar), stay in ntfy mode until they post \"end session\" on the topic (not in chat).",
  "",
  "Rules:",
  "- Operator questions, status, errors, blockers, approvals, and outcomes → notify, not chat.",
  "- After notify returns replied, act on their reply, then notify again for the next step.",
  "- Do not end your turn while blocked on them or with operator-facing work unfinished without calling notify.",
  "",
  `On timeout: ${timeoutGuidance}`,
] as const;

export const sessionFlowExample = [
  "Example (ntfy session):",
  "  Operator (ntfy): start session",
  "  → notify: \"Session on. What should I work on?\"",
  "  → replied: \"fix CI\"",
  "  → [work; operator updates via notify only]",
  "  → notify: \"CI fixed. Reply ok or what to change.\"",
  "",
  "Example (timeout):",
  "  → timeout → notify: \"Still waiting—reply when you can.\"",
  "  → do not guess secrets or approvals",
].join("\n");
