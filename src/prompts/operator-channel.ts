import { timeoutGuidance } from "./no-response.js";

/** Shared rules: operator is on ntfy only, not in Cursor chat. */
export const operatorChannelRules = [
  "Operator channel: ntfy only. They do not see Cursor chat.",
  "",
  "Ntfy session: When they ask to start an ntfy session (or similar), use notify for operator comms until the session ends.",
  "End the session when their ntfy reply clearly closes the loop—e.g. thanks, ok, done, published, looks good—or they say \"end session\". Do not require the exact words \"end session\".",
  "While the session is active: operator updates go through notify, not chat.",
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
  "  → replied: \"thanks\" or \"published\" → session over; stop requiring notify for operator",
  "",
  "Example (timeout):",
  "  → timeout → notify: \"Still waiting—reply when you can.\"",
  "  → do not guess secrets or approvals",
].join("\n");
