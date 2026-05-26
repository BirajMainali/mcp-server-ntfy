export type NtfyConfig = {
  serverUrl: string;
  topic: string;
  pollWindowMs: number;
};

export type NotifyInput = {
  message: string;
  title?: string | undefined;
};

export type NtfyPublishedMessage = {
  id: string;
  time: number;
  event: string;
  topic: string;
  message?: string;
  title?: string;
};

export type NotifyReplied = {
  status: "replied";
  messageId: string;
  reply: string;
};

export type NotifyTimedOut = {
  status: "timeout";
  messageId: string;
  pollWindowMs: number;
  guidance: string;
};

export type NotifyOutcome = NotifyReplied | NotifyTimedOut;
