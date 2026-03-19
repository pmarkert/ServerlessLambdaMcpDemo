import { Context, Next } from "hono";

export default async (c: Context, next: Next) => {
  // Clone request for logging without consuming the original body
  const requestClone = c.req.raw.clone();
  const requestBody = await requestClone.text();

  const tryParseJSON = (text: string) => {
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return text; // Return raw text if not valid JSON
    }
  };

  console.log({
    type: "request",
    method: c.req.method,
    path: c.req.path,
    query: c.req.query(),
    headers: Object.fromEntries(c.req.raw.headers.entries()),
    body: tryParseJSON(requestBody),
  });

  await next();

  // Parse SSE format if content-type is text/event-stream
  const responseBody = await c.res.clone().text();
  const contentType = c.res.headers.get("content-type");
  let parsedBody = tryParseJSON(responseBody);
  if (
    contentType?.includes("text/event-stream") &&
    typeof responseBody === "string"
  ) {
    // Parse SSE format: event: <type>\ndata: <json>\n\n
    const lines = responseBody.trim().split("\n");
    const sseData: any = {};
    for (const line of lines) {
      if (line.startsWith("event: ")) {
        sseData.event = line.substring(7).trim();
      } else if (line.startsWith("data: ")) {
        const dataStr = line.substring(6).trim();
        sseData.data = tryParseJSON(dataStr);
      }
    }
    parsedBody = Object.keys(sseData).length > 0 ? sseData : responseBody;
  }
  console.log({
    type: "response",
    status: c.res.status,
    headers: Object.fromEntries(c.res.headers.entries()),
    body: parsedBody,
  });
};
