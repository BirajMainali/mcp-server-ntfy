import { timeoutGuidance } from "./no-response.js";

/** Shared rules: operator is on ntfy only, not in Cursor chat. */
export const operatorChannelRules = [
  "Operator channel: ntfy only. They do not see Cursor chat.",
  "",
  "Ntfy session: When they ask to start an ntfy session (or similar), stay in ntfy mode until they reply \"end session\" on ntfy.",
  "",
  "Rules:",
  "- Any question, status, error, blocker, approval, or \"done\" for the operator → call notify.",
  "- Never ask the operator a question only in your chat reply.",
  "- Never report results or completion to the operator only in chat.",
  "- After notify returns replied, act on their reply, then call notify again for the next step.",
  "- Before ending your turn while work is ongoing or you need operator input: call notify.",
  "- Chat is for code and tooling; operator updates go through notify.",
  "",
  `On timeout: ${timeoutGuidance}`,
] as const;

export const sessionFlowExample = [
  "Example (ntfy session):",
  "  Operator (ntfy): start session",
  "  → notify: \"Session on. What should I work on?\"",
  "  → replied: \"fix CI\"",
  "  → [work; do not ask operator in chat]",
  "  → notify: \"CI fixed. Reply ok or what to change.\"",
  "  → NOT: a long summary only in Cursor chat",
].join("\n");
