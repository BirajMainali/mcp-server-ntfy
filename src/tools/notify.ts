import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { outcomeToToolResult } from "../lib/tool-result.js";
import { executeNotify } from "../notify/service.js";
import {
  notifyInputSchema,
  notifyToolDescription,
} from "../prompts/notify-tool.js";
import type { NtfyConfig } from "../types.js";

export const registerNotifyTool = (
  server: McpServer,
  config: NtfyConfig,
): void => {
  server.registerTool(
    "notify",
    {
      description: notifyToolDescription,
      inputSchema: notifyInputSchema,
    },
    async (input) => {
      const outcome = await executeNotify(config, input);
      return outcomeToToolResult(outcome);
    },
  );
};
