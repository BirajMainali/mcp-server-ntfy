import * as ntfy from "../ntfy/client.js";
import { timeoutGuidance } from "../prompts/no-response.js";
import type {
  NtfyConfig,
  NotifyInput,
  NotifyOutcome,
  NotifyReplied,
  NotifyTimedOut,
} from "../types.js";

const replied = (messageId: string, reply: string): NotifyReplied => ({
  status: "replied",
  messageId,
  reply,
});

const timedOut = (messageId: string, pollWindowMs: number): NotifyTimedOut => ({
  status: "timeout",
  messageId,
  pollWindowMs,
  guidance: timeoutGuidance,
});

export const executeNotify = async (
  config: NtfyConfig,
  input: NotifyInput,
): Promise<NotifyOutcome> => {
  const published = await ntfy.publish(config, input.message, input.title);
  const reply = await ntfy.pollUntilReply(
    config,
    { id: published.id, time: published.time },
    config.pollWindowMs,
  );

  return reply === null
    ? timedOut(published.id, config.pollWindowMs)
    : replied(published.id, reply);
};
