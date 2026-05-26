import { z } from "zod";
import { operatorChannelRules } from "./operator-channel.js";

export const notifyToolDescription = [
  "Send the operator a push on ntfy and wait for their reply. They do not see Cursor chat.",
  "",
  ...operatorChannelRules,
  "",
  "Keep the push short. Say what you need them to reply.",
].join("\n");

export const notifyInputSchema = {
  message: z
    .string()
    .min(1)
    .describe("Operator-facing text; include what they should reply"),
  title: z.string().optional().describe("Push title (optional)"),
} as const;
