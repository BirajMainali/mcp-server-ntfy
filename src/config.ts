import { z } from "zod";
import { DEFAULT_POLL_WINDOW_MS } from "./constants.js";
import type { NtfyConfig } from "./types.js";

const parsePollWindowMs = (value: string | undefined): number => {
  if (value === undefined) {
    return DEFAULT_POLL_WINDOW_MS;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_POLL_WINDOW_MS;
};

const envSchema = z.object({
  NTFY_SERVER_URL: z.url(),
  NTFY_TOPIC: z.string().min(1),
  NTFY_POLL_WINDOW_MS: z.string().optional(),
});

const toConfig = (raw: z.infer<typeof envSchema>): NtfyConfig => ({
  serverUrl: raw.NTFY_SERVER_URL.replace(/\/$/, ""),
  topic: raw.NTFY_TOPIC,
  pollWindowMs: parsePollWindowMs(raw.NTFY_POLL_WINDOW_MS),
});

export const loadConfig = (): NtfyConfig => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("Invalid environment variables:");
    console.error(z.prettifyError(result.error));
    process.exit(1);
  }

  return toConfig(result.data);
};
