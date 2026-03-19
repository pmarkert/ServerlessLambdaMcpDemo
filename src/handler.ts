import { StreamableHTTPTransport } from "@hono/mcp";
import { Hono } from "hono";
import { handle, LambdaContext, LambdaEvent } from "hono/aws-lambda";
import { requestId } from "hono/request-id";
import logging from "./logging";
import { mcpServer } from "./mcp";
import { use_202012_Schemas } from "./use-202012-schemas";

const app = new Hono<{
  Bindings: {
    event: LambdaEvent;
    lambdaContext: LambdaContext;
  };
}>();

const draft07Server = mcpServer();
const draft202012Server = mcpServer();
use_202012_Schemas(draft202012Server);

// Apply request-id from Lambda and logging
app.post(
  "*",
  requestId({
    generator: (c) => c.env.lambdaContext.awsRequestId,
  }),
  logging,
);

// Main Endpoint for MCP Draft 07
app.post("/", async (c) => {
    const transport = new StreamableHTTPTransport({ enableJsonResponse: true });
    await draft07Server.connect(transport);
    try {
      return await transport.handleRequest(c);
    } finally {
      await draft07Server.close();
    }
  },
);

// Specific override for Draft 2020-12 to demonstrate schema compatibility, etc.
app.post("/202012", async (c) => {
    const transport = new StreamableHTTPTransport({ enableJsonResponse: true });
    await draft202012Server.connect(transport);
    try {
      return await transport.handleRequest(c);
    } finally {
      await draft202012Server.close();
    }
  },
);

export const handler = handle(app);
