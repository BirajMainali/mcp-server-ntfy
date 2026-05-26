import type { NotifyOutcome } from "../types.js";

type ToolTextContent = {
  type: "text";
  text: string;
};

const textContent = (payload: unknown): ToolTextContent => ({
  type: "text",
  text: JSON.stringify(payload),
});

export const toolSuccess = (payload: unknown) => ({
  content: [textContent(payload)],
});

export const toolFailure = (payload: unknown) => ({
  isError: true as const,
  content: [textContent(payload)],
});

export const outcomeToToolResult = (outcome: NotifyOutcome) =>
  outcome.status === "timeout"
    ? toolFailure(outcome)
    : toolSuccess(outcome);
