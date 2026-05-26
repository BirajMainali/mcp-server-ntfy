export const serverDescription =
  "ntfy outbound channel for the human operator—free them from watching this session; ping only on terminal outcomes, hard blockers, or an explicit checkpoint they requested.";

export const serverInstructions = [
  "Outbound ntfy to the human. They are not assumed to be in this thread.",
  "",
  "Use `notify`: notification for one-way alerts; waiting_for_response when you need their answer before continuing.",
  "",
  "Notify only on terminal outcomes, hard blockers, material failures, or when they asked for a ping.",
  "Skip play-by-play and anything you can resolve alone.",
  "Title ≤60 chars; body 1–3 sentences; one clear ask if blocked.",
].join("\n");
