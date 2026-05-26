import { POLL_INTERVAL_MS } from "../constants.js";
import { sleep } from "../lib/sleep.js";
import type { NtfyConfig, NtfyPublishedMessage } from "../types.js";

const topicPath = (config: NtfyConfig): string =>
  `${config.serverUrl}/${encodeURIComponent(config.topic)}`;

const parseJsonLines = (body: string): NtfyPublishedMessage[] =>
  body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as NtfyPublishedMessage);

const extractReplyText = (event: NtfyPublishedMessage): string | null => {
  const text = event.message?.trim() || event.title?.trim();
  return text ?? null;
};

const findReply = (
  events: NtfyPublishedMessage[],
  sinceMessageId: string,
): string | null => {
  const replyEvent = events.find(
    (event) => event.event === "message" && event.id !== sinceMessageId,
  );

  return replyEvent ? extractReplyText(replyEvent) : null;
};

const assertOk = async (response: Response, action: string): Promise<void> => {
  if (!response.ok) {
    throw new Error(`ntfy ${action} failed: ${response.status} ${response.statusText}`);
  }
};

export const publish = async (
  config: NtfyConfig,
  message: string,
  title?: string,
): Promise<NtfyPublishedMessage> => {
  const headers: Record<string, string> = {};
  if (title) {
    headers.Title = title;
  }

  const response = await fetch(topicPath(config), {
    method: "POST",
    headers,
    body: message,
  });

  await assertOk(response, "publish");

  const published = (await response.json()) as NtfyPublishedMessage;
  if (!published.id) {
    throw new Error("ntfy publish returned no message id");
  }

  return published;
};

const pollOnce = async (
  config: NtfyConfig,
  sinceMessageId: string,
): Promise<string | null> => {
  const url = `${topicPath(config)}/json?poll=1&since=${encodeURIComponent(sinceMessageId)}`;
  const response = await fetch(url);

  await assertOk(response, "poll");

  return findReply(parseJsonLines(await response.text()), sinceMessageId);
};

export const pollUntilReply = async (
  config: NtfyConfig,
  sinceMessageId: string,
  windowMs: number,
): Promise<string | null> => {
  const deadline = Date.now() + windowMs;

  while (Date.now() < deadline) {
    const reply = await pollOnce(config, sinceMessageId);
    if (reply !== null) {
      return reply;
    }

    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      break;
    }

    await sleep(Math.min(POLL_INTERVAL_MS, remaining));
  }

  return null;
};
