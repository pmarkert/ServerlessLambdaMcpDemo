import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// Middleware to automatically wrap responses in MCP format
function mcpResponse(input: any): CallToolResult {
  return {
    content: [
      {
        type: "text" as const,
        text: typeof input === "string" ? input : JSON.stringify(input),
      },
    ],
    isError: false,
  };
}

export const mcpServer = () => {
  const server = new McpServer({
    name: "MCP Demo Server",
    version: "1.0.0",
  });

  // The agent typically doesn't know the allowed Enum values (unless they are manually added to the description)
  server.registerTool(
    "Enum",
    {
      description: "Echoes the string message",
      inputSchema: z.object({
        message: z
          .enum(["Apple", "Banana", "Cherry"])
          .describe("An option from the enum"),
      }),
    },
    async (params) => {
      return mcpResponse(params.message);
    },
  );

  // The agent does not know about the min/max constraints on the number.
  server.registerTool(
    "NumericConstraints",
    {
      inputSchema: z.object({
        value: z.number().min(32).max(212),
      }),
    },
    async (params) => {
      return mcpResponse(params.value);
    },
  );

  // The agent does not know about the length constraints.
  server.registerTool(
    "StringConstraints",
    {
      inputSchema: z.object({
        value: z.string().min(5).max(20),
      }),
    },
    async (params) => {
      return mcpResponse(params.value);
    },
  );

  // The agent does not know about the regex pattern.
  server.registerTool(
    "StringPattern",
    {
      inputSchema: z.object({
        value: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      }),
    },
    async (params) => {
      return mcpResponse(params.value);
    },
  );

  // This one does not even show up as a tool
  server.registerTool(
    "DiscriminatedUnion",
    {
      description: "Echoes the discriminated union object",
      inputSchema: z.object({
        data: z
          .discriminatedUnion("type", [
            z.object({
              type: z.literal("A"),
              valueA: z.string().describe("Value for type A"),
            }),
            z.object({
              type: z.literal("B"),
              valueB: z.number().describe("Value for type B"),
            }),
          ])
          .describe("A discriminated union of types A and B"),
      }),
    },
    async (params) => {
      return mcpResponse(params);
    },
  );

  // This one works, but is less ideal for Typescript
  server.registerTool(
    "StandardUnion",
    {
      description: "Echoes the standard union object",
      inputSchema: z.object({
        data: z
          .union([
            z.object({
              type: z.literal("A"),
              valueA: z.string().describe("Value for type A"),
            }),
            z.object({
              type: z.literal("B"),
              valueB: z.number().describe("Value for type B"),
            }),
          ])
          .describe("A standard union of types A and B"),
      }),
    },
    async (params) => {
      return mcpResponse(params);
    },
  );

  return server;
};
