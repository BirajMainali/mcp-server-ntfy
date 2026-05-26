import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SERVER_NAME, SERVER_VERSION } from "./constants.js";
import {
  serverDescription,
  serverInstructions,
} from "./prompts/server.js";
import { registerNotifyTool } from "./tools/notify.js";
import type { NtfyConfig } from "./types.js";

export const createMcpServer = (config: NtfyConfig): McpServer => {
  const server = new McpServer(
    {
      name: SERVER_NAME,
      version: SERVER_VERSION,
      description: serverDescription,
    },
    { instructions: serverInstructions },
  );

  registerNotifyTool(server, config);

  return server;
};
