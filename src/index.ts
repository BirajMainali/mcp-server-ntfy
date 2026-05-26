#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { SERVER_NAME } from "./constants.js";
import { createMcpServer } from "./mcp.js";

const start = async (): Promise<void> => {
  const config = loadConfig();
  const server = createMcpServer(config);
  const transport = new StdioServerTransport();

  await server.connect(transport);
};

start().catch((error: unknown) => {
  console.error(`${SERVER_NAME} failed:`, error);
  process.exit(1);
});
