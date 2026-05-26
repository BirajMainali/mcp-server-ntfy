export type NotifyType = "notification" | "waiting_for_response";

export type NtfyConfig = {
  serverUrl: string;
  topic: string;
  pollWindowMs: number;
};

export type NotifyInput = {
  message: string;
  title?: string | undefined;
  type: NotifyType;
};

export type NtfyPublishedMessage = {
  id: string;
  time: number;
  event: string;
  topic: string;
  message?: string;
  title?: string;
};

export type NotifySent = {
  status: "sent";
  type: "notification";
  messageId: string;
};

export type NotifyReplied = {
  status: "replied";
  type: "waiting_for_response";
  messageId: string;
  reply: string;
};

export type NotifyTimedOut = {
  status: "timeout";
  type: "waiting_for_response";
  messageId: string;
  pollWindowMs: number;
};

export type NotifyOutcome = NotifySent | NotifyReplied | NotifyTimedOut;
