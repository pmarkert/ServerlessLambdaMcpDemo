import { StreamableHTTPTransport } from "@hono/mcp";
import { Hono } from "hono";
import { handle, LambdaContext, LambdaEvent } from "hono/aws-lambda";
import { requestId } from "hono/request-id";
import logging from "./logging";
import { server } from "./mcp";

const app = new Hono<{
  Bindings: {
    event: LambdaEvent;
    lambdaContext: LambdaContext;
  };
}>();

app.post(
  "*",
  requestId({
    generator: (c) => c.env.lambdaContext.awsRequestId,
  }),
  logging,
  async (c) => {
    const transport = new StreamableHTTPTransport({ enableJsonResponse: true });
    await server.connect(transport);
    try {
      return await transport.handleRequest(c);
    } finally {
      await server.close();
    }
  },
);

export const handler = handle(app);
