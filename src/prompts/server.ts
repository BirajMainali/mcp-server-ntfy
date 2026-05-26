import {
  operatorChannelRules,
  sessionFlowExample,
} from "./operator-channel.js";

export const serverDescription =
  "Reach the human operator on ntfy (they are not in Cursor chat) and wait for their reply.";

export const serverInstructions = [
  ...operatorChannelRules,
  "",
  sessionFlowExample,
].join("\n");
