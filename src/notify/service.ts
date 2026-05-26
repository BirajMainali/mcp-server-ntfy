import * as ntfy from "../ntfy/client.js";
import type {
  NtfyConfig,
  NotifyInput,
  NotifyOutcome,
  NotifyReplied,
  NotifySent,
  NotifyTimedOut,
} from "../types.js";

const sent = (messageId: string): NotifySent => ({
  status: "sent",
  type: "notification",
  messageId,
});

const replied = (messageId: string, reply: string): NotifyReplied => ({
  status: "replied",
  type: "waiting_for_response",
  messageId,
  reply,
});

const timedOut = (messageId: string, pollWindowMs: number): NotifyTimedOut => ({
  status: "timeout",
  type: "waiting_for_response",
  messageId,
  pollWindowMs,
});

const notifyOneWay = async (
  config: NtfyConfig,
  input: NotifyInput,
): Promise<NotifySent> => {
  const published = await ntfy.publish(config, input.message, input.title);
  return sent(published.id);
};

const notifyAndWait = async (
  config: NtfyConfig,
  input: NotifyInput,
): Promise<NotifyReplied | NotifyTimedOut> => {
  const published = await ntfy.publish(config, input.message, input.title);
  const reply = await ntfy.pollUntilReply(
    config,
    published.id,
    config.pollWindowMs,
  );

  return reply === null
    ? timedOut(published.id, config.pollWindowMs)
    : replied(published.id, reply);
};

export const executeNotify = (
  config: NtfyConfig,
  input: NotifyInput,
): Promise<NotifyOutcome> =>
  input.type === "notification"
    ? notifyOneWay(config, input)
    : notifyAndWait(config, input);
