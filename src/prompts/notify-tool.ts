import { z } from "zod";

export const notifyToolDescription = [
  "Push the operator on ntfy and block until they reply on the topic.",
  "Follow server instructions. Keep the message short and say what they should reply.",
].join(" ");

export const notifyInputSchema = {
  message: z
    .string()
    .min(1)
    .describe("Plain-text push body"),
  title: z.string().optional().describe("Push title (optional)"),
} as const;
