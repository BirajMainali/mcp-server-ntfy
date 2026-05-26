import type { NtfyPublishedMessage } from "../types.js";

/** Outbound question we are waiting for a human reply after. */
export type PollAnchor = {
  id: string;
  time: number;
};

const extractReplyText = (event: NtfyPublishedMessage): string | null => {
  const text = event.message?.trim() || event.title?.trim();
  return text ?? null;
};

/** True when the event is a user message posted after our outbound question. */
export const isUserReply = (
  event: NtfyPublishedMessage,
  anchor: PollAnchor,
): boolean =>
  event.event === "message" &&
  event.id !== anchor.id &&
  event.time > anchor.time;

/**
 * First human reply after the anchor. Ignores older cached messages that ntfy
 * may return when `since=<id>` is not yet in cache (falls back to all messages).
 */
export const findReply = (
  events: NtfyPublishedMessage[],
  anchor: PollAnchor,
): string | null => {
  const replyEvent = events.find((event) => isUserReply(event, anchor));
  return replyEvent ? extractReplyText(replyEvent) : null;
};
