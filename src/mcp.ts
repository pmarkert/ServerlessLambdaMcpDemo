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

export const server = new McpServer({
  name: "MCP Demo Server",
  version: "1.0.0",
});

server.registerTool(
  "DescribedEnum",
  {
    description: "Echoes the string message",
    inputSchema: z.object({
      message: z
        .enum(["OptionA", "OptionB", "OptionC"])
        .describe("An option from the enum"),
    }),
  },
  async (params) => {
    return mcpResponse(params.message);
  },
);

server.registerTool(
  "ObjectWithNullable",
  {
    description: "Echoes the object with a nullable field",
    inputSchema: z.object({
      name: z.string().describe("The name of the person"),
      nickname: z
        .string()
        .nullable()
        .optional()
        .describe("The nickname, can be null"),
    }),
  },
  async (params) => {
    return mcpResponse(params);
  },
);

server.registerTool(
  "ObjectWithNullable2",
  {
    description: "Echoes the object with a nullable number field",
    inputSchema: z.object({
      id: z.number().describe("The ID number"),
      nickname: z
        .string()
        .or(z.null())
        .optional()
        .describe("The score, can be null"),
    }),
  },
  async (params) => {
    return mcpResponse(params);
  },
);

server.registerTool(
  "DiscriminatedUnion",
  {
    description: "Echoes the discriminated union object",
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
        .describe("A discriminated union of types A and B"),
    }),
  },
  async (params) => {
    return mcpResponse(params);
  },
);
