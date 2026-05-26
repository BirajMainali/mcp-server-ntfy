import { z } from "zod";

export const notifyTypeSchema = z.enum([
  "notification",
  "waiting_for_response",
]);

export const notifyToolDescription = [
  "Reach the human on their device when they are not in this chat.",
  "",
  "notification — tell them something and keep working. No reply expected.",
  "waiting_for_response — ask one clear question and pause until they answer on ntfy. You get their reply text, or a timeout if they do not answer in time.",
  "",
  "Examples — use notification:",
  '• Situation: Finished a 20-minute migration. → type: notification, title: "Migration done", message: "prod DB upgrade completed; all health checks green."',
  '• Situation: Build failed while they are away. → type: notification, title: "Build failed", message: "CI failed on main: tests/auth.test.ts — say if you want me to dig in."',
  '• Situation: They asked to be pinged when done. → type: notification, title: "Report ready", message: "Q1 analysis PDF is in ~/Downloads."',
  "",
  "Examples — use waiting_for_response:",
  '• Situation: Cannot pick deploy target without them. → type: waiting_for_response, title: "Deploy where?", message: "Ready to deploy v2.4. Reply staging or production."',
  '• Situation: Destructive action needs approval. → type: waiting_for_response, title: "Delete old backups?", message: "Will remove 47GB of backups older than 90 days. Reply yes or no."',
  '• Situation: Missing secret only they have. → type: waiting_for_response, title: "API key needed", message: "Paste the Stripe test key so I can finish the webhook setup."',
  "",
  "Do not call notify for routine progress, guesses you can verify yourself, or questions already answered in this thread.",
].join("\n");

export const notifyInputSchema = {
  message: z
    .string()
    .min(1)
    .describe(
      "What they need to know or the question you need answered — plain language, 1–3 sentences",
    ),
  title: z.string().optional().describe("Short headline for the push (optional)"),
  type: notifyTypeSchema.describe(
    "Pick from the examples above: notification if no reply needed; waiting_for_response if you are blocked on their answer",
  ),
} as const;
