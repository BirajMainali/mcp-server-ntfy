import {
  operatorChannelRules,
  sessionFlowExample,
} from "./operator-channel.js";

export const serverDescription =
  "ntfy channel for the human operator—notify and wait for their reply.";

export const serverInstructions = [
  ...operatorChannelRules,
  "",
  sessionFlowExample,
].join("\n");
