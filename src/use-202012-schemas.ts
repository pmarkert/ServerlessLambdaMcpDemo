import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { normalizeObjectSchema } from "@modelcontextprotocol/sdk/server/zod-compat.js";
import { toJsonSchemaCompat } from "@modelcontextprotocol/sdk/server/zod-json-schema-compat.js";
import { ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

export function use_202012_Schemas(server: McpServer) {
  server.server.setRequestHandler(ListToolsRequestSchema, () => {
    const registeredTools = (server as any)._registeredTools as Record<
      string,
      {
        enabled: boolean;
        title?: string;
        description?: string;
        inputSchema?: unknown;
        outputSchema?: unknown;
        annotations?: unknown;
        execution?: unknown;
        _meta?: Record<string, unknown>;
      }
    >;

    const JSON_SCHEMA_2020_12_URI =
      "https://json-schema.org/draft/2020-12/schema";

    const EMPTY_OBJECT_JSON_SCHEMA_2020_12 = {
      type: "object",
      properties: {},
      $schema: JSON_SCHEMA_2020_12_URI,
    };

    function to202012Schema(schema: unknown) {
      if (schema && typeof schema === "object") {
        return {
          ...(schema as Record<string, unknown>),
          $schema: JSON_SCHEMA_2020_12_URI,
        };
      }

      return EMPTY_OBJECT_JSON_SCHEMA_2020_12;
    }

    return {
      tools: Object.entries(registeredTools)
        .filter(([, tool]) => tool.enabled)
        .map(([name, tool]) => {
          const inputObj = normalizeObjectSchema(tool.inputSchema as any);

          const toolDefinition: Record<string, unknown> = {
            name,
            title: tool.title,
            description: tool.description,
            inputSchema: inputObj
              ? to202012Schema(
                  toJsonSchemaCompat(inputObj, {
                    strictUnions: true,
                    pipeStrategy: "input",
                    target: "draft-2020-12",
                  }),
                )
              : EMPTY_OBJECT_JSON_SCHEMA_2020_12,
            annotations: tool.annotations,
            execution: tool.execution,
            _meta: tool._meta,
          };

          const outputObj = normalizeObjectSchema(tool.outputSchema as any);

          if (outputObj) {
            toolDefinition.outputSchema = to202012Schema(
              toJsonSchemaCompat(outputObj, {
                strictUnions: true,
                pipeStrategy: "output",
                target: "draft-2020-12",
              }),
            );
          }

          return toolDefinition;
        }),
    };
  });
}
